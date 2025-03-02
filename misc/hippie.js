window.styleAbbreviations = {
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
  fc: "color",
  fs: "font-size",
  ff: "font-family",
  fw: "font-weight",
  fd: "font-direction",
  fsp: "font-spacing",
  fst: "font-style",
  td: "text-decoration",
  tdc: "text-decoration-color",
  left: "left",
  top: "top",
  right: "right",
  bottom: "bottom",
  a: "align-items",
  ac: "align-content",
  j: "justify-content",
  as: "align-self",
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
};
window.styleShorthands = {
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
window.globalStyleElement = document.createElement("style");
document.head.append(globalStyleElement);
window.useId = () => id++;

let activeEffect;
const pendingEffects = new Set();
let isUpdating = false;
let id = 1;
const styles = {};
const animations = {};

window.useState = (obj) => {
  const effects = {};
  const runPendingEffects = () => {
    if (isUpdating) return;
    isUpdating = true;
    pendingEffects.forEach((effect) => {
      try {
        effect();
      } catch (err) {
        console.error("An error occurred in an effect:", err);
      }
    });
    pendingEffects.clear();
    isUpdating = false;
  };

  const proxy = new Proxy(obj, {
    get: (target, key) => {
      if (key === "__target") return target;
      if (activeEffect && target.hasOwnProperty(key)) {
        if (!effects[key]) effects[key] = new Set();
        if (effects[key] instanceof Set) effects[key].add(activeEffect);

        const activeEffectCache = activeEffect;
        activeEffect.unsubCallbacks.add(() => {
          effects[key].delete(activeEffectCache);
        });
      }

      if (
        target[key] &&
        typeof target[key] === "object" &&
        !target[key].__target
      )
        target[key] = useState(target[key]);

      return target[key];
    },
    set: (target, key, value) => {
      if (target[key] === value && key !== "length") return true;
      if (typeof value === "object" && value.__target) value = { ...value };
      if (typeof value === "object" && typeof target[key] === "object") {
        Object.entries(value)
          .map(([k, v]) => [
            k,
            typeof v === "object" && v.__target ? { ...v } : v,
          ])
          .forEach(([k, v]) => (target[key][k] = v));
        for (const _ in target[key]) if (!(_ in value)) delete target[key][_];
      } else target[key] = value;

      if (effects[key]) {
        effects[key].forEach((e) => {
          pendingEffects.add(e);
        });
        queueMicrotask(runPendingEffects);
      }
      return true;
    },
    deleteProperty: (target, key) => {
      delete target[key];
      if (effects[key]) {
        effects[key].forEach((e) => pendingEffects.add(e));
        queueMicrotask(runPendingEffects);
      }
      return true;
    },
  });
  return proxy;
};
window.useEffect = (eff, ...deps) => {
  let cancel = () => {};
  let cleanup = () => {};
  const wrapper = () => {
    activeEffect = wrapper;
    cancel();
    activeEffect.prevUnsubCallbacks || [];
    activeEffect.unsubCallbacks = new Set();
    cancel = () => {};
    cleanup = () => {};
    try {
      deps.forEach((d) => d());
      const result = eff();

      if (result instanceof Promise) {
        cancel = result.cancel || (() => {});
        cleanup = result.cleanup || (() => {});
        result.catch((err) =>
          console.error("An error occurred in an async effect:", err)
        );
        result.finally(() => (activeEffect = null));
      } else if (typeof result === "function") cleanup = result;
    } catch (err) {
      console.error("An error occurred in an effect:", err);
    }
    activeEffect = null;
  };

  wrapper();

  return (d) => {
    cancel();
    cleanup();
    wrapper.unsubCallbacks.forEach((u) => u());
  };
};
window.useRoot = (fn) => {
  const _ = activeEffect;
  activeEffect = null;
  const result = fn();
  activeEffect = _;
  return result;
};

/*
Run effects in a document fragment so they can get commited to the dom all at once
*/
window.Switch = ({ $ }, children) => {
  return useElement(undefined, {}, [
    () => children,
    ([_case, getElement]) => useElementIf(() => $() === _case, getElement),
  ]);
};

window.useElementIf = (condition, type, props, ...children) => {
  props = props || {};
  delete props.if;

  const onunmount = () => cleanup();
  const placeholder = document.createTextNode("");
  placeholder.addEventListener("unmount", onunmount);
  let active = placeholder;
  const cleanup = useEffect(() => {
    active.removeEventListener("unmount", onunmount);
    if (condition()) {
      if (active === placeholder) {
        active = useRoot(() => useElement(type, props, ...children));
        placeholder.replaceWith(active);
      }
    } else active.replaceWith(placeholder);

    active.addEventListener("unmount", onunmount);
  });

  return active;
};

/*
// dynamically generate a function
const sum = new Function('a', 'b', 'return a + b');

console.log(sum(1, 2)); // 3
*/
window.useElement = (type, props, ...children) => {
  props = props || {};

  props;
  if (props.if) {
    {
      const condition = props.if;
      delete props.if;
      return window.useElementIf(condition, type, props, ...children);
    }
  }
  if (type === "switch") return Switch(props, children);
  if (typeof type === "function") {
    return type(props, children) || "";
  }
  let element =
    type === undefined
      ? document.createDocumentFragment()
      : document.createElement(type);
  if (element instanceof Element) element.setAttribute("name", element.tagName);
  if (element instanceof HTMLUnknownElement || (type && type.includes("_"))) {
    element = document.createElement(
      props.tag || type.slice(-1) === "_" ? "span" : "div"
    );
    if (type !== undefined)
      element.setAttribute("name", type.replace(/_$/g, ""));
    type = element.tagName;
  }

  element._ = {};
  element.unmountCallbacks = [];

  const pseudoRegex = /([_-]+[a-z]*)+/;
  for (const key in props)
    if (key === "_") {
      // store state on element
      element._ = props[key];
    } else if (key.slice(0, 2) === "s-") {
      const attr = key.slice(2);
      const cleanup = useEffect(() => {
        const cssAttr = styleAbbreviations[attr];
        if (!cssAttr) return;
        const value =
          (typeof props[key] === "function"
            ? props[key](element)
            : props[key]) || "";

        element.style[cssAttr] = value;
      });
      element.addEventListener("unmount", cleanup);
    } else if (key === "s" || key.match(/^s([\d]+([\w%]+)?)?(([_-]+\w*)+)?$/)) {
      let className = "";
      const pseudoClass =
        key.match(pseudoRegex) &&
        (key.match(pseudoRegex)[0].replaceAll("_", " ").replaceAll("-", ":") ||
          "hover");
      const minWidth =
        key.match(/\d+[a-zA-Z]*/) && key.match(/\d+[a-zA-Z]*/)[0];
      const cleanup = useEffect(() => {
        const style =
          (typeof props[key] === "function"
            ? props[key](element)
            : props[key]) || "";

        const newClassName = useRoot(() =>
          useClass(style, pseudoClass, minWidth)
        );

        if (className) {
          if (className !== newClassName) {
            element.classList.remove(className);
            element.classList.add(newClassName);
          }
        } else element.classList.add(newClassName);

        className = newClassName;
      });
      element.addEventListener("unmount", cleanup);
    } else if (key === "a" || key.match(/^a([\d]+([\w%]+)?)?(([_-]+\w*)+)?$/)) {
      let className = "";

      let pseudoClass =
        key.match(pseudoRegex) &&
        (key.match(pseudoRegex)[0].replaceAll("_", " ").replaceAll("-", ":") ||
          "hover");

      let event = "";
      if (
        pseudoClass &&
        pseudoClass !== ":hover" &&
        pseudoClass.slice(0, 2) !== "::"
      ) {
        event = pseudoClass.slice(1);
        pseudoClass = "";
      }
      const minWidth =
        key.match(/\d+[a-zA-Z]*/) && key.match(/\d+[a-zA-Z]*/)[0];

      const eventCallback = () => {};
      const cleanup = useEffect(() => {
        const [animation, properties] = (typeof props[key] === "function"
          ? props[key](element)
          : props[key]) || [{}, ""];

        const newClassName = useRoot(() =>
          useAnimationClass(animation, properties, pseudoClass, minWidth)
        );

        if (className) {
          element.classList.remove(className);
          if (!event)
            requestIdleCallback(() => element.classList.add(className));
        }
        className = newClassName;

        element.removeEventListener(event, eventCallback);
        if (event) {
          const callback = () => {
            element.classList.remove(className);
            requestIdleCallback(() => element.classList.add(className));
          };
          element.addEventListener(event, callback);
          element.addEventListener("unmount", () =>
            element.removeEventListener(event, callback)
          );
        } else element.classList.add(className);
      });
      element.addEventListener("unmount", cleanup);
    } else if (key.slice(0, 2) === "b-") {
      const field = key.slice(2).replaceAll("_", " ");
      const state = props[key];
      element.addEventListener(
        "textchange",
        () => (state[field] = element.innerText)
      );
      element.addEventListener("input", () => (state[field] = element.value));
      element.addEventListener("unmount", () => (state[field] = ""));

      const cleanup = useEffect(() => {
        if (element.innerText !== state[field])
          element.innerText = state[field] === undefined ? "" : state[field];
        if (element.value !== state[field])
          element.value = state[field] === undefined ? "" : state[field];
      });
      element.addEventListener("unmount", cleanup);
    } else if (key === "effects") {
      element.addEventListener("mount", () => {
        props[key].forEach((effect) => {
          element.addEventListener(
            "unmount",
            useEffect(() => effect(element))
          );
        });
      });
    } else if (typeof props[key] === "function" && key.slice(0, 2) !== "on") {
      const cleanup = useEffect(() => {
        try {
          const newValue = props[key](element);
          if (key in element) {
            if (element[key] !== newValue) element[key] = newValue;
          } else {
            if (element.getAttribute(key) !== newValue.toString())
              element.setAttribute(key, newValue.toString());
          }
        } catch (e) {}
      });
      element.addEventListener("unmount", cleanup);
    } else if (key.slice(0, 2) === "on") {
      if (key[key.length - 1] === "_") {
        const event = key.slice(2).slice(0, -1);
        document.addEventListener(event, (e) => props[key](e, element));
        element.addEventListener("unmount", () =>
          document.removeEventListener(event, props[key])
        );
      } else element.addEventListener(key.slice(2), props[key]);
    } else {
      if (key in element) element[key] = props[key];
      else element.setAttribute(key, props[key]);
    }

  if (element instanceof Element) element.id = useId();

  for (const child of children)
    if (typeof child === "function") {
      let activeChild;
      const cleanup = useEffect(() => {
        let newChild = child();
        if (!(newChild instanceof Node))
          newChild = document.createTextNode(
            [false, undefined, null].includes(newChild) ? "" : newChild
          );

        if (activeChild) activeChild.replaceWith(newChild);
        else element.append(newChild);

        activeChild = newChild;
      });
      element.addEventListener("unmount", cleanup);
    } else if (Array.isArray(child)) {
      const start = document.createTextNode("");
      start.isStart = true;
      const end = document.createTextNode("");
      end.isEnd = true;
      element.append(start, end);

      const [getList, getChildElement] = child;

      let list;
      const cleanup = useEffect(() => {
        list = list || getList();
        if (start.nextSibling === end)
          return start.after(
            ...list.map((_, i) => useRoot(() => getChildElement(list[i], i)))
          );

        const listElements = [];
        let listElement = start.nextElementSibling;

        while (listElement) {
          listElements.push(listElement);
          if (listElement.nextSibling === end) break;
          listElement = listElement.nextElementSibling;
        }

        for (let i = listElements.length; i < list.length; i++) {
          listElement.after(useRoot(() => getChildElement(list[i], i)));
          listElement = listElement.nextElementSibling;
        }
        for (let i = list.length; i < listElements.length; i++)
          listElements[i].remove();
      });

      document.addEventListener("unmount", cleanup);
    } else if (Array.isArray(child)) {
      if (!child.length) continue;
      if (child[0] instanceof Node) {
        element.append(...child);
        continue;
      }
      let [_list, getChild, opts] = child;
      opts = {
        cache: true,
        ...opts,
      };

      const start = document.createTextNode("");
      start.$isStart = true;
      const end = document.createTextNode("");
      end.$isEnd = true;
      element.append(start, end);

      /*
      DON'T MERGE THE ELEMENT
      MERGE THE STATE 
      and the element will update automatically
      */
      const cleanup = useEffect(() => {
        const list = typeof _list === "function" ? _list() : _list;
        let current = start;
        list.forEach((_, i) => {
          const childData = opts.cache
            ? useRoot(() => JSON.circularStringify(_))
            : "";
          const oldChild = current.nextSibling;
          const isLastChild =
            oldChild.nodeType === Node.TEXT_NODE && !oldChild.data;

          if (
            isLastChild ||
            !opts.cache ||
            (opts.cache && oldChild.$data !== childData)
          ) {
            let newChild = useRoot(() => getChild(_, i, element));
            if (!(newChild instanceof Node))
              newChild = document.createTextNode(newChild);
            if (!isLastChild && oldChild.matches(newChild)) {
              oldChild.$data = childData;
              oldChild.merge(newChild);
              newChild.dispatchEvent(new CustomEvent("unmount"));
            } else {
              current.after(newChild);
              newChild.$data = childData;
            }
          }
          current = current.nextSibling;
        });

        while (
          current.nextSibling.nodeType !== Node.TEXT_NODE ||
          current.nextSibling.data
        )
          current.nextSibling.remove();
      });
      element.addEventListener("unmount", cleanup);
    } else element.append(child);

  return element;
};
window.useRenderer = (element, parent) => {
  const observer = new MutationObserver((mutations) => {
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
          // m.target.dispatchEvent(
          //   new CustomEvent("textchange", {
          //     bubbles: true,
          //     detail: { action: "add" },
          //   })
          // );
        }

        if (m.removedNodes.length) {
          const isBlankTextNode =
            m.removedNodes[0].nodeType === Node.TEXT_NODE &&
            !m.removedNodes[0].data;
          // if (!isBlankTextNode) {
          Array.from(m.removedNodes).forEach((node) =>
            cascadeEvent(node, "unmount")
          );

          m.target.dispatchEvent(
            new CustomEvent("childremove", {
              bubbles: true,
              detail: { child: m.removedNodes[0] },
            })
          );
          // }

          // m.target.dispatchEvent(
          //   new CustomEvent("textchange", {
          //     bubbles: true,
          //     detail: { action: "remove" },
          //   })
          // );
        }
      } else if (m.type === "characterData") {
        if (m.target.parentElement) {
          m.target.parentElement.dispatchEvent(
            new CustomEvent("textchange", {
              bubbles: true,
              detail: { textNode: m.target, action: "change" },
            })
          );
        }
      }
    });
  });
  observer.observe(parent, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  parent.append(element);
};
window.$ = useElement;
window.useStyleShorthand = (style, indent = "  ") => {
  style = style.trim();
  if (!style) return style;

  const styleTokens = style.match(/[^:\s]+((:)[^:\s]+)?/g);

  return styleTokens.reduce((acc, token) => {
    let style = "";
    if (token.includes(":")) {
      let [abbreviation, value] = token.split(":");
      value = value
        .split("_")
        .map((v) => (v.slice(0, 2) === "--" ? `var(${v})` : v))
        .join(" ");
      const styleName = styleAbbreviations[abbreviation];
      if (styleName) style = `${indent}${styleName}: ${value};\n`;
    } else if (styleShorthands[token]) {
      const [styleName, value] = styleShorthands[token];
      style = `${indent}${styleName}: ${value};\n`;
    }
    return acc + style;
  }, "");
};
window.useClass = (style, pseudoClass = "", minWidth) => {
  const key = `${style} ${pseudoClass || ""} ${minWidth}`;
  if (styles[key]) return styles[key];
  const cssAttributes = useStyleShorthand(style, "  ");
  const className = `_${useId()}`;
  styles[key] = className;

  if (minWidth)
    STYLE.global += `\n\n@media only screen and (min-width:${minWidth}){\n  .${className}${
      pseudoClass || ""
    } {\n${cssAttributes}  }\n}`;
  else
    STYLE.global += `\n\n.${className}${
      pseudoClass || ""
    } {\n${cssAttributes}}`;

  return className;
};
window.useAnimationClass = (steps, properties, pseudoClass, minWidth) => {
  const key = JSON.stringify(steps);
  if (animations[key]) return animations[key];

  const animationName = `a${useId()}`;
  STYLE.global += `\n\n@keyframes ${animationName} {${Object.entries(
    steps
  ).reduce(
    (acc, [key, value]) =>
      acc +
      `\n  ${key.match(/^\d+$/) ? `${key}%` : key} {\n${useStyleShorthand(
        value,
        "    "
      )}  }`,
    ""
  )}\n}`;
  const className = useRoot(() =>
    useClass(
      `an:${animationName}_${properties.split(/\s+/).join("_")}`,
      pseudoClass,
      minWidth
    )
  );
  animations[key] = className;
  return className;
};
window.useCursor = (startNode, startOffset, endNode, endOffset) => {
  const selection = window.getSelection();
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode || startNode, endOffset || startOffset);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
};
window.useCursorAtOffset = (node, offset) => {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  let i = 0;

  while (current) {
    const textLength = current.nodeValue.length;
    if (i + textLength >= offset) return useCursor(current, offset - i);
    i += textLength;
    current = walker.nextNode();
  }
  return useCursor(
    node,
    node.nodeType === Node.TEXT_NODE ? node.length : node.children.length
  );
};
window.useTimer = (fn) => {
  const start = Date.now();
  fn();
  return Date.now() - start;
};

class Token {
  constructor(
    type,
    value,
    {
      color = "inherit",
      lang = "base",
      isDelimeter = false,
      beforeFormatters = [],
      afterFormatters = [],
    } = {}
  ) {
    this.type = type;
    this.value = typeof value === "object" ? value.value : value;
    this.color = color;
    this.lang = lang;
    this.isDelimeter = isDelimeter;
    this.isToken = true;
    this.beforeFormatters = beforeFormatters;
    this.afterFormatters = afterFormatters;
  }
}
window.Token = Token;
window.useLexer = (code, { lang, limit = Infinity } = {}) => {
  const OPEN_CURLY = /^\{/;
  const CLOSE_CURLY = /^\}/;
  const OPEN_PAREN = /^\(/;
  const CLOSE_PAREN = /^\)/;
  const OPEN_SQUARE = /^\[/;
  const CLOSE_SQUARE = /^\]/;
  const QUOTE = /^"/;
  const COMMA = /^,/;
  const APOSTROPHE = /^'/;
  const DOT = /^\.(?!\.)/;
  const QUESTION = /^\?/;
  const COLON = /^:/;
  const NEW_LINE = /^(\r\n|\r|\n)/;
  const WHITE_SPACE = /^[ \u00A0]+/;

  const ANYTHING = /^[\s\S]{1}/;
  const NOTHING = /(?!.|^)/;

  const NUMBER = /^\d+((\.\d)|\d)?\d*/;
  const ID = /^[a-zA-Z_$][a-zA-Z_$\d]*/;
  const ASSIGN_OP = /^((\+=)|(-=)|(\/=)|(\*=)|(%=)|(\^=)|(=(?!=)))/;
  const COMPARE_OP = /^((<=)|(>=)|(==)|(!=)|(<)|(>))/;
  const RANGE_OP = /^\.\.=?/;
  const UNARY_OP = /^[!\-\+](?![\/=])/;
  const ITERATE_OP = /^(in|keyin|while)\b/;
  const BRANCH_OP = /^(if|elif|else)\b/;
  const LOGICAL_OP = /^[&\|]/;
  const RETURN = /^return\b/;

  const ADD_OP = /^[\+-](?![\/=])/;
  const MULTIPLY_OP = /^[\*\/%](?![\/=\*])/;
  const EXPONENT_OP = /^\^(?![\/=])/;
  // const STRING = /^"(?:[^"\\]|\\.)*"?/;
  const STR_CONTENT = /^[^\\\n{"]+/;
  const STR_ESCAPE_CHAR = /^\\.?/;
  let cursor = 0;

  const taste = (regex, ignoreWhitespace = true) => {
    let tempCursor = cursor;

    let match = code.slice(tempCursor).match(regex);
    while (!match && ignoreWhitespace) {
      if ([" ", "\n"].includes(code.slice(tempCursor)[0])) {
        tempCursor++;
        match = code.slice(tempCursor).match(regex);
      } else break;
    }

    if (match) {
      const value = match[0];
      const lines = code
        .slice(0, tempCursor + value.length)
        .split("\n")
        .map((l) => l + "\n");
      const lineNum = lines.length - 1;
      const lineIndent = lines[lineNum].split("").findIndex((c) => c !== " ");
      return {
        regex,
        value,
        startPosition: tempCursor,
        endPosition: tempCursor + value.length,
        lineNum,
        lineIndent,
        colNum: lines[lineNum].indexOf(value),
      };
    } else return null;
  };
  const eat = (regex, ignoreWhitespace = true) => {
    const token = taste(regex, ignoreWhitespace);
    if (token) {
      cursor = token.startPosition + token.value.length;
      return token;
    } else throw `bad symbol: must match ${regex.source}`;
  };

  const tokens = [];
  const KEYWORD_COLOR = "#BB9AF7";
  const OP_COLOR = "#88DDFF";
  const BRACKET_COLOR = "#68B3DE";
  const STR_COLOR = "#9ECE6A";
  const STR = "str";

  const lexStr = () => {
    while (!taste(QUOTE, false) && tokens.length < limit) {
      if (taste(NEW_LINE, false))
        tokens.push(new Token("new-line", eat(NEW_LINE, false), { lang: STR }));
      else if (taste(STR_CONTENT))
        tokens.push(
          new Token("str-content", eat(STR_CONTENT), {
            color: STR_COLOR,
            lang: STR,
          })
        );
      else if (taste(STR_ESCAPE_CHAR))
        tokens.push(
          new Token("str-escape-char", eat(STR_ESCAPE_CHAR), {
            color: BRACKET_COLOR,
            lang: STR,
          })
        );
      else if (taste(OPEN_CURLY))
        tokens.push(
          new Token("str-interop-start", eat(OPEN_CURLY), {
            color: BRACKET_COLOR,
            lang: STR,
          })
        );
      else if (taste(CLOSE_CURLY))
        tokens.push(
          new Token("str-interop-end", eat(CLOSE_CURLY), {
            color: BRACKET_COLOR,
            lang: STR,
          })
        );
      else break;
    }
    if (taste(QUOTE))
      tokens.push(
        new Token("str-end", eat(QUOTE), {
          color: STR_COLOR,
          lang: STR,
          isDelimeter: true,
        })
      );
  };

  if (!code) {
    code = " ";
    tokens.push(new Token("empty", taste(NOTHING, false)));
    code = "";
  } else if (lang === STR) lexStr();
  while (taste(ANYTHING) && tokens.length < limit)
    if (taste(WHITE_SPACE, false))
      tokens.push(new Token("space", eat(WHITE_SPACE, false)));
    else if (taste(NEW_LINE, false))
      tokens.push(new Token("new-line", eat(NEW_LINE, false)));
    else if (taste(NUMBER))
      tokens.push(new Token("number", eat(NUMBER), { color: "#FF9D65" }));
    else if (taste(ID))
      tokens.push(new Token("id", eat(ID), { color: KEYWORD_COLOR }));
    else if (taste(ASSIGN_OP))
      tokens.push(new Token("assign-op", eat(ASSIGN_OP), { color: OP_COLOR }));
    else if (taste(COMPARE_OP))
      tokens.push(
        new Token("compare-op", eat(COMPARE_OP), { color: OP_COLOR })
      );
    else if (taste(ADD_OP))
      tokens.push(new Token("add-op", eat(ADD_OP), { color: OP_COLOR }));
    else if (taste(MULTIPLY_OP))
      tokens.push(
        new Token("multiply-op", eat(MULTIPLY_OP), { color: OP_COLOR })
      );
    else if (taste(EXPONENT_OP))
      tokens.push(
        new Token("exponent-op", eat(EXPONENT_OP), { color: OP_COLOR })
      );
    else if (taste(RANGE_OP))
      tokens.push(new Token("range-op", eat(RANGE_OP), { color: OP_COLOR }));
    else if (taste(ITERATE_OP))
      tokens.push(
        new Token("iterate-op", eat(ITERATE_OP), { color: OP_COLOR })
      );
    else if (taste(BRANCH_OP))
      tokens.push(new Token("branch-op", eat(BRANCH_OP), { color: OP_COLOR }));
    else if (taste(UNARY_OP))
      tokens.push(new Token("unary-op", eat(UNARY_OP), { color: OP_COLOR }));
    else if (taste(LOGICAL_OP))
      tokens.push(
        new Token("logical-op", eat(LOGICAL_OP), { color: OP_COLOR })
      );
    else if (taste(RETURN))
      tokens.push(new Token("return", eat(RETURN), { color: KEYWORD_COLOR }));
    else if (taste(APOSTROPHE)) tokens.push(new Token("'", eat(APOSTROPHE)));
    else if (taste(OPEN_PAREN))
      tokens.push(new Token("(", eat(OPEN_PAREN), { color: BRACKET_COLOR }));
    else if (taste(CLOSE_PAREN))
      tokens.push(new Token(")", eat(CLOSE_PAREN), { color: BRACKET_COLOR }));
    else if (taste(OPEN_CURLY))
      tokens.push(new Token("{", eat(OPEN_CURLY), { color: BRACKET_COLOR }));
    else if (taste(CLOSE_CURLY))
      tokens.push(new Token("}", eat(CLOSE_CURLY), { color: BRACKET_COLOR }));
    else if (taste(OPEN_SQUARE))
      tokens.push(new Token("[", eat(OPEN_SQUARE), { color: BRACKET_COLOR }));
    else if (taste(QUESTION))
      tokens.push(["?", eat(QUESTION), { color: BRACKET_COLOR }]);
    else if (taste(COLON))
      tokens.push([":", eat(COLON), { color: BRACKET_COLOR }]);
    else if (taste(CLOSE_SQUARE))
      tokens.push(["]", eat(CLOSE_SQUARE), { color: BRACKET_COLOR }]);
    else if (taste(COMMA)) tokens.push(new Token(",", eat(COMMA)));
    else if (taste(DOT)) tokens.push(new Token(".", eat(DOT)));
    else if (taste(QUOTE)) {
      tokens.push(
        new Token("str-start", eat(QUOTE), {
          color: STR_COLOR,
          lang: STR,
          isDelimeter: true,
        })
      );
      lexStr();
    } else
      tokens.push(new Token("unknown", eat(ANYTHING), { color: "#F44235" }));

  return tokens;
};

class AST {
  constructor(type, children = []) {
    this.type = type;
    this.children = children;
    this.isAST = true;
    this.warning = "";
  }
}
window.AST = AST;
window.useParser = (
  tokens,
  {
    limit = Infinity,
    modify = false,
    tolerateErrors = false,
    // parent = null,
  } = {}
) => {
  if (!Array.isArray(tokens)) tokens = useLexer(tokens);
  const exps = [];
  let cursor = 0;
  const taste = (type, ignoreWhitespace = true) => {
    let tempCursor = cursor;
    let token = tokens[tempCursor];
    const beforeFormatters = [];
    while (
      ignoreWhitespace &&
      token &&
      ["empty", "space", "new-line"].includes(token.type)
    ) {
      beforeFormatters.push(tokens[tempCursor]);
      token = tokens[++tempCursor];
    }

    if (!token || (type && token.type !== type)) return null;

    token.beforeFormatters = beforeFormatters;

    tempCursor++;
    token.afterFormatters = [];
    while (
      tokens[tempCursor] &&
      ["empty", "space", "new-line"].includes(tokens[tempCursor].type)
    ) {
      token.afterFormatters.push(tokens[tempCursor++]);
    }

    return token;
  };
  const eat = (type, ignoreWhitespace = true) => {
    const token = taste(type, ignoreWhitespace);
    if (token) {
      const results = [
        ...token.beforeFormatters,
        token,
        ...token.afterFormatters,
      ];
      cursor = tokens.indexOf(results.at(-1)) + 1;

      return results;
    } else if (tokens[cursor])
      throw new SyntaxError(
        `invalid token: expected ${type} but got ${tokens[cursor].type}`
      );
    else
      throw new SyntaxError(
        `invalid token: expected ${type} but ran out of tokens`
      );
  };

  const exp = () => assignment();

  const assignment = () => {
    const left = terinary();
    if (!taste("assign-op")) return left;
    else if (left.type !== "id")
      left.warning = `invalid assignment to non identifier "${left.type}"`;

    return new AST("assignment", [left, ...eat("assign-op"), terinary()]);
  };
  const terinary = () => {
    let node = logical();
    while (taste("?")) {
      const condition = node;
      eat("?");
      const left = logical();
      eat(":");
      const right = logical();
      node = new AST("terinary", [condition, left, right]);
    }
    return node;
  };
  const logical = () => {
    let left = range();
    while (taste("logical-op"))
      left = new AST("logical", [left, ...eat("logical-op"), range()]);
    return left;
  };
  const range = () => {
    let left = taste("range-op") ? null : compare();
    while (taste("range-op"))
      left = new AST("range", [left, ...eat("range-op"), compare()]);
    return left;
  };
  const compare = () => {
    let left = add();
    while (taste("compare-op"))
      left = new AST("compare", [left, ...eat("compare-op"), add()]);
    return left;
  };
  const add = () => {
    let left = multiply();
    while (taste("add-op"))
      left = new AST("add", [left, ...eat("add-op"), multiply()]);
    return left;
  };
  const multiply = () => {
    let left = exponent();
    while (taste("multiply-op"))
      left = new AST("multiply", [left, ...eat("multiply-op"), exponent()]);
    return left;
  };
  const exponent = () => {
    let left = field();
    while (taste("exponent-op"))
      left = new AST("exponent", [left, ...eat("exponent-op"), field()]);
    return left;
  };
  const field = () => {
    let left = unary();
    while (taste(".")) left = new AST("field", [left, ...eat("."), unary()]);
    return left;
  };
  const unary = () => {
    if (!taste("unary-op")) return primary();
    return new AST("unary", [...eat("unary-op"), unary()]);
  };
  const primary = () => {
    let node;
    if (taste("number")) node = new AST("number", eat("number"));
    else if (taste("id")) node = new AST("id", eat("id"));
    else if (taste("str-start")) node = str();

    if (!node) {
      if (taste()) {
        const errorMessage = `invalid token: "${taste().value}"`;
        if (tolerateErrors) {
          node = new AST("error", [taste()]);
          node.warning = errorMessage;
        } else throw new SyntaxError(errorMessage);
      } else {
        const errorMessage = `missing expression`;
        if (tolerateErrors) {
          node = new AST("error", []);
          node.warning = errorMessage;
        } else throw new SyntaxError(errorMessage);
      }
    }

    while (taste())
      if (taste("[")) node = index(node);
      else if (taste("(")) node = call(node);
      else break;

    return node;
  };
  const str = () => {
    const node = new AST("str");
    node.children.push(...eat("str-start"));

    while (taste() && !taste("str-end"))
      if (taste().lang === "str") node.children.push(...eat());
      else throw `invalid token: expected str token and got ${taste().type}`;
    if (taste("str-end")) node.children.push(...eat("str-end"));
    else if (!tolerateErrors) throw `invalid`;
    return node;
  };
  const index = (node) => {
    return new AST("index", [node, ...eat("["), exp(), ...eat("]")]);
  };
  const call = (node) => {
    const callNode = new AST("call", [node, ...eat("(")]);
    while (taste() && !taste(")")) {
      callNode.children.push(exp());
      if (taste(",")) callNode.children.push(...eat(","));
      else if (!taste(")"))
        throw `function arguments must be separated by a comma`;
    }
    if (taste(")")) callNode.children.push(...eat(")"));
    else callNode.warning = `must end in )`;
    return callNode;
  };

  while (taste(undefined, { ignoreWhitespace: false }) && exps.length < limit)
    exps.push(exp());

  if (modify) tokens.splice(0, cursor);

  return exps;
};

window.useSecure = (name, data, fn, ws) => {
  // runs fn on the server environment
};
window.useSecureRequest = (req) => {
  // runs the req on deno server
};

window.useSocket = (url, onopen = () => {}, events = {}) =>
  new Promise((res, rej) => {
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => {
      onopen(ws);
      return res(ws);
    });
    Object.entries(events).forEach(([event, fn]) =>
      ws.addEventListener(event, fn)
    );
  });
window.useSocketMessage = async (action, data = {}, socket) =>
  new Promise(async (res, rej) => {
    const requestId = useId();
    socket.send(JSON.stringify({ action, data, id: requestId }));

    const handler = (e) => {
      const response = JSON.parse(e.data);
      if (response.id !== requestId) return;
      res(response);
      socket.removeEventListener("message", handler);
    };
    socket.addEventListener("message", handler);
  });

const STYLE = useState({
  global: `body div {
  display: flex;
  position: relative;
  flex-direction: column;
  box-sizing: border-box;
  margin: 0;
}`,
});
useEffect(() => (globalStyleElement.textContent = STYLE.global));
window.React = { createElement: useElement };

Element.prototype.merge = function (node) {
  const oldChildren = Array.from(this.childNodes);
  const newChildren = Array.from(node.childNodes);

  for (const attr of node.attributes) this.setAttribute(attr.name, attr.value);
  this.$ = node.$;

  for (let i = 0; i < Math.max(oldChildren.length, newChildren.length); i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (oldChild && newChild) {
      const oldChildIsTextNode = oldChild.nodeType === Node.TEXT_NODE;
      const newChildIsTextNode = newChild.nodeType === Node.TEXT_NODE;
      if (oldChildIsTextNode && newChildIsTextNode) {
        if (oldChild.data !== newChild.data) oldChild.data = newChild.data;
      } else if (oldChildIsTextNode || newChildIsTextNode)
        this.replaceChild(newChild, oldChild);
      else if (oldChild.matches(newChild)) oldChild.merge(newChild);
      else oldChild.replaceWith(newChild);
    } else if (newChild) this.append(newChild);
    else oldChild.remove();
  }
};
Element.prototype.matches = function (node) {
  return this.nodeType === node.nodeType;
};
Node.prototype.getPreviousTextNode = function (root = document.body) {
  function findPreviousTextNode(node, root) {
    if (node.nodeType === Node.TEXT_NODE && node.data !== "") return node;

    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const result = findPreviousTextNode(node.childNodes[i], root);
      if (result) {
        return result;
      }
    }
    return null;
  }

  // deno-lint-ignore no-this-alias
  let current = this;
  while (current && root.contains(current)) {
    if (current.previousSibling) {
      current = current.previousSibling;
      const result = findPreviousTextNode(current, root);
      if (result) {
        return result;
      }
    } else {
      current = current.parentNode;
    }
  }
  return null;
};
Node.prototype.commonAncestorNode = function (node) {
  const ancestors = [];
  let current = this;
  while (current) {
    ancestors.push(current);
    current = current.parentNode;
  }
  current = node;
  while (current) {
    if (ancestors.indexOf(current) !== -1) return current;
    current = current.parentNode;
  }
  return null;
};
Node.prototype.commonAncestorElement = function (node) {
  const ancestors = [];
  let current = this;
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) ancestors.push(current);
    current = current.parentNode;
  }
  current = node;
  while (current) {
    if (ancestors.indexOf(current) !== -1) return current;
    current = current.parentNode;
  }
  return null;
};
// Text.prototype.addEventListener = ()
Array.prototype.at = function (index) {
  return this[index < 0 ? this.length + index : index];
};
String.prototype.insertAt = function (index, text) {
  return this.slice(0, index) + text + this.slice(index);
};
String.prototype.removeAt = function (index, count = 1) {
  if (index < 0 || index >= this.length) return this;
  return this.substring(0, index) + this.substring(index + count);
};
JSON.circularStringify = function (obj, indent = 0) {
  let cache = [];
  const str = JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) return;
        cache.push(value);
      }
      return value;
    },
    indent
  );
  cache = null; // Enable garbage collection
  return str;
};
