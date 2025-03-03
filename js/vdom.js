let _element = null;
let _uid = 0;
window.uid = () => _uid++;
window.Fragment = ({ children }) => children;

window.React = {
  createElement: (type, props, ...children) => {
    if (type === "unicorn")
      return UnicornDOM.render(
        React.createElement(Fragment, {}, ...children),
        document.querySelector(props.$)
      );
    props = props || {};
    props.children = children;
    if (typeof type === "function" && type.defaultProps) {
      for (const i in type.defaultProps) {
        if (props[i] === undefined) props[i] = type.defaultProps[i];
      }
    }

    return {
      id: uid(),
      type,
      props,
      unmountEffects: [],
      renderEffects: [],
      hooks: [],
      hookIndex: 0,
      parent: null,
      typeParent: null,
      children: [],
      typeChildren: [],
      isMounted: false,
      isUnicornElement: true,
    };
  },
};
window.Unicorn = window.React;
window.render = (e, builtInTypes, typeMap = new Map()) => {
  _element = e;
  e.renderEffects = [];
  e.hookIndex = 0;
  e.builtInTypes = builtInTypes;

  e.component =
    typeof e.type === "function"
      ? e.type
      : builtInTypes[e.type] || builtInTypes[""] || Fragment;

  if (e.typeParent) e.typeParent.typeChildren.push(e);
  e.typeChildren = [];

  if (typeof e.type === "string") e.props._tag = e.type;
  let result = e.component(e.props);
  if (typeof result !== "object")
    result = React.createElement(undefined, {}, result.toString());
  let newChildren = [result];
  if (Array.isArray(result))
    newChildren = result
      .flat(2)
      .map((r) =>
        typeof r !== "object"
          ? React.createElement(undefined, {}, r.toString())
          : r
      );

  let i = 0;
  let oldChild;
  let newChild;
  do {
    typeMap.set(e.component, e);

    oldChild = e.children[i];
    newChild = newChildren[i];

    if (newChild) {
      newChild.parent = e;
      newChild.typeParent =
        typeMap.get(
          typeof newChild.type === "function"
            ? newChild.type
            : builtInTypes[e.type] || builtInTypes[""] || Fragment
        ) || null;
    }

    if (oldChild && newChild) {
      if (oldChild.type === newChild.type) {
        if (oldChild.props.key === newChild.props.key) {
          oldChild.props = newChild.props;
        } else {
          e.children = e.children.filter((child) => child !== oldChild);
          unmount(oldChild);
          continue;
        }
      } else {
        e.children[i] = newChild;
        unmount(oldChild);
      }
    } else if (oldChild) {
      for (let j = i; j < e.children.length; j++) unmount(e.children[j]);
      e.children = e.children.slice(0, i);
      break;
    } else if (newChild) e.children.push(newChild);

    if (e.children[i]) render(e.children[i], builtInTypes, typeMap);

    i++;
  } while (oldChild || newChild);
  e.renderEffects.forEach((cb) => {
    const unmountEffect = cb();
    if (!e.isMounted && typeof unmountEffect === "function") {
      e.unmountEffects.push(unmountEffect);
    }
  });

  e.isMounted = true;
};
const unmount = (e) => {
  e.unmountEffects.forEach((cb) => cb());
  e.children.forEach((child) => unmount(child));
};
window.useElement = () => _element;

let useStateIndex = 0;
window.useState = (initial) => {
  const element = useElement();
  const i = element.hookIndex;
  if (element.hooks[i] === undefined) {
    element.hooks[i] = typeof initial === "function" ? initial() : initial;
  }

  element.hookIndex++;
  return [
    element.hooks[i],
    (newState, rerender = true) => {
      element.hooks[i] =
        typeof newState === "function" ? newState(element.hooks[i]) : newState;
      if (rerender) {
        if (useStateIndex === 0) {
          queueMicrotask(() => {
            useStateIndex = 0;
            render(element, element.builtInTypes);
          });
        }

        useStateIndex++;
      }
    },
  ];
};
window.useEffect = (callback, ...newDeps) => {
  const [oldDeps, setOldDeps] = useState(null);

  if (
    oldDeps === null ||
    oldDeps.length !== newDeps.length ||
    oldDeps.find((oldDep, i) => oldDep !== newDeps[i]) !== undefined
  ) {
    _element.renderEffects.push(callback);
  }

  setOldDeps(newDeps, false);
};
window.createContext = (defaultValue) => {
  const Provider = (props) => {
    Provider.context = props.value || defaultValue;
    return props.children;
  };
  Provider.context = defaultValue;

  return Provider;
};
window.useContext = (Provider) => Provider.context;

window.UnicornDOM = {
  render: (element, domRoot) => {
    window.useRef = () => ({ current: null });
    const useDOMNode = () => {
      const e = useElement();
      const [dom] = useState(() => {
        e.dom =
          e.props._tag === "text"
            ? document.createTextNode("")
            : document.createElement(e.props._tag);
        const domParent = e.typeParent ? e.typeParent.dom : domRoot;
        domParent.insertBefore(
          e.dom,
          domParent.childNodes[domParent.unicornIndex]
        );

        return e.dom;
      });

      dom.parentNode.unicornIndex++;
      dom.unicornIndex = 0;

      if (e.props.ref) e.props.ref.current = dom;
      for (let i in e.props) {
        if (i === "style") {
          typeof e.props[i] === "string"
            ? dom.setAttribute("style", e.props[i])
            : Object.keys(e.props[i]).forEach(
                (k) => (dom.style[k] = e.props[i][k])
              );
        } else if (!["children", "key", "ref"].includes(i)) dom[i] = e.props[i];
      }

      useEffect(() => () => dom.remove());

      return dom;
    };

    const DOM = (props) => {
      const dom = useDOMNode();
      if (props.useRef) props.useRef.current = dom;

      return props.children.map((child) => {
        const isUnicornElement =
          typeof child === "object" && child.isUnicornElement;
        const isArrayOfUnicornElements =
          Array.isArray(child) &&
          !child.find(
            (c) =>
              typeof c !== "object" ||
              (c && typeof c === "object" && !c.isUnicornElement)
          );
        if (isUnicornElement || isArrayOfUnicornElements) return child;
        if (typeof child === "boolean") return React.createElement(Fragment);
        return React.createElement("text", {
          nodeValue: child === null || child === undefined ? "" : child,
        });
      });
    };
    render(element, { "": DOM });
  },
};
window.$ = (...args) => Unicorn.createElement(...args);
