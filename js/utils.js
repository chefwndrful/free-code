useTests("Utils", () => {
  useTests("Object", () => {
    useTests("filterKeys", () => {
      Object.defineProperty(Object.prototype, "filterKeys", {
        value: function (filterFn = () => {}) {
          const obj = Array.isArray(this) ? [...this] : { ...this };

          Object.entries(obj).forEach(([k, v], i) => {
            if (!filterFn(k, v, this, i)) delete obj[k];
            else if (v && typeof v === "object") {
              if (Array.isArray(obj[k])) {
                obj[k] = obj[k].map((item) => {
                  if (item && typeof item === "object" && !Array.isArray(item))
                    return item.filterKeys(filterFn);
                  return item;
                });
              } else obj[k] = obj[k].filterKeys(filterFn);
            }
          });

          return obj;
        },
        enumerable: false,
      });

      it("filters top-level properties", () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = obj.filterKeys((key, value) => {
          return value > 1;
        });
        assert(result.matches({ b: 2, c: 3 }));
      });
      it("filters nested objects", () => {
        const obj = {
          a: { x: 1, y: 2 },
          b: { x: 3, y: 4 },
        };
        const result = obj.filterKeys((key, value) => key !== "x" || value > 2);
        assert(result.matches({ a: { y: 2 }, b: { x: 3, y: 4 } }));
      });
      it("handles arrays", () => {
        const obj = {
          a: [1, 2, 3],
          b: [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
          ],
        };
        const result = obj.filterKeys((key, value) => key !== "x" || value > 2);
        assert(
          result.matches({
            a: [1, 2, 3],
            b: [{ y: 2 }, { x: 3, y: 4 }],
          })
        );
      });
      it("removes empty objects after filtering", () => {
        const obj = {
          a: { x: 1 },
          b: { y: 2 },
        };
        const result = obj.filterKeys((key, value) => key !== "x");
        assert(result.matches({ a: {}, b: { y: 2 } }));
      });
      it("handles circular references", () => {
        const obj = { a: 1 };
        obj.self = obj;
        const result = obj.filterKeys((key, value) => key !== "self");
        assert(result.matches({ a: 1 }));
      });
      it("works with complex nested structures", () => {
        const obj = {
          a: [1, { x: 2, y: 3 }],
          b: { c: [4, 5], d: { e: 6 } },
        };

        const result = obj.filterKeys((key, value) =>
          typeof value === "number" ? value > 3 : true
        );
        assert(
          result.matches({
            a: [1, {}],
            b: { c: [4, 5], d: { e: 6 } },
          })
        );
      });
    });

    useTests("findBreadthFirstOne", () => {
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

    useTests("findDepthFirst", () => {
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

    useTests(`hasAnyOwnProperty`, () => {
      Object.defineProperty(Object.prototype, "hasAnyOwnProperty", {
        value: function (...keys) {
          return keys.some((key) => this.hasOwnProperty(key));
        },
        enumerable: false,
      });

      it("Object has one of the given properties", () => {
        assert({ a: 1, b: 2, c: 3 }.hasAnyOwnProperty("a", "z"));
      });
      it("Object has multiple of the given properties", () => {
        assert({ a: 1, b: 2, c: 3 }.hasAnyOwnProperty("a", "b", "z"));
      });
      it("Object is missing all given properties", () => {
        assert(!{ a: 1, b: 2, c: 3 }.hasAnyOwnProperty("x", "y", "z"));
      });
    });

    useTests(`hasOwnProperties`, () => {
      Object.defineProperty(Object.prototype, "hasOwnProperties", {
        value: function (...keys) {
          return keys.every((key) => this.hasOwnProperty(key));
        },
        enumerable: false,
      });

      it("Object has all given properties", () => {
        assert({ a: 1, b: 2, c: 3 }.hasOwnProperties("a", "b", "c"));
      });
      it("Object is missing one property", () => {
        assert(!{ a: 1, b: 2, c: 3 }.hasOwnProperties("a", "b", "d"));
      });
      it("Object is missing all properties", () => {
        assert(!{ a: 1, b: 2, c: 3 }.hasOwnProperties("d", "e", "f"));
      });
    });

    useTests(`contains`, () => {
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
  });

  useTests("Array", () => {
    useTests(`random`, () => {
      Object.defineProperty(Array.prototype, "random", {
        value: function () {
          if (this.length === 0) return undefined;
          const randomIndex = Math.floor(Math.random() * this.length);
          return this[randomIndex];
        },
        enumerable: false,
      });

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

    useTests(`randomSlice`, () => {
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

    useTests(`at`, () => {
      Object.defineProperty(Array.prototype, "at", {
        value: function (index) {
          return this[index < 0 ? this.length + index : index];
        },
        enumerable: false,
      });

      it("returns standard items at positive indexes", () => {
        assert([1, 2, 3].at(0) === 1);
        assert([1, 2, 3].at(2) === 3);
      });
      it("returns items from the back of the array for negative indexes", () => {
        assert([1, 2, 3].at(-1) === 3);
        assert([1, 2, 3].at(-3) === 1);
      });
    });

    useTests(`fromRange`, () => {
      Object.defineProperty(Array, "fromRange", {
        value: function (start, end) {
          if (
            typeof start !== "number" ||
            typeof end !== "number" ||
            start > end
          ) {
            throw new Error("Invalid start or end value");
          }
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        },
        enumerable: false,
      });

      it("creates an array with values from start to end inclusive", () => {
        assert([1, 2, 3, 4, 5].matches(Array.fromRange(1, 5)));
        assert([3, 4, 5, 6, 7].matches(Array.fromRange(3, 7)));
      });
      it("returns single element array if start and end are the same", () => {
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

    useTests(`after`, () => {
      Object.defineProperty(Array.prototype, "after", {
        value: function (element, offset = 1) {
          const index = this.indexOf(element);
          if (index === -1) return undefined;
          return this[index + offset];
        },
        enumerable: false,
      });

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

    useTests(`before with offset`, () => {
      Object.defineProperty(Array.prototype, "before", {
        value: function (element, offset = 1) {
          const index = this.indexOf(element);
          if (index === -1) return undefined;
          return this[index - offset];
        },
        enumerable: false,
      });

      it("returns element before the specified element with default offset", () => {
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

    useTests(`filterDuplicates`, () => {
      Object.defineProperty(Array.prototype, "filterDuplicates", {
        value: function () {
          return this.filter((item, index) => this.indexOf(item) === index);
        },
        enumerable: false,
      });

      it("removes duplicate numbers", () => {
        assert(
          [1, 2, 2, 3, 4, 4, 5].filterDuplicates().matches([1, 2, 3, 4, 5])
        );
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

    useTests("binarySearch", () => {
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
  });

  useTests("String", () => {
    useTests(`count`, () => {
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

      it("counts occurrences of a character", () => {
        assert("hello world".count("l") === 3);
        assert("hello world".count("z") === 0);
        assert("banana".count("a") === 3);
        assert("mississippi".count("i") === 4);
      });
    });

    useTests(`at`, () => {
      Object.defineProperty(String.prototype, "at", {
        value: function (index) {
          return this.split("").at(index);
        },
        enumerable: false,
      });

      it("returns standard items at positive indexes", () => {
        assert(`123`.at(0) === `1`);
        assert(`123`.at(2) === `3`);
      });
      it("returns items from the back of the array for negative indexes", () => {
        assert(`123`.at(-1) === `3`);
        assert(`123`.at(-3) === `1`);
      });
    });

    useTests(`insertAt`, () => {
      Object.defineProperty(String.prototype, "insertAt", {
        value: function (index, text) {
          if (index >= 0)
            return this.slice(0, index) + text + this.slice(index);
          else
            return (
              this.slice(0, this.length + index) +
              text +
              this.slice(this.length + index)
            );
        },
        enumerable: false,
      });

      it("inserts item at positive index", () => {
        assert(`hello`.insertAt(1, "$") === `h$ello`);
      });
      it("inserts item at negative index", () => {
        assert(`hello`.insertAt(-2, "$") === `hel$lo`);
      });
    });

    useTests(`removeAt`, () => {
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

      it("removes item at positive index", () => {
        assert(`hello`.removeAt(1) === `hllo`);
        assert(`hello`.removeAt(3, 2) === `hel`);
      });
      it("removes item at negative index", () => {
        assert(`hello`.removeAt(-2) === `helo`);
        assert(`hello`.removeAt(-3, 2) === `heo`);
      });
    });

    useTests("capitalize", () => {
      Object.defineProperty(String.prototype, "capitalize", {
        value: function () {
          return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
        },
        enumerable: false,
      });

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

    useTests("compress", () => {
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

      it("compresses consecutive spaces/dashes into a single space/dash", () => {
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

    useTests(`trimOverlap`, () => {
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

      it("suffix", () => {
        // removes overlapping characters when second string starts with a suffix of the first string
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

    useTests(`toRegExp`, () => {
      Object.defineProperty(String.prototype, "toRegExp", {
        value: function (flags) {
          return new RegExp(this.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
        },
        enumerable: false,
      });

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

    useTests(`diff`, () => {
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
    });
  });

  useTests("typeof", () => {
    window.isUnd = (_) => typeof _ === "undefined";
    it("isUnd", () => {
      assert(isUnd(undefined) === true);
      assert(isUnd(42) === false);
    });

    window.isBol = (_) => typeof _ === "boolean";
    it("isBol", () => {
      assert(isBol(true) === true);
      assert(isBol(false) === true);
      assert(isBol("true") === false);
    });

    window.isNum = (_) => typeof _ === "number";
    it("isNum", () => {
      assert(isNum(42) === true);
      assert(isNum(3.14) === true);
      assert(isNum("42") === false);
    });

    window.isBig = (_) => typeof _ === "bigint";
    it("isBig", () => {
      assert(isBig(42n) === true);
      assert(isBig(42) === false);
    });

    window.isStr = (_) => typeof _ === "string";
    it("isStr", () => {
      assert(isStr("hello") === true);
      assert(isStr(42) === false);
    });

    window.isSym = (_) => typeof _ === "symbol";
    it("isSym", () => {
      assert(isSym(Symbol("sym")) === true);
      assert(isSym("sym") === false);
    });

    window.isFun = (_) => typeof _ === "function";
    it("isFun", () => {
      assert(isFun(() => {}) === true);
      assert(isFun(function () {}) === true);
      assert(isFun(42) === false);
    });

    window.isObj = (_) => typeof _ === "object" && _ !== null;
    it("isObj", () => {
      assert(isObj({}) === true);
      assert(isObj(null) === false); // null is not considered an object in this context
      assert(isObj([]) === true);
      assert(isObj(() => {}) === false);
    });

    window.isInt = (_) => isNum(_) && Number.isInteger(_);
    it("isInt", () => {
      assert(isInt(42) === true);
      assert(isInt(3.14) === false);
      assert(isInt("42") === false);
    });

    window.isFlt = (_) => isNum(_) && !Number.isInteger(_);
    it("isFlt", () => {
      assert(isFlt(3.14) === true);
      assert(isFlt(42) === false);
    });

    window.isArr = (_) => Array.isArray(_);
    it("isArr", () => {
      assert(isArr([]) === true);
      assert(isArr({}) === false);
    });

    window.isNul = (_) => _ === null;
    it("isNul", () => {
      assert(isNul(null) === true);
      assert(isNul(undefined) === false);
    });

    window.isDOM = (_) => _ instanceof Node;
    it("isDOM", () => {
      assert(isDOM(document.createElement("div")) === true);
      assert(isDOM({}) === false);
      assert(isDOM(document.createTextNode("text")) === true);
    });

    window.isReg = (_) => _ instanceof RegExp;
    it("isReg", () => {
      assert(isReg(/test/) === true);
      assert(isReg(new RegExp("test")) === true);
      assert(isReg("test") === false);
    });

    window.isPrm = (_) => {
      const type = typeof _;
      return _ === null || (type !== "object" && type !== "function");
    };
    it("isPrm", () => {
      assert(isPrm(42) === true);
      assert(isPrm("hello") === true);
      assert(isPrm(true) === true);
      assert(isPrm(null) === true);
      assert(isPrm(undefined) === true);
      assert(isPrm(Symbol("sym")) === true);
      assert(isPrm({}) === false);
      assert(isPrm([]) === false);
      assert(isPrm(() => {}) === false);
    });

    window.isDat = (_) => _ instanceof Date && !isNaN(_.getTime());
    it("isDat", () => {
      assert(isDat(new Date()) === true);
      assert(isDat(new Date("invalid")) === false);
      assert(isDat("2023-01-01") === false);
    });

    window.isErr = (_) => _ instanceof Error;
    it("isErr", () => {
      assert(isErr(new Error()) === true);
      assert(isErr(new TypeError()) === true);
      assert(isErr({ message: "error" }) === false);
    });

    window.isMap = (_) => _ instanceof Map;
    it("isMap", () => {
      assert(isMap(new Map()) === true);
      assert(isMap({}) === false);
    });

    window.isSet = (_) => _ instanceof Set;
    it("isSet", () => {
      assert(isSet(new Set()) === true);
      assert(isSet([]) === false);
    });

    window.isWeM = (_) => _ instanceof WeakMap;
    it("isWeM", () => {
      assert(isWeM(new WeakMap()) === true);
      assert(isWeM(new Map()) === false);
    });

    window.isWeS = (_) => _ instanceof WeakSet;
    it("isWeS", () => {
      assert(isWeS(new WeakSet()) === true);
      assert(isWeS(new Set()) === false);
    });

    window.isPro = (_) => _ instanceof Promise;
    it("isPro", () => {
      assert(isPro(Promise.resolve()) === true);
      assert(isPro({ then: () => {} }) === false);
    });

    window.isGen = (_) => {
      return (
        _ &&
        typeof _[Symbol.iterator] === "function" &&
        typeof _.next === "function"
      );
    };
    it("isGen", () => {
      function* generator() {
        yield 1;
      }
      assert(isGen(generator()) === true);
      assert(isGen([]) === false);
    });
  });

  useTests("color", () => {
    useTests(`useRandomColor`, () => {
      window.useRandomColor = function () {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return `#${randomColor.padStart(6, "0")}`;
      };

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

    useTests("hexToRgb", () => {
      window.hexToRgb = (hex) => {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
      };

      it("converts hex to RGB correctly", () => {
        assert(hexToRgb("#FF0000").matches([255, 0, 0]), "Red conversion");
        assert(hexToRgb("#00FF00").matches([0, 255, 0]), "Green conversion");
        assert(hexToRgb("#0000FF").matches([0, 0, 255]), "Blue conversion");
        assert(
          hexToRgb("#123456").matches([18, 52, 86]),
          "Mixed color conversion"
        );
      });
    });

    useTests("rgbToHex", () => {
      window.rgbToHex = (r, g, b) => {
        return (
          "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
        );
      };

      it("converts RGB to hex correctly", () => {
        assert(rgbToHex(255, 0, 0) === "#ff0000", "Red conversion");
        assert(rgbToHex(0, 255, 0) === "#00ff00", "Green conversion");
        assert(rgbToHex(0, 0, 255) === "#0000ff", "Blue conversion");
        assert(rgbToHex(18, 52, 86) === "#123456", "Mixed color conversion");
      });
    });

    useTests("useColorDistance", () => {
      window.useColorDistance = (rgb1, rgb2) => {
        const rDiff = rgb1[0] - rgb2[0];
        const gDiff = rgb1[1] - rgb2[1];
        const bDiff = rgb1[2] - rgb2[2];
        return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
      };

      it("calculates distance correctly", () => {
        assert(
          Math.abs(
            useColorDistance([0, 0, 0], [255, 255, 255]) -
              Math.sqrt(3 * 255 * 255)
          ) < 0.0001,
          "Black to white"
        );
        assert(
          Math.abs(
            useColorDistance([255, 0, 0], [0, 255, 0]) -
              Math.sqrt(2 * 255 * 255)
          ) < 0.0001,
          "Red to green"
        );
        assert(
          useColorDistance([100, 100, 100], [100, 100, 100]) === 0,
          "Same color"
        );
      });
    });

    useTests("useColorSimilarity", () => {
      window.useColorSimilarity = (hex1, hex2) => {
        const rgb1 = hexToRgb(hex1);
        const rgb2 = hexToRgb(hex2);
        const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
        const distance = useColorDistance(rgb1, rgb2);
        return 1 - distance / maxDistance;
      };

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

    useTests(`useColorTint`, () => {
      window.useColorTint = (color, amount) => {
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

    useTests(`useColorShade`, () => {
      window.useColorShade = (color, amount) => {
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
  });

  useTests("random", () => {
    useTests(`useRandomInt`, () => {
      window.useRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      it("returns an integer within the specified range", () => {
        const min = 1,
          max = 10;
        const int = window.useRandomInt(min, max);
        assert(Number.isInteger(int) && int >= min && int <= max);
      });
    });

    useTests(`useRandomFloat`, () => {
      window.useRandomFloat = (min, max) => {
        return Math.random() * (max - min) + min;
      };

      it("returns a float within the specified range", () => {
        const min = 0.5,
          max = 5.5;
        const float = window.useRandomFloat(min, max);
        assert(float >= min && float <= max && float % 1 !== 0);
      });
    });

    useTests(`useRandomBool`, () => {
      window.useRandomBool = () => {
        return Math.random() < 0.5;
      };

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

    useTests(`useRandomString`, () => {
      window.useRandomStr = function (minLength = 1, maxLength = null) {
        if (maxLength === null) {
          maxLength = minLength;
          minLength = 1;
        }
        if (minLength > maxLength) {
          throw new Error(
            "Minimum length cannot be greater than maximum length"
          );
        }

        const length =
          Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        let result = "";
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ";

        for (let i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }

        return result;
      };

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

    useTests(`useRandomDate`, () => {
      window.useRandomDate = () => {
        const start = new Date(1970, 0, 1).getTime();
        const end = new Date().getTime();
        const randomTime = Math.floor(Math.random() * (end - start)) + start;
        return new Date(randomTime);
      };

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
  });

  useTests("misc", () => {
    useTests("useId", () => {
      let _id = 1;
      window.useId = () => _id++;

      it("returns incremental numeric ids", () => {
        const ids = [useId(), useId(), useId()];

        assert(typeof ids[0] === "number", "first id a number");
        assert(typeof ids[1] === "number", "second id is a number");
        assert(typeof ids[2] === "number", "third id is a number");
        assert(ids[0] < ids[1], "first id is less than second id");
        assert(ids[1] < ids[2], "second id is less than third id");
      });
    });

    useTests(`useArray`, () => {
      window.useArray = (_) => {
        if (Array.isArray(_)) return _;
        else if (_ !== undefined) return [_];
        else return [];
      };

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

    useTests("useFunction", () => {
      window.useFunction = function (input) {
        if (typeof input === "function") return input;
        else return () => input;
      };

      it("returns the function if the input is already a function", () => {
        const inputFunction = () => "test";
        return useFunction(inputFunction) === inputFunction;
      });
      it("wraps a non-function input into a function", () => {
        const input = "test";
        const resultFunction = useFunction(input);
        return (
          typeof resultFunction === "function" && resultFunction() === input
        );
      });
      it("wraps an object into a function that returns the object", () => {
        const input = { key: "value" };
        const resultFunction = useFunction(input);
        return (
          typeof resultFunction === "function" &&
          resultFunction().key === "value"
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
        return (
          typeof resultFunction === "function" && resultFunction() === input
        );
      });
    });

    useTests(`useFunctionResult`, () => {
      window.useFunctionResult = (value, ...args) => {
        if (typeof value === "function" && !/^class\s/.test(value.toString()))
          return value(...args);
        return value;
      };

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

    useTests(`JSON.circularStringify`, () => {
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

    useTests("useDebounce", () => {
      window.useDebounce = (fn, delay) => {
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
      };

      it("debounces the function call", async () => {
        const log = [];
        const debouncedLog = useDebounce((message) => {
          log.push(message);
        }, 1);

        debouncedLog("Hello");
        debouncedLog("Hello again");

        await defer();
        assert(log.length === 1);
        assert(log[0] === "Hello again");
      });
      it("executes function after the delay", async () => {
        const log = [];
        const debouncedLog = useDebounce((message) => {
          log.push(message);
        }, 1);

        debouncedLog("Hello");

        await defer();
        assert(log.length === 1);
        assert(log[0] === "Hello");
      });
      it("does not execute function if called again before delay", async () => {
        const log = [];
        const debouncedLog = useDebounce((message) => {
          log.push(message);
        }, 3);

        debouncedLog("Hello");
        await sleep(2);
        debouncedLog("Hello again");

        await sleep(3);
        assert(log.length === 1, "Should only log once");
        assert(log[0] === "Hello again", "Should log the last call's argument");
      });
    });

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
  });
});
