useTests("State", () => {
  let _activeEffect = null;
  let _isUpdating = false;
  let _pendingEffects = new Set();

  let _id = 0;

  const reservedObjKeys = [
    "constructor",
    "__proto__",
    "prototype",
    "toString",
    "valueOf",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
  ];
  const reservedMiddlewareKeys = ["$test_", "$static_"];
  window.useState = (obj = {}, parent = null) => {
    if (typeof obj === "function") obj = obj();
    if (obj.__isState) return obj;

    const id = useId();
    obj.__effects = {};

    const runEffect = (effect) => {
      try {
        effect();
      } catch (err) {
        console.error("An error occurred in an effect:", err);
      }
    };
    const runPendingEffects = () => {
      if (_isUpdating) return;
      _isUpdating = true;
      _pendingEffects.forEach(runEffect);
      _pendingEffects.clear();
      _isUpdating = false;
    };
    const runEffects = (effects, debug) => {
      if (!effects || !effects.size) return;

      effects = Array.from(effects);

      const immeditateEffects = new Set(
        effects.filter((e) => e.opts.runImmeditally)
      );
      const pendingEffects = new Set(
        effects.filter((e) => !e.opts.runImmeditally)
      );

      immeditateEffects.forEach(runEffect);
      pendingEffects.forEach((e) => _pendingEffects.add(e));
      queueMicrotask(runPendingEffects);
    };

    const dynamicEntries = {};
    const middleware = {
      Get: (key) => {
        if (!middleware[key])
          middleware[key] = {
            callbacks: new Set(),
            cacheValue: undefined,
            cacheSize: 0,
            cacheSeed: undefined,
            hasValidCache: false,
            observers: new Set(),
          };

        return middleware[key];
      },
      Add: (key, ...callbacks) => {
        middleware.InvalidateCache(key);
        const middlewareCallbacks = middleware.Get(key).callbacks;
        callbacks.forEach((fn) => middlewareCallbacks.add(fn));
        return () => middleware.Remove(key, ...callbacks);
      },
      Remove: (key, ...callbacks) => {
        middleware.InvalidateCache(key);
        callbacks.forEach((fn) => middleware.Get(key).callbacks.delete(fn));
      },
      Clear: (key) => {
        middleware.InvalidateCache(key);
        middleware.Get(key).callbacks.clear();
      },
      Run: (
        key,
        value,
        { field = key.split("_")[1] || "", useCache = false } = {}
      ) => {
        if (!middleware.HasMiddleware(key)) return value;

        const m = middleware.Get(key);

        if (!useCache) {
          m.callbacks.forEach((fn) => {
            const newValue = fn(value, field, proxy);
            if (newValue !== undefined) value = newValue;
          });

          return value;
        }

        const parentEffect = useEffect().parent;
        if (parentEffect) m.observers.add(parentEffect);

        if (
          m.hasValidCache &&
          m.cacheSeed === value &&
          m.cacheSize === m.callbacks.size
        )
          return m.cacheValue;

        let unsub;
        unsub = useEffect(
          (i, { stopPropagation }) => {
            if (i === 0) {
              m.cacheSeed = value;
              m.callbacks.forEach((fn) => {
                const newValue = fn(value, field, proxy);
                if (newValue !== undefined) value = newValue;
              });
              m.cacheValue = value;
              m.cacheSize = m.callbacks.size;
              m.hasValidCache = true;
              return;
            }

            if (unsub) {
              unsub();
              stopPropagation();
              middleware.InvalidateCache(key);
            }
          },
          { runImmeditally: true }
        );

        return m.cacheValue;
      },
      InvalidateCache: (key) => {
        const m = middleware.Get(key);
        m.hasValidCache = false;
        if (!m.observers.size) return;

        const observers = new Set(m.observers);
        m.observers.clear();
        runEffects(observers, key);
      },
      HasMiddleware: (key) => middleware[key],
      IsValidKey: (key) => {
        const split = key.split("_");
        return (
          key.startsWith("$") &&
          split.length > 1 &&
          (!!split[1] || split.length > 2)
        );
      },
      GenerateKey: (action, key) => `$${action}_${key}`,
    };

    const proxy = new Proxy(obj, {
      get: (target, key) => {
        if (reservedObjKeys.includes(key) || typeof key === "symbol")
          return target[key];

        const isReservedMiddlewareKey = reservedMiddlewareKeys.reduce(
          (acc, mKey) => acc || key.startsWith(mKey),
          false
        );
        if (isReservedMiddlewareKey) return target[key];

        switch (key) {
          case "__isState":
            return true;
          case "__id":
            return id;
          case "__target":
            return target;
          case "__":
            return target.filterKeys((k, v) => {
              if (k.startsWith("__")) return false;

              const isNumericKey = `${parseFloat(k)}` === `${k}`;
              const isCapitalKey = k[0] === k[0].toUpperCase();
              const isMiddlewareKey = middleware.IsValidKey(k);
              if ((!isNumericKey && isCapitalKey) || isMiddlewareKey)
                return false;

              return true;
            });
          case "__parent":
            return parent;
          case "__ancestors":
            return (fn = () => true) => {
              const ancestors = [];
              let current = parent;

              while (current) {
                ancestors.push(current);
                current = current.__parent;
              }

              return ancestors.filter(fn);
            };
          case "__commonAncestors":
            return (other, fn) => {
              const thisAncestors = new Set(proxy.__ancestors(fn));
              const otherAncestors = other.__ancestors(fn);
              return otherAncestors.filter((ancestor) =>
                thisAncestors.has(ancestor)
              );
            };
          case "__pathToRoot":
            return () => {
              const path = [];
              let current = proxy;

              while (current) {
                path.push(current);
                current = current.__parent;
              }

              return path;
            };
          case "__depth":
            return () => {
              let depth = 0;
              let current = proxy;

              while (current.__parent) {
                depth++;
                current = current.__parent;
              }

              return depth;
            };
          case "__root":
            let current = proxy;
            while (current.__parent) current = current.__parent;
            return current;
          case "__remove":
            return () => {
              if (!parent) return false; // Cannot remove the root node

              for (const key in parent) {
                if (parent[key] === proxy) {
                  delete parent[key];
                  return true;
                }
              }
              return false;
            };
          case "__middleware":
            return middleware;
        }

        if (key.startsWith("__")) return target[key];
        if (middleware.IsValidKey(key)) return middleware.Get(key);
        const middlewareKey = middleware.GenerateKey("get", key);

        if (middleware.HasMiddleware(middlewareKey)) {
          target[key] = middleware.Run(middlewareKey, undefined, {
            useCache: true,
          });
        } else if (key.startsWith("$") && !dynamicEntries[key]) {
          const value = target[key];
          target[key] = [];

          const unsubs = (dynamicEntries[key] = []);

          if (typeof value === "function")
            unsubs.push(useEffect(() => (proxy[key] = value(proxy))));
          else if (Array.isArray(value)) {
            let list = [];

            const refresh = () =>
              useRoot(
                () =>
                  (proxy[key] = list
                    .flat(Infinity)
                    .filter(
                      (item) =>
                        item !== undefined &&
                        item !== false &&
                        (typeof item !== "object" ||
                          !item ||
                          !item.__isPlaceholder)
                    ))
              );

            value.forEach((item) => {
              const isDynamicItem = typeof item === "function";
              const isDynamicList =
                Array.isArray(item) &&
                item.length === 2 &&
                (Array.isArray(item[0]) || typeof item[0] === "function") &&
                typeof item[1] === "function";

              if (!isDynamicItem && !isDynamicList) return list.push(item);

              const start = { __isPlaceholder: true };
              const end = { __isPlaceholder: true };
              list.push(start, end);

              unsubs.push(
                useEffect((i) => {
                  const startIndex = list.indexOf(start);
                  const endIndex = list.indexOf(end);
                  const listStart = list.slice(0, startIndex + 1);
                  const listEnd = list.slice(endIndex);

                  const mountedItems = list.slice(startIndex + 1, endIndex);

                  if (isDynamicItem)
                    list = [
                      ...listStart,
                      ...useArray(item(proxy, i)),
                      ...listEnd,
                    ];
                  else if (isDynamicList) {
                    let [dynamicList, dynamicListFn] = item;
                    dynamicList = useRoot(() =>
                      useFunctionResult(dynamicList, proxy)
                    );

                    for (
                      let newItemIndex = mountedItems.length;
                      newItemIndex < dynamicList.length;
                      newItemIndex++
                    ) {
                      const newItem = useRoot(() =>
                        dynamicListFn(dynamicList[newItemIndex], newItemIndex)
                      );

                      list.splice(startIndex + newItemIndex + 1, 0, newItem);
                    }

                    const newEndIndex = startIndex + dynamicList.length + 1;
                    list.splice(newEndIndex, endIndex - newEndIndex);
                  }

                  refresh();
                })
              );
            });

            refresh();
          }
        }

        if (_activeEffect) {
          if (!target.__effects[key]) target.__effects[key] = new Set();
          if (target.__effects[key] instanceof Set)
            target.__effects[key].add(_activeEffect);

          const activeEffectCache = _activeEffect;
          _activeEffect.unsubCallbacks.add(() => {
            target.__effects[key].delete(activeEffectCache);
          });
        }

        if (
          target[key] &&
          typeof target[key] === "object" &&
          !(target[key] instanceof RegExp) &&
          !(target[key] instanceof Node)
        )
          return target[key].__state
            ? target[key].__state()
            : useState(target[key], proxy);

        let value = target[key];
        if (key !== `$get_` && target.$get_)
          useArray(target.$get_).forEach(
            (fn) => (value = fn(target, key, value, proxy))
          );

        return value;
      },
      set: (target, key, value) => {
        if (reservedObjKeys.includes(key)) {
          target[key] = value;
          return true;
        }
        // if (key.startsWith("__")) return true;
        const isReservedMiddlewareKey = reservedMiddlewareKeys.reduce(
          (acc, mKey) => acc || key.startsWith(mKey),
          false
        );
        if (isReservedMiddlewareKey) {
          target[key] = value;
          return true;
        }

        if ([`$get_`, `$set_`, `$delete_`].includes(key)) target[key] = value;

        const isMiddleware = middleware.IsValidKey(key);
        if (isMiddleware) {
          middleware.Clear(key);
          middleware.Add(key, ...useArray(value));
          return true;
        }

        const middlewareKey = middleware.GenerateKey("set", key);
        if (middleware.HasMiddleware(middlewareKey))
          value = middleware.Run(middlewareKey, value);

        const isUnchangedFunction =
          typeof value === "function" &&
          typeof target[key] === "function" &&
          value.toString() === target[key].toString();
        if (isUnchangedFunction) return true;

        if (
          target[key] &&
          value &&
          typeof target[key] === "object" &&
          typeof value === "object"
        ) {
          const hasSameKeys =
            Object.keys(target[key])
              .filter((k) => !k.startsWith("__"))
              .sort()
              .join() ===
            Object.keys(value)
              .filter((k) => !k.startsWith("__"))
              .sort()
              .join();
          const hasSamePrototype =
            Object.getPrototypeOf(target[key]) === Object.getPrototypeOf(value);

          for (const k in proxy[key])
            if (!(k in value) && !k.startsWith("__")) delete proxy[key][k];

          Object.assign(proxy[key], value);
          Object.setPrototypeOf(proxy[key], Object.getPrototypeOf(value));

          if (
            Array.isArray(value) &&
            Array.isArray(target[key]) &&
            value.length !== target[key].length
          ) {
            proxy[key].length = value.length;
            return true;
          }

          if (
            hasSameKeys &&
            hasSamePrototype /*=&& !Array.isArray(target[key])*/
          )
            return true;
        } else {
          const isArrayLength = Array.isArray(target) && key === "length";
          if (target[key] === value && !isArrayLength) return true;

          // console.log(
          //   key,
          //   target,
          //   { old: target[key], new: value },
          //   target.__effects[key]
          // );
          target[key] = value;
        }

        if (target.$set_) {
          useArray(target.$set_).forEach(
            (fn) => (target[key] = fn(target, key, value, proxy))
          );
        }

        runEffects(target.__effects[key], key);

        return true;
      },
      deleteProperty: (target, key) => {
        if (key.startsWith("__")) return true;

        const middlewareKey = middleware.GenerateKey("delete", key);
        if (middleware.HasMiddleware(middlewareKey))
          middleware.Run(middlewareKey);

        const value = proxy[key];
        if (value && typeof value === "object")
          for (const k in value) if (value.hasOwnProperty(k)) delete value[k];

        delete target[key];
        runEffects(target.__effects[key], key);

        if (target.$delete_)
          useArray(target.$delete_).forEach((fn) => fn(target, key, proxy));
        return true;
      },
    });

    Object.keys(obj)
      .filter((k) => middleware.IsValidKey(k))
      .forEach((k) => middleware.Add(k, ...useArray(obj[k])));

    obj.__state = () => proxy;

    return proxy;
  };
  useTests("useState", () => {
    useTests("init", () => {
      it("calls the constructor function if one if passed in", () => {
        let i = 0;
        const _ = useState(() => {
          i++;
          return { i };
        });
        assert(i === 1);
        assert(_.i === i);
      });
      it("shallow circular object", () => {
        const circularObj = {};
        circularObj.self = circularObj;
        const _ = useState(circularObj);
        assert(_.self === _);
      });
      it("deep circular object", () => {
        // Create a deeply nested circular object
        const circularObj = { a: { b: { c: {} } } };
        circularObj.a.b.c.self = circularObj.a.b;
        // Initialize the proxy state
        const _ = useState(circularObj);
        _.nestedCircular = circularObj;
        // Check if the deeply nested circular reference is correctly assigned
        assert(
          _.nestedCircular.a.b.c.self === _.nestedCircular.a.b,
          "deeply nested circular reference points back to second level"
        );
      });
      it("array", () => {
        const _ = useState([1, 2, 3]);
        assert(_.matches([1, 2, 3]));
      });
      it("if proxy is passed in, returns proxy", () => {
        const a = useState([1]);
        const _ = useState(a);

        assert(_ === a);
      });
    });
    useTests("get", () => {
      it("returns attributes", () => {
        const _ = useState({ a: "a", b: { c: "c" } });
        assert(_.a === "a");
        assert(_.b.c === "c");
        assert(_.b.c === "c");
      });
      it("converts nested objects to state", () => {
        const _ = useState({ a: { b: "b" } });
        assert(_.a.__isState);
      });
      it(`works with null`, () => {
        const _ = useState({
          a: null,
        });
        assert(_.a === null);
      });
      it("if proxy is in object, doesn't double proxy", () => {
        const a = useState([1]);
        const _ = useState({ a });

        // THIS CAN'T BE TESTED DIRECTLY, MUST VISUALLY VERIFY USING LOG
        // console.log(_.a);
      });
      it(`doesn't state-ify dom nodes`, () => {
        const _ = useState({ e: document.createElement("div") });
        assert(_.e instanceof HTMLElement && !_.e.__isState);

        _.a = document.createElement("div");
        assert(_.a instanceof HTMLElement && !_.a.__isState);
      });
      it(`doesn't state-ify RegExp objects`, () => {
        const _ = useState({ e: /a/ });
        assert(_.e.exec("a") && !_.e.__isState);

        _.a = /^/;
        assert(_.a.exec("a") && !_.a.__isState);
      });
    });
    useTests("set", () => {
      it("assignes attributes", () => {
        const _ = useState({ a: "a", b: { c: "c" } });
        _.a = "b";
        assert(_.a === "b");
        _.b = { c: "d" };
        assert(_.b.c === "d");
        _.b.c = "f";
        assert(_.b.c === "f");
      });
      it(`assignes null to object`, () => {
        const _ = useState({
          a: [],
        });
        _.a = null;
        assert(_.a === null);
      });
      it(`assignes object to null`, () => {
        const _ = useState({
          a: null,
        });
        _.a = [];
        assert(_.a);
      });
      it("assigns shallow circular object", () => {
        const circularObj = {};
        circularObj.self = circularObj;
        const _ = useState({});
        _.circular = circularObj;

        assert(
          _.circular.self === _.circular,
          "circular reference is assigned correctly"
        );
      });
      it("assigns deep circular object", () => {
        const circularObj = { a: { b: { c: {} } } };
        circularObj.a.b.c.self = circularObj.a.b;

        const _ = useState({});
        _.nestedCircular = circularObj;

        assert(
          _.nestedCircular.a.b.c.self === _.nestedCircular.a.b,
          "deeply nested circular reference points back to second level"
        );
      });
      it("merges nested objects and updates prototype", () => {
        class A {
          constructor() {
            this.isA = true;
          }
        }
        class B {
          constructor() {
            this.isB = true;
          }
        }
        const a = new A();
        const b = new B();
        const _ = useState({ a });

        _.a = b; // replace a with b
        assert(_.a.__target === a, "object reference is unchanged");
        assert(!_.a.isA, "old fields are deleted");
        assert(_.a.isB, "new fields are added");
        assert(_.a.constructor === B, "prototype is updated");
      });
      it(`deeply merges arrays`, () => {
        const _ = useState({
          posts: ["My First Post", "Another Day, Another Post"],
        });
        _.posts = _.posts.filter((p) => p !== _.posts.at(-1));
        assert(_.posts.length === 1);
      });
      it(`deeply merges array inline modifiy`, () => {
        const _ = useState({
          posts: ["My First Post", "Another Day, Another Post"],
        });
        _.posts.pop();
        assert(_.posts.length === 1);
      });
      it(`handles reserved object keys`, () => {
        const _ = useState({});
        try {
          reservedObjKeys.forEach((k) => (_[k] = "a"));
          _.__proto__ = "a";
        } catch (e) {
          assert(false);
        }
      });
      it(`doesn't modify keys starting with __`, () => {
        const _ = useState({ __effects: "a" });

        _.__effects = "b";

        assert((_.__effects = "a"));
      });
    });
    useTests("deleteProperty", () => {
      it("removes old state references", () => {
        const _ = useState([{ e: "a" }]);
        _[0];
        delete _[0];
        _[0] = { e: "b" };

        assert(_[0].e === "b");
      });
    });
    useTests("middleware", () => {
      it(".__middleware", () => {
        const _ = useState({});
        assert(_.__middleware.Add);
      });
      it("$get_", () => {
        const _ = useState({
          $get_: (_target, _key, value = 0) => value + 100,
          $get_a: () => 4,
        });
        assert(_.a === 104);
        assert(_.a === 104);
        assert(_.b === 100);

        const newGetters = [() => 200, () => 300];
        _.$get_ = newGetters;
        assert(_.a === 300);
        assert(_.$get_.matches(newGetters));

        _.$get_ = null;
        assert(_.a === 4);
      });
      it("$set_", () => {
        const _ = useState({
          $set_: (_target, _key, value = 0) => value + 100,
          $set_a: () => 4,
        });

        assert(_.a === undefined);

        _.a = null;
        assert(_.a === 104);

        _.$set_ = [() => 200, () => 300];
        _.a = null;
        assert(_.a === 300);

        _.$set_ = null;
        _.a = null;
        assert(_.a === 4);
      });
      it("$delete_", () => {
        let i = 0;
        const _ = useState({
          $delete_: (_target, _key) => i++,
        });

        delete _.a;
        assert(i === 1);
      });
      it("get, set, deleteProperty", () => {
        let i = 0;
        const _ = useState({
          $get_a: () => 1,
          $set_b: () => 2,
          $delete_b: () => i++,
        });

        assert(_.a === 1);

        _.b = null;
        assert(_.b === 2);

        assert(i === 0);
        delete _.b;
        assert(i === 1);
      });
      it("adding/removing", () => {
        const _ = useState({
          $get_a: () => 1,
        });
        assert(_.a === 1);

        const unsub = _.__middleware.Add(`$get_a`, (a) => a + 10);
        assert(_.a === 11);

        unsub();
        assert(_.a === 1);
      });
      it("replacing", () => {
        let i = 0;
        const _ = useState({
          $get_a: () => 1,
        });
        assert(_.a === 1);

        _.__middleware.Add(`$get_a`, (a) => a + 10);
        assert(_.a === 11);

        _.$get_a = () => 4;
        assert(_.a === 4);
      });
      it("merging", () => {
        let i = 0;
        const _ = useState({
          child: { $get_a: () => 1 },
        });

        assert(_.child.a === 1);

        _.child = {
          $get_a: () => 2,
        };

        assert(_.child.a === 2);
      });
      it("nesting", () => {
        const _ = useState({
          $get_a: () => _.b,
          $get_b: () => _.c,
          $get_c: () => 1,
        });
        assert(_.a === 1);
        assert(_.b === 1);
        assert(_.c === 1);
      });
      it("caching", () => {
        let a = 0;
        let b = 0;
        const _ = useState({
          $get_a: () => {
            a++;
            return _.b;
          },
          $get_b: () => {
            b++;
            return 1;
          },
        });

        // both getters are run
        _.a;
        assert(a === 1);
        assert(b === 1);

        // returns cached _.a
        _.a;
        assert(a === 1);
        assert(b === 1);

        // returns cached _.b
        _.b;
        assert(a === 1);
        assert(b === 1);

        // add middleware
        let b2 = 0;
        _.__middleware.Add(`$get_b`, (b) => {
          b2++;
          return b + 1;
        });
        assert(_.a === 2);
        assert(a === 2);
        assert(b === 2);
        assert(b2 === 1);

        // returns cached _.a
        _.a;
        assert(a === 2);
        assert(b === 2);
        assert(b2 === 1);

        // returns cached _.b
        _.b;
        assert(a === 2);
        assert(b === 2);
        assert(b2 === 1);

        // replace middleware
        let b3 = 0;
        _.$get_b = () => {
          b3++;
          return 4;
        };
        assert(_.a === 4);
        assert(a === 3);
        assert(b === 2);
        assert(b2 === 1);
        assert(b3 === 1);

        // returns cached _.a
        _.a;
        assert(a === 3);
        assert(b === 2);
        assert(b2 === 1);
        assert(b3 === 1);

        // returns cached _.b
        _.b;
        assert(a === 3);
        assert(b === 2);
        assert(b2 === 1);
        assert(b3 === 1);
      });
      it("multiple callbacks", () => {
        let i = 0;
        const _ = useState({
          x: 10,

          $set_a: [() => 1, (a, key, _) => a + key + _.x],
        });

        assert(_.a === undefined);

        _.a = null;
        assert(_.a === `1a10`);

        _.$set_a = [() => 2];
        _.a = null;
        assert(_.a === 2);

        _.$set_a = () => 5;
        _.a = null;
        assert(_.a === 5);
      });
    });
    useTests("__fields", () => {
      it("__id", () => {
        const _1 = useState({});
        const _2 = useState({});
        assert(_1.__id !== undefined);
        assert(_2.__id !== undefined);
        assert(_1.__id !== _2.__id);
      });
      it("__isState", () => {
        const _ = useState({});
        assert(_.__isState);
      });
      it("__target", () => {
        const a = { a: { b: "b" } };
        const _ = useState(a);
        assert(_.__target === a && !_.__target.__isState);
      });
      it("__", () => {
        const _ = useState({
          A: () => {},
          __b: "__b",
          c: "hi",
          d: [{ E: "E", f: 4 }],
        });

        assert(_.__.matches({ c: "hi", d: [{ f: 4 }] }));
      });

      useTests("tree", () => {
        it("__parent", () => {
          const _ = useState({
            a: [{ b: "b" }],
          });
          assert(_.__parent === null);
          assert(_.a.__parent === _);
          assert(_.a[0].__parent === _.a);
          assert(_.a[0].__parent.__parent === _);
        });
        it("__ancestors", () => {
          const _ = useState({ x: 1, a: { b: { x: 1, c: { d: {} } } } });
          assert(_.a.b.c.d.__ancestors().matches([_.a.b.c, _.a.b, _.a, _]));
          assert(_.a.b.c.d.__ancestors((a) => a.x).matches([_.a.b, _]));
        });
        it("__commonAncestors", () => {
          const obj = {
            a: [{ b: { c: {} } }, { d: {} }],
          };

          const _ = useState(obj);

          assert(_.a[0].b.c.__commonAncestors(_.a[1].d).matches([_.a, _]));
          assert(
            _.a[0].b.c
              .__commonAncestors(_.a[1].d, (a) => Array.isArray(a))
              .matches([_.a])
          );
        });
        it("__pathToRoot", () => {
          const obj = {
            a: {
              b: "target",
              c: {
                d: "leaf",
              },
            },
          };
          const _ = useState(obj);
          const leafNode = _.a.c;
          const path = leafNode.__pathToRoot();
          assert(path.length === 3, "returns the correct length of the path");
          assert(path[0] === _.a.c);
          assert(path[1] === _.a);
          assert(path[2] === _);
        });
        it("__depth", () => {
          const obj = {
            a: {
              b: "level 2",
              c: {
                d: "level 3",
              },
            },
          };
          const _ = useState(obj);
          assert(_.a.__depth() === 1);
          assert(_.a.c.__depth() === 2);
        });
        it("__root", () => {
          const obj = {
            a: {
              b: "level 2",
              c: {
                d: "level 3",
              },
            },
          };
          const _ = useState(obj);
          assert(_.a.c.__root === _, "returns the root node");
        });
        it("__remove", () => {
          const obj = {
            a: {
              b: { c: "target" },
            },
          };
          const _ = useState(obj);
          const targetNode = _.a.b;
          const result = targetNode.__remove();
          assert(result === true, "remove operation was successful");
          assert(!_.a.b, "target node is no longer in the tree");
        });
      });
    });
  });

  window.useEffect = (fn = () => {}, opts = {}) => {
    const parent = opts._parent;
    let i = 0;
    const id = useId();
    const effect = () => {
      if (effect.nestedUnsubs) effect.nestedUnsubs.forEach((fn) => fn());
      effect.nestedUnsubs = [];
      const _useEffect = window.useEffect;
      window.useEffect = (fn, opts) => {
        const unsub = _useEffect(fn, { ...opts, _parent: effect });
        effect.nestedUnsubs.push(unsub);
        unsub.opts = opts;
        unsub.parent = effect;
        return unsub;
      };

      effect.cleanup = () => {};
      effect.unsubCallbacks = new Set();
      _activeEffect = effect;
      let result;
      try {
        let shouldPropagate = true;
        const options = {
          effect,
          parent,
          stopPropagation: () => (shouldPropagate = false),
        };

        result = fn(i, options) || (() => {});

        if (result instanceof Promise) {
          result
            .then((result) => {
              if (shouldPropagate && parent) _pendingEffects.add(parent);
              if (typeof result === "function") effect.cleanup = result;
            })
            .catch((err) =>
              console.error("an error occurred in an async effect:", err)
            )
            .finally(() => (_activeEffect = null));
        } else if (shouldPropagate && parent && i > 0)
          _pendingEffects.add(parent);

        if (typeof result === "function") effect.cleanup = result;
      } catch (err) {
        console.error("an error occurred in an effect:", err);
      } finally {
        if (!(result instanceof Promise)) _activeEffect = null;
        window.useEffect = _useEffect;
      }
      i++;
    };
    effect.opts = opts;
    effect();

    const unsub = () => {
      effect.cleanup();
      effect.unsubCallbacks.forEach((fn) => fn());
      effect.nestedUnsubs.forEach((fn) => fn());
    };

    unsub.effect = effect;
    return unsub;
  };
  useTests("useEffect", () => {
    useTests("cleanup", () => {
      it("calls the function returned from the sync effect", async () => {
        let i = 0;
        let cleanup = useEffect(() => {
          return () => i++;
        });
        assert(i === 0);
        cleanup();
        assert(i === 1);
      });
      it("calls the function returned from the async effect", async () => {
        let i = 0;
        let cleanup = () => {};
        cleanup = useEffect(async () => {
          await defer();
          return () => i++;
        });
        assert(i === 0);
        await defer();
        cleanup();
        assert(i === 1);
      });
    });
    useTests("errors", () => {
      it("gracefully handles errors thrown in a sync effect/dependency and outputs error to console", async () => {
        const _consoleError = console.error;

        let errorMessage;
        console.error = (...args) => (errorMessage = args.join(""));
        // effect
        useEffect(() => {
          throw `bad effect`;
        });
        assert(errorMessage.includes(`bad effect`));

        console.error = _consoleError;
      });
      it("gracefully handles errors thrown in an async effect and outputs error to console", async () => {
        const _consoleError = console.error;

        let errorMessage;
        console.error = (...args) => (errorMessage = args.join(""));

        await new Promise((res) => {
          useEffect(async () => {
            await new Promise((_, rej) =>
              setTimeout(() => {
                rej(`bad async effect`);
                res();
              }, 1)
            );
          });
        });
        await defer();

        console.error = _consoleError;
        assert(errorMessage.includes(`bad async effect`));
      });
    });
  });
  useTests("useEffect/State integration", () => {
    useTests("basic operations", () => {
      it("sync: runs once on change, allows for cleanup", async () => {
        let i = 0;
        const _ = useState({ a: "a", b: "b" });
        const cleanup = useEffect((count) => {
          i = count;
          _.a;
          _.b;
        });

        _.a = 1;
        _.b = 2;
        await defer();
        assert(i === 1);

        _.newField = 3;
        await defer();
        assert(i === 1);

        cleanup();

        _.a = true;
        await defer();
        assert(i === 1);
      });
      it("async: runs once on change, allows for cleanup", async () => {
        const _ = useState();
        let i = 0;
        let cleanup = () => {};
        await new Promise((res) => {
          cleanup = useEffect(async () => {
            i++;
            _.a;
            _.b;
            res();
          });
        });

        assert(i === 1);
        _.a = 1;
        _.b = 2;
        await defer();
        assert(i === 2);

        _.newField = 3;
        await defer();
        assert(i === 2);

        cleanup();

        _.a = true;
        await defer();
        assert(i === 2);
      });
      it("triggers effects", async () => {
        const _ = useState({
          x: 0,

          $get_a: () => _.b,
          $get_b: () => _.x,
        });

        let i = 0;
        useEffect((_i) => {
          // console.log({ i });
          _.a;
          i++;
        });

        assert(i === 1);

        _.x = 1;
        assert(i === 1);

        await defer();
        assert(i === 2);
      });
      it("runImmeditally", async () => {
        const _ = useState({ a: 0 });

        let i = 0;
        useEffect(
          () => {
            _.a;
            i++;
          },
          { runImmeditally: true }
        );

        let j = 0;
        useEffect(() => {
          _.a;
          j++;
        });

        assert(i === 1);
        assert(j === 1);

        _.a++;

        assert(i === 2);
        assert(j === 1);

        await defer();

        assert(i === 2);
        assert(j === 2);
      });
      it("doesn't register dependency for assignment", async () => {
        let i = 0;
        const _ = useState({ a: 0 });
        useEffect(() => {
          _.a += 0;
          i++;
        });

        await defer();
        assert(i === 1);
      });
      it("doesn't trigger effect for unchanged functions", async () => {
        const _ = useState({ a: () => true });

        let i = 0;
        useEffect(() => {
          _.a;
          i++;
        });
        _.a = () => true;
        await defer();
        assert(i === 1);
      });
      it("doesn't trigger effect for unchanged primitive values", async () => {
        const _ = useState({ a: "a" });

        let i = 0;
        useEffect(() => {
          _.a;
          i++;
        });
        _.a = "a";
        await defer();
        assert(i === 1);
      });
    });
    useTests("delete", () => {
      it("object", async () => {
        const _ = useState({ a: "a" });

        let i = 0;
        useEffect(() => {
          _.a;
          i++;
        });

        delete _.a;

        await defer();
        assert(i === 2);
      });
      it("deeply nested object", async () => {
        const _ = useState({ a: { b: { c: "c" } } });

        const a = _.a;
        let aCount = 0;
        useEffect(() => {
          _.a;
          aCount++;
        });

        const b = _.a.b;
        let bCount = 0;
        useEffect(() => {
          a.b;
          bCount++;
        });

        let cCount = 0;
        useEffect(() => {
          b.c;
          cCount++;
        });

        delete _.a;

        await defer();
        assert(aCount === 2);
        assert(bCount === 2);
        assert(cCount === 2);
      });
    });
    useTests("Object", () => {
      it("sync: run for merged object properties", async () => {
        const _ = useState({ a: { b: { c: "c" }, d: "d" } });
        let i = 0;
        let j = 0;
        let k = 0;
        const cleanups = [
          useEffect(() => {
            i++;
            _.a.b.c;
          }),
          useEffect(() => {
            j++;
            _.a.b;
          }),
          useEffect(() => {
            _.a;
            k++;
          }),
        ];

        _.a = {
          b: { c: true },
          d: false,
        };
        await defer();
        assert(i === 2);
        assert(j === 1);
        assert(k === 1);

        cleanups.forEach((c) => c());
      });
      it("async: run for merged object properties", async () => {
        const _ = useState({ a: { b: { c: "c" }, d: "d" } });
        let i = 0;
        let j = 0;
        let k = 0;
        await new Promise((res) =>
          useEffect(() => {
            i++;
            _.a.b.c;
            res();
          })
        );
        await new Promise((res) =>
          useEffect(() => {
            j++;
            _.a.b;
            res();
          })
        );
        await new Promise((res) =>
          useEffect(() => {
            _.a;
            k++;
            res();
          })
        );
        _.a = {
          b: { c: true },
          d: false,
        };
        await defer();
        assert(i === 2);
        assert(j === 1);
        assert(k === 1);
      });
      it("Object.assign", async () => {
        const _ = useState({ a: true });

        let i = 0;
        useEffect(() => {
          _.a;
          i++;
        });

        Object.assign(_, { a: false });

        await defer();
        assert(i === 2);
      });
      useTests("nested", () => {
        it("propagate", async () => {
          const _ = useState({ a: 0, b: 0 });

          let i = 0;
          let j = 0;
          useEffect(() => {
            _.a;
            i++;
            useEffect(() => {
              _.b;
              j++;
            });
          });

          assert(i === 1);
          assert(j === 1);

          _.a = 1;
          await defer();

          assert(i === 2);
          assert(j === 2);

          _.b = 1;
          await defer();

          assert(i === 3);
          assert(j === 4);

          _.a = 2;
          await defer();

          assert(i === 4);
          assert(j === 5);

          _.b = 2;
          await defer();

          assert(i === 5);
          assert(j === 7);
        });
        it("don't propagate", async () => {
          const _ = useState({ a: 0 });

          let i = 0;
          let j = 0;
          useEffect(() => {
            i++;
            useEffect((_i, { stopPropagation }) => {
              j++;
              if (_.a === 2) stopPropagation();
            });
          });

          assert(i === 1);
          assert(j === 1);

          _.a = 1;
          await defer();

          assert(i === 2);
          assert(j === 3);

          _.a = 2;
          await defer();

          assert(i === 2);
          assert(j === 4);

          _.a = 3;
          await defer();

          assert(i === 3);
          assert(j === 6);
        });
      });
    });
    useTests("Array", () => {
      it("runs for array length update", async () => {
        const _ = useState({ a: [] });

        let i = 0;
        useEffect(() => {
          _.a.length;
          i++;
        });

        _.a.push("a");

        await defer();
        assert(i === 2);
      });
      it("runs for array length update manual", async () => {
        const _ = useState({ a: ["a"] });
        // if the array length didn't change it shouldn't run

        let i = 0;
        useEffect(() => {
          _.a.length;
          i++;
        });

        _.a = ["b"];

        await defer();
        assert(i === 1);
      });
      it("doesn't run for array reassign", async () => {
        const _ = useState({ a: [1, 2, 3] });

        let i = 0;
        useEffect(() => {
          _.a;
          i++;
        });

        _.a = [3, 4];

        await defer();
        assert(i === 1);

        _.a = _.a.filter((e) => e !== 3);

        await defer();
        assert(i === 1);
      });
    });
    useTests("dynamic fields", () => {
      it("dynamic getters", () => {
        let a = 0;
        let b = 0;
        let c = 0;
        const _ = useState({
          x: 1,

          $get_a: () => {
            a++;
            return _.b;
          },
          $get_b: () => {
            b++;
            return _.c;
          },
          $get_c: () => {
            c++;
            return _.x;
          },
        });
        // wires up getters
        assert(_.a === 1 && a === 1);
        assert(_.b === 1 && b === 1);
        assert(_.c === 1 && c === 1);

        _.x = 2;
        assert(_.a === 2 && a === 2);
        assert(_.b === 2 && b === 2);
        assert(_.c === 2 && c === 2);
      });
      it("computed properties", async () => {
        const _ = useState({ a: 0, $b: (_) => _.a + 1 });
        _.$c = (_) => _.a + 2;

        assert(_.$b === 1);
        assert(_.$c === 2);

        _.a = 2;

        await defer();
        assert(_.$b === 3);
        assert(_.$c === 4);
      });
      it("stateful list items", async () => {
        const _ = useState({
          a: [{ value: "a" }, { value: "b" }],
          $b: [
            1,
            [(_) => _.a, (e) => e],
            {},
            (_) => !!_.a.length && _.a[0].value,
            3,
            () => [4, [5]],
          ],
        });

        assert(_.$b.__parent === _);

        assert(_.$b.matches([1, ..._.a, {}, "a", 3, 4, 5]));

        _.a = [{ value: "c" }];
        await defer();

        assert(_.$b.matches([1, _.a[0], {}, "c", 3, 4, 5]));

        _.a = [];
        await defer();
        assert(_.$b.matches([1, {}, 3, 4, 5]));
      });
      it("responds to state changes and invalidates cache immeditally", () => {
        let a = 0;
        let b = 0;
        let c = 0;
        const _ = useState({
          x: 1,
          y: 10,

          $get_a: () => {
            a++;
            return _.x + _.c;
          },
          $get_b: () => {
            b++;
            return _.c;
          },
          $get_c: () => {
            c++;
            return _.y;
          },
        });
        // wires up getters
        assert(_.a === 11 && a === 1);
        assert(_.b === 10 && b === 1);
        assert(_.c === 10 && c === 1);

        // getters respond to state change
        _.y = 20;
        assert(_.a === 21 && a === 2);
        assert(_.b === 20 && b === 2);
        assert(_.c === 20 && c === 2);

        // returns cached values if no state changes
        assert(_.a === 21 && a === 2);
        assert(_.b === 20 && b === 2);
        assert(_.c === 20 && c === 2);

        _.x = 2;
        assert(_.a === 22 && a === 3);
        assert(_.b === 20 && b === 2);
        assert(_.c === 20 && c === 2);

        // returns cached values if no state changes
        assert(_.a === 22 && a === 3);
        assert(_.b === 20 && b === 2);
        assert(_.c === 20 && c === 2);
      });
    });
  });

  // -------------------------- #useRoot --------------------------
  useTests("useRoot", () => {
    window.useRoot = (fn) => {
      const _ = _activeEffect;
      _activeEffect = null;
      const result = fn();
      _activeEffect = _;
      return result;
    };

    it(`calls the function inside`, () => {
      let i = 0;
      useRoot(() => i++);
      assert(i === 1);
    });
    it(`isolates the function from useEffect state observers`, async () => {
      const _ = useState();
      let i = 0;
      useEffect(() => {
        i++;
        useRoot(() => _.name);
      });
      _.name = "finn";
      await defer();
      assert(i === 1);
    });
  });
});
