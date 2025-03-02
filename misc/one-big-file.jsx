// -------------------------- #global initializers --------------------------
window.useState = () => {};
window.it = () => {};
window.before = () => {};
window.after = () => {};
window.beforeEach = () => {};
window.afterEach = () => {};
window.assert = () => {};
window._ = {};
window.frag = document.createDocumentFragment();
window.div = document.createElement("div");
window.span = document.createElement("span");
window.input = document.createElement("input");
window.cleanup = () => {};
window.sleep = (duration) => new Promise((res) => setTimeout(res, duration));

window.GLOBAL_STYLE = document.createElement("style");
document.head.append(GLOBAL_STYLE);
GLOBAL_STYLE.textContent += `
* {
  box-sizing: border-box;
  position: relative;
}

body div {
  display: flex;
  flex-direction: column;
}
`;

// -------------------------- #useTests --------------------------
let _tests = [];
let _onlyTests = [];
let _testsCount = 0;
let _testsStart;
const _runAllTests = false;
let _shouldTest = true;
window.useTests = async (
  testsName,
  testsFn,
  { skip = false, showTests = true, only = false } = {}
) => {
  if (!_shouldTest) return;

  if (skip && !_runAllTests) return;

  let tests = [];
  let onlyTests = [];
  const lifecycleCallbacks = {};
  window.assertions = [];

  window.it = (description, fn, { only = false, skip = false } = {}) => {
    const test = { description, fn };
    if (only) onlyTests.push(test);
    else if (!skip) tests.push(test);
  };
  const run = (lifecycle, fn) => {
    if (!lifecycleCallbacks[lifecycle]) lifecycleCallbacks[lifecycle] = [];
    lifecycleCallbacks[lifecycle].push(fn);
  };
  const runLifecycleCallbacks = async (lifecycle) => {
    if (lifecycleCallbacks[lifecycle])
      for (const fn of lifecycleCallbacks[lifecycle]) {
        try {
          await fn({ div, span, _ });
        } catch (err) {
          console.error(err);
          console.log(
            `%c🟠 ${lifecycle} callback failed: "${err.message || err}"`,
            `color: orange`
          );
        }
      }
  };
  window.assert = (condition, msg) => {
    assertions.push({
      condition,
      msg: msg, //|| (condition ? "passed" : "failed"),
    });
  };
  window.assertThrows = (fn, { type, msg } = {}, _msg) => {
    let passed = false;
    let didThrow = false;
    try {
      fn();
    } catch (error) {
      passed = true;
      if (type && !(error instanceof type)) passed = false;
      if (msg)
        if (error.message && error.message !== msg) passed = false;
        else if (error !== msg) passed = false;
    }

    assertions.push({
      condition: passed,
      msg: _msg,
    });
  };

  window.before = (fn) => run("before", fn);
  window.after = (fn) => run("after", fn);
  window.beforeEach = (fn) => run("beforeEach", fn);
  window.afterEach = (fn) => run("afterEach", fn);
  testsFn();

  const testRunner = async () => {
    console.group(`%c🤖 ${testsName}:`, `color: #7DCFFF`);
    await runLifecycleCallbacks("before");
    if (onlyTests.length) tests = onlyTests;
    for (let test of tests) {
      frag = document.createDocumentFragment();

      div = document.createElement("div");
      div.style.visibility = "hidden";
      div.style.position = "absolute";

      input = document.createElement("input");
      input.style.display = "none";

      span = document.createElement("span");
      span.style.display = "none";

      document.body.append(div, span);
      let oldStyles = GLOBAL_STYLE.textContent;
      GLOBAL_STYLE.textContent = ``;

      _ = useState({});

      await runLifecycleCallbacks("beforeEach");

      let cleanup = () => {};
      let testFuncResult;
      let errorThrown = false;

      assertions = [];
      _testsCount++;
      try {
        testFuncResult = await test.fn({
          cleanup: (fn) => (cleanup = fn),
        });
      } catch (err) {
        console.error(err);
        errorThrown = true;
      }
      div.remove();
      span.remove();
      input.remove();
      GLOBAL_STYLE.textContent = oldStyles;

      if (showTests) {
        const passedAssertions = assertions.filter((a) => a.condition);
        const testPassed =
          !errorThrown &&
          (testFuncResult === true ||
            (testFuncResult === undefined &&
              passedAssertions.length === assertions.length));
        const hasAssertionsToReport =
          assertions.length && assertions.some((a) => a.msg || !a.condition);

        const msg = `${testPassed ? "✅" : "❌"} ${test.description}${
          hasAssertionsToReport
            ? ` (${passedAssertions.length}/${assertions.length})`
            : ``
        }`;
        const style = `color: ${testPassed ? `#9ECE6A` : `red`}`;

        if (hasAssertionsToReport) {
          console.groupCollapsed(`%c${msg}`, style);
          assertions.forEach((a) =>
            console.log(
              `%c${a.msg || (a.condition ? "passed" : "failed")}`,
              `color: ${a.condition ? "#9ECE6A" : "red"}`
            )
          );
          console.groupEnd();
        } else console.log(`%c${msg}`, style);
      }
      cleanup();

      await runLifecycleCallbacks("afterEach");
    }
    await runLifecycleCallbacks("after");
    console.groupEnd();
  };

  if (only) queueMicrotask(() => _onlyTests.push(testRunner));
  else _tests.push(testRunner);
};
setTimeout(async () => {
  if (!_shouldTest) return;
  _testsStart = Date.now();
  if (_onlyTests.length) _tests = _onlyTests;
  for (const test of _tests) await test();
  console.log(
    `%c🐶 ran ${_testsCount} test${_testsCount > 1 ? "s" : ""} in ${
      Date.now() - _testsStart
    }ms`,
    `color:#E1AF67`
  );
}, 10);

window.useImage = async (description = "great dane puppy") => {
  const accessKey = `uJ5sMo9s-Z5cyM-1NUWGk-_wq6MES6DwjQhrpQyyQkQ`;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?page=1&query=${description}&client_id=${accessKey}`
    );
    if (!res.ok) return `https://fakeimg.pl/200x200`;
    const data = await res.json();
    return data.results[0].urls.thumb;
  } catch (error) {
    return `https://fakeimg.pl/200x200`;
  }
};

// -------------------------- #useId --------------------------
let _id = 1;
window.useId = () => _id++;
useTests(
  "useId",
  () => {
    it("returns incremental numeric ids", () => {
      const ids = [useId(), useId(), useId()];

      assert(typeof ids[0] === "number", "first id a number");
      assert(typeof ids[1] === "number", "second id is a number");
      assert(typeof ids[2] === "number", "third id is a number");
      assert(ids[0] < ids[1], "first id is less than second id");
      assert(ids[1] < ids[2], "second id is less than third id");
    });
  },
  { skip: false, only: false }
);

// -------------------------- #useState --------------------------
let _activeEffect = null;
let _isUpdating = false;
let _pendingEffects = new Set();

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
/*

useState IS the DOM

*/
// let i = 0;
// setInterval(() => {
//   console.log({ i });
//   i = 0;
// }, 500);
window.useState = (obj = {}, parent = null) => {
  if (typeof obj === "function") obj = obj();
  if (obj.__isState) return obj;

  const id = useId();
  obj.__effects = {};

  const runPendingEffects = () => {
    if (_isUpdating) return;
    _isUpdating = true;
    _pendingEffects.forEach((effect) => {
      try {
        effect();
      } catch (err) {
        console.error("An error occurred in an effect:", err);
      }
    });
    _pendingEffects.clear();
    _isUpdating = false;
  };

  /*

Auto updating dynamic lists ala useElementList

it's a special type of list which is demarkated using a special name that allows for dynamic sublists in the middle of it. Essentially the backbone for a dynamic children array where there are dynamic lists in the middle throughout

useState({
  $$children: [child1, child2, () => children3, child4, ...]
})

*/

  const INTERCEPTOR_REGEX = /\$\w+_(?:[\w_]+)+/;

  const dynamicEntries = {};

  // CACHING!
  const interceptors = {
    Get: (key) => {
      if (!interceptors[key]) interceptors[key] = [];
      return interceptors[key];
    },
    Add: (key, fn) => {
      if (!interceptors.IsValidKey(key) || typeof fn !== "function") return;
      interceptors.Get(key).push(fn);
    },
    Remove: (key, fn) =>
      (interceptors[key] = interceptors.Get(key).filter((i) => i !== fn)),
    Run: (key, value) => {
      if (!interceptors.IsValidKey(key)) return;

      const callbacks = interceptors.Get(key);
      if (callbacks.hasValidCache) return callbacks.cache;

      callbacks.unsub = useEffect((i) => {
        if (i === 0)
          return interceptors
            .Get(key)
            .forEach((interceptor) => (value = interceptor(value, proxy)));

        callbacks.hasValidCache = false;
        callbacks.unsub();
      });

      interceptors
        .Get(key)
        .forEach((interceptor) => (value = interceptor(value, proxy)));

      return value;
    },
    GenerateKey: (name, action) => `$${action}_${name}`,
    IsValidKey: (key) => !!key.match(INTERCEPTOR_REGEX),
    HasInterceptors: (key) => interceptors.Get(key).length,
  };

  // you can override get

  const proxy = new Proxy(obj, {
    get: (target, key) => {
      if (reservedObjKeys.includes(key) || typeof key === "symbol")
        return target[key];

      if (interceptors.IsValidKey(key)) return interceptors.Get(key);

      switch (key) {
        case "__isState":
          return true;
        case "__id":
          return id;
        case "__target":
          return target;
        case "__children":
          return (type = Object) =>
            Object.entries(proxy)
              .filter(([k, v]) => {
                return !k.startsWith("__") && v && v instanceof type;
              })
              .map(([_k, v]) => v);
        case "__parent":
          return parent;
        case "__ancestors":
          return (type = Object) => {
            const ancestors = [];
            let current = parent;

            while (current) {
              ancestors.push(current);
              current = current.__parent;
            }

            try {
              new type();
              return ancestors;
            } catch (e) {
              return ancestors.filter(type);
            }
          };
        case "__commonAncestors":
          return (other, type = Object) => {
            const thisAncestors = new Set(proxy.__ancestors(type));
            const otherAncestors = other.__ancestors(type);
            return otherAncestors.filter((ancestor) =>
              thisAncestors.has(ancestor)
            );
          };
        case "__descendants":
          return (type = Object) => {
            const descendants = [];

            const collectDescendants = (node) => {
              for (const child of node.__children()) {
                if (child instanceof type) descendants.push(child);
                collectDescendants(child);
              }
            };

            collectDescendants(proxy);
            return descendants;
          };
        case "__siblings":
          return (type = Object) => {
            if (!parent) return [];

            return parent
              .__children(type)
              .filter((sibling) => sibling !== proxy);
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
        case "__findBF":
          return (fn, type = Object) => {
            const bfsHelper = (nodes) => {
              if (nodes.length === 0) return null;

              const nextLevel = [];
              for (const node of nodes) {
                if (node instanceof type && fn(node.__target)) return node;
                nextLevel.push(...node.__children());
              }

              return bfsHelper(nextLevel);
            };

            return bfsHelper([proxy]);
          };
        case "__findDF":
          return (fn, type = Object) => {
            const dfsHelper = (node) => {
              if (node instanceof type && fn(node.__target)) return node;

              for (const child of node.__children()) {
                const result = dfsHelper(child);
                if (result) return result;
              }

              return null;
            };

            return dfsHelper(proxy);
          };
        case "__root":
          let current = proxy;
          while (current.__parent) current = current.__parent;
          return current;
        case "__leafNodes":
          const leafNodes = [];

          const findLeafNodes = (node) => {
            if (node.__children().length === 0) {
              leafNodes.push(node);
            } else {
              for (const child of node.__children()) {
                findLeafNodes(child);
              }
            }
          };

          findLeafNodes(proxy);
          return leafNodes;
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
        case "__unsub":
          return (key, fn) => interceptors.Remove(key, fn);
      }

      if (key.startsWith("__")) return target[key];

      const interceptorKey = interceptors.GenerateKey(key, "get");
      if (interceptors.HasInterceptors(interceptorKey))
        return interceptors.Run(interceptorKey, target[key]);

      if (key.startsWith("$") && !dynamicEntries[key]) {
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
      ) {
        return target[key].__state
          ? target[key].__state()
          : useState(target[key], proxy);
      }

      return target[key];
    },
    set: (target, key, value) => {
      if (reservedObjKeys.includes(key)) {
        target[key] = value;
        return true;
      }
      if (key.startsWith("__")) return true;
      if (interceptors.IsValidKey(key)) {
        interceptors.Add(key, value);
        return () => {
          console.log("here");
          interceptors[key] = interceptors[key].filter((i) => i !== value);
        };
      }

      const interceptorKey = interceptors.GenerateKey(key, "set");

      if (interceptors.HasInterceptors(interceptorKey))
        return (target[key] = interceptors.Run(interceptorKey, value));

      const isUnchangedFunction =
        typeof value === "function" &&
        typeof target[key] === "function" &&
        value.toString() === target[key].toString();
      if (isUnchangedFunction) return true;
      /*

THE DATA CENTER IS ALL THE PHONES/COMPUTERS IN THE WORLD

offload all the computation to other people's devices
*/
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
        )
          proxy[key].length = value.length;

        if (hasSameKeys && hasSamePrototype /*=&& !Array.isArray(target[key])*/)
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

      if (target.__effects[key]) {
        target.__effects[key].forEach((e) => _pendingEffects.add(e));
        queueMicrotask(runPendingEffects);
      }

      return true;
    },
    deleteProperty: (target, key) => {
      if (key.startsWith("__")) return true;

      const value = proxy[key];
      if (value && typeof value === "object")
        for (const k in value) if (value.hasOwnProperty(k)) delete value[k];

      delete target[key];
      if (target.__effects[key]) {
        target.__effects[key].forEach((e) => _pendingEffects.add(e));
        queueMicrotask(runPendingEffects);
      }
      return true;
    },
  });

  Object.keys(obj).forEach((k) => interceptors.Add(k, obj[k]));

  obj.__state = () => proxy;

  return proxy;
};
useTests("useState", () => {
  // init
  it("init: calls the constructor function if one if passed in", () => {
    let i = 0;
    const _ = useState(() => {
      i++;
      return { i };
    });
    assert(i === 1);
    assert(_.i === i);
  });
  it("init: shallow circular object", () => {
    const circularObj = {};
    circularObj.self = circularObj;
    const _ = useState(circularObj);
    assert(_.self === _);
  });
  it("init: deep circular object", () => {
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
  it("init: if proxy is passed in, returns proxy", () => {
    const a = useState([1]);
    const _ = useState(a);

    assert(_ === a);
  });

  // get
  it("get: returns attributes", () => {
    const _ = useState({ a: "a", b: { c: "c" } });
    assert(_.a === "a");
    assert(_.b.c === "c");
    assert(_.b.c === "c");
  });
  it("get: converts nested objects to state", () => {
    const _ = useState({ a: { b: "b" } });
    assert(_.a.__isState);
  });
  it(`get: works with null`, () => {
    const _ = useState({
      a: null,
    });
    assert(_.a === null);
  });
  it("get: if proxy is in object, doesn't double proxy", () => {
    const a = useState([1]);
    const _ = useState({ a });

    // THIS CAN'T BE TESTED DIRECTLY, MUST VISUALLY VERIFY USING LOG
    // console.log(_.a);
  });
  it(`get: doesn't state-ify dom nodes`, () => {
    _ = useState({ e: document.createElement("div") });
    assert(_.e instanceof HTMLElement && !_.e.__isState);

    _.a = document.createElement("div");
    assert(_.a instanceof HTMLElement && !_.a.__isState);
  });
  it(`get: doesn't state-ify RegExp objects`, () => {
    _ = useState({ e: /a/ });
    assert(_.e.exec("a") && !_.e.__isState);

    _.a = /^/;
    assert(_.a.exec("a") && !_.a.__isState);
  });

  // set
  it("set: assignes attributes", () => {
    const _ = useState({ a: "a", b: { c: "c" } });
    _.a = "b";
    assert(_.a === "b");
    _.b = { c: "d" };
    assert(_.b.c === "d");
    _.b.c = "f";
    assert(_.b.c === "f");
  });
  it(`set: assignes null to object`, () => {
    const _ = useState({
      a: [],
    });
    _.a = null;
    assert(_.a === null);
  });
  it(`set: assignes object to null`, () => {
    const _ = useState({
      a: null,
    });
    _.a = [];
    assert(_.a);
  });
  it("set: assigns shallow circular object", () => {
    const circularObj = {};
    circularObj.self = circularObj;
    const _ = useState({});
    _.circular = circularObj;

    assert(
      _.circular.self === _.circular,
      "circular reference is assigned correctly"
    );
  });
  it("set: assigns deep circular object", () => {
    const circularObj = { a: { b: { c: {} } } };
    circularObj.a.b.c.self = circularObj.a.b;

    const _ = useState({});
    _.nestedCircular = circularObj;

    assert(
      _.nestedCircular.a.b.c.self === _.nestedCircular.a.b,
      "deeply nested circular reference points back to second level"
    );
  });
  it("set: merges nested objects and updates prototype", () => {
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
  it(`set: deeply merges arrays`, () => {
    const _ = useState({
      posts: ["My First Post", "Another Day, Another Post"],
    });
    _.posts = _.posts.filter((p) => p !== _.posts.at(-1));
    assert(_.posts.length === 1);
  });
  it(`set: deeply merges array inline modifiy`, () => {
    const _ = useState({
      posts: ["My First Post", "Another Day, Another Post"],
    });
    _.posts.pop();
    assert(_.posts.length === 1);
  });
  it(`set: handles reserved object keys`, () => {
    _ = useState({});
    try {
      reservedObjKeys.forEach((k) => (_[k] = "a"));
      _.__proto__ = "a";
    } catch (e) {
      assert(false);
    }
  });
  it(`set: doesn't modify keys starting with __`, () => {
    _ = useState({ __effects: "a" });

    _.__effects = "b";

    assert((_.__effects = "a"));
  });

  // delete
  it("deleteProperty: removes old state references", () => {
    const _ = useState([{ e: "a" }]);
    _[0];
    delete _[0];
    _[0] = { e: "b" };

    assert(_[0].e === "b");
  });

  // $
  it("$get", () => {
    const $get_b = (_b, _) => _.a + 1;
    const _ = useState({
      a: 0,
      $get_b,
      $get__c: () => 1,
    });

    assert(_._c === 1);

    assert(_.$get_b.matches([$get_b]));
    assert(_.b === 1);

    _.$get_b = (b, _) => b + 2;

    assert(_.b === 3);

    _.__unsub("$get_b", _.$get_b[1]);
    assert(_.b === 1);
  });
  it("$set", () => {
    const $set_b = (b) => b + 1;
    const _ = useState({
      a: 1,
      b: 0,
      $set_b,
      $set__c: () => 3,
    });

    assert(_._c === undefined);
    _._c = 100;
    assert(_._c === 3);

    assert(_.b === 0);

    _.b = 5;
    assert(_.b === 6);

    _.$set_b = (b, _) => b + _.a;

    _.b = 3;
    assert(_.b === 5);

    _.__unsub("$set_b", _.$set_b[1]);

    _.b = 3;
    assert(_.b === 4);
  });

  // __attributes;
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
  it("__children", () => {
    const b = [1];
    const a = { b };
    const _ = useState(a);
    assert(_.__children()[0][0] === 1);
    assert(_.__children()[0].__isState);
  });
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
    class A {
      constructor(fields) {
        Object.assign(this, fields);
      }
    }
    const obj = {
      a: [
        {
          a: [
            {
              b: {
                a: [{ b: {} }],
              },
            },
          ],
        },
      ],
    };
    const _ = useState(obj);
    const targetNode = _.a[0].a[0].b.a[0];
    const ancestors = targetNode.__ancestors((a) => a.a);
    assert(ancestors.matches([_.a[0].a[0].b, _.a[0], _]));
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
  it("__descendants", () => {
    class A {
      constructor(value) {
        this.value = value;
      }
    }
    const obj = {
      a: new A("descendant1"),
      b: {
        c: {
          d: new A("descendant2"),
        },
        e: new A("descendant3"),
        f: {
          g: "target",
          h: new A("descendant4"),
        },
      },
    };
    const _ = useState(obj);
    const descendants = _.__descendants(A);
    assert(
      descendants.length === 4,
      "returns the correct number of descendants"
    );
    assert(descendants[0].value === "descendant1");
    assert(descendants[1].value === "descendant2");
    assert(descendants[2].value === "descendant3");
    assert(descendants[3].value === "descendant4");
  });
  it("__siblings", () => {
    class A {
      constructor(value) {
        this.value = value;
      }
    }
    const obj = {
      a: new A("sibling1"),
      b: "target",
      c: new A("sibling2"),
      d: new A("sibling3"),
    };
    const _ = useState(obj);
    const targetNode = _.c;
    const siblings = targetNode.__siblings(A);
    assert(siblings.length === 2, "returns the correct number of siblings");
    assert(siblings[0].value === "sibling1", "first sibling is correct");
    assert(siblings[1].value === "sibling3", "second sibling is correct");
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
  it("__findBF", () => {
    class A {
      constructor(value) {
        this.value = value;
      }
    }
    const obj = {
      a: {
        b: "not this",
        c: {
          d: "not this either",
        },
      },
      e: {
        f: "target",
      },
      g: new A("special"),
      h: {
        i: new A("target"),
      },
    };
    const _ = useState(obj);
    const result1 = _.__findBF((node) => node.f === "target");
    assert(
      result1 && result1.f === "target",
      "finds a node in a simple hierarchy"
    );
    const result2 = _.__findBF((node) => node.nonexistent === "target");
    assert(result2 === null, "no node matches the condition");
    const result3 = _.__findBF((node) => node.value === "target", A);
    assert(
      result3 && result3.value === "target",
      "finds node of a specific type"
    );
    const result4 = _.__findBF((node) => node.value === "special", A);
    assert(
      result4 && result4.value === "special",
      "ensures first match is found at correct level"
    );
  });
  it("__findDF", () => {
    class A {
      constructor(value) {
        this.value = value;
      }
    }
    const obj = {
      a: {
        b: "not this",
        c: {
          d: "not this either",
        },
      },
      e: {
        f: "target",
      },
      g: new A("special"),
      h: {
        i: new A("target"),
      },
    };
    const _ = useState(obj);
    const result1 = _.__findDF((node) => node.f === "target");
    assert(
      result1 && result1.f === "target",
      "finds node with key 'f' equal to 'target'"
    );
    const result2 = _.__findDF((node) => node.nonexistent === "target");
    assert(result2 === null, "returns null if no node matches the condition");
    const result3 = _.__findDF((node) => node.value === "target", A);
    assert(
      result3 && result3.value === "target",
      "finds node of a specific type"
    );
    const result4 = _.__findDF((node) => node.value === "special", A);
    assert(
      result4 && result4.value === "special",
      "ensures depth-first search nature"
    );
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
  it("__leafNodes", () => {
    const obj = {
      a: {
        b: {
          c: "leaf 1",
        },
        d: {
          e: "leaf 2",
        },
      },
    };
    const _ = useState(obj);
    const leafNodes = _.__leafNodes;
    assert(leafNodes.length === 2, "correct number of leaf nodes");
    assert(leafNodes[0].c === "leaf 1", "first leaf node is correct");
    assert(leafNodes[1].e === "leaf 2", "second leaf node is correct");
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
    assert(
      !_.a.__children().includes(targetNode),
      "target node is no longer in the tree"
    );
  });
});

// -------------------------- #useEffect --------------------------
window.useEffect = (fn, ...deps) => {
  let i = 0;
  const effect = () => {
    effect.cleanup = () => {};
    effect.unsubCallbacks = new Set();
    _activeEffect = effect;
    let result;
    try {
      deps.forEach((fn) => fn());
      result = fn(i) || (() => {});
      if (result instanceof Promise) {
        result
          .then((result) => {
            if (typeof result === "function") effect.cleanup = result;
          })
          .catch((err) =>
            console.error("an error occurred in an async effect:", err)
          )
          .finally(() => (_activeEffect = null));
      } else if (typeof result === "function") effect.cleanup = result;
    } catch (err) {
      console.error("an error occurred in an effect:", err);
    } finally {
      if (!(result instanceof Promise)) _activeEffect = null;
    }
    i++;
  };
  effect();

  return () => {
    effect.cleanup();
    effect.unsubCallbacks.forEach((fn) => fn());
  };
};
useTests(
  "useEffect",
  () => {
    it("runs effect and dependency functions on declaration", () => {
      let a = 0,
        b = 0,
        c = 0;
      useEffect(
        () => a++,
        () => b++,
        () => c++
      );
      return a === 1 && b === 1 && c === 1;
    });
    it("returns a cleanup function which calls the function returned from the sync effect", async () => {
      let i = 0;
      let cleanup = useEffect(() => {
        return () => i++;
      });
      assert(i === 0);
      cleanup();
      assert(i === 1);
    });
    it("returns a cleanup function which calls the function returned from the async effect", async () => {
      let i = 0;
      let cleanup = () => {};
      cleanup = useEffect(async () => {
        await sleep(1);
        return () => i++;
      });
      assert(i === 0);
      await sleep(1);
      cleanup();
      assert(i === 1);
    });
    it("gracefully handles errors thrown in a sync effect/dependency and outputs error to console", async ({
      cleanup,
    }) => {
      const _consoleError = console.error;
      cleanup(() => (console.error = _consoleError));
      let errorMessage;
      console.error = (...args) => (errorMessage = args.join(""));
      // effect
      useEffect(() => {
        throw `bad effect`;
      });
      assert(errorMessage.includes(`bad effect`));

      // dependency
      useEffect(
        () => {},
        () => {
          throw `bad dependency`;
        }
      );
      assert(errorMessage.includes(`bad dependency`));
    });
    it("gracefully handles errors thrown in an async effect and outputs error to console", async ({
      cleanup,
    }) => {
      const _consoleError = console.error;
      cleanup(() => (console.error = _consoleError));
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
      await sleep(1);
      return errorMessage.includes(`bad async effect`);
    });
  },
  { skip: false, only: false }
);
useTests(
  "useEffect/State integration",
  () => {
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
      await sleep(1);
      assert(i === 1);

      _.newField = 3;
      await sleep(1);
      assert(i === 1);

      cleanup();

      _.a = true;
      await sleep(1);
      assert(i === 1);
    });
    it("async: runs once on change, allows for cleanup", async () => {
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
      await sleep(1);
      assert(i === 2);

      _.newField = 3;
      await sleep(1);
      assert(i === 2);

      cleanup();

      _.a = true;
      await sleep(1);
      assert(i === 2);
    });

    it("doesn't register dependency for assignment", async () => {
      let i = 0;
      const _ = useState({ a: 0 });
      useEffect(() => {
        _.a += 0;
        i++;
      });

      await sleep(1);
      assert(i === 1);
    });

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
      await sleep(1);
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
      await sleep(1);
      assert(i === 2);
      assert(j === 1);
      assert(k === 1);
    });

    it("runs for Object.assign", async () => {
      const _ = useState({ a: true });

      let i = 0;
      useEffect(() => {
        _.a;
        i++;
      });

      Object.assign(_, { a: false });

      await sleep(1);
      assert(i === 2);
    });
    it("runs for array length update", async () => {
      const _ = useState({ a: [] });

      let i = 0;
      useEffect(() => {
        _.a.length;
        i++;
      });

      _.a.push("a");

      await sleep(1);
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

      await sleep(1);
      assert(i === 1);
    });
    it("doesn't run for array reassign", async () => {
      const _ = useState({ a: [1, 2, 3] });

      let i = 0;
      useEffect(() => {
        _.a;
        i++;
      });

      _.a = [3, 4, 5];

      await sleep(1);
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
      await sleep(1);
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
      await sleep(1);
      assert(i === 1);
    });

    it("runs on delete", async () => {
      const _ = useState({ a: "a" });

      let i = 0;
      useEffect(() => {
        _.a;
        i++;
      });

      delete _.a;

      await sleep(1);
      assert(i === 2);
    });
    it("runs on delete for deeply nested objects", async () => {
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

      await sleep(1);
      assert(aCount === 2);
      assert(bCount === 2);
      assert(cCount === 2);
    });

    it("$: computed", async () => {
      const _ = useState({ a: 0, $b: (_) => _.a + 1 });
      _.$c = (_) => _.a + 2;

      assert(_.$b === 1);
      assert(_.$c === 2);

      _.a = 2;

      await sleep(1);
      assert(_.$b === 3);
      assert(_.$c === 4);
    });
    it("$: stateful list items", async () => {
      const _ = useState({
        a: [{ value: "a" }, { value: "b" }],
        $b: [
          1,
          [(_) => _.a, (e) => e],
          2,
          (_) => !!_.a.length && _.a[0].value,
          3,
          () => [4, [5]],
        ],
      });

      assert(_.$b.matches([1, ..._.a, 2, "a", 3, 4, 5]));

      _.a = [{ value: "c" }];
      await sleep(1);

      assert(_.$b.matches([1, _.a[0], 2, "c", 3, 4, 5]));

      _.a = [];
      await sleep(1);
      assert(_.$b.matches([1, 2, 3, 4, 5]));
    });

    // OPTIONAL: DO NOT TRIGGER WHEN
    // func has same code
    // nothing changed
  },
  { skip: false, only: false }
);

// -------------------------- #useRoot --------------------------
window.useRoot = (fn) => {
  const _ = _activeEffect;
  _activeEffect = null;
  const result = fn();
  _activeEffect = _;
  return result;
};
useTests("useRoot", () => {
  let _;
  beforeEach(() => (_ = useState({ name: "finny", age: 4 })));
  it(`calls the function inside`, () => {
    let i = 0;
    useRoot(() => i++);
    assert(i === 1);
  });
  it(`isolates the function from useEffect state observers`, async () => {
    let i = 0;
    useEffect(() => {
      i++;
      useRoot(() => _.name);
    });
    _.name = "finn";
    await sleep(1);
    assert(i === 1);
  });
});

// -------------------------- #useRenderEvents --------------------------
const useRenderEvents = () => {
  new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.type === "childList") {
        const cascadeEvent = (node, event) => {
          if (node.nodeType !== Node.TEXT_NODE)
            Array.from(node.children).forEach((c) => cascadeEvent(c, event));
          node.dispatchEvent(new CustomEvent(event, { bubbles: false }));
        };

        if (m.addedNodes.length) {
          Array.from(m.addedNodes).forEach((node) => {
            cascadeEvent(node, "mount");
          });
          m.target.dispatchEvent(
            new CustomEvent("childadd", {
              bubbles: true,
              detail: { child: m.addedNodes[0] },
            })
          );
        }

        if (m.removedNodes.length) {
          Array.from(m.removedNodes).forEach((node) =>
            cascadeEvent(node, "unmount")
          );

          m.target.dispatchEvent(
            new CustomEvent("childremove", {
              bubbles: true,
              detail: { child: m.removedNodes[0] },
            })
          );
        }
      } else if (m.type === "characterData")
        if (m.target.parentElement)
          m.target.parentElement.dispatchEvent(
            new CustomEvent("textchange", {
              bubbles: true,
              detail: { textNode: m.target, action: "change" },
            })
          );
    });
  }).observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
};
useRenderEvents();
useTests("useRenderer", () => {
  it("dispatches childadd event when children are added", async () => {
    let i = 0;
    div.addEventListener("childadd", () => i++);
    div.append(document.createElement("div"));
    await sleep(1);
    assert(i === 1);
  });
  it("dispatches childremove event when children are removed", async () => {
    div.append(document.createElement("div"));

    let i = 0;
    div.addEventListener("childremove", () => i++);
    div.innerHTML = ``;
    await sleep(1);
    assert(i === 1);
  });
  it("dispatches textchange event when textContent of child is modified", async () => {
    div.textContent = `hi`;

    let i = 0;
    div.addEventListener("textchange", () => i++);
    div.childNodes[0].data = "cool";
    await sleep(1);
    assert(i === 1);
  });
});

// -------------------------- #useType --------------------------
let _types = {};
window.useType = (type, component) => {
  return typeof type === "string"
    ? (_types[type] = component)
    : Object.assign(_types, type);
};

// -------------------------- #useElement --------------------------

window.useElement = (type, props = {}, ...children) => {
  let element;

  if (type === undefined) {
    element = document.createDocumentFragment();
    element.append(...children.map(useElementChild));
    return element;
  } else if (typeof type === "function") {
    return useElementChild(type(props || {}, ...children));
  } else if (_types[type]) return _types[type](props, ...children);
  else if (type === "list")
    return useElementList(props["_"] || [], children[0]);
  else {
    element = document.createElement(type);
    if (element instanceof HTMLUnknownElement) {
      element = document.createElement(type.slice(-1) === "_" ? "span" : "div");
      element.name = type.replace(/_$/g, "");
      element.setAttribute("name", element.name);
    }
    if (!props) props = {};
    element.useProps(props);
    element.append(...children.map(useElementChild));
    return element;
  }
};
window.React = { createElement: useElement };
useTests(
  "useElement",
  () => {
    afterEach(() => (_types = {}));
    it("returns a document fragment if type is undefined", () => {
      const element = useElement(
        undefined,
        {},
        document.createElement("div"),
        "yo"
      );
      assert(element instanceof DocumentFragment);
      assert(element.childNodes.length === 2);
    });
    it("calls the component with correct params if type if a function", () => {
      let i = 0;
      const Component = () => {
        i++;
        return <a>hi</a>;
      };
      const element = <Component />;

      assert(i === 1, "component function was called");
      assert(
        element instanceof HTMLAnchorElement,
        "returns the element from the component function"
      );
    });
    it("works with Component children", () => {
      const Component = (_, ...children) => {
        return <a>{children}</a>;
      };
      const element = <Component>hello{span}</Component>;

      assert(element.childNodes.length === 2);
      assert(element.childNodes[0].data === "hello");
      assert(element.childNodes[1] === span);
    });
    it("works with nested Component children", () => {
      const Component = (_, ...children) => {
        return <a>{[children]}</a>;
      };
      const element = <Component>hello{span}</Component>;

      assert(element.childNodes.length === 2);
      assert(element.childNodes[0].data === "hello");
      assert(element.childNodes[1] === span);
    });
    it("handles undefined, null, false component results", () => {
      [undefined, null, false].forEach((v) => {
        const Component = () => v;
        const element = <Component />;
        assert(element.nodeType === Node.TEXT_NODE);
        assert(element.data === "");
      });
    });
    it("returns the html element with the type provided", () => {
      assert(useElement("a"), "creates an <a> element");
      assert(useElement("div"), "creates an <div> element");
      assert(useElement("span"), "creates an <span> element");
      assert(useElement("h1"), "creates an <h1> element");
    });
    it("returns a div with the name attribute set to a non-html custom type", () => {
      const element = useElement("dog");
      assert(element instanceof HTMLDivElement, "element is a div");
      assert(element.name === "dog", "element.name is set");
      assert(
        element.getAttribute("name") === "dog",
        "element's name attribute is set"
      );
    });
    it("returns a span with the name_ attribute set to a non-html custom type", () => {
      const element = useElement("dog_");
      assert(element instanceof HTMLSpanElement, "element is a span");
      assert(element.name === "dog", "element.name is set");
      assert(
        element.getAttribute("name") === "dog",
        "element's name attribute is set"
      );
    });
    it("returns the registered type component with correct params", () => {
      useType("x", () => useElement("first"));
      useType({ y: () => useElement("second"), z: () => useElement("third") });
      assert(useElement("x").name === "first");
      assert(useElement("y").name === "second");
      assert(useElement("z").name === "third");
    });
    it("handles dynamic lists", () => {
      const element = useElement("list", { _: [1, 2, 3] }, (c) => (
        <span>{c}</span>
      ));
      assert(element.children.length === 3);
      assert(element.textContent === "123");
    });
    it("handles dynamic children", async () => {
      const _ = useState({ count: 0 });
      const element = useElement("div", { id: "finny" }, () => _.count);
      div.append(element);

      _.count++;
      await sleep(1);
      assert(element.textContent === "1");
    });
    it("attaches props and children to element", () => {
      const element = useElement("div", { id: "finny" }, "hello world");
      assert(element.id === "finny");
      assert(element.textContent === "hello world");
    });
  },
  { only: false }
);

// -------------------------- #useElementChild --------------------------

window.useElementChild = (child) => {
  if (child instanceof Node) return child;
  else if ([undefined, null, false].includes(child))
    return document.createTextNode("");
  else if (Array.isArray(child)) {
    const frag = document.createDocumentFragment();
    frag.append(...child.map(useElementChild));
    return frag;
  } else if (typeof child === "object")
    return document.createTextNode(JSON.circularStringify(child));
  else if (typeof child === "function") {
    let dynamicChildren;
    const cleanup = useEffect((i) => {
      if (i > 0 && !dynamicChildren.some((e) => document.contains(e)))
        return cleanup();

      let newDynamicChildren = useElementChild(child());
      if (newDynamicChildren.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
        newDynamicChildren = Array.from(newDynamicChildren.childNodes);
      else newDynamicChildren = useArray(newDynamicChildren);

      if (dynamicChildren) {
        for (let i = 0; i < dynamicChildren.length - 1; i++)
          dynamicChildren[i].remove();
        dynamicChildren.at(-1).replaceWith(...newDynamicChildren);
      }
      dynamicChildren = newDynamicChildren;
    });

    if (dynamicChildren.length === 1) return dynamicChildren[0];
    else {
      const frag = document.createDocumentFragment();
      frag.append(...dynamicChildren);
      return frag;
    }
  } else return document.createTextNode(child);
};
useTests("useElementChild", () => {
  it("undefined, null, false", () => {
    [undefined, null, false].forEach((child) => {
      const childElement = useElementChild(child);
      assert(childElement.data === "");
    });
  });
  it("elements", () => {
    const childElement = useElementChild(div);
    assert(childElement === div);
  });
  it("fragments", () => {
    const childElement = useElementChild(frag);
    assert(childElement === frag);
  });
  it("strings", () => {
    const childElement = useElementChild("dog");
    assert(childElement.data === "dog");
  });
  it("numbers", () => {
    const childElement = useElementChild("dog");
    assert(childElement.data === "dog");
  });
  it("booleans", () => {
    const childElement = useElementChild(true);
    assert(childElement.data === "true");
  });
  it("objects", () => {
    const obj = { dog: "cat" };
    const childElement = useElementChild(obj);
    assert(childElement.data === JSON.circularStringify(obj));
  });
  it("arrays", () => {
    const childElement = useElementChild(["hi", div, 5, null]);
    assert(childElement.nodeType === Node.DOCUMENT_FRAGMENT_NODE);

    const childNodes = childElement.childNodes;
    assert(childNodes.length === 4);
    assert(childNodes[0].data === "hi");
    assert(childNodes[1] === div);
    assert(childNodes[2].data === "5");
    assert(childNodes[3].data === "");
  });
  it("nested arrays", () => {
    const childElement = useElementChild(["hi", [div, [() => 5]]]);
    assert(childElement.nodeType === Node.DOCUMENT_FRAGMENT_NODE);

    const childNodes = childElement.childNodes;
    assert(childNodes.length === 3);
    assert(childNodes[0].data === "hi");
    assert(childNodes[1] === div);
    assert(childNodes[2].data === "5");
  });
  it("functions", () => {
    const childElement = useElementChild(() => div);
    assert(childElement === div);
  });
  it("dynamic functions", async () => {
    _.count = 0;
    div.append(
      useElementChild(() => {
        if (_.count === 0) return useElement("x");
        else if (_.count === 1) return useElement("y");
      })
    );
    assert(div.firstChild.name === "x");
    _.count++;
    await sleep(1);
    assert(div.firstChild.name === "y");
    _.count++;
    await sleep(1);
    assert(div.firstChild.nodeType === Node.TEXT_NODE);

    div.remove();
    _.count = 0;
    await sleep(1);
    assert(div.firstChild.nodeType === Node.TEXT_NODE);
  });
});

// -------------------------- #useElementList --------------------------
window.useElementList = (list, itemFn) => {
  const frag = document.createDocumentFragment();
  const start = document.createTextNode(``);
  const end = document.createTextNode(``);
  frag.append(start, end);

  const cleanup = useEffect(async (i) => {
    if (i > 0) {
      await sleep(1);
      if (!document.contains(start)) return cleanup();
    }
    const generatedList = useFunctionResult(list);
    if (start.nextSibling === end) {
      const nodes = generatedList.map((_, i) =>
        useRoot(() =>
          useElementChild(
            () => generatedList[i] && itemFn(generatedList[i], i, generatedList)
          )
        )
      );
      return start.after(...nodes);
    }

    const elements = [];
    let element = start.nextSibling;

    while (element) {
      elements.push(element);
      if (element.nextSibling === end) break;
      element = element.nextSibling;
    }

    for (let i = elements.length; i < generatedList.length; i++) {
      element.after(
        useRoot(() =>
          useElementChild(
            () =>
              generatedList[i] !== undefined &&
              itemFn(generatedList[i], i, generatedList)
          )
        )
      );
      element = element.nextSibling;
    }
    for (let i = generatedList.length; i < elements.length; i++)
      elements[i].remove();
  });

  return frag;
};
useTests("useElementList", () => {
  it("returns a fragment list with generated children", async () => {
    const _ = useState(["x", "y"]);
    div.append(
      useElementList(
        () => _,
        (e) => useElement(e)
      )
    );

    assert(div.children.length === 2);
    assert(div.children[0].name === _[0]);
    assert(div.children[1].name === _[1]);
  });
  it("adds new element when list item is added", async () => {
    const _ = useState(["x", "y"]);
    div.append(
      useElementList(
        () => _,
        (e) => useElement(e)
      )
    );

    _.push("z");
    await sleep(1);

    assert(div.children.length === 3);
    assert(div.children[0].name === _[0]);
    assert(div.children[1].name === _[1]);
    assert(div.children[2].name === _[2]);
  });
  it("updates existing element when list item is modified", async () => {
    const _ = useState(["x", "y"]);
    div.append(
      useElementList(
        () => _,
        (e) => useElement(e)
      )
    );

    _[1] = "z";
    await sleep(1);

    assert(div.children.length === 2);
    assert(div.children[0].name === _[0]);
    assert(div.children[1].name === _[1]);
  });
  it("removes existing element when list item is removed inline", async () => {
    const _ = useState(["x", "y"]);
    div.append(
      useElementList(
        () => _,
        (e) => useElement(e)
      )
    );

    _.pop();
    await sleep(1);

    assert(div.children.length === 1);
    assert(div.children[0].name === _[0]);
  });
  it("removes existing element when list item is removed by new list assignment", async () => {
    const _ = useState({ a: ["x", "y"] });
    div.append(
      useElementList(
        () => _.a,
        (e) => useElement(e)
      )
    );

    _.a = _.a.filter((f) => f !== "x");
    await sleep(1);

    assert(div.children.length === 1);
    assert(div.children[0].name === _.a[0]);
  });
  it("stops updating list once it's been unmounted", () => {
    const _ = useState(["x", "y"]);
    div.append(
      useElementList(
        () => _,
        (e) => useElement(e)
      )
    );

    div.remove();
    _.pop();

    assert(div.children.length === 2);
  });
  it("re-runs list generator function when dependencies change", async () => {
    const _ = useState(["x"]);
    div.append(
      useElementList(
        () => {
          return _.filter((e) => typeof e === "string");
        },
        (e) => useElement(e)
      )
    );

    _.push("y");
    await sleep(1);

    assert(div.children.length === 2);
    assert(div.children[0].name === _[0]);
    assert(div.children[1].name === _[1]);
  });
  it("doesn't re-run child when coorisponding list item is deleted", async () => {
    const _ = useState(["x"]);
    let i = 0;
    div.append(
      useElementList(_, (e) => {
        i++;
        useElement(e);
      })
    );

    _[0] = undefined;
    await sleep(1);

    assert(i === 1);
  });
});

// -------------------------- #EventTarget.prototype.addEventListener --------------------------
const _addEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type, listener, options) {
  if (type === "resize")
    new ResizeObserver(() =>
      this.dispatchEvent(new CustomEvent("resize"))
    ).observe(this);

  _addEventListener.call(this, type, listener, options);
};

// -------------------------- #Element.prototype.useProps --------------------------
Object.defineProperty(Element.prototype, "useProps", {
  value: function (props) {
    Object.entries(props).forEach(([key, value]) => {
      const subKeys = key === "_" ? ["_"] : key.split("_");
      subKeys.forEach((key) => {
        if (key === "effects")
          this.addEventListener("mount", () =>
            useArray(value).forEach((fn) => this.useEffect((i) => fn(i, this)))
          );
        else if (key === "s") {
          const styles = useArray(value).filter((v) => v);
          for (const style of styles) {
            let styleAST;
            if (typeof style === "function")
              this.useEffect(() => {
                if (styleAST) this.classList.remove(styleAST.class);
                styleAST = useStyle(style(this) || "");
                this.classList.add(styleAST.class);
                const css = styleAST.toCSS();
                if (!GLOBAL_STYLE.textContent.includes(css))
                  GLOBAL_STYLE.textContent += css + "\n\n";
              });
            else {
              styleAST = useStyle(style);
              this.classList.add(styleAST.class);

              const css = styleAST.toCSS();
              if (!GLOBAL_STYLE.textContent.includes(css))
                GLOBAL_STYLE.textContent += css + "\n\n";
            }
          }
        } else if (typeof value === "function")
          if (key.match(T.HTML_EVENT_PROP))
            this.addEventListener(key.slice(2), value);
          else if (key === "class") {
            let oldClasses = [];
            this.useEffect((i) => {
              const newClasses = value(i, this).split(/\s+/);
              this.classList.remove(...oldClasses);
              this.classList.add(...newClasses);
              oldClasses = newClasses;
            });
          } else this.bind(key, value);
        else if (key === "class") this.classList.add(value.split(/\s+/));
        else this[key] = value;

        if (key === "name") this.setAttribute(key, useFunctionResult(value));
      });
    });

    return this;
  },
  enumerable: false,
});
useTests("Element.prtotype.useProps", () => {
  it("attaches props correctly", async () => {
    let i = 0;
    const _ = useState({ name: "finny", age: 20 });
    div.useProps({
      onclick: () => i++,
      onkeydown: () => (i += 2),
      id: "dog",
      contenteditable: "true",
      effects: [
        () => {
          _.name;
          i += 3;
        },
        () => {
          _.age;
          i += 4;
        },
      ],
    });

    assert(i === 7);
    _.name = "gracie";
    await sleep();
    assert(i === 10);
    _.age = 9;
    await sleep();
    assert(i === 14);

    assert(div.id === "dog");
    assert(div.contenteditable === "true");
    div.dispatchEvent(new MouseEvent("click"));
    assert(i === 15);
    div.dispatchEvent(new MouseEvent("keydown"));
    assert(i === 17);
  });
  it("compiles and wires up 's' style prop", () => {
    div.useProps({ s: `w:100px h:100px @:(1s |50%| tf:scale(20px))` });
    assert(div.className.length);
    assert(GLOBAL_STYLE.textContent.includes(div.className));
    assert(GLOBAL_STYLE.textContent.includes(`width: 100px;`));
    assert(GLOBAL_STYLE.textContent.includes(`height: 100px;`));
  });
  it("compiles and wires up stateful 's' style prop", async () => {
    _.color = "red";
    div.useProps({ s: () => `fc:${_.color}` });

    const firstClassName = div.className;
    assert(div.className);
    assert(GLOBAL_STYLE.textContent.includes(div.className));
    assert(GLOBAL_STYLE.textContent.includes("color: red;"));
    _.color = "blue";
    await sleep();
    assert(div.classList.length === 1);
    assert(div.className !== firstClassName);
    assert(GLOBAL_STYLE.textContent.includes(div.className));
    assert(GLOBAL_STYLE.textContent.includes("color: blue;"));
  });
  it("compiles and wires up multiple 's' style props", async () => {
    div.useProps({ s: [() => `bg:green`, "w:20px"] });
    assert(GLOBAL_STYLE.textContent.includes("width: 20px;"));
    assert(GLOBAL_STYLE.textContent.includes("background: green;"));
  });
  it("doesn't render the same styles twice", async () => {
    div.useProps({ s: [`w:100px`, `w:100px`] });
    assert(GLOBAL_STYLE.textContent.split(`width: 100px`).length === 2);
  });
  it("allows multiple props be defined in single _ separed key", () => {
    let i = 0;
    div.useProps({
      onclick_ontextchange: () => i++,
      id_name: "dog",
    });
    div.dispatchEvent(new CustomEvent("click"));
    assert(i === 1);
    div.dispatchEvent(new CustomEvent("textchange"));
    assert(i === 2);

    assert(div.id === "dog");
    assert(div.name === "dog");
  });
  it("name prop overrides useElement custom tag", () => {
    const e = useElement("abc");
    e.useProps({ name: "def" });

    assert(e.getAttribute("name") === "def");
    assert(e.name === "def");
  });
  it("stateful name prop overrides useElement custom tag", async () => {
    const e = useElement("abc");
    const _ = useState({ name: "def" });
    e.useProps({ name: () => _.name });

    assert(e.getAttribute("name") === "def");
    assert(e.name === "def");

    _.name = "ghi";
    await sleep(1);

    assert(e.getAttribute("name") === "ghi");
    assert(e.name === "ghi");
  });
});

// -------------------------- #Element.prototype.useEffect --------------------------
Object.defineProperty(Element.prototype, "useEffect", {
  value: function (fn, ...deps) {
    this.addEventListener("unmount", useEffect(fn, ...deps));
  },
  enumerable: false,
});
useTests("Element.prototype.useEffect", () => {
  it("stops running the effect when the element is unmounted", async () => {
    let i = 0;
    div.useEffect(() => {
      i++;
      _.name;
    });
    assert(i == 1);
    _.name = "a";
    await sleep(10);
    assert(i === 2);

    div.remove();
    await sleep(1);
    _.name = "b";
    await sleep(1);

    assert(i === 2);
  });
});

// -------------------------- #Element.prototype.bind --------------------------
Object.defineProperty(Element.prototype, "bind", {
  value: function (key, _value) {
    this.useEffect(async (i) => {
      if (i > 0) {
        await sleep(1);
        if (!document.contains(this)) return;
      }

      let value = typeof _value === "function" ? _value(i, this) : _value;

      if (key === "scrollTop")
        if (key in this || typeof value !== "string") this[key] = value;
        else this.setAttribute(key, value);

      if (key === "name") this.setAttribute(key, value);

      const mountOnlyFields = [
        "scrollTop",
        "scrollLeft",
        "scrollWidth",
        "scrollHeight",
        "clientWidth",
        "clientHeight",
        "offsetWidth",
        "offsetHeight",
        "offsetTop",
        "offsetLeft",
      ];
      if (i === 0 && mountOnlyFields.includes(key))
        requestAnimationFrame(() => {
          this[key] = value;
        });
    });
  },
  enumerable: false,
});
useTests("Element.prototype.bind", () => {
  it("dynamically updates the element's field based on effect (non-attribute)", async () => {
    _.count = 0;
    div.bind("innerHTML", () => _.count);
    assert(div.innerHTML === "0");
    assert(div.getAttribute("innerHTML") === null);
    _.count++;
    await sleep(1);
    assert(div.innerHTML === "1");
    assert(div.getAttribute("innerHTML") === null);
  });
  it("dynamically updates the element's field based on effect (attribute)", async () => {
    _.name = "finny";
    div.bind("name", () => _.name);
    assert(div.name === undefined);
    assert(div.getAttribute("name") === "finny");
    _.name = "abby";
    await sleep(1);
    assert(div.name === undefined);
    assert(div.getAttribute("name") === "abby");
  });
});

// -------------------------- #Element.prototype._type --------------------------
Object.defineProperty(Element.prototype, "_type", {
  value: function (...items) {
    this.focus(); // Focus the element before typing

    const dispatchEvents = (char) => {
      const events = ["keydown", "keypress", "keyup", "input", "textchange"];
      events.forEach((eventType) => {
        const event = new KeyboardEvent(eventType, {
          bubbles: true,
          cancelable: true,
          key: char,
        });
        this.dispatchEvent(event);
      });
    };

    const specialKeys = [
      "Backspace",
      "Tab",
      "Enter",
      "Shift",
      "Control",
      "Alt",
      "Pause",
      "CapsLock",
      "Escape",
      "Space",
      "PageUp",
      "PageDown",
      "End",
      "Home",
      "ArrowLeft",
      "ArrowUp",
      "ArrowRight",
      "ArrowDown",
      "PrintScreen",
      "Insert",
      "Delete",
      "Meta", // Often represents the Command key on Mac keyboards and the Windows key on Windows keyboards
      "ContextMenu",
      "NumLock",
      "ScrollLock",
      "VolumeMute",
      "VolumeDown",
      "VolumeUp",
      "MediaTrackPrevious",
      "MediaTrackNext",
      "MediaPlayPause",
      "MediaStop",
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "F6",
      "F7",
      "F8",
      "F9",
      "F10",
      "F11",
      "F12",
      "NumLock",
      "ScrollLock",
    ];

    for (const item of items)
      if (specialKeys.includes(item)) {
        dispatchEvents(item);
      } else {
        Array.from(item).forEach((char) => {
          dispatchEvents(char);
        });
      }
  },
  enumerable: false,
});
useTests("Element.prototype._type", () => {
  it("fires correct events", async () => {
    let typedText = "";
    input.addEventListener("keydown", (e) => (typedText += e.key));
    input._type("Hello");
    await sleep(1);
    assert(typedText === "Hello");
  });
});

// // -------------------------- #Node.prototype.click --------------------------
// Object.defineProperty(Node.prototype, "click", {
//   value: function (x, y) {
//     console.log("HERE");

//     this.focus(); // Focus the element before clicking

//     // Calculate relative coordinates
//     const rect = this.getBoundingClientRect();
//     const relativeX = x !== undefined ? x : rect.width / 2; // Default to center if not specified
//     const relativeY = y !== undefined ? y : rect.height / 2; // Default to center if not specified

//     const absoluteX = rect.left + relativeX;
//     const absoluteY = rect.top + relativeY;

//     const event = new MouseEvent("click", {
//       bubbles: true,
//       cancelable: true,
//       clientX: absoluteX,
//       clientY: absoluteY,
//       screenX: window.screenLeft + absoluteX,
//       screenY: window.screenTop + absoluteY,
//       pageX: absoluteX + window.pageXOffset,
//       pageY: absoluteY + window.pageYOffset,
//     });
//     this.dispatchEvent(event);
//   },
//   enumerable: false,
// });

// // Test for Element.prototype.click with relative coordinates
// useTests(
//   "Element.prototype.click",
//   () => {
//     it("fires a click event at specified relative coordinates", async () => {
//       div.style.width = "200px";
//       div.style.height = "100px"; // Ensure the element has size for coordinates to make sense

//       let clickedAt = null;
//       div.addEventListener("click", (event) => {
//         clickedAt = { x: event.clientX, y: event.clientY };
//       });

//       console.log(div.click);
//       div.click(50, 50); // Click at relative position (50, 50)
//       await sleep(1);

//       console.log(clickedAt);
//       assert(clickedAt !== null);
//       assert(
//         clickedAt.x === 50 && clickedAt.y === 50,
//         "Click coordinates did not match the expected values."
//       );
//     });
//   },
//   { only: true }
// );

// -------------------------- #Element.prototype.dblClick --------------------------
Object.defineProperty(Element.prototype, "dblClick", {
  value: function () {
    this.focus(); // Focus the element before double clicking

    const event = new MouseEvent("dblclick", {
      bubbles: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
  },
  enumerable: false,
});

// Test for Element.prototype.dblClick
useTests("Element.prototype.dblClick", () => {
  it("fires a double click event", async () => {
    let dblClicked = false;
    input.addEventListener("dblclick", () => (dblClicked = true));
    input.dblClick();
    await sleep(1);
    assert(dblClicked === true);
  });
});

// // -------------------------- #Element.prototype.moveMouse --------------------------
// Object.defineProperty(Element.prototype, "moveMouse", {
//   value: function (start, end, options = {}) {
//     const steps = options.steps || 10; // Number of intermediate steps
//     const buttons = options.buttons || 0; // Mouse buttons pressed
//     const rect = this.getBoundingClientRect(); // Element's position and size

//     const deltaX = (end.x - start.x) / steps;
//     const deltaY = (end.y - start.y) / steps;

//     for (let i = 0; i <= steps; i++) {
//       const clientX = rect.left + start.x + deltaX * i;
//       const clientY = rect.top + start.y + deltaY * i;
//       const screenX = clientX + window.screenLeft;
//       const screenY = clientY + window.screenTop;
//       const pageX = clientX + window.pageXOffset;
//       const pageY = clientY + window.pageYOffset;

//       const eventOptions = {
//         bubbles: true,
//         cancelable: true,
//         clientX: clientX,
//         clientY: clientY,
//         screenX: screenX,
//         screenY: screenY,
//         pageX: pageX,
//         pageY: pageY,
//         buttons: buttons,
//         ctrlKey: options.ctrlKey || false,
//         shiftKey: options.shiftKey || false,
//         altKey: options.altKey || false,
//         metaKey: options.metaKey || false,
//         movementX: deltaX,
//         movementY: deltaY,
//       };

//       const mouseMoveEvent = new MouseEvent("mousemove", eventOptions);
//       this.dispatchEvent(mouseMoveEvent);
//     }
//   },
//   enumerable: false,
// });
// useTests(
//   "Element.prototype.moveMouse",
//   () => {
//     it("simulates mouse movements", async () => {
//       let movements = [];
//       const target = document.createElement("div");
//       document.body.appendChild(target); // Append to body to ensure it's part of the document

//       target.addEventListener("mousemove", (event) => {
//         movements.push({ x: event.clientX, y: event.clientY });
//       });

//       const start = { x: 0, y: 0 };
//       const end = { x: 100, y: 100 };
//       const steps = 5;
//       target.moveMouse(start, end, { steps: steps, buttons: 1 });

//       await sleep(1); // Wait for asynchronous event processing

//       assert(movements.length === 6); // Should include start and end positions
//       assert(movements[0].x === 0 && movements[0].y === 0); // Start coordinates
//       assert(movements[5].x === 100 && movements[5].y === 100); // End coordinates
//     });
//   },
//   { only: true }
// );

// -------------------------- #Node.prototype.setCursor --------------------------

Object.defineProperty(Node.prototype, "setCursor", {
  value: function (offset) {
    const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    let i = 0;

    // If offset is less than zero, set cursor to the start of the node
    if (offset < 0) {
      return window.setCursor(this, 0);
    }

    while (current) {
      const textLength = current.nodeValue.length;
      if (textLength && i + textLength >= offset) {
        const localOffset = offset - i;
        if (
          localOffset === textLength &&
          walker.nextNode() &&
          walker.nextNode().textContent
        )
          return window.setCursor(walker.currentNode, 0);
        else return window.setCursor(current, localOffset);
      }
      i += textLength;
      current = walker.nextNode();
    }

    // If offset is greater than the total length, set cursor to the end of the last text node
    let lastNode = null;
    let lastOffset = 0;
    while (current) {
      lastNode = current;
      lastOffset = current.nodeValue.length;
      current = walker.nextNode();
    }
    if (lastNode) {
      return window.setCursor(lastNode, lastOffset);
    }

    // Default to setting cursor at the end of the node
    return window.setCursor(this, this.textContent.length);
  },
  enumerable: false,
});
useTests("Node.prototype.setCursor", () => {
  it("moves the cursor to the correct offset in the node", () => {
    const child1 = document.createElement("div");
    child1.innerText = "abc";
    const child2 = document.createElement("span");
    child2.innerText = "def";
    div.append(child1, child2);
    div.setCursor(5);

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === child2.firstChild);
    assert(r.endContainer === child2.firstChild);
    assert(r.startOffset === 2);
    assert(r.endOffset === 2);
  });

  it("moves the cursor to the start of the node if offset is 0", () => {
    div.innerText = `hello world`;
    div.setCursor(0);

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === div.firstChild);
    assert(r.endContainer === div.firstChild);
    assert(r.startOffset === 0);
    assert(r.endOffset === 0);
  });
  it("moves the cursor to the start of the node if offset is less than 0", () => {
    div.innerText = `hello world`;
    div.setCursor(-5); // Move cursor to the start

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === div.firstChild);
    assert(r.endContainer === div.firstChild);
    assert(r.startOffset === 0);
    assert(r.endOffset === 0);
  });
  it("moves the cursor to the end of the node if offset is greater than text length", () => {
    div.innerText = `hello world`;
    div.setCursor(20);

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === div.firstChild);
    assert(r.endContainer === div.firstChild);
    assert(r.startOffset === 11);
    assert(r.endOffset === 11);
  });
  it("moves the cursor to the next text node if at the end of the current text node", () => {
    const child1 = document.createElement("div");
    child1.innerText = "abc";
    const child2 = document.createElement("span");
    child2.innerText = "def";
    div.append(child1, child2);
    div.setCursor(3); // Move cursor to the end of "abc"

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === child2.firstChild);
    assert(r.endContainer === child2.firstChild);
    assert(r.startOffset === 0);
    assert(r.endOffset === 0);
  });

  it("handles nested elements correctly", () => {
    const span = document.createElement("span");
    span.innerText = `world`;
    div.innerText = `hello `;
    div.appendChild(span);
    div.setCursor(9); // Move cursor to the end of "hello world"

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === span.firstChild);
    assert(r.endContainer === span.firstChild);
    assert(r.startOffset === 3);
    assert(r.endOffset === 3);
  });
});

// -------------------------- #Node.prototype.getCursor --------------------------

Object.defineProperty(Node.prototype, "getCursor", {
  value: function () {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const focusNode = selection.focusNode;
    const focusOffset = selection.focusOffset;

    // Ensure the focus node is within the node of interest
    if (!this.contains(focusNode)) {
      return null;
    }

    let offset = 0;
    let currentNode = focusNode;

    // Traverse the node's children and sum up the text lengths until we reach the focusNode
    while (currentNode && currentNode !== this) {
      if (currentNode.previousSibling) {
        currentNode = currentNode.previousSibling;
        offset += currentNode.textContent.length;
      } else {
        currentNode = currentNode.parentNode;
      }
    }

    // Add the focusOffset within the focusNode
    offset += focusOffset;

    return offset;
  },
  enumerable: false,
});
useTests("Node.prototype.getCursor", () => {
  it("returns the correct offset for a focused text node within an element", () => {
    div.innerText = `hello world`;
    div.setCursor(6); // Move cursor to after "hello "
    const offset = div.getCursor();
    assert(offset === 6);
  });
  it("returns the correct offset for a nested text node", () => {
    const span = document.createElement("span");
    span.innerText = `world`;
    div.innerText = `hello `;
    div.appendChild(span);
    span.setCursor(3); // Move cursor to "wor|ld"
    const offset = div.getCursor();
    assert(offset === 9); // "hello " (6) + "wor" (3) = 9
  });
  it("returns null if the focus is outside the given element", () => {
    const outsideDiv = document.createElement("div");
    outsideDiv.innerText = `    `;
    document.body.appendChild(outsideDiv);
    outsideDiv.setCursor(3); // Move cursor to "out|side"
    const offset = div.getCursor();
    assert(offset === null);

    outsideDiv.remove();
  });
  it("returns the correct offset when selection is at the start of the element", () => {
    div.innerText = `hello world`;
    div.setCursor(0); // Move cursor to the start of "hello world"
    const offset = div.getCursor();
    assert(offset === 0);
  });
  it("returns the correct offset when selection is at the end of the element", () => {
    div.innerText = `hello world`;
    div.setCursor(11); // Move cursor to the end of "hello world"
    const offset = div.getCursor();
    assert(offset === 11);
  });
});

// -------------------------- #Node.prototype.getSelection --------------------------

Object.defineProperty(Node.prototype, "getSelection", {
  value: function () {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    if (
      !this.contains(range.startContainer) ||
      !this.contains(range.endContainer)
    ) {
      return null;
    }

    const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    let start = -1,
      end = -1,
      i = 0;

    while (current) {
      const textLength = current.nodeValue.length;
      if (current === range.startContainer) {
        start = i + range.startOffset;
      }
      if (current === range.endContainer) {
        end = i + range.endOffset;
        break;
      }
      i += textLength;
      current = walker.nextNode();
    }

    return [start, end];
  },
  enumerable: false,
});

useTests("Node.prototype.getSelection", () => {
  it("returns the correct range for a selection within an element", () => {
    div.innerText = `hello world`;
    div.setSelection(2, 8);
    const selection = div.getSelection();
    assert(selection[0] === 2);
    assert(selection[1] === 8);
  });
  it("returns the correct range for a selection within nested elements", () => {
    const span = document.createElement("span");
    span.innerText = `world`;
    div.innerText = `hello `;
    div.appendChild(span);
    div.setSelection(0, 11); // Select "hello world"
    const selection = div.getSelection();
    assert(selection[0] === 0);
    assert(selection[1] === 11);
  });
  it("returns null if the selection is outside the given element", () => {
    const outsideDiv = document.createElement("div");
    outsideDiv.innerText = `    `;
    document.body.appendChild(outsideDiv);
    outsideDiv.setSelection(1, 3); // Select text in outsideDiv
    const selection = div.getSelection();
    assert(selection === null);
    outsideDiv.remove();
  });
});

// -------------------------- #Node.prototype.setSelection --------------------------
Object.defineProperty(Node.prototype, "setSelection", {
  value: function (start, end) {
    const selection = window.getSelection();
    const range = document.createRange();
    const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    let i = 0,
      startNode = null,
      startOffset = 0,
      endNode = null,
      endOffset = 0;

    while (current) {
      const textLength = current.nodeValue.length;
      if (!startNode && i + textLength >= start) {
        startNode = current;
        startOffset = start - i;
      }
      if (i + textLength >= end) {
        endNode = current;
        endOffset = end - i;
        break;
      }
      i += textLength;
      current = walker.nextNode();
    }

    if (startNode && endNode) {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    }
    return false;
  },
  enumerable: false,
});

useTests("Node.prototype.setSelection", () => {
  it("sets the correct range within the node", () => {
    const child1 = document.createElement("div");
    child1.innerText = "abc";
    const child2 = document.createElement("span");
    child2.innerText = "def";
    div.append(child1, child2);
    div.setSelection(1, 5);

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === child1.firstChild);
    assert(r.endContainer === child2.firstChild);
    assert(r.startOffset === 1);
    assert(r.endOffset === 2);
  });
  it("sets the correct range at the start and end of the node", () => {
    div.innerText = `hello world`;
    div.setSelection(0, div.textContent.length);

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === div.firstChild);
    assert(r.endContainer === div.firstChild);
    assert(r.startOffset === 0);
    assert(r.endOffset === 11);
  });
  it("sets the correct range within nested elements", () => {
    const span = document.createElement("span");
    span.innerText = `world`;
    div.innerText = `hello `;
    div.appendChild(span);
    div.setSelection(0, 11); // Select "hello world"

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === div.firstChild);
    assert(r.endContainer === span.firstChild);
    assert(r.startOffset === 0);
    assert(r.endOffset === 5);
  });
});

// -------------------------- #Node.prototype.getCursorPosition --------------------------

Object.defineProperty(Node.prototype, "getCursorPosition", {
  value: function () {
    const selection = window.getSelection();
    if (!selection.rangeCount) return { top: 0, left: 0, bottom: 0, right: 0 };

    const range = selection.getRangeAt(0).cloneRange();

    // Check if the focus is before the anchor (backward selection)
    if (selection.anchorNode === selection.focusNode)
      if (selection.anchorOffset > selection.focusOffset)
        range.collapse(true); // Collapse to the start
      else range.collapse(false);
    // Collapse to the end
    else if (
      selection.anchorNode.compareDocumentPosition(selection.focusNode) &
      Node.DOCUMENT_POSITION_PRECEDING
    )
      range.collapse(true); // Collapse to the start
    else range.collapse(false); // Collapse to the end

    const rect = range.getBoundingClientRect();
    const parentRect = this.getBoundingClientRect();

    return {
      top: rect.top - parentRect.top,
      left: rect.left - parentRect.left,
      bottom: rect.bottom - parentRect.top,
      right: rect.right - parentRect.left,
    };
  },
  enumerable: false,
});
useTests("Node.prototype.getCursorPosition", () => {
  beforeEach(() => {
    div.contentEditable = true;
    div.style.width = "100px";
    div.style.height = "100px";
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.left = "0";
    div.style.fontFamily = "monospace";
    div.style.fontSize = "16px";
  });

  it("returns the correct coordinates for a cursor within a text node", () => {
    div.innerText = `hello world`;
    div.setCursor(6); // Move cursor to after "hello "
    const position = div.getCursorPosition();
    assert(position !== null, "Expected non-null position");
    assert(
      position.matches({
        top: position.top,
        left: position.left,
        bottom: position.bottom,
        right: position.right,
      }),
      "Expected correct position object"
    );
  });

  it("returns the correct coordinates for a nested text node", () => {
    const span = document.createElement("span");
    span.innerText = `world`;
    div.innerText = `hello `;
    div.appendChild(span);
    span.setCursor(3); // Move cursor to "wor|ld"
    const position = div.getCursorPosition();
    assert(position !== null, "Expected non-null position");
    assert(
      position.matches({
        top: position.top,
        left: position.left,
        bottom: position.bottom,
        right: position.right,
      }),
      "Expected correct position object"
    );
  });

  it("returns empty if the selection is outside the given element", () => {
    const outsideDiv = document.createElement("div");
    outsideDiv.innerText = `    `;
    div.appendChild(outsideDiv);
    outsideDiv.setCursor(3); // Move cursor to "out|side"
    const position = div.getCursorPosition();
    assert(
      position.matches({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      }),
      "Expected empty position"
    );
  });

  it("returns the correct coordinates when selection is at the start of the element", () => {
    div.innerText = `hello world`;
    div.setCursor(0); // Move cursor to the start of "hello world"
    const position = div.getCursorPosition();
    assert(position !== null, "Expected non-null position");
    assert(
      position.matches({
        top: position.top,
        left: position.left,
        bottom: position.bottom,
        right: position.right,
      }),
      "Expected correct position object"
    );
  });

  it("returns the correct coordinates when selection is at the end of the element", () => {
    div.innerText = `hello world`;
    div.setCursor(11); // Move cursor to the end of "hello world"
    const position = div.getCursorPosition();
    assert(position !== null, "Expected non-null position");
    assert(
      position.matches({
        top: position.top,
        left: position.left,
        bottom: position.bottom,
        right: position.right,
      }),
      "Expected correct position object"
    );
  });
});

// -------------------------- #Node.prototype.getSelectionPosition --------------------------
Object.defineProperty(Node.prototype, "getSelectionPosition", {
  value: function () {
    const selection = window.getSelection();
    if (!selection.rangeCount) return [];

    const range = selection.getRangeAt(0).cloneRange();
    const rects = range.getClientRects();
    const parentRect = this.getBoundingClientRect();

    // Initialize an object to store combined rectangles by line
    const lineRects = {};
    const tolerance = 5; // Tolerance in pixels

    Array.from(rects).forEach((rect) => {
      const relativeRect = {
        top: rect.top - parentRect.top,
        left: rect.left - parentRect.left,
        bottom: rect.bottom - parentRect.top,
        right: rect.right - parentRect.left,
      };

      // Find if there is already a line that matches the top and bottom within a tolerance
      let lineKey = Object.keys(lineRects).find((key) => {
        const [keyTop, keyBottom] = key.split(":").map(Number);
        return (
          Math.abs(keyTop - relativeRect.top) <= tolerance &&
          Math.abs(keyBottom - relativeRect.bottom) <= tolerance
        );
      });

      if (!lineKey) {
        // No existing rect on this line within tolerance, create a new one
        lineKey = `${relativeRect.top}:${relativeRect.bottom}`;
        lineRects[lineKey] = { ...relativeRect };
      } else {
        // Merge this rect with the existing one on the same line
        const existingRect = lineRects[lineKey];
        existingRect.left = Math.min(existingRect.left, relativeRect.left);
        existingRect.right = Math.max(existingRect.right, relativeRect.right);
        // Adjust the top and bottom to include this rectangle if necessary
        existingRect.top = Math.min(existingRect.top, relativeRect.top);
        existingRect.bottom = Math.max(
          existingRect.bottom,
          relativeRect.bottom
        );
      }
    });

    // Convert the object of combined rectangles back into an array
    const combinedRects = Object.values(lineRects).map((rect) => ({
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
    }));

    return combinedRects;
  },
  enumerable: false,
});

// -------------------------- #JSON.circularStringify --------------------------
JSON.circularStringify = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  });
};
useTests(`JSON.circularStringify`, () => {
  it("handles circular references in an object", () => {
    const obj = { name: "Alice" };
    obj.self = obj;
    const str = JSON.circularStringify(obj);
    assert(str === '{"name":"Alice","self":"[Circular]"}');
  });

  it("handles nested circular references", () => {
    const obj = { name: "Bob" };
    const child = { parent: obj };
    obj.child = child;
    const str = JSON.circularStringify(obj);
    assert(str === '{"name":"Bob","child":{"parent":"[Circular]"}}');
  });

  it("handles arrays with circular references", () => {
    const arr = [1, 2, 3];
    arr.push(arr);
    const str = JSON.circularStringify(arr);
    assert(str === '[1,2,3,"[Circular]"]');
  });

  it("handles non-circular objects correctly", () => {
    const obj = { name: "Charlie", age: 30 };
    const str = JSON.circularStringify(obj);
    assert(str === '{"name":"Charlie","age":30}');
  });

  it("handles arrays without circular references", () => {
    const arr = [1, 2, 3];
    const str = JSON.circularStringify(arr);
    assert(str === "[1,2,3]");
  });

  it("handles null values", () => {
    const obj = { value: null };
    const str = JSON.circularStringify(obj);
    assert(str === '{"value":null}');
  });

  it("handles undefined values", () => {
    const obj = { value: undefined };
    const str = JSON.circularStringify(obj);
    assert(str === "{}"); // JSON.stringify ignores properties with undefined values
  });
});

// -------------------------- #Object.prototype.matches --------------------------
Object.defineProperty(Object.prototype, "matches", {
  value: function (obj, { strict = true } = {}) {
    let visitedPairs = new Map();

    const deepCompare = (obj1, obj2) => {
      if (obj1 === obj2) return true;

      // Check for RegExp objects
      if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
        return obj1.toString() === obj2.toString();
      }

      if (
        typeof obj1 === "function" &&
        typeof obj2 === "function" &&
        obj1.toString() === obj2.toString()
      )
        return true;
      if (
        !obj1 ||
        !obj2 ||
        typeof obj1 !== "object" ||
        typeof obj2 !== "object"
      )
        return false;

      // Handle circular references
      let existingPair = visitedPairs.get(obj1);
      if (existingPair && existingPair === obj2) return true;

      visitedPairs.set(obj1, obj2);

      let keys1 = Object.keys(obj1).filter((k) => !k.startsWith("__"));
      let keys2 = Object.keys(obj2).filter((k) => !k.startsWith("__"));

      if (strict && keys1.length !== keys2.length) return false;

      for (let key of keys1)
        if (!obj2.hasOwnProperty(key) && !key.startsWith("__")) return false;
        else if (!deepCompare(obj1[key], obj2[key])) return false;

      return true;
    };

    return deepCompare(this, obj);
  },
  enumerable: false,
});
useTests("Object.prototype.matches", () => {
  it("matches normal objects", () => {
    assert({ a: "a" }.matches({ a: "a" }));
    assert(!{ a: "a", b: "b" }.matches({ a: "a" }));
  });
  it("matches functions", () => {
    assert({ a: () => "a" }.matches({ a: () => "a" }));
  });
  it("matches objects with circular references", () => {
    let obj1 = {
      a: "a",
      child: {},
    };
    obj1.child.parent = obj1;
    let obj2 = {
      a: "a",
      child: {},
    };
    obj2.child.parent = obj2;
    assert(obj1.matches(obj2));

    obj2.a = "b";
    assert(!obj1.matches(obj2));
  });
  it("accepts 'strict = false' option", () => {
    assert({ a: "a" }.matches({ a: "a" }, { strict: false }));
    assert({ a: "a" }.matches({ a: "a", b: "b" }, { strict: false }));
  });
  it("works with RegExp", () => {
    assert(new RegExp("abc").matches(new RegExp(/abc/)));
    assert(new RegExp("abc").matches(new RegExp(/def/)) === false);
  });
  it("ignores keys that start with __", () => {
    assert({ a: "a", __hidden: true }.matches({ a: "a" }));
    assert({ a: "a" }.matches({ a: "a", __hidden: true }) === true);
    assert(
      { a: "a", __hidden: true }.matches(
        { a: "a", __hidden: false },
        { strict: false }
      )
    );

    const list = [1, 2, 3];
    list.__hidden = true;
    assert(list.matches([1, 2, 3]));
  });
});

// -------------------------- #Object.prototype.findBreadthFirst --------------------------
Object.defineProperty(Object.prototype, "findBreadthFirst", {
  value: function (test) {
    let queue = [this];

    while (queue.length > 0) {
      let current = queue.shift();

      if (test(current)) {
        return current;
      }

      for (let key in current) {
        if (
          current.hasOwnProperty(key) &&
          typeof current[key] === "object" &&
          current[key] !== null
        ) {
          queue.push(current[key]);
        }
      }
    }

    return null; // Return null if no matching element is found
  },
  enumerable: false,
});
useTests("Object.prototype.findBreadthFirstOne", () => {
  it("finds the first object that matches the test function", () => {
    let obj = {
      a: { value: 1, child: { value: 4 } },
      b: { value: 2, child: { value: 3 } },
      c: { value: 4 },
    };
    let found = obj.findBreadthFirst((o) => o.value > 2);
    assert(found && found === obj.c);

    found = obj.findBreadthFirst((o) => o.value === 3);
    assert(found && found === obj.b.child);
  });

  it("returns null if no match is found", () => {
    let obj = {
      a: { value: 1 },
      b: { value: 2 },
    };
    let found = obj.findBreadthFirst((o) => o.value && o.value > 10);
    assert(found === null);
  });

  it("handles nested objects and stops at the first match", () => {
    let obj = {
      a: { value: 1, child: { value: 5 } },
      b: { value: 2 },
    };
    let found = obj.findBreadthFirst((o) => o.value && o.value > 1);
    assert(found !== null);
    assert(found.value === 2); // Should find 'b' first, not the nested child of 'a'
  });
});

// -------------------------- #Object.prototype.findDepthFirst --------------------------
Object.defineProperty(Object.prototype, "findDepthFirst", {
  value: function (test) {
    let result = [];

    const dfs = (obj) => {
      if (test(obj)) {
        result.push(obj);
      }

      for (let key in obj) {
        if (
          obj.hasOwnProperty(key) &&
          typeof obj[key] === "object" &&
          obj[key] !== null
        ) {
          dfs(obj[key]);
        }
      }
    };

    dfs(this);

    return result;
  },
  enumerable: false,
});
useTests("Object.prototype.findDepthFirst", () => {
  it("finds objects that match the test function in depth-first order", () => {
    let obj = {
      a: { value: 1 },
      b: { value: 2, child: { value: 3 } },
      c: { value: 4 },
    };
    let found = obj.findDepthFirst((o) => o.value && o.value > 1);
    assert(found.length === 3);
    assert(found[0].value === 2);
    assert(found[1].value === 3);
    assert(found[2].value === 4);
  });

  it("returns an empty array if no matches are found", () => {
    let obj = {
      a: { value: 1 },
      b: { value: 2 },
    };
    let found = obj.findDepthFirst((o) => o.value && o.value > 10);
    assert(found.length === 0);
  });

  it("handles nested objects and searches them deeply", () => {
    let obj = {
      a: { value: 1, child: { value: 5 } },
      b: { value: 2 },
    };
    let found = obj.findDepthFirst((o) => o.value && o.value > 1);
    assert(found.length === 2);
    assert(found[0].value === 5);
    assert(found[1].value === 2);
  });
});

// -------------------------- #Object.prototype.hasAnyOwnProperty --------------------------
Object.defineProperty(Object.prototype, "hasAnyOwnProperty", {
  value: function (...keys) {
    return keys.some((key) => this.hasOwnProperty(key));
  },
  enumerable: false,
});
useTests(`Object.prototype.hasAnyOwnProperty`, () => {
  it("Object has one of the given properties", () =>
    ({ a: 1, b: 2, c: 3 }.hasAnyOwnProperty("a", "z")));
  it("Object has multiple of the given properties", () =>
    ({ a: 1, b: 2, c: 3 }.hasAnyOwnProperty("a", "b", "z")));
  it("Object is missing all given properties", () =>
    !{ a: 1, b: 2, c: 3 }.hasAnyOwnProperty("x", "y", "z"));
});

// -------------------------- #Object.prototype.hasOwnProperties --------------------------
Object.defineProperty(Object.prototype, "hasOwnProperties", {
  value: function (...keys) {
    return keys.every((key) => this.hasOwnProperty(key));
  },
  enumerable: false,
});
useTests(`Object.prototype.hasOwnProperties`, () => {
  it("Object has all given properties", () =>
    ({ a: 1, b: 2, c: 3 }.hasOwnProperties("a", "b", "c")));
  it("Object is missing one property", () =>
    !{ a: 1, b: 2, c: 3 }.hasOwnProperties("a", "b", "d"));
  it("Object is missing all properties", () =>
    !{ a: 1, b: 2, c: 3 }.hasOwnProperties("d", "e", "f"));
});

// -------------------------- #Object.prototype.contains --------------------------
Object.defineProperty(Object.prototype, "contains", {
  value: function contains(targetObj, opts = {}, visited = new Set()) {
    // Check for reference equality
    if (this === targetObj) return true;
    if (!targetObj || typeof targetObj !== "object") return false;

    visited.add(this);

    // Iterate over properties of the object
    for (const key in this) {
      const value = this[key];
      if (value === targetObj) return true;
      if (visited.has(value)) continue;
      if (opts.deep && value && typeof value === "object")
        if (value.contains(targetObj, opts, visited)) return true;
    }
    return false;
  },
  enumerable: false,
});
useTests(`Object.prototype.contains`, () => {
  it("returns true when object contains the target object", () => {
    const target = { key: "value" };
    const obj = { inner: target };
    assert(obj.contains(target) === true);
  });
  it("returns false when object does not contain the target object", () => {
    const target = { key: "value" };
    const obj = { inner: { key: "other" } };
    assert(obj.contains(target) === false);
  });
  it("returns true for nested object containment", () => {
    const target = { key: "value" };
    const obj = { level1: { level2: target } };
    assert(obj.contains(target, { deep: true }) === true);
  });
  it("returns false for non-object values", () => {
    const obj = { key: "value" };
    assert(obj.contains("value") === false);
  });
  it("returns false when object contains a different object with same structure", () => {
    const target = { key: "value" };
    const obj = { inner: { key: "value" } };
    assert(obj.contains(target) === false);
  });
  it("returns true for the object itself", () => {
    const obj = { key: "value" };
    assert(obj.contains(obj) === true);
  });
  it("returns true for an object contained within a circular reference", () => {
    const target = { key: "value" };
    const circularObj = { inner: target };
    circularObj.self = circularObj; // Creating a circular reference
    assert(circularObj.contains(target) === true);
  });
  it("handles circular references without causing stack overflow", () => {
    const circularObj = {};
    circularObj.self = circularObj; // Creating a circular reference
    assert(circularObj.contains({ key: "value" }) === false);
  });
  it("handles deeply nested circular references without causing stack overflow", () => {
    const circularObj = { dog: { cat: { rhino: {} } } };
    circularObj.dog.cat.rhino.circular = circularObj;

    assert(circularObj.dog.contains(circularObj, { deep: true }) === true);
  });
  it("returns false for an object not contained within a circular reference", () => {
    const circularObj = {};
    circularObj.self = circularObj; // Creating a circular reference
    const target = { key: "value" };
    assert(circularObj.contains(target) === false);
  });
});

// -------------------------- #Array.prototype.random --------------------------
Object.defineProperty(Array.prototype, "random", {
  value: function () {
    if (this.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * this.length);
    return this[randomIndex];
  },
  enumerable: false,
});
useTests(`Array.prototype.random`, () => {
  it("returns a random item from the array", () => {
    const sampleArray = [1, 2, 3, 4, 5];
    const item = sampleArray.random();
    assert(sampleArray.includes(item));
  });
  it("returns undefined for an empty array", () => {
    assert([].random() === undefined);
  });
  it("randomly selects an item from the array over multiple calls", () => {
    const sampleArray = [1, 2, 3, 4, 5];
    let different = false;
    const firstItem = sampleArray.random();
    for (let i = 0; i < 10000; i++) {
      if (sampleArray.random() !== firstItem) {
        different = true;
        break;
      }
    }
    assert(different);
  });
});

// -------------------------- #Array.prototype.randomSlice --------------------------
Object.defineProperty(Array.prototype, "randomSlice", {
  value: function (sliceLength) {
    if (this.length === 0) return [];
    const randomLength =
      sliceLength !== undefined
        ? sliceLength
        : window.useRandomInt(0, this.length - 1);
    const start = window.useRandomInt(0, this.length - randomLength);
    return this.slice(start, start + randomLength);
  },
  enumerable: false,
});
useTests(`Array.prototype.randomSlice`, () => {
  it("returns a slice of random length when no parameter is provided", () => {
    const sampleArray = [1, 2, 3, 4, 5];
    const slice = sampleArray.randomSlice();
    assert(Array.isArray(slice) && slice.length <= sampleArray.length);
    slice.forEach((e) => assert(sampleArray.includes(e)));
  });
  it("returns a slice of specified length", () => {
    const sampleArray = [1, 2, 3, 4, 5];
    const length = 3;
    const slice = sampleArray.randomSlice(length);
    assert(slice.length === length);
    slice.forEach((e) => assert(sampleArray.includes(e)));
  });
  it("returns an empty array for an empty array", () => {
    assert([].randomSlice().length === 0);
  });
});

// -------------------------- #Array.prototype.at --------------------------
Object.defineProperty(Array.prototype, "at", {
  value: function (index) {
    return this[index < 0 ? this.length + index : index];
  },
  enumerable: false,
});
useTests(`Array.prototype.at`, () => {
  it("returns standard items at positive indexes", () => {
    assert([1, 2, 3].at(0) === 1);
    assert([1, 2, 3].at(2) === 3);
  });
  it("returns items from the back of the array for negative indexes", () => {
    assert([1, 2, 3].at(-1) === 3);
    assert([1, 2, 3].at(-3) === 1);
  });
});

// -------------------------- #Array.prototype.fromRange --------------------------
Object.defineProperty(Array, "fromRange", {
  value: function (start, end) {
    if (typeof start !== "number" || typeof end !== "number" || start > end) {
      throw new Error("Invalid start or end value");
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  },
  enumerable: false,
});
useTests(`Array.fromRange`, () => {
  it("creates an array with values from start to end inclusive", () => {
    assert([1, 2, 3, 4, 5].matches(Array.fromRange(1, 5)));
    assert([3, 4, 5, 6, 7].matches(Array.fromRange(3, 7)));
  });

  it("returns an array with a single element if start and end are the same", () => {
    assert([5].matches(Array.fromRange(5, 5)));
  });

  it("throws an error if start is greater than end", () => {
    let errorThrown = false;
    try {
      Array.fromRange(5, 3);
    } catch (e) {
      errorThrown = true;
    }
    assert(errorThrown);
  });

  it("throws an error if start or end is not a number", () => {
    let errorThrown = false;
    try {
      Array.fromRange("a", 5);
    } catch (e) {
      errorThrown = true;
    }
    assert(errorThrown);

    errorThrown = false;
    try {
      Array.fromRange(1, "b");
    } catch (e) {
      errorThrown = true;
    }
    assert(errorThrown);
  });
});

// -------------------------- #Array.prototype.after --------------------------
Object.defineProperty(Array.prototype, "after", {
  value: function (element, offset = 1) {
    const index = this.indexOf(element);
    if (index === -1) return undefined;
    return this[index + offset];
  },
  enumerable: false,
});
useTests(`Array.prototype.after`, () => {
  it("returns the element after the specified element", () => {
    assert([1, 2, 3, 4, 5].after(2) === 3);
    assert([1, 2, 3, 4, 5].after(4) === 5);
  });
  it("returns undefined if the specified element is the last one", () => {
    assert([1, 2, 3, 4, 5].after(5) === undefined);
  });
  it("returns undefined if the specified element is not in the array", () => {
    assert([1, 2, 3, 4, 5].after(6) === undefined);
  });
  it("handles arrays with repeated elements correctly", () => {
    assert([1, 2, 2, 3].after(2) === 2);
    assert([1, 2, 2, 3].after(3) === undefined);
  });
  it("handles negative offsets", () => {
    assert([1, 2, 3, 4, 5].after(3, -1) === 2);
    assert([1, 2, 3, 4, 5].after(1, -1) === undefined);
  });
  it("returns undefined if the offset goes beyond the array length", () => {
    assert([1, 2, 3, 4, 5].after(4, 2) === undefined);
    assert([1, 2, 3, 4, 5].after(5, 1) === undefined);
  });
  it("returns the element after the specified element with custom offset", () => {
    assert([1, 2, 3, 4, 5].after(1, 2) === 3);
    assert([1, 2, 3, 4, 5].after(2, 3) === 5);
  });
});

// -------------------------- #Array.prototype.before --------------------------
Object.defineProperty(Array.prototype, "before", {
  value: function (element, offset = 1) {
    const index = this.indexOf(element);
    if (index === -1) return undefined;
    return this[index - offset];
  },
  enumerable: false,
});
useTests(`Array.prototype.before with offset`, () => {
  it("returns the element before the specified element with default offset", () => {
    assert([1, 2, 3, 4, 5].before(3) === 2);
    assert([1, 2, 3, 4, 5].before(5) === 4);
  });
  it("returns the element before the specified element with custom offset", () => {
    assert([1, 2, 3, 4, 5].before(5, 2) === 3);
    assert([1, 2, 3, 4, 5].before(4, 3) === 1);
  });
  it("returns undefined if the offset goes beyond the array length", () => {
    assert([1, 2, 3, 4, 5].before(1, 2) === undefined);
    assert([1, 2, 3, 4, 5].before(2, 3) === undefined);
  });
  it("returns undefined if the specified element is not in the array", () => {
    assert([1, 2, 3, 4, 5].before(6) === undefined);
  });
  it("handles negative offsets", () => {
    assert([1, 2, 3, 4, 5].before(3, -1) === 4);
    assert([1, 2, 3, 4, 5].before(5, -1) === undefined);
  });
});

// -------------------------- #Array.prototype.filterDuplicates --------------------------
Object.defineProperty(Array.prototype, "filterDuplicates", {
  value: function () {
    return this.filter((item, index) => this.indexOf(item) === index);
  },
  enumerable: false,
});
useTests(`Array.prototype.filterDuplicates`, () => {
  it("removes duplicate numbers", () => {
    assert([1, 2, 2, 3, 4, 4, 5].filterDuplicates().matches([1, 2, 3, 4, 5]));
  });
  it("removes duplicate strings", () => {
    assert(
      ["apple", "banana", "apple", "orange"]
        .filterDuplicates()
        .matches(["apple", "banana", "orange"])
    );
  });
  it("removes duplicates and retains order", () => {
    assert([5, 3, 5, 3, 1, 2, 2].filterDuplicates().matches([5, 3, 1, 2]));
  });
  it("handles an array with no duplicates", () => {
    assert([1, 2, 3, 4, 5].filterDuplicates().matches([1, 2, 3, 4, 5]));
  });
  it("handles an empty array", () => {
    assert([].filterDuplicates().matches([]));
  });
});

Object.defineProperty(Array.prototype, "binarySearch", {
  value: function (callback) {
    let low = 0;
    let high = this.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const comparison = callback(this[mid]);

      if (comparison === 0) return mid; // Correctly found the element
      else if (comparison < 0) high = mid - 1; // Search in the left half
      else low = mid + 1; // Search in the right half
    }

    return -1; // Element not found
  },
  enumerable: false,
});
useTests("Array.prototype.binarySearch", () => {
  it("finds the correct index of an element", () => {
    const arr = [1, 2, 3, 4, 5];
    const index = arr.binarySearch((x) => x - 3); // Looking for 3
    assert(index === 2);
  });

  it("returns -1 if element is not found", () => {
    const arr = [1, 2, 4, 5];
    const index = arr.binarySearch((x) => x - 3); // Looking for 3
    assert(index === -1);
  });

  it("can find elements in a large array", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i + 1);
    const target = 999;
    const index = arr.binarySearch((x) => target - x);
    assert(index === 998, `Expected 998, but got ${index}`);
  });

  it("handles an array with one element", () => {
    const arr = [1];
    const index = arr.binarySearch((x) => x - 1);
    assert(index === 0);
  });

  it("handles an empty array", () => {
    const arr = [];
    const index = arr.binarySearch((x) => x);
    assert(index === -1);
  });
});

// -------------------------- #String.prototype.count --------------------------
Object.defineProperty(String.prototype, "count", {
  value: function (char) {
    let count = 0;
    for (let i = 0; i < this.length; i++) {
      if (this[i] === char) {
        count++;
      }
    }
    return count;
  },
  enumerable: false,
});

useTests(`String.prototype.count`, () => {
  it("counts occurrences of a character", () => {
    assert("hello world".count("l") === 3);
    assert("hello world".count("z") === 0);
    assert("banana".count("a") === 3);
    assert("mississippi".count("i") === 4);
  });
});

// -------------------------- #String.prototype.at --------------------------
Object.defineProperty(String.prototype, "at", {
  value: function (index) {
    return this.split("").at(index);
  },
  enumerable: false,
});
useTests(`String.prototype.at`, () => {
  it("returns standard items at positive indexes", () => {
    assert(`123`.at(0) === `1`);
    assert(`123`.at(2) === `3`);
  });
  it("returns items from the back of the array for negative indexes", () => {
    assert(`123`.at(-1) === `3`);
    assert(`123`.at(-3) === `1`);
  });
});

// -------------------------- #String.prototype.insertAt --------------------------
Object.defineProperty(String.prototype, "insertAt", {
  value: function (index, text) {
    if (index >= 0) return this.slice(0, index) + text + this.slice(index);
    else
      return (
        this.slice(0, this.length + index) +
        text +
        this.slice(this.length + index)
      );
  },
  enumerable: false,
});
useTests(`String.prototype.insertAt`, () => {
  it("inserts item at positive index", () => {
    assert(`hello`.insertAt(1, "$") === `h$ello`);
  });
  it("inserts item at negative index", () => {
    assert(`hello`.insertAt(-2, "$") === `hel$lo`);
  });
});

// -------------------------- #String.prototype.removeAt --------------------------
Object.defineProperty(String.prototype, "removeAt", {
  value: function (index, count = 1) {
    if (index >= this.length) return this;
    else if (index >= 0)
      return this.substring(0, index) + this.substring(index + count);
    else
      return (
        this.substring(0, this.length + index) +
        this.substring(this.length + index + count)
      );
  },
  enumerable: false,
});
useTests(`String.prototype.removeAt`, () => {
  it("removes item at positive index", () => {
    assert(`hello`.removeAt(1) === `hllo`);
    assert(`hello`.removeAt(3, 2) === `hel`);
  });
  it("removes item at negative index", () => {
    assert(`hello`.removeAt(-2) === `helo`);
    assert(`hello`.removeAt(-3, 2) === `heo`);
  });
});

// -------------------------- #String.prototype.capitalize --------------------------
Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
  },
  enumerable: false,
});
useTests("String.prototype.capitalize", () => {
  it("capitalizes the first letter of a string", () => {
    assert("apple".capitalize() === "Apple");
  });

  it("converts the rest of the string to lowercase", () => {
    assert("BANANA".capitalize() === "Banana");
  });

  it("doesn't change already capitalized words", () => {
    assert("Pineapple".capitalize() === "Pineapple");
  });

  it("handles empty strings", () => {
    assert("".capitalize() === "");
  });

  it("handles strings with special characters", () => {
    assert("$special".capitalize() === "$special");
  });

  it("handles strings with numbers", () => {
    assert("123abc".capitalize() === "123abc");
  });
});

// -------------------------- #String.prototype.compress --------------------------
Object.defineProperty(String.prototype, "compress", {
  value: function (...patterns) {
    let compressedString = this;

    for (let pattern of patterns) {
      if (typeof pattern === "string")
        while (compressedString.includes(pattern + pattern))
          compressedString = compressedString.replaceAll(
            pattern + pattern,
            pattern
          );
      else if (pattern instanceof RegExp) {
        const matches = compressedString.match(pattern);
        if (matches && matches[0]) {
          compressedString = compressedString.replace(
            new RegExp(`${pattern.source}+`, "g"),
            matches[0]
          );
        }
      }
    }
    return compressedString;
  },
  enumerable: false,
});
useTests("String.prototype.compress", () => {
  it("compresses consecutive spaces and dashes into a single space and dash", () => {
    const str = "This is    a-- string with--      multiple    spaces.";
    const result = str.compress(" ", "--");
    assert(result === "This is a-- string with-- multiple spaces.");
  });

  it("compresses consecutive targeted characters", () => {
    const str = "Hello---World----!";
    const result = str.compress("-");
    assert(result === "Hello-World-!");
  });

  it("compresses newlines", () => {
    const str = "Line 1\n\n\nLine 2\n\nLine 3";
    const result = str.compress("\n");
    assert(result === "Line 1\nLine 2\nLine 3");
  });

  it("compresses using regex", () => {
    const str = "Hello...World.....!";
    const result = str.compress(/\./g);
    assert(result === "Hello.World.!");
  });
});

// -------------------------- #String.prototype.trimOverlap --------------------------
Object.defineProperty(String.prototype, "trimOverlap", {
  value: function (secondString) {
    let overlapLength = 0;
    for (let i = 0; i < this.length; i++) {
      let suffix = this.substring(i);
      if (secondString.startsWith(suffix)) {
        overlapLength = suffix.length;
        break;
      }
    }
    return this.substring(0, this.length - overlapLength);
  },
  enumerable: false,
});
useTests(`String.prototype.trimOverlap`, () => {
  it("removes overlapping characters when second string starts with a suffix of the first string", () => {
    assert(` \n  `.trimOverlap("\n  ") === ` `);
    assert(`  `.trimOverlap("dog") === `  `);

    assert(` `.trimOverlap(" dog") === ``);
    assert(` \n\n`.trimOverlap("\n\n ") === ` `);

    assert(` \n  `.trimOverlap("\ndog") === ` \n  `);
  });
  it("returns the original string when there is no overlap", () => {
    assert(`apple`.trimOverlap("banana") === `apple`);
    assert(`hello`.trimOverlap("world") === `hello`);
  });
});

// -------------------------- #String.prototype.toRegExp --------------------------
Object.defineProperty(String.prototype, "toRegExp", {
  value: function (flags) {
    return new RegExp(this.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
  },
  enumerable: false,
});
useTests(`String.prototype.toRegExp`, () => {
  it("escapes special regex characters", () => {
    assert(".".toRegExp().source === "\\.");
    assert("(".toRegExp().source === "\\(");
    assert(")".toRegExp().source === "\\)");
    assert("*".toRegExp().source === "\\*");
    assert("+".toRegExp().source === "\\+");
    assert("?".toRegExp().source === "\\?");
    assert("[".toRegExp().source === "\\[");
    assert("]".toRegExp().source === "\\]");
    assert("{".toRegExp().source === "\\{");
    assert("}".toRegExp().source === "\\}");
    assert("^".toRegExp().source === "\\^");
    assert("$".toRegExp().source === "\\$");
    assert("|".toRegExp().source === "\\|");
    assert("\\".toRegExp().source === "\\\\");
  });
  it("converts the entire string into a regex pattern", () => {
    const text = "Hello (world)? *$^";
    const regex = text.toRegExp();
    assert(regex instanceof RegExp);
    assert(regex.test(text));
  });
});

// -------------------------- #String.prototype.diff --------------------------
Object.defineProperty(String.prototype, "diff", {
  value: function (str) {
    let commonStart = 0;

    // Find the common prefix
    while (
      commonStart < this.length &&
      commonStart < str.length &&
      this[commonStart] === str[commonStart]
    ) {
      commonStart++;
    }

    let commonEndThis = this.length - 1;
    let commonEndStr = str.length - 1;

    // Find the common suffix
    while (
      commonEndThis >= commonStart &&
      commonEndStr >= commonStart &&
      this[commonEndThis] === str[commonEndStr]
    ) {
      commonEndThis--;
      commonEndStr--;
    }

    // Record the replacement operation
    return {
      start: commonStart,
      end: commonEndThis + 1,
      value: str.slice(commonStart, commonEndStr + 1),
    };
  },
  enumerable: false,
});
useTests(
  `String.prototype.diff`,
  () => {
    it("returns an operation with no changes when there are no differences", () => {
      const result = "Hello World".diff("Hello World");
      assert(
        result.matches({ start: 11, end: 11, value: "" }),
        "Expected operation with no changes when strings are identical"
      );
    });

    it("detects insertions at the end of the string", () => {
      const result = "Hello".diff("Hello World");
      assert(
        result.matches({ start: 5, end: 5, value: " World" }),
        "Expected insertion operation for added content at the end"
      );
    });

    it("detects insertions at the beginning of the string", () => {
      const result = "World".diff("Hello World");
      assert(
        result.matches({ start: 0, end: 0, value: "Hello " }),
        "Expected insertion operation for added content at the beginning"
      );
    });

    it("detects deletions", () => {
      const result = "Hello World".diff("Hello");
      assert(
        result.matches({ start: 5, end: 11, value: "" }),
        "Expected deletion operation for removed content at the end"
      );
    });

    it("detects complex changes involving both insertions and deletions", () => {
      const result = "Hello World".diff("Goodbye World");
      assert(
        result.matches({ start: 0, end: 5, value: "Goodbye" }),
        "Expected operations for complex changes with deletions and insertions"
      );
    });

    it("handles multiple operations across the string", () => {
      const result = "Hello amazing World".diff("Hi wonderful World");
      assert(
        result.matches({ start: 1, end: 13, value: "i wonderful" }),
        "Expected multiple operations for deletions and insertions across the string"
      );
    });
  },
  { only: false }
);

// -------------------------- #useRandomColor --------------------------
window.useRandomColor = function () {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, "0")}`;
};
useTests(`useRandomColor`, () => {
  it("returns a valid hex color string", () => {
    const color = window.useRandomColor();
    const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    assert(hexColorRegex.test(color));
  });
  it("returns a string of length 7", () => {
    const color = window.useRandomColor();
    assert(color.length === 7);
  });
  it("generates different colors over multiple calls", () => {
    const color1 = window.useRandomColor();
    const color2 = window.useRandomColor();
    const color3 = window.useRandomColor();
    assert(color1 !== color2 || color1 !== color3 || color2 !== color3);
  });
});

// -------------------------- #useColorSimilarity --------------------------
const hexToRgb = (hex) => {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};
const rgbToHex = (r, g, b) => {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};
const useColorDistance = (rgb1, rgb2) => {
  const rDiff = rgb1[0] - rgb2[0];
  const gDiff = rgb1[1] - rgb2[1];
  const bDiff = rgb1[2] - rgb2[2];
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};
const useColorSimilarity = (hex1, hex2) => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
  const distance = useColorDistance(rgb1, rgb2);
  return 1 - distance / maxDistance;
};
useTests("useColorSimilarity", () => {
  it("returns 1 for identical colors", () => {
    assert(useColorSimilarity("#FFFFFF", "#FFFFFF") === 1);
  });
  it("returns a value close to 0 for opposite colors", () => {
    const similarity = useColorSimilarity("#FFFFFF", "#000000");
    assert(similarity === 0);
  });
  it("returns a high value for similar colors", () => {
    const similarity = useColorSimilarity("#F0F0F0", "#FFFFFF");
    assert(similarity > 0.9 && similarity <= 1);
  });
  it("handles lowercase hex strings", () => {
    assert(useColorSimilarity("#ffffff", "#ffffff") === 1);
  });
  it("returns a moderate value for moderately different colors", () => {
    const similarity = useColorSimilarity("#123456", "#654321");
    assert(similarity > 0.1 && similarity < 0.9);
  });
  it("playground", () => {
    const similarity = useColorSimilarity("#52597D", "#383C55");
  });
});

// -------------------------- #useColorTint --------------------------
const useColorTint = (color, amount) => {
  // Ensure amount is between 0 and 1
  amount = Math.max(0, Math.min(amount, 1));

  // Convert hex color to RGB
  let [r, g, b] = hexToRgb(color);

  // Calculate the tinted color
  r += (255 - r) * amount;
  g += (255 - g) * amount;
  b += (255 - b) * amount;

  // Convert back to hex and return
  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
};
useTests(`useColorTint`, () => {
  it("tints a color correctly with maximum amount", () => {
    assert(useColorTint("#000000", 1) === "#ffffff"); // Black to white
  });
  it("tints a color correctly with no amount", () => {
    assert(useColorTint("#123456", 0) === "#123456"); // No change
  });
  it("tints a color correctly with half amount", () => {
    assert(useColorTint("#000000", 0.5) === "#808080"); // Black to medium gray
  });
  it("tints a non-black color correctly", () => {
    // This test is a bit simplistic; real-world results may vary
    assert(useColorTint("#123456", 0.5).startsWith("#")); // Check if result is a valid hex color
  });
});

// -------------------------- #useColorShade --------------------------
const useColorShade = (color, amount) => {
  // Ensure amount is between 0 and 1
  amount = Math.max(0, Math.min(amount, 1));

  // Convert hex color to RGB
  let [r, g, b] = hexToRgb(color);

  // Calculate the shaded color
  r *= 1 - amount;
  g *= 1 - amount;
  b *= 1 - amount;

  // Convert back to hex and return
  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
};
useTests(`useColorShade`, () => {
  it("shades a color correctly with maximum amount", () => {
    assert(useColorShade("#ffffff", 1) === "#000000"); // White to black
  });
  it("shades a color correctly with no amount", () => {
    assert(useColorShade("#123456", 0) === "#123456"); // No change
  });
  it("shades a color correctly with half amount", () => {
    assert(useColorShade("#ffffff", 0.5) === "#808080"); // White to medium gray
  });
  it("shades a non-white color correctly", () => {
    // This test is a bit simplistic; real-world results may vary
    assert(useColorShade("#123456", 0.5).startsWith("#")); // Check if result is a valid hex color
  });
});

// -------------------------- #useRandomInt --------------------------
window.useRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
useTests(`useRandomInt`, () => {
  it("returns an integer within the specified range", () => {
    const min = 1,
      max = 10;
    const int = window.useRandomInt(min, max);
    assert(Number.isInteger(int) && int >= min && int <= max);
  });
});

// -------------------------- #useRandomFloat --------------------------
window.useRandomFloat = (min, max) => {
  return Math.random() * (max - min) + min;
};
useTests(`useRandomFloat`, () => {
  it("returns a float within the specified range", () => {
    const min = 0.5,
      max = 5.5;
    const float = window.useRandomFloat(min, max);
    assert(float >= min && float <= max && float % 1 !== 0);
  });
});

// -------------------------- #useRandomBool --------------------------
window.useRandomBool = () => {
  return Math.random() < 0.5;
};
useTests(`useRandomBool`, () => {
  it("returns a boolean value", () => {
    const value = useRandomBool();
    assert(typeof value === "boolean");
  });
  it("returns true or false randomly", () => {
    let trueCount = 0,
      falseCount = 0;
    for (let i = 0; i < 100; i++) {
      useRandomBool() ? trueCount++ : falseCount++;
    }
    assert(trueCount > 0 && falseCount > 0);
  });
});

// -------------------------- #useRandomStr --------------------------
window.useRandomStr = function (minLength = 1, maxLength = null) {
  if (maxLength === null) {
    maxLength = minLength;
    minLength = 1;
  }
  if (minLength > maxLength) {
    throw new Error("Minimum length cannot be greater than maximum length");
  }

  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};
useTests(`useRandomString`, () => {
  it("returns a string of a specified maximum length", () => {
    const length = 10;
    const str = window.useRandomStr(length);
    assert(typeof str === "string" && str.length <= length);
  });
  it("returns a string within the specified minimum and maximum length range", () => {
    const minLength = 5,
      maxLength = 10;
    const str = window.useRandomStr(minLength, maxLength);
    assert(
      typeof str === "string" &&
        str.length >= minLength &&
        str.length <= maxLength
    );
  });
  it("throws an error if the minimum length is greater than the maximum length", () => {
    let errorCaught = false;
    try {
      window.useRandomStr(10, 5);
    } catch (e) {
      errorCaught = true;
    }
    assert(errorCaught);
  });
});

// -------------------------- #useRandomDate --------------------------
window.useRandomDate = () => {
  const start = new Date(1970, 0, 1).getTime();
  const end = new Date().getTime();
  const randomTime = Math.floor(Math.random() * (end - start)) + start;
  return new Date(randomTime);
};
useTests(`useRandomDate`, () => {
  it("returns a Date object", () => {
    const date = window.useRandomDate();
    assert(date instanceof Date);
  });
  it("returns a valid date between 1970 and now", () => {
    const date = window.useRandomDate();
    const now = new Date();
    assert(date >= new Date(1970, 0, 1) && date <= now);
  });
  it("generates different dates over multiple calls", () => {
    const date1 = window.useRandomDate();
    const date2 = window.useRandomDate();
    assert(date1.getTime() !== date2.getTime());
  });
});

// -------------------------- #useArray --------------------------
window.useArray = (_) => {
  if (Array.isArray(_)) return _;
  else if (_ !== undefined) return [_];
  else return [];
};
useTests(`useArray`, () => {
  it("returns the array if the input is already an array", () => {
    const input = [1, 2, 3];
    return useArray(input) === input;
  });

  it("wraps a non-array input in an array", () => {
    const input = 42;
    const result = useArray(input);
    return Array.isArray(result) && result[0] === input;
  });

  it("returns an empty array when given as input", () => {
    const input = [];
    return useArray(input).length === 0;
  });

  it("returns a single-element array when given a string", () => {
    const input = "test";
    const result = useArray(input);
    return result.length === 1 && result[0] === input;
  });

  it("returns an empty list when value is undefined", () => {
    const input = undefined;
    const result = useArray(input);
    assert(result.matches([]));
  });
});

// -------------------------- #useFunction --------------------------
window.useFunction = function (input) {
  if (typeof input === "function") return input;
  else return () => input;
};
useTests("useFunction", () => {
  it("returns the function if the input is already a function", () => {
    const inputFunction = () => "test";
    return useFunction(inputFunction) === inputFunction;
  });

  it("wraps a non-function input into a function", () => {
    const input = "test";
    const resultFunction = useFunction(input);
    return typeof resultFunction === "function" && resultFunction() === input;
  });

  it("wraps an object into a function that returns the object", () => {
    const input = { key: "value" };
    const resultFunction = useFunction(input);
    return (
      typeof resultFunction === "function" && resultFunction().key === "value"
    );
  });

  it("wraps undefined into a function that returns undefined", () => {
    const input = undefined;
    const resultFunction = useFunction(input);
    return (
      typeof resultFunction === "function" && resultFunction() === undefined
    );
  });

  it("wraps a number into a function that returns the number", () => {
    const input = 42;
    const resultFunction = useFunction(input);
    return typeof resultFunction === "function" && resultFunction() === input;
  });
});

// -------------------------- #useFunctionResult --------------------------
window.useFunctionResult = function (value, ...args) {
  if (typeof value === "function" && !/^class\s/.test(value.toString()))
    return value(...args);
  return value;
};
useTests(`useFunctionResult`, () => {
  it("returns the result of the function when the input is a function", () => {
    assert(useFunctionResult(() => 42) === 42);
  });

  it("returns the input as is when it's not a function", () => {
    assert(useFunctionResult("Hello") === "Hello");
  });

  it("passes the args into the function", () => {
    const fn = (...args) => args;
    assert(useFunctionResult(fn, 1, 2, 3).matches([1, 2, 3]));
  });
});

// -------------------------- #setCursor --------------------------
// window.setCursor = (startNode, startOffset, endNode, endOffset) => {
//   const selection = window.getSelection();
//   const range = document.createRange();
//   range.setStart(startNode, startOffset);
//   range.setEnd(endNode || startNode, endOffset || startOffset);
//   selection.removeAllRanges();
//   selection.addRange(range);
//   return true;
// };
// useTests("setCursor", () => {
//   it("moves the cursor to the correct single spot when no endNode", () => {
//     div.innerText = `hello world`;
//     setCursor(div.firstChild, 3);

//     const r = getSelection().getRangeAt(0);
//     assert(r.startContainer === div.firstChild);
//     assert(r.endContainer === div.firstChild);
//     assert(r.startOffset === 3);
//     assert(r.endOffset === 3);
//   });
//   it("moves the cursor to the correct nodes/offsets", () => {
//     div.innerText = `hello world`;
//     span.innerText = `this is cool`;

//     setCursor(div.firstChild, 3, span.firstChild, 2);

//     const r = getSelection().getRangeAt(0);
//     assert(r.startContainer === div.firstChild);
//     assert(r.endContainer === span.firstChild);
//     assert(r.startOffset === 3);
//     assert(r.endOffset === 2);
//   });
// });
window.setCursor = (startNode, startOffset, endNode, endOffset) => {
  const selection = window.getSelection();
  const range = document.createRange();

  const adjustOffset = (node, offset) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return { node, offset };
    }

    let currentOffset = offset;
    let currentNode = node.firstChild;

    while (currentNode) {
      const nodeLength =
        currentNode.nodeType === Node.TEXT_NODE
          ? currentNode.nodeValue.length
          : currentNode.textContent.length;

      if (currentOffset <= nodeLength) {
        return adjustOffset(currentNode, currentOffset);
      }

      currentOffset -= nodeLength;
      currentNode = currentNode.nextSibling;
    }

    return { node, offset: node.childNodes.length };
  };

  const start = adjustOffset(startNode, startOffset);
  const end = adjustOffset(endNode || startNode, endOffset || startOffset);

  try {
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  } catch (e) {
    console.error("Error setting cursor range:", e);
    return false;
  }
};
useTests("window.setCursor", () => {
  it("sets the cursor within a text node correctly", () => {
    div.innerText = `hello world`;
    window.setCursor(div.firstChild, 6);

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === div.firstChild);
    assert(r.endContainer === div.firstChild);
    assert(r.startOffset === 6);
    assert(r.endOffset === 6);
  });

  it("sets the cursor within nested elements correctly", () => {
    const span = document.createElement("span");
    span.innerText = `world`;
    div.innerText = `hello `;
    div.appendChild(span);
    window.setCursor(div, 9); // Move cursor to "world"

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === span.firstChild);
    assert(r.endContainer === span.firstChild);
    assert(r.startOffset === 3);
    assert(r.endOffset === 3);
  });

  it("sets the cursor at the start of an element node", () => {
    div.innerText = `hello world`;
    window.setCursor(div, 0);

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === div.firstChild);
    assert(r.endContainer === div.firstChild);
    assert(r.startOffset === 0);
    assert(r.endOffset === 0);
  });

  it("sets the cursor at the end of an element node", () => {
    div.innerText = `hello world`;
    window.setCursor(div, div.textContent.length);

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === div.firstChild);
    assert(r.endContainer === div.firstChild);
    assert(r.startOffset === 11);
    assert(r.endOffset === 11);
  });

  it("sets a range selection within an element node", () => {
    div.innerText = `hello world`;
    window.setCursor(div.firstChild, 2, div.firstChild, 8);

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === div.firstChild);
    assert(r.endContainer === div.firstChild);
    assert(r.startOffset === 2);
    assert(r.endOffset === 8);
  });
});

// -------------------------- #useCursoAtOffset --------------------------
window.setCursorAtOffset = (node, offset) => {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  let i = 0;

  while (current) {
    const textLength = current.nodeValue.length;
    if (textLength && i + textLength >= offset)
      return setCursor(current, offset - i);
    i += textLength;
    current = walker.nextNode();
  }

  return setCursor(
    node,
    node.nodeType === Node.TEXT_NODE ? node.length : node.children.length
  );
};
useTests("setCursorAtOffset", () => {
  it("moves the cursor to the correct offset in the node", () => {
    const child1 = document.createElement("div");
    child1.innerText = "abc";
    const child2 = document.createElement("span");
    child2.innerText = "def";
    div.append(child1, child2);
    setCursorAtOffset(div, 5);

    const r = getSelection().getRangeAt(0);
    assert(r.startContainer === child2.firstChild);
    assert(r.endContainer === child2.firstChild);
    assert(r.startOffset === 2);
    assert(r.endOffset === 2);
  });
});

// -------------------------- #getCursorIndex --------------------------
window.getCursorIndex = (node) => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  const focusNode = selection.focusNode;
  const focusOffset = selection.focusOffset;

  // Ensure the focus node is within the node of interest
  if (!node.contains(focusNode)) {
    return null;
  }

  let offset = 0;
  let currentNode = focusNode;

  // Traverse the node's children and sum up the text lengths until we reach the focusNode
  while (currentNode && currentNode !== node) {
    if (currentNode.previousSibling) {
      currentNode = currentNode.previousSibling;
      offset += currentNode.textContent.length;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  // Add the focusOffset within the focusNode
  offset += focusOffset;

  return offset;
};

useTests("getCursorIndex", () => {
  it("returns the correct offset for a focused text node within a div", () => {
    div.innerText = `hello world`;
    setCursor(div.firstChild, 6); // Move cursor to after "hello "
    const offset = getCursorIndex(div);
    assert(offset === 6);
  });
  it("returns the correct offset for a nested text node", () => {
    const span = document.createElement("span");
    span.innerText = `world`;
    div.innerText = `hello `;
    div.appendChild(span);
    setCursor(span.firstChild, 3); // Move cursor to "wor|ld"
    const offset = getCursorIndex(div);
    assert(offset === 9); // "hello " (6) + "wor" (3) = 9
  });
  it("returns null if the focus is outside the given node", () => {
    const outsideDiv = document.createElement("div");
    outsideDiv.innerText = `    `;
    document.body.appendChild(outsideDiv);
    setCursor(outsideDiv.firstChild, 3); // Move cursor to "out|side"
    const offset = getCursorIndex(div);
    assert(offset === null);

    outsideDiv.remove();
  });
});

// -------------------------- #setSelection --------------------------
window.setSelection = (node, selection) => {
  const [start, end] = selection;
  const range = document.createRange();
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  let i = 0,
    startNode = null,
    startOffset = 0,
    endNode = null,
    endOffset = 0;

  while (current) {
    const textLength = current.nodeValue.length;
    if (!startNode && i + textLength >= start) {
      startNode = current;
      startOffset = start - i;
    }
    if (i + textLength >= end) {
      endNode = current;
      endOffset = end - i;
      break;
    }
    i += textLength;
    current = walker.nextNode();
  }

  if (startNode && endNode) {
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }
  return false;
};

useTests(
  "setSelection",
  () => {
    it("sets the correct range within the node", () => {
      const child1 = document.createElement("div");
      child1.innerText = "abc";
      const child2 = document.createElement("span");
      child2.innerText = "def";
      div.append(child1, child2);
      setSelection(div, [1, 5]);

      const r = getSelection().getRangeAt(0);
      assert(r.startContainer === child1.firstChild);
      assert(r.endContainer === child2.firstChild);
      assert(r.startOffset === 1);
      assert(r.endOffset === 2);
    });
  }
  // { only: true }
);

// -------------------------- #useDebounce --------------------------
function useDebounce(fn, delay) {
  let timeoutId;

  return (...args) => {
    // Clear the previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
useTests("useDebounce", () => {
  it("debounces the function call", async () => {
    const log = [];
    const debouncedLog = useDebounce((message) => {
      log.push(message);
    }, 1);

    debouncedLog("Hello");
    debouncedLog("Hello again");

    await sleep(1);
    assert(log.length === 1);
    assert(log[0] === "Hello again");
  });

  it("executes function after the delay", async () => {
    const log = [];
    const debouncedLog = useDebounce((message) => {
      log.push(message);
    }, 1);

    debouncedLog("Hello");

    await sleep(1);
    assert(log.length === 1);
    assert(log[0] === "Hello");
  });

  it("does not execute function if called again before delay", async () => {
    const log = [];
    const debouncedLog = useDebounce((message) => {
      log.push(message);
    }, 3);

    debouncedLog("Hello");
    await sleep(1);
    debouncedLog("Hello again");

    await sleep(1);
    assert(log.length === 1);
    assert(log[0] === "Hello again");
  });
});

// -------------------------- #useCollectionParser --------------------------
window.useCollectionParser = (
  collection,
  { match, consume, parse, allowIgnoreOverride }
) => {
  let cursor = 0;
  let isEating = false;

  const taste = (...args) => {
    const _cursor = cursor;
    const results = [];
    let options = args.find((a) => a && typeof a === "object" && a.ignore) || {
      ignore: [],
    };
    options.ignore = useArray(options.ignore);
    let tokenSequence = args.filter(
      (a) => a && (typeof a !== "object" || !a.ignore)
    );
    if (!tokenSequence.length) tokenSequence = [null];
    const helpers = {
      getCollection: () => collection,
      setCollection: (c) => (collection = c),
      getCursor: () => cursor,
      setCursor: (c) => (cursor = c),
    };

    for (let i = 0; i < tokenSequence.length; i++) {
      let thingsToTryTasting =
        tokenSequence[i] === undefined
          ? [undefined]
          : useArray(tokenSequence[i]);

      const consumeIgnoredThings = (ignoredThings) => {
        const ignored = [];
        let foundMatch;
        while ((foundMatch = consumeIgnoredThing(ignoredThings))) {
          ignored.push(foundMatch);
        }
        return ignored;
      };
      const consumeIgnoredThing = (ignoredThings) => {
        for (const ignoredThing of ignoredThings)
          if (match(ignoredThing, helpers)) {
            consume(ignoredThing, helpers);
            return ignoredThing;
          }
      };
      const isWildcard = (things) => {
        return (
          !!things &&
          (things.length === 0 ||
            (things.length === 1 &&
              typeof things[0] === "object" &&
              things[0] &&
              things[0].hasAnyOwnProperty("to", "upTo", "ignore")))
        );
      };
      const consumeWildcard = (wildcard) => {
        let { to, upTo, ignore = [] } = wildcard.length ? wildcard[0] : {};
        ignore = useArray(ignore);

        const hasSequentalDelimeter = tokenSequence[i + 1];
        let delimeters = useArray(tokenSequence[i + 1] || upTo || to || []);
        if (hasSequentalDelimeter) tokenSequence.splice(i + 1, 1);

        let callCount = 0;
        if (delimeters.length) {
          const shouldConsumeDelimeter = to || hasSequentalDelimeter;
          while (cursor < collection.length && callCount++ < 100000) {
            consumeIgnoredThings([...ignore, ...options.ignore]);

            const matchingDelimeter = delimeters.find((d) => match(d, helpers));
            if (matchingDelimeter) {
              if (shouldConsumeDelimeter)
                results.push(consume(matchingDelimeter, helpers));
              break;
            } else results.push(consume(null, helpers));
          }
        } else
          while (cursor < collection.length && callCount++ < 100000) {
            consumeIgnoredThings([...ignore, ...options.ignore]);
            results.push(consume(null, helpers));
          }

        return true;
      };

      if (isWildcard(thingsToTryTasting)) consumeWildcard(thingsToTryTasting);
      else {
        let matchFound;

        const tryTasting = (hasAlreadyConsumedIgnoredThings = false) => {
          for (let i = 0; i < thingsToTryTasting.length && !matchFound; i++) {
            let thingToTryTasting = useFunctionResult(thingsToTryTasting[i]);

            if (thingToTryTasting === undefined) thingToTryTasting = null;

            if (isWildcard(thingToTryTasting))
              matchFound = consumeWildcard(thingToTryTasting);
            else if (
              hasAlreadyConsumedIgnoredThings &&
              thingToTryTasting === null &&
              cursor < collection.length - 1
            ) {
              results.push(consume(thingToTryTasting, helpers));
              matchFound = true;
            } else if (
              (thingToTryTasting !== null || hasAlreadyConsumedIgnoredThings) &&
              match(thingToTryTasting, helpers)
            ) {
              results.push(consume(thingToTryTasting, helpers));
              matchFound = true;
            }
          }
        };

        if (allowIgnoreOverride) {
          let consumedIgnoredThing;
          do tryTasting(false);
          while (!matchFound && consumeIgnoredThing(options.ignore));
          if (!matchFound) tryTasting(true);
        } else {
          consumeIgnoredThings(options.ignore);
          tryTasting(true);
        }

        if (!matchFound) {
          cursor = _cursor;
          return null;
        }
      }
    }
    if (!isEating) cursor = _cursor;
    return results;
  };

  const eat = (...args) => {
    isEating = true;
    let tasted = null;
    try {
      tasted = taste(...args);
    } finally {
      isEating = false;
    }
    return tasted;
  };

  return parse({
    taste,
    eat,
    getCursor: () => cursor,
    setCursor: (c) => (cursor = c),
    getCollection: () => collection,
    setCollection: (c) => (collection = c),
  });
};
useTests("useCollectionParser", () => {
  let matchCount, consumeCount;
  let collection = [..."abcdefghijklmnopqrstuvwxyz"];
  const match = (matcher, { getCollection, getCursor, setCursor }) =>
    getCollection()[getCursor()] === matcher;

  const consume = (_matcher, { getCollection, getCursor, setCursor }) => {
    const result = getCollection()[getCursor()];
    setCursor(getCursor() + 1);
    return result;
  };

  it("returns whatever is returned from the parse function", () => {
    assert(useCollectionParser([], { parse: () => "finny" }) === "finny");
  });
  it("prvides an eat function which tastes the tokens and increments the cursor", () => {
    // eat is pretty much just a wrapper around taste with cursor control logic, see taste tests for specifics on the parameter api
    useCollectionParser(collection, {
      match,
      consume,
      parse: ({ eat, getCursor, setCursor }) => {
        eat("a", "b");
        assert(getCursor() === 2);

        setCursor(0);
        assert(eat("c") === null);
        assert(getCursor() === 0);
      },
    });
  });

  // taste
  it("undefined/null tokens", () => {
    useCollectionParser(collection, {
      match,
      consume,
      parse: ({ taste, getCursor, setCursor }) => {
        assert(taste().matches(["a"]));
        assert(taste(undefined).matches(["a"]));
        assert(taste(null).matches(["a"]));
        assert(taste(null, { ignore: [] }).matches(["a"]));

        assert(taste(null, { ignore: "a" }).matches(["b"]));
        assert(taste(null, { ignore: ["a", "b"] }).matches(["c"]));

        assert(getCursor() === 0);

        setCursor(1);
        assert(taste().matches(["b"]));

        setCursor(Infinity);
        assert(taste() === null);
      },
    });
  });
  it("single tokens", () => {
    useCollectionParser(collection, {
      match,
      consume,
      parse: ({ taste, getCursor, setCursor }) => {
        assert(taste("a").matches(["a"]));
        assert(taste("b") === null);
        assert(taste("b", { ignore: "a" }).matches(["b"]));
        assert(taste("b") === null);
        assert(taste("c", { ignore: ["a", "b"] }).matches(["c"]));

        assert(getCursor() === 0);
      },
    });
  });
  it("multiple tokens", () => {
    useCollectionParser(collection, {
      match,
      consume,
      parse: ({ taste, getCursor }) => {
        assert(taste("a", "b").matches(["a", "b"]));
        assert(taste("b", "c") === null);
        assert(taste("b", "c", { ignore: "a" }).matches(["b", "c"]));

        assert(taste("b", "c", { ignore: "a" }).matches(["b", "c"]));
        assert(taste("c", "d", { ignore: ["a", "b"] }).matches(["c", "d"]));

        assert(getCursor() === 0);
      },
    });
  });
  it("conditional tokens", () => {
    useCollectionParser(collection, {
      match,
      consume,
      parse: ({ taste, getCursor }) => {
        assert(taste(["a"]).matches(["a"]));
        assert(taste(["b", "a"]).matches(["a"]));
        assert(taste(["b", "a"], "b", ["c", "d"]).matches(["a", "b", "c"]));

        assert(getCursor() === 0);
      },
    });
  });
  it("wildcard tokens", () => {
    useCollectionParser(collection, {
      match,
      consume,
      parse: ({ taste, getCursor }) => {
        assert(taste([]).matches(collection));
        assert(taste([], []).matches(collection));
        assert(
          taste([], { ignore: ["a", "c"] }).matches([
            "b",
            ...collection.slice(3),
          ])
        );
        assert(
          taste([{ ignore: ["a", "c"] }]).matches(["b", ...collection.slice(3)])
        );
        assert(
          taste([{ ignore: ["a", "c"] }], { ignore: "d" }).matches([
            "b",
            ...collection.slice(4),
          ])
        );
        assert(taste("a", [], "d").matches(["a", "b", "c", "d"]));
        assert(taste("a", [{ to: "c" }]).matches(["a", "b", "c"]));
        assert(taste("a", [{ upTo: "d" }]).matches(["a", "b", "c"]));
        assert(taste("a", [{ to: "c", upTo: "c" }]).matches(["a", "b", "c"]));
        assert(
          taste("a", [{ to: "c", ignore: "b" }], "f").matches([
            "a",
            "c",
            "d",
            "e",
            "f",
          ])
        );
        assert(
          taste("a", [{ ignore: "b" }], "f", { ignore: "b" }).matches([
            "a",
            "c",
            "d",
            "e",
            "f",
          ])
        );
        assert(taste([], "a").matches(["a"]));
        assert(taste("a", [], "b").matches(["a", "b"]));

        assert(getCursor() === 0);
      },
    });
  });
  it("wildcard + conditional tokens", () => {
    useCollectionParser(collection, {
      match,
      consume,
      parse: ({ taste, getCursor }) => {
        assert(taste("a", ["c", [{ to: "d" }]]).matches(["a", "b", "c", "d"]));
        assert(
          taste("a", ["c", [{ ignore: "b" }]], "d").matches(["a", "c", "d"])
        );

        assert(getCursor() === 0);
      },
    });
  });
  it("repeated ignore tokens", () => {
    useCollectionParser([...`abcbcbcbcd`], {
      match,
      consume,
      parse: ({ taste, getCursor }) => {
        assert(
          taste([{ to: "d" }], { ignore: ["b", "c"] }).matches(["a", "d"])
        );
        assert(
          taste([{ to: "d", ignore: "b" }], { ignore: "c" }).matches(["a", "d"])
        );
        assert(taste([{ to: "d", ignore: ["b", "c"] }]).matches(["a", "d"]));
      },
    });
  });
  it("option to allow regex to override ignored items", () => {
    useCollectionParser([...`abcbcbcbcd`], {
      match,
      consume,
      parse: ({ taste, getCursor }) => {
        assert(taste("a", "b", { ignore: "a" }).matches(["a", "b"]));
      },
      allowIgnoreOverride: true,
    });
  });
  it("allows values returned from function", () => {
    useCollectionParser(collection, {
      match,
      consume,
      parse: ({ taste, getCursor, setCursor }) => {
        assert(
          taste(
            () => "a",
            () => "b"
          ).matches(["a", "b"])
        );
      },
    });
  });
});

// -------------------------- #simple parser --------------------------
const T_COLORS = {
  BOOLEAN: `#FF9D65`,
  FUN_FIELD: `#7AA2F7`,
  FIELD: `#7DCFFF`,
  ELEMENT: "#F7768E",
  TEXT: `#FFF`,
  KEYWORD: `#7AA2F7`,
  STRING_DOUBLE: `#9ECE6A`,
  STRING_TEMPLATE: `#9ECE6A`,
  STRING_TEXT: `#9ECE6A`,
  ESCAPED_CHAR: `#88DDFF`,
  IDENTIFIER: `#BB9AF7`,
  NUMBER: `#FF9D65`,
  COMMENT: `#444B6A`,
  LINE_COMMENT: `#444B6A`,
  KEY: `#73DACA`,
  OP: `#88DDFF`,
  PARAMETER: `#E0AF67`,
  ERROR: `#F7768E`,
  RETURN: `#BB9AF7`,
};
window.T_COLORS = T_COLORS;

const T = {
  ANYTHING: /^[\s\S]/,
  NOTHING: /^\b\B/,
  END: /^$/,
  LINE: /^[^\n]*/,

  UNKNOWN: /^[\s\S]/,
  MISSING: /(?!.|^)/,

  NEW_LINE: /^(\r\n|\r|\n)/,
  WHITE_SPACE: /^[ \u00A0]+/,
  EMPTY_LINES: /^(?:\r?\n\s*)+/,
  TAB: /^\t/,

  COMMA: /^,/,
  PERIOD: /^\./,
  SEMICOLON: /^;/,
  COLON: /^:/,
  EXCLAMATION: /^!/,
  QUESTION: /^\?/,

  SLASH: /^\//,
  BACKSLASH: /^\\/,

  PIPE: /^\|/,
  TILDE: /^~/,
  BACK_TICK: /^`/,
  AT: /^@/,
  HASH: /^#/,
  DOLLAR: /^\$/,
  PERCENT: /^%/,
  CARET: /^\^/,
  AMPERSAND: /^&/,
  ASTERISK: /^\*/,
  UNDERSCORE: /^_/,

  LEFT_PAREN: /^\(/,
  RIGHT_PAREN: /^\)/,

  LEFT_CURLY: /^\{/,
  RIGHT_CURLY: /^\}/,

  LEFT_BRACKET: /^\[/,
  RIGHT_BRACKET: /^\]/,

  MINUS: /^-/,
  PLUS: /^\+/,
  EQUAL: /^=/,
  LESS_THAN: /^</,
  GREATER_THAN: /^>/,
  INCREMENT: /^\+\+/,
  DECREMENT: /^--/,

  QUOTE: /^"/,
  SINGLE_QUOTE: /^'/,

  NUMBER: /^\d*\.?\d+(?:[Ee][-+]?\d+)?/,
  INTEGER: /^\d+/,
  FLOAT: /^\d*\.\d+/,
  HEX: /^0x[a-fA-F0-9]+/,
  OCTAL: /^0o[0-7]+/,
  BINARY: /^0b[01]+/,

  IDENTIFIER: /^[a-zA-Z_$][a-zA-Z0-9_$]*/,
  TYPE: /^:[a-zA-Z_][a-zA-Z0-9_]*/,

  STRING_DOUBLE: /^"([^"\\]*(\\.[^"\\]*)*)"/,
  STRING_SINGLE: /^'([^'\\]*(\\.[^'\\]*)*)'/,

  LINE_COMMENT: /^\/\/.*/,
  BLOCK_COMMENT_START: /^\/\*/,
  BLOCK_COMMENT_END: /^\*\//,

  ASSIGN: /^=(?!=)/,
  ADD_ASSIGN: /^\+=/,
  SUBTRACT_ASSIGN: /^\-=/,
  MULTIPLY_ASSIGN: /^\*=/,
  DIVIDE_ASSIGN: /^\/=/,
  MODULO_ASSIGN: /^%=/,
  EXPONENT_ASSIGN: /^\^=/,

  ADD: /^\+(?!=|\+)/,
  SUBTRACT: /^\-(?!=|-)/,
  MULTIPLY: /^\*(?!=)/,
  DIVIDE: /^\/(?!=|\/)/,
  MODULO: /^%(?!=)/,
  EXPONENT: /^\^(?!=)/,

  COMPARE: /^(<=|>=|!=|==|<|>|in\b)/,

  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  ARROW: /^=>/,
  AND: /^and\b/,
  OR: /^or\b/,
  NOT: /^not\b/,
  FUN: /^fun\b/,
  RETURN: /^return\b/,
  FOR: /^for\b/,
  IN: /^in\b/,
  OF: /^of\b/,
  WHILE: /^while\b/,
  DO: /^do\b/,
  BREAK: /^break\b/,
  CONTINUE: /^continue\b/,
  IF: /^if\b/,
  ELIF: /^elif\b/,
  ELSE: /^else\b/,

  EQUALITY: /^==/,
  INEQUALITY: /^\!=/,
  LESS_THAN_EQUAL: /^<=/,
  GREATER_THAN_EQUAL: /^>=/,

  RANGE: /^\.\./,
  RANGE_EQUAL: /^\.=/,

  MARKDOWN_TEXT: /^.*?(?=[*_`{](?=\S)|\n|$)/,
  MARKDOWN_TEXT_FORMATTER: /^[*_`{]/,
  MARKDOWN_WORD: /^[*_`{]/,
  WORD: /^\S+\s*/,
  SPACER: /^\s*(\n|$)/,
  LIST_ITEM: /^ *(-|\d*\.) /,
  CHECKBOX: /^\[.{0,1}\]/,
  HEADING: /^#+ /,
  BLOCKQUOTE: /^> /,
  HORIZONTAL_RULE: /^---/,
  DISPLAY_CODE_BLOCK: /^```\w*/,

  PARAGRAPH_END: /^(\n\n)|$/,
  PARAGRAPH_TEXT: /^[^\\{*`_~\n]+/,
  PARAGRAPH_TEXT_UNDERLINE: /^__/,
  STRING_TEXT: /^[^"\\{]+/,
  ESCAPED_CHAR: /^\\[^\s\n]/,

  CSS_VAR: /^--[\w-]+/,
  CSS_PSEUDO: /^(:[a-z-]+(\([^\)]+\))?|::[a-z-]+)/,
  CSS_DURATION_DELAY: /^\d+(?:\.\d+)?(s|ms)/,
  CSS_TIMING_FUNCTION:
    /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)/,
  CSS_ITERATION_COUNT: /^(\d+(?:\.\d+)?|infinite)/,
  CSS_DIRECTION: /^(normal|reverse|alternate|alternate-reverse)/,
  CSS_PLAY_STATE: /^(running|paused)/,
  CSS_FILL_MODE: /^(none|forwards|backwards|both)/,
  CSS_ID: /^#([a-zA-Z_][a-zA-Z0-9_-]*)/,
  CSS_CLASS: /^\.([a-zA-Z_][a-zA-Z0-9_-]*)/,

  HTML_BOOLEAN_ATTR: /^:([a-zA-Z_][a-zA-Z0-9_]*)/,
  HTML_ATTR_PREFIX: /^([a-zA-Z_][a-zA-Z0-9_]*:)/,
  HTML_TAG_NAME: /^\|\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\|/,
  HTML_EVENT_PROP: /^on[a-z_]+$/,
  COLORS: {},
};
Object.entries(T).forEach(([key, value]) => {
  value.type = key;
  value.REGEX = true;
});
window.T = T;

// -------------------------- #$AST --------------------------
const WHITESPACE_REGEX = /(?:[ ]+\n?|\n)/y;

class $AST {
  static AST = true;
  static fallbackToFirstExp = true;
  static allowIncompleteParse = false;
  static incompleteParseThreshold = 1;
  static s = ``;

  constructor({ exps = [], ...rest } = {}) {
    Object.assign(this, rest);

    this.id = useId();
    this._exps = exps;
    this._tokens = [];
    this.exps.forEach((exp, i) => {
      if (exp.TOKEN) this._tokens.push(exp);
      else if (exp.AST) this._tokens.push(...exp.tokens);
    });

    this._text = this.tokens.map((t) => t.value).join("");

    this.s = this.constructor.s;
    this.name = this.constructor.name;
    this.AST = true;
  }
  get exps() {
    return this._exps;
  }
  get tokens() {
    return this._tokens;
  }
  get text() {
    return this._text;
  }
  get lineStart() {
    return this.exps[0] ? this.exps[0].lineStart : 0;
  }
  get lineEnd() {
    return this.exps.at(-1) ? this.exps.at(-1).lineEnd : 0;
  }
  toSimpleObj(lineStart = 0, lineEnd = Infinity, offset = 0) {
    return {
      exps: this.exps
        .filter((e) => {
          // console.log(e, e.lineStart, e.lineEnd, lineStart, lineEnd);
          return (
            e.lineStart <= lineEnd + offset && e.lineEnd >= lineStart - offset
          );
        })
        .map((e) => e.toSimpleObj(lineStart, lineEnd, offset)),
      name: this.name,
      lineStart: this.lineStart,
      lineEnd: this.lineEnd,
      s: this.s,
    };
  }

  getVisibleTokens(lineStart = 0, lineEnd = Infinity) {
    const tokens = [];

    this.exps.forEach((exp) => {
      if (exp.AST) tokens.push(...exp.getVisibleTokens(lineStart, lineEnd));
      else if (
        exp.TOKEN &&
        exp.lineStart <= lineEnd &&
        exp.lineEnd >= lineStart
      )
        tokens.push({
          value: exp.value,
          s: exp.s,
          line: exp.line,
          col: exp.col,
          indent: exp.indent,
          astName: this.name.slice(1),
          astId: this.id,
        });
    });
    return tokens;
  }

  static parse(_ = new Lexer()) {
    parseCalls++;
    const startCursor = _.cursor;
    let firstExpCursor = _.cursor;
    let firstExp = null;
    const exps = [];

    for (let shapeIndex = 0; shapeIndex < this.SHAPE.length; shapeIndex++) {
      let shapeExp = this.SHAPE[shapeIndex];

      let results = shapeExp.parse(_);

      const isFirstAST = results && !shapeExp.TEXT_EXP && shapeIndex === 0;
      if (isFirstAST) {
        firstExp = results[0];
        firstExpCursor = _.cursor;
      }

      if (results) {
        exps.push(...results);
      } else if (
        this.allowIncompleteParse &&
        exps.filter((e) => e.AST || e.value.trim().length).length >=
          this.incompleteParseThreshold
      ) {
        const token = new Token(_.eat(new RegExp()));
        token.isMissing = true;
        token.shapeExp = shapeExp;
        exps.push(token);
      } else if (this.fallbackToFirstExp) {
        _.cursor = firstExpCursor;
        return firstExp;
      } else {
        _.cursor = startCursor;
        return null;
      }
    }

    return new this({ exps });
  }
}

// -------------------------- #Token --------------------------
class Token {
  constructor({
    type = T.UNKNOWN,
    value = "",
    start = 0,
    end = 0,
    line = 0,
    col = undefined,
    indent = 0,
    ...rest
  } = {}) {
    this.type = type;
    this.value = value;
    this.start = start;
    this.indent = indent;
    this._line = line;
    this.col = col || start;
    this.end = end;

    Object.assign(this, rest);
    this.TOKEN = true;
  }

  get text() {
    return this.value;
  }
  get line() {
    return this._line; //+ this.value.count("\n");
  }
  get lineStart() {
    return this.line;
  }
  get lineEnd() {
    return this.line;
  }
  toSimpleObj() {
    return {
      value: this.value,
      line: this.line,
      col: this.col,
      s: this.s,
    };
  }

  get s() {
    return this.shapeExp ? this.shapeExp.s || "" : "";
  }
}

// -------------------------- #HippieEditor --------------------------
class HistoryStack {
  constructor() {
    this._active = null;
    this._stack = [];
  }

  // should be called on any user events or when switching from letters/spaces etc.
  commit() {
    this._active = null;
  }

  push(oldText, newText) {
    const newRedo = oldText.diff(newText);
    const newUndo = newText.diff(oldText);

    const isKeystroke = newRedo.value.length === 1;
    const isBackspace = newUndo.start === newUndo.end && !newRedo.value;
    const key = isBackspace ? "Backspace" : isKeystroke ? newRedo.value : "";

    if (this._active && this._active.key && key) {
      const activeIsSingleSpace =
        this._active.key === " " && this._active.end - this._active.start === 1;
      const bothBackspaces = isBackspace && this._active.key === "Backspace";
      const bothWhitespace = !this._active.key.trim() && !key.trim();
      const bothCharacters =
        this._active.key.trim() &&
        this._active.key.length === 1 &&
        key.trim() &&
        key.length === 1;
      const bothSameType =
        bothBackspaces ||
        bothWhitespace ||
        bothCharacters ||
        activeIsSingleSpace;
      const bothAdjacent =
        newRedo.start === this._active.end ||
        newRedo.end === this._active.start;

      if (bothSameType && bothAdjacent) {
        const start =
          this._active.start <= newUndo.start ? this._active : newUndo;
        const end = start === this._active ? newUndo : this._active;

        this._active.start = start.start;
        this._active.end = end.end;
        this._active.value = start.value + end.value;
        this._active.key = key;
        return;
      }
    }

    this._stack.push({ ...newUndo, key });
    this._active = this.peek();
  }
  pop() {
    return this._stack.pop();
  }
  peek() {
    return this._stack.at(-1);
  }
  clear() {
    this._stack.length = 0;
  }
}

window.HippieEditor = ({ code, s = "" }) => {
  let editorDOM,
    cursorDOM,
    selectionDOM = document.body;
  let rootAST = $CODE.parse(new Lexer(code));
  // console.log(rootAST);
  // console.log(rootAST.toSimpleObj());
  const LINE_RENDER_OFFSET = 0;
  const _ = useState({
    cursor: 0,
    tokens: rootAST.getVisibleTokens().map((t) => t.toSimpleObj()),
    visibleASTs: [],
    lineHeight: 24,
    scroll: 0,
    selection: [0, 0],
    selectionRects: [],
    rootSimpleAST: null,
    editorHeight: 0,
    text: rootAST.text,
    isCursorVisible: true,
  });

  const undoStack = new HistoryStack();
  const redoStack = new HistoryStack();

  const updateVisibleASTs = () => {
    let visibleAST = { ..._.rootSimpleAST, exps: [] };
    let current = visibleAST;
    const checkSimpleAST = (simpleAST) => {
      simpleAST.exps.forEach((exp) => {
        // if(exp.TOKEN)
      });
    };
  };

  const ASTExpElement = ({ exp }) => {
    return (
      <span
        name={() => exp.name || (exp.value.trim() ? "token" : "whitespace")}
        // style="display: inline; white-space:pre-wrap"
        s={[
          () =>
            `relative inline ws:pre-wrap ${
              exp.s || ""
            } |::selection| bg:transparent`,
        ]}
      >
        {() => exp.value}
        {() => (
          <list _={() => exp.exps || []}>
            {(exp) => <ASTExpElement exp={exp} />}
          </list>
        )}
      </span>
    );
  };
  const ASTToken = ({ exp }) => {
    return (
      <span
        name={() => (exp.value.trim() ? "token" : "whitespace")}
        s={[
          () => `relative inline ws:pre-wrap |::selection| bg:transparent`,
          exp.s,
        ]}
      >
        {() => exp.value}
      </span>
    );
  };

  let cursorVisibilityInterval = null;
  const resetCursorVisibility = () => {
    clearInterval(cursorVisibilityInterval);
    _.isCursorVisible = true;
    cursorVisibilityInterval = setInterval(
      () => (_.isCursorVisible = !_.isCursorVisible),
      500
    );
  };
  resetCursorVisibility();

  const getLineStart = () => Math.trunc(_.scroll / _.lineHeight);
  const getLineEnd = () =>
    getLineStart() + Math.trunc(_.editorHeight / _.lineHeight);

  let isCursorValid = false;
  let start = 0;

  /*
  PROBLEM:
    - The <list /> tag's rendering isn't optimized for the type of fast updates that are required for scrolling rendering, because it's inline swapping it ends up having to re-render massive subtrees that have already been drawn just because a whitespace is added/removed etc.

    partially the problem continues to be that we're trying to render the AST, another problem is that we're re-doing a bunch of work. Perhaps the <list /> is just not sufficient for this type of problem, we may need a custom rendering solution.

    What's the core of this rendering paradigm, maybe there's a general purpose thing I can add to hippie <free-list /> or something like that...
    
  */

  return (
    <editor
      s={[
        `block cc:transparent w:100% h:100% ol:none p:1em overy:hidden mt:20px `,
        () => `lh:${_.lineHeight}px`,
        s,
      ]}
      spellcheck={false}
      tabindex="0"
      contentEditable
      onkeydown={(e) => {
        const dom = e.target;
        const key = e.key;
        const isTab = e.key === "Tab";
        const isBackTab = isTab && e.shiftKey;
        const isBackspace = key === "Backspace";
        const isEnter = key === "Enter";
        const isHistory = key === "z" && e.metaKey;
        const isPasting = key === "v" && e.metaKey;
        const isCopying = key === "c" && e.metaKey;
        const isCutting = key === "x" && e.metaKey;
        const isSelectingAll = key === "a" && e.metaKey;
        const selection = _.selection;
        const hasSelection = selection[0] !== selection[1];

        if (isSelectingAll) return;
        if (e.key.length > 1 && !isTab && !isBackspace && !isEnter) return;
        e.preventDefault();

        const startingCursor = _.cursor;
        let cursor = startingCursor;
        const startingText = dom.textContent;
        let newText = startingText;
        const tab = `  `;

        const lexer = new Lexer(newText);
        const selectedLines = lexer.linesInRange(selection[0], selection[1]);

        // ________________________________
        if (isHistory) {
          const stack = e.shiftKey ? redoStack : undoStack;
          const otherStack = stack === undoStack ? redoStack : undoStack;

          let diff = stack.pop();
          if (!diff) return;

          newText = newText.removeAt(diff.start, diff.end - diff.start);
          newText = newText.insertAt(diff.start, diff.value);
          cursor = diff.start + diff.value.length;

          otherStack.commit();
          otherStack.push(startingText, newText);
        } else {
          if (hasSelection && (!isTab || selectedLines.length < 2)) {
            const [start, end] = selection;
            if (isCopying || isCutting) {
              navigator.clipboard.writeText(newText.slice(start, end));
              if (isCopying) return;
            }
            newText = newText.removeAt(start, end - start);
            cursor = start;
          }
          if (isTab) {
            let offset = 0;

            selectedLines.forEach((line) => {
              lexer.cursor = lexer.lineStart(line);
              const tabOffset = tab.length - (lexer.currentIndent % tab.length);
              const tabValue = tab.slice(tab.length - tabOffset);

              if (isBackTab) {
                if (lexer.currentIndent === 0) return;
                newText = newText.removeAt(
                  lexer.cursor - offset,
                  tabValue.length
                );

                if (cursor < lexer.currentLineContentStart) {
                  if (lexer.currentLineContentStart - tabOffset < cursor)
                    cursor = lexer.currentLineContentStart - tabOffset;
                } else cursor -= tabOffset;
              } else {
                newText = newText.insertAt(lexer.cursor + offset, tabValue);
                cursor += tabValue.length;
              }
              offset += tabValue.length;
            });
          } else if (isBackspace) {
            if (!hasSelection) {
              if (startingCursor === 0) return;
              cursor -= 1;
              newText = newText.slice(0, cursor) + newText.slice(cursor + 1);
            }
          } else if (isEnter) {
            newText = newText.insertAt(cursor, "\n");
            cursor++;
          } else if (isPasting) {
            const clipboardText = navigator.clipboard.readText();
            newText = newText.insertAt(cursor, clipboardText);
            cursor += clipboardText.length;
          } else {
            newText = newText.slice(0, cursor) + key + newText.slice(cursor);
            cursor += key.length;
          }

          undoStack.push(startingText, newText);
          redoStack.clear();
        }

        rootAST =
          $CODE.parse(new Lexer(newText)) ||
          $UNKNOWN_BLOCK.parse(new Lexer(newText));

        _.rootSimpleAST = rootAST.toSimpleObj(
          getLineStart(),
          getLineEnd(),
          LINE_RENDER_OFFSET
        );
        // Object.assign(
        //   _.rootSimpleAST,
        //   rootAST.toSimpleObj(getLineStart(), getLineEnd())
        // );
        _.text = rootAST.text;
        // _.tokens = rootAST.getVisibleTokens().map((t) => t.toSimpleObj());
        _.cursor = cursor;

        isCursorValid = false;

        // let i = 0;
        // const updateCursor = () => {
        //   if (dom.textContent !== newText && i++ < 1000)
        //     requestAnimationFrame(updateCursor);
        //   if (dom.getSelection()) dom.setCursor(cursor);
        // };
        // dom.setCursor(cursor);
        // requestAnimationFrame(updateCursor);
      }}
      onmousedown_onmouseup_onmousemove_onkeydown={async (e) => {
        if (e.type === "mousemove" && e.buttons === 0) return;
        const dom = e.currentTarget;

        if (!isCursorValid) {
          dom.setCursor(_.cursor);
          isCursorValid = true;
        }

        resetCursorVisibility();
        await sleep(10);
        _.cursor = dom.getCursor();
        _.selection = dom.getSelection();
        _.selectionRects = dom.getSelectionPosition();
      }}
      onmousewheel={(e) => {
        e.preventDefault();
        const editorRect = e.currentTarget.getBoundingClientRect();
        // console.log(editorRect.top - )
        // console.log(e);
        const newScroll = _.scroll + e.deltaY;
        const MAX_SCROLL = (_.text.split("\n").length - 1) * _.lineHeight;
        _.scroll =
          newScroll > 0 ? (newScroll < MAX_SCROLL ? newScroll : MAX_SCROLL) : 0;

        _.tokens = rootAST.getVisibleTokens().map((t) => t.toSimpleObj());

        _.rootSimpleAST = rootAST.toSimpleObj(
          getLineStart(),
          getLineEnd(),
          LINE_RENDER_OFFSET //Math.trunc(rect.height / _.lineHeight) //rect.height
        );
      }}
      onmount={(e) => (_.editorHeight = e.target.clientHeight)}
      onresize={(e) => (_.editorHeight = e.target.clientHeight)}
      effects={[
        (_i, e) => (editorDOM = e),
        (_i, dom) => {
          _.cursor;
          if (!isCursorValid) {
            dom.setCursor(_.cursor);
            isCursorValid = true;
          }

          const { left, top } = dom.getCursorPosition();

          if (left < 0 || top < 0) return;
          cursorDOM.style.left = `${left}px`;
          cursorDOM.style.top = `${top}px`;
        },
        (_i, dom) => {
          if (_i === 0)
            _.rootSimpleAST = rootAST.toSimpleObj(
              getLineStart(),
              getLineEnd(),
              LINE_RENDER_OFFSET //Math.trunc(rect.height / _.lineHeight) //rect.height
            );
        },
      ]}
    >
      <cursor
        s={[
          `absolute bg:white w:.1em h:1.2em z:11 pe:none overy:scroll`,
          () => (_.isCursorVisible ? "visible" : "hidden"),
        ]}
        effects={[(_i, e) => (cursorDOM = e)]}
      />
      <selection s={`absolute left:0px top:0px`}>
        <list _={() => _.selectionRects}>
          {(rect) => (
            <selection_part
              s={() => {
                return `absolute pe:none o:0.2 bg:#73DACA h:1.2em z:10 w:${
                  rect.right - rect.left
                }px left:${rect.left}px top:${rect.top}px`;
              }}
            ></selection_part>
          )}
        </list>
      </selection>

      <content
        s={[`block relative`]}
        effects={[
          (_i, dom) => {
            const top = _.scroll % _.lineHeight;

            const linePadding =
              Math.min(getLineStart(), LINE_RENDER_OFFSET) * _.lineHeight;

            dom.style.top = `-${top + linePadding}px`;
          },
        ]}
      >
        <list _={() => _.tokens}>{(t) => <ASTToken exp={t} />}</list>
        {/* {() => _.rootSimpleAST && <ASTExpElement exp={_.rootSimpleAST} />} */}
      </content>

      <line_number s="fixed bottom:10px left:0px ">
        {getLineStart} {getLineEnd} {() => _.editorHeight}
        <button onclick={() => (_.scroll += _.lineHeight)}>scroll down</button>
        <button onclick={() => (_.scroll -= _.lineHeight)}>scroll up</button>
        <button onclick={() => (editorDOM.style.height = `200px`)}>
          resize
        </button>
      </line_number>
    </editor>
  );
};
useTests("HippieEditor", () => {
  it("renders the code's source", () => {
    const astEditor = new ASTEditor(`hello world`, $MARKUP);
    const ast = astEditor.rootAST;
    const editor = <HippieEditor ast={ast} editor={astEditor} />;
    div.append(editor);

    assert(editor.textContent === ast.text);
  });
  it("ASTEditor: updating cursor updates window cursor", async () => {
    const astEditor = new ASTEditor(`abcd`, $IDENTIFIER);
    const ast = astEditor.rootAST;
    const editor = <HippieEditor ast={ast} editor={astEditor} />;
    div.append(editor);

    astEditor.cursor = 2;

    await sleep(1);
    const s = window.getSelection();
    assert(s.focusNode === editor.children[0].children[0].firstChild);
    assert(s.focusOffset === 2);
  });
  it("automatically tracks window cursor and updates ASTEditor", async () => {
    [
      "click",
      "mousemove",
      "mouseover",
      "mouseout",
      "mouseleave",
      "mouseenter",
      "focus",
      "blur",
    ].forEach((event) => {
      const astEditor = new ASTEditor(`abcd`, $IDENTIFIER);
      const ast = astEditor.rootAST;
      const editor = <HippieEditor ast={ast} editor={astEditor} />;
      div.append(editor);

      assert(true, `\n${event}`);
      setCursorAtOffset(editor, 2);
      assert(astEditor.cursor === 0);
      editor.dispatchEvent(new Event(event));
      assert(astEditor.cursor === 2);
    });
  });

  it("key: adds character", async () => {
    const astEditor = useState(new ASTEditor(`abc`, $IDENTIFIER));
    const editor = <HippieEditor editor={astEditor} />;
    div.append(editor);

    astEditor.cursor = 1;
    await sleep(1);

    editor._type("q");

    await sleep(1);
    const s = window.getSelection();

    assert(editor.textContent === "aqbc");
    assert(s.focusNode === editor.children[0].children[0].firstChild);
    assert(s.focusOffset === 2);
    assert(astEditor.cursor === 2);
  });
  it(
    "key: removes selected text and adds character",
    async () => {
      const astEditor = useState(new ASTEditor(`abcde`, $IDENTIFIER));
      const editor = <HippieEditor editor={astEditor} />;
      div.append(editor);

      astEditor.cursor = 1;

      await sleep(1);

      editor._type("q");

      await sleep(1);
      const s = window.getSelection();

      assert(editor.textContent === "aqbc");
      assert(s.focusNode === editor.children[0].children[0].firstChild);
      assert(s.focusOffset === 2);
      assert(astEditor.cursor === 2);
    },
    { only: true }
  );

  it("keyboard: removes character and updates dom/cursor", async () => {
    const astEditor = useState(new ASTEditor(`abc`, $IDENTIFIER));
    const editor = <HippieEditor editor={astEditor} />;
    div.append(editor);

    astEditor.cursor = 2;
    await sleep(1);

    editor._type("Backspace");

    await sleep(1);
    const s = window.getSelection();

    assert(editor.textContent === "ac");
    assert(s.focusNode === editor.children[0].children[0].firstChild);
    assert(s.focusOffset === 1);
    assert(astEditor.cursor === 1);
  });
});

// -------------------------- #Lexer --------------------------
class Lexer {
  constructor(str = "") {
    this.str = str;
    this.cursor = 0;
    this.tasteCursor = 0;
    this.tokenCache = {};
    this.cache = {};
    this.cursorStack = [];
    this.useCache = false;

    this.lines = this.str.split("\n");

    this.lineOffsets = (() => {
      let offsets = []; // The first line starts at index 0

      let cursor = 0;
      for (const line of this.lines) {
        offsets.push([cursor, cursor + line.length]);
        cursor += line.length + 1;
      }
      return offsets;
    })();
    this.lineIndents = this.lines.map((l) => l.length - l.trimStart().length);
  }

  get hasMoreToLex() {
    return this.cursor < this.str.length;
  }
  get currentLine() {
    // let _cursor = 0;
    // for (let line = 0; line < this.lines.length; line++)
    //   if ((_cursor += this.lines[line].length + 1) > this.cursor) return line;
    // return -1;
    return this.lineOffsets.binarySearch(([start, end]) => {
      if (this.cursor < start) return -1;
      else if (this.cursor > end) return 1;
      else return 0;
    });
  }
  get currentLineStart() {
    return this.lineStart(this.currentLine);
  }
  get currentLineEnd() {
    return this.lineEnd(this.currentLine);
  }
  get currentLineContentStart() {
    return this.lineContentStart(this.currentLine);
  }
  get currentLineContentEnd() {
    return this.lineContentEnd(this.currentLine);
  }
  get currentCol() {
    let _cursor = 0;
    for (let line = 0; line < this.lines.length; line++)
      if (_cursor + this.lines[line].length + 1 > this.cursor)
        return this.cursor - _cursor;
      else _cursor += this.lines[line].length + 1;

    return -1;
  }
  get currentIndent() {
    return this.lineIndent(this.currentLine);
  }
  get parsedStr() {
    return this.str.slice(0, this.cursor);
  }
  get unparsedStr() {
    return this.str.slice(this.cursor);
  }

  pushCursor() {
    this.cursorStack.push(this.cursor);
  }
  popCursor() {
    if (this.cursorStack.length) this.cursor = this.cursorStack.pop();
  }

  lineIndent(line) {
    return this.lineIndents[line];
  }
  lineStart(line) {
    if (line >= this.lines.length) line = this.lines.length - 1;
    return this.lineOffsets[line][0];
  }
  lineEnd(line) {
    if (line >= this.lines.length) line = this.lines.length - 1;
    return this.lineOffsets[line][1];
  }
  lineContentStart(line) {
    return this.lineStart(line) + this.lineIndent(line);
  }
  lineContentEnd(line) {
    return this.lineStart(line) + this.lines[line].trimEnd().length;
  }
  linesInRange(start, end) {
    const result = [];

    for (let i = 0; i < this.lineOffsets.length; i++) {
      const [lineStart, lineEnd] = this.lineOffsets[i];
      if (lineStart <= end && lineEnd >= start) result.push(i);
    }
    return result;
  }

  isLexable(x) {
    return typeof x === "string" || x instanceof RegExp;
  }

  cacheGet(cursor = 0, name = "") {
    return this.cache[`${cursor}-${name}`];
  }
  cacheSet(item, cursor = 0, name = "") {
    return (this.cache[`${cursor}-${name}`] = {
      ast: item,
      cursorOnSave: this.cursor,
    });
  }

  taste(regex) {
    // const start = performance.now();
    if (!regex) return null;
    this.tasteCursor = this.cursor;

    const eatLeadingWhitespace = () => {
      while (
        this.str[this.tasteCursor] === " " ||
        this.str[this.tasteCursor] === "\n"
      ) {
        this.tasteCursor++;
      }
    };

    let match;
    if (typeof regex === "string") {
      let failedMatch = false;
      for (let i = 0; i < regex.length && !failedMatch; i++)
        failedMatch = regex[i] !== this.str[this.tasteCursor + i];
      // tasteTime += performance.now() - start;
      if (!failedMatch) {
        this.tasteCursor += regex.length;
        return { value: regex };
      }
    } else if (regex instanceof RegExp) {
      regex.lastIndex = this.tasteCursor;

      // Regexes must have 'y' or 'g' flag and not start with '^' for this to work
      match = regex.exec(this.str);

      if (match) this.tasteCursor += match[0].length;
      // tasteTime += performance.now() - start;
      return match && { value: match[0] };
    }
    return null;
  }
  eat(regex) {
    if (!regex) return null;

    const result = this.taste(regex);

    if (result) {
      const { value } = result;

      this.cursor = this.tasteCursor - value.length;

      let col = this.cursor - this.str.lastIndexOf("\n", this.cursor - 1) - 1;
      if (col < 0) col = 0;

      const line = this.currentLine;
      const token = new Token({
        type: regex,
        value,
        start: this.cursor,
        indent: this.lineIndents[line],
        line,
        end: this.cursor + value.length,
        col, //: this.currentCol,
        paddingRight: "",
        paddingLeft: "",
      });

      this.cursor += value.length;

      return token;
    } else return null;
  }
}
window.Lexer = Lexer;

// -------------------------- #Editor --------------------------

/*

Is there a way to combine the process of parsing/lexing with the process of text editing? How do those two processes overlap


How do we create observable data structures 


*/

window.F = (text = "") => {
  let lines = [];
  let indents = [];
  let offsets = [];

  // assume this is a readonly object, you can't directly modify, you modify through functions
  const _ = useState({
    _start: 0,
    _end: 0,
    _scroll: 0,
    _text: text,

    lineHeight: 24,
    height: 0,
    width: 0,
    visibleLinesOffset: 0,

    $text: (_) => _._text,

    $scroll: (_) =>
      _._scroll > 0
        ? _._scroll < _.$lines.length
          ? _._scroll
          : _.$lines.length
        : 0,

    $lines: (_) => _._text.split("\n"),
    $offsets: (_) => {
      const offsets = [];
      let i = 0;
      for (const line of _.$lines) {
        offsets.push([i, i + line.length]);
        i += line.length + 1;
      }
      return offsets;
    },
    $indents: (_) => _.$lines.map((l) => l.length - l.trimStart().length),

    $col: (_) => {
      let _cursor = 0;
      for (let line = 0; line < _.$lines.length; line++)
        if (_cursor + _.$lines[line].length + 1 > _.$cursor)
          return _.$cursor - _cursor;
        else _cursor += _.$lines[line].length + 1;

      return 0;
    },
    $line: (_) =>
      _.$offsets.binarySearch(([start, end]) => {
        if (_.$cursor < start) return -1;
        else if (_.$cursor > end) return 1;
        else return 0;
      }),
    $indent: (_) => _.$indents[_.$line],
    $hasSelection: (_) => _.$start !== _.$end,

    $visibleLinesStart: (_) => {
      const start = Math.trunc(_.$scroll) - _.visibleLinesOffset;
      return start > 0 ? start : 0;
    },
    $visibleLinesEnd: (_) => {
      const end =
        Math.trunc(_.$scroll) +
        Math.ceil(_.height / _.lineHeight) +
        _.visibleLinesOffset;
      return end > _.$lines.length - 1 ? end : _.$lines.length - 1;
    },
    $visibleLines: (_) =>
      Array.fromRange(_.$visibleLinesStart, _.$visibleLinesEnd),

    $visibleTokens: (_) =>
      $CODE
        .parse(new Lexer(_.$text))
        .getVisibleTokens(_.$visibleLinesStart, _.$visibleLinesEnd),

    $start: (_) =>
      _._start > 0
        ? _._start < _._text.length
          ? _._start
          : _._text.length
        : 0,
    $end: (_) =>
      _._end > 0 ? (_._end < _._text.length ? _._end : _.$text.length) : 0,
    $cursor: (_) => _.$start,
  });

  const dom = (
    <editor
      onresize_onmount={(e) => {
        _.height = e.currentTarget.clientHeight;
        _.width = e.currentTarget.clientWidth;
      }}
      s={[`block ws:pre-wrap`, () => `lh:${_.lineHeight}px`]}
    >
      <list _={() => _.$visibleTokens}>
        {(t) => (
          <token_
            class={() =>
              `${t.value.trim() ? "non-whitespace" : "whitespace"} indent-${
                t.indent
              } line-${t.line} astName-${t.astName} astId-${t.astId}`
            }
            s={[() => t.s]}
          >
            {t.value}
          </token_>
        )}
      </list>
    </editor>
  );

  return dom;
};

const DOM = (app = () => {}, types = {}) => {
  let canvas = null;

  const Obj = (_ = {}) => {
    const obj = useState({
      $get__super: () => obj._Super(obj),
    });
    Object.apply(obj, { _name: Obj.name, _new: Obj, _Super: Object });
    return obj;
  };

  const Point = (_ = {}, _Super = Obj) => {
    const point = _Super(_);
    Object.assign(point, {
      x: _.x || 0,
      y: _.y || 0,

      RelativeTo: ({ x, y }) => {
        return point.__new({
          ...point,
          x: point.x - x,
          y: point.y - y,
        });
      },

      _name: Point.name,
      _new: Point,
      _Super,
    });

    return point;
  };

  const Rect = (_ = {}, _Super = Point) => {
    const rect = _Super(_);
    Object.assign(rect, {
      w: _.w || 0,
      h: _.h || 0,

      $get_left: () => rect.x - rect.w / 2,
      $get_right: () => rect.x + rect.w / 2,
      $get_top: () => rect.y - rect.h / 2,
      $get_bottom: () => rect.y + rect.h / 2,

      $get_point: () => new Point(rect),

      _name: Rect.name,
      _new: Rect,
      _Super,
    });

    return rect;
  };

  const r = Rect({ x: 5, y: 5 });
  console.log(r._super);

  const Mouse = (_) => {
    const mouse = {
      x: 0,
      y: 0,
      screenX: 0,
      screenY: 0,
      isDownLeft: false,
      isDownRight: false,
      isDownMiddle: false,
      isDownBack: false,
      isDownForward: false,

      ..._,

      RelativeTo(point) {
        return Mouse({
          ...mouse,
          x: mouse.x - point.left,
          y: mouse.y - point.top,
        });
      },
    };

    return mouse;
  };
  const Keyboard = (_) => {
    const keyboard = {
      key: "",
      keyShiftDown: false,
      keyCtrlDown: false,
      keyAltDown: false,
      keyMetaDown: false,
      keyCapsLockDown: false,
      keyNumLockDown: false,
      keyScrollLockDown: false,

      ..._,
    };

    return keyboard;
  };

  const $ = useState({
    root: null,

    width: 0,
    height: 0,

    mouse: Mouse(),

    keyboard: Keyboard(),

    GetElement: () => {
      if (canvas) return canvas;

      canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.style.width = `100%`;
      canvas.style.height = `100%`;

      ["mount", "resize"].forEach((event) =>
        canvas.addEventListener(event, (e) => {
          $.width = canvas.clientWidth;
          $.height = canvas.clientHeight;
        })
      );
      [
        "mousemove",
        "mousedown",
        "mouseup",
        "click",
        "contextmenu",
        "dblclick",
      ].forEach((event) =>
        canvas.addEventListener(event, (e) => {
          const { left, top } = element.getBoundingClientRect();

          $.mouseX = e.clientX - left;
          $.mouseY = e.clientY - top;
          $.mouseScreenX = e.screenX;
          $.mouseScreenY = e.screenY;

          $.mouseLeftDown = (e.buttons & 1) !== 0;
          $.mouseRightDown = (e.buttons & 2) !== 0;
          $.mouseMiddleDown = (e.buttons & 4) !== 0;
          $.mouseBackDown = (e.buttons & 8) !== 0;
          $.mouseForwardDown = (e.buttons & 16) !== 0;
        })
      );

      return canvas;
    },
  });

  const ELEMENT = (name, props = {}, ...children) => {
    props = props || {};

    if (typeof name === "function") return name(props, ...children);
    if (typeof types[name] === "function")
      return types[name](props, ...children);

    const _ = useState({
      width: null,
      height: null,
      isMounted: false,

      ...props,

      $children: [
        ...children
          .filter((c) => ![undefined, null, false, ""].includes(c))
          .map((c) => (typeof c === "object" ? c : <text value={`${c}`} />)),
      ],
    });

    return _;
  };

  const _React = window.React;
  window.React = { createElement: ELEMENT };

  $.root = <root>{app()}</root>;

  window.React = _React;

  return $;
};

// STYLE CODE
/*
    const styleCache = {};
s: {},
      ComputeNumericStyle: (name) => {
        const style = _.s[name];
        if (typeof style === "number") return style;
        if (styleCache[name]) return styleCache[name];
        _.children.forEach((child) => child.ClearStyleCache(name));

        $left[(value, unit)] = style;

        if (unit === "vw") return $.viewportWidth * value;
        if (unit === "vh") return $.viewportHeight * value;

        const parent = _.__ancestors((a) => a.s)[0];
        if (!parent) return 0;

        let result;
        if (isPercentage)
          result = (parent.ComputeNumericStyle(name) * value) / 100;
        else result = _.ComputeNumericStyle(unit) * value;

        styleCache[name] = result;
        return result;
      },
      ComputeNonNumericStyle: () => {
        const style = _.s[name];
        if (style) return style;
        if (styleCache[name]) return styleCache[name];
        _.children.forEach((child) => child.ClearStyleCache(name));

        const parent = _.__ancestors((a) => a.s)[0];
        if (!parent) return "";

        return parent.ComputeNonNumericStyle(name);
      },
      ClearStyleCache: (name) => delete styleCache[name],
*/

useTests(
  "DOM",
  () => {
    it("accepts custom types", async () => {
      let i = 0;
      const A = () => i++;
      const dom = DOM(() => <a />, { a: A });

      assert(i === 1);
    });
    it("syncs with HTML canvas", async () => {
      const dom = DOM();
      assert(dom.width === 0);
      assert(dom.height === 0);

      div.style.width = `500px`;
      div.style.height = `400px`;
      div.append(dom.GetElement());

      await sleep(1);

      assert(dom.width === 500);
      assert(dom.height === 400);

      div.style.width = `400px`;
      div.style.height = `500px`;

      await sleep(50);

      assert(dom.width === 400);
      assert(dom.height === 500);
    });
    it(
      "on",
      async () => {
        const dom = DOM();
      },
      { only: true }
    );
  },
  { only: true }
);

class Editor {
  constructor(text = "") {
    this._cursor = 0;
    this.text = text;
    this._lines = [];
    this._indents = [];
    this._offsets = [];
    this._col = null;
    this._line = null;

    this._ = useState({
      cursor: 0,
      lines: [],
      indents: [],
      offsets: [],
      col: null,
      line: null,
    });
    return this._;
  }

  get text() {
    return this._.text;
  }
  set text(newText) {
    this._text = newText;

    this._lines = null;
    this._offsets = null;
    this._indents = null;
  }

  get lines() {
    if (this._lines) return this._lines;
    return (this._lines = this.text.split("\n"));
  }
  get offsets() {
    if (this._offsets) return this._offsets;
    return (this._offsets = (() => {
      let offsets = []; // The first line starts at index 0

      let cursor = 0;
      for (const line of this.lines) {
        offsets.push([cursor, cursor + line.length]);
        cursor += line.length + 1;
      }
      return offsets;
    })());
  }
  get indents() {
    if (this._indents) return this._indents;
    return (this._indents = this.lines.map(
      (l) => l.length - l.trimStart().length
    ));
  }

  get cursor() {
    return this._cursor;
  }
  set cursor(newCursor) {
    this._cursor = newCursor;

    this.col;
    this.line;
  }

  get col() {
    if (this._col) return this._col;
    return (this._col = (() => {
      let _cursor = 0;
      for (let line = 0; line < this.lines.length; line++)
        if (_cursor + this.lines[line].length + 1 > this.cursor)
          return this.cursor - _cursor;
        else _cursor += this.lines[line].length + 1;

      return 0;
    })());
  }
  get line() {
    if (this._line) return this._line;
    return (this._line = this.offsets.binarySearch(([start, end]) => {
      if (this.cursor < start) return -1;
      else if (this.cursor > end) return 1;
      else return 0;
    }));
  }
}

// -------------------------- #ShapeExp --------------------------
class ShapeExp {
  constructor({ value, rightDelimeter, min = 1, max = 1, domProps = {} } = {}) {
    this.value = value;
    this.rightDelimeter = rightDelimeter;
    this.min = min;
    this.max = max;
    this.domProps = domProps;

    this.TEXT_EXP =
      typeof this.value === "string" || this.value instanceof RegExp;
    this.AST_EXP =
      typeof this.value === "function" &&
      !!this.value.name &&
      this.value.name[0] === "$";
    this.SUB_SHAPE_EXP = this.value instanceof Shape;
    this.OPTION_EXP = Array.isArray(this.value) && !this.SUB_SHAPE_EXP;
    this.LAZY_EXP = typeof this.value === "function" && !this.AST_EXP;

    if (this.value instanceof RegExp)
      this.value = ShapeExp.formatRegex(this.value);
    if (this.rightDelimeter instanceof RegExp)
      this.rightDelimeter = ShapeExp.formatRegex(this.rightDelimeter);

    this.name = `${this.value}`;
    if (this.AST_EXP) this.name = this.value.name;
    else if (this.OPTION_EXP) {
      this.value = new Shape(...this.value);
      this.name = this.value.map((o) => o.name || `${o}`).join("-");
    } else if (this.SUB_SHAPE_EXP) this.name = this.value.id.toString();
  }

  static formatRegex(regex) {
    let source = regex.source;
    if (source[0] === "^") source = source.slice(1);
    let flags = regex.flags;
    if (!flags.includes("y")) flags += "y";
    return new RegExp(source, flags);
  }

  parse(_ = new Lexer()) {
    const results = [];
    const startCursor = _.cursor;
    for (
      let expIndex = 0;
      expIndex < this.max && (!_.taste(this.rightDelimeter) || expIndex === 0);
      expIndex++
    ) {
      while (_.taste(WHITESPACE_REGEX)) results.push(_.eat(WHITESPACE_REGEX));
      let result = null;
      if (this.LAZY_EXP) {
        Object.assign(
          this,
          new ShapeExp({
            ...this,
            value: this.value(),
          })
        );
      }
      if (this.TEXT_EXP) result = _.eat(this.value);
      else if (this.AST_EXP) {
        const firstShapeExp = this.value.SHAPE[0];
        if (
          firstShapeExp &&
          typeof firstShapeExp === "object" &&
          firstShapeExp.TEXT_EXP &&
          !_.taste(firstShapeExp.value)
        )
          result = null;
        else result = this.value.parse(_);
      } else if (this.OPTION_EXP)
        for (let i = 0; i < this.value.length && !result; i++)
          if (_.isLexable(this.value[i])) result = _.eat(this.value);
          else result = this.value[i].parse(_);
      else if (this.SUB_SHAPE_EXP) {
        const firstShapeExp = this[0];
        if (
          firstShapeExp &&
          typeof firstShapeExp === "object" &&
          firstShapeExp.TEXT_EXP &&
          !_.taste(firstShapeExp.value)
        )
          result = null;
        else {
          const $SUB_SHAPE_AST = class extends $AST {};
          $SUB_SHAPE_AST.SHAPE = this.value;
          const ast = $SUB_SHAPE_AST.parse(_);
          if (ast) result = ast.exps;
        }
      }

      if (result) {
        result.shapeExp = {};
        Object.assign(result.shapeExp, this);
        Object.setPrototypeOf(result.shapeExp, Object.getPrototypeOf(this));
        results.push(...useArray(result));
      } else if (expIndex >= this.min) break;
      else {
        _.cursor = startCursor;
        return null;
      }
    }
    while (_.taste(WHITESPACE_REGEX)) results.push(_.eat(WHITESPACE_REGEX));

    return results;
  }
}
class Shape extends Array {
  constructor(...exps) {
    super();

    this.id = useId();
    const isLimitExp = (expIndex) => {
      const exp = exps[expIndex];
      return (
        exp &&
        typeof exp === "object" &&
        exp.hasAnyOwnProperty("min", "max", "s", "Element")
      );
    };
    const parseLimitExp = (expIndex) => {
      const nextExp = exps[expIndex + 1];
      return isLimitExp(expIndex + 1) ? nextExp : {};
    };
    const parseRightDelimeter = (expIndex) => {
      let nextExp = exps[expIndex + (isLimitExp(expIndex + 1) ? 2 : 1)];
      if (nextExp && (typeof nextExp === "string" || nextExp instanceof RegExp))
        return nextExp;

      return null;
    };

    for (let i = 0; i < exps.length; i++) {
      const value = exps[i];
      if (value === null || isLimitExp(i)) continue;

      let shapeExp = new ShapeExp({
        value,
        rightDelimeter: parseRightDelimeter(i),
      });

      Object.assign(shapeExp, parseLimitExp(i));
      this.push(shapeExp);
    }

    // console.log();
    // this.push(new ShapeExp({ value: /\s+/y, min: 0 }));
  }
}

// -------------------------- #Grammar --------------------------
let cacheHits = 0;
let parseCalls = 0;
const cacheItems = [];
let tasteTime = 0;
let recurseTime = 0;
let eatShortCircuits = 0;
let y = 0;
// setTimeout(
//   () => console.log({ tasteTime, y, parseCalls, eatShortCircuits }),
//   500
// );

const $s = {
  OP: `fc:${T_COLORS.OP}`,
  KEYWORD: `fc:${T_COLORS.KEYWORD}`,
  IDENTIFIER: `fc:white`,
  NUMBER: `fc:${T_COLORS.NUMBER}`,
  BOOLEAN: `fc:${T_COLORS.BOOLEAN}`,
  COMMENT: `fc:#51597d`,
  STRING: `fc:#9ece6a`,
  TEXT: `fc:${T_COLORS.TEXT}`,
  ELEMENT: `fc:${T_COLORS.ELEMENT}`,
  ERROR: `td:(underline wavy ${T_COLORS.ERROR})`,
};

class $ROOT extends $AST {}

class $AST_LEFT_RECURSIVE extends $AST {
  static parse(_ = new Lexer()) {
    const SHAPE = this.SHAPE;
    let leftCursor = _.cursor;
    let $left = this.SHAPE[0].parse(_);
    if (!$left) return null;
    else $left = $left[0];

    leftCursor = _.cursor;

    while (_.taste(this.SHAPE[0].rightDelimeter)) {
      const allowIncompleteParse = this.allowIncompleteParse;
      const $RIGHT = class extends $AST {
        static allowIncompleteParse = allowIncompleteParse;
        static SHAPE = (() => {
          const shape = new Shape();
          shape.push(...SHAPE.slice(1));
          return shape;
        })();
      };
      const $right = $RIGHT.parse(_);

      if (!$right) {
        _.cursor = leftCursor;
        return $left;
      }
      $left = new this({ exps: [$left, ...$right.exps] });
    }
    return $left;
  }
}
class $INDENT_BLOCK extends $AST {
  static parse(_ = new Lexer()) {
    _.pushCursor();
    do _.cursor--;
    while (_.str[_.cursor] && !_.str[_.cursor].trim());
    const prevToken = _.eat(/\S/y);
    _.popCursor();
    const baseIndent = prevToken ? prevToken.indent : _.currentIndent;

    if (prevToken)
      if (prevToken.line === _.currentLine) {
        const $exp = $AST.parse.apply(this, [_]);
        if ($exp) return new this({ exps: [$exp] });
        return null;
      } else if (_.currentIndent <= prevToken.indent) return null;

    const isIndented = () => {
      _.pushCursor();
      while (_.taste(WHITESPACE_REGEX)) _.eat(WHITESPACE_REGEX);
      const nextToken = _.eat(/\S/y);
      _.popCursor();
      return nextToken && nextToken.indent > baseIndent;
    };

    const exps = [];
    while (_.hasMoreToLex && isIndented()) {
      const $exp = $AST.parse.apply(this, [_]);
      if ($exp) exps.push(...$exp.exps);
      else {
        break;
      }
    }
    if (!exps.length) return null;
    return new this({ exps });
  }
}
class $EXP extends $AST {
  static parse(_ = new Lexer()) {
    let $exp = $AST.parse.apply(this, [_]);

    if ($exp) {
      const exps = $exp.exps;
      const indexOfAST = exps.findIndex((e) => e.AST);
      const ast = exps[indexOfAST];
      let leadingWhitespaceTokens = exps.slice(0, indexOfAST);
      let trailingWhitespaceTokens = exps.slice(indexOfAST + 1);
      $exp = new ast.constructor({
        exps: [
          ...leadingWhitespaceTokens,
          ...ast.exps,
          ...trailingWhitespaceTokens,
        ],
      });
    }

    return $exp;
  }
}
class $UNKNOWN extends $AST {
  static SHAPE = new Shape(/^\S+/, {
    s: `td:(underline wavy salmon) fc:white`,
  });
}
class $UNKNOWN_BLOCK extends $AST {
  static SHAPE = new Shape(/^.*/, { s: $s.ERROR });
}

class $CODE_EXP extends $EXP {}
class $CODE extends $AST {
  static SHAPE = new Shape([$CODE_EXP, $UNKNOWN], { min: 0, max: Infinity });
  static SAMPLES = [
    `
    deepClone = fun:
      if obj == dog or obj != \`object\`:
        return obj

      temp = obj.constructor()
      for key in obj:
        temp[key] = deelClone(obj[key])
        `,
    `
      mergeSort = fun arr:
        if arr.length < 2: return arr

        middle = Math.floor(arr.length / 2)
        left = arr[..middle]
        right arr[middle.=end]

        return merge(mergeSort(left), mergeSort(right))
      `,
    `
    merge = fun left, right:
      result = []
      leftIndex = 0
      rightIndex = 0

      while leftIndex < left.length and rightIndex < right.length:
        if left[leftIndex] < right[rightIndex]:
          result.push(left[leftIndex])
          leftIndex += 1
        else
          result.push(right[rightIndex])
          rightIndex += 1

      return result.concat(left[leftIndex.=end]).concat(right[rightIndex.=end])
          `,
    `
    throttle = fun limit:
      return fun:
        context = this
        args = arguments
        if !lastRan:
          func.apply(context, args)
          lastRan = Date.now()
        else
          clearTimeout(lastFunc)
          lastFunc = setTimeout(
            fun:
              if Date.now() - lastRan >= limit:
                func.apply(context, args)
                lastRan = Date.now()
              limit = Date.now() = lastRan
          )
          `,
    `
    debounce = fun func, delay:
      return fun:
        context = this
        args = arguments
        clearTimeout(inDebounce)
        inDebounce = setTimeout(fun: func.apple(context, args), delay)
          `,
    `
    binarySearch = fun arr, target:
      left = 0
      right = arr.length - 1

      while left <= right:
        mid = Math.floor((left + right) / 2)
        foundVal = arr[mid]

        if foundVal == target: return mid
        elif foundVal < target: left = mid + 1
        else right = mid - 1

      return -1
          `,
    `
    quickSort = fun arr:
      if arr.length <= 1: return arr

      pivot = arr[-1]
      left = []
      right = []

      for i in ..arr.length:
        if arr[i] < pivot: left.push(arr[i])
        else right.push(arr[i])
          `,
    `
    todos = []
    todoOptions = [
      max: 50,
      subOptions: [
        min: 20
      ]
    ]

    Home = fun:
      return
        $div 'flex row' name:{getName()}
          $h1 \`Welcome to the Todo App\`
          $\{Link} to:\`/todos\` \`Go to Todos\`

    TodoPage = fun:
      return
        $div
          $h1 \`Todo List\` 'w:100px h:50%'
          {/* Todo components will go here */}

    App = fun:
      return
        $\{Router}
          $\{Routes}
            $\{Route} path:\`/\` element:{$\{Home}}
            $\{Route} path:\`/todos\` element:{$\{TodoPage}}

    render($App, dog)
          `,

    // INVALID
    `
for i :
    a
    b
    `,
  ];
}
window.$CODE = $CODE;
class $CODE_LINE_TOKENS extends $AST {}
class $CODE_PORTAL extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 1;
  static SHAPE = new Shape(
    "{",
    { s: $s.OP },

    [$CODE_EXP, $UNKNOWN],
    { min: 0, max: Infinity },

    "}",
    { s: $s.OP }
  );
  static SAMPLES = [
    `{}`,
    `{a}`,
    `{
      a
    b
    }`,

    // INCOMPLETE
    `{`,

    // $UNKNOWN
    `{:}`,
  ];
}

class $PARENTHESIZED_CODE_EXP extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 1;
  static SHAPE = new Shape(
    "(",
    { s: $s.OP },

    $CODE_EXP,

    ")",
    { s: $s.OP }
  );
  static SAMPLES = [
    `(a)`,
    `(\na\n)`,
    `($a
  $b
  $c)`,

    // ORDER OF OPERATIONS
    `(a + b)`,

    // INCOMPLETE
    `(`,
  ];
}

class $NUMBER extends $AST {
  static SHAPE = new Shape(
    /(0x[\da-fA-F]+|-?\d+(\.\d+)?[Ee][-+]?\d+|-?\d*\.\d+|-?\d+)/,
    { s: $s.NUMBER }
  );
  static SAMPLES = [
    // Integers
    // "1",
    "-123",
    "456",
    "-456",
    "7890",
    "-7890",
    "10",
    "-10",
    "002",
    "-002",

    // Floats
    "123.456",
    "-123.456",
    "0.001",
    "-0.001",
    "3.14159",
    "-3.14159",
    ".5",
    "-.5",
    "0.99",
    "-0.99",
    "0.0001",
    "-0.0001",

    // Hexadecimal
    "0x1A",
    "0xFF",
    "0x00ff",
    "0xdeadBEEF",
    "0xABCDEF",

    // Scientific Notation
    "1e10",
    "-1e10",
    "2.5e-3",
    "-2.5e-3",
    "3.14E+2",
    "-3.14E+2",
    "6.02e23",
    "-6.02e23",
    "1.6E-19",
    "-1.6E-19",
    "4e2",
    "-4e2",
    "5.5e-2",
    "-5.5e-2",
  ];
}
class $COMMENT extends $AST {
  static SHAPE = new Shape(/^(\/\/.*|\/\*[\s\S]*?\*\/)/, {
    s: $s.COMMENT,
  });
  static SAMPLES = [
    // Line comments
    "// This is a line comment",
    "//Another line comment",
    "//123456789",
    "// Special characters !@#$%^&*()",

    // Block comments
    "/* This is a block comment */",
    "/* Block\ncomment\nacross\nmultiple lines */",
    "/*123456789*/",
    "/* Special characters !@#$%^&*()*/",
  ];
}
class $BOOLEAN extends $AST {
  static SHAPE = new Shape(/^(true|false)\b/, { s: $s.BOOLEAN });
  static SAMPLES = ["true", "false"];
}
class $KEYWORD extends $AST {
  static SHAPE = new Shape(/^(break|continue)\b/, {
    s: $s.KEYWORD,
  });
  static SAMPLES = [`break`, "continue"];
}
class $IDENTIFIER extends $AST {
  static SHAPE = new Shape(
    /^[a-zA-Z_#@][a-zA-Z0-9_#@]*/,
    {
      s: $s.IDENTIFIER,
    },
    { min: 0 }
  );
  static SAMPLES = [
    "a",
    "Z",
    "variable",
    "MyVariable",
    "anotherVar",
    "_underscore",
    "__doubleUnderScore",
    "_privateVar",
    "camelCaseVar",
    "snake_case_var",
    "var123",
    "name2var",
    "abc123XYZ",
    "__proto__",
    "_cache",
    "functionName",
    "_",
    "userName",
    "user1Name",
    "alphaBeta123",
    "_123abc",
    "_combo",
    "#blessed",
    "#great#awesome",
    "CAPITALCASE",
    "lowercase",
    "Mixed123Case_",
    "_underscore123",
    "a1_b2_c3",
    "valid_Name",
    "Valid123",
    "_validName",
    "user#name",
    "@atSymbol",
    "user@name",
    "@_withUnderscore",
    "@combo",
    "email@address",
    "@valid123",
    "var@name",
    "@myVar",
    "name@WithNumber123",
    "@_underscore",
    "ALL_UPPERCASE",
    " \n a \n ",
  ];
}
window.$IDENTIFIER = $IDENTIFIER;

class $CODE_BLOCK extends $INDENT_BLOCK {
  static SHAPE = new Shape([$CODE_EXP, $UNKNOWN]);
}

class $FOR extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    /^for\b/,
    {
      s:
        $s.KEYWORD +
        `inlineb  fs:0.9em p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
    },

    $IDENTIFIER,

    new Shape(",", { s: `fc:${T_COLORS.OP}` }, $IDENTIFIER),
    { min: 0 },

    /^in\b/,
    {
      s:
        $s.KEYWORD +
        `inlineb  fs:0.9em p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
    },

    $CODE_EXP,

    new Shape(/^and\b/, $CODE_EXP),
    { min: 0, max: Infinity },

    ":",
    {
      s:
        $s.OP +
        `inlineb  fs:0.9em  fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
    },

    $CODE_BLOCK
  );

  static SAMPLES = [
    `for a in b: c`,
    `for a, b in c: d`,
    `for a in b and c: d`,
    `for a, b in c and d and e and f: g`,
    `
    for a in b:
      c
      for d in e and f or g:
      g
    `,

    // INCOMPLETE
    `for dog cat`,
  ];
}

class $DO_WHILE extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    /^do\b/,
    { s: $s.KEYWORD },

    $CODE_BLOCK,

    /^while\b/,
    { s: $s.KEYWORD },

    $CODE_EXP
  );
  static SAMPLES = [
    `do b while c`,
    `
do
  b
  do c while d
while e
`,

    // INCOMPLETE
    `do b c`,
  ];
}
class $WHILE extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    /^while\b/,
    {
      s:
        $s.KEYWORD +
        `inlineb  fs:0.9em p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
    },

    $CODE_EXP,

    ":",
    { s: $s.OP },

    $CODE_BLOCK
  );
  static SAMPLES = [
    `while a: b`,
    `
while a:
  b
  while c: d
  e
`,

    // INCOMPLETE
    `while b c`,
  ];
}

class $ELSE extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    /^else\b/,
    {
      s:
        $s.KEYWORD +
        `inlineb p:(0em .2em) fs:0.9em fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
    },

    $CODE_BLOCK
  );
  static SAMPLES = [
    `else b`,
    `
else
  b
  else c
  d
`,

    // INCOMPLETE
    `else`,
  ];
}

class $ELIF extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    [/^elif\b/, /^fi\b/],
    {
      s:
        $s.KEYWORD +
        `inlineb  fs:0.9em p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
    },

    $CODE_EXP,

    ":",
    {
      s:
        $s.OP +
        `inlineb  fs:0.9em  fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
    },

    $CODE_BLOCK
  );
  static SAMPLES = [
    // ELIF
    `elif a: b`,
    `
elif a:
  b
  elif c: d
  e
`,

    // INCOMPLETE
    `elif : b`,

    // FI
    `fi a: b`,
    `
fi a:
  b
  fi c: d
  e
`,

    // INCOMPLETE
    `fi : b`,
  ];
}
class $IF extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  // static s = `p:10px r:.25em b:(2px solid salmon)`;
  static SHAPE = new Shape(
    /^if\b/,
    {
      s:
        $s.KEYWORD +
        `inlineb p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) fs:0.9em r:0.33em`,
    },

    $CODE_EXP,

    ":",
    {
      s:
        $s.OP +
        `inlineb bg:linear-gradient(45deg,#ff6ec4,#7873f5) ml:.25em r:0.33em`,
    },

    $CODE_BLOCK
  );
  static SAMPLES = [
    ` \n  if a: b \n \n`,
    `
    if a:
      b
      if c: d
      e
    `,

    // INCOMPLETE
    `if : b`,
  ];
}

class $CASE extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    /^case\b/,
    { s: $s.KEYWORD },

    $CODE_EXP,

    ":",
    { s: $s.OP },

    $CODE_BLOCK
  );
  static SAMPLES = [
    `case a: b`,
    `
case a:
  b
  case c: d
  e
`,

    // INCOMPLETE
    `case : b`,
  ];
}
class $SWITCH_BODY extends $INDENT_BLOCK {
  static SHAPE = new Shape($CASE);
}
class $SWITCH extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    /^switch\b/,
    { s: $s.KEYWORD },

    $CODE_EXP,

    ":",
    { s: $s.OP },

    $SWITCH_BODY,

    $ELSE,
    { min: 0 }
  );
  static SAMPLES = [
    `switch a: case b: c`,
    `
switch a:
  case b: c
  case d: e
  else f
`,

    // INCOMPLETE
    `switch :`,
  ];
}

class $FUN extends $AST {
  static isBoundary = true;
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    /^fun\b/,
    {
      s:
        $s.KEYWORD +
        `inlineb p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) fs:0.9em bold r:0.33em |:hover| fc:blue`,
    },

    new Shape($CODE_EXP, ",", { min: 0, s: $s.OP }),
    { min: 0, max: Infinity },

    ":",
    { s: $s.OP },

    $CODE_BLOCK
  );
  static SAMPLES = [
    `fun: a`,
    `fun a, b: c`,
    `
fun a, b:
  fun a,b:
    c
  d
`,
    `fun a: return b()`,

    // INCOMPLETE
    `fun:`,
  ];
}

class $KEY_VALUE extends $AST {
  static SHAPE = new Shape(
    [$NUMBER, $IDENTIFIER, $CODE_PORTAL, () => $MARKUP_PORTAL],

    ":",
    { s: $s.OP },

    $CODE_EXP
  );
}

class $LIST_ITEM_CODE extends $AST {
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    [$KEY_VALUE, $CODE_EXP],

    ",",
    { s: $s.OP }
  );
}
class $LIST extends $AST {
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    "[",
    { s: $s.OP },

    $LIST_ITEM_CODE,
    { min: 0, max: Infinity },

    "]",
    { s: $s.OP }
  );
  static SAMPLES = [
    `[]`,
    `[a]`,
    `[ a ]`,
    `[\na\n]`,
    `[a,]`,
    `[a\n,\n]`,
    `[a,b]`,
    `[a, [b ,[c,]], d]`,
    `[a: b, c, d, e:f]`,
    `
    [
      a:b,
      a :b,
      a: b,
      a : b,
      a\n:\nb,
      a: !b,
      a: b = c,
      a: b - c,
      a: b * c,
      a: b ^ c,
      a: b.c,
      a: b..c,
    ]
    `,

    // INCOMPLETE
    `[2 3`,
  ];
}
const PRIMARY_CODE_EXP = [
  $PARENTHESIZED_CODE_EXP,
  $CODE_PORTAL,
  () => $MARKUP_PORTAL,
  () => $ELEMENT,
  $LIST,
  $FUN,
  $SWITCH,
  $IF,
  $ELIF,
  $ELSE,
  $FOR,
  $DO_WHILE,
  $WHILE,
  $NUMBER,
  $BOOLEAN,
  $KEYWORD,
  $IDENTIFIER,
];

class $FIELD extends $AST {
  static SHAPE = new Shape(
    () => $FIELD_FUN_CALL,

    /^\.(?!\.|=)/,
    { s: $s.OP },

    () => $FIELD_RIGHT
  );
  static SAMPLES = [
    `a.b`,
    `a .b`,
    `a. b`,
    `a . b`,
    `a\n.\nb`,
    `a.b.c`,
    // ORDER OF OPERATIONS
    `a().b`,
    `a[b].c`,
    `[a:b, c:d].a`,
    `a.b().c`,
  ];
}
class $FIELD_RIGHT extends $FIELD {
  constructor(...args) {
    return new $FIELD(...args);
  }
  static SHAPE = new Shape(
    PRIMARY_CODE_EXP,

    /^\.(?!\.|=)/,
    { s: $s.OP },

    this
  );
}

class $INDEX extends $AST_LEFT_RECURSIVE {
  static SHAPE = new Shape(
    $FIELD,

    "[",
    { s: $s.OP },

    $CODE_EXP,

    "]",
    { s: $s.OP }
  );
  static SAMPLES = [
    `a[b]`,
    `a[b][c]`,
    `a[b][c][d]`,
    `a.b.c[d]`,
    `a[b].c[d]`,
    // `[a:b][a]`,
  ];
}
class $FIELD_INDEX extends $INDEX {
  constructor(...args) {
    return new $INDEX(...args);
  }
  static SHAPE = new Shape(
    $FIELD_RIGHT,

    "[",
    { s: $s.OP },

    $CODE_EXP,

    "]",
    { s: $s.OP }
  );
}

class $FUN_CALL extends $AST_LEFT_RECURSIVE {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $INDEX,

    "(",
    { s: $s.OP },

    $LIST_ITEM_CODE,
    { min: 0, max: Infinity },

    ")",
    { s: $s.OP }
  );
  static SAMPLES = [
    `a()`,
    `a(b)`,
    `a(b, c)`,
    `a(b, c)()(c)`,

    // ORDER OF OPERATIONS
    `a.b.c()`,
    `a().b()`,
    `a[b]()`,

    // INCOMPLETE
    `a(b`,
  ];
}
class $FIELD_FUN_CALL extends $FUN_CALL {
  constructor(...args) {
    return new $FUN_CALL(...args);
  }
  static SHAPE = new Shape(
    $FIELD_INDEX,

    "(",
    { s: $s.OP },

    new Shape($CODE_EXP, ",", { min: 0 }),
    { min: 0, max: Infinity, s: $s.OP },

    ")",
    { s: $s.OP }
  );
}

class $NEGATION extends $AST {
  static allowIncompleteParse = true;
  static SHAPE = new Shape(
    "!",
    { s: $s.OP },

    [this, $FUN_CALL]
  );
  static SAMPLES = [
    `!a`,
    `! a`,
    `!\na`,
    `!!a`,
    `!!!a`,
    // ORDER OF OPERATIONS
    `!a.b`,
    // INCOMPLETE
    `!`,
  ];
}
class $EXPONENT extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    [$NEGATION, $FUN_CALL],

    /^\^(?!=)/,
    { s: $s.OP },

    this
  );
  static SAMPLES = [
    // MODULO
    `a^b`,
    `a ^b`,
    `a^ b`,
    `a ^ b`,
    `a\n^\nb`,
    `a^b^c`,

    // ORDER OF OPERATIONS
    `!a ^ b`,
    `a ^ !b`,
    `a.b ^ c.d`,

    // INCOMPLETE
    `a^`,
  ];
}
class $MULTIPLICATIVE extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $EXPONENT,

    /^(%(?!=)|\/(?!=|\/)|\*(?!=))/,
    { s: $s.OP },

    this
  );
  static SAMPLES = [
    // MODULO
    `a%b`,
    `a %b`,
    `a% b`,
    `a % b`,
    `a\n%\nb`,
    `a%b%c`,

    // DIVIDE
    `a/b`,
    `a /b`,
    `a/ b`,
    `a / b`,
    `a\n/\nb`,
    `a/b/c`,

    // MULTIPLY
    `a*b`,
    `a *b`,
    `a* b`,
    `a * b`,
    `a\n*\nb`,
    `a*b*c`,

    // ORDER OF OPERATIONS
    `!a * b`,
    `a * !b`,
    `a * b ^ c`,
    `a.b * c.d`,

    // INCOMPLETE
    `a*`,
  ];
}
class $ADDITIVE extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $MULTIPLICATIVE,

    /^(-(?!=|-)|\+(?!=|\+))/,
    { s: $s.OP },

    this
  );
  static SAMPLES = [
    // SUBTRACT
    `a -b`,
    `a- b`,
    `a - b`,
    `a\n-\nb`,
    `a-b-c`,

    // ADD
    `a+b`,
    `a +b`,
    `a+ b`,
    `a + b`,
    `a\n+\nb`,
    `a+b+c`,

    // // ORDER OF OPERATIONS
    `!a + b`,
    `a - !b`,
    `a + b * c`,
    `a + b ^ c`,
    `a.b + c.d`,

    // INCOMPLETE
    `a+`,
  ];
}
window.$ADDITIVE = $ADDITIVE;

class $COMPARISON extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $ADDITIVE,

    /^(>(?!=)|>=|<(?!=)|<=|==|!=)/,
    {
      s:
        $s.OP +
        `inlineb  fs:0.9em p:(0em .2em)  fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em`,
    },

    this
  );
  static SAMPLES = [
    // GREATER THAN
    `a>b`,
    `a >b`,
    `a> b`,
    `a > b`,
    `a\n>\nb`,
    `a>b>c`,

    // GREATER THAN EQUAL
    `a>=b`,
    `a >=b`,
    `a>= b`,
    `a >= b`,
    `a\n>=\nb`,
    `a>=b>=c`,

    // LESS THAN
    `a<b`,
    `a <b`,
    `a< b`,
    `a < b`,
    `a\n<\nb`,
    `a<b<c`,

    // LESS THAN EQUAL
    `a<=b`,
    `a <=b`,
    `a<= b`,
    `a <= b`,
    `a\n<=\nb`,
    `a<=b<=c`,

    // EQUAL
    `a==b`,
    `a ==b`,
    `a== b`,
    `a == b`,
    `a\n==\nb`,
    `a==b==c`,

    // NOT EQUAL
    `a!=b`,
    `a !=b`,
    `a!= b`,
    `a != b`,
    `a\n!=\nb`,
    `a!=b!=c`,

    // ORDER OF OPERATIONS
    `!a > b`,
    `a > !b`,
    `a + b > c`,
    `a * b > c`,
    `a ^ b > c`,
    `a.b > c.d`,

    // INCOMPLETE
    `a>`,
  ];
}
class $RANGE extends $AST {
  static SHAPE = new Shape(
    $COMPARISON,
    { min: 0 },

    /^(\.\.|\.=)/,
    { s: $s.OP },

    $COMPARISON,
    { min: 0 }
  );
  static SAMPLES = [
    //RANGE
    `a..b`,
    `a ..b`,
    `a.. b`,
    `a .. b`,
    `a\n..\nb`,

    // RANGE EQUALS
    `a.=b`,
    `a .=b`,
    `a.= b`,
    `a .= b`,
    `a\n.=\nb`,

    // POSTFIX RANGE
    `a..`,
    `a ..`,
    `a\n..`,

    // POSTFIX RANGE EQUALS
    `a.=`,
    `a .=`,
    `a\n.=`,

    // PREFIX RANGE
    `..a`,
    `.. a`,
    `..\na`,

    // PREFIX RANGE EQUALS
    `.=a`,
    `.= a`,
    `.=\na`,

    // EMPTY RANGE
    `..`,
    `..`,
    `..\n`,

    // EMPTY RANGE EQUALS
    `.=`,
    `.=`,
    `.=\n`,

    // ORDER OF OPERATIONS
    `!a .= b`,
    `a .= !b`,
    `a + b .= c`,
    `a * b .= c`,
    `a ^ b .= c`,
    `a > b .= c`,
    `a.b .= c.d`,
    `..a.b`,
  ];
}

class $LOGICAL_OR extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $RANGE,

    /^or\b/,
    {
      s:
        $s.OP +
        `inlineb  fs:0.9em p:(0em .2em)  fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) r:0.33em `,
    },

    this
  );
  static SAMPLES = [
    `a or b`,

    `a\nor\nb`,
    `a or b or c`,

    // ORDER OF OPERATIONS
    `!a or b`,
    `a or b + c`,
    `a or b * c`,
    `a or b ^ c`,
    `a.b or c.d`,

    // INCOMPLETE
    `a or`,
  ];
}
class $LOGICAL_AND extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $LOGICAL_OR,

    /^and\b/,
    { s: $s.OP },

    this
  );
  static SAMPLES = [
    `a and b`,

    `a\nand\nb`,
    `a and b and c`,

    // ORDER OF OPERATIONS
    `!a and b`,
    `a and b + c`,
    `a and b * c`,
    `a and b ^ c`,
    `a.b and c.d`,
    `a and b or c`,

    // INCOMPLETE
    `a and`,
  ];
}

class $TERINARY extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $LOGICAL_AND,

    "?",
    { s: $s.OP },

    $CODE_EXP,

    ":",
    { s: $s.OP },

    $CODE_EXP
  );
  static SAMPLES = [
    `a?b:c`,
    `a ? b : c`,
    `a\n?\nb\n:\nc`,
    `a ? b ? c : d : e`,
    `a ? b : c ? d : e`,

    // ORDER OF OPERATIONS
    `!a ? b : c`,
    `a+b ? c : d`,
    `a*b ? c : d`,
    `a^b ? c : d`,
    `a.b ? c : d`,
    `a and b ? c : d`,
    `a or b ? c : d`,
    `a ? b = c : c = d`,

    // INCOMPLETE
    `a ?`,
    `a ? b`,
    `a ? b c`,
  ];
}

class $EXPONENT_ASSIGN extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $TERINARY,

    /^\^=/,
    { s: $s.OP },

    this
  );
  static SAMPLES = [
    // MODULO
    `a^=b`,
    `a ^=b`,
    `a^= b`,
    `a ^= b`,
    `a\n^=\nb`,
    `a^=b^=c`,

    // ORDER OF OPERATIONS
    `!a ^= b`,
    `a ^= !b`,
    `a ^= b?c:d`,
    `a ^= b + c`,
    `a ^= b * c`,
    `a ^= b ^ c`,
    `a.b ^= c.d`,
    `a ^= b..c`,
    `a ^= b and c`,
    `a ^= b or c`,

    // INCOMPLETE
    `a^=`,
  ];
}
class $MULTIPLICATIVE_ASSIGN extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $EXPONENT_ASSIGN,

    /^(%=|\/=|\*=)/,
    { s: $s.OP },

    this
  );
  static SAMPLES = [
    // MODULO
    `a%=b`,
    `a %=b`,
    `a%= b`,
    `a %= b`,
    `a\n%=\nb`,
    `a%=b%=c`,

    // DIVIDE
    `a/=b`,
    `a /=b`,
    `a/= b`,
    `a /= b`,
    `a\n/=\nb`,
    `a/=b/=c`,

    // MULTIPLY
    `a*=b`,
    `a *=b`,
    `a*= b`,
    `a *= b`,
    `a\n*=\nb`,
    `a*=b*=c`,

    // ORDER OF OPERATIONS
    `!a *= b`,
    `a *= !b`,
    `a *= b ^= c`,
    `a *= b?c:d`,
    `a *= b + c`,
    `a *= b * c`,
    `a *= b ^ c`,
    `a.b *= c.d`,
    `a *= b..c`,
    `a *= b and c`,
    `a *= b or c`,

    // INCOMPLETE
    `a*=`,
  ];
}
class $ADDITIVE_ASSIGN extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $MULTIPLICATIVE_ASSIGN,

    /^(-=|\+=)/,
    { s: $s.OP },

    this
  );
  static SAMPLES = [
    // SUBTRACT
    `a-=b`,
    `a -=b`,
    `a-= b`,
    `a -= b`,
    `a\n-=\nb`,
    `a-=b-=c`,

    // ADD
    `a+=b`,
    `a +=b`,
    `a+= b`,
    `a += b`,
    `a\n+=\nb`,
    `a+=b+=c`,

    // ORDER OF OPERATIONS
    `!a += b`,
    `a -= !b`,
    `a += b *= c`,
    `a += b ^= c`,
    `a += b?c:d`,
    `a += b + c`,
    `a += b * c`,
    `a += b ^ c`,
    `a.b += c.d`,
    `a += b..c`,
    `a += b and c`,
    `a += b or c`,

    // INCOMPLETE
    `a+=`,
  ];
}
class $ASSIGN extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $ADDITIVE_ASSIGN,

    /^=(?!=)/,
    { s: $s.OP },

    this
  );
  static SAMPLES = [
    // ASSIGN
    `a=b`,
    `a =b`,
    `a= b`,
    `a = b`,
    `a\n=\nb`,
    `a=b=c`,

    // ORDER OF OPERATIONS
    `a = b += c`,
    `a = b *= c`,
    `a = b ^= c`,
    `!a = b`,
    `a = !b`,
    `a = b + c`,
    `a = b * c`,
    `a = b ^ c`,
    `a = b .. c`,
    `a = b?c:d`,

    // INCOMPLETE
    `a=`,
  ];
}
class $RETURN extends $AST {
  static SHAPE = new Shape(
    /^return\b/,
    {
      s:
        $s.KEYWORD +
        `inlineb p:(0em .2em) fc:white bg:linear-gradient(45deg,#ff6ec4,#7873f5) fs:0.9em r:0.33em`,
    },

    $ASSIGN,
    { min: 0 }
  );
  static SAMPLES = [
    `return`,
    `return a`,
    `return\na`,

    // // ORDER OF OPERATIONS
    `return !a`,
    `return a=b`,
    `return a+b`,
    `return a*b`,
    `return a^b`,
    `return a==b`,
    `return a and b`,
    `return a or b`,
    `return a..b`,
  ];
}

$CODE_EXP.SHAPE = new Shape([$COMMENT, $RETURN, $ASSIGN]);
$CODE_LINE_TOKENS.SHAPE = new Shape([], { min: 0, max: Infinity }, "\n");

// -------------------------- #$STYLE --------------------------
// redesign the style system to integrate events, pseudos, attributes, etc.
class $STYLE_EXP extends $EXP {}
class $STYLE extends $AST {
  static SHAPE = new Shape([$STYLE_EXP, $UNKNOWN], { min: 0, max: Infinity });
  static SAMPLES = [
    `
--primary-color:#3498db
--secondary-color:#2ecc71
--background-color:#ecf0f1
--text-color:#2c3e50
--transition-speed:0.3s

--sm:100px
--md:250px
--lg:500px

--full:100%
--dynamic:flex

@slide-away( 1s |50%| ml:200px )
`,
    `
bg:--background-color fc:--text-color
ff:"Arial, sans-serif"
m:0 pl:pr:20px bg:(2px solid red) tf:(scale(1) rotate(360deg))
    `,
    `
w:200px h:300vh |w:500px H:20% :hover| c:pointer

|mouseleave| fc:purple

|:hover|
bg:--secondary-color
w:200px
    `,
    `
ml:mt:mr:calc(20% + 50px / 200rem)
@(
2s ease-in-out 1s infinite alternate both
|start| w:10px h:50px
|50%| bg:red
|end| w:20px
)
  `,

    // INVALID
    `
  5400
          `,
  ];
}

class $STYLE_VALUE extends $EXP {}

class $STYLE_PORTAL extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 1;
  static SHAPE = new Shape(
    `'`,
    { s: $s.OP },

    [$STYLE_EXP, $UNKNOWN],
    { min: 0, max: Infinity },

    `'`,
    { s: $s.OP }
  );
  static SAMPLES = [
    `''`,
    `'a'`,
    `'a b'`,
    `'\na\nb\n'`,

    // INCOMPLETE
    `'`,

    // $UNKNOWN
    `'%'`,
  ];
}

class $MEASUREMENT extends $AST {
  static SHAPE = new Shape(/^-?\d*\.?\d+[a-zA-Z%]*/, { s: $s.NUMBER });
  static SAMPLES = ["553", "0px", "1.5em", "-2rem", "20%"];
}
class $PSEUDO extends $AST {
  static SHAPE = new Shape(/^::?[a-zA-Z]+(-[a-zA-Z]+)*(\([^)]*\))?/, {
    s: $s.IDENTIFIER,
  });
  static SAMPLES = [
    // Pseudo-classes
    ":hover",
    ":active",
    ":first-child",
    ":nth-child(n)",
    ":nth-last-child(n)",
    ":lang(language)",

    // Pseudo-elements
    "::before",
    "::after",
    "::first-line(num)",
  ];
}
class $STYLE_IDENTIFIER extends $AST {
  static SHAPE = new Shape(/^(--)?[a-zA-Z][a-zA-Z0-9-_]*/, {
    s: $s.IDENTIFIER,
  });
  static SAMPLES = [
    // Simple Identifiers
    "word",
    "hyphenated-word",
    "multi-hyphenated-word",
    "AnotherExample",
    "with-Multiple-hyphens",
    "CapitalWord",
    "mixedCaseWord",
    "longer-hyphenated-Example",
  ];
}

class $HEX_COLOR extends $AST {
  static SHAPE = new Shape(
    /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/,
    { s: $s.NUMBER }
  );
  static SAMPLES = [
    "#fff",
    "#000",
    "#1234",
    "#abcd",
    "#123abc",
    "#AABBCC",
    "#12345678",
    "#abcdef12",
  ];
}
class $STRING extends $AST {
  static SHAPE = new Shape(/^"([^"\\]*(\\.[^"\\]*)*)"/, { s: $s.STRING });
  static SAMPLES = [`"abc"`, `"a\\"b\\"c"`];
}

class $PARENTHESIZED_STYLE_VALUES extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 1;
  static SHAPE = new Shape(
    `(`,
    { s: $s.OP },

    () => $STYLE_VALUE,
    { min: 0, max: Infinity },

    `)`,
    { s: $s.OP }
  );
  static SAMPLES = [
    `(a)`,
    `(\na\n)`,
    `(a b c)`,

    // INCOMPLETE
    `(`,
  ];
}

class $STYLE_FUN_CALL extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $STYLE_IDENTIFIER,

    `(`,
    { s: $s.OP },

    new Shape(() => $STYLE_VALUE, `,`, { min: 0, s: $s.OP }),
    { min: 0, max: Infinity },

    `)`,
    { s: $s.OP }
  );
  static SAMPLES = [
    `a()`,
    `a(b)`,
    `a(b, c, d)`,
    `calc(a - b)`,
    `calc(a - calc(b * c))`,
    `calc(20% + 50px / 200rem)`,

    // INCOMPLETE
    `a(`,
  ];
}

class $STYLE_MULTIPLICATIVE extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    [$STYLE_FUN_CALL, $HEX_COLOR, $STRING, $STYLE_IDENTIFIER, $MEASUREMENT],

    /^(\/(?!=|\/)|\*(?!=))/,
    { s: $s.OP },

    this
  );
  static SAMPLES = [
    // DIVIDE
    `a/b`,
    `a /b`,
    `a/ b`,
    `a / b`,
    `a\n/\nb`,
    `a/b/c`,

    // MULTIPLY
    `a*b`,
    `a *b`,
    `a* b`,
    `a * b`,
    `a\n*\nb`,
    `a*b*c`,

    // INCOMPLETE
    `a*`,
  ];
}
class $STYLE_ADDITIVE extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $STYLE_MULTIPLICATIVE,

    /^(-(?!=|-)|\+(?!=|\+))/,
    { s: $s.OP },

    this
  );
  static SAMPLES = [
    // SUBTRACT
    `a - b`,
    `a\n-\nb`,
    `a - b - c`,

    // ADD
    `a+b`,
    `a +b`,
    `a+ b`,
    `a + b`,
    `a\n+\nb`,
    `a+b+c`,

    // ORDER OF OPERATIONS
    `a + b * c`,

    // INCOMPLETE
    `a+`,
  ];
}

class $ANIMATION extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 1;
  static SHAPE = new Shape(
    new RegExp(`^@(${$STYLE_IDENTIFIER.SHAPE[0].value.source})?\\(`),
    { s: $s.OP },

    [$COMMENT, $CODE_PORTAL, $MEASUREMENT, $STYLE_IDENTIFIER],
    { min: 0, max: Infinity },

    $STYLE_EXP,
    { min: 0, max: Infinity },

    ")",
    { s: $s.OP }
  );
  static SAMPLES = [
    "@()",
    "@myAnimation()",
    `@fade(
    2s ease-in-out 1s infinite alternate both
    |start| w:10px h:50px
    |50%| bg:red
    |end| w:20px
  )`,

    // INCOMPLETE
    `@(`,
  ];
}

class $STYLE_ATTR extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape(
    $STYLE_IDENTIFIER,

    ":",
    { s: $s.OP },

    [() => $STYLE_ATTR_NESTED, $STYLE_VALUE]
  );
  static SAMPLES = [
    `a:b`,
    `a:b`,
    `a:b:c`,
    `a:b:calc(20% + 50px / 200rem)`,

    // INCOMPLETE
    `a:`,
  ];
}
class $STYLE_ATTR_NESTED extends $STYLE_ATTR {
  static fallbackToFirstExp = false;
}

class $STYLE_QUERY extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 1;
  static SHAPE = new Shape(
    "|",
    { s: $s.OP },

    [$MEASUREMENT, $STYLE_ATTR, $PSEUDO, $STYLE_IDENTIFIER],
    { min: 0, max: Infinity },

    "|",
    { s: $s.OP }
  );
  static SAMPLES = [
    "|a|",
    "|a b|",
    `
  |
    :selected
    flex
  |
      `,

    // INCOMPLETE
    `|`,
  ];
}

$STYLE_EXP.SHAPE = new Shape([
  $ANIMATION,
  $COMMENT,
  $CODE_PORTAL,
  $STYLE_QUERY,
  $STYLE_ATTR,
]);
$STYLE_VALUE.SHAPE = new Shape([
  $COMMENT,
  $CODE_PORTAL,
  $PARENTHESIZED_STYLE_VALUES,
  $ANIMATION,
  $STYLE_ADDITIVE,
]);

// -------------------------- #$MARKUP --------------------------
class $MARKUP_EXP extends $EXP {}
class $MARKUP extends $AST {
  static SHAPE = new Shape([$MARKUP_EXP, $UNKNOWN], { min: 0, max: Infinity });
  static SAMPLES = [
    `
    ## Employee Information Table

    The table below lists all of the \\iemployees\\i in the west coast office. The table is broken down into the following categories:

    1. Employee ID
    2. Name
    3. Position
    4. Department
    5. Location

    #|: Employee ID |: Name :|: Position :|: Department :|: Location :|
    | 001 | John Doe | Software Engineer | Development | New York |
    | 002 | Jane Smith | Project Manager | Project Management | San Francisco |
    | 003 | Mike Johnson | UX Designer | Design | Austin |
    | 004 | Emily Davis | DevOps Engineer | Operations | Seattle |
    | 005 | Alex Garcia | Data Analyst | Data Science | Boston |
    | 006 | Samantha Brown | Product Manager | Product | Denver |
    | 007 | Christopher Wilson | QA Engineer | Quality Assurance | Chicago |
    | 008 | Jessica Martinez | Frontend Developer | Development | New York |
    | 009 | Daniel Taylor | Backend Developer | Development | San Francisco |
    | 010 | Laura Anderson | Cloud Architect | Cloud Services | Austin |
    | 011 | Ryan White | Security Analyst | Security | Seattle |
    | 012 | Chloe Green | Database Administrator | Database | Boston |
    | 013 | Benjamin King | Mobile Developer | Development | Denver |
    | 014 | Sophia Hall | Content Strategist | Marketing | Chicago |
    | 015 | Ethan Thompson | Graphic Designer | Design | New York |
    | 016 | Olivia Lewis | HR Manager | Human Resources | San Francisco |
    | 017 | Mason Young | Financial Analyst | Finance | Austin |
    | 018 | Ava Hill | Customer Support Specialist | Support | Seattle |
    | 019 | Noah Scott | Systems Administrator | IT | Boston |
      `,
    `
    # Comprehensive List Example

    - Main Topic 1
    - Subtopic A
      - Detail 1
      - Detail 2
    - Subtopic B
      - Detail 1
      - Detail 2
        - Sub-detail a
        - Sub-detail b
    - Main Topic 2
    1. Subtopic A
      1. Detail 1
      2. Detail 2
          a. Sub-detail a
          b. Sub-detail b
    2. Subtopic B
      1. Detail 1
      2. Detail 2
    - Main Topic 3
    a. Subtopic A
      1. Detail 1
          a. Sub-detail a
          b. Sub-detail b
      2. Detail 2
    b. Subtopic B
      - Detail 1
      - Detail 2
      `,
    `
    ## Tasks to Complete

    [ ] Complete the initial project setup @[Setup Guide | https://example.com/setup-guide]
    [x] Review project requirements @[Requirements Document | https://example.com/requirements]
    [ ] Design the application architecture ![Architecture Diagram | architecture-diagram.png]
    [x] Set up the development environment %[@Development Environment Setup Video | setup-video.mp4]
    [ ] Implement the login functionality &[@API Documentation | https://api.example.com/documentation]
    [ ] Conduct initial testing #[Testing Tools | https://example.com/testing-tools]
    [x] Schedule project kickoff meeting @[Meeting Scheduler | https://calendar.example.com]
      `,
    `
    # Factorial Function Documentation

    The factorial of a non-negative integer \\cn\\c is the product of all positive integers less than or equal to \\cn\\c. It is denoted by \\cn!\\c.

    ## Syntax

    '''
    factorial = fun n:
      if n == 0:
          return 1
      else
          return n * factorial(n-1)
    '''

    ## Usage Example

    To calculate the factorial of 5, you would call the function as follows:

    '''
    result = factorial(5)
    '''

    This will calculate the factorial of 5. The expected result is:

    Today's result is {120}

    > \\bNote:\\b The factorial function is a classic example of a recursive function, a function that calls itself.

    ---

    ## Understanding Recursion

    Recursion is a fundamental concept in computer science, where a function calls itself to solve a problem. A base case is essential to prevent infinite recursion.

    ---
      `,
    `
    ## Puppies are cute

    Have you ever thought that puppies are just the most adorable things on the planet! Here's a list of resources about cute puppies:

    $nav 'bg:#3498db fc:white p:10px flex space-between'
      $logo src:\`logo.png\` alt:\`Company Logo\` 'h:50px'
      $link href:\`#home\` 'Home'
      $link href:\`#about\` \`About\`
      $link href:\`#contact\` \`Contact\`

    If you find these links useful, please check out more at @[ cute puppies | cutepuppies.com ]
      `,
  ];
}
class $MARKUP_PORTAL extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 1;
  static SHAPE = new Shape(
    "`",
    { s: $s.STRING },

    [$MARKUP_EXP],
    { min: 0, max: Infinity, s: $s.STRING },

    "`",
    { min: 0, s: $s.STRING }
  );
  static s = $s.STRING;
  static SAMPLES = [
    "``",
    "`a\\r`",

    // INCOMPLETE
    "`",
  ];
}

class $ESCAPED_CHAR extends $AST {
  static SHAPE = new Shape(/^\\[^\s\n]/, { s: $s.COMMENT });
  static SAMPLES = [
    "\\a",
    "\\t",
    "\\n",
    '\\"',
    "\\'",
    "\\\\",
    "\\$",
    "\\%",
    "\\_",
    "\\{",
    "\\}",
    "\\[",
    "\\]",
    "\\:",
    "\\;",
    "\\!",
    "\\@",
    "\\#",
    "\\&",
    "\\*",
  ];
}
class $HORIZONTAL_RULE extends $AST {
  static SHAPE = new Shape(/^---\s*(\n|$)/, { s: $s.COMMENT });
  static SAMPLES = ["---", "---\n"];
}

class $PARAGRAPH extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 1;
  static SHAPE = new Shape(
    [
      $ESCAPED_CHAR,
      $CODE_PORTAL,
      () => $LINK,
      /(?:(?!\\[^\s\n]|{|`|[@!%&#]\[).)+/,
    ],
    { min: 1, max: Infinity },

    /(\n|$)+/
  );
  static SAMPLES = [
    `hello world`,
    `hello {name} how are \\byou \\i doing \\b {exp} is cool`,
    `hello, please click on @[dog|cat] to see the homepage`,
  ];
}

class $LINK extends $AST {
  static SHAPE = new Shape(
    /^(@|!|%|&|#)\[/,
    { s: $s.OP },

    [$ESCAPED_CHAR, $CODE_PORTAL, /^(?:(?!\\[^\s\n]|{|`|\|).)+/],
    { max: Infinity },

    "|",
    { s: $s.OP },

    [$ESCAPED_CHAR, /^(?:(?!\\[^\s\n]|{|`|\]).)+/],
    { max: Infinity, s: $s.OP },

    "]",
    { s: $s.OP }
  );
  static SAMPLES = [
    // URL
    `@[dog|cat]`,
    `@[google's homepage| www.google.com]`,
    `@[some \\b {code} text | www.google.com]`,

    // IMAGE
    `![dog|cat]`,
    `![google's homepage| www.google.com]`,
    `![some \\b {code} text | www.google.com]`,

    // VIDEO
    `%[dog|cat]`,
    `%[google's homepage| www.google.com]`,
    `%[some \\b {code} text | www.google.com]`,

    // AUDIO
    `&[dog|cat]`,
    `&[google's homepage| www.google.com]`,
    `&[some \\b {code} text | www.google.com]`,

    // IFRAME
    `#[dog|cat]`,
    `#[google's homepage| www.google.com]`,
    `#[some \\b {code} text | www.google.com]`,
  ];
}

class $LIST_ITEM extends $AST {
  static SHAPE = new Shape(
    /^(-|\w*\.) /,
    { s: $s.OP },

    $PARAGRAPH
  );
  static SAMPLES = [`- a`, `a. b`, `1. a`, `  - a`];
}
class $CHECKBOX extends $AST {
  static SHAPE = new Shape(
    /^\[[\w ]\] /,
    { s: $s.OP },

    $PARAGRAPH
  );
  static SAMPLES = [`[ ] a`, `[a] b`, `[a] w\\world`, `[ ] cool`];
}
class $BLOCKQUOTE extends $AST {
  static SHAPE = new Shape(
    "> ",
    { s: $s.OP },

    $PARAGRAPH,
    { s: `fst:italic` }
  );
  static SAMPLES = [`> a`];
}
class $HEADING extends $AST {
  static SHAPE = new Shape(
    /^#+ /,
    { s: $s.OP },

    $PARAGRAPH
  );
  static SAMPLES = [
    `# a`,
    `# heading`,
    `## heading`,
    `### heading`,
    `#### heading`,
    `##### he\\gadi\\gng`,
    `###### heading`,
  ];
}

class $DISPLAY_CODE extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 1;
  static SHAPE = new Shape(
    `"""`,
    { s: $s.OP },

    $CODE_EXP,
    { min: 0, max: Infinity },

    `"""`,
    { s: $s.OP }
  );
  static SAMPLES = [
    `"""a"""`,
    `
"""
a
b
"""
`,
  ];
}

class $TABLE_ROW extends $AST {
  static SHAPE = new Shape(
    /^#?\|:?/,
    { s: $s.OP },

    new Shape(
      [$ESCAPED_CHAR, /^(?:(?!\\[^\s\n]|[@!%&#]\[|{|`|\||:\||\|:|:\|:).)+/],
      { max: Infinity },

      /^:?\|:?/,
      { s: $s.OP }
    ),
    { min: 0, max: Infinity },

    `\n`,
    { min: 0 }
  );
  static SAMPLES = [
    `|hi|`,
    `|a|b|c|`,
    `|: content 1 |: hea__din__g2 |: hello there 3 |`,
    `|: hebad**ing** 1 :| hi | lil nepotiz 3 :|`,

    // TABLE_HEADING_ROW
    `#| hi |`,
  ];
}

$MARKUP_EXP.SHAPE = new Shape([
  $CODE_PORTAL,
  () => $ELEMENT,
  $HORIZONTAL_RULE,
  $LINK,
  $ESCAPED_CHAR,
  $LIST_ITEM,
  $CHECKBOX,
  $BLOCKQUOTE,
  $HEADING,
  $DISPLAY_CODE,
  $TABLE_ROW,
  $PARAGRAPH,
]);

// -------------------------- #$ELEMENT --------------------------

class $ELEMENT_EXP extends $EXP {}
class $ELEMENT_EXP_BLOCK extends $INDENT_BLOCK {
  static SHAPE = new Shape([$ELEMENT_EXP, $UNKNOWN]);
}
class $ELEMENT extends $AST {
  static SHAPE = new Shape(
    /^\$([a-zA-Z_][a-zA-Z0-9-_]*)?/,
    { s: $s.ELEMENT },

    $ELEMENT_EXP,
    { min: 0, max: Infinity },

    /^ *\n/,
    { min: 0, max: 0 },

    $ELEMENT_EXP_BLOCK,
    { min: 0 },

    `)`,
    { min: 0, max: 0 }
  );
  static SAMPLES = [
    `$`,
    `
$html lang:\`en\`
  $head
    $meta charset:\`UTF-8\`
    $meta httpequiv:\`X-UA-Compatible\` content:\`IE=edge\`
    $meta name:\`viewport\` content:\`width=device-width, initial-scale=1.0\`
    $title \`Sample Webpage\`
    $link rel:\`stylesheet\` href:\`styles.css\`
    $script src:\`script.js\` ::defer
  $body
    $header
      $nav
        $ul
          $li $a href:\`/\` \`Home\`
          $li $a href:\`/about\` \`About\`
          $li w:\`100px\` ::visited $a href:\`/contact\` \`Contact\`
      $h1 \`Welcome to My Website\`
    $main
      $nav_bar '{s}'
        $img src:\`logo.png\` 'w:75px ml:1em mb:2em'
    
      $active_items
        $active_sprint 'mb:.5em' {activeSprint.name}
        $backlog \`backlog\`
      $separator 'mt:.5em mb:.5em b:(1px solid --text-accent)'
      $projects
        $section-heading 'fc:--text-accent mb:.5rem' \`PROJECTS\`
        $list _:{projects}
          {fun project: ($\{Project.ListItem} ::project)}
      $separator 'mt:.5em mb:.5em b:(1px solid --text-accent)'
      $sprints
        $section-heading 'fc:--text-accent mb:.5rem' \`SPRINTS\`
        $list _:{sprints.reverse()}
          {fun sprint: ($\{Sprint.ListItem} ::sprint)}
      $section id:\`intro\`
        \`Welcome! This is a sample website. Here's a brief intro about our website.\`
        $a href:\`/learn-more\` \`Learn more\`
      $section id:\`features\`
        $h2 \`Features\`
        $ul
          $li \`Responsive Design\`
          $li \`High-quality Content\`
          $li \`Interactive Elements\`
      $section id:\`subscribe\`
        $h2 \`Subscribe\`
        $form action:\`/subscribe\` method:\`post\`
          $label for:\`email\` \`Email:\`
          $input type:\`email\` id:\`email\` placeholder:\`Enter your email\`
          $button type:\`submit\` \`Subscribe\`
    $footer
      \`© 2023 My Website. All rights reserved.\`
    `,
  ];
}

class $ELEMENT_BOOLEAN_ATTR extends $AST {
  static SHAPE = new Shape(/^::[a-zA-Z][a-zA-Z0-9-_]*/);
  static SAMPLES = [
    "::first-child",
    "::hover",
    "::active",
    "::li-padded",
    "::custom-element",
    "::element-1",
    "::element_with_underscore",
    "::a1",
    "::B2",
  ];
}
class $ELEMENT_ATTR extends $AST {
  static allowIncompleteParse = true;
  static incompleteParseThreshold = 2;
  static SHAPE = new Shape($IDENTIFIER, ":", [
    $MARKUP_PORTAL,
    $CODE_PORTAL,
    $STYLE_PORTAL,
    $ELEMENT_ATTR,
    $IDENTIFIER,
  ]);
  static SAMPLES = [
    `a:b`,
    `a :b`,
    `a: b`,
    `a : b`,
    `a\n:\nb`,
    `a:b:c`,

    // INCOMPLETE
    `a:`,
  ];
}

$ELEMENT_EXP.SHAPE = new Shape([
  $ELEMENT,
  $CODE_PORTAL,
  $STYLE_PORTAL,
  $MARKUP_PORTAL,
  $ELEMENT_BOOLEAN_ATTR,
  $ELEMENT_ATTR,
]);
window.useCodeParser = (code, $ = $CODE) => {
  const parser = new Lexer(code);
  const $ast = $.parse(parser);
  // console.log($ast);
  // $ast && $ast.format();
  return $ast;
};

useTests(
  "Hippie ASTs",
  () => {
    let debug = false;
    let OPS = [
      // $CODE
      {
        root: $CODE,
        asts: [$CODE],
        // onlyAST: $PARENTHESIZED_CODE_EXP,
        // only: true,
      },
      // $CODE_EXP
      {
        root: $CODE_EXP,
        asts: [
          $RETURN,
          $PARENTHESIZED_CODE_EXP,
          $CODE_PORTAL,
          $MARKUP_PORTAL,
          $ASSIGN,
          $ADDITIVE_ASSIGN,
          $MULTIPLICATIVE_ASSIGN,
          $EXPONENT_ASSIGN,
          $NEGATION,
          $TERINARY,
          $LOGICAL_AND,
          $LOGICAL_OR,
          $RANGE,
          $COMPARISON,
          $ADDITIVE,
          $MULTIPLICATIVE,
          $EXPONENT,
          $INDEX,
          $FUN_CALL,
          $FIELD,
          $LIST,
          $FUN,
          $SWITCH,
          $IF,
          $ELIF,
          $ELSE,
          $FOR,
          $DO_WHILE,
          $WHILE,
          $NUMBER,
          $COMMENT,
          $BOOLEAN,
          $KEYWORD,
          $IDENTIFIER,
        ],
        // onlyAST: $IF,
        // only: true,
      },
      // $STYLE
      {
        root: $STYLE,
        asts: [$STYLE],
        // onlyAST: $PARENTHESIZED_CODE_EXP,
        // only: true,
      },
      // $STYLE_EXP
      {
        root: $STYLE_EXP,
        asts: [$COMMENT, $CODE_PORTAL, $STYLE_QUERY, $ANIMATION, $STYLE_ATTR],
        // onlyAST: $COMMENT,
        // only: true,
      },
      // $STYLE_VALUE
      {
        root: $STYLE_VALUE,
        asts: [
          $COMMENT,
          $CODE_PORTAL,
          $ANIMATION,
          $PARENTHESIZED_STYLE_VALUES,
          $STYLE_ADDITIVE,
          $STYLE_MULTIPLICATIVE,
          $STYLE_FUN_CALL,
          $STYLE_IDENTIFIER,
          $HEX_COLOR,
          $STRING,
          $MEASUREMENT,
        ],
        // onlyAST: $STYLE_ATTR,
        // only: true,
      },
      // $MARKUP
      {
        root: $MARKUP,
        asts: [$MARKUP],
        // onlyAST: $PARENTHESIZED_CODE_EXP,
        only: false,
      },
      // $MARKUP_EXP
      {
        root: $MARKUP_EXP,
        asts: [
          $CODE_PORTAL,
          $HORIZONTAL_RULE,
          $LINK,
          $LIST_ITEM,
          $CHECKBOX,
          $ELEMENT,
          $BLOCKQUOTE,
          $HEADING,
          $DISPLAY_CODE,
          $TABLE_ROW,
          $PARAGRAPH,
        ],
        // onlyAST: $PARAGRAPH,
        // only: true,
      },
      // $ELEMENT_EXP
      {
        root: $ELEMENT_EXP,
        asts: [
          $ELEMENT,
          $CODE_PORTAL,
          $STYLE_PORTAL,
          $MARKUP_PORTAL,
          $ELEMENT_BOOLEAN_ATTR,
          $ELEMENT_ATTR,
        ],
        // onlyAST: $PARAGRAPH,
        only: false,
      },
    ];

    if (OPS.find((op) => op.only)) OPS = OPS.filter((op) => op.only);
    for (let { root, exp, asts: _asts, onlyAST, name } of OPS.filter(
      (op) => !op.skip
    )) {
      let asts = onlyAST ? useArray(onlyAST) : _asts;

      for (const $ of asts) {
        it($.name, () => {
          if (asts[0] === $) console.log(root.name);
          for (const sample of useFunction($.SAMPLES)($) || []) {
            let $ast = useCodeParser(sample, root);
            // console.log($ast);
            // if ($ast) $ast = $ast.exps[0];
            debug && console.log("TEST_AST", root);
            const testResult = $ast instanceof $ && $ast.text === sample;
            if (!testResult)
              console.log(
                `SOURCE: "${sample}"\nRESULT: "${$ast && $ast.text}"\n`,
                $ast
              );
            assert(testResult, `${sample}`);
          }
        });
      }
    }
  },
  { only: false }
);

useTests("Hippie AST Integration", () => {
  it("renders deeply nested structures", () => {
    const $ = $CODE.parse(new Lexer(`a+b-c`));

    assert($.exps.length === 1);
    assert($.exps[0] instanceof $ADDITIVE);
    assert($.exps[0].exps[2] instanceof $ADDITIVE);
    assert($.text === "a+b-c");
  });
});

useTests(
  "$AST performance test",
  () => {
    it("goes fast", async () => {
      // RECORD: 100k chars, 2600 lines, 69ms
      const start = performance.now();
      const s = `
      ## Employee Information Table

      The table below lists all of the \\iemployees\\i in the west coast office. The table is broken down into the following categories:

      1. Employee ID
      2. Name
      3. Position
      4. Department
      5. Location

      {
        if dog == mouse:
            if cat == car:
              if thisIsCool:
                print(\`optimizations are cool\\n and all\`)
                but = that
          for cat in [0..1000]:
            finny = \`super cute puppy\`
            if finny.isCute(puppy):
              doCuteThing()
            else beCute()
            dog = cat + rhino - squirrel
            if dog == mouse:
              if cat == car:
                if thisIsCool:
                  print(\`optimizations are cool\\n and all\`)
                  but = that
                  dog = cat + rhino - squirrel
                  if dog == mouse:
                    if cat == car:
                      if thisIsCool:
                        print(\`optimizations are cool\\n and all\`)
                        but = that
                        dog = cat + rhino - squirrel
                        if dog == mouse:
                          if cat == car:
                            if thisIsCool:
                              print(\`optimizations are cool\\n and all\`)
                              but = that
                              if dog == mouse:
                                if cat == car:
                                  if thisIsCool:
                                    print(\`optimizations are cool\\n and all\`)
                                    but = that
                                    dog = cat + rhino - squirrel
                                    if dog == mouse:
                                      if cat == car:
                                        if thisIsCool:
                                          print(\`optimizations are cool\\n and all\`)
                                          but = that
                                          dog = cat + rhino - squirrel
                                          if dog == mouse:
                                            if cat == car:
                                              if thisIsCool:
                                                print(\`optimizations are cool\\n and all\`)
                                                but = that
                                          for cat in [0..1000]:
                                            finny = \`super cute puppy\`
                                            if finny.isCute(puppy):
                                              doCuteThing()
                                            else beCute()
                                    for cat in [0..1000]:
                                      finny = \`super cute puppy\`
                                      if finny.isCute(puppy):
                                        doCuteThing()
                                      else beCute()
                        for cat in [0..1000]:
                          finny = \`super cute puppy\`
                          if finny.isCute(puppy):
                            doCuteThing()
                          else beCute()
                  for cat in [0..1000]:
                    finny = \`super cute puppy\`
                    if finny.isCute(puppy):
                      doCuteThing()
                    else beCute()
            for cat in [0..1000]:
              finny = \`super cute puppy\`
              if finny.isCute(puppy):
                doCuteThing()
              else beCute()
        }

        cat
                `.repeat(100);

      const _s = `a\n`.repeat(2000);
      // console.log(s);
      // 1283
      const times = [];
      //       const s =
      //         `{` +
      //         `
      // merge = fun left, right:
      //   result = []
      //   leftIndex = 0
      //   rightIndex = 0

      //   while leftIndex < left.length and rightIndex < right.length:
      //     if left[leftIndex] < right[rightIndex]:
      //       result.push(left[leftIndex])
      //       leftIndex += 1
      //     else
      //       result.push(right[rightIndex])
      //       rightIndex += 1
      //       if left[leftIndex] < right[rightIndex]:
      //         result.push(left[leftIndex])
      //         leftIndex += 1
      //       else
      //         for i in arr:
      //           if arr[i] < pivot: left.push(arr[i])
      //           else right.push(arr[i])
      //         result.push(right[rightIndex])
      //         rightIndex += 1
      //         if left[leftIndex] < right[rightIndex]:
      //           result.push(left[leftIndex])
      //           leftIndex += 1
      //         else
      //           for i in arr:
      //             if arr[i] < pivot: left.push(arr[i])
      //             else right.push(arr[i])
      //           resul.push(right[rightIndex])

      //           r = 1
      //           if left[leftIndex] < right[rightIndex]:
      //             result.push(left[leftIndex])
      //   return result.funcy().concat
      // `.repeat(100) +
      //         `}`;
      // console.log(s);
      console.log("chars:", s.length, "\nlines:", s.split("\n").length);
      // const ast = useCodeParser(s, $CODE);

      const ast = useState(useCodeParser(s, $MARKUP));
      // useCodeParser(s, $MARKUP);
      // useCodeParser(s, $MARKUP);

      // const _ = new Lexer(`a\n`.repeat(1000));
      // here's your quadratic right here...
      // console.log(_.currentCol);
      // console.log(_.eat(/\w/y), _.eat(/\w/y), _.eat(/\w/y));
      // while (_.hasMoreToLex) {
      //   _.eat(/\w/y) || _.cursor++;
      // }

      console.log("time to parse:", performance.now() - start);

      const oldUseCache = $AST.useCache;

      // for (let i = 0; i < 20; i++) {
      //   const start = performance.now();
      //   const code = s.repeat(i * 2);
      //   console.log(`PARSING ${i + 1}/200 @ ${code.length} characters`);
      //   useCodeParser(code, $MARKUP);
      //   times.push({
      //     length: code.length,
      //     lines: code.split("\n").length,
      //     msToparse: performance.now() - start,
      //   });
      //   await sleep(10);
      // }

      $AST.useCache = oldUseCache;
      console.log(times.map((t) => t.msToparse).join("\n"));

      assert(ast.text === s);

      console.log(ast);
    });
  },
  { only: true, skip: true }
);

// -------------------------- #useParser --------------------------

let j = 0;
window.useParser = (str, fn, { compress = [T.UNKNOWN], ...options } = {}) => {
  const compressTokens = (tokens) => {
    const mergedTokens = [];
    tokens.forEach((token, i) => {
      const lastMergedToken = mergedTokens[mergedTokens.length - 1];
      if (i > 0) token.paddingLeft = "";

      if (
        lastMergedToken &&
        compress.includes(lastMergedToken.type) &&
        lastMergedToken.type === token.type
      ) {
        lastMergedToken.value += token.value;
        lastMergedToken.end = token.end;
        lastMergedToken.paddingRight = token.paddingRight;
      } else mergedTokens.push(token);
    });
    mergedTokens.value = mergedTokens.reduce((acc, t) => acc + t.value, "");
    return mergedTokens;
  };

  const matchCache = {};
  let tokens = useCollectionParser(str, {
    match: (regex, { getCursor, getCollection }) => {
      return (
        (!regex && getCursor() < getCollection().length) ||
        (regex && regex.test(getCollection().slice(getCursor())))
      );
    },
    consume: (regex, { getCursor, setCursor, getCollection }) => {
      const cacheKey = `${getCursor()}-${regex ? regex.source : "null"}`;
      if (cacheKey in matchCache) {
        const cachedToken = matchCache[cacheKey];
        setCursor(getCursor() + cachedToken.value.length);
        return cachedToken;
      }

      str = getCollection();
      if ([undefined, null].includes(regex) && getCursor() >= str.length)
        return null;
      const remainingStr = str.slice(getCursor());
      const match =
        remainingStr.match(regex) ||
        ((regex = T.UNKNOWN) && remainingStr.match(T.UNKNOWN));

      if (!match) return null;

      const value = match[0];

      const lines = str
        .slice(0, getCursor())
        .split("\n")
        .map((l) => l + "\n");
      const line = lines.length - 1;
      const indent = lines[line].split("").findIndex((c) => c !== " ");

      let paddingLeft = "";
      let cursor = getCursor() - 1;
      while (["\n", " "].includes(str[cursor]))
        paddingLeft = str[cursor--] + paddingLeft;

      let paddingRight = "";
      cursor = getCursor() + value.length;
      while (["\n", " "].includes(str[cursor])) paddingRight += str[cursor++];

      let col = getCursor() - str.lastIndexOf("\n", getCursor() - 1) - 1;
      if (col < 0) col = 0;

      const token = new Token({
        type: regex,
        value,
        start: getCursor(),
        indent,
        line,
        col,
        end: setCursor(getCursor() + value.length),
        paddingLeft,
        paddingRight,
      });

      matchCache[cacheKey] = token;
      return token;
    },
    parse: ({ taste, eat, ...rest }) =>
      fn({
        taste: (...args) => {
          let result = taste(...args);

          if (result)
            if (!result || result.includes(null)) return null;
            else result = compressTokens(result);

          return result;
        },
        eat: (...args) => {
          let result = eat(...args);
          if (!result || result.includes(null)) return null;
          else result = compressTokens(result);

          return result;
        },

        ...rest,
      }),
    ...options,
  });

  if (Array.isArray(tokens)) {
    if (tokens.includes(null)) return null;
    tokens = compressTokens(tokens);
  }
  return tokens;
};
useTests("useParser", () => {
  const IDENTIFIER_TOKEN = new Token({
    type: T.IDENTIFIER,
    value: `a`,
    end: 1,
  });
  const PLUS_TOKEN = new Token({
    type: T.PLUS,
    value: `+`,
    start: 1,
    end: 2,
    col: 1,
    paddingRight: " ",
  });
  const str = `a+ 40 dog`;

  it("returns the result returned from the parsing fn", () => {
    let result = [IDENTIFIER_TOKEN, PLUS_TOKEN];
    result.value = IDENTIFIER_TOKEN.value + PLUS_TOKEN.value;

    assert(
      useParser(str, () => [IDENTIFIER_TOKEN, PLUS_TOKEN]).matches(result)
    );
  });

  // taste/eat
  it("returns a list of parsed tokens along with a value field", () => {
    useParser(str, ({ eat, taste, setCursor, getCursor }) => {
      assert(taste(T.AND) === null);
      assert(eat(T.AND) === null);

      let result = [{ ...IDENTIFIER_TOKEN, type: T.UNKNOWN }];
      result.value = IDENTIFIER_TOKEN.value;
      assert(taste().matches(result));
      assert(eat().matches(result));

      setCursor(0);
      result = [IDENTIFIER_TOKEN, PLUS_TOKEN];
      result.value = IDENTIFIER_TOKEN.value + PLUS_TOKEN.value;
      assert(taste(T.IDENTIFIER, T.PLUS).matches(result));
      assert(eat(T.IDENTIFIER, T.PLUS).matches(result));
      assert(getCursor() === 2);

      setCursor(0);
      result = [{ ...IDENTIFIER_TOKEN, type: T.UNKNOWN }];
      result.value = IDENTIFIER_TOKEN.value;
      assert(taste().matches(result));
      assert(eat().matches(result));
      assert(getCursor() === 1);

      setCursor(str.length);
      assert(taste() === null);
      assert(eat() === null);
      assert(getCursor() === str.length);
    });
  });
  it("tastes newline padded strings", () => {
    const tokens = useParser(`\n`, ({ eat }) => eat(T.NEW_LINE));
    const result = [new Token({ type: T.NEW_LINE, end: 1, value: "\n" })];
    result.value = `\n`;
    assert(tokens.matches(result));
  });
  it("compresses UNKNOWN tokens by default", () => {
    const tokens = useParser(str, ({ eat }) => eat(T.IDENTIFIER, []));
    let result = [
      IDENTIFIER_TOKEN,
      new Token({
        type: T.UNKNOWN,
        value: str.slice(1),
        start: 1,
        end: str.length,
        col: 1,
      }),
    ];
    result.value = str;
    assert(tokens.matches(result));
  });
  it("compresses specified tokens", () => {
    const str = `\n\n\n  **`;
    const tokens = useParser(
      str,
      ({ eat }) =>
        eat(
          T.NEW_LINE,
          T.NEW_LINE,
          T.NEW_LINE,
          T.WHITE_SPACE,
          T.ASTERISK,
          T.ASTERISK
        ),
      { compress: [T.NEW_LINE, T.ASTERISK] }
    );
    let result = [
      new Token({
        type: T.NEW_LINE,
        value: `\n\n\n`,
        end: 3,
        paddingRight: "  ",
      }),
      new Token({
        type: T.WHITE_SPACE,
        value: `  `,
        start: 3,
        end: 5,
        line: 3,
      }),
      new Token({
        type: T.ASTERISK,
        value: `**`,
        start: 5,
        end: 7,
        line: 3,
        col: 2,
        indent: 2,
      }),
    ];
    result.value = str;

    assert(tokens.matches(result));
    result.value = str;
  });
  it("allows regex to override of ignored tokens", () => {
    let tokens;
    tokens = useParser("ab", ({ taste }) => taste(/ab/, { ignore: [/^a/] }), {
      allowIgnoreOverride: true,
    });
    assert(tokens[0].value === "ab");

    tokens = useParser("ab", ({ taste }) => taste({ ignore: [/^a/] }), {
      allowIgnoreOverride: true,
    });
    assert(tokens[0].value === "b");

    tokens = useParser(
      "\n\n\n  ",
      ({ taste }) => taste(/^\n  /, { ignore: [/^\n/] }),
      {
        allowIgnoreOverride: true,
      }
    );
    assert(tokens[0].value === "\n  ");
  });
  it("allows regexes returned from function", () => {
    let tokens;
    tokens = useParser("abc", ({ taste }) => taste(() => /^a/));
    assert(tokens[0].value === "a");
  });
});

// LEGACY STYLE CODE

// -------------------------- #useIndent --------------------------
let indent = "  ";
const useIndent = (level) => indent.repeat(level);

// -------------------------- #useStyleShorthand --------------------------
const StyleAttrAST = (ast = {}) => ({
  attr: "",
  attrCamelCase: "",
  value: "",
  ...ast,
  toCSS: function (indent = 0) {
    return `${useIndent(indent)}${this.attr}: ${this.value};`;
  },
  isStyleAttrAST: true,
});

const useStyleShorthand = (shorthand) => {
  const abbreviations = {
    w: "width",
    minw: "min-width",
    maxw: "max-width",
    h: "height",
    minh: "min-height",
    maxh: "max-height",
    m: "margin",
    ml: "margin-left",
    mt: "margin-top",
    mr: "margin-right",
    mb: "margin-bottom",
    p: "padding",
    pl: "padding-left",
    pt: "padding-top",
    pr: "padding-right",
    pb: "padding-bottom",
    d: "display",
    b: "border",
    bc: "border-color",
    bw: "border-width",
    bs: "border-style",
    bl: "border-left",
    blc: "border-left-color",
    blw: "border-left-width",
    bls: "border-left-style",
    bt: "border-top",
    btc: "border-top-color",
    btw: "border-top-width",
    bts: "border-top-style",
    br: "border-right",
    brc: "border-right-color",
    brw: "border-right-width",
    brs: "border-right-style",
    bb: "border-bottom",
    bbc: "border-bottom-color",
    bbw: "border-bottom-width",
    bbs: "border-bottom-style",
    r: "border-radius",
    rtl: "border-top-left-radius",
    rtr: "border-top-right-radius",
    rbr: "border-bottom-right-radius",
    rbl: "border-bottom-left-radius",
    over: "overflow",
    overx: "overflow-x",
    overy: "overflow-y",
    o: "opacity",
    ol: "outline",
    sh: "box-shadow",
    c: "cursor",
    ct: "content",
    fc: "color",
    fs: "font-size",
    ff: "font-family",
    fw: "font-weight",
    fd: "font-direction",
    fsp: "font-spacing",
    fst: "font-style",
    td: "text-decoration",
    ta: "text-align",
    tdc: "text-decoration-color",
    left: "left",
    top: "top",
    right: "right",
    bottom: "bottom",
    a: "align-items",
    ac: "align-content",
    j: "justify-content",
    as: "align-self",
    fl: "flex",
    flg: "flex-grow",
    fls: "flex-shrink",
    z: "z-index",
    bg: "background",
    t: "transition",
    tdl: "transition-delay",
    tdr: "transition-duration",
    tp: "transition-property",
    ttf: "transition-timing-function",
    sel: "user-select",
    tf: "transform",
    tfo: "transform-origin",
    an: "animation",
    andel: "animation-delay",
    andir: "animation-direction",
    andur: "animation-duration",
    anfm: "animation-fill-mode",
    anic: "animation-iteration-count",
    ann: "animation-name",
    anps: "animation-play-state",
    antf: "animation-timing-function",
    v: "visibility",
    ws: "white-space",
    wb: "word-break",
    ww: "word-wrap",
    ow: "overflow-wrap",
    hy: "hyphens",
    lh: "line-height",
    cc: "caret-color",
    pe: "pointer-events",
    ts: "text-shadow",
  };
  const shorthands = {
    flex: ["display", "flex"],
    block: ["display", "block"],
    none: ["display", "none"],
    inline: ["display", "inline"],
    inlineb: ["display", "inline-block"],
    absolute: ["position", "absolute"],
    static: ["position", "static"],
    relative: ["position", "relative"],
    sticky: ["position", "sticky"],
    fixed: ["position", "fixed"],
    wrap: ["flex-wrap", "wrap"],
    wrapr: ["flex-wrap", "wrap-reverse"],
    row: ["flex-direction", "row"],
    rowr: ["flex-direction", "row-reverse"],
    col: ["flex-direction", "column"],
    colr: ["flex-direction", "column-reverse"],
    bbox: ["box-sizing", "border-box"],
    italic: ["font-style", "italic"],
    bold: ["font-style", "bold"],
    oblique: ["font-style", "oblique"],
    visible: ["visibility", "visible"],
    hidden: ["visibility", "hidden"],
    collapse: ["visibility", "collapse"],
    underline: ["text-decoration", "underline"],
    overline: ["text-decoration", "overline"],
    "line-through": ["text-decoration", "line-through"],
    blink: ["text-decoration", "blink"],
  };
  let result = StyleAttrAST({
    attr: shorthand,
    attrCamelCase: "",
    value: "",
  });
  if (abbreviations[shorthand]) result.attr = abbreviations[shorthand];
  else if (shorthands[shorthand])
    result = StyleAttrAST({
      ...result,
      attr: shorthands[shorthand][0],
      value: shorthands[shorthand][1],
    });

  result.attrCamelCase = result.attr.split("-").reduce((acc, section, i) => {
    if (i === 0) return acc + section;
    else return acc + section.capitalize();
  }, ``);

  return result;
};
useTests("useStyleShorthand", () => {
  it("returns correct object structure", () => {
    assert(
      useStyleShorthand("r").matches(
        StyleAttrAST({
          attr: "border-radius",
          attrCamelCase: "borderRadius",
          value: "",
        })
      )
    );
    assert(
      useStyleShorthand("flex").matches(
        StyleAttrAST({
          attr: "display",
          attrCamelCase: "display",
          value: "flex",
        })
      )
    );
    assert(
      useStyleShorthand("invalid-attribute").matches(
        StyleAttrAST({
          attr: "invalid-attribute",
          attrCamelCase: "invalidAttribute",
          value: "",
        })
      )
    );
  });
});

// -------------------------- #useStyle --------------------------
/*

you can specify either pseudoclass or event
for event you can specify a duration after the event for the styles to apply (or indefinitely) or specify an end event, or a combination of the two

// this style would apply onclick indefinitely
|onclick| h:100px 

// this style would apply onclick for 1 second
|onclick 1s| w:100px 

// this style would apply onclick or onmouseover for 1 second or until onmouseout
|onclick onmouseover 1s onmouseout| w:100px 

|onclick onmouseover : onmouseout|


*/
const PSEUDO_CLASSES = [
  ":active",
  ":any-link",
  ":blank",
  ":checked",
  ":current",
  ":default",
  ":defined",
  ":dir",
  ":disabled",
  ":empty",
  ":enabled",
  ":first",
  ":first-child",
  ":first-of-type",
  ":fullscreen",
  ":future",
  ":focus",
  ":focus-visible",
  ":focus-within",
  ":has",
  ":host",
  ":host-context",
  ":hover",
  ":indeterminate",
  ":in-range",
  ":invalid",
  ":is",
  ":lang",
  ":last-child",
  ":last-of-type",
  ":left",
  ":link",
  ":local-link",
  ":not",
  ":nth-child",
  ":nth-col",
  ":nth-last-child",
  ":nth-last-col",
  ":nth-last-of-type",
  ":nth-of-type",
  ":only-child",
  ":only-of-type",
  ":optional",
  ":out-of-range",
  ":past",
  ":paused",
  ":picture-in-picture",
  ":placeholder-shown",
  ":playing",
  ":read-only",
  ":read-write",
  ":required",
  ":right",
  ":root",
  ":scope",
  ":target",
  ":target-within",
  ":user-invalid",
  ":valid",
  ":visited",
];
PSEUDO_CLASSES.forEach((p) => (PSEUDO_CLASSES[p] = true));
const PseudoAST = (ast = {}) => ({
  pseudo: "",
  styles: [],
  animations: [],
  ...ast,
  isCustom: () => PSEUDO_CLASSES[this.pseudo],
  toCSS: function (className, indent = 0) {
    const styles = this.styles
      .map((style) => style.toCSS(indent + 1))
      .join(`\n`);
    return `${useIndent(indent)}.${className}${this.pseudo} {
${styles}
${useIndent(indent)}}`;
  },
  isPseudoAST: true,
});
const MediaQueryAST = (ast = {}) => ({
  query: "",
  conditions: [],
  styles: [],
  animations: [],
  pseudos: [],
  ...ast,
  toCSS: function (className, indent = 0) {
    const conditionStr = this.conditions
      .map(({ attr, value }) => `(${attr}: ${value})`)
      .join(", ");

    const styles = this.styles
      .map((style) => style.toCSS(indent + 2))
      .join("\n");

    const pseudos = this.pseudos
      .map((pseudo) => pseudo.toCSS(className, indent + 1))
      .join("\n");

    return `${useIndent(indent)}@media ${conditionStr} {
${useIndent(indent + 1)}.${className} {
${styles}
${useIndent(indent + 1)}}${pseudos.length ? "\n\n" : ""}${pseudos}
${useIndent(indent)}}`;
  },
  isMediaQueryAST: true,
});
const KeyFrameAST = (ast = {}) => ({
  selector: `to`,
  styles: [],
  ...ast,
  toCSS: function (indent = 0) {
    const styles = this.styles
      .map((style) => style.toCSS(indent + 1))
      .join("\n");
    return `${useIndent(indent)}${this.selector} {
${styles}
${useIndent(indent)}}`;
  },
  isKeyFrameAST: true,
});
const AnimationAST = (ast = {}) => ({
  name: `_${useId()}`,
  keyFrames: [],
  modifiers: `1s linear forward`,
  ...ast,
  toCSS: function (indent = 0) {
    const keyframes = this.keyFrames
      .map((frame) => frame.toCSS(indent + 1))
      .join("\n");
    return `${useIndent(indent)}@keyframes ${this.name} {
${keyframes}
${useIndent(indent)}}`;
  },
  isAnimationAST: true,
});
const StyleAST = (ast = {}) => ({
  styles: [],
  animations: [],
  mediaQueries: [],
  pseudos: [],
  class: `_${useId()}`,
  ...ast,
  toCSS: function (indent = 0) {
    const styles = this.styles
      .map((style) => style.toCSS(indent + 1))
      .join("\n");

    let animations = this.animations.map((a) => a.toCSS(indent));
    if (animations.length > 0) animations = animations.join("\n\n") + "\n\n";

    const pseudos = this.pseudos
      .map((pseudo) => {
        let animations = pseudo.animations.map((a) => a.toCSS(indent));
        if (animations.length > 0)
          animations = animations.join("\n\n") + "\n\n";
        return `${animations}${pseudo.toCSS(this.class, indent)}`;
      })
      .join("\n\n");

    const mediaQueries = this.mediaQueries
      .map((query) => {
        let animations = [
          ...query.animations,
          ...query.pseudos.reduce((acc, p) => [...acc, ...p.animations], []),
        ].map((a) => a.toCSS(indent));
        if (animations.length > 0)
          animations = animations.join("\n\n") + "\n\n";
        return `${animations}${query.toCSS(this.class, indent)}`;
      })
      .join("\n\n");

    return `${animations}${useIndent(indent)}.${this.class} {
${styles}
${useIndent(indent)}}${pseudos.length ? "\n\n" : ""}${pseudos}${
      mediaQueries.length ? "\n\n" : ""
    }${mediaQueries}`;
  },
  isStyleAST: true,
});

const _styleASTs = {};
window.useStyle = (styleStr) => {
  if (_styleASTs[styleStr]) return _styleASTs[styleStr];

  const ast = StyleAST();

  useParser(styleStr, ({ taste, eat, getCursor }) => {
    let styleContext = ast.styles;
    let animationContext = ast.animations;
    let pseudoContext = ast.pseudos;
    const delimeters = [T.WHITE_SPACE, T.NEW_LINE];

    const mediaQuery = () => {
      const mediaQueryAST = MediaQueryAST();
      while (taste() && !taste(T.PIPE)) {
        styleContext = mediaQueryAST.conditions;
        if (taste(T.IDENTIFIER)) style();
        while (taste(delimeters)) eat(delimeters);
      }
      mediaQueryAST.query = `@media ${mediaQueryAST.conditions.reduce(
        (acc, c, i) =>
          acc +
          `(${c.attr}: ${c.value || `auto`})${
            i < mediaQueryAST.conditions.length - 1 ? ", " : ""
          }`,
        ""
      )}`;
      ast.mediaQueries.push(mediaQueryAST);

      pseudoContext = mediaQueryAST.pseudos;
      styleContext = mediaQueryAST.styles;
      animationContext = mediaQueryAST.animations;
    };
    const pseudo = () => {
      const pseudo = eat([], T.IDENTIFIER, { ignore: delimeters }).value;
      const pseudoAST = PseudoAST({ pseudo });

      pseudoContext.push(pseudoAST);
      styleContext = pseudoAST.styles;
      animationContext = pseudoAST.animations;
    };
    const conditional = () => {
      eat(T.PIPE);
      if (!taste(T.PIPE, { ignore: delimeters })) {
        if (taste(T.COLON, [], T.IDENTIFIER, { ignore: delimeters })) pseudo();
        else if (taste(T.IDENTIFIER, { ignore: delimeters })) mediaQuery();
        else eat([{ upTo: T.PIPE }]);
      }

      eat(T.PIPE, { ignore: delimeters });
    };
    const group = (showDelimeters = false) => {
      eat(T.LEFT_PAREN);
      let value = ``;
      while (taste() && !taste(T.RIGHT_PAREN)) {
        value += eat([{ upTo: [T.LEFT_PAREN, T.RIGHT_PAREN] }]).value;
        if (taste(T.LEFT_PAREN)) value += group(true);
      }
      eat(T.RIGHT_PAREN);
      if (showDelimeters) value = `(${value})`;
      return value;
    };
    const animation = () => {
      eat(T.AT);
      const name = eat([{ upTo: T.COLON }]).value || undefined;
      eat(T.COLON);
      const animationAST = useAnimation(group());
      if (name) animationAST.name = name;
      animationContext.push(animationAST);
    };
    const style = () => {
      const styleAST = useStyleShorthand(eat(T.IDENTIFIER).value);

      if (eat(T.COLON)) {
        if (taste(T.LEFT_PAREN)) {
          styleAST.value = group();
          styleAST.value = styleAST.value.replace(
            /--[\w-]+/g,
            (match) => `var(${match})`
          );
        } else if (taste(T.IDENTIFIER, T.LEFT_PAREN)) {
          styleAST.value += eat(T.IDENTIFIER).value;
          styleAST.value += group(true);
        } else if (taste(T.CSS_VAR)) {
          const cssVar = eat([{ upTo: [...delimeters, T.PIPE] }]).value;
          styleAST.value = `var(${cssVar})`;
        } else styleAST.value = eat([{ upTo: [...delimeters, T.PIPE] }]).value;
      }
      styleContext.push(styleAST);
    };

    while (taste()) {
      if (taste(T.IDENTIFIER)) style();
      else if (taste(T.PIPE)) conditional();
      else if (taste(T.AT)) animation();

      eat([{ upTo: delimeters }]);
      while (taste(delimeters)) eat(delimeters);
    }
  });

  const addAnimationStyles = () => {
    for (const { styles, animations } of [
      ast,
      ...ast.pseudos,
      ...ast.mediaQueries,
      ...ast.mediaQueries.reduce((acc, q) => [...acc, ...q.pseudos], []),
    ]) {
      for (const animationAST of animations) {
        let animationStyleAttrAST = styles.find((s) => s.attr === "animation");
        if (!animationStyleAttrAST) {
          animationStyleAttrAST = StyleAttrAST({
            attr: "animation",
            attrCamelCase: "animation",
          });
          styles.push(animationStyleAttrAST);
        }

        if (animationStyleAttrAST.value) animationStyleAttrAST.value += ", ";
        animationStyleAttrAST.value += `${animationAST.name} ${animationAST.modifiers}`;
      }
    }
  };

  addAnimationStyles();

  _styleASTs[styleStr] = ast;
  return ast;
};
useTests("useStyle", () => {
  it("parses styles", () => {
    const style = useStyle(
      `w:100px h:50% b:(1px solid black) r:1rem tf:scale(1px, 5%)`
    );
    assert(
      style.styles.matches([
        StyleAttrAST({
          attr: "width",
          attrCamelCase: "width",
          value: "100px",
        }),
        StyleAttrAST({
          attr: "height",
          attrCamelCase: "height",
          value: "50%",
        }),
        StyleAttrAST({
          attr: "border",
          attrCamelCase: "border",
          value: "1px solid black",
        }),
        StyleAttrAST({
          attr: "border-radius",
          attrCamelCase: "borderRadius",
          value: "1rem",
        }),
        StyleAttrAST({
          attr: "transform",
          attrCamelCase: "transform",
          value: "scale(1px, 5%)",
        }),
      ])
    );
  });
  it(
    "parses css variables",
    () => {
      const style = useStyle(`w:--bg-primary`);
      assert(
        style.styles.matches([
          StyleAttrAST({
            attr: "width",
            attrCamelCase: "width",
            value: "var(--bg-primary)",
          }),
        ])
      );
    },
    { only: true }
  );
  it("parses pseudo classes/elements", () => {
    const style = useStyle(
      `w:100px |:hover| h:50% r:1rem |::visited| tf:scale(1px, 5%)`
    );

    assert(
      style.styles.matches([
        StyleAttrAST({
          attr: "width",
          attrCamelCase: "width",
          value: "100px",
        }),
      ])
    );
    assert(
      style.pseudos.matches([
        PseudoAST({
          pseudo: ":hover",
          styles: [
            StyleAttrAST({
              attr: "height",
              attrCamelCase: "height",
              value: "50%",
            }),

            StyleAttrAST({
              attr: "border-radius",
              attrCamelCase: "borderRadius",
              value: "1rem",
            }),
            ,
          ],
        }),
        PseudoAST({
          pseudo: "::visited",
          styles: [
            StyleAttrAST({
              attr: "transform",
              attrCamelCase: "transform",
              value: "scale(1px, 5%)",
            }),
          ],
        }),
      ])
    );
  });
  it("parses media queries", () => {
    const style = useStyle(
      `w:100px |h:50%| r:1rem |minw:40px h:40px| tf:scale(1px, 5%)`
    );

    assert(
      style.styles.matches([
        StyleAttrAST({
          attr: "width",
          attrCamelCase: "width",
          value: "100px",
        }),
      ])
    );
    assert(
      style.mediaQueries.matches([
        MediaQueryAST({
          query: "@media (height: 50%)",
          conditions: [
            StyleAttrAST({
              attr: "height",
              attrCamelCase: "height",
              value: "50%",
            }),
          ],
          styles: [
            StyleAttrAST({
              attr: "border-radius",
              attrCamelCase: "borderRadius",
              value: "1rem",
            }),
            ,
          ],
        }),
        MediaQueryAST({
          query: "@media (min-width: 40px), (height: 40px)",
          conditions: [
            StyleAttrAST({
              attr: "min-width",
              attrCamelCase: "minWidth",
              value: "40px",
            }),
            StyleAttrAST({
              attr: "height",
              attrCamelCase: "height",
              value: "40px",
            }),
          ],
          styles: [
            StyleAttrAST({
              attr: "transform",
              attrCamelCase: "transform",
              value: "scale(1px, 5%)",
            }),
          ],
        }),
      ])
    );
  });
  it("parses pseudo classes/elements inside media queries", () => {
    const style = useStyle(`w:100px |h:50%| r:1rem |:hover| fc:red bg:orange`);

    assert(
      style.styles.matches([
        StyleAttrAST({
          attr: "width",
          attrCamelCase: "width",
          value: "100px",
        }),
      ])
    );
    assert(
      style.mediaQueries.matches([
        MediaQueryAST({
          query: "@media (height: 50%)",
          conditions: [
            StyleAttrAST({
              attr: "height",
              attrCamelCase: "height",
              value: "50%",
            }),
          ],
          styles: [
            StyleAttrAST({
              attr: "border-radius",
              attrCamelCase: "borderRadius",
              value: "1rem",
            }),
          ],
          pseudos: [
            PseudoAST({
              pseudo: ":hover",
              styles: [
                StyleAttrAST({
                  attr: "color",
                  attrCamelCase: "color",
                  value: "red",
                }),
                StyleAttrAST({
                  attr: "background",
                  attrCamelCase: "background",
                  value: "orange",
                }),
                ,
              ],
            }),
          ],
        }),
      ])
    );
  });
  it("parses animations", () => {
    const animationCode = `1s ease-in forwards |0%| h:50% r:1rem |100%| minw:40px`;

    const styleAST = useStyle(
      `@dog:(${animationCode}) |:hover| @:(${animationCode}) @:(${animationCode}) |w:100px| @:(${animationCode}) |:visited| @:(${animationCode})`
    );

    assert(styleAST.animations.length === 1);
    assert(styleAST.animations[0].name === "dog");

    assert(
      styleAST.styles[0].attr === `animation` &&
        styleAST.styles[0].value ===
          `${styleAST.animations[0].name} 1s ease-in forwards`
    );

    const pseudo = styleAST.pseudos[0];
    assert(pseudo.animations.length === 2);
    assert(
      pseudo.styles[0].attr === `animation` &&
        pseudo.styles[0].value ===
          `${pseudo.animations[0].name} 1s ease-in forwards, ${pseudo.animations[1].name} 1s ease-in forwards`
    );

    const query = styleAST.mediaQueries[0];
    assert(query.animations.length === 1);
    assert(
      query.styles[0].attr === `animation` &&
        query.styles[0].value ===
          `${query.animations[0].name} 1s ease-in forwards`
    );

    const pseudoInQuery = query.pseudos[0];
    assert(pseudoInQuery.animations.length === 1);
    assert(
      pseudoInQuery.styles[0].attr === `animation` &&
        pseudoInQuery.styles[0].value ===
          `${pseudoInQuery.animations[0].name} 1s ease-in forwards`
    );
  });
  it("gracefully handles errors", () => {
    let style;

    style = useStyle(`: 100px`);
    assert(style.styles.matches([]));

    style = useStyle(`|55 3`);
    assert(style.styles.matches([]));

    style = useStyle(`h: w:50px`);
    assert(
      style.styles.matches([
        StyleAttrAST({
          attr: "height",
          attrCamelCase: "height",
          value: "",
        }),
        StyleAttrAST({
          attr: "width",
          attrCamelCase: "width",
          value: "50px",
        }),
      ])
    );

    style = useStyle(`w: 100px`);
    assert(
      style.styles.matches([
        StyleAttrAST({
          attr: "width",
          attrCamelCase: "width",
          value: "",
        }),
      ])
    );
  });
  it("caches previously used styles", () => {
    const styleAST = useStyle(`w:100px`);
    assert(useStyle(`w:100px`) === styleAST);
  });
});

// -------------------------- #useAnimation --------------------------
window.useAnimation = (animationStr) => {
  const ast = AnimationAST();
  const delimeters = [T.WHITE_SPACE, T.NEW_LINE];
  useParser(animationStr, ({ taste, eat }) => {
    ast.modifiers = eat({ upTo: T.PIPE }, { ignore: T.NEW_LINE })
      .value.trim()
      .compress(" ");
    while (taste())
      if (taste(T.PIPE)) {
        eat(T.PIPE);
        const selectors = [];
        while (taste() && !taste(T.PIPE, { ignore: delimeters })) {
          while (taste(delimeters)) eat(delimeters);
          selectors.push(eat([{ upTo: [...delimeters, T.PIPE] }]).value);
        }

        eat(T.PIPE, { ignore: delimeters });
        const styles = useStyle(eat({ upTo: T.PIPE }).value).styles;

        for (const selector of selectors)
          ast.keyFrames.push(KeyFrameAST({ selector, styles }));
      } else break;
  });
  return ast;
};
useTests("useAnimation", () => {
  it("parses into correct AST structure", () => {
    const animation = useAnimation(
      `1s linear |0% 5%| w:50px h:10px |50%| w:100px tf:scale(20px)`
    );
    assert(
      animation.matches(
        AnimationAST({
          name: animation.name,
          modifiers: `1s linear`,
          keyFrames: [
            KeyFrameAST({
              selector: `0%`,
              styles: [
                StyleAttrAST({
                  attr: "width",
                  attrCamelCase: "width",
                  value: "50px",
                }),
                StyleAttrAST({
                  attr: "height",
                  attrCamelCase: "height",
                  value: "10px",
                }),
              ],
            }),
            KeyFrameAST({
              selector: `5%`,
              styles: [
                StyleAttrAST({
                  attr: "width",
                  attrCamelCase: "width",
                  value: "50px",
                }),
                StyleAttrAST({
                  attr: "height",
                  attrCamelCase: "height",
                  value: "10px",
                }),
              ],
            }),
            KeyFrameAST({
              selector: `50%`,
              styles: [
                StyleAttrAST({
                  attr: "width",
                  attrCamelCase: "width",
                  value: "100px",
                }),
                StyleAttrAST({
                  attr: "transform",
                  attrCamelCase: "transform",
                  value: "scale(20px)",
                }),
              ],
            }),
          ],
        })
      )
    );
  });
});
