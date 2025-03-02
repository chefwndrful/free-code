useTests("Type", () => {
  class Type {
    static activeTypes = {};
    static _StaticType = null;
    static _staticTypeInstance = null;

    constructor(name, initFn = () => ({})) {
      this.nameRaw = name;
      this.name = name.trim();
      if (Type.activeTypes[name])
        throw new TypeError(`A type named ${this.name} already exists`);

      Type.activeTypes[name] = this;

      this.initObj = typeof initFn === "function" ? initFn() : initFn;

      // SETUP TESTS
      this.tests = {};
      {
        for (const key in this.initObj)
          if (key.includes("$test_")) this.tests[key] = this.initObj[key];

        if (Object.keys(this.tests).length)
          useTests(this.nameRaw, () => {
            Object.entries(this.tests).forEach(([key, rawTests]) => {
              const testNamePadding = " ".repeat(
                key.slice(1).length -
                  key.slice(1).replaceAll("$", " ").trimStart().length
              );
              const fieldName = key.split("_")[1];

              useTests(`${testNamePadding}${fieldName}`, rawTests);
            });
          });
      }

      // PARSE SPECIAL KEYS
      this.target = {};
      this.finals = {};
      this.getters = {};
      this.setters = {};
      this.deleters = {};
      this.statics = {};
      {
        for (const key in this.initObj)
          if (key.startsWith(`$final_`)) {
            const fieldName = key.split("_").slice(1).join("_");
            this.finals[fieldName] = this.initObj[key];
          }
        for (const key in this.initObj) {
          const fieldName = key.split("_").slice(1).join("_");

          if (key.startsWith("$static_")) {
            this.statics[fieldName] = this.initObj[key];
            continue;
          }

          const isFinal = key in this.finals;
          if (isFinal) continue;

          if (key.startsWith("$get_"))
            this.getters[fieldName] = this.initObj[key];
          else if (key.startsWith("$set_"))
            this.setters[fieldName] = this.initObj[key];
          else if (key.startsWith("$delete_"))
            this.deleters[fieldName] = this.initObj[key];
        }
        for (const key in this.initObj)
          if (!key.startsWith(`$`)) this.target[key] = this.initObj[key];
      }
    }

    New(initObj = {}) {
      const type = this;

      let isRunningInternalCode = false;
      const activeAccessorStack = [];
      const runInternalCode = (internalCode, key, accessor = "get") => {
        activeAccessorStack.push({ key, accessor });
        if (internalCode instanceof (async () => {}).constructor)
          return async function (...args) {
            isRunningInternalCode = true;

            try {
              const result = await internalCode(proxy, ...args);
              return result;
            } catch (e) {
              throw e;
            } finally {
              isRunningInternalCode = false;
              activeAccessorStack.pop();
            }
          };
        else
          return function (...args) {
            isRunningInternalCode = true;
            try {
              const result = internalCode(proxy, ...args);
              return result;
            } catch (e) {
              throw e;
            } finally {
              isRunningInternalCode = false;
              activeAccessorStack.pop();
            }
          };
      };
      const isRunningAccessor = (accessor, key) => {
        if (!activeAccessorStack.length) return false;

        const active = activeAccessorStack.at(-1);
        return active.key === key && active.accessor === accessor;
      };

      const METHOD_REGEX = /^_?[A-Z]/;

      const proxy = new Proxy(this.target, {
        get(target, key) {
          const hasGetter = Object.hasOwn(type.getters, key);
          if (hasGetter)
            if (isRunningInternalCode && isRunningAccessor("get", key))
              return target[key];
            else return runInternalCode(type.getters[key], key, "get")();

          const isPrivateField = key.startsWith(`_`);
          if (isPrivateField && !isRunningInternalCode)
            throw new ReferenceError(
              `private field ${key} cannot be accessed.`
            );

          const isFinalField = key in type.finals;
          if (isFinalField) return Reflect.get(type.finals, key);

          const isMethod =
            typeof target[key] === "function" && key.match(METHOD_REGEX);
          if (isMethod) return runInternalCode(target[key], key, "get");

          return Reflect.get(target, key);
        },
        set(target, key, value) {
          const hasSetter = Object.hasOwn(type.setters, key);
          if (hasSetter)
            if (isRunningInternalCode && isRunningAccessor("set", key))
              return Reflect.set(target, key, value);
            else {
              runInternalCode(type.setters[key], key, "set")(value);
              return true;
            }

          const isPrivateField = key.startsWith(`_`);
          if (isPrivateField && !isRunningInternalCode)
            throw new ReferenceError(`private field ${key} cannot be set.`);

          const isFinalField = key in type.finals;
          if (isFinalField)
            throw new ReferenceError(`final field ${key} cannot be set.`);

          const isMethod =
            typeof target[key] === "function" && key.match(METHOD_REGEX);
          if (isMethod)
            throw new ReferenceError(`method ${key} cannot be set.`);

          return Reflect.set(target, key, value);
        },
        deleteProperty(target, key) {
          const hasDeleter = Object.hasOwn(type.deleters, key);
          if (hasDeleter) {
            if (isRunningInternalCode && isRunningAccessor("delete", key))
              return Reflect.deleteProperty(target, key);
            else {
              runInternalCode(type.deleters[key], key, "delete")();
              return true;
            }
          }

          const isPrivateField = key.startsWith(`_`);
          if (isPrivateField && !isRunningInternalCode)
            throw new ReferenceError(`private field ${key} cannot be deleted.`);

          const isFinalField = key in type.finals;
          if (isFinalField)
            throw new ReferenceError(`final field ${key} cannot be deleted.`);

          const isMethod =
            typeof target[key] === "function" && key.match(METHOD_REGEX);
          if (isMethod) {
            throw new ReferenceError(`method ${key} cannot be deleted.`);
          }
          return Reflect.deleteProperty(target, key);
        },
        ownKeys(target) {
          let keys = Reflect.ownKeys(target).filter(
            (key) => !key.startsWith("_")
          );
          keys.push(...Object.keys(type.getters));
          return keys;
        },
        getOwnPropertyDescriptor(target, key) {
          if (key in type.getters)
            return { enumerable: true, configurable: true };
          return Reflect.getOwnPropertyDescriptor(target, key);
        },
        has(target, key) {
          const isPrivateField = key.startsWith(`_`);
          if (isPrivateField && !isRunningInternalCode) return false;

          return Reflect.has(target, key) || key in type.getters;
        },
      });

      Object.assign(proxy, initObj);
      return proxy;
    }

    get static() {
      if (!this._staticTypeInstance) {
        this._StaticType = new Type(`${this.name}Static`, this.statics);
        this._staticTypeInstance = this._StaticType.New();
      }

      return this._staticTypeInstance;
    }
  }
  window.Type = Type;

  // TODO - integrate state.js logic into this type system. state.js is a more general purpose observable, however custom observable logic in this type class would make everything more seamless.

  beforeEach(() => {
    Type.activeTypes = {};
  });

  useTests("observable fields & effects", () => {
    it("works", () => {
      // TODO - see state.js
    });
  });
  useTests("creating Types", () => {
    it("keeps track of all active types", () => {
      const A = new Type("A");
      const B = new Type("B");

      assert(Type.activeTypes.matches({ A, B }));
    });
    it("doesn't allow types with same name", () => {
      let errorMsg;

      new Type("A");
      try {
        new Type("A");
      } catch (e) {
        errorMsg = e.message;
      }
      assert(errorMsg === `A type named A already exists`);
    });
    useTests("runs tests in $test_xyz fields", () => {
      new Type("Test", {
        b: [],
        $test_b: () => {
          before(() => true);
          it("test1", () => {
            assert(true);
          });
          it("test2", () => {
            assert(true);
          });
        },

        c: new Set(),
        $test_c: () => {
          before(() => true);
          it("test1", () => {
            assert(true);
          });
        },
      });
    });
  });
  useTests("creating instances of Types", () => {
    it("accepts init object", () => {
      const initObj = { a: 1, b: 2 };
      const A = new Type("A", initObj);
      const a = A.New();
      assert(a.matches(initObj));
    });
    it("accepts init fn that returns an object", () => {
      const initObj = { a: 1, b: 2 };
      const A = new Type("A", () => initObj);
      const a = A.New();
      assert(a.matches(initObj));
    });
    useTests(`Type.New()`, () => {
      it(`accepts init object which is merged`, () => {
        const A = new Type("A", { a: 100, b: 200 });

        const initObj = { a: 1, c: 3 };
        const a = A.New(initObj);

        console.log(a);
        assert(a.matches({ a: 1, b: 200, c: 3 }));
      });
      it(`runs init fn and merges returned object`, () => {
        const A = new Type("A", { a: 100, b: 200 });

        const initObj = { a: 1, c: 3 };
        const a = A.New(initObj);
        assert(a.matches({ a: 1, b: 200, c: 3 }));
      });
    });
  });
  useTests("methods", () => {
    it("can operate on instance fields", () => {
      const A = new Type("A", {
        x: 2,
        // methods should have UpperCase names
        PowX: (_, pow) => {
          return Math.pow(_.x, pow);
        },
        // _ is essentially `this`, it refers to the instance
      });
      const a = A.New();

      assert(a.PowX(3) === 8);
    });
    it("async: can operate on instance fields", async () => {
      const A = new Type("A", {
        x: 2,
        // methods should have UpperCase names
        PowX: async (_, pow) => {
          await sleep(1);
          return Math.pow(_.x, pow);
        },
        // _ is essentially `this`, it refers to the instance
      });
      const a = A.New();

      const result = await a.PowX(3);
      assert(result === 8);
    });
    it("can access private _xyz fields", () => {
      const A = new Type("A", {
        _x: 2,
        PowX: (_, pow) => Math.pow(_._x, pow),
      });
      const a = A.New();

      assert(a.PowX(3) === 8);
    });
    it("cannot be set", () => {
      const A = new Type("A", {
        x: 2,
        Calculate: (_, value) => _.x * value, // Public method
      });

      const a = A.New();

      // Attempting to overwrite the method should throw an error
      let error;
      try {
        a.Calculate = () => 42; // Attempt to set a new function to `Calculate`
      } catch (e) {
        error = e;
      }

      assert(
        error.message === "method Calculate cannot be set.",
        "Overwriting a method should throw a ReferenceError"
      );

      // Ensure the method still works as originally defined
      const result = a.Calculate(3); // Should still calculate 2 * 3 = 6
      assert(
        result === 6,
        "Method retains original functionality after set attempt"
      );
    });
    it("private _Method", () => {
      const A = new Type("A", {
        $get_x: (_) => _._Calculate(),
        _y: 2,
        _Calculate: (_) => _._y,
      });

      const a = A.New();

      assert(a.x === 2);

      // Attempting direct access to _Calculate should throw an error
      let error;
      try {
        console.log(a._doubleValue); // Direct access should be restricted
      } catch (e) {
        error = e;
      }

      assert(error.message);
    });
    it("handles errors and resets private locks", () => {
      const A = new Type("A", {
        ThrowError: () => {
          throw new Error("Test error in synchronous method");
        },
      });
      const a = A.New();

      let error;
      try {
        a.ThrowError();
      } catch (e) {
        error = e;
      }

      assert(error.message === "Test error in synchronous method");

      // Test that private field is inaccessible after the async error
      let privateAccessError;
      try {
        a._x;
      } catch (e) {
        privateAccessError = e;
      }
      assert(privateAccessError, "private fields are inaccessible after error");
    });
    it("handles async errors and resets private locks", async () => {
      const A = new Type("A", {
        _x: 2,
        ThrowErrorAsync: async () => {
          await sleep(1);
          throw new Error("Test error in async method");
        },
      });
      const a = A.New();

      let error;
      try {
        await a.ThrowErrorAsync();
      } catch (e) {
        error = e;
      }

      assert(error.message === "Test error in async method");

      // Test that private field is inaccessible after the async error
      let privateAccessError;
      try {
        a._x;
      } catch (e) {
        privateAccessError = e;
      }
      assert(privateAccessError, "private fields are inaccessible after error");
    });
  });
  useTests("get", () => {
    it("get a field", () => {
      const A = new Type("A", {
        x: 1,
      });
      const a = A.New();

      assert(a.x === 1);
      assert(`x` in a);
    });
    it("cannot get private _xyz keys", () => {
      const A = new Type("A", {
        _x: 1,
        $get_a: () => 3,
      });
      const a = A.New();

      assert(!(`_x` in a));

      let error;
      try {
        a._x;
      } catch (e) {
        error = e;
      }

      assert(error.message === `private field _x cannot be accessed.`);
    });
    useTests("getters", () => {
      it("computed field", () => {
        const i = 1;
        const A = new Type("A", {
          $get_x: () => i,
        });
        const a = A.New();

        assert(a.x === i);
        assert(a.matches({ x: i }), `matches resolves the getter`);
        assert(
          { ...a }.matches({ x: i }),
          `spreading resolves the getter and removes _x private field`
        );
      });
      it("derived field", () => {
        const A = new Type("A", {
          i: 1,
          $get_x: (_) => _.i,
          // _ is essentially `this`, it refers to the instance
        });
        const a = A.New();

        assert(a.x === a.i);
      });
      it("intercepted field", () => {
        const A = new Type("A", {
          x: 2,
          $get_x: (_) => _.x + 1, // when used in the getter _.x refers to the internal field
          // _ is essentially `this`, it refers to the instance
        });
        const a = A.New();

        assert(a.x === 3);

        a.x = 4; // setting works as usal
        assert(a.x === 5);
      });
      it("auto-generated intercepted field", () => {
        const A = new Type("A", {
          $get_x: (_) => _.x + 1,
        });
        const a = A.New();

        assert(isNaN(a.x));
        a.x = 4; // setting here set's the target's _.x directly
        assert(a.x === 5);
      });
      it("lazy field", () => {
        const A = new Type("A", {
          $get_x: (_) => {
            if (!_.x) _.x = 1;
            return _.x;
          },
        });
        const a = A.New();

        assert(a.x === 1);
        assert(a.x === 1); // No recalculation
      });
      it("private field", () => {
        const A = new Type("A", {
          _x: 2,
          $get_y: (_) => _._x, // getters can access private fields
        });
        const a = A.New();

        assert(a.y === 2);
      });
      it("dependent field", () => {
        const A = new Type("A", {
          $get_x: (_) => _.y + 1,
          $get_y: () => 3,
        });
        const a = A.New();

        assert(a.x === 4); // x depends on y
        assert(a.y === 3); // Independent check of y
      });
      it("deeply dependent field", () => {
        const A = new Type("A", {
          $get_a: (_) => 1,
          $get_b: (_) => _.a + 1,
          $get_c: (_) => _.b + 1,
        });
        const a = A.New();

        assert(a.c === 3); // c depends on b, which depends on a
        assert(a.b === 2); // Intermediate check
        assert(a.a === 1); // Base value check
      });
      it("recursive field", () => {
        const A = new Type("A", {
          x: 0,
          $get_y: (_) => {
            _.x++;
            if (_.x === 1) return _.z;
            else return _.x;
          },
          $get_z: (_) => _.y,
        });
        const a = A.New();

        assert(a.y === 2);
      });
      it("error handling", () => {
        const A = new Type("A", {
          $get_x: () => {
            throw new Error("Failed to compute x");
          },
        });
        const a = A.New();

        let error;
        try {
          a.x; // Accessing x should throw the error
        } catch (e) {
          error = e;
        }

        assert(error && error.message === "Failed to compute x");
      });
    });
  });
  useTests("set", () => {
    it("set a field", () => {
      const A = new Type("A", {
        x: 1,
      });
      const a = A.New();

      a.x = 2;
      a.y = 3;
      assert(a.x === 2);
      assert(a.y === 3);
      assert(`y` in a);
    });
    it("cannot set a private _xyz field", () => {
      const A = new Type("A", {
        _x: 1,
      });
      const a = A.New();

      let error;
      try {
        a._x = 3;
      } catch (e) {
        error = e;
      }

      assert(error.message === `private field _x cannot be set.`);
    });
    useTests("setters ($set_xyz)", () => {
      it("named field", () => {
        const A = new Type("A", {
          x: 1,
          $set_x: (_, x) => (_.x = x),
        });
        const a = A.New();

        a.x = 5;
        assert(a.x === 5);
      });
      it("auto-generated named field", () => {
        const A = new Type("A", {
          $set_x: (_, x) => (_.x = x + 1),
        });
        const a = A.New();

        a.x = 3;
        assert(a.x === 4);
      });
      it("dependent field", () => {
        const A = new Type("A", {
          i: 1,
          $set_x: (_, x) => (_.x = x + _.i),
        });
        const a = A.New();

        a.x = 3;
        assert(a.x === 4);
      });
      it("deeply dependent field", () => {
        const A = new Type("A", {
          $set_a: (_, a) => (_.b = a + 1),
          $set_b: (_, b) => (_.c = b + 1),
          c: 0,
        });
        const a = A.New();

        a.a = 1;
        assert(a.c === 3); // a set cascades to c
      });
      it("lazy field", () => {
        const A = new Type("A", {
          $set_x: (_, x) => {
            if (isNaN(_.x)) _.x = x;
            else _.x = 5;
          },
        });
        const a = A.New();

        a.x = 1;
        assert(a.x === 1); // First set, initializes value
        a.x = 2;
        assert(a.x === 5); // Subsequent sets don't change it
      });
      it("private field", () => {
        let _x;
        const A = new Type("A", {
          _x: 2,
          $set_y: (_, y) => {
            _._x = y;
            _x = _._x; // need to do this to check in test (private fields cannot be accessed publicly)
          }, // setters can access private fields
        });
        const a = A.New();

        a.y = 10;
        assert(_x === 10); // y indirectly updates _x
      });
      it("recursive field", () => {
        const A = new Type("A", {
          x: 0,
          $set_y: (_, y) => {
            _.x++;
            if (_.x === 1) _.z = 2;
            else _.y = _.x;
          },
          $set_z: (_) => (_.y = 3),
        });
        const a = A.New();

        a.y = 0;
        assert(a.y === 2); // Recursive dependency
      });
      it("error handling", () => {
        const A = new Type("A", {
          $set_x: () => {
            throw new Error("Failed to set x");
          },
        });
        const a = A.New();

        let error;
        try {
          a.x = 5; // Setting x should throw an error
        } catch (e) {
          error = e;
        }

        assert(error && error.message === "Failed to set x");
      });
    });
  });
  useTests("delete", () => {
    it("delete a field", () => {
      const A = new Type("A", {
        x: 1,
      });
      const a = A.New();

      assert(a.x === 1);
      assert(`x` in a);

      delete a.x;

      assert(a.x === undefined);
      assert(!(`x` in a));
    });
    it("cannot delete private _xyz keys", () => {
      const A = new Type("A", {
        _x: 1,
      });
      const a = A.New();

      let error;
      try {
        delete a._x;
      } catch (e) {
        error = e;
      }

      assert(error.message === `private field _x cannot be deleted.`);
    });
    it("methods cannot be deleted", () => {
      const A = new Type("A", {
        Calculate: (_, value) => value * 2,
      });
      const a = A.New();

      let error;
      try {
        delete a.Calculate;
      } catch (e) {
        error = e;
      }

      assert(error.message === "method Calculate cannot be deleted.");
    });
    useTests("deleters", () => {
      it("named field", () => {
        const A = new Type("A", {
          x: 1,
          $delete_x: (_) => delete _.x,
        });
        const a = A.New();

        assert(a.x === 1);

        delete a.x;
        assert(a.x === undefined); // Field x should be deleted
        assert(!("x" in a));
      });
      it("non-existent field", () => {
        const A = new Type("A", {
          $delete_x: (_) => {
            delete _._x;
          },
        });
        const a = A.New();

        delete a.x;
        assert(a.x === undefined);
        assert(!(`x` in a)); // Should be deleted
      });
      it("dependent field", () => {
        const A = new Type("A", {
          i: 1,
          $delete_x: (_) => {
            delete _.i;
          },
        });
        const a = A.New();

        delete a.x;
        assert(a.i === undefined); // Deletes dependent field i
        assert(!(`i` in a));
      });
      it("deeply dependent field", () => {
        const A = new Type("A", {
          $delete_x: (_) => {
            delete _.y;
          },
          $delete_y: (_) => {
            delete _.z;
          },
          z: 3,
        });
        const a = A.New();

        delete a.x; // Deleting x triggers deletion of y, which then deletes z
        assert(a.z === undefined);
        assert(!(`z` in a));
      });
      it("independent fields", () => {
        const A = new Type("A", {
          x: 1,
          y: 2,
          $delete_x: (_) => {
            delete _.x;
          },
          $delete_y: (_) => {
            delete _.y;
          },
        });
        const a = A.New();

        delete a.x;
        assert(a.x === undefined);
        assert(!("x" in a));

        delete a.y;
        assert(a.y === undefined);
        assert(!("y" in a));
      });
      it("multiple fields", () => {
        const A = new Type("A", {
          x: 1,
          y: 2,

          $delete_x: (_) => {
            delete _.x;
            delete _.y;
          },
        });
        const a = A.New();

        assert(a.x === 1);
        assert(a.y === 2);

        delete a.x; // Deleting x triggers deletion of y as well
        assert(a.x === undefined);
        assert(!(`x` in a));

        assert(a.y === undefined);
        assert(!(`y` in a));
      });
      it("lazy delete", () => {
        const A = new Type("A", {
          $delete_x: (_) => {
            if (_._x !== undefined) delete _._x;
          },
          _x: 5,
        });
        const a = A.New();

        delete a.x;
        assert(a.x === undefined); // Only deletes if _x exists
      });
      it("conditional delete", () => {
        const A = new Type("A", {
          x: 10,
          $delete_x: (_) => {
            if (_.x > 5) delete _.x;
          },
        });
        const a = A.New();

        delete a.x;
        assert(a.x === undefined);

        a.x = 4;
        delete a.x;
        assert(a.x === 4); // Does not delete since x is not > 5
      });
      it("private field", () => {
        const A = new Type("A", {
          _x: 10,
          $delete_y: (_) => {
            delete _._x;
          },
          $get_private: (_) => _._x,
        });
        const a = A.New();

        delete a.y; // y’s delete removes private _x
        assert(a.private === undefined); // Private field _x should also be deleted
      });
      it("recursive delete", () => {
        const A = new Type("A", {
          x: 0,
          $delete_y: (_) => {
            _.x++;
            if (_.x === 1) delete _.z;
            else delete _.y;
          },
          $delete_z: (_) => {
            delete _.y;
          },
        });
        const a = A.New();

        delete a.y; // Recursive dependency triggers deletes
        assert(a.y === undefined);
        assert(a.z === undefined);
        assert(a.x === 2);
      });
      it("error handling", () => {
        const A = new Type("A", {
          $delete_x: () => {
            throw new Error("Failed to delete x");
          },
        });
        const a = A.New();

        let error;
        try {
          delete a.x; // Should throw an error
        } catch (e) {
          error = e;
        }

        assert(error && error.message === "Failed to delete x");
      });
    });
  });
  useTests(`getter, setter, deleter: integration`, () => {
    // checks to make sure that getters, setters and deleters of the same key are utilizing the interfaces instead of directly accessing the field.

    it("uses getter in setter/deleter", () => {
      let _set = 0;
      let _delete = 0;
      const A = new Type("A", {
        x: 1,
        $get_x: () => 2,
        $set_x: (_) => (_set = _.x),
        $delete_x: (_) => (_delete = _.x),
      });

      const a = A.New();

      assert(a.x === 2);

      a.x = 5;
      assert(_set === 2);

      delete a.x;
      assert(_delete === 2);
    });
    it("uses setter in getter/deleter", () => {
      let _get = 0;
      let _delete = 0;
      const A = new Type("A", {
        x: 1,
        $set_x: (_, val) => (_get = val + 10),
        $get_x: (_) => _get,
        $delete_x: (_) => (_delete = _get),
      });

      const a = A.New();

      a.x = 5;
      assert(a.x === 15);
      delete a.x;
      assert(_delete === 15);
    });
    it("uses deleter in setter/getter", () => {
      let _set = 0;
      let _get = 0;
      const A = new Type("A", {
        x: 1,
        $delete_x: (_) => (_set = 100),
        $set_x: (_) => (_set += 10),
        $get_x: (_) => _set + _get,
      });

      const a = A.New();

      delete a.x;
      assert(_set === 100);
      a.x = 5;
      assert(a.x === 110);
    });
  });
  useTests(`finals`, () => {
    it(`get`, () => {
      const A = new Type("A", {
        $final_x: 1,
      });
      const a = A.New();

      assert(a.x === 1);
    });
    it(`private field`, () => {
      const A = new Type("A", {
        $final__x: 1,
        $get_x: (_) => _._x,
      });
      const a = A.New();

      assert(a.x === 1);
    });
    it(`cannot set`, () => {
      const A = new Type("A", {
        $final_x: 1,
      });
      const a = A.New();

      assert(a.x === 1);

      let error;
      try {
        a.x = 2;
      } catch (e) {
        error = e;
      }

      assert(error.message === "final field x cannot be set.");
    });
    it(`cannot delete`, () => {
      const A = new Type("A", {
        $final_x: 1,
      });
      const a = A.New();

      assert(a.x === 1);

      let error;
      try {
        delete a.x;
      } catch (e) {
        error = e;
      }

      assert(error.message === "final field x cannot be deleted.");
    });
    it(`cannot set on initialization`, () => {
      const A = new Type("A", {
        $final_x: 1,
      });

      let error;
      try {
        A.New({ x: 2 });
      } catch (e) {
        error = e;
      }

      assert(error.message === "final field x cannot be set.");
    });
  });
  useTests("static", () => {
    // static utilizes Type (see implementation) so these are more to demonstrate how it's used, all of the core logic is tested in the normal Type tests

    it("get, set, delete", () => {
      const A = new Type("A", {
        $static_x: 1,
      });

      assert(A.static.x === 1);

      A.static.x = 2;

      assert(A.static.x === 2);

      delete A.static.x;

      assert(A.static.x === undefined);
      assert(!(`x` in A.static));
    });
    it("private field", () => {
      const A = new Type("A", {
        $static__x: 100, // private static field _x
      });

      // get
      let error = null;
      try {
        A.static._x;
      } catch (e) {
        error = e;
      }
      assert(error);

      // set
      error = null;
      try {
        A.static._x = 2;
      } catch (e) {
        error = e;
      }
      assert(error);

      // delete
      error = null;
      try {
        delete A.static._x;
      } catch (e) {
        error = e;
      }
      assert(error);
    });
    it("final field", () => {
      const A = new Type("A", {
        $static_$final_x: 100, // static final field _x
      });

      assert(A.static.x === 100);
    });
    it("final private field", () => {
      const A = new Type("A", {
        $static_$final__x: 100, // static final private field _x
        $static_$get_x: (_) => _._x,
      });

      assert(A.static.x === 100);
    });
    it("getters, setters, deleters", () => {
      const A = new Type("A", {
        $static__x: 1,
        $static_$get_x: (_) => _._x + 2,
        $static_$set_x: (_, x) => (_._x = x + 3),
        $static_$delete_x: (_) => delete _._x,
      });

      assert(A.static.x === 3);

      A.static.x = 5;
      assert(A.static.x === 10);

      delete A.static.x;
      assert(isNaN(A.static.x)); // the getter resolves to `undefined + 2`
    });
    it("methods", () => {
      const A = new Type("A", {
        $static_x: 2,
        $static_Calculate: (_) => _.x * 100,
        // _ here is A.static
      });

      assert(A.static.Calculate() === 200);
    });
  });
});
