"use client";
import {
  require_jsx_runtime
} from "/node_modules/.vite/deps/chunk-LH2JL3P5.js?v=e16b8e45";
import {
  require_react_dom
} from "/node_modules/.vite/deps/chunk-C4BO3AWI.js?v=e16b8e45";
import {
  __commonJS,
  __toESM,
  require_react
} from "/node_modules/.vite/deps/chunk-AMZ7Q62Q.js?v=e16b8e45";

// node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
var require_use_sync_external_store_shim_development = __commonJS({
  "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        var React4 = require_react();
        var ReactSharedInternals = React4.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        function is(x, y) {
          return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
        }
        var objectIs = typeof Object.is === "function" ? Object.is : is;
        var useState27 = React4.useState, useEffect35 = React4.useEffect, useLayoutEffect2 = React4.useLayoutEffect, useDebugValue = React4.useDebugValue;
        var didWarnOld18Alpha = false;
        var didWarnUncachedGetSnapshot = false;
        function useSyncExternalStore2(subscribe2, getSnapshot, getServerSnapshot) {
          {
            if (!didWarnOld18Alpha) {
              if (React4.startTransition !== void 0) {
                didWarnOld18Alpha = true;
                error("You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release.");
              }
            }
          }
          var value = getSnapshot();
          {
            if (!didWarnUncachedGetSnapshot) {
              var cachedValue = getSnapshot();
              if (!objectIs(value, cachedValue)) {
                error("The result of getSnapshot should be cached to avoid an infinite loop");
                didWarnUncachedGetSnapshot = true;
              }
            }
          }
          var _useState = useState27({
            inst: {
              value,
              getSnapshot
            }
          }), inst = _useState[0].inst, forceUpdate = _useState[1];
          useLayoutEffect2(function() {
            inst.value = value;
            inst.getSnapshot = getSnapshot;
            if (checkIfSnapshotChanged(inst)) {
              forceUpdate({
                inst
              });
            }
          }, [subscribe2, value, getSnapshot]);
          useEffect35(function() {
            if (checkIfSnapshotChanged(inst)) {
              forceUpdate({
                inst
              });
            }
            var handleStoreChange = function() {
              if (checkIfSnapshotChanged(inst)) {
                forceUpdate({
                  inst
                });
              }
            };
            return subscribe2(handleStoreChange);
          }, [subscribe2]);
          useDebugValue(value);
          return value;
        }
        function checkIfSnapshotChanged(inst) {
          var latestGetSnapshot = inst.getSnapshot;
          var prevValue = inst.value;
          try {
            var nextValue = latestGetSnapshot();
            return !objectIs(prevValue, nextValue);
          } catch (error2) {
            return true;
          }
        }
        function useSyncExternalStore$1(subscribe2, getSnapshot, getServerSnapshot) {
          return getSnapshot();
        }
        var canUseDOM2 = !!(typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined");
        var isServerEnvironment = !canUseDOM2;
        var shim = isServerEnvironment ? useSyncExternalStore$1 : useSyncExternalStore2;
        var useSyncExternalStore$2 = React4.useSyncExternalStore !== void 0 ? React4.useSyncExternalStore : shim;
        exports.useSyncExternalStore = useSyncExternalStore$2;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
  "node_modules/use-sync-external-store/shim/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_use_sync_external_store_shim_development();
    }
  }
});

// node_modules/@ariakit/react-core/esm/__chunks/3YLGPPWQ.js
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// node_modules/@ariakit/core/esm/__chunks/3YLGPPWQ.js
var __defProp2 = Object.defineProperty;
var __defProps2 = Object.defineProperties;
var __getOwnPropDescs2 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols2 = Object.getOwnPropertySymbols;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __propIsEnum2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues2 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp2.call(b, prop))
      __defNormalProp2(a, prop, b[prop]);
  if (__getOwnPropSymbols2)
    for (var prop of __getOwnPropSymbols2(b)) {
      if (__propIsEnum2.call(b, prop))
        __defNormalProp2(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps2 = (a, b) => __defProps2(a, __getOwnPropDescs2(b));
var __objRest2 = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp2.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols2)
    for (var prop of __getOwnPropSymbols2(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum2.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// node_modules/@ariakit/core/esm/__chunks/PBFD2E7P.js
function noop(..._) {
}
function shallowEqual(a, b) {
  if (a === b)
    return true;
  if (!a)
    return false;
  if (!b)
    return false;
  if (typeof a !== "object")
    return false;
  if (typeof b !== "object")
    return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const { length } = aKeys;
  if (bKeys.length !== length)
    return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
function applyState(argument, currentValue) {
  if (isUpdater(argument)) {
    const value = isLazyValue(currentValue) ? currentValue() : currentValue;
    return argument(value);
  }
  return argument;
}
function isUpdater(argument) {
  return typeof argument === "function";
}
function isLazyValue(value) {
  return typeof value === "function";
}
function isObject(arg) {
  return typeof arg === "object" && arg != null;
}
function isInteger(arg) {
  if (typeof arg === "number") {
    return Math.floor(arg) === arg;
  }
  return String(Math.floor(Number(arg))) === arg;
}
function hasOwnProperty(object, prop) {
  if (typeof Object.hasOwn === "function") {
    return Object.hasOwn(object, prop);
  }
  return Object.prototype.hasOwnProperty.call(object, prop);
}
function chain(...fns) {
  return (...args) => {
    for (const fn of fns) {
      if (typeof fn === "function") {
        fn(...args);
      }
    }
  };
}
function cx(...args) {
  return args.filter(Boolean).join(" ") || void 0;
}
function normalizeString(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function omit(object, keys) {
  const result = __spreadValues2({}, object);
  for (const key of keys) {
    if (hasOwnProperty(result, key)) {
      delete result[key];
    }
  }
  return result;
}
function pick(object, paths) {
  const result = {};
  for (const key of paths) {
    if (hasOwnProperty(object, key)) {
      result[key] = object[key];
    }
  }
  return result;
}
function identity(value) {
  return value;
}
function invariant(condition, message) {
  if (condition)
    return;
  if (typeof message !== "string")
    throw new Error("Invariant failed");
  throw new Error(message);
}
function getKeys(obj) {
  return Object.keys(obj);
}
function isFalsyBooleanCallback(booleanOrCallback, ...args) {
  const result = typeof booleanOrCallback === "function" ? booleanOrCallback(...args) : booleanOrCallback;
  if (result == null)
    return false;
  return !result;
}
function disabledFromProps(props) {
  return props.disabled || props["aria-disabled"] === true || props["aria-disabled"] === "true";
}
function removeUndefinedValues(obj) {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== void 0) {
      result[key] = obj[key];
    }
  }
  return result;
}
function defaultValue(...values) {
  for (const value of values) {
    if (value !== void 0)
      return value;
  }
  return void 0;
}

// node_modules/@ariakit/react-core/esm/__chunks/SK3NAZA3.js
var import_react = __toESM(require_react(), 1);
function setRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
function isValidElementWithRef(element) {
  if (!element)
    return false;
  if (!(0, import_react.isValidElement)(element))
    return false;
  if ("ref" in element.props)
    return true;
  if ("ref" in element)
    return true;
  return false;
}
function getRefProperty(element) {
  if (!isValidElementWithRef(element))
    return null;
  const props = __spreadValues({}, element.props);
  return props.ref || element.ref;
}
function mergeProps(base, overrides) {
  const props = __spreadValues({}, base);
  for (const key in overrides) {
    if (!hasOwnProperty(overrides, key))
      continue;
    if (key === "className") {
      const prop = "className";
      props[prop] = base[prop] ? `${base[prop]} ${overrides[prop]}` : overrides[prop];
      continue;
    }
    if (key === "style") {
      const prop = "style";
      props[prop] = base[prop] ? __spreadValues(__spreadValues({}, base[prop]), overrides[prop]) : overrides[prop];
      continue;
    }
    const overrideValue = overrides[key];
    if (typeof overrideValue === "function" && key.startsWith("on")) {
      const baseValue = base[key];
      if (typeof baseValue === "function") {
        props[key] = (...args) => {
          overrideValue(...args);
          baseValue(...args);
        };
        continue;
      }
    }
    props[key] = overrideValue;
  }
  return props;
}

// node_modules/@ariakit/core/esm/__chunks/HWOIWM4O.js
var canUseDOM = checkIsBrowser();
function checkIsBrowser() {
  var _a;
  return typeof window !== "undefined" && !!((_a = window.document) == null ? void 0 : _a.createElement);
}
function getDocument(node) {
  return node ? node.ownerDocument || node : document;
}
function getWindow(node) {
  return getDocument(node).defaultView || window;
}
function getActiveElement(node, activeDescendant = false) {
  const { activeElement } = getDocument(node);
  if (!(activeElement == null ? void 0 : activeElement.nodeName)) {
    return null;
  }
  if (isFrame(activeElement) && activeElement.contentDocument) {
    return getActiveElement(
      activeElement.contentDocument.body,
      activeDescendant
    );
  }
  if (activeDescendant) {
    const id = activeElement.getAttribute("aria-activedescendant");
    if (id) {
      const element = getDocument(activeElement).getElementById(id);
      if (element) {
        return element;
      }
    }
  }
  return activeElement;
}
function contains(parent, child) {
  return parent === child || parent.contains(child);
}
function isFrame(element) {
  return element.tagName === "IFRAME";
}
function isButton(element) {
  const tagName = element.tagName.toLowerCase();
  if (tagName === "button")
    return true;
  if (tagName === "input" && element.type) {
    return buttonInputTypes.indexOf(element.type) !== -1;
  }
  return false;
}
var buttonInputTypes = [
  "button",
  "color",
  "file",
  "image",
  "reset",
  "submit"
];
function isVisible(element) {
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility();
  }
  const htmlElement = element;
  return htmlElement.offsetWidth > 0 || htmlElement.offsetHeight > 0 || element.getClientRects().length > 0;
}
function isTextField(element) {
  try {
    const isTextInput = element instanceof HTMLInputElement && element.selectionStart !== null;
    const isTextArea = element.tagName === "TEXTAREA";
    return isTextInput || isTextArea || false;
  } catch (error) {
    return false;
  }
}
function isTextbox(element) {
  return element.isContentEditable || isTextField(element);
}
function getTextboxValue(element) {
  if (isTextField(element)) {
    return element.value;
  }
  if (element.isContentEditable) {
    const range = getDocument(element).createRange();
    range.selectNodeContents(element);
    return range.toString();
  }
  return "";
}
function getTextboxSelection(element) {
  let start = 0;
  let end = 0;
  if (isTextField(element)) {
    start = element.selectionStart || 0;
    end = element.selectionEnd || 0;
  } else if (element.isContentEditable) {
    const selection = getDocument(element).getSelection();
    if ((selection == null ? void 0 : selection.rangeCount) && selection.anchorNode && contains(element, selection.anchorNode) && selection.focusNode && contains(element, selection.focusNode)) {
      const range = selection.getRangeAt(0);
      const nextRange = range.cloneRange();
      nextRange.selectNodeContents(element);
      nextRange.setEnd(range.startContainer, range.startOffset);
      start = nextRange.toString().length;
      nextRange.setEnd(range.endContainer, range.endOffset);
      end = nextRange.toString().length;
    }
  }
  return { start, end };
}
function getPopupRole(element, fallback) {
  const allowedPopupRoles = ["dialog", "menu", "listbox", "tree", "grid"];
  const role = element == null ? void 0 : element.getAttribute("role");
  if (role && allowedPopupRoles.indexOf(role) !== -1) {
    return role;
  }
  return fallback;
}
function getPopupItemRole(element, fallback) {
  var _a;
  const itemRoleByPopupRole = {
    menu: "menuitem",
    listbox: "option",
    tree: "treeitem"
  };
  const popupRole = getPopupRole(element);
  if (!popupRole)
    return fallback;
  const key = popupRole;
  return (_a = itemRoleByPopupRole[key]) != null ? _a : fallback;
}
function getScrollingElement(element) {
  if (!element)
    return null;
  if (element.clientHeight && element.scrollHeight > element.clientHeight) {
    const { overflowY } = getComputedStyle(element);
    const isScrollable = overflowY !== "visible" && overflowY !== "hidden";
    if (isScrollable)
      return element;
  } else if (element.clientWidth && element.scrollWidth > element.clientWidth) {
    const { overflowX } = getComputedStyle(element);
    const isScrollable = overflowX !== "visible" && overflowX !== "hidden";
    if (isScrollable)
      return element;
  }
  return getScrollingElement(element.parentElement) || document.scrollingElement || document.body;
}
function setSelectionRange(element, ...args) {
  if (/text|search|password|tel|url/i.test(element.type)) {
    element.setSelectionRange(...args);
  }
}

// node_modules/@ariakit/core/esm/__chunks/US4USQPI.js
function isTouchDevice() {
  return canUseDOM && !!navigator.maxTouchPoints;
}
function isApple() {
  if (!canUseDOM)
    return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.platform);
}
function isSafari() {
  return canUseDOM && isApple() && /apple/i.test(navigator.vendor);
}
function isFirefox() {
  return canUseDOM && /firefox\//i.test(navigator.userAgent);
}
function isMac() {
  return canUseDOM && navigator.platform.startsWith("Mac") && !isTouchDevice();
}

// node_modules/@ariakit/core/esm/utils/events.js
function isPortalEvent(event) {
  return Boolean(
    event.currentTarget && !contains(event.currentTarget, event.target)
  );
}
function isSelfTarget(event) {
  return event.target === event.currentTarget;
}
function isOpeningInNewTab(event) {
  const element = event.currentTarget;
  if (!element)
    return false;
  const isAppleDevice = isApple();
  if (isAppleDevice && !event.metaKey)
    return false;
  if (!isAppleDevice && !event.ctrlKey)
    return false;
  const tagName = element.tagName.toLowerCase();
  if (tagName === "a")
    return true;
  if (tagName === "button" && element.type === "submit")
    return true;
  if (tagName === "input" && element.type === "submit")
    return true;
  return false;
}
function isDownloading(event) {
  const element = event.currentTarget;
  if (!element)
    return false;
  const tagName = element.tagName.toLowerCase();
  if (!event.altKey)
    return false;
  if (tagName === "a")
    return true;
  if (tagName === "button" && element.type === "submit")
    return true;
  if (tagName === "input" && element.type === "submit")
    return true;
  return false;
}
function fireEvent(element, type, eventInit) {
  const event = new Event(type, eventInit);
  return element.dispatchEvent(event);
}
function fireBlurEvent(element, eventInit) {
  const event = new FocusEvent("blur", eventInit);
  const defaultAllowed = element.dispatchEvent(event);
  const bubbleInit = __spreadProps2(__spreadValues2({}, eventInit), { bubbles: true });
  element.dispatchEvent(new FocusEvent("focusout", bubbleInit));
  return defaultAllowed;
}
function fireKeyboardEvent(element, type, eventInit) {
  const event = new KeyboardEvent(type, eventInit);
  return element.dispatchEvent(event);
}
function fireClickEvent(element, eventInit) {
  const event = new MouseEvent("click", eventInit);
  return element.dispatchEvent(event);
}
function isFocusEventOutside(event, container) {
  const containerElement = container || event.currentTarget;
  const relatedTarget = event.relatedTarget;
  return !relatedTarget || !contains(containerElement, relatedTarget);
}
function queueBeforeEvent(element, type, callback, timeout) {
  const createTimer = (callback2) => {
    if (timeout) {
      const timerId2 = setTimeout(callback2, timeout);
      return () => clearTimeout(timerId2);
    }
    const timerId = requestAnimationFrame(callback2);
    return () => cancelAnimationFrame(timerId);
  };
  const cancelTimer = createTimer(() => {
    element.removeEventListener(type, callSync, true);
    callback();
  });
  const callSync = () => {
    cancelTimer();
    callback();
  };
  element.addEventListener(type, callSync, { once: true, capture: true });
  return cancelTimer;
}
function addGlobalEventListener(type, listener, options, scope = window) {
  const children3 = [];
  try {
    scope.document.addEventListener(type, listener, options);
    for (const frame of Array.from(scope.frames)) {
      children3.push(addGlobalEventListener(type, listener, options, frame));
    }
  } catch (e) {
  }
  const removeEventListener = () => {
    try {
      scope.document.removeEventListener(type, listener, options);
    } catch (e) {
    }
    for (const remove of children3) {
      remove();
    }
  };
  return removeEventListener;
}

// node_modules/@ariakit/react-core/esm/__chunks/Z32BISHQ.js
var import_react2 = __toESM(require_react(), 1);
var React = __toESM(require_react(), 1);
var _React = __spreadValues({}, React);
var useReactId = _React.useId;
var useReactDeferredValue = _React.useDeferredValue;
var useReactInsertionEffect = _React.useInsertionEffect;
var useSafeLayoutEffect = canUseDOM ? import_react2.useLayoutEffect : import_react2.useEffect;
function useInitialValue(value) {
  const [initialValue] = (0, import_react2.useState)(value);
  return initialValue;
}
function useLiveRef(value) {
  const ref = (0, import_react2.useRef)(value);
  useSafeLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
function useEvent(callback) {
  const ref = (0, import_react2.useRef)(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  if (useReactInsertionEffect) {
    useReactInsertionEffect(() => {
      ref.current = callback;
    });
  } else {
    ref.current = callback;
  }
  return (0, import_react2.useCallback)((...args) => {
    var _a;
    return (_a = ref.current) == null ? void 0 : _a.call(ref, ...args);
  }, []);
}
function useTransactionState(callback) {
  const [state, setState] = (0, import_react2.useState)(null);
  useSafeLayoutEffect(() => {
    if (state == null)
      return;
    if (!callback)
      return;
    let prevState = null;
    callback((prev) => {
      prevState = prev;
      return state;
    });
    return () => {
      callback(prevState);
    };
  }, [state, callback]);
  return [state, setState];
}
function useMergeRefs(...refs) {
  return (0, import_react2.useMemo)(() => {
    if (!refs.some(Boolean))
      return;
    return (value) => {
      for (const ref of refs) {
        setRef(ref, value);
      }
    };
  }, refs);
}
function useId(defaultId) {
  if (useReactId) {
    const reactId = useReactId();
    if (defaultId)
      return defaultId;
    return reactId;
  }
  const [id, setId] = (0, import_react2.useState)(defaultId);
  useSafeLayoutEffect(() => {
    if (defaultId || id)
      return;
    const random = Math.random().toString(36).substr(2, 6);
    setId(`id-${random}`);
  }, [defaultId, id]);
  return defaultId || id;
}
function useTagName(refOrElement, type) {
  const stringOrUndefined = (type2) => {
    if (typeof type2 !== "string")
      return;
    return type2;
  };
  const [tagName, setTagName] = (0, import_react2.useState)(() => stringOrUndefined(type));
  useSafeLayoutEffect(() => {
    const element = refOrElement && "current" in refOrElement ? refOrElement.current : refOrElement;
    setTagName((element == null ? void 0 : element.tagName.toLowerCase()) || stringOrUndefined(type));
  }, [refOrElement, type]);
  return tagName;
}
function useAttribute(refOrElement, attributeName, defaultValue2) {
  const [attribute, setAttribute2] = (0, import_react2.useState)(defaultValue2);
  useSafeLayoutEffect(() => {
    const element = refOrElement && "current" in refOrElement ? refOrElement.current : refOrElement;
    if (!element)
      return;
    const callback = () => {
      const value = element.getAttribute(attributeName);
      if (value == null)
        return;
      setAttribute2(value);
    };
    const observer = new MutationObserver(callback);
    observer.observe(element, { attributeFilter: [attributeName] });
    callback();
    return () => observer.disconnect();
  }, [refOrElement, attributeName]);
  return attribute;
}
function useUpdateEffect(effect, deps) {
  const mounted = (0, import_react2.useRef)(false);
  (0, import_react2.useEffect)(() => {
    if (mounted.current) {
      return effect();
    }
    mounted.current = true;
  }, deps);
  (0, import_react2.useEffect)(
    () => () => {
      mounted.current = false;
    },
    []
  );
}
function useUpdateLayoutEffect(effect, deps) {
  const mounted = (0, import_react2.useRef)(false);
  useSafeLayoutEffect(() => {
    if (mounted.current) {
      return effect();
    }
    mounted.current = true;
  }, deps);
  useSafeLayoutEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );
}
function useForceUpdate() {
  return (0, import_react2.useReducer)(() => [], []);
}
function useBooleanEvent(booleanOrCallback) {
  return useEvent(
    typeof booleanOrCallback === "function" ? booleanOrCallback : () => booleanOrCallback
  );
}
function useWrapElement(props, callback, deps = []) {
  const wrapElement = (0, import_react2.useCallback)(
    (element) => {
      if (props.wrapElement) {
        element = props.wrapElement(element);
      }
      return callback(element);
    },
    [...deps, props.wrapElement]
  );
  return __spreadProps(__spreadValues({}, props), { wrapElement });
}
function usePortalRef(portalProp = false, portalRefProp) {
  const [portalNode, setPortalNode] = (0, import_react2.useState)(null);
  const portalRef = useMergeRefs(setPortalNode, portalRefProp);
  const domReady = !portalProp || portalNode;
  return { portalRef, portalNode, domReady };
}
function useMetadataProps(props, key, value) {
  const parent = props.onLoadedMetadataCapture;
  const onLoadedMetadataCapture = (0, import_react2.useMemo)(() => {
    return Object.assign(() => {
    }, __spreadProps(__spreadValues({}, parent), { [key]: value }));
  }, [parent, key, value]);
  return [parent == null ? void 0 : parent[key], { onLoadedMetadataCapture }];
}
function useIsMouseMoving() {
  (0, import_react2.useEffect)(() => {
    addGlobalEventListener("mousemove", setMouseMoving, true);
    addGlobalEventListener("mousedown", resetMouseMoving, true);
    addGlobalEventListener("mouseup", resetMouseMoving, true);
    addGlobalEventListener("keydown", resetMouseMoving, true);
    addGlobalEventListener("scroll", resetMouseMoving, true);
  }, []);
  const isMouseMoving = useEvent(() => mouseMoving);
  return isMouseMoving;
}
var mouseMoving = false;
var previousScreenX = 0;
var previousScreenY = 0;
function hasMouseMovement(event) {
  const movementX = event.movementX || event.screenX - previousScreenX;
  const movementY = event.movementY || event.screenY - previousScreenY;
  previousScreenX = event.screenX;
  previousScreenY = event.screenY;
  return movementX || movementY || false;
}
function setMouseMoving(event) {
  if (!hasMouseMovement(event))
    return;
  mouseMoving = true;
}
function resetMouseMoving() {
  mouseMoving = false;
}

// node_modules/@ariakit/react-core/esm/__chunks/HKOOKEDE.js
var React2 = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function forwardRef2(render) {
  const Role3 = React2.forwardRef((props, ref) => render(__spreadProps(__spreadValues({}, props), { ref })));
  Role3.displayName = render.displayName || render.name;
  return Role3;
}
function memo2(Component, propsAreEqual) {
  return React2.memo(Component, propsAreEqual);
}
function createElement(Type, props) {
  const _a = props, { wrapElement, render } = _a, rest = __objRest(_a, ["wrapElement", "render"]);
  const mergedRef = useMergeRefs(props.ref, getRefProperty(render));
  let element;
  if (React2.isValidElement(render)) {
    const renderProps = __spreadProps(__spreadValues({}, render.props), { ref: mergedRef });
    element = React2.cloneElement(render, mergeProps(rest, renderProps));
  } else if (render) {
    element = render(rest);
  } else {
    element = (0, import_jsx_runtime.jsx)(Type, __spreadValues({}, rest));
  }
  if (wrapElement) {
    return wrapElement(element);
  }
  return element;
}
function createHook(useProps) {
  const useRole3 = (props = {}) => {
    return useProps(props);
  };
  useRole3.displayName = useProps.name;
  return useRole3;
}
function createStoreContext(providers = [], scopedProviders = []) {
  const context = React2.createContext(void 0);
  const scopedContext = React2.createContext(void 0);
  const useContext22 = () => React2.useContext(context);
  const useScopedContext = (onlyScoped = false) => {
    const scoped = React2.useContext(scopedContext);
    const store = useContext22();
    if (onlyScoped)
      return scoped;
    return scoped || store;
  };
  const useProviderContext = () => {
    const scoped = React2.useContext(scopedContext);
    const store = useContext22();
    if (scoped && scoped === store)
      return;
    return store;
  };
  const ContextProvider = (props) => {
    return providers.reduceRight(
      (children3, Provider) => (0, import_jsx_runtime.jsx)(Provider, __spreadProps(__spreadValues({}, props), { children: children3 })),
      (0, import_jsx_runtime.jsx)(context.Provider, __spreadValues({}, props))
    );
  };
  const ScopedContextProvider = (props) => {
    return (0, import_jsx_runtime.jsx)(ContextProvider, __spreadProps(__spreadValues({}, props), { children: scopedProviders.reduceRight(
      (children3, Provider) => (0, import_jsx_runtime.jsx)(Provider, __spreadProps(__spreadValues({}, props), { children: children3 })),
      (0, import_jsx_runtime.jsx)(scopedContext.Provider, __spreadValues({}, props))
    ) }));
  };
  return {
    context,
    scopedContext,
    useContext: useContext22,
    useScopedContext,
    useProviderContext,
    ContextProvider,
    ScopedContextProvider
  };
}

// node_modules/@ariakit/react-core/esm/__chunks/FMYQNSCK.js
var ctx = createStoreContext();
var useCollectionContext = ctx.useContext;
var useCollectionScopedContext = ctx.useScopedContext;
var useCollectionProviderContext = ctx.useProviderContext;
var CollectionContextProvider = ctx.ContextProvider;
var CollectionScopedContextProvider = ctx.ScopedContextProvider;

// node_modules/@ariakit/react-core/esm/__chunks/WENSINUV.js
var import_react3 = __toESM(require_react(), 1);
var ctx2 = createStoreContext(
  [CollectionContextProvider],
  [CollectionScopedContextProvider]
);
var useCompositeContext = ctx2.useContext;
var useCompositeScopedContext = ctx2.useScopedContext;
var useCompositeProviderContext = ctx2.useProviderContext;
var CompositeContextProvider = ctx2.ContextProvider;
var CompositeScopedContextProvider = ctx2.ScopedContextProvider;
var CompositeItemContext = (0, import_react3.createContext)(
  void 0
);
var CompositeRowContext = (0, import_react3.createContext)(
  void 0
);

// node_modules/@ariakit/react-core/esm/__chunks/P2OTTZSX.js
var import_react4 = __toESM(require_react(), 1);
var TagValueContext = (0, import_react4.createContext)(null);
var TagRemoveIdContext = (0, import_react4.createContext)(
  null
);
var ctx3 = createStoreContext(
  [CompositeContextProvider],
  [CompositeScopedContextProvider]
);
var useTagContext = ctx3.useContext;
var useTagScopedContext = ctx3.useScopedContext;
var useTagProviderContext = ctx3.useProviderContext;
var TagContextProvider = ctx3.ContextProvider;
var TagScopedContextProvider = ctx3.ScopedContextProvider;

// node_modules/@ariakit/core/esm/__chunks/EQQLU3CG.js
function getInternal(store, key) {
  const internals = store.__unstableInternals;
  invariant(internals, "Invalid store");
  return internals[key];
}
function createStore(initialState, ...stores) {
  let state = initialState;
  let prevStateBatch = state;
  let lastUpdate = Symbol();
  let destroy = noop;
  const instances = /* @__PURE__ */ new Set();
  const updatedKeys = /* @__PURE__ */ new Set();
  const setups = /* @__PURE__ */ new Set();
  const listeners = /* @__PURE__ */ new Set();
  const batchListeners = /* @__PURE__ */ new Set();
  const disposables = /* @__PURE__ */ new WeakMap();
  const listenerKeys = /* @__PURE__ */ new WeakMap();
  const storeSetup = (callback) => {
    setups.add(callback);
    return () => setups.delete(callback);
  };
  const storeInit = () => {
    const initialized = instances.size;
    const instance = Symbol();
    instances.add(instance);
    const maybeDestroy = () => {
      instances.delete(instance);
      if (instances.size)
        return;
      destroy();
    };
    if (initialized)
      return maybeDestroy;
    const desyncs = getKeys(state).map(
      (key) => chain(
        ...stores.map((store) => {
          var _a;
          const storeState = (_a = store == null ? void 0 : store.getState) == null ? void 0 : _a.call(store);
          if (!storeState)
            return;
          if (!hasOwnProperty(storeState, key))
            return;
          return sync(store, [key], (state2) => {
            setState(
              key,
              state2[key],
              // @ts-expect-error - Not public API. This is just to prevent
              // infinite loops.
              true
            );
          });
        })
      )
    );
    const teardowns = [];
    for (const setup2 of setups) {
      teardowns.push(setup2());
    }
    const cleanups2 = stores.map(init);
    destroy = chain(...desyncs, ...teardowns, ...cleanups2);
    return maybeDestroy;
  };
  const sub = (keys, listener, set2 = listeners) => {
    set2.add(listener);
    listenerKeys.set(listener, keys);
    return () => {
      var _a;
      (_a = disposables.get(listener)) == null ? void 0 : _a();
      disposables.delete(listener);
      listenerKeys.delete(listener);
      set2.delete(listener);
    };
  };
  const storeSubscribe = (keys, listener) => sub(keys, listener);
  const storeSync = (keys, listener) => {
    disposables.set(listener, listener(state, state));
    return sub(keys, listener);
  };
  const storeBatch = (keys, listener) => {
    disposables.set(listener, listener(state, prevStateBatch));
    return sub(keys, listener, batchListeners);
  };
  const storePick = (keys) => createStore(pick(state, keys), finalStore);
  const storeOmit = (keys) => createStore(omit(state, keys), finalStore);
  const getState = () => state;
  const setState = (key, value, fromStores = false) => {
    var _a;
    if (!hasOwnProperty(state, key))
      return;
    const nextValue = applyState(value, state[key]);
    if (nextValue === state[key])
      return;
    if (!fromStores) {
      for (const store of stores) {
        (_a = store == null ? void 0 : store.setState) == null ? void 0 : _a.call(store, key, nextValue);
      }
    }
    const prevState = state;
    state = __spreadProps2(__spreadValues2({}, state), { [key]: nextValue });
    const thisUpdate = Symbol();
    lastUpdate = thisUpdate;
    updatedKeys.add(key);
    const run = (listener, prev, uKeys) => {
      var _a2;
      const keys = listenerKeys.get(listener);
      const updated = (k) => uKeys ? uKeys.has(k) : k === key;
      if (!keys || keys.some(updated)) {
        (_a2 = disposables.get(listener)) == null ? void 0 : _a2();
        disposables.set(listener, listener(state, prev));
      }
    };
    for (const listener of listeners) {
      run(listener, prevState);
    }
    queueMicrotask(() => {
      if (lastUpdate !== thisUpdate)
        return;
      const snapshot = state;
      for (const listener of batchListeners) {
        run(listener, prevStateBatch, updatedKeys);
      }
      prevStateBatch = snapshot;
      updatedKeys.clear();
    });
  };
  const finalStore = {
    getState,
    setState,
    __unstableInternals: {
      setup: storeSetup,
      init: storeInit,
      subscribe: storeSubscribe,
      sync: storeSync,
      batch: storeBatch,
      pick: storePick,
      omit: storeOmit
    }
  };
  return finalStore;
}
function setup(store, ...args) {
  if (!store)
    return;
  return getInternal(store, "setup")(...args);
}
function init(store, ...args) {
  if (!store)
    return;
  return getInternal(store, "init")(...args);
}
function subscribe(store, ...args) {
  if (!store)
    return;
  return getInternal(store, "subscribe")(...args);
}
function sync(store, ...args) {
  if (!store)
    return;
  return getInternal(store, "sync")(...args);
}
function batch(store, ...args) {
  if (!store)
    return;
  return getInternal(store, "batch")(...args);
}
function omit2(store, ...args) {
  if (!store)
    return;
  return getInternal(store, "omit")(...args);
}
function pick2(store, ...args) {
  if (!store)
    return;
  return getInternal(store, "pick")(...args);
}
function mergeStore(...stores) {
  const initialState = stores.reduce((state, store2) => {
    var _a;
    const nextState = (_a = store2 == null ? void 0 : store2.getState) == null ? void 0 : _a.call(store2);
    if (!nextState)
      return state;
    return Object.assign(state, nextState);
  }, {});
  const store = createStore(initialState, ...stores);
  return store;
}
function throwOnConflictingProps(props, store) {
  if (false)
    return;
  if (!store)
    return;
  const defaultKeys = Object.entries(props).filter(([key, value]) => key.startsWith("default") && value !== void 0).map(([key]) => {
    var _a;
    const stateKey = key.replace("default", "");
    return `${((_a = stateKey[0]) == null ? void 0 : _a.toLowerCase()) || ""}${stateKey.slice(1)}`;
  });
  if (!defaultKeys.length)
    return;
  const storeState = store.getState();
  const conflictingProps = defaultKeys.filter(
    (key) => hasOwnProperty(storeState, key)
  );
  if (!conflictingProps.length)
    return;
  throw new Error(
    `Passing a store prop in conjunction with a default state is not supported.

const store = useSelectStore();
<SelectProvider store={store} defaultValue="Apple" />
                ^             ^

Instead, pass the default state to the topmost store:

const store = useSelectStore({ defaultValue: "Apple" });
<SelectProvider store={store} />

See https://github.com/ariakit/ariakit/pull/2745 for more details.

If there's a particular need for this, please submit a feature request at https://github.com/ariakit/ariakit
`
  );
}

// node_modules/@ariakit/react-core/esm/__chunks/2GXGCHW6.js
var React3 = __toESM(require_react(), 1);
var import_shim = __toESM(require_shim(), 1);
var { useSyncExternalStore } = import_shim.default;
var noopSubscribe = () => () => {
};
function useStoreState(store, keyOrSelector = identity) {
  const storeSubscribe = React3.useCallback(
    (callback) => {
      if (!store)
        return noopSubscribe();
      return subscribe(store, null, callback);
    },
    [store]
  );
  const getSnapshot = () => {
    const key = typeof keyOrSelector === "string" ? keyOrSelector : null;
    const selector2 = typeof keyOrSelector === "function" ? keyOrSelector : null;
    const state = store == null ? void 0 : store.getState();
    if (selector2)
      return selector2(state);
    if (!state)
      return;
    if (!key)
      return;
    if (!hasOwnProperty(state, key))
      return;
    return state[key];
  };
  return useSyncExternalStore(storeSubscribe, getSnapshot, getSnapshot);
}
function useStoreProps(store, props, key, setKey) {
  const value = hasOwnProperty(props, key) ? props[key] : void 0;
  const setValue = setKey ? props[setKey] : void 0;
  const propsRef = useLiveRef({ value, setValue });
  useSafeLayoutEffect(() => {
    return sync(store, [key], (state, prev) => {
      const { value: value2, setValue: setValue2 } = propsRef.current;
      if (!setValue2)
        return;
      if (state[key] === prev[key])
        return;
      if (state[key] === value2)
        return;
      setValue2(state[key]);
    });
  }, [store, key]);
  useSafeLayoutEffect(() => {
    if (value === void 0)
      return;
    store.setState(key, value);
    return batch(store, [key], () => {
      if (value === void 0)
        return;
      store.setState(key, value);
    });
  });
}
function useStore(createStore2, props) {
  const [store, setStore] = React3.useState(() => createStore2(props));
  useSafeLayoutEffect(() => init(store), [store]);
  const useState27 = React3.useCallback(
    (keyOrSelector) => useStoreState(store, keyOrSelector),
    [store]
  );
  const memoizedStore = React3.useMemo(
    () => __spreadProps(__spreadValues({}, store), { useState: useState27 }),
    [store, useState27]
  );
  const updateStore = useEvent(() => {
    setStore((store2) => createStore2(__spreadValues(__spreadValues({}, props), store2.getState())));
  });
  return [memoizedStore, updateStore];
}

// node_modules/@ariakit/core/esm/__chunks/6DHTHWXD.js
function isElementPreceding(a, b) {
  return Boolean(
    b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING
  );
}
function sortBasedOnDOMPosition(items) {
  const pairs = items.map((item, index) => [index, item]);
  let isOrderDifferent = false;
  pairs.sort(([indexA, a], [indexB, b]) => {
    const elementA = a.element;
    const elementB = b.element;
    if (elementA === elementB)
      return 0;
    if (!elementA || !elementB)
      return 0;
    if (isElementPreceding(elementA, elementB)) {
      if (indexA > indexB) {
        isOrderDifferent = true;
      }
      return -1;
    }
    if (indexA < indexB) {
      isOrderDifferent = true;
    }
    return 1;
  });
  if (isOrderDifferent) {
    return pairs.map(([_, item]) => item);
  }
  return items;
}
function getCommonParent(items) {
  var _a;
  const firstItem = items.find((item) => !!item.element);
  const lastItem = [...items].reverse().find((item) => !!item.element);
  let parentElement = (_a = firstItem == null ? void 0 : firstItem.element) == null ? void 0 : _a.parentElement;
  while (parentElement && (lastItem == null ? void 0 : lastItem.element)) {
    const parent = parentElement;
    if (lastItem && parent.contains(lastItem.element)) {
      return parentElement;
    }
    parentElement = parentElement.parentElement;
  }
  return getDocument(parentElement).body;
}
function getPrivateStore(store) {
  return store == null ? void 0 : store.__unstablePrivateStore;
}
function createCollectionStore(props = {}) {
  var _a;
  throwOnConflictingProps(props, props.store);
  const syncState = (_a = props.store) == null ? void 0 : _a.getState();
  const items = defaultValue(
    props.items,
    syncState == null ? void 0 : syncState.items,
    props.defaultItems,
    []
  );
  const itemsMap = new Map(items.map((item) => [item.id, item]));
  const initialState = {
    items,
    renderedItems: defaultValue(syncState == null ? void 0 : syncState.renderedItems, [])
  };
  const syncPrivateStore = getPrivateStore(props.store);
  const privateStore = createStore(
    { items, renderedItems: initialState.renderedItems },
    syncPrivateStore
  );
  const collection = createStore(initialState, props.store);
  const sortItems = (renderedItems) => {
    const sortedItems = sortBasedOnDOMPosition(renderedItems);
    privateStore.setState("renderedItems", sortedItems);
    collection.setState("renderedItems", sortedItems);
  };
  setup(collection, () => init(privateStore));
  setup(privateStore, () => {
    return batch(privateStore, ["items"], (state) => {
      collection.setState("items", state.items);
    });
  });
  setup(privateStore, () => {
    return batch(privateStore, ["renderedItems"], (state) => {
      let firstRun = true;
      let raf = requestAnimationFrame(() => {
        const { renderedItems } = collection.getState();
        if (state.renderedItems === renderedItems)
          return;
        sortItems(state.renderedItems);
      });
      if (typeof IntersectionObserver !== "function") {
        return () => cancelAnimationFrame(raf);
      }
      const ioCallback = () => {
        if (firstRun) {
          firstRun = false;
          return;
        }
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => sortItems(state.renderedItems));
      };
      const root = getCommonParent(state.renderedItems);
      const observer = new IntersectionObserver(ioCallback, { root });
      for (const item of state.renderedItems) {
        if (!item.element)
          continue;
        observer.observe(item.element);
      }
      return () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
      };
    });
  });
  const mergeItem = (item, setItems, canDeleteFromMap = false) => {
    let prevItem;
    setItems((items2) => {
      const index = items2.findIndex(({ id }) => id === item.id);
      const nextItems = items2.slice();
      if (index !== -1) {
        prevItem = items2[index];
        const nextItem = __spreadValues2(__spreadValues2({}, prevItem), item);
        nextItems[index] = nextItem;
        itemsMap.set(item.id, nextItem);
      } else {
        nextItems.push(item);
        itemsMap.set(item.id, item);
      }
      return nextItems;
    });
    const unmergeItem = () => {
      setItems((items2) => {
        if (!prevItem) {
          if (canDeleteFromMap) {
            itemsMap.delete(item.id);
          }
          return items2.filter(({ id }) => id !== item.id);
        }
        const index = items2.findIndex(({ id }) => id === item.id);
        if (index === -1)
          return items2;
        const nextItems = items2.slice();
        nextItems[index] = prevItem;
        itemsMap.set(item.id, prevItem);
        return nextItems;
      });
    };
    return unmergeItem;
  };
  const registerItem = (item) => mergeItem(
    item,
    (getItems) => privateStore.setState("items", getItems),
    true
  );
  return __spreadProps2(__spreadValues2({}, collection), {
    registerItem,
    renderItem: (item) => chain(
      registerItem(item),
      mergeItem(
        item,
        (getItems) => privateStore.setState("renderedItems", getItems)
      )
    ),
    item: (id) => {
      if (!id)
        return null;
      let item = itemsMap.get(id);
      if (!item) {
        const { items: items2 } = collection.getState();
        item = items2.find((item2) => item2.id === id);
        if (item) {
          itemsMap.set(id, item);
        }
      }
      return item || null;
    },
    // @ts-expect-error Internal
    __unstablePrivateStore: privateStore
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/TCAGH6BH.js
function useCollectionStoreProps(store, update, props) {
  useUpdateEffect(update, [props.store]);
  useStoreProps(store, props, "items", "setItems");
  return store;
}
function useCollectionStore(props = {}) {
  const [store, update] = useStore(createCollectionStore, props);
  return useCollectionStoreProps(store, update, props);
}

// node_modules/@ariakit/core/esm/__chunks/7PRQYBBV.js
function toArray(arg) {
  if (Array.isArray(arg)) {
    return arg;
  }
  return typeof arg !== "undefined" ? [arg] : [];
}
function flatten2DArray(array) {
  const flattened = [];
  for (const row of array) {
    flattened.push(...row);
  }
  return flattened;
}
function reverseArray(array) {
  return array.slice().reverse();
}

// node_modules/@ariakit/core/esm/__chunks/D7EIQZAU.js
var NULL_ITEM = { id: null };
function findFirstEnabledItem(items, excludeId) {
  return items.find((item) => {
    if (excludeId) {
      return !item.disabled && item.id !== excludeId;
    }
    return !item.disabled;
  });
}
function getEnabledItems(items, excludeId) {
  return items.filter((item) => {
    if (excludeId) {
      return !item.disabled && item.id !== excludeId;
    }
    return !item.disabled;
  });
}
function getOppositeOrientation(orientation) {
  if (orientation === "vertical")
    return "horizontal";
  if (orientation === "horizontal")
    return "vertical";
  return;
}
function getItemsInRow(items, rowId) {
  return items.filter((item) => item.rowId === rowId);
}
function flipItems(items, activeId, shouldInsertNullItem = false) {
  const index = items.findIndex((item) => item.id === activeId);
  return [
    ...items.slice(index + 1),
    ...shouldInsertNullItem ? [NULL_ITEM] : [],
    ...items.slice(0, index)
  ];
}
function groupItemsByRows(items) {
  const rows = [];
  for (const item of items) {
    const row = rows.find((currentRow) => {
      var _a;
      return ((_a = currentRow[0]) == null ? void 0 : _a.rowId) === item.rowId;
    });
    if (row) {
      row.push(item);
    } else {
      rows.push([item]);
    }
  }
  return rows;
}
function getMaxRowLength(array) {
  let maxLength = 0;
  for (const { length } of array) {
    if (length > maxLength) {
      maxLength = length;
    }
  }
  return maxLength;
}
function createEmptyItem(rowId) {
  return {
    id: "__EMPTY_ITEM__",
    disabled: true,
    rowId
  };
}
function normalizeRows(rows, activeId, focusShift) {
  const maxLength = getMaxRowLength(rows);
  for (const row of rows) {
    for (let i = 0; i < maxLength; i += 1) {
      const item = row[i];
      if (!item || focusShift && item.disabled) {
        const isFirst = i === 0;
        const previousItem = isFirst && focusShift ? findFirstEnabledItem(row) : row[i - 1];
        row[i] = previousItem && activeId !== previousItem.id && focusShift ? previousItem : createEmptyItem(previousItem == null ? void 0 : previousItem.rowId);
      }
    }
  }
  return rows;
}
function verticalizeItems(items) {
  const rows = groupItemsByRows(items);
  const maxLength = getMaxRowLength(rows);
  const verticalized = [];
  for (let i = 0; i < maxLength; i += 1) {
    for (const row of rows) {
      const item = row[i];
      if (item) {
        verticalized.push(__spreadProps2(__spreadValues2({}, item), {
          // If there's no rowId, it means that it's not a grid composite, but
          // a single row instead. So, instead of verticalizing it, that is,
          // assigning a different rowId based on the column index, we keep it
          // undefined so they will be part of the same row. This is useful
          // when using up/down on one-dimensional composites.
          rowId: item.rowId ? `${i}` : void 0
        }));
      }
    }
  }
  return verticalized;
}
function createCompositeStore(props = {}) {
  var _a;
  const syncState = (_a = props.store) == null ? void 0 : _a.getState();
  const collection = createCollectionStore(props);
  const activeId = defaultValue(
    props.activeId,
    syncState == null ? void 0 : syncState.activeId,
    props.defaultActiveId
  );
  const initialState = __spreadProps2(__spreadValues2({}, collection.getState()), {
    activeId,
    baseElement: defaultValue(syncState == null ? void 0 : syncState.baseElement, null),
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState == null ? void 0 : syncState.includesBaseElement,
      activeId === null
    ),
    moves: defaultValue(syncState == null ? void 0 : syncState.moves, 0),
    orientation: defaultValue(
      props.orientation,
      syncState == null ? void 0 : syncState.orientation,
      "both"
    ),
    rtl: defaultValue(props.rtl, syncState == null ? void 0 : syncState.rtl, false),
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState == null ? void 0 : syncState.virtualFocus,
      false
    ),
    focusLoop: defaultValue(props.focusLoop, syncState == null ? void 0 : syncState.focusLoop, false),
    focusWrap: defaultValue(props.focusWrap, syncState == null ? void 0 : syncState.focusWrap, false),
    focusShift: defaultValue(props.focusShift, syncState == null ? void 0 : syncState.focusShift, false)
  });
  const composite = createStore(initialState, collection, props.store);
  setup(
    composite,
    () => sync(composite, ["renderedItems", "activeId"], (state) => {
      composite.setState("activeId", (activeId2) => {
        var _a2;
        if (activeId2 !== void 0)
          return activeId2;
        return (_a2 = findFirstEnabledItem(state.renderedItems)) == null ? void 0 : _a2.id;
      });
    })
  );
  const getNextId = (items, orientation, hasNullItem, skip) => {
    var _a2, _b;
    const { activeId: activeId2, rtl, focusLoop, focusWrap, includesBaseElement } = composite.getState();
    const isHorizontal = orientation !== "vertical";
    const isRTL2 = rtl && isHorizontal;
    const allItems = isRTL2 ? reverseArray(items) : items;
    if (activeId2 == null) {
      return (_a2 = findFirstEnabledItem(allItems)) == null ? void 0 : _a2.id;
    }
    const activeItem = allItems.find((item) => item.id === activeId2);
    if (!activeItem) {
      return (_b = findFirstEnabledItem(allItems)) == null ? void 0 : _b.id;
    }
    const isGrid2 = !!activeItem.rowId;
    const activeIndex = allItems.indexOf(activeItem);
    const nextItems = allItems.slice(activeIndex + 1);
    const nextItemsInRow = getItemsInRow(nextItems, activeItem.rowId);
    if (skip !== void 0) {
      const nextEnabledItemsInRow = getEnabledItems(nextItemsInRow, activeId2);
      const nextItem2 = nextEnabledItemsInRow.slice(skip)[0] || // If we can't find an item, just return the last one.
      nextEnabledItemsInRow[nextEnabledItemsInRow.length - 1];
      return nextItem2 == null ? void 0 : nextItem2.id;
    }
    const oppositeOrientation = getOppositeOrientation(
      // If it's a grid and orientation is not set, it's a next/previous call,
      // which is inherently horizontal. up/down will call next with orientation
      // set to vertical by default (see below on up/down methods).
      isGrid2 ? orientation || "horizontal" : orientation
    );
    const canLoop = focusLoop && focusLoop !== oppositeOrientation;
    const canWrap = isGrid2 && focusWrap && focusWrap !== oppositeOrientation;
    hasNullItem = hasNullItem || !isGrid2 && canLoop && includesBaseElement;
    if (canLoop) {
      const loopItems = canWrap && !hasNullItem ? allItems : getItemsInRow(allItems, activeItem.rowId);
      const sortedItems = flipItems(loopItems, activeId2, hasNullItem);
      const nextItem2 = findFirstEnabledItem(sortedItems, activeId2);
      return nextItem2 == null ? void 0 : nextItem2.id;
    }
    if (canWrap) {
      const nextItem2 = findFirstEnabledItem(
        // We can use nextItems, which contains all the next items, including
        // items from other rows, to wrap between rows. However, if there is a
        // null item (the composite container), we'll only use the next items in
        // the row. So moving next from the last item will focus on the
        // composite container. On grid composites, horizontal navigation never
        // focuses on the composite container, only vertical.
        hasNullItem ? nextItemsInRow : nextItems,
        activeId2
      );
      const nextId = hasNullItem ? (nextItem2 == null ? void 0 : nextItem2.id) || null : nextItem2 == null ? void 0 : nextItem2.id;
      return nextId;
    }
    const nextItem = findFirstEnabledItem(nextItemsInRow, activeId2);
    if (!nextItem && hasNullItem) {
      return null;
    }
    return nextItem == null ? void 0 : nextItem.id;
  };
  return __spreadProps2(__spreadValues2(__spreadValues2({}, collection), composite), {
    setBaseElement: (element) => composite.setState("baseElement", element),
    setActiveId: (id) => composite.setState("activeId", id),
    move: (id) => {
      if (id === void 0)
        return;
      composite.setState("activeId", id);
      composite.setState("moves", (moves) => moves + 1);
    },
    first: () => {
      var _a2;
      return (_a2 = findFirstEnabledItem(composite.getState().renderedItems)) == null ? void 0 : _a2.id;
    },
    last: () => {
      var _a2;
      return (_a2 = findFirstEnabledItem(reverseArray(composite.getState().renderedItems))) == null ? void 0 : _a2.id;
    },
    next: (skip) => {
      const { renderedItems, orientation } = composite.getState();
      return getNextId(renderedItems, orientation, false, skip);
    },
    previous: (skip) => {
      var _a2;
      const { renderedItems, orientation, includesBaseElement } = composite.getState();
      const isGrid2 = !!((_a2 = findFirstEnabledItem(renderedItems)) == null ? void 0 : _a2.rowId);
      const hasNullItem = !isGrid2 && includesBaseElement;
      return getNextId(
        reverseArray(renderedItems),
        orientation,
        hasNullItem,
        skip
      );
    },
    down: (skip) => {
      const {
        activeId: activeId2,
        renderedItems,
        focusShift,
        focusLoop,
        includesBaseElement
      } = composite.getState();
      const shouldShift = focusShift && !skip;
      const verticalItems = verticalizeItems(
        flatten2DArray(
          normalizeRows(groupItemsByRows(renderedItems), activeId2, shouldShift)
        )
      );
      const canLoop = focusLoop && focusLoop !== "horizontal";
      const hasNullItem = canLoop && includesBaseElement;
      return getNextId(verticalItems, "vertical", hasNullItem, skip);
    },
    up: (skip) => {
      const { activeId: activeId2, renderedItems, focusShift, includesBaseElement } = composite.getState();
      const shouldShift = focusShift && !skip;
      const verticalItems = verticalizeItems(
        reverseArray(
          flatten2DArray(
            normalizeRows(
              groupItemsByRows(renderedItems),
              activeId2,
              shouldShift
            )
          )
        )
      );
      const hasNullItem = includesBaseElement;
      return getNextId(verticalItems, "vertical", hasNullItem, skip);
    }
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/UVQLZ7T5.js
function useCompositeStoreProps(store, update, props) {
  store = useCollectionStoreProps(store, update, props);
  useStoreProps(store, props, "activeId", "setActiveId");
  useStoreProps(store, props, "includesBaseElement");
  useStoreProps(store, props, "virtualFocus");
  useStoreProps(store, props, "orientation");
  useStoreProps(store, props, "rtl");
  useStoreProps(store, props, "focusLoop");
  useStoreProps(store, props, "focusWrap");
  useStoreProps(store, props, "focusShift");
  return store;
}
function useCompositeStore(props = {}) {
  const [store, update] = useStore(createCompositeStore, props);
  return useCompositeStoreProps(store, update, props);
}

// node_modules/@ariakit/core/esm/__chunks/6E4KKOSB.js
function createDisclosureStore(props = {}) {
  const store = mergeStore(
    props.store,
    omit2(props.disclosure, ["contentElement", "disclosureElement"])
  );
  throwOnConflictingProps(props, store);
  const syncState = store == null ? void 0 : store.getState();
  const open = defaultValue(
    props.open,
    syncState == null ? void 0 : syncState.open,
    props.defaultOpen,
    false
  );
  const animated = defaultValue(props.animated, syncState == null ? void 0 : syncState.animated, false);
  const initialState = {
    open,
    animated,
    animating: !!animated && open,
    mounted: open,
    contentElement: defaultValue(syncState == null ? void 0 : syncState.contentElement, null),
    disclosureElement: defaultValue(syncState == null ? void 0 : syncState.disclosureElement, null)
  };
  const disclosure = createStore(initialState, store);
  setup(
    disclosure,
    () => sync(disclosure, ["animated", "animating"], (state) => {
      if (state.animated)
        return;
      disclosure.setState("animating", false);
    })
  );
  setup(
    disclosure,
    () => subscribe(disclosure, ["open"], () => {
      if (!disclosure.getState().animated)
        return;
      disclosure.setState("animating", true);
    })
  );
  setup(
    disclosure,
    () => sync(disclosure, ["open", "animating"], (state) => {
      disclosure.setState("mounted", state.open || state.animating);
    })
  );
  return __spreadProps2(__spreadValues2({}, disclosure), {
    disclosure: props.disclosure,
    setOpen: (value) => disclosure.setState("open", value),
    show: () => disclosure.setState("open", true),
    hide: () => disclosure.setState("open", false),
    toggle: () => disclosure.setState("open", (open2) => !open2),
    stopAnimation: () => disclosure.setState("animating", false),
    setContentElement: (value) => disclosure.setState("contentElement", value),
    setDisclosureElement: (value) => disclosure.setState("disclosureElement", value)
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/KGK2TTFO.js
function useDisclosureStoreProps(store, update, props) {
  useUpdateEffect(update, [props.store, props.disclosure]);
  useStoreProps(store, props, "open", "setOpen");
  useStoreProps(store, props, "mounted", "setMounted");
  useStoreProps(store, props, "animated");
  return Object.assign(store, { disclosure: props.disclosure });
}
function useDisclosureStore(props = {}) {
  const [store, update] = useStore(createDisclosureStore, props);
  return useDisclosureStoreProps(store, update, props);
}

// node_modules/@ariakit/core/esm/__chunks/YOHCVXJB.js
function createDialogStore(props = {}) {
  return createDisclosureStore(props);
}

// node_modules/@ariakit/react-core/esm/__chunks/QYS5FHDY.js
function useDialogStoreProps(store, update, props) {
  return useDisclosureStoreProps(store, update, props);
}
function useDialogStore(props = {}) {
  const [store, update] = useStore(createDialogStore, props);
  return useDialogStoreProps(store, update, props);
}

// node_modules/@ariakit/core/esm/__chunks/3UYWTADI.js
function createPopoverStore(_a = {}) {
  var _b = _a, {
    popover: otherPopover
  } = _b, props = __objRest2(_b, [
    "popover"
  ]);
  const store = mergeStore(
    props.store,
    omit2(otherPopover, [
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement"
    ])
  );
  throwOnConflictingProps(props, store);
  const syncState = store == null ? void 0 : store.getState();
  const dialog = createDialogStore(__spreadProps2(__spreadValues2({}, props), { store }));
  const placement = defaultValue(
    props.placement,
    syncState == null ? void 0 : syncState.placement,
    "bottom"
  );
  const initialState = __spreadProps2(__spreadValues2({}, dialog.getState()), {
    placement,
    currentPlacement: placement,
    anchorElement: defaultValue(syncState == null ? void 0 : syncState.anchorElement, null),
    popoverElement: defaultValue(syncState == null ? void 0 : syncState.popoverElement, null),
    arrowElement: defaultValue(syncState == null ? void 0 : syncState.arrowElement, null),
    rendered: Symbol("rendered")
  });
  const popover = createStore(initialState, dialog, store);
  return __spreadProps2(__spreadValues2(__spreadValues2({}, dialog), popover), {
    setAnchorElement: (element) => popover.setState("anchorElement", element),
    setPopoverElement: (element) => popover.setState("popoverElement", element),
    setArrowElement: (element) => popover.setState("arrowElement", element),
    render: () => popover.setState("rendered", Symbol("rendered"))
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/CBC47ZYL.js
function usePopoverStoreProps(store, update, props) {
  useUpdateEffect(update, [props.popover]);
  useStoreProps(store, props, "placement");
  return useDialogStoreProps(store, update, props);
}
function usePopoverStore(props = {}) {
  const [store, update] = useStore(createPopoverStore, props);
  return usePopoverStoreProps(store, update, props);
}

// node_modules/@ariakit/core/esm/combobox/combobox-store.js
var isTouchSafari = isSafari() && isTouchDevice();
function createComboboxStore(_a = {}) {
  var _b = _a, {
    tag
  } = _b, props = __objRest2(_b, [
    "tag"
  ]);
  const store = mergeStore(props.store, pick2(tag, ["value", "rtl"]));
  throwOnConflictingProps(props, store);
  const tagState = tag == null ? void 0 : tag.getState();
  const syncState = store == null ? void 0 : store.getState();
  const activeId = defaultValue(
    props.activeId,
    syncState == null ? void 0 : syncState.activeId,
    props.defaultActiveId,
    null
  );
  const composite = createCompositeStore(__spreadProps2(__spreadValues2({}, props), {
    activeId,
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState == null ? void 0 : syncState.includesBaseElement,
      true
    ),
    orientation: defaultValue(
      props.orientation,
      syncState == null ? void 0 : syncState.orientation,
      "vertical"
    ),
    focusLoop: defaultValue(props.focusLoop, syncState == null ? void 0 : syncState.focusLoop, true),
    focusWrap: defaultValue(props.focusWrap, syncState == null ? void 0 : syncState.focusWrap, true),
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState == null ? void 0 : syncState.virtualFocus,
      true
    )
  }));
  const popover = createPopoverStore(__spreadProps2(__spreadValues2({}, props), {
    placement: defaultValue(
      props.placement,
      syncState == null ? void 0 : syncState.placement,
      "bottom-start"
    )
  }));
  const value = defaultValue(
    props.value,
    syncState == null ? void 0 : syncState.value,
    props.defaultValue,
    ""
  );
  const selectedValue = defaultValue(
    props.selectedValue,
    syncState == null ? void 0 : syncState.selectedValue,
    tagState == null ? void 0 : tagState.values,
    props.defaultSelectedValue,
    ""
  );
  const multiSelectable = Array.isArray(selectedValue);
  const initialState = __spreadProps2(__spreadValues2(__spreadValues2({}, composite.getState()), popover.getState()), {
    value,
    selectedValue,
    resetValueOnSelect: defaultValue(
      props.resetValueOnSelect,
      syncState == null ? void 0 : syncState.resetValueOnSelect,
      multiSelectable
    ),
    resetValueOnHide: defaultValue(
      props.resetValueOnHide,
      syncState == null ? void 0 : syncState.resetValueOnHide,
      multiSelectable && !tag
    ),
    activeValue: syncState == null ? void 0 : syncState.activeValue
  });
  const combobox = createStore(initialState, composite, popover, store);
  if (isTouchSafari) {
    setup(
      combobox,
      () => sync(combobox, ["virtualFocus"], () => {
        combobox.setState("virtualFocus", false);
      })
    );
  }
  setup(combobox, () => {
    if (!tag)
      return;
    return chain(
      sync(combobox, ["selectedValue"], (state) => {
        if (!Array.isArray(state.selectedValue))
          return;
        tag.setValues(state.selectedValue);
      }),
      sync(tag, ["values"], (state) => {
        combobox.setState("selectedValue", state.values);
      })
    );
  });
  setup(
    combobox,
    () => sync(combobox, ["resetValueOnHide", "mounted"], (state) => {
      if (!state.resetValueOnHide)
        return;
      if (state.mounted)
        return;
      combobox.setState("value", value);
    })
  );
  setup(
    combobox,
    () => sync(combobox, ["open"], (state) => {
      if (state.open)
        return;
      combobox.setState("activeId", activeId);
      combobox.setState("moves", 0);
    })
  );
  setup(
    combobox,
    () => sync(combobox, ["moves", "activeId"], (state, prevState) => {
      if (state.moves === prevState.moves) {
        combobox.setState("activeValue", void 0);
      }
    })
  );
  setup(
    combobox,
    () => batch(combobox, ["moves", "renderedItems"], (state, prev) => {
      if (state.moves === prev.moves)
        return;
      const { activeId: activeId2 } = combobox.getState();
      const activeItem = composite.item(activeId2);
      combobox.setState("activeValue", activeItem == null ? void 0 : activeItem.value);
    })
  );
  return __spreadProps2(__spreadValues2(__spreadValues2(__spreadValues2({}, popover), composite), combobox), {
    tag,
    setValue: (value2) => combobox.setState("value", value2),
    resetValue: () => combobox.setState("value", initialState.value),
    setSelectedValue: (selectedValue2) => combobox.setState("selectedValue", selectedValue2)
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/7BSNT25J.js
function useComboboxStoreProps(store, update, props) {
  useUpdateEffect(update, [props.tag]);
  useStoreProps(store, props, "value", "setValue");
  useStoreProps(store, props, "selectedValue", "setSelectedValue");
  useStoreProps(store, props, "resetValueOnHide");
  useStoreProps(store, props, "resetValueOnSelect");
  return Object.assign(
    useCompositeStoreProps(
      usePopoverStoreProps(store, update, props),
      update,
      props
    ),
    { tag: props.tag }
  );
}
function useComboboxStore(props = {}) {
  const tag = useTagContext();
  props = __spreadProps(__spreadValues({}, props), {
    tag: props.tag !== void 0 ? props.tag : tag
  });
  const [store, update] = useStore(createComboboxStore, props);
  return useComboboxStoreProps(store, update, props);
}

// node_modules/@ariakit/react-core/esm/__chunks/RGUP62TM.js
var ctx4 = createStoreContext();
var useDisclosureContext = ctx4.useContext;
var useDisclosureScopedContext = ctx4.useScopedContext;
var useDisclosureProviderContext = ctx4.useProviderContext;
var DisclosureContextProvider = ctx4.ContextProvider;
var DisclosureScopedContextProvider = ctx4.ScopedContextProvider;

// node_modules/@ariakit/react-core/esm/__chunks/DU4D3UCJ.js
var import_react5 = __toESM(require_react(), 1);
var ctx5 = createStoreContext(
  [DisclosureContextProvider],
  [DisclosureScopedContextProvider]
);
var useDialogContext = ctx5.useContext;
var useDialogScopedContext = ctx5.useScopedContext;
var useDialogProviderContext = ctx5.useProviderContext;
var DialogContextProvider = ctx5.ContextProvider;
var DialogScopedContextProvider = ctx5.ScopedContextProvider;
var DialogHeadingContext = (0, import_react5.createContext)(void 0);
var DialogDescriptionContext = (0, import_react5.createContext)(void 0);

// node_modules/@ariakit/react-core/esm/__chunks/54MGSIOI.js
var ctx6 = createStoreContext(
  [DialogContextProvider],
  [DialogScopedContextProvider]
);
var usePopoverContext = ctx6.useContext;
var usePopoverScopedContext = ctx6.useScopedContext;
var usePopoverProviderContext = ctx6.useProviderContext;
var PopoverContextProvider = ctx6.ContextProvider;
var PopoverScopedContextProvider = ctx6.ScopedContextProvider;

// node_modules/@ariakit/react-core/esm/__chunks/DWZ7E5TJ.js
var import_react6 = __toESM(require_react(), 1);
var ComboboxListRoleContext = (0, import_react6.createContext)(
  void 0
);
var ctx7 = createStoreContext(
  [PopoverContextProvider, CompositeContextProvider],
  [PopoverScopedContextProvider, CompositeScopedContextProvider]
);
var useComboboxContext = ctx7.useContext;
var useComboboxScopedContext = ctx7.useScopedContext;
var useComboboxProviderContext = ctx7.useProviderContext;
var ComboboxContextProvider = ctx7.ContextProvider;
var ComboboxScopedContextProvider = ctx7.ScopedContextProvider;
var ComboboxItemValueContext = (0, import_react6.createContext)(
  void 0
);
var ComboboxItemCheckedContext = (0, import_react6.createContext)(false);

// node_modules/@ariakit/react-core/esm/__chunks/74NFH3UH.js
var TagName = "div";
var usePopoverAnchor = createHook(
  function usePopoverAnchor2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = usePopoverProviderContext();
    store = store || context;
    props = __spreadProps(__spreadValues({}, props), {
      ref: useMergeRefs(store == null ? void 0 : store.setAnchorElement, props.ref)
    });
    return props;
  }
);
var PopoverAnchor = forwardRef2(function PopoverAnchor2(props) {
  const htmlProps = usePopoverAnchor(props);
  return createElement(TagName, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/5VQZOHHZ.js
var NULL_ITEM2 = { id: null };
function flipItems2(items, activeId, shouldInsertNullItem = false) {
  const index = items.findIndex((item) => item.id === activeId);
  return [
    ...items.slice(index + 1),
    ...shouldInsertNullItem ? [NULL_ITEM2] : [],
    ...items.slice(0, index)
  ];
}
function findFirstEnabledItem2(items, excludeId) {
  return items.find((item) => {
    if (excludeId) {
      return !item.disabled && item.id !== excludeId;
    }
    return !item.disabled;
  });
}
function getEnabledItem(store, id) {
  if (!id)
    return null;
  return store.item(id) || null;
}
function groupItemsByRows2(items) {
  const rows = [];
  for (const item of items) {
    const row = rows.find((currentRow) => {
      var _a;
      return ((_a = currentRow[0]) == null ? void 0 : _a.rowId) === item.rowId;
    });
    if (row) {
      row.push(item);
    } else {
      rows.push([item]);
    }
  }
  return rows;
}
function selectTextField(element, collapseToEnd = false) {
  if (isTextField(element)) {
    element.setSelectionRange(
      collapseToEnd ? element.value.length : 0,
      element.value.length
    );
  } else if (element.isContentEditable) {
    const selection = getDocument(element).getSelection();
    selection == null ? void 0 : selection.selectAllChildren(element);
    if (collapseToEnd) {
      selection == null ? void 0 : selection.collapseToEnd();
    }
  }
}
var FOCUS_SILENTLY = Symbol("FOCUS_SILENTLY");
function focusSilently(element) {
  element[FOCUS_SILENTLY] = true;
  element.focus({ preventScroll: true });
}
function silentlyFocused(element) {
  const isSilentlyFocused = element[FOCUS_SILENTLY];
  delete element[FOCUS_SILENTLY];
  return isSilentlyFocused;
}
function isItem(store, element, exclude) {
  if (!element)
    return false;
  if (element === exclude)
    return false;
  const item = store.item(element.id);
  if (!item)
    return false;
  if (exclude && item.element === exclude)
    return false;
  return true;
}

// node_modules/@ariakit/react-core/esm/__chunks/SWN3JYXT.js
var import_react7 = __toESM(require_react(), 1);
var FocusableContext = (0, import_react7.createContext)(true);

// node_modules/@ariakit/core/esm/utils/focus.js
var selector = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], summary, iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false'])";
function hasNegativeTabIndex(element) {
  const tabIndex = Number.parseInt(element.getAttribute("tabindex") || "0", 10);
  return tabIndex < 0;
}
function isFocusable(element) {
  if (!element.matches(selector))
    return false;
  if (!isVisible(element))
    return false;
  if (element.closest("[inert]"))
    return false;
  return true;
}
function isTabbable(element) {
  if (!isFocusable(element))
    return false;
  if (hasNegativeTabIndex(element))
    return false;
  if (!("form" in element))
    return true;
  if (!element.form)
    return true;
  if (element.checked)
    return true;
  if (element.type !== "radio")
    return true;
  const radioGroup = element.form.elements.namedItem(element.name);
  if (!radioGroup)
    return true;
  if (!("length" in radioGroup))
    return true;
  const activeElement = getActiveElement(element);
  if (!activeElement)
    return true;
  if (activeElement === element)
    return true;
  if (!("form" in activeElement))
    return true;
  if (activeElement.form !== element.form)
    return true;
  if (activeElement.name !== element.name)
    return true;
  return false;
}
function getAllFocusableIn(container, includeContainer) {
  const elements2 = Array.from(
    container.querySelectorAll(selector)
  );
  if (includeContainer) {
    elements2.unshift(container);
  }
  const focusableElements = elements2.filter(isFocusable);
  focusableElements.forEach((element, i) => {
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body;
      focusableElements.splice(i, 1, ...getAllFocusableIn(frameBody));
    }
  });
  return focusableElements;
}
function getAllTabbableIn(container, includeContainer, fallbackToFocusable) {
  const elements2 = Array.from(
    container.querySelectorAll(selector)
  );
  const tabbableElements = elements2.filter(isTabbable);
  if (includeContainer && isTabbable(container)) {
    tabbableElements.unshift(container);
  }
  tabbableElements.forEach((element, i) => {
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body;
      const allFrameTabbable = getAllTabbableIn(
        frameBody,
        false,
        fallbackToFocusable
      );
      tabbableElements.splice(i, 1, ...allFrameTabbable);
    }
  });
  if (!tabbableElements.length && fallbackToFocusable) {
    return elements2;
  }
  return tabbableElements;
}
function getFirstTabbableIn(container, includeContainer, fallbackToFocusable) {
  const [first] = getAllTabbableIn(
    container,
    includeContainer,
    fallbackToFocusable
  );
  return first || null;
}
function getNextTabbableIn(container, includeContainer, fallbackToFirst, fallbackToFocusable) {
  const activeElement = getActiveElement(container);
  const allFocusable = getAllFocusableIn(container, includeContainer);
  const activeIndex = allFocusable.indexOf(activeElement);
  const nextFocusableElements = allFocusable.slice(activeIndex + 1);
  return nextFocusableElements.find(isTabbable) || (fallbackToFirst ? allFocusable.find(isTabbable) : null) || (fallbackToFocusable ? nextFocusableElements[0] : null) || null;
}
function getNextTabbable(fallbackToFirst, fallbackToFocusable) {
  return getNextTabbableIn(
    document.body,
    false,
    fallbackToFirst,
    fallbackToFocusable
  );
}
function getPreviousTabbableIn(container, includeContainer, fallbackToLast, fallbackToFocusable) {
  const activeElement = getActiveElement(container);
  const allFocusable = getAllFocusableIn(container, includeContainer).reverse();
  const activeIndex = allFocusable.indexOf(activeElement);
  const previousFocusableElements = allFocusable.slice(activeIndex + 1);
  return previousFocusableElements.find(isTabbable) || (fallbackToLast ? allFocusable.find(isTabbable) : null) || (fallbackToFocusable ? previousFocusableElements[0] : null) || null;
}
function getPreviousTabbable(fallbackToFirst, fallbackToFocusable) {
  return getPreviousTabbableIn(
    document.body,
    false,
    fallbackToFirst,
    fallbackToFocusable
  );
}
function getClosestFocusable(element) {
  while (element && !isFocusable(element)) {
    element = element.closest(selector);
  }
  return element || null;
}
function hasFocus(element) {
  const activeElement = getActiveElement(element);
  if (!activeElement)
    return false;
  if (activeElement === element)
    return true;
  const activeDescendant = activeElement.getAttribute("aria-activedescendant");
  if (!activeDescendant)
    return false;
  return activeDescendant === element.id;
}
function hasFocusWithin(element) {
  const activeElement = getActiveElement(element);
  if (!activeElement)
    return false;
  if (contains(element, activeElement))
    return true;
  const activeDescendant = activeElement.getAttribute("aria-activedescendant");
  if (!activeDescendant)
    return false;
  if (!("id" in element))
    return false;
  if (activeDescendant === element.id)
    return true;
  return !!element.querySelector(`#${CSS.escape(activeDescendant)}`);
}
function focusIfNeeded(element) {
  if (!hasFocusWithin(element) && isFocusable(element)) {
    element.focus();
  }
}
function disableFocus(element) {
  var _a;
  const currentTabindex = (_a = element.getAttribute("tabindex")) != null ? _a : "";
  element.setAttribute("data-tabindex", currentTabindex);
  element.setAttribute("tabindex", "-1");
}
function disableFocusIn(container, includeContainer) {
  const tabbableElements = getAllTabbableIn(container, includeContainer);
  for (const element of tabbableElements) {
    disableFocus(element);
  }
}
function restoreFocusIn(container) {
  const elements2 = container.querySelectorAll("[data-tabindex]");
  const restoreTabIndex = (element) => {
    const tabindex = element.getAttribute("data-tabindex");
    element.removeAttribute("data-tabindex");
    if (tabindex) {
      element.setAttribute("tabindex", tabindex);
    } else {
      element.removeAttribute("tabindex");
    }
  };
  if (container.hasAttribute("data-tabindex")) {
    restoreTabIndex(container);
  }
  for (const element of elements2) {
    restoreTabIndex(element);
  }
}
function focusIntoView(element, options) {
  if (!("scrollIntoView" in element)) {
    element.focus();
  } else {
    element.focus({ preventScroll: true });
    element.scrollIntoView(__spreadValues2({ block: "nearest", inline: "nearest" }, options));
  }
}

// node_modules/@ariakit/react-core/esm/__chunks/OD7ALSX5.js
var import_react8 = __toESM(require_react(), 1);
var TagName2 = "div";
var isSafariBrowser = isSafari();
var alwaysFocusVisibleInputTypes = [
  "text",
  "search",
  "url",
  "tel",
  "email",
  "password",
  "number",
  "date",
  "month",
  "week",
  "time",
  "datetime",
  "datetime-local"
];
var safariFocusAncestorSymbol = Symbol("safariFocusAncestor");
function isSafariFocusAncestor(element) {
  if (!element)
    return false;
  return !!element[safariFocusAncestorSymbol];
}
function markSafariFocusAncestor(element, value) {
  if (!element)
    return;
  element[safariFocusAncestorSymbol] = value;
}
function isAlwaysFocusVisible(element) {
  const { tagName, readOnly, type } = element;
  if (tagName === "TEXTAREA" && !readOnly)
    return true;
  if (tagName === "SELECT" && !readOnly)
    return true;
  if (tagName === "INPUT" && !readOnly) {
    return alwaysFocusVisibleInputTypes.includes(type);
  }
  if (element.isContentEditable)
    return true;
  const role = element.getAttribute("role");
  if (role === "combobox" && element.dataset.name) {
    return true;
  }
  return false;
}
function getLabels(element) {
  if ("labels" in element) {
    return element.labels;
  }
  return null;
}
function isNativeCheckboxOrRadio(element) {
  const tagName = element.tagName.toLowerCase();
  if (tagName === "input" && element.type) {
    return element.type === "radio" || element.type === "checkbox";
  }
  return false;
}
function isNativeTabbable(tagName) {
  if (!tagName)
    return true;
  return tagName === "button" || tagName === "summary" || tagName === "input" || tagName === "select" || tagName === "textarea" || tagName === "a";
}
function supportsDisabledAttribute(tagName) {
  if (!tagName)
    return true;
  return tagName === "button" || tagName === "input" || tagName === "select" || tagName === "textarea";
}
function getTabIndex(focusable, trulyDisabled, nativeTabbable, supportsDisabled, tabIndexProp) {
  if (!focusable) {
    return tabIndexProp;
  }
  if (trulyDisabled) {
    if (nativeTabbable && !supportsDisabled) {
      return -1;
    }
    return;
  }
  if (nativeTabbable) {
    return tabIndexProp;
  }
  return tabIndexProp || 0;
}
function useDisableEvent(onEvent, disabled) {
  return useEvent((event) => {
    onEvent == null ? void 0 : onEvent(event);
    if (event.defaultPrevented)
      return;
    if (disabled) {
      event.stopPropagation();
      event.preventDefault();
    }
  });
}
var isKeyboardModality = true;
function onGlobalMouseDown(event) {
  const target = event.target;
  if (target && "hasAttribute" in target) {
    if (!target.hasAttribute("data-focus-visible")) {
      isKeyboardModality = false;
    }
  }
}
function onGlobalKeyDown(event) {
  if (event.metaKey)
    return;
  if (event.ctrlKey)
    return;
  if (event.altKey)
    return;
  isKeyboardModality = true;
}
var useFocusable = createHook(
  function useFocusable2(_a) {
    var _b = _a, {
      focusable = true,
      accessibleWhenDisabled,
      autoFocus,
      onFocusVisible
    } = _b, props = __objRest(_b, [
      "focusable",
      "accessibleWhenDisabled",
      "autoFocus",
      "onFocusVisible"
    ]);
    const ref = (0, import_react8.useRef)(null);
    (0, import_react8.useEffect)(() => {
      if (!focusable)
        return;
      addGlobalEventListener("mousedown", onGlobalMouseDown, true);
      addGlobalEventListener("keydown", onGlobalKeyDown, true);
    }, [focusable]);
    if (isSafariBrowser) {
      (0, import_react8.useEffect)(() => {
        if (!focusable)
          return;
        const element = ref.current;
        if (!element)
          return;
        if (!isNativeCheckboxOrRadio(element))
          return;
        const labels = getLabels(element);
        if (!labels)
          return;
        const onMouseUp = () => queueMicrotask(() => element.focus());
        for (const label of labels) {
          label.addEventListener("mouseup", onMouseUp);
        }
        return () => {
          for (const label of labels) {
            label.removeEventListener("mouseup", onMouseUp);
          }
        };
      }, [focusable]);
    }
    const disabled = focusable && disabledFromProps(props);
    const trulyDisabled = !!disabled && !accessibleWhenDisabled;
    const [focusVisible, setFocusVisible] = (0, import_react8.useState)(false);
    (0, import_react8.useEffect)(() => {
      if (!focusable)
        return;
      if (trulyDisabled && focusVisible) {
        setFocusVisible(false);
      }
    }, [focusable, trulyDisabled, focusVisible]);
    (0, import_react8.useEffect)(() => {
      if (!focusable)
        return;
      if (!focusVisible)
        return;
      const element = ref.current;
      if (!element)
        return;
      if (typeof IntersectionObserver === "undefined")
        return;
      const observer = new IntersectionObserver(() => {
        if (!isFocusable(element)) {
          setFocusVisible(false);
        }
      });
      observer.observe(element);
      return () => observer.disconnect();
    }, [focusable, focusVisible]);
    const onKeyPressCapture = useDisableEvent(
      props.onKeyPressCapture,
      disabled
    );
    const onMouseDownCapture = useDisableEvent(
      props.onMouseDownCapture,
      disabled
    );
    const onClickCapture = useDisableEvent(props.onClickCapture, disabled);
    const onMouseDownProp = props.onMouseDown;
    const onMouseDown = useEvent((event) => {
      onMouseDownProp == null ? void 0 : onMouseDownProp(event);
      if (event.defaultPrevented)
        return;
      if (!focusable)
        return;
      const element = event.currentTarget;
      if (!isSafariBrowser)
        return;
      if (isPortalEvent(event))
        return;
      if (!isButton(element) && !isNativeCheckboxOrRadio(element))
        return;
      let receivedFocus = false;
      const onFocus = () => {
        receivedFocus = true;
      };
      const options = { capture: true, once: true };
      element.addEventListener("focusin", onFocus, options);
      const focusableContainer = getClosestFocusable(element.parentElement);
      markSafariFocusAncestor(focusableContainer, true);
      queueBeforeEvent(element, "mouseup", () => {
        element.removeEventListener("focusin", onFocus, true);
        markSafariFocusAncestor(focusableContainer, false);
        if (receivedFocus)
          return;
        focusIfNeeded(element);
      });
    });
    const handleFocusVisible = (event, currentTarget) => {
      if (currentTarget) {
        event.currentTarget = currentTarget;
      }
      if (!focusable)
        return;
      const element = event.currentTarget;
      if (!element)
        return;
      if (!hasFocus(element))
        return;
      onFocusVisible == null ? void 0 : onFocusVisible(event);
      if (event.defaultPrevented)
        return;
      element.dataset.focusVisible = "true";
      setFocusVisible(true);
    };
    const onKeyDownCaptureProp = props.onKeyDownCapture;
    const onKeyDownCapture = useEvent((event) => {
      onKeyDownCaptureProp == null ? void 0 : onKeyDownCaptureProp(event);
      if (event.defaultPrevented)
        return;
      if (!focusable)
        return;
      if (focusVisible)
        return;
      if (event.metaKey)
        return;
      if (event.altKey)
        return;
      if (event.ctrlKey)
        return;
      if (!isSelfTarget(event))
        return;
      const element = event.currentTarget;
      const applyFocusVisible = () => handleFocusVisible(event, element);
      queueBeforeEvent(element, "focusout", applyFocusVisible);
    });
    const onFocusCaptureProp = props.onFocusCapture;
    const onFocusCapture = useEvent((event) => {
      onFocusCaptureProp == null ? void 0 : onFocusCaptureProp(event);
      if (event.defaultPrevented)
        return;
      if (!focusable)
        return;
      if (!isSelfTarget(event)) {
        setFocusVisible(false);
        return;
      }
      const element = event.currentTarget;
      const applyFocusVisible = () => handleFocusVisible(event, element);
      if (isKeyboardModality || isAlwaysFocusVisible(event.target)) {
        queueBeforeEvent(event.target, "focusout", applyFocusVisible);
      } else {
        setFocusVisible(false);
      }
    });
    const onBlurProp = props.onBlur;
    const onBlur = useEvent((event) => {
      onBlurProp == null ? void 0 : onBlurProp(event);
      if (!focusable)
        return;
      if (!isFocusEventOutside(event))
        return;
      setFocusVisible(false);
    });
    const autoFocusOnShow = (0, import_react8.useContext)(FocusableContext);
    const autoFocusRef = useEvent((element) => {
      if (!focusable)
        return;
      if (!autoFocus)
        return;
      if (!element)
        return;
      if (!autoFocusOnShow)
        return;
      queueMicrotask(() => {
        if (hasFocus(element))
          return;
        if (!isFocusable(element))
          return;
        element.focus();
      });
    });
    const tagName = useTagName(ref);
    const nativeTabbable = focusable && isNativeTabbable(tagName);
    const supportsDisabled = focusable && supportsDisabledAttribute(tagName);
    const styleProp = props.style;
    const style = (0, import_react8.useMemo)(() => {
      if (trulyDisabled) {
        return __spreadValues({ pointerEvents: "none" }, styleProp);
      }
      return styleProp;
    }, [trulyDisabled, styleProp]);
    props = __spreadProps(__spreadValues({
      "data-focus-visible": focusable && focusVisible || void 0,
      "data-autofocus": autoFocus || void 0,
      "aria-disabled": disabled || void 0
    }, props), {
      ref: useMergeRefs(ref, autoFocusRef, props.ref),
      style,
      tabIndex: getTabIndex(
        focusable,
        trulyDisabled,
        nativeTabbable,
        supportsDisabled,
        props.tabIndex
      ),
      disabled: supportsDisabled && trulyDisabled ? true : void 0,
      // TODO: Test Focusable contentEditable.
      contentEditable: disabled ? void 0 : props.contentEditable,
      onKeyPressCapture,
      onClickCapture,
      onMouseDownCapture,
      onMouseDown,
      onKeyDownCapture,
      onFocusCapture,
      onBlur
    });
    return removeUndefinedValues(props);
  }
);
var Focusable = forwardRef2(function Focusable2(props) {
  const htmlProps = useFocusable(props);
  return createElement(TagName2, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/2BDG6X5K.js
var import_react9 = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var TagName3 = "div";
function isGrid(items) {
  return items.some((item) => !!item.rowId);
}
function isPrintableKey(event) {
  const target = event.target;
  if (target && !isTextField(target))
    return false;
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey;
}
function isModifierKey(event) {
  return event.key === "Shift" || event.key === "Control" || event.key === "Alt" || event.key === "Meta";
}
function useKeyboardEventProxy(store, onKeyboardEvent, previousElementRef) {
  return useEvent((event) => {
    var _a;
    onKeyboardEvent == null ? void 0 : onKeyboardEvent(event);
    if (event.defaultPrevented)
      return;
    if (event.isPropagationStopped())
      return;
    if (!isSelfTarget(event))
      return;
    if (isModifierKey(event))
      return;
    if (isPrintableKey(event))
      return;
    const state = store.getState();
    const activeElement = (_a = getEnabledItem(store, state.activeId)) == null ? void 0 : _a.element;
    if (!activeElement)
      return;
    const _b = event, { view } = _b, eventInit = __objRest(_b, ["view"]);
    const previousElement = previousElementRef == null ? void 0 : previousElementRef.current;
    if (activeElement !== previousElement) {
      activeElement.focus();
    }
    if (!fireKeyboardEvent(activeElement, event.type, eventInit)) {
      event.preventDefault();
    }
    if (event.currentTarget.contains(activeElement)) {
      event.stopPropagation();
    }
  });
}
function findFirstEnabledItemInTheLastRow(items) {
  return findFirstEnabledItem2(
    flatten2DArray(reverseArray(groupItemsByRows2(items)))
  );
}
function useScheduleFocus(store) {
  const [scheduled, setScheduled] = (0, import_react9.useState)(false);
  const schedule = (0, import_react9.useCallback)(() => setScheduled(true), []);
  const activeItem = store.useState(
    (state) => getEnabledItem(store, state.activeId)
  );
  (0, import_react9.useEffect)(() => {
    const activeElement = activeItem == null ? void 0 : activeItem.element;
    if (!scheduled)
      return;
    if (!activeElement)
      return;
    setScheduled(false);
    activeElement.focus({ preventScroll: true });
  }, [activeItem, scheduled]);
  return schedule;
}
var useComposite = createHook(
  function useComposite2(_a) {
    var _b = _a, {
      store,
      composite = true,
      focusOnMove = composite,
      moveOnKeyPress = true
    } = _b, props = __objRest(_b, [
      "store",
      "composite",
      "focusOnMove",
      "moveOnKeyPress"
    ]);
    const context = useCompositeProviderContext();
    store = store || context;
    invariant(
      store,
      "Composite must receive a `store` prop or be wrapped in a CompositeProvider component."
    );
    const ref = (0, import_react9.useRef)(null);
    const previousElementRef = (0, import_react9.useRef)(null);
    const scheduleFocus = useScheduleFocus(store);
    const moves = store.useState("moves");
    const [, setBaseElement] = useTransactionState(
      composite ? store.setBaseElement : null
    );
    (0, import_react9.useEffect)(() => {
      var _a2;
      if (!store)
        return;
      if (!moves)
        return;
      if (!composite)
        return;
      if (!focusOnMove)
        return;
      const { activeId: activeId2 } = store.getState();
      const itemElement = (_a2 = getEnabledItem(store, activeId2)) == null ? void 0 : _a2.element;
      if (!itemElement)
        return;
      focusIntoView(itemElement);
    }, [store, moves, composite, focusOnMove]);
    useSafeLayoutEffect(() => {
      if (!store)
        return;
      if (!moves)
        return;
      if (!composite)
        return;
      const { baseElement, activeId: activeId2 } = store.getState();
      const isSelfAcive = activeId2 === null;
      if (!isSelfAcive)
        return;
      if (!baseElement)
        return;
      const previousElement = previousElementRef.current;
      previousElementRef.current = null;
      if (previousElement) {
        fireBlurEvent(previousElement, { relatedTarget: baseElement });
      }
      if (!hasFocus(baseElement)) {
        baseElement.focus();
      }
    }, [store, moves, composite]);
    const activeId = store.useState("activeId");
    const virtualFocus = store.useState("virtualFocus");
    useSafeLayoutEffect(() => {
      var _a2;
      if (!store)
        return;
      if (!composite)
        return;
      if (!virtualFocus)
        return;
      const previousElement = previousElementRef.current;
      previousElementRef.current = null;
      if (!previousElement)
        return;
      const activeElement = (_a2 = getEnabledItem(store, activeId)) == null ? void 0 : _a2.element;
      const relatedTarget = activeElement || getActiveElement(previousElement);
      if (relatedTarget === previousElement)
        return;
      fireBlurEvent(previousElement, { relatedTarget });
    }, [store, activeId, virtualFocus, composite]);
    const onKeyDownCapture = useKeyboardEventProxy(
      store,
      props.onKeyDownCapture,
      previousElementRef
    );
    const onKeyUpCapture = useKeyboardEventProxy(
      store,
      props.onKeyUpCapture,
      previousElementRef
    );
    const onFocusCaptureProp = props.onFocusCapture;
    const onFocusCapture = useEvent((event) => {
      onFocusCaptureProp == null ? void 0 : onFocusCaptureProp(event);
      if (event.defaultPrevented)
        return;
      if (!store)
        return;
      const { virtualFocus: virtualFocus2 } = store.getState();
      if (!virtualFocus2)
        return;
      const previousActiveElement = event.relatedTarget;
      const isSilentlyFocused = silentlyFocused(event.currentTarget);
      if (isSelfTarget(event) && isSilentlyFocused) {
        event.stopPropagation();
        previousElementRef.current = previousActiveElement;
      }
    });
    const onFocusProp = props.onFocus;
    const onFocus = useEvent((event) => {
      onFocusProp == null ? void 0 : onFocusProp(event);
      if (event.defaultPrevented)
        return;
      if (!composite)
        return;
      if (!store)
        return;
      const { relatedTarget } = event;
      const { virtualFocus: virtualFocus2 } = store.getState();
      if (virtualFocus2) {
        if (isSelfTarget(event) && !isItem(store, relatedTarget)) {
          queueMicrotask(scheduleFocus);
        }
      } else if (isSelfTarget(event)) {
        store.setActiveId(null);
      }
    });
    const onBlurCaptureProp = props.onBlurCapture;
    const onBlurCapture = useEvent((event) => {
      var _a2;
      onBlurCaptureProp == null ? void 0 : onBlurCaptureProp(event);
      if (event.defaultPrevented)
        return;
      if (!store)
        return;
      const { virtualFocus: virtualFocus2, activeId: activeId2 } = store.getState();
      if (!virtualFocus2)
        return;
      const activeElement = (_a2 = getEnabledItem(store, activeId2)) == null ? void 0 : _a2.element;
      const nextActiveElement = event.relatedTarget;
      const nextActiveElementIsItem = isItem(store, nextActiveElement);
      const previousElement = previousElementRef.current;
      previousElementRef.current = null;
      if (isSelfTarget(event) && nextActiveElementIsItem) {
        if (nextActiveElement === activeElement) {
          if (previousElement && previousElement !== nextActiveElement) {
            fireBlurEvent(previousElement, event);
          }
        } else if (activeElement) {
          fireBlurEvent(activeElement, event);
        } else if (previousElement) {
          fireBlurEvent(previousElement, event);
        }
        event.stopPropagation();
      } else {
        const targetIsItem = isItem(store, event.target);
        if (!targetIsItem && activeElement) {
          fireBlurEvent(activeElement, event);
        }
      }
    });
    const onKeyDownProp = props.onKeyDown;
    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);
    const onKeyDown = useEvent((event) => {
      var _a2;
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (event.defaultPrevented)
        return;
      if (!store)
        return;
      if (!isSelfTarget(event))
        return;
      const { orientation, items, renderedItems, activeId: activeId2 } = store.getState();
      const activeItem = getEnabledItem(store, activeId2);
      if ((_a2 = activeItem == null ? void 0 : activeItem.element) == null ? void 0 : _a2.isConnected)
        return;
      const isVertical = orientation !== "horizontal";
      const isHorizontal = orientation !== "vertical";
      const grid = isGrid(renderedItems);
      const isHorizontalKey = event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End";
      if (isHorizontalKey && isTextField(event.currentTarget))
        return;
      const up = () => {
        if (grid) {
          const item = items && findFirstEnabledItemInTheLastRow(items);
          return item == null ? void 0 : item.id;
        }
        return store == null ? void 0 : store.last();
      };
      const keyMap = {
        ArrowUp: (grid || isVertical) && up,
        ArrowRight: (grid || isHorizontal) && store.first,
        ArrowDown: (grid || isVertical) && store.first,
        ArrowLeft: (grid || isHorizontal) && store.last,
        Home: store.first,
        End: store.last,
        PageUp: store.first,
        PageDown: store.last
      };
      const action = keyMap[event.key];
      if (action) {
        const id = action();
        if (id !== void 0) {
          if (!moveOnKeyPressProp(event))
            return;
          event.preventDefault();
          store.move(id);
        }
      }
    });
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime2.jsx)(CompositeContextProvider, { value: store, children: element }),
      [store]
    );
    const activeDescendant = store.useState((state) => {
      var _a2;
      if (!store)
        return;
      if (!composite)
        return;
      if (!state.virtualFocus)
        return;
      return (_a2 = getEnabledItem(store, state.activeId)) == null ? void 0 : _a2.id;
    });
    props = __spreadProps(__spreadValues({
      "aria-activedescendant": activeDescendant
    }, props), {
      ref: useMergeRefs(ref, setBaseElement, props.ref),
      onKeyDownCapture,
      onKeyUpCapture,
      onFocusCapture,
      onFocus,
      onBlurCapture,
      onKeyDown
    });
    const focusable = store.useState(
      (state) => composite && (state.virtualFocus || state.activeId === null)
    );
    props = useFocusable(__spreadValues({ focusable }, props));
    return props;
  }
);
var Composite = forwardRef2(function Composite2(props) {
  const htmlProps = useComposite(props);
  return createElement(TagName3, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox.js
var import_react10 = __toESM(require_react());
var TagName4 = "input";
function isFirstItemAutoSelected(items, activeValue, autoSelect) {
  if (!autoSelect)
    return false;
  const firstItem = items.find((item) => !item.disabled && item.value);
  return (firstItem == null ? void 0 : firstItem.value) === activeValue;
}
function hasCompletionString(value, activeValue) {
  if (!activeValue)
    return false;
  if (value == null)
    return false;
  value = normalizeString(value);
  return activeValue.length > value.length && activeValue.toLowerCase().indexOf(value.toLowerCase()) === 0;
}
function isInputEvent(event) {
  return event.type === "input";
}
function isAriaAutoCompleteValue(value) {
  return value === "inline" || value === "list" || value === "both" || value === "none";
}
function getDefaultAutoSelectId(items) {
  const item = items.find((item2) => {
    var _a;
    if (item2.disabled)
      return false;
    return ((_a = item2.element) == null ? void 0 : _a.getAttribute("role")) !== "tab";
  });
  return item == null ? void 0 : item.id;
}
var useCombobox = createHook(
  function useCombobox2(_a) {
    var _b = _a, {
      store,
      focusable = true,
      autoSelect: autoSelectProp = false,
      getAutoSelectId,
      setValueOnChange,
      showMinLength = 0,
      showOnChange,
      showOnMouseDown,
      showOnClick = showOnMouseDown,
      showOnKeyDown,
      showOnKeyPress = showOnKeyDown,
      blurActiveItemOnClick,
      setValueOnClick = true,
      moveOnKeyPress = true,
      autoComplete = "list"
    } = _b, props = __objRest(_b, [
      "store",
      "focusable",
      "autoSelect",
      "getAutoSelectId",
      "setValueOnChange",
      "showMinLength",
      "showOnChange",
      "showOnMouseDown",
      "showOnClick",
      "showOnKeyDown",
      "showOnKeyPress",
      "blurActiveItemOnClick",
      "setValueOnClick",
      "moveOnKeyPress",
      "autoComplete"
    ]);
    const context = useComboboxProviderContext();
    store = store || context;
    invariant(
      store,
      "Combobox must receive a `store` prop or be wrapped in a ComboboxProvider component."
    );
    const ref = (0, import_react10.useRef)(null);
    const [valueUpdated, forceValueUpdate] = useForceUpdate();
    const canAutoSelectRef = (0, import_react10.useRef)(false);
    const composingRef = (0, import_react10.useRef)(false);
    const autoSelect = store.useState(
      (state) => state.virtualFocus && autoSelectProp
    );
    const inline2 = autoComplete === "inline" || autoComplete === "both";
    const [canInline, setCanInline] = (0, import_react10.useState)(inline2);
    useUpdateLayoutEffect(() => {
      if (!inline2)
        return;
      setCanInline(true);
    }, [inline2]);
    const storeValue = store.useState("value");
    const prevSelectedValueRef = (0, import_react10.useRef)();
    (0, import_react10.useEffect)(() => {
      return sync(store, ["selectedValue", "activeId"], (_, prev) => {
        prevSelectedValueRef.current = prev.selectedValue;
      });
    }, []);
    const inlineActiveValue = store.useState((state) => {
      var _a2;
      if (!inline2)
        return;
      if (!canInline)
        return;
      if (state.activeValue && Array.isArray(state.selectedValue)) {
        if (state.selectedValue.includes(state.activeValue))
          return;
        if ((_a2 = prevSelectedValueRef.current) == null ? void 0 : _a2.includes(state.activeValue))
          return;
      }
      return state.activeValue;
    });
    const items = store.useState("renderedItems");
    const open = store.useState("open");
    const contentElement = store.useState("contentElement");
    const value = (0, import_react10.useMemo)(() => {
      if (!inline2)
        return storeValue;
      if (!canInline)
        return storeValue;
      const firstItemAutoSelected = isFirstItemAutoSelected(
        items,
        inlineActiveValue,
        autoSelect
      );
      if (firstItemAutoSelected) {
        if (hasCompletionString(storeValue, inlineActiveValue)) {
          const slice = (inlineActiveValue == null ? void 0 : inlineActiveValue.slice(storeValue.length)) || "";
          return storeValue + slice;
        }
        return storeValue;
      }
      return inlineActiveValue || storeValue;
    }, [inline2, canInline, items, inlineActiveValue, autoSelect, storeValue]);
    (0, import_react10.useEffect)(() => {
      const element = ref.current;
      if (!element)
        return;
      const onCompositeItemMove = () => setCanInline(true);
      element.addEventListener("combobox-item-move", onCompositeItemMove);
      return () => {
        element.removeEventListener("combobox-item-move", onCompositeItemMove);
      };
    }, []);
    (0, import_react10.useEffect)(() => {
      if (!inline2)
        return;
      if (!canInline)
        return;
      if (!inlineActiveValue)
        return;
      const firstItemAutoSelected = isFirstItemAutoSelected(
        items,
        inlineActiveValue,
        autoSelect
      );
      if (!firstItemAutoSelected)
        return;
      if (!hasCompletionString(storeValue, inlineActiveValue))
        return;
      let cleanup = noop;
      queueMicrotask(() => {
        const element = ref.current;
        if (!element)
          return;
        const { start: prevStart, end: prevEnd } = getTextboxSelection(element);
        const nextStart = storeValue.length;
        const nextEnd = inlineActiveValue.length;
        setSelectionRange(element, nextStart, nextEnd);
        cleanup = () => {
          if (!hasFocus(element))
            return;
          const { start, end } = getTextboxSelection(element);
          if (start !== nextStart)
            return;
          if (end !== nextEnd)
            return;
          setSelectionRange(element, prevStart, prevEnd);
        };
      });
      return () => cleanup();
    }, [
      valueUpdated,
      inline2,
      canInline,
      inlineActiveValue,
      items,
      autoSelect,
      storeValue
    ]);
    const scrollingElementRef = (0, import_react10.useRef)(null);
    const getAutoSelectIdProp = useEvent(getAutoSelectId);
    const autoSelectIdRef = (0, import_react10.useRef)(null);
    (0, import_react10.useEffect)(() => {
      if (!open)
        return;
      if (!contentElement)
        return;
      const scrollingElement = getScrollingElement(contentElement);
      if (!scrollingElement)
        return;
      scrollingElementRef.current = scrollingElement;
      const onUserScroll = () => {
        canAutoSelectRef.current = false;
      };
      const onScroll = () => {
        if (!store)
          return;
        if (!canAutoSelectRef.current)
          return;
        const { activeId } = store.getState();
        if (activeId === null)
          return;
        if (activeId === autoSelectIdRef.current)
          return;
        canAutoSelectRef.current = false;
      };
      const options = { passive: true, capture: true };
      scrollingElement.addEventListener("wheel", onUserScroll, options);
      scrollingElement.addEventListener("touchmove", onUserScroll, options);
      scrollingElement.addEventListener("scroll", onScroll, options);
      return () => {
        scrollingElement.removeEventListener("wheel", onUserScroll, true);
        scrollingElement.removeEventListener("touchmove", onUserScroll, true);
        scrollingElement.removeEventListener("scroll", onScroll, true);
      };
    }, [open, contentElement, store]);
    useSafeLayoutEffect(() => {
      if (!storeValue)
        return;
      if (composingRef.current)
        return;
      canAutoSelectRef.current = true;
    }, [storeValue]);
    useSafeLayoutEffect(() => {
      if (autoSelect !== "always" && open)
        return;
      canAutoSelectRef.current = open;
    }, [autoSelect, open]);
    const resetValueOnSelect = store.useState("resetValueOnSelect");
    useUpdateEffect(() => {
      var _a2, _b2;
      const canAutoSelect = canAutoSelectRef.current;
      if (!store)
        return;
      if (!open)
        return;
      if ((!autoSelect || !canAutoSelect) && !resetValueOnSelect)
        return;
      const { baseElement, contentElement: contentElement2, activeId } = store.getState();
      if (baseElement && !hasFocus(baseElement))
        return;
      if (contentElement2 == null ? void 0 : contentElement2.hasAttribute("data-placing")) {
        const observer = new MutationObserver(forceValueUpdate);
        observer.observe(contentElement2, { attributeFilter: ["data-placing"] });
        return () => observer.disconnect();
      }
      if (autoSelect && canAutoSelect) {
        const userAutoSelectId = getAutoSelectIdProp(items);
        const autoSelectId = userAutoSelectId !== void 0 ? userAutoSelectId : (_a2 = getDefaultAutoSelectId(items)) != null ? _a2 : store.first();
        autoSelectIdRef.current = autoSelectId;
        store.move(autoSelectId != null ? autoSelectId : null);
      } else {
        const element = (_b2 = store.item(activeId)) == null ? void 0 : _b2.element;
        if (element && "scrollIntoView" in element) {
          element.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }
      return;
    }, [
      store,
      open,
      valueUpdated,
      storeValue,
      autoSelect,
      resetValueOnSelect,
      getAutoSelectIdProp,
      items
    ]);
    (0, import_react10.useEffect)(() => {
      if (!inline2)
        return;
      const combobox = ref.current;
      if (!combobox)
        return;
      const elements2 = [combobox, contentElement].filter(
        (value2) => !!value2
      );
      const onBlur2 = (event) => {
        if (elements2.every((el) => isFocusEventOutside(event, el))) {
          store == null ? void 0 : store.setValue(value);
        }
      };
      for (const element of elements2) {
        element.addEventListener("focusout", onBlur2);
      }
      return () => {
        for (const element of elements2) {
          element.removeEventListener("focusout", onBlur2);
        }
      };
    }, [inline2, contentElement, store, value]);
    const canShow = (event) => {
      const currentTarget = event.currentTarget;
      return currentTarget.value.length >= showMinLength;
    };
    const onChangeProp = props.onChange;
    const showOnChangeProp = useBooleanEvent(showOnChange != null ? showOnChange : canShow);
    const setValueOnChangeProp = useBooleanEvent(
      // If the combobox is combined with tags, the value will be set by the tag
      // input component.
      setValueOnChange != null ? setValueOnChange : !store.tag
    );
    const onChange = useEvent((event) => {
      onChangeProp == null ? void 0 : onChangeProp(event);
      if (event.defaultPrevented)
        return;
      if (!store)
        return;
      const currentTarget = event.currentTarget;
      const { value: value2, selectionStart, selectionEnd } = currentTarget;
      const nativeEvent = event.nativeEvent;
      canAutoSelectRef.current = true;
      if (isInputEvent(nativeEvent)) {
        if (nativeEvent.isComposing) {
          canAutoSelectRef.current = false;
          composingRef.current = true;
        }
        if (inline2) {
          const textInserted = nativeEvent.inputType === "insertText" || nativeEvent.inputType === "insertCompositionText";
          const caretAtEnd = selectionStart === value2.length;
          setCanInline(textInserted && caretAtEnd);
        }
      }
      if (setValueOnChangeProp(event)) {
        const isSameValue = value2 === store.getState().value;
        store.setValue(value2);
        queueMicrotask(() => {
          setSelectionRange(currentTarget, selectionStart, selectionEnd);
        });
        if (inline2 && autoSelect && isSameValue) {
          forceValueUpdate();
        }
      }
      if (showOnChangeProp(event)) {
        store.show();
      }
      if (!autoSelect || !canAutoSelectRef.current) {
        store.setActiveId(null);
      }
    });
    const onCompositionEndProp = props.onCompositionEnd;
    const onCompositionEnd = useEvent((event) => {
      canAutoSelectRef.current = true;
      composingRef.current = false;
      onCompositionEndProp == null ? void 0 : onCompositionEndProp(event);
      if (event.defaultPrevented)
        return;
      if (!autoSelect)
        return;
      forceValueUpdate();
    });
    const onMouseDownProp = props.onMouseDown;
    const blurActiveItemOnClickProp = useBooleanEvent(
      blurActiveItemOnClick != null ? blurActiveItemOnClick : () => !!(store == null ? void 0 : store.getState().includesBaseElement)
    );
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const showOnClickProp = useBooleanEvent(showOnClick != null ? showOnClick : canShow);
    const onMouseDown = useEvent((event) => {
      onMouseDownProp == null ? void 0 : onMouseDownProp(event);
      if (event.defaultPrevented)
        return;
      if (event.button)
        return;
      if (event.ctrlKey)
        return;
      if (!store)
        return;
      if (blurActiveItemOnClickProp(event)) {
        store.setActiveId(null);
      }
      if (setValueOnClickProp(event)) {
        store.setValue(value);
      }
      if (showOnClickProp(event)) {
        queueBeforeEvent(event.currentTarget, "mouseup", store.show);
      }
    });
    const onKeyDownProp = props.onKeyDown;
    const showOnKeyPressProp = useBooleanEvent(showOnKeyPress != null ? showOnKeyPress : canShow);
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (!event.repeat) {
        canAutoSelectRef.current = false;
      }
      if (event.defaultPrevented)
        return;
      if (event.ctrlKey)
        return;
      if (event.altKey)
        return;
      if (event.shiftKey)
        return;
      if (event.metaKey)
        return;
      if (!store)
        return;
      const { open: open2 } = store.getState();
      if (open2)
        return;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        if (showOnKeyPressProp(event)) {
          event.preventDefault();
          store.show();
        }
      }
    });
    const onBlurProp = props.onBlur;
    const onBlur = useEvent((event) => {
      canAutoSelectRef.current = false;
      onBlurProp == null ? void 0 : onBlurProp(event);
      if (event.defaultPrevented)
        return;
    });
    const id = useId(props.id);
    const ariaAutoComplete = isAriaAutoCompleteValue(autoComplete) ? autoComplete : void 0;
    const isActiveItem = store.useState((state) => state.activeId === null);
    props = __spreadProps(__spreadValues({
      id,
      role: "combobox",
      "aria-autocomplete": ariaAutoComplete,
      "aria-haspopup": getPopupRole(contentElement, "listbox"),
      "aria-expanded": open,
      "aria-controls": contentElement == null ? void 0 : contentElement.id,
      "data-active-item": isActiveItem || void 0,
      value
    }, props), {
      ref: useMergeRefs(ref, props.ref),
      onChange,
      onCompositionEnd,
      onMouseDown,
      onKeyDown,
      onBlur
    });
    props = useComposite(__spreadProps(__spreadValues({
      store,
      focusable
    }, props), {
      // Enable inline autocomplete when the user moves from the combobox input
      // to an item.
      moveOnKeyPress: (event) => {
        if (isFalsyBooleanCallback(moveOnKeyPress, event))
          return false;
        if (inline2)
          setCanInline(true);
        return true;
      }
    }));
    props = usePopoverAnchor(__spreadValues({ store }, props));
    return __spreadValues({ autoComplete: "off" }, props);
  }
);
var Combobox = forwardRef2(function Combobox2(props) {
  const htmlProps = useCombobox(props);
  return createElement(TagName4, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox-provider.js
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
function ComboboxProvider(props = {}) {
  const store = useComboboxStore(props);
  return (0, import_jsx_runtime3.jsx)(ComboboxContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/__chunks/HGP5L2ST.js
var import_react11 = __toESM(require_react(), 1);
var TagName5 = "button";
function isNativeClick(event) {
  if (!event.isTrusted)
    return false;
  const element = event.currentTarget;
  if (event.key === "Enter") {
    return isButton(element) || element.tagName === "SUMMARY" || element.tagName === "A";
  }
  if (event.key === " ") {
    return isButton(element) || element.tagName === "SUMMARY" || element.tagName === "INPUT" || element.tagName === "SELECT";
  }
  return false;
}
var symbol = Symbol("command");
var useCommand = createHook(
  function useCommand2(_a) {
    var _b = _a, { clickOnEnter = true, clickOnSpace = true } = _b, props = __objRest(_b, ["clickOnEnter", "clickOnSpace"]);
    const ref = (0, import_react11.useRef)(null);
    const tagName = useTagName(ref);
    const type = props.type;
    const [isNativeButton, setIsNativeButton] = (0, import_react11.useState)(
      () => !!tagName && isButton({ tagName, type })
    );
    (0, import_react11.useEffect)(() => {
      if (!ref.current)
        return;
      setIsNativeButton(isButton(ref.current));
    }, []);
    const [active, setActive] = (0, import_react11.useState)(false);
    const activeRef = (0, import_react11.useRef)(false);
    const disabled = disabledFromProps(props);
    const [isDuplicate, metadataProps] = useMetadataProps(props, symbol, true);
    const onKeyDownProp = props.onKeyDown;
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      const element = event.currentTarget;
      if (event.defaultPrevented)
        return;
      if (isDuplicate)
        return;
      if (disabled)
        return;
      if (!isSelfTarget(event))
        return;
      if (isTextField(element))
        return;
      if (element.isContentEditable)
        return;
      const isEnter = clickOnEnter && event.key === "Enter";
      const isSpace = clickOnSpace && event.key === " ";
      const shouldPreventEnter = event.key === "Enter" && !clickOnEnter;
      const shouldPreventSpace = event.key === " " && !clickOnSpace;
      if (shouldPreventEnter || shouldPreventSpace) {
        event.preventDefault();
        return;
      }
      if (isEnter || isSpace) {
        const nativeClick = isNativeClick(event);
        if (isEnter) {
          if (!nativeClick) {
            event.preventDefault();
            const _a2 = event, { view } = _a2, eventInit = __objRest(_a2, ["view"]);
            const click = () => fireClickEvent(element, eventInit);
            if (isFirefox()) {
              queueBeforeEvent(element, "keyup", click);
            } else {
              queueMicrotask(click);
            }
          }
        } else if (isSpace) {
          activeRef.current = true;
          if (!nativeClick) {
            event.preventDefault();
            setActive(true);
          }
        }
      }
    });
    const onKeyUpProp = props.onKeyUp;
    const onKeyUp = useEvent((event) => {
      onKeyUpProp == null ? void 0 : onKeyUpProp(event);
      if (event.defaultPrevented)
        return;
      if (isDuplicate)
        return;
      if (disabled)
        return;
      if (event.metaKey)
        return;
      const isSpace = clickOnSpace && event.key === " ";
      if (activeRef.current && isSpace) {
        activeRef.current = false;
        if (!isNativeClick(event)) {
          event.preventDefault();
          setActive(false);
          const element = event.currentTarget;
          const _a2 = event, { view } = _a2, eventInit = __objRest(_a2, ["view"]);
          queueMicrotask(() => fireClickEvent(element, eventInit));
        }
      }
    });
    props = __spreadProps(__spreadValues(__spreadValues({
      "data-active": active || void 0,
      type: isNativeButton ? "button" : void 0
    }, metadataProps), props), {
      ref: useMergeRefs(ref, props.ref),
      onKeyDown,
      onKeyUp
    });
    props = useFocusable(props);
    return props;
  }
);
var Command = forwardRef2(function Command2(props) {
  const htmlProps = useCommand(props);
  return createElement(TagName5, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/HVQRJDA5.js
var import_react12 = __toESM(require_react(), 1);
var TagName6 = "button";
var useButton = createHook(
  function useButton2(props) {
    const ref = (0, import_react12.useRef)(null);
    const tagName = useTagName(ref, TagName6);
    const [isNativeButton, setIsNativeButton] = (0, import_react12.useState)(
      () => !!tagName && isButton({ tagName, type: props.type })
    );
    (0, import_react12.useEffect)(() => {
      if (!ref.current)
        return;
      setIsNativeButton(isButton(ref.current));
    }, []);
    props = __spreadProps(__spreadValues({
      role: !isNativeButton && tagName !== "a" ? "button" : void 0
    }, props), {
      ref: useMergeRefs(ref, props.ref)
    });
    props = useCommand(props);
    return props;
  }
);
var Button = forwardRef2(function Button2(props) {
  const htmlProps = useButton(props);
  return createElement(TagName6, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox-cancel.js
var import_react13 = __toESM(require_react());
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
var TagName7 = "button";
var children = (0, import_jsx_runtime4.jsxs)(
  "svg",
  {
    "aria-hidden": "true",
    display: "block",
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    width: "1em",
    height: "1em",
    pointerEvents: "none",
    children: [
      (0, import_jsx_runtime4.jsx)("line", { x1: "5", y1: "5", x2: "11", y2: "11" }),
      (0, import_jsx_runtime4.jsx)("line", { x1: "5", y1: "11", x2: "11", y2: "5" })
    ]
  }
);
var useComboboxCancel = createHook(
  function useComboboxCancel2(_a) {
    var _b = _a, { store, hideWhenEmpty } = _b, props = __objRest(_b, ["store", "hideWhenEmpty"]);
    const context = useComboboxProviderContext();
    store = store || context;
    invariant(
      store,
      "ComboboxCancel must receive a `store` prop or be wrapped in a ComboboxProvider component."
    );
    const onClickProp = props.onClick;
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      store == null ? void 0 : store.setValue("");
      store == null ? void 0 : store.move(null);
    });
    const comboboxId = store.useState((state) => {
      var _a2;
      return (_a2 = state.baseElement) == null ? void 0 : _a2.id;
    });
    const empty = store.useState((state) => state.value === "");
    props = useWrapElement(
      props,
      (element) => {
        if (!hideWhenEmpty)
          return element;
        if (empty)
          return (0, import_jsx_runtime4.jsx)(import_react13.Fragment, {});
        return element;
      },
      [hideWhenEmpty, empty]
    );
    props = __spreadProps(__spreadValues({
      children,
      "aria-label": "Clear input",
      // This aria-controls will ensure the combobox popup remains visible when
      // this element gets focused. This logic is done in the ComboboxPopover
      // component.
      "aria-controls": comboboxId
    }, props), {
      onClick
    });
    props = useButton(props);
    return props;
  }
);
var ComboboxCancel = forwardRef2(function ComboboxCancel2(props) {
  const htmlProps = useComboboxCancel(props);
  return createElement(TagName7, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/WEUO55PT.js
var import_react14 = __toESM(require_react(), 1);
var TagName8 = "button";
var symbol2 = Symbol("disclosure");
var useDisclosure = createHook(
  function useDisclosure2(_a) {
    var _b = _a, { store, toggleOnClick = true } = _b, props = __objRest(_b, ["store", "toggleOnClick"]);
    const context = useDisclosureProviderContext();
    store = store || context;
    invariant(
      store,
      "Disclosure must receive a `store` prop or be wrapped in a DisclosureProvider component."
    );
    const ref = (0, import_react14.useRef)(null);
    const [expanded, setExpanded] = (0, import_react14.useState)(false);
    const disclosureElement = store.useState("disclosureElement");
    const open = store.useState("open");
    (0, import_react14.useEffect)(() => {
      let isCurrentDisclosure = disclosureElement === ref.current;
      if (!(disclosureElement == null ? void 0 : disclosureElement.isConnected)) {
        store == null ? void 0 : store.setDisclosureElement(ref.current);
        isCurrentDisclosure = true;
      }
      setExpanded(open && isCurrentDisclosure);
    }, [disclosureElement, store, open]);
    const onClickProp = props.onClick;
    const toggleOnClickProp = useBooleanEvent(toggleOnClick);
    const [isDuplicate, metadataProps] = useMetadataProps(props, symbol2, true);
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      if (isDuplicate)
        return;
      if (!toggleOnClickProp(event))
        return;
      store == null ? void 0 : store.setDisclosureElement(event.currentTarget);
      store == null ? void 0 : store.toggle();
    });
    const contentElement = store.useState("contentElement");
    props = __spreadProps(__spreadValues(__spreadValues({
      "aria-expanded": expanded,
      "aria-controls": contentElement == null ? void 0 : contentElement.id
    }, metadataProps), props), {
      ref: useMergeRefs(ref, props.ref),
      onClick
    });
    props = useButton(props);
    return props;
  }
);
var Disclosure = forwardRef2(function Disclosure2(props) {
  const htmlProps = useDisclosure(props);
  return createElement(TagName8, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/LNWM7V7G.js
var TagName9 = "button";
var useDialogDisclosure = createHook(
  function useDialogDisclosure2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useDialogProviderContext();
    store = store || context;
    invariant(
      store,
      "DialogDisclosure must receive a `store` prop or be wrapped in a DialogProvider component."
    );
    const contentElement = store.useState("contentElement");
    props = __spreadValues({
      "aria-haspopup": getPopupRole(contentElement, "dialog")
    }, props);
    props = useDisclosure(__spreadValues({ store }, props));
    return props;
  }
);
var DialogDisclosure = forwardRef2(function DialogDisclosure2(props) {
  const htmlProps = useDialogDisclosure(props);
  return createElement(TagName9, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox-disclosure.js
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
var TagName10 = "button";
var children2 = (0, import_jsx_runtime5.jsx)(
  "svg",
  {
    "aria-hidden": "true",
    display: "block",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    viewBox: "0 0 16 16",
    height: "1em",
    width: "1em",
    pointerEvents: "none",
    children: (0, import_jsx_runtime5.jsx)("polyline", { points: "4,6 8,10 12,6" })
  }
);
var useComboboxDisclosure = createHook(function useComboboxDisclosure2(_a) {
  var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
  const context = useComboboxProviderContext();
  store = store || context;
  invariant(
    store,
    "ComboboxDisclosure must receive a `store` prop or be wrapped in a ComboboxProvider component."
  );
  const onMouseDownProp = props.onMouseDown;
  const onMouseDown = useEvent((event) => {
    onMouseDownProp == null ? void 0 : onMouseDownProp(event);
    event.preventDefault();
    store == null ? void 0 : store.move(null);
  });
  const onClickProp = props.onClick;
  const onClick = useEvent((event) => {
    onClickProp == null ? void 0 : onClickProp(event);
    if (event.defaultPrevented)
      return;
    if (!store)
      return;
    const { baseElement } = store.getState();
    store.setDisclosureElement(baseElement);
  });
  const open = store.useState("open");
  props = __spreadProps(__spreadValues({
    children: children2,
    tabIndex: -1,
    "aria-label": open ? "Hide popup" : "Show popup",
    "aria-expanded": open
  }, props), {
    onMouseDown,
    onClick
  });
  props = useDialogDisclosure(__spreadValues({ store }, props));
  return props;
});
var ComboboxDisclosure = forwardRef2(function ComboboxDisclosure2(props) {
  const htmlProps = useComboboxDisclosure(props);
  return createElement(TagName10, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/7HVFURXT.js
var import_react15 = __toESM(require_react(), 1);
var GroupLabelContext = (0, import_react15.createContext)(void 0);

// node_modules/@ariakit/react-core/esm/__chunks/IGFP5YPG.js
var import_react16 = __toESM(require_react(), 1);
var TagName11 = "div";
var useGroupLabel = createHook(
  function useGroupLabel2(props) {
    const setLabelId = (0, import_react16.useContext)(GroupLabelContext);
    const id = useId(props.id);
    useSafeLayoutEffect(() => {
      setLabelId == null ? void 0 : setLabelId(id);
      return () => setLabelId == null ? void 0 : setLabelId(void 0);
    }, [setLabelId, id]);
    props = __spreadValues({
      id,
      "aria-hidden": true
    }, props);
    return removeUndefinedValues(props);
  }
);
var GroupLabel = forwardRef2(function GroupLabel2(props) {
  const htmlProps = useGroupLabel(props);
  return createElement(TagName11, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/Y2MAXF6C.js
var TagName12 = "div";
var useCompositeGroupLabel = createHook(function useCompositeGroupLabel2(_a) {
  var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
  props = useGroupLabel(props);
  return props;
});
var CompositeGroupLabel = forwardRef2(function CompositeGroupLabel2(props) {
  const htmlProps = useCompositeGroupLabel(props);
  return createElement(TagName12, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox-group-label.js
var TagName13 = "div";
var useComboboxGroupLabel = createHook(function useComboboxGroupLabel2(props) {
  props = useCompositeGroupLabel(props);
  return props;
});
var ComboboxGroupLabel = forwardRef2(function ComboboxGroupLabel2(props) {
  const htmlProps = useComboboxGroupLabel(props);
  return createElement(TagName13, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/ZPO4YZYE.js
var import_react17 = __toESM(require_react(), 1);
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var TagName14 = "div";
var useGroup = createHook(
  function useGroup2(props) {
    const [labelId, setLabelId] = (0, import_react17.useState)();
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime6.jsx)(GroupLabelContext.Provider, { value: setLabelId, children: element }),
      []
    );
    props = __spreadValues({
      role: "group",
      "aria-labelledby": labelId
    }, props);
    return removeUndefinedValues(props);
  }
);
var Group = forwardRef2(function Group2(props) {
  const htmlProps = useGroup(props);
  return createElement(TagName14, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/IEKMDIUY.js
var TagName15 = "div";
var useCompositeGroup = createHook(
  function useCompositeGroup2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    props = useGroup(props);
    return props;
  }
);
var CompositeGroup = forwardRef2(function CompositeGroup2(props) {
  const htmlProps = useCompositeGroup(props);
  return createElement(TagName15, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox-group.js
var TagName16 = "div";
var useComboboxGroup = createHook(
  function useComboboxGroup2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useComboboxScopedContext();
    store = store || context;
    invariant(
      store,
      "ComboboxRow must be wrapped in a ComboboxList or ComboboxPopover component"
    );
    const contentElement = store.useState("contentElement");
    const popupRole = getPopupRole(contentElement);
    if (popupRole === "grid") {
      props = __spreadValues({ role: "rowgroup" }, props);
    }
    props = useCompositeGroup(__spreadValues({ store }, props));
    return props;
  }
);
var ComboboxGroup = forwardRef2(function ComboboxGroup2(props) {
  const htmlProps = useComboboxGroup(props);
  return createElement(TagName16, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/EYKMH5G5.js
var import_react18 = __toESM(require_react(), 1);
var CheckboxCheckedContext = (0, import_react18.createContext)(false);

// node_modules/@ariakit/react-core/esm/__chunks/RPLYUYNN.js
var import_react19 = __toESM(require_react(), 1);
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var TagName17 = "span";
var checkmark = (0, import_jsx_runtime7.jsx)(
  "svg",
  {
    display: "block",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    viewBox: "0 0 16 16",
    height: "1em",
    width: "1em",
    children: (0, import_jsx_runtime7.jsx)("polyline", { points: "4,8 7,12 12,4" })
  }
);
function getChildren(props) {
  if (props.checked) {
    return props.children || checkmark;
  }
  if (typeof props.children === "function") {
    return props.children;
  }
  return null;
}
var useCheckboxCheck = createHook(
  function useCheckboxCheck2(_a) {
    var _b = _a, { store, checked } = _b, props = __objRest(_b, ["store", "checked"]);
    const context = (0, import_react19.useContext)(CheckboxCheckedContext);
    checked = checked != null ? checked : context;
    const children3 = getChildren({ checked, children: props.children });
    props = __spreadProps(__spreadValues({
      "aria-hidden": true
    }, props), {
      children: children3,
      style: __spreadValues({
        width: "1em",
        height: "1em",
        pointerEvents: "none"
      }, props.style)
    });
    return removeUndefinedValues(props);
  }
);
var CheckboxCheck = forwardRef2(function CheckboxCheck2(props) {
  const htmlProps = useCheckboxCheck(props);
  return createElement(TagName17, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox-item-check.js
var import_react20 = __toESM(require_react());
var TagName18 = "span";
var useComboboxItemCheck = createHook(function useComboboxItemCheck2(_a) {
  var _b = _a, { store, checked } = _b, props = __objRest(_b, ["store", "checked"]);
  const context = (0, import_react20.useContext)(ComboboxItemCheckedContext);
  checked = checked != null ? checked : context;
  props = useCheckboxCheck(__spreadProps(__spreadValues({}, props), { checked }));
  return props;
});
var ComboboxItemCheck = forwardRef2(function ComboboxItemCheck2(props) {
  const htmlProps = useComboboxItemCheck(props);
  return createElement(TagName18, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox-item-value.js
var import_react21 = __toESM(require_react());
var import_jsx_runtime8 = __toESM(require_jsx_runtime());
var TagName19 = "span";
function normalizeValue(value) {
  return normalizeString(value).toLowerCase();
}
function getOffsets(string, values) {
  const offsets = [];
  for (const value of values) {
    let pos = 0;
    const length = value.length;
    while (string.indexOf(value, pos) !== -1) {
      const index = string.indexOf(value, pos);
      if (index !== -1) {
        offsets.push([index, length]);
      }
      pos = index + 1;
    }
  }
  return offsets;
}
function filterOverlappingOffsets(offsets) {
  return offsets.filter(([offset3, length], i, arr) => {
    return !arr.some(
      ([o, l], j) => j !== i && o <= offset3 && o + l >= offset3 + length
    );
  });
}
function sortOffsets(offsets) {
  return offsets.sort(([a], [b]) => a - b);
}
function splitValue(itemValue, userValue) {
  if (!itemValue)
    return itemValue;
  if (!userValue)
    return itemValue;
  const userValues = toArray(userValue).filter(Boolean).map(normalizeValue);
  const parts = [];
  const span = (value, autocomplete = false) => (0, import_jsx_runtime8.jsx)(
    "span",
    {
      "data-autocomplete-value": autocomplete ? "" : void 0,
      "data-user-value": autocomplete ? void 0 : "",
      children: value
    },
    parts.length
  );
  const offsets = sortOffsets(
    filterOverlappingOffsets(
      // Convert userValues into a set to avoid duplicates
      getOffsets(normalizeValue(itemValue), new Set(userValues))
    )
  );
  if (!offsets.length) {
    parts.push(span(itemValue, true));
    return parts;
  }
  const [firstOffset] = offsets[0];
  const values = [
    itemValue.slice(0, firstOffset),
    ...offsets.flatMap(([offset3, length], i) => {
      var _a;
      const value = itemValue.slice(offset3, offset3 + length);
      const nextOffset = (_a = offsets[i + 1]) == null ? void 0 : _a[0];
      const nextValue = itemValue.slice(offset3 + length, nextOffset);
      return [value, nextValue];
    })
  ];
  values.forEach((value, i) => {
    if (!value)
      return;
    parts.push(span(value, i % 2 === 0));
  });
  return parts;
}
var useComboboxItemValue = createHook(function useComboboxItemValue2(_a) {
  var _b = _a, { store, value, userValue } = _b, props = __objRest(_b, ["store", "value", "userValue"]);
  const context = useComboboxScopedContext();
  store = store || context;
  const itemContext = (0, import_react21.useContext)(ComboboxItemValueContext);
  const itemValue = value != null ? value : itemContext;
  const inputValue = useStoreState(store, (state) => userValue != null ? userValue : state == null ? void 0 : state.value);
  const children3 = (0, import_react21.useMemo)(() => {
    if (!itemValue)
      return;
    if (!inputValue)
      return itemValue;
    return splitValue(itemValue, inputValue);
  }, [itemValue, inputValue]);
  props = __spreadValues({
    children: children3
  }, props);
  return removeUndefinedValues(props);
});
var ComboboxItemValue = forwardRef2(function ComboboxItemValue2(props) {
  const htmlProps = useComboboxItemValue(props);
  return createElement(TagName19, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/OBZMLI6J.js
var import_react22 = __toESM(require_react(), 1);
var TagName20 = "div";
function getMouseDestination(event) {
  const relatedTarget = event.relatedTarget;
  if ((relatedTarget == null ? void 0 : relatedTarget.nodeType) === Node.ELEMENT_NODE) {
    return relatedTarget;
  }
  return null;
}
function hoveringInside(event) {
  const nextElement = getMouseDestination(event);
  if (!nextElement)
    return false;
  return contains(event.currentTarget, nextElement);
}
var symbol3 = Symbol("composite-hover");
function movingToAnotherItem(event) {
  let dest = getMouseDestination(event);
  if (!dest)
    return false;
  do {
    if (hasOwnProperty(dest, symbol3) && dest[symbol3])
      return true;
    dest = dest.parentElement;
  } while (dest);
  return false;
}
var useCompositeHover = createHook(
  function useCompositeHover2(_a) {
    var _b = _a, {
      store,
      focusOnHover = true,
      blurOnHoverEnd = !!focusOnHover
    } = _b, props = __objRest(_b, [
      "store",
      "focusOnHover",
      "blurOnHoverEnd"
    ]);
    const context = useCompositeContext();
    store = store || context;
    invariant(
      store,
      "CompositeHover must be wrapped in a Composite component."
    );
    const isMouseMoving = useIsMouseMoving();
    const onMouseMoveProp = props.onMouseMove;
    const focusOnHoverProp = useBooleanEvent(focusOnHover);
    const onMouseMove = useEvent((event) => {
      onMouseMoveProp == null ? void 0 : onMouseMoveProp(event);
      if (event.defaultPrevented)
        return;
      if (!isMouseMoving())
        return;
      if (!focusOnHoverProp(event))
        return;
      if (!hasFocusWithin(event.currentTarget)) {
        const baseElement = store == null ? void 0 : store.getState().baseElement;
        if (baseElement && !hasFocus(baseElement)) {
          baseElement.focus();
        }
      }
      store == null ? void 0 : store.setActiveId(event.currentTarget.id);
    });
    const onMouseLeaveProp = props.onMouseLeave;
    const blurOnHoverEndProp = useBooleanEvent(blurOnHoverEnd);
    const onMouseLeave = useEvent((event) => {
      var _a2;
      onMouseLeaveProp == null ? void 0 : onMouseLeaveProp(event);
      if (event.defaultPrevented)
        return;
      if (!isMouseMoving())
        return;
      if (hoveringInside(event))
        return;
      if (movingToAnotherItem(event))
        return;
      if (!focusOnHoverProp(event))
        return;
      if (!blurOnHoverEndProp(event))
        return;
      store == null ? void 0 : store.setActiveId(null);
      (_a2 = store == null ? void 0 : store.getState().baseElement) == null ? void 0 : _a2.focus();
    });
    const ref = (0, import_react22.useCallback)((element) => {
      if (!element)
        return;
      element[symbol3] = true;
    }, []);
    props = __spreadProps(__spreadValues({}, props), {
      ref: useMergeRefs(ref, props.ref),
      onMouseMove,
      onMouseLeave
    });
    return removeUndefinedValues(props);
  }
);
var CompositeHover = memo2(
  forwardRef2(function CompositeHover2(props) {
    const htmlProps = useCompositeHover(props);
    return createElement(TagName20, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/__chunks/PLQDTVXM.js
var import_react23 = __toESM(require_react(), 1);
var TagName21 = "div";
var useCollectionItem = createHook(
  function useCollectionItem2(_a) {
    var _b = _a, {
      store,
      shouldRegisterItem = true,
      getItem = identity,
      element
    } = _b, props = __objRest(_b, [
      "store",
      "shouldRegisterItem",
      "getItem",
      // @ts-expect-error This prop may come from a collection renderer.
      "element"
    ]);
    const context = useCollectionContext();
    store = store || context;
    const id = useId(props.id);
    const ref = (0, import_react23.useRef)(element);
    (0, import_react23.useEffect)(() => {
      const element2 = ref.current;
      if (!id)
        return;
      if (!element2)
        return;
      if (!shouldRegisterItem)
        return;
      const item = getItem({ id, element: element2 });
      return store == null ? void 0 : store.renderItem(item);
    }, [id, shouldRegisterItem, getItem, store]);
    props = __spreadProps(__spreadValues({}, props), {
      ref: useMergeRefs(ref, props.ref)
    });
    return removeUndefinedValues(props);
  }
);
var CollectionItem = forwardRef2(function CollectionItem2(props) {
  const htmlProps = useCollectionItem(props);
  return createElement(TagName21, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/7QKWW6TW.js
var import_react24 = __toESM(require_react(), 1);
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
var TagName22 = "button";
function isEditableElement(element) {
  if (isTextbox(element))
    return true;
  return element.tagName === "INPUT" && !isButton(element);
}
function getNextPageOffset(scrollingElement, pageUp = false) {
  const height = scrollingElement.clientHeight;
  const { top } = scrollingElement.getBoundingClientRect();
  const pageSize = Math.max(height * 0.875, height - 40) * 1.5;
  const pageOffset = pageUp ? height - pageSize + top : pageSize + top;
  if (scrollingElement.tagName === "HTML") {
    return pageOffset + scrollingElement.scrollTop;
  }
  return pageOffset;
}
function getItemOffset(itemElement, pageUp = false) {
  const { top } = itemElement.getBoundingClientRect();
  if (pageUp) {
    return top + itemElement.clientHeight;
  }
  return top;
}
function findNextPageItemId(element, store, next, pageUp = false) {
  var _a;
  if (!store)
    return;
  if (!next)
    return;
  const { renderedItems } = store.getState();
  const scrollingElement = getScrollingElement(element);
  if (!scrollingElement)
    return;
  const nextPageOffset = getNextPageOffset(scrollingElement, pageUp);
  let id;
  let prevDifference;
  for (let i = 0; i < renderedItems.length; i += 1) {
    const previousId = id;
    id = next(i);
    if (!id)
      break;
    if (id === previousId)
      continue;
    const itemElement = (_a = getEnabledItem(store, id)) == null ? void 0 : _a.element;
    if (!itemElement)
      continue;
    const itemOffset = getItemOffset(itemElement, pageUp);
    const difference = itemOffset - nextPageOffset;
    const absDifference = Math.abs(difference);
    if (pageUp && difference <= 0 || !pageUp && difference >= 0) {
      if (prevDifference !== void 0 && prevDifference < absDifference) {
        id = previousId;
      }
      break;
    }
    prevDifference = absDifference;
  }
  return id;
}
function targetIsAnotherItem(event, store) {
  if (isSelfTarget(event))
    return false;
  return isItem(store, event.target);
}
var useCompositeItem = createHook(
  function useCompositeItem2(_a) {
    var _b = _a, {
      store,
      rowId: rowIdProp,
      preventScrollOnKeyDown = false,
      moveOnKeyPress = true,
      tabbable = false,
      getItem: getItemProp,
      "aria-setsize": ariaSetSizeProp,
      "aria-posinset": ariaPosInSetProp
    } = _b, props = __objRest(_b, [
      "store",
      "rowId",
      "preventScrollOnKeyDown",
      "moveOnKeyPress",
      "tabbable",
      "getItem",
      "aria-setsize",
      "aria-posinset"
    ]);
    const context = useCompositeContext();
    store = store || context;
    const id = useId(props.id);
    const ref = (0, import_react24.useRef)(null);
    const row = (0, import_react24.useContext)(CompositeRowContext);
    const rowId = useStoreState(store, (state) => {
      if (rowIdProp)
        return rowIdProp;
      if (!state)
        return;
      if (!(row == null ? void 0 : row.baseElement))
        return;
      if (row.baseElement !== state.baseElement)
        return;
      return row.id;
    });
    const disabled = disabledFromProps(props);
    const trulyDisabled = disabled && !props.accessibleWhenDisabled;
    const getItem = (0, import_react24.useCallback)(
      (item) => {
        const nextItem = __spreadProps(__spreadValues({}, item), {
          id: id || item.id,
          rowId,
          disabled: !!trulyDisabled
        });
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, rowId, trulyDisabled, getItemProp]
    );
    const onFocusProp = props.onFocus;
    const hasFocusedComposite = (0, import_react24.useRef)(false);
    const onFocus = useEvent((event) => {
      onFocusProp == null ? void 0 : onFocusProp(event);
      if (event.defaultPrevented)
        return;
      if (isPortalEvent(event))
        return;
      if (!id)
        return;
      if (!store)
        return;
      if (targetIsAnotherItem(event, store))
        return;
      const { virtualFocus, baseElement: baseElement2 } = store.getState();
      store.setActiveId(id);
      if (isTextbox(event.currentTarget)) {
        selectTextField(event.currentTarget);
      }
      if (!virtualFocus)
        return;
      if (!isSelfTarget(event))
        return;
      if (isEditableElement(event.currentTarget))
        return;
      if (!(baseElement2 == null ? void 0 : baseElement2.isConnected))
        return;
      if (isSafari() && event.currentTarget.hasAttribute("data-autofocus")) {
        event.currentTarget.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        });
      }
      hasFocusedComposite.current = true;
      const fromComposite = event.relatedTarget === baseElement2 || isItem(store, event.relatedTarget);
      if (fromComposite) {
        focusSilently(baseElement2);
      } else {
        baseElement2.focus();
      }
    });
    const onBlurCaptureProp = props.onBlurCapture;
    const onBlurCapture = useEvent((event) => {
      onBlurCaptureProp == null ? void 0 : onBlurCaptureProp(event);
      if (event.defaultPrevented)
        return;
      const state = store == null ? void 0 : store.getState();
      if ((state == null ? void 0 : state.virtualFocus) && hasFocusedComposite.current) {
        hasFocusedComposite.current = false;
        event.preventDefault();
        event.stopPropagation();
      }
    });
    const onKeyDownProp = props.onKeyDown;
    const preventScrollOnKeyDownProp = useBooleanEvent(preventScrollOnKeyDown);
    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (event.defaultPrevented)
        return;
      if (!isSelfTarget(event))
        return;
      if (!store)
        return;
      const { currentTarget } = event;
      const state = store.getState();
      const item = store.item(id);
      const isGrid2 = !!(item == null ? void 0 : item.rowId);
      const isVertical = state.orientation !== "horizontal";
      const isHorizontal = state.orientation !== "vertical";
      const canHomeEnd = () => {
        if (isGrid2)
          return true;
        if (isHorizontal)
          return true;
        if (!state.baseElement)
          return true;
        if (!isTextField(state.baseElement))
          return true;
        return false;
      };
      const keyMap = {
        ArrowUp: (isGrid2 || isVertical) && store.up,
        ArrowRight: (isGrid2 || isHorizontal) && store.next,
        ArrowDown: (isGrid2 || isVertical) && store.down,
        ArrowLeft: (isGrid2 || isHorizontal) && store.previous,
        Home: () => {
          if (!canHomeEnd())
            return;
          if (!isGrid2 || event.ctrlKey) {
            return store == null ? void 0 : store.first();
          }
          return store == null ? void 0 : store.previous(-1);
        },
        End: () => {
          if (!canHomeEnd())
            return;
          if (!isGrid2 || event.ctrlKey) {
            return store == null ? void 0 : store.last();
          }
          return store == null ? void 0 : store.next(-1);
        },
        PageUp: () => {
          return findNextPageItemId(currentTarget, store, store == null ? void 0 : store.up, true);
        },
        PageDown: () => {
          return findNextPageItemId(currentTarget, store, store == null ? void 0 : store.down);
        }
      };
      const action = keyMap[event.key];
      if (action) {
        if (isTextbox(currentTarget)) {
          const selection = getTextboxSelection(currentTarget);
          const isLeft = isHorizontal && event.key === "ArrowLeft";
          const isRight = isHorizontal && event.key === "ArrowRight";
          const isUp = isVertical && event.key === "ArrowUp";
          const isDown = isVertical && event.key === "ArrowDown";
          if (isRight || isDown) {
            const { length: valueLength } = getTextboxValue(currentTarget);
            if (selection.end !== valueLength)
              return;
          } else if ((isLeft || isUp) && selection.start !== 0)
            return;
        }
        const nextId = action();
        if (preventScrollOnKeyDownProp(event) || nextId !== void 0) {
          if (!moveOnKeyPressProp(event))
            return;
          event.preventDefault();
          store.move(nextId);
        }
      }
    });
    const baseElement = useStoreState(
      store,
      (state) => (state == null ? void 0 : state.baseElement) || void 0
    );
    const providerValue = (0, import_react24.useMemo)(
      () => ({ id, baseElement }),
      [id, baseElement]
    );
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime9.jsx)(CompositeItemContext.Provider, { value: providerValue, children: element }),
      [providerValue]
    );
    const isActiveItem = useStoreState(
      store,
      (state) => !!state && state.activeId === id
    );
    const ariaSetSize = useStoreState(store, (state) => {
      if (ariaSetSizeProp != null)
        return ariaSetSizeProp;
      if (!state)
        return;
      if (!(row == null ? void 0 : row.ariaSetSize))
        return;
      if (row.baseElement !== state.baseElement)
        return;
      return row.ariaSetSize;
    });
    const ariaPosInSet = useStoreState(store, (state) => {
      if (ariaPosInSetProp != null)
        return ariaPosInSetProp;
      if (!state)
        return;
      if (!(row == null ? void 0 : row.ariaPosInSet))
        return;
      if (row.baseElement !== state.baseElement)
        return;
      const itemsInRow = state.renderedItems.filter(
        (item) => item.rowId === rowId
      );
      return row.ariaPosInSet + itemsInRow.findIndex((item) => item.id === id);
    });
    const isTabbable2 = useStoreState(store, (state) => {
      if (!(state == null ? void 0 : state.renderedItems.length))
        return true;
      if (state.virtualFocus)
        return false;
      if (tabbable)
        return true;
      return state.activeId === id;
    });
    props = __spreadProps(__spreadValues({
      id,
      "data-active-item": isActiveItem || void 0
    }, props), {
      ref: useMergeRefs(ref, props.ref),
      tabIndex: isTabbable2 ? props.tabIndex : -1,
      onFocus,
      onBlurCapture,
      onKeyDown
    });
    props = useCommand(props);
    props = useCollectionItem(__spreadProps(__spreadValues({
      store
    }, props), {
      getItem,
      shouldRegisterItem: id ? props.shouldRegisterItem : false
    }));
    return removeUndefinedValues(__spreadProps(__spreadValues({}, props), {
      "aria-setsize": ariaSetSize,
      "aria-posinset": ariaPosInSet
    }));
  }
);
var CompositeItem = memo2(
  forwardRef2(function CompositeItem2(props) {
    const htmlProps = useCompositeItem(props);
    return createElement(TagName22, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/combobox/combobox-item.js
var import_react25 = __toESM(require_react());
var import_jsx_runtime10 = __toESM(require_jsx_runtime());
var TagName23 = "div";
function isSelected(storeValue, itemValue) {
  if (itemValue == null)
    return;
  if (storeValue == null)
    return false;
  if (Array.isArray(storeValue)) {
    return storeValue.includes(itemValue);
  }
  return storeValue === itemValue;
}
function getItemRole(popupRole) {
  var _a;
  const itemRoleByPopupRole = {
    menu: "menuitem",
    listbox: "option",
    tree: "treeitem"
  };
  const key = popupRole;
  return (_a = itemRoleByPopupRole[key]) != null ? _a : "option";
}
var useComboboxItem = createHook(
  function useComboboxItem2(_a) {
    var _b = _a, {
      store,
      value,
      hideOnClick,
      setValueOnClick,
      selectValueOnClick = true,
      resetValueOnSelect,
      focusOnHover = false,
      moveOnKeyPress = true,
      getItem: getItemProp
    } = _b, props = __objRest(_b, [
      "store",
      "value",
      "hideOnClick",
      "setValueOnClick",
      "selectValueOnClick",
      "resetValueOnSelect",
      "focusOnHover",
      "moveOnKeyPress",
      "getItem"
    ]);
    var _a2;
    const context = useComboboxScopedContext();
    store = store || context;
    invariant(
      store,
      "ComboboxItem must be wrapped in a ComboboxList or ComboboxPopover component."
    );
    const getItem = (0, import_react25.useCallback)(
      (item) => {
        const nextItem = __spreadProps(__spreadValues({}, item), { value });
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [value, getItemProp]
    );
    const multiSelectable = store.useState(
      (state) => Array.isArray(state.selectedValue)
    );
    const selected = store.useState(
      (state) => isSelected(state.selectedValue, value)
    );
    const resetValueOnSelectState = store.useState("resetValueOnSelect");
    setValueOnClick = setValueOnClick != null ? setValueOnClick : !multiSelectable;
    hideOnClick = hideOnClick != null ? hideOnClick : value != null && !multiSelectable;
    const onClickProp = props.onClick;
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const selectValueOnClickProp = useBooleanEvent(selectValueOnClick);
    const resetValueOnSelectProp = useBooleanEvent(
      (_a2 = resetValueOnSelect != null ? resetValueOnSelect : resetValueOnSelectState) != null ? _a2 : multiSelectable
    );
    const hideOnClickProp = useBooleanEvent(hideOnClick);
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      if (isDownloading(event))
        return;
      if (isOpeningInNewTab(event))
        return;
      if (value != null) {
        if (selectValueOnClickProp(event)) {
          if (resetValueOnSelectProp(event)) {
            store == null ? void 0 : store.resetValue();
          }
          store == null ? void 0 : store.setSelectedValue((prevValue) => {
            if (!Array.isArray(prevValue))
              return value;
            if (prevValue.includes(value)) {
              return prevValue.filter((v) => v !== value);
            }
            return [...prevValue, value];
          });
        }
        if (setValueOnClickProp(event)) {
          store == null ? void 0 : store.setValue(value);
        }
      }
      if (hideOnClickProp(event)) {
        store == null ? void 0 : store.hide();
      }
    });
    const onKeyDownProp = props.onKeyDown;
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (event.defaultPrevented)
        return;
      const baseElement = store == null ? void 0 : store.getState().baseElement;
      if (!baseElement)
        return;
      if (hasFocus(baseElement))
        return;
      const printable = event.key.length === 1;
      if (printable || event.key === "Backspace" || event.key === "Delete") {
        queueMicrotask(() => baseElement.focus());
        if (isTextField(baseElement)) {
          store == null ? void 0 : store.setValue(baseElement.value);
        }
      }
    });
    if (multiSelectable && selected != null) {
      props = __spreadValues({
        "aria-selected": selected
      }, props);
    }
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime10.jsx)(ComboboxItemValueContext.Provider, { value, children: (0, import_jsx_runtime10.jsx)(ComboboxItemCheckedContext.Provider, { value: selected != null ? selected : false, children: element }) }),
      [value, selected]
    );
    const popupRole = (0, import_react25.useContext)(ComboboxListRoleContext);
    props = __spreadProps(__spreadValues({
      role: getItemRole(popupRole),
      children: value
    }, props), {
      onClick,
      onKeyDown
    });
    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);
    props = useCompositeItem(__spreadProps(__spreadValues({
      store
    }, props), {
      getItem,
      // Dispatch a custom event on the combobox input when moving to an item
      // with the keyboard so the Combobox component can enable inline
      // autocompletion.
      moveOnKeyPress: (event) => {
        if (!moveOnKeyPressProp(event))
          return false;
        const moveEvent = new Event("combobox-item-move");
        const baseElement = store == null ? void 0 : store.getState().baseElement;
        baseElement == null ? void 0 : baseElement.dispatchEvent(moveEvent);
        return true;
      }
    }));
    props = useCompositeHover(__spreadValues({ store, focusOnHover }, props));
    return props;
  }
);
var ComboboxItem = memo2(
  forwardRef2(function ComboboxItem2(props) {
    const htmlProps = useComboboxItem(props);
    return createElement(TagName23, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/combobox/combobox-label.js
var TagName24 = "label";
var useComboboxLabel = createHook(
  function useComboboxLabel2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useComboboxProviderContext();
    store = store || context;
    invariant(
      store,
      "ComboboxLabel must receive a `store` prop or be wrapped in a ComboboxProvider component."
    );
    const comboboxId = store.useState((state) => {
      var _a2;
      return (_a2 = state.baseElement) == null ? void 0 : _a2.id;
    });
    props = __spreadValues({
      htmlFor: comboboxId
    }, props);
    return removeUndefinedValues(props);
  }
);
var ComboboxLabel = memo2(
  forwardRef2(function ComboboxLabel2(props) {
    const htmlProps = useComboboxLabel(props);
    return createElement(TagName24, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/__chunks/BSEL4YAF.js
var import_react26 = __toESM(require_react(), 1);
var import_react_dom = __toESM(require_react_dom(), 1);
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
var TagName25 = "div";
function afterTimeout(timeoutMs, cb) {
  const timeoutId = setTimeout(cb, timeoutMs);
  return () => clearTimeout(timeoutId);
}
function afterPaint2(cb) {
  let raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(cb);
  });
  return () => cancelAnimationFrame(raf);
}
function parseCSSTime(...times) {
  return times.join(", ").split(", ").reduce((longestTime, currentTimeString) => {
    const multiplier = currentTimeString.endsWith("ms") ? 1 : 1e3;
    const currentTime = Number.parseFloat(currentTimeString || "0s") * multiplier;
    if (currentTime > longestTime)
      return currentTime;
    return longestTime;
  }, 0);
}
function isHidden(mounted, hidden, alwaysVisible) {
  return !alwaysVisible && hidden !== false && (!mounted || !!hidden);
}
var useDisclosureContent = createHook(function useDisclosureContent2(_a) {
  var _b = _a, { store, alwaysVisible } = _b, props = __objRest(_b, ["store", "alwaysVisible"]);
  const context = useDisclosureProviderContext();
  store = store || context;
  invariant(
    store,
    "DisclosureContent must receive a `store` prop or be wrapped in a DisclosureProvider component."
  );
  const ref = (0, import_react26.useRef)(null);
  const id = useId(props.id);
  const [transition, setTransition] = (0, import_react26.useState)(null);
  const open = store.useState("open");
  const mounted = store.useState("mounted");
  const animated = store.useState("animated");
  const contentElement = store.useState("contentElement");
  const otherElement = useStoreState(store.disclosure, "contentElement");
  useSafeLayoutEffect(() => {
    if (!ref.current)
      return;
    store == null ? void 0 : store.setContentElement(ref.current);
  }, [store]);
  useSafeLayoutEffect(() => {
    let previousAnimated;
    store == null ? void 0 : store.setState("animated", (animated2) => {
      previousAnimated = animated2;
      return true;
    });
    return () => {
      if (previousAnimated === void 0)
        return;
      store == null ? void 0 : store.setState("animated", previousAnimated);
    };
  }, [store]);
  useSafeLayoutEffect(() => {
    if (!animated)
      return;
    if (!(contentElement == null ? void 0 : contentElement.isConnected)) {
      setTransition(null);
      return;
    }
    return afterPaint2(() => {
      setTransition(open ? "enter" : mounted ? "leave" : null);
    });
  }, [animated, contentElement, open, mounted]);
  useSafeLayoutEffect(() => {
    if (!store)
      return;
    if (!animated)
      return;
    const stopAnimation = () => store == null ? void 0 : store.setState("animating", false);
    const stopAnimationSync = () => (0, import_react_dom.flushSync)(stopAnimation);
    if (!transition || !contentElement) {
      stopAnimation();
      return;
    }
    if (transition === "leave" && open)
      return;
    if (transition === "enter" && !open)
      return;
    if (typeof animated === "number") {
      const timeout2 = animated;
      return afterTimeout(timeout2, stopAnimationSync);
    }
    const {
      transitionDuration,
      animationDuration,
      transitionDelay,
      animationDelay
    } = getComputedStyle(contentElement);
    const {
      transitionDuration: transitionDuration2 = "0",
      animationDuration: animationDuration2 = "0",
      transitionDelay: transitionDelay2 = "0",
      animationDelay: animationDelay2 = "0"
    } = otherElement ? getComputedStyle(otherElement) : {};
    const delay = parseCSSTime(
      transitionDelay,
      animationDelay,
      transitionDelay2,
      animationDelay2
    );
    const duration = parseCSSTime(
      transitionDuration,
      animationDuration,
      transitionDuration2,
      animationDuration2
    );
    const timeout = delay + duration;
    if (!timeout) {
      if (transition === "enter") {
        store.setState("animated", false);
      }
      stopAnimation();
      return;
    }
    const frameRate = 1e3 / 60;
    const maxTimeout = Math.max(timeout - frameRate, 0);
    return afterTimeout(maxTimeout, stopAnimationSync);
  }, [store, animated, contentElement, otherElement, open, transition]);
  props = useWrapElement(
    props,
    (element) => (0, import_jsx_runtime11.jsx)(DialogScopedContextProvider, { value: store, children: element }),
    [store]
  );
  const hidden = isHidden(mounted, props.hidden, alwaysVisible);
  const styleProp = props.style;
  const style = (0, import_react26.useMemo)(() => {
    if (hidden)
      return __spreadProps(__spreadValues({}, styleProp), { display: "none" });
    return styleProp;
  }, [hidden, styleProp]);
  props = __spreadProps(__spreadValues({
    id,
    "data-open": open || void 0,
    "data-enter": transition === "enter" || void 0,
    "data-leave": transition === "leave" || void 0,
    hidden
  }, props), {
    ref: useMergeRefs(id ? store.setContentElement : null, ref, props.ref),
    style
  });
  return removeUndefinedValues(props);
});
var DisclosureContentImpl = forwardRef2(function DisclosureContentImpl2(props) {
  const htmlProps = useDisclosureContent(props);
  return createElement(TagName25, htmlProps);
});
var DisclosureContent = forwardRef2(function DisclosureContent2(_a) {
  var _b = _a, {
    unmountOnHide
  } = _b, props = __objRest(_b, [
    "unmountOnHide"
  ]);
  const context = useDisclosureProviderContext();
  const store = props.store || context;
  const mounted = useStoreState(
    store,
    (state) => !unmountOnHide || (state == null ? void 0 : state.mounted)
  );
  if (mounted === false)
    return null;
  return (0, import_jsx_runtime11.jsx)(DisclosureContentImpl, __spreadValues({}, props));
});

// node_modules/@ariakit/react-core/esm/__chunks/6ZVAPMHT.js
var import_react27 = __toESM(require_react(), 1);
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
var TagName26 = "div";
var useComboboxList = createHook(
  function useComboboxList2(_a) {
    var _b = _a, { store, alwaysVisible } = _b, props = __objRest(_b, ["store", "alwaysVisible"]);
    const scopedContext = useComboboxScopedContext(true);
    const context = useComboboxContext();
    store = store || context;
    const scopedContextSameStore = !!store && store === scopedContext;
    invariant(
      store,
      "ComboboxList must receive a `store` prop or be wrapped in a ComboboxProvider component."
    );
    const ref = (0, import_react27.useRef)(null);
    const id = useId(props.id);
    const mounted = store.useState("mounted");
    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? __spreadProps(__spreadValues({}, props.style), { display: "none" }) : props.style;
    const multiSelectable = store.useState(
      (state) => Array.isArray(state.selectedValue)
    );
    const role = useAttribute(ref, "role", props.role);
    const isCompositeRole = role === "listbox" || role === "tree" || role === "grid";
    const ariaMultiSelectable = isCompositeRole ? multiSelectable || void 0 : void 0;
    const [hasListboxInside, setHasListboxInside] = (0, import_react27.useState)(false);
    const contentElement = store.useState("contentElement");
    useSafeLayoutEffect(() => {
      if (!mounted)
        return;
      const element = ref.current;
      if (!element)
        return;
      if (contentElement !== element)
        return;
      const callback = () => {
        setHasListboxInside(!!element.querySelector("[role='listbox']"));
      };
      const observer = new MutationObserver(callback);
      observer.observe(element, {
        subtree: true,
        childList: true,
        attributeFilter: ["role"]
      });
      callback();
      return () => observer.disconnect();
    }, [mounted, contentElement]);
    if (!hasListboxInside) {
      props = __spreadValues({
        role: "listbox",
        "aria-multiselectable": ariaMultiSelectable
      }, props);
    }
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime12.jsx)(ComboboxScopedContextProvider, { value: store, children: (0, import_jsx_runtime12.jsx)(ComboboxListRoleContext.Provider, { value: role, children: element }) }),
      [store, role]
    );
    const setContentElement = id && (!scopedContext || !scopedContextSameStore) ? store.setContentElement : null;
    props = __spreadProps(__spreadValues({
      id,
      hidden
    }, props), {
      ref: useMergeRefs(setContentElement, ref, props.ref),
      style
    });
    return removeUndefinedValues(props);
  }
);
var ComboboxList = forwardRef2(function ComboboxList2(props) {
  const htmlProps = useComboboxList(props);
  return createElement(TagName26, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/63XF7ACK.js
function isBackdrop(element, ...ids) {
  if (!element)
    return false;
  const backdrop = element.getAttribute("data-backdrop");
  if (backdrop == null)
    return false;
  if (backdrop === "")
    return true;
  if (backdrop === "true")
    return true;
  if (!ids.length)
    return true;
  return ids.some((id) => backdrop === id);
}

// node_modules/@ariakit/react-core/esm/__chunks/K2ZF5NU7.js
var cleanups = /* @__PURE__ */ new WeakMap();
function orchestrate(element, key, setup2) {
  if (!cleanups.has(element)) {
    cleanups.set(element, /* @__PURE__ */ new Map());
  }
  const elementCleanups = cleanups.get(element);
  const prevCleanup = elementCleanups.get(key);
  if (!prevCleanup) {
    elementCleanups.set(key, setup2());
    return () => {
      var _a;
      (_a = elementCleanups.get(key)) == null ? void 0 : _a();
      elementCleanups.delete(key);
    };
  }
  const cleanup = setup2();
  const nextCleanup = () => {
    cleanup();
    prevCleanup();
    elementCleanups.delete(key);
  };
  elementCleanups.set(key, nextCleanup);
  return () => {
    const isCurrent = elementCleanups.get(key) === nextCleanup;
    if (!isCurrent)
      return;
    cleanup();
    elementCleanups.set(key, prevCleanup);
  };
}
function setAttribute(element, attr, value) {
  const setup2 = () => {
    const previousValue = element.getAttribute(attr);
    element.setAttribute(attr, value);
    return () => {
      if (previousValue == null) {
        element.removeAttribute(attr);
      } else {
        element.setAttribute(attr, previousValue);
      }
    };
  };
  return orchestrate(element, attr, setup2);
}
function setProperty(element, property, value) {
  const setup2 = () => {
    const exists = property in element;
    const previousValue = element[property];
    element[property] = value;
    return () => {
      if (!exists) {
        delete element[property];
      } else {
        element[property] = previousValue;
      }
    };
  };
  return orchestrate(element, property, setup2);
}
function assignStyle(element, style) {
  if (!element)
    return () => {
    };
  const setup2 = () => {
    const prevStyle = element.style.cssText;
    Object.assign(element.style, style);
    return () => {
      element.style.cssText = prevStyle;
    };
  };
  return orchestrate(element, "style", setup2);
}
function setCSSProperty(element, property, value) {
  if (!element)
    return () => {
    };
  const setup2 = () => {
    const previousValue = element.style.getPropertyValue(property);
    element.style.setProperty(property, value);
    return () => {
      if (previousValue) {
        element.style.setProperty(property, previousValue);
      } else {
        element.style.removeProperty(property);
      }
    };
  };
  return orchestrate(element, property, setup2);
}

// node_modules/@ariakit/react-core/esm/__chunks/AOUGVQZ3.js
var ignoreTags = ["SCRIPT", "STYLE"];
function getSnapshotPropertyName(id) {
  return `__ariakit-dialog-snapshot-${id}`;
}
function inSnapshot(id, element) {
  const doc = getDocument(element);
  const propertyName = getSnapshotPropertyName(id);
  if (!doc.body[propertyName])
    return true;
  do {
    if (element === doc.body)
      return false;
    if (element[propertyName])
      return true;
    if (!element.parentElement)
      return false;
    element = element.parentElement;
  } while (true);
}
function isValidElement3(id, element, ignoredElements) {
  if (ignoreTags.includes(element.tagName))
    return false;
  if (!inSnapshot(id, element))
    return false;
  return !ignoredElements.some(
    (enabledElement) => enabledElement && contains(element, enabledElement)
  );
}
function walkTreeOutside(id, elements2, callback, ancestorCallback) {
  for (let element of elements2) {
    if (!(element == null ? void 0 : element.isConnected))
      continue;
    const hasAncestorAlready = elements2.some((maybeAncestor) => {
      if (!maybeAncestor)
        return false;
      if (maybeAncestor === element)
        return false;
      return maybeAncestor.contains(element);
    });
    const doc = getDocument(element);
    const originalElement = element;
    while (element.parentElement && element !== doc.body) {
      ancestorCallback == null ? void 0 : ancestorCallback(element.parentElement, originalElement);
      if (!hasAncestorAlready) {
        for (const child of element.parentElement.children) {
          if (isValidElement3(id, child, elements2)) {
            callback(child, originalElement);
          }
        }
      }
      element = element.parentElement;
    }
  }
}
function createWalkTreeSnapshot(id, elements2) {
  const { body } = getDocument(elements2[0]);
  const cleanups2 = [];
  const markElement2 = (element) => {
    cleanups2.push(setProperty(element, getSnapshotPropertyName(id), true));
  };
  walkTreeOutside(id, elements2, markElement2);
  return chain(setProperty(body, getSnapshotPropertyName(id), true), () => {
    for (const cleanup of cleanups2) {
      cleanup();
    }
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/2PGBN2Y4.js
function getPropertyName(id = "", ancestor = false) {
  return `__ariakit-dialog-${ancestor ? "ancestor" : "outside"}${id ? `-${id}` : ""}`;
}
function markElement(element, id = "") {
  return chain(
    setProperty(element, getPropertyName(), true),
    setProperty(element, getPropertyName(id), true)
  );
}
function markAncestor(element, id = "") {
  return chain(
    setProperty(element, getPropertyName("", true), true),
    setProperty(element, getPropertyName(id, true), true)
  );
}
function isElementMarked(element, id) {
  const ancestorProperty = getPropertyName(id, true);
  if (element[ancestorProperty])
    return true;
  const elementProperty = getPropertyName(id);
  do {
    if (element[elementProperty])
      return true;
    if (!element.parentElement)
      return false;
    element = element.parentElement;
  } while (true);
}
function markTreeOutside(id, elements2) {
  const cleanups2 = [];
  const ids = elements2.map((el) => el == null ? void 0 : el.id);
  walkTreeOutside(
    id,
    elements2,
    (element) => {
      if (isBackdrop(element, ...ids))
        return;
      cleanups2.unshift(markElement(element, id));
    },
    (ancestor, element) => {
      const isAnotherDialogAncestor = element.hasAttribute("data-dialog") && element.id !== id;
      if (isAnotherDialogAncestor)
        return;
      cleanups2.unshift(markAncestor(ancestor, id));
    }
  );
  const restoreAccessibilityTree = () => {
    for (const cleanup of cleanups2) {
      cleanup();
    }
  };
  return restoreAccessibilityTree;
}

// node_modules/@ariakit/react-core/esm/__chunks/AXRBYZQP.js
var TagName27 = "div";
var elements = [
  "a",
  "button",
  "details",
  "dialog",
  "div",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "section",
  "select",
  "span",
  "summary",
  "textarea",
  "ul",
  "svg"
];
var useRole = createHook(
  function useRole2(props) {
    return props;
  }
);
var Role = forwardRef2(
  // @ts-expect-error
  function Role2(props) {
    return createElement(TagName27, props);
  }
);
Object.assign(
  Role,
  elements.reduce((acc, element) => {
    acc[element] = forwardRef2(function Role3(props) {
      return createElement(element, props);
    });
    return acc;
  }, {})
);

// node_modules/@ariakit/react-core/esm/__chunks/UQBPM777.js
var import_react28 = __toESM(require_react(), 1);
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function DialogBackdrop({
  store,
  backdrop,
  alwaysVisible,
  hidden
}) {
  const ref = (0, import_react28.useRef)(null);
  const disclosure = useDisclosureStore({ disclosure: store });
  const contentElement = store.useState("contentElement");
  useSafeLayoutEffect(() => {
    const backdrop2 = ref.current;
    const dialog = contentElement;
    if (!backdrop2)
      return;
    if (!dialog)
      return;
    backdrop2.style.zIndex = getComputedStyle(dialog).zIndex;
  }, [contentElement]);
  useSafeLayoutEffect(() => {
    const id = contentElement == null ? void 0 : contentElement.id;
    if (!id)
      return;
    const backdrop2 = ref.current;
    if (!backdrop2)
      return;
    return markAncestor(backdrop2, id);
  }, [contentElement]);
  const props = useDisclosureContent({
    ref,
    store: disclosure,
    role: "presentation",
    "data-backdrop": (contentElement == null ? void 0 : contentElement.id) || "",
    alwaysVisible,
    hidden: hidden != null ? hidden : void 0,
    style: {
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
  if (!backdrop)
    return null;
  if ((0, import_react28.isValidElement)(backdrop)) {
    return (0, import_jsx_runtime13.jsx)(Role, __spreadProps(__spreadValues({}, props), { render: backdrop }));
  }
  const Component = typeof backdrop !== "boolean" ? backdrop : "div";
  return (0, import_jsx_runtime13.jsx)(Role, __spreadProps(__spreadValues({}, props), { render: (0, import_jsx_runtime13.jsx)(Component, {}) }));
}

// node_modules/@ariakit/react-core/esm/__chunks/ESSM74HH.js
function hideElementFromAccessibilityTree(element) {
  return setAttribute(element, "aria-hidden", "true");
}

// node_modules/@ariakit/react-core/esm/__chunks/677M2CI3.js
function supportsInert() {
  return "inert" in HTMLElement.prototype;
}

// node_modules/@ariakit/react-core/esm/__chunks/NSFBIL2Z.js
function disableTree(element, ignoredElements) {
  if (!("style" in element))
    return noop;
  if (supportsInert()) {
    return setProperty(element, "inert", true);
  }
  const tabbableElements = getAllTabbableIn(element, true);
  const enableElements = tabbableElements.map((element2) => {
    if (ignoredElements == null ? void 0 : ignoredElements.some((el) => el && contains(el, element2)))
      return noop;
    const restoreFocusMethod = orchestrate(element2, "focus", () => {
      element2.focus = noop;
      return () => {
        delete element2.focus;
      };
    });
    return chain(setAttribute(element2, "tabindex", "-1"), restoreFocusMethod);
  });
  return chain(
    ...enableElements,
    hideElementFromAccessibilityTree(element),
    assignStyle(element, {
      pointerEvents: "none",
      userSelect: "none",
      cursor: "default"
    })
  );
}
function disableTreeOutside(id, elements2) {
  const cleanups2 = [];
  const ids = elements2.map((el) => el == null ? void 0 : el.id);
  walkTreeOutside(
    id,
    elements2,
    (element) => {
      if (isBackdrop(element, ...ids))
        return;
      cleanups2.unshift(disableTree(element, elements2));
    },
    (element) => {
      if (!element.hasAttribute("role"))
        return;
      if (elements2.some((el) => el && contains(el, element)))
        return;
      cleanups2.unshift(setAttribute(element, "role", "none"));
    }
  );
  const restoreTreeOutside = () => {
    for (const cleanup of cleanups2) {
      cleanup();
    }
  };
  return restoreTreeOutside;
}

// node_modules/@ariakit/react-core/esm/__chunks/YJS26JVG.js
var import_react29 = __toESM(require_react(), 1);
var import_react_dom2 = __toESM(require_react_dom(), 1);
function useRootDialog({
  attribute,
  contentId,
  contentElement,
  enabled
}) {
  const [updated, retry] = useForceUpdate();
  const isRootDialog = (0, import_react29.useCallback)(() => {
    if (!enabled)
      return false;
    if (!contentElement)
      return false;
    const { body } = getDocument(contentElement);
    const id = body.getAttribute(attribute);
    return !id || id === contentId;
  }, [updated, enabled, contentElement, attribute, contentId]);
  (0, import_react29.useEffect)(() => {
    if (!enabled)
      return;
    if (!contentId)
      return;
    if (!contentElement)
      return;
    const { body } = getDocument(contentElement);
    if (isRootDialog()) {
      body.setAttribute(attribute, contentId);
      return () => body.removeAttribute(attribute);
    }
    const observer = new MutationObserver(() => (0, import_react_dom2.flushSync)(retry));
    observer.observe(body, { attributeFilter: [attribute] });
    return () => observer.disconnect();
  }, [updated, enabled, contentId, contentElement, isRootDialog, attribute]);
  return isRootDialog;
}

// node_modules/@ariakit/react-core/esm/__chunks/KB6RR6FL.js
var import_react30 = __toESM(require_react(), 1);
function getPaddingProperty(documentElement) {
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}
function usePreventBodyScroll(contentElement, contentId, enabled) {
  const isRootDialog = useRootDialog({
    attribute: "data-dialog-prevent-body-scroll",
    contentElement,
    contentId,
    enabled
  });
  (0, import_react30.useEffect)(() => {
    if (!isRootDialog())
      return;
    if (!contentElement)
      return;
    const doc = getDocument(contentElement);
    const win = getWindow(contentElement);
    const { documentElement, body } = doc;
    const cssScrollbarWidth = documentElement.style.getPropertyValue("--scrollbar-width");
    const scrollbarWidth = cssScrollbarWidth ? Number.parseInt(cssScrollbarWidth) : win.innerWidth - documentElement.clientWidth;
    const setScrollbarWidthProperty = () => setCSSProperty(
      documentElement,
      "--scrollbar-width",
      `${scrollbarWidth}px`
    );
    const paddingProperty = getPaddingProperty(documentElement);
    const setStyle = () => assignStyle(body, {
      overflow: "hidden",
      [paddingProperty]: `${scrollbarWidth}px`
    });
    const setIOSStyle = () => {
      var _a, _b;
      const { scrollX, scrollY, visualViewport } = win;
      const offsetLeft = (_a = visualViewport == null ? void 0 : visualViewport.offsetLeft) != null ? _a : 0;
      const offsetTop = (_b = visualViewport == null ? void 0 : visualViewport.offsetTop) != null ? _b : 0;
      const restoreStyle = assignStyle(body, {
        position: "fixed",
        overflow: "hidden",
        top: `${-(scrollY - Math.floor(offsetTop))}px`,
        left: `${-(scrollX - Math.floor(offsetLeft))}px`,
        right: "0",
        [paddingProperty]: `${scrollbarWidth}px`
      });
      return () => {
        restoreStyle();
        if (true) {
          win.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
        }
      };
    };
    const isIOS = isApple() && !isMac();
    return chain(
      setScrollbarWidthProperty(),
      isIOS ? setIOSStyle() : setStyle()
    );
  }, [isRootDialog, contentElement]);
}

// node_modules/@ariakit/react-core/esm/__chunks/T3RMEPVH.js
var import_react31 = __toESM(require_react(), 1);
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var NestedDialogsContext = (0, import_react31.createContext)({});
function useNestedDialogs(store) {
  const context = (0, import_react31.useContext)(NestedDialogsContext);
  const [dialogs, setDialogs] = (0, import_react31.useState)([]);
  const add = (0, import_react31.useCallback)(
    (dialog) => {
      var _a;
      setDialogs((dialogs2) => [...dialogs2, dialog]);
      return chain((_a = context.add) == null ? void 0 : _a.call(context, dialog), () => {
        setDialogs((dialogs2) => dialogs2.filter((d) => d !== dialog));
      });
    },
    [context]
  );
  useSafeLayoutEffect(() => {
    return sync(store, ["open", "contentElement"], (state) => {
      var _a;
      if (!state.open)
        return;
      if (!state.contentElement)
        return;
      return (_a = context.add) == null ? void 0 : _a.call(context, store);
    });
  }, [store, context]);
  const providerValue = (0, import_react31.useMemo)(() => ({ store, add }), [store, add]);
  const wrapElement = (0, import_react31.useCallback)(
    (element) => (0, import_jsx_runtime14.jsx)(NestedDialogsContext.Provider, { value: providerValue, children: element }),
    [providerValue]
  );
  return { wrapElement, nestedDialogs: dialogs };
}

// node_modules/@ariakit/react-core/esm/__chunks/HLTQOHKZ.js
var import_react32 = __toESM(require_react(), 1);
function usePreviousMouseDownRef(enabled) {
  const previousMouseDownRef = (0, import_react32.useRef)();
  (0, import_react32.useEffect)(() => {
    if (!enabled) {
      previousMouseDownRef.current = null;
      return;
    }
    const onMouseDown = (event) => {
      previousMouseDownRef.current = event.target;
    };
    return addGlobalEventListener("mousedown", onMouseDown, true);
  }, [enabled]);
  return previousMouseDownRef;
}

// node_modules/@ariakit/react-core/esm/__chunks/BOZIQ7QT.js
var import_react33 = __toESM(require_react(), 1);
function isInDocument(target) {
  if (target.tagName === "HTML")
    return true;
  return contains(getDocument(target).body, target);
}
function isDisclosure(disclosure, target) {
  if (!disclosure)
    return false;
  if (contains(disclosure, target))
    return true;
  const activeId = target.getAttribute("aria-activedescendant");
  if (activeId) {
    const activeElement = getDocument(disclosure).getElementById(activeId);
    if (activeElement) {
      return contains(disclosure, activeElement);
    }
  }
  return false;
}
function isMouseEventOnDialog(event, dialog) {
  if (!("clientY" in event))
    return false;
  const rect = dialog.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0)
    return false;
  return rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
}
function useEventOutside({
  store,
  type,
  listener,
  capture,
  domReady
}) {
  const callListener = useEvent(listener);
  const open = useStoreState(store, "open");
  const focusedRef = (0, import_react33.useRef)(false);
  useSafeLayoutEffect(() => {
    if (!open)
      return;
    if (!domReady)
      return;
    const { contentElement } = store.getState();
    if (!contentElement)
      return;
    const onFocus = () => {
      focusedRef.current = true;
    };
    contentElement.addEventListener("focusin", onFocus, true);
    return () => contentElement.removeEventListener("focusin", onFocus, true);
  }, [store, open, domReady]);
  (0, import_react33.useEffect)(() => {
    if (!open)
      return;
    const onEvent = (event) => {
      const { contentElement, disclosureElement } = store.getState();
      const target = event.target;
      if (!contentElement)
        return;
      if (!target)
        return;
      if (!isInDocument(target))
        return;
      if (contains(contentElement, target))
        return;
      if (isDisclosure(disclosureElement, target))
        return;
      if (target.hasAttribute("data-focus-trap"))
        return;
      if (isMouseEventOnDialog(event, contentElement))
        return;
      const focused = focusedRef.current;
      if (focused && !isElementMarked(target, contentElement.id))
        return;
      if (isSafariFocusAncestor(target))
        return;
      callListener(event);
    };
    return addGlobalEventListener(type, onEvent, capture);
  }, [open, capture]);
}
function shouldHideOnInteractOutside(hideOnInteractOutside, event) {
  if (typeof hideOnInteractOutside === "function") {
    return hideOnInteractOutside(event);
  }
  return !!hideOnInteractOutside;
}
function useHideOnInteractOutside(store, hideOnInteractOutside, domReady) {
  const open = useStoreState(store, "open");
  const previousMouseDownRef = usePreviousMouseDownRef(open);
  const props = { store, domReady, capture: true };
  useEventOutside(__spreadProps(__spreadValues({}, props), {
    type: "click",
    listener: (event) => {
      const { contentElement } = store.getState();
      const previousMouseDown = previousMouseDownRef.current;
      if (!previousMouseDown)
        return;
      if (!isVisible(previousMouseDown))
        return;
      if (!isElementMarked(previousMouseDown, contentElement == null ? void 0 : contentElement.id))
        return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event))
        return;
      store.hide();
    }
  }));
  useEventOutside(__spreadProps(__spreadValues({}, props), {
    type: "focusin",
    listener: (event) => {
      const { contentElement } = store.getState();
      if (!contentElement)
        return;
      if (event.target === getDocument(contentElement))
        return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event))
        return;
      store.hide();
    }
  }));
  useEventOutside(__spreadProps(__spreadValues({}, props), {
    type: "contextmenu",
    listener: (event) => {
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event))
        return;
      store.hide();
    }
  }));
}

// node_modules/@ariakit/react-core/esm/__chunks/6GXEOXGT.js
function prependHiddenDismiss(container, onClick) {
  const document2 = getDocument(container);
  const button = document2.createElement("button");
  button.type = "button";
  button.tabIndex = -1;
  button.textContent = "Dismiss popup";
  Object.assign(button.style, {
    border: "0px",
    clip: "rect(0 0 0 0)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: "0px",
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px"
  });
  button.addEventListener("click", onClick);
  container.prepend(button);
  const removeHiddenDismiss = () => {
    button.removeEventListener("click", onClick);
    button.remove();
  };
  return removeHiddenDismiss;
}

// node_modules/@ariakit/react-core/esm/__chunks/HT3UEUDM.js
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
var TagName28 = "div";
var useFocusableContainer = createHook(function useFocusableContainer2(_a) {
  var _b = _a, { autoFocusOnShow = true } = _b, props = __objRest(_b, ["autoFocusOnShow"]);
  props = useWrapElement(
    props,
    (element) => (0, import_jsx_runtime15.jsx)(FocusableContext.Provider, { value: autoFocusOnShow, children: element }),
    [autoFocusOnShow]
  );
  return props;
});
var FocusableContainer = forwardRef2(function FocusableContainer2(props) {
  const htmlProps = useFocusableContainer(props);
  return createElement(TagName28, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/CZ4GFWYL.js
var import_react34 = __toESM(require_react(), 1);
var HeadingContext = (0, import_react34.createContext)(0);

// node_modules/@ariakit/react-core/esm/__chunks/5M6RIVE2.js
var import_react35 = __toESM(require_react(), 1);
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
function HeadingLevel({ level, children: children3 }) {
  const contextLevel = (0, import_react35.useContext)(HeadingContext);
  const nextLevel = Math.max(
    Math.min(level || contextLevel + 1, 6),
    1
  );
  return (0, import_jsx_runtime16.jsx)(HeadingContext.Provider, { value: nextLevel, children: children3 });
}

// node_modules/@ariakit/react-core/esm/__chunks/ILNAUGA4.js
var TagName29 = "span";
var useVisuallyHidden = createHook(
  function useVisuallyHidden2(props) {
    props = __spreadProps(__spreadValues({}, props), {
      style: __spreadValues({
        border: 0,
        clip: "rect(0 0 0 0)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        whiteSpace: "nowrap",
        width: "1px"
      }, props.style)
    });
    return props;
  }
);
var VisuallyHidden = forwardRef2(function VisuallyHidden2(props) {
  const htmlProps = useVisuallyHidden(props);
  return createElement(TagName29, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/LWDIJ7XK.js
var TagName30 = "span";
var useFocusTrap = createHook(
  function useFocusTrap2(props) {
    props = __spreadProps(__spreadValues({
      "data-focus-trap": "",
      tabIndex: 0,
      "aria-hidden": true
    }, props), {
      style: __spreadValues({
        // Prevents unintended scroll jumps.
        position: "fixed",
        top: 0,
        left: 0
      }, props.style)
    });
    props = useVisuallyHidden(props);
    return props;
  }
);
var FocusTrap = forwardRef2(function FocusTrap2(props) {
  const htmlProps = useFocusTrap(props);
  return createElement(TagName30, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/AOQQTIBO.js
var import_react36 = __toESM(require_react(), 1);
var PortalContext = (0, import_react36.createContext)(null);

// node_modules/@ariakit/react-core/esm/__chunks/UNZQGRPO.js
var import_react37 = __toESM(require_react(), 1);
var import_react_dom3 = __toESM(require_react_dom(), 1);
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
var TagName31 = "div";
function getRootElement(element) {
  return getDocument(element).body;
}
function getPortalElement(element, portalElement) {
  if (!portalElement) {
    return getDocument(element).createElement("div");
  }
  if (typeof portalElement === "function") {
    return portalElement(element);
  }
  return portalElement;
}
function getRandomId(prefix = "id") {
  return `${prefix ? `${prefix}-` : ""}${Math.random().toString(36).substr(2, 6)}`;
}
function queueFocus(element) {
  queueMicrotask(() => {
    element == null ? void 0 : element.focus();
  });
}
var usePortal = createHook(function usePortal2(_a) {
  var _b = _a, {
    preserveTabOrder,
    preserveTabOrderAnchor,
    portalElement,
    portalRef,
    portal = true
  } = _b, props = __objRest(_b, [
    "preserveTabOrder",
    "preserveTabOrderAnchor",
    "portalElement",
    "portalRef",
    "portal"
  ]);
  const ref = (0, import_react37.useRef)(null);
  const refProp = useMergeRefs(ref, props.ref);
  const context = (0, import_react37.useContext)(PortalContext);
  const [portalNode, setPortalNode] = (0, import_react37.useState)(null);
  const [anchorPortalNode, setAnchorPortalNode] = (0, import_react37.useState)(
    null
  );
  const outerBeforeRef = (0, import_react37.useRef)(null);
  const innerBeforeRef = (0, import_react37.useRef)(null);
  const innerAfterRef = (0, import_react37.useRef)(null);
  const outerAfterRef = (0, import_react37.useRef)(null);
  useSafeLayoutEffect(() => {
    const element = ref.current;
    if (!element || !portal) {
      setPortalNode(null);
      return;
    }
    const portalEl = getPortalElement(element, portalElement);
    if (!portalEl) {
      setPortalNode(null);
      return;
    }
    const isPortalInDocument = portalEl.isConnected;
    if (!isPortalInDocument) {
      const rootElement = context || getRootElement(element);
      rootElement.appendChild(portalEl);
    }
    if (!portalEl.id) {
      portalEl.id = element.id ? `portal/${element.id}` : getRandomId();
    }
    setPortalNode(portalEl);
    setRef(portalRef, portalEl);
    if (isPortalInDocument)
      return;
    return () => {
      portalEl.remove();
      setRef(portalRef, null);
    };
  }, [portal, portalElement, context, portalRef]);
  useSafeLayoutEffect(() => {
    if (!portal)
      return;
    if (!preserveTabOrder)
      return;
    if (!preserveTabOrderAnchor)
      return;
    const doc = getDocument(preserveTabOrderAnchor);
    const element = doc.createElement("span");
    element.style.position = "fixed";
    preserveTabOrderAnchor.insertAdjacentElement("afterend", element);
    setAnchorPortalNode(element);
    return () => {
      element.remove();
      setAnchorPortalNode(null);
    };
  }, [portal, preserveTabOrder, preserveTabOrderAnchor]);
  (0, import_react37.useEffect)(() => {
    if (!portalNode)
      return;
    if (!preserveTabOrder)
      return;
    let raf = 0;
    const onFocus = (event) => {
      console.log('endisabler')
      if (!isFocusEventOutside(event))
        return;
      const focusing = event.type === "focusin";
      cancelAnimationFrame(raf);
      if (focusing) {
        console.log('restoring')
        return restoreFocusIn(portalNode);
      }
      raf = requestAnimationFrame(() => {
        console.log('disabling')
        disableFocusIn(portalNode, true);
      });
    };
    console.log('adding endisabler listeners')
    portalNode.addEventListener("focusin", onFocus, true);
    portalNode.addEventListener("focusout", onFocus, true);
    return () => {
      console.log('removing endisabler listeners')
      cancelAnimationFrame(raf);
      portalNode.removeEventListener("focusin", onFocus, true);
      portalNode.removeEventListener("focusout", onFocus, true);
    };
  }, [portalNode, preserveTabOrder]);
  props = useWrapElement(
    props,
    (element) => {
      element = // While the portal node is not in the DOM, we need to pass the
      // current context to the portal context, otherwise it's going to
      // reset to the body element on nested portals.
      (0, import_jsx_runtime17.jsx)(PortalContext.Provider, { value: portalNode || context, children: element });
      if (!portal)
        return element;
      if (!portalNode) {
        return (0, import_jsx_runtime17.jsx)(
          "span",
          {
            ref: refProp,
            id: props.id,
            style: { position: "fixed" },
            hidden: true
          }
        );
      }
      element = (0, import_jsx_runtime17.jsxs)(import_jsx_runtime17.Fragment, { children: [
        preserveTabOrder && portalNode && (0, import_jsx_runtime17.jsx)(
          FocusTrap,
          {
            ref: innerBeforeRef,
            className: "__focus-trap-inner-before",
            onFocus: (event) => {
              console.log(event.target.className)
              if (isFocusEventOutside(event, portalNode)) {
                queueFocus(getNextTabbable());
              } else {
                queueFocus(outerBeforeRef.current);
              }
            }
          }
        ),
        element,
        preserveTabOrder && portalNode && (0, import_jsx_runtime17.jsx)(
          FocusTrap,
          {
            ref: innerAfterRef,
            className: "__focus-trap-inner-after",
            onFocus: (event) => {
              console.log(event.target.className)
              if (isFocusEventOutside(event, portalNode)) {
                queueFocus(getPreviousTabbable());
              } else {
                queueFocus(outerAfterRef.current);
              }
            }
          }
        )
      ] });
      if (portalNode) {
        element = (0, import_react_dom3.createPortal)(element, portalNode);
      }
      let preserveTabOrderElement = (0, import_jsx_runtime17.jsxs)(import_jsx_runtime17.Fragment, { children: [
        preserveTabOrder && portalNode && (0, import_jsx_runtime17.jsx)(
          FocusTrap,
          {
            ref: outerBeforeRef,
            className: "__focus-trap-outer-before",
            onFocus: (event) => {
              console.log(event.target.className)
              const fromOuter = event.relatedTarget === outerAfterRef.current;
              if (!fromOuter && isFocusEventOutside(event, portalNode)) {
                queueFocus(innerBeforeRef.current);
              } else {
                queueFocus(getPreviousTabbable());
              }
            }
          }
        ),
        preserveTabOrder && // We're using position: fixed here so that the browser doesn't
        // add margin to the element when setting gap on a parent element.
        (0, import_jsx_runtime17.jsx)("span", { "aria-owns": portalNode == null ? void 0 : portalNode.id, style: { position: "fixed" } }),
        preserveTabOrder && portalNode && (0, import_jsx_runtime17.jsx)(
          FocusTrap,
          {
            ref: outerAfterRef,
            className: "__focus-trap-outer-after",
            onFocus: (event) => {
              console.log(event.target.className)
              if (isFocusEventOutside(event, portalNode)) {
                queueFocus(innerAfterRef.current);
              } else {
                const nextTabbable = getNextTabbable();
                if (nextTabbable === innerBeforeRef.current) {
                  requestAnimationFrame(() => {
                    var _a2;
                    return (_a2 = getNextTabbable()) == null ? void 0 : _a2.focus();
                  });
                  return;
                }
                queueFocus(nextTabbable);
              }
            }
          }
        )
      ] });
      if (anchorPortalNode && preserveTabOrder) {
        preserveTabOrderElement = (0, import_react_dom3.createPortal)(
          preserveTabOrderElement,
          anchorPortalNode
        );
      }
      return (0, import_jsx_runtime17.jsxs)(import_jsx_runtime17.Fragment, { children: [
        preserveTabOrderElement,
        element
      ] });
    },
    [portalNode, context, portal, props.id, preserveTabOrder, anchorPortalNode]
  );
  props = __spreadProps(__spreadValues({}, props), {
    ref: refProp
  });
  return props;
});
var Portal = forwardRef2(function Portal2(props) {
  const htmlProps = usePortal(props);
  return createElement(TagName31, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/TMQXBAX4.js
var import_react38 = __toESM(require_react(), 1);
var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
var TagName32 = "div";
var isSafariBrowser2 = isSafari();
function isAlreadyFocusingAnotherElement(dialog) {
  const activeElement = getActiveElement();
  if (!activeElement)
    return false;
  if (dialog && contains(dialog, activeElement))
    return false;
  if (isFocusable(activeElement))
    return true;
  return false;
}
function getElementFromProp(prop, focusable = false) {
  if (!prop)
    return null;
  const element = "current" in prop ? prop.current : prop;
  if (!element)
    return null;
  if (focusable)
    return isFocusable(element) ? element : null;
  return element;
}
var useDialog = createHook(function useDialog2(_a) {
  var _b = _a, {
    store: storeProp,
    open: openProp,
    onClose,
    focusable = true,
    modal = true,
    portal = !!modal,
    backdrop = !!modal,
    hideOnEscape = true,
    hideOnInteractOutside = true,
    getPersistentElements,
    preventBodyScroll = !!modal,
    autoFocusOnShow = true,
    autoFocusOnHide = true,
    initialFocus,
    finalFocus,
    unmountOnHide,
    unstable_treeSnapshotKey
  } = _b, props = __objRest(_b, [
    "store",
    "open",
    "onClose",
    "focusable",
    "modal",
    "portal",
    "backdrop",
    "hideOnEscape",
    "hideOnInteractOutside",
    "getPersistentElements",
    "preventBodyScroll",
    "autoFocusOnShow",
    "autoFocusOnHide",
    "initialFocus",
    "finalFocus",
    "unmountOnHide",
    "unstable_treeSnapshotKey"
  ]);
  const context = useDialogProviderContext();
  const ref = (0, import_react38.useRef)(null);
  const store = useDialogStore({
    store: storeProp || context,
    open: openProp,
    setOpen(open2) {
      if (open2)
        return;
      const dialog = ref.current;
      if (!dialog)
        return;
      const event = new Event("close", { bubbles: false, cancelable: true });
      if (onClose) {
        dialog.addEventListener("close", onClose, { once: true });
      }
      dialog.dispatchEvent(event);
      if (!event.defaultPrevented)
        return;
      store.setOpen(true);
    }
  });
  const { portalRef, domReady } = usePortalRef(portal, props.portalRef);
  const preserveTabOrderProp = props.preserveTabOrder;
  const preserveTabOrder = store.useState(
    (state) => preserveTabOrderProp && !modal && state.mounted
  );
  const id = useId(props.id);
  const open = store.useState("open");
  const mounted = store.useState("mounted");
  const contentElement = store.useState("contentElement");
  const hidden = isHidden(mounted, props.hidden, props.alwaysVisible);
  usePreventBodyScroll(contentElement, id, preventBodyScroll && !hidden);
  useHideOnInteractOutside(store, hideOnInteractOutside, domReady);
  const { wrapElement, nestedDialogs } = useNestedDialogs(store);
  props = useWrapElement(props, wrapElement, [wrapElement]);
  useSafeLayoutEffect(() => {
    if (!open)
      return;
    const dialog = ref.current;
    const activeElement = getActiveElement(dialog, true);
    if (!activeElement)
      return;
    if (activeElement.tagName === "BODY")
      return;
    if (dialog && contains(dialog, activeElement))
      return;
    store.setDisclosureElement(activeElement);
  }, [store, open]);
  if (isSafariBrowser2) {
    (0, import_react38.useEffect)(() => {
      if (!mounted)
        return;
      const { disclosureElement } = store.getState();
      if (!disclosureElement)
        return;
      if (!isButton(disclosureElement))
        return;
      const onMouseDown = () => {
        let receivedFocus = false;
        const onFocus = () => {
          receivedFocus = true;
        };
        const options = { capture: true, once: true };
        disclosureElement.addEventListener("focusin", onFocus, options);
        queueBeforeEvent(disclosureElement, "mouseup", () => {
          disclosureElement.removeEventListener("focusin", onFocus, true);
          if (receivedFocus)
            return;
          focusIfNeeded(disclosureElement);
        });
      };
      disclosureElement.addEventListener("mousedown", onMouseDown);
      return () => {
        disclosureElement.removeEventListener("mousedown", onMouseDown);
      };
    }, [store, mounted]);
  }
  (0, import_react38.useEffect)(() => {
    if (!modal)
      return;
    if (!mounted)
      return;
    if (!domReady)
      return;
    const dialog = ref.current;
    if (!dialog)
      return;
    const existingDismiss = dialog.querySelector("[data-dialog-dismiss]");
    if (existingDismiss)
      return;
    return prependHiddenDismiss(dialog, store.hide);
  }, [store, modal, mounted, domReady]);
  useSafeLayoutEffect(() => {
    if (!supportsInert())
      return;
    if (open)
      return;
    if (!mounted)
      return;
    if (!domReady)
      return;
    const dialog = ref.current;
    if (!dialog)
      return;
    return disableTree(dialog);
  }, [open, mounted, domReady]);
  const canTakeTreeSnapshot = open && domReady;
  useSafeLayoutEffect(() => {
    if (!id)
      return;
    if (!canTakeTreeSnapshot)
      return;
    const dialog = ref.current;
    return createWalkTreeSnapshot(id, [dialog]);
  }, [id, canTakeTreeSnapshot, unstable_treeSnapshotKey]);
  const getPersistentElementsProp = useEvent(getPersistentElements);
  useSafeLayoutEffect(() => {
    if (!id)
      return;
    if (!canTakeTreeSnapshot)
      return;
    const { disclosureElement } = store.getState();
    const dialog = ref.current;
    const persistentElements = getPersistentElementsProp() || [];
    const allElements = [
      dialog,
      ...persistentElements,
      ...nestedDialogs.map((dialog2) => dialog2.getState().contentElement)
    ];
    if (modal) {
      return chain(
        markTreeOutside(id, allElements),
        disableTreeOutside(id, allElements)
      );
    }
    return markTreeOutside(id, [disclosureElement, ...allElements]);
  }, [
    id,
    store,
    canTakeTreeSnapshot,
    getPersistentElementsProp,
    nestedDialogs,
    modal,
    unstable_treeSnapshotKey
  ]);
  const mayAutoFocusOnShow = !!autoFocusOnShow;
  const autoFocusOnShowProp = useBooleanEvent(autoFocusOnShow);
  const [autoFocusEnabled, setAutoFocusEnabled] = (0, import_react38.useState)(false);
  (0, import_react38.useEffect)(() => {
    if (!open)
      return;
    if (!mayAutoFocusOnShow)
      return;
    if (!domReady)
      return;
    if (!(contentElement == null ? void 0 : contentElement.isConnected))
      return;
    const element = getElementFromProp(initialFocus, true) || // If no initial focus is specified, we try to focus the first element
    // with the autofocus attribute. If it's an Ariakit component, the
    // Focusable component will consume the autoFocus prop and add the
    // data-autofocus attribute to the element instead.
    contentElement.querySelector(
      "[data-autofocus=true],[autofocus]"
    ) || // We have to fallback to the first focusable element otherwise portaled
    // dialogs with preserveTabOrder set to true will not receive focus
    // properly because the elements aren't tabbable until the dialog receives
    // focus.
    getFirstTabbableIn(contentElement, true, portal && preserveTabOrder) || // Finally, we fallback to the dialog element itself.
    contentElement;
    const isElementFocusable = isFocusable(element);
    if (!autoFocusOnShowProp(isElementFocusable ? element : null))
      return;
    setAutoFocusEnabled(true);
    queueMicrotask(() => {
      element.focus();
      if (!isSafariBrowser2)
        return;
      element.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }, [
    open,
    mayAutoFocusOnShow,
    domReady,
    contentElement,
    initialFocus,
    portal,
    preserveTabOrder,
    autoFocusOnShowProp
  ]);
  const mayAutoFocusOnHide = !!autoFocusOnHide;
  const autoFocusOnHideProp = useBooleanEvent(autoFocusOnHide);
  const [hasOpened, setHasOpened] = (0, import_react38.useState)(false);
  (0, import_react38.useEffect)(() => {
    if (!open)
      return;
    setHasOpened(true);
    return () => setHasOpened(false);
  }, [open]);
  const focusOnHide = (0, import_react38.useCallback)(
    (dialog, retry = true) => {
      const { disclosureElement } = store.getState();
      if (isAlreadyFocusingAnotherElement(dialog))
        return;
      let element = getElementFromProp(finalFocus) || disclosureElement;
      if (element == null ? void 0 : element.id) {
        const doc = getDocument(element);
        const selector2 = `[aria-activedescendant="${element.id}"]`;
        const composite = doc.querySelector(selector2);
        if (composite) {
          element = composite;
        }
      }
      if (element && !isFocusable(element)) {
        const maybeParentDialog = element.closest("[data-dialog]");
        if (maybeParentDialog == null ? void 0 : maybeParentDialog.id) {
          const doc = getDocument(maybeParentDialog);
          const selector2 = `[aria-controls~="${maybeParentDialog.id}"]`;
          const control = doc.querySelector(selector2);
          if (control) {
            element = control;
          }
        }
      }
      const isElementFocusable = element && isFocusable(element);
      if (!isElementFocusable && retry) {
        requestAnimationFrame(() => focusOnHide(dialog, false));
        return;
      }
      if (!autoFocusOnHideProp(isElementFocusable ? element : null))
        return;
      if (!isElementFocusable)
        return;
      element == null ? void 0 : element.focus();
    },
    [store, finalFocus, autoFocusOnHideProp]
  );
  const focusedOnHideRef = (0, import_react38.useRef)(false);
  useSafeLayoutEffect(() => {
    if (open)
      return;
    if (!hasOpened)
      return;
    if (!mayAutoFocusOnHide)
      return;
    const dialog = ref.current;
    focusedOnHideRef.current = true;
    focusOnHide(dialog);
  }, [open, hasOpened, domReady, mayAutoFocusOnHide, focusOnHide]);
  (0, import_react38.useEffect)(() => {
    if (!hasOpened)
      return;
    if (!mayAutoFocusOnHide)
      return;
    const dialog = ref.current;
    return () => {
      if (focusedOnHideRef.current) {
        focusedOnHideRef.current = false;
        return;
      }
      focusOnHide(dialog);
    };
  }, [hasOpened, mayAutoFocusOnHide, focusOnHide]);
  const hideOnEscapeProp = useBooleanEvent(hideOnEscape);
  (0, import_react38.useEffect)(() => {
    if (!domReady)
      return;
    if (!mounted)
      return;
    const onKeyDown = (event) => {
      if (event.key !== "Escape")
        return;
      if (event.defaultPrevented)
        return;
      const dialog = ref.current;
      if (!dialog)
        return;
      if (isElementMarked(dialog))
        return;
      const target = event.target;
      if (!target)
        return;
      const { disclosureElement } = store.getState();
      const isValidTarget = () => {
        if (target.tagName === "BODY")
          return true;
        if (contains(dialog, target))
          return true;
        if (!disclosureElement)
          return true;
        if (contains(disclosureElement, target))
          return true;
        return false;
      };
      if (!isValidTarget())
        return;
      if (!hideOnEscapeProp(event))
        return;
      store.hide();
    };
    return addGlobalEventListener("keydown", onKeyDown, true);
  }, [store, domReady, mounted, hideOnEscapeProp]);
  props = useWrapElement(
    props,
    (element) => (0, import_jsx_runtime18.jsx)(HeadingLevel, { level: modal ? 1 : void 0, children: element }),
    [modal]
  );
  const hiddenProp = props.hidden;
  const alwaysVisible = props.alwaysVisible;
  props = useWrapElement(
    props,
    (element) => {
      if (!backdrop)
        return element;
      return (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
        (0, import_jsx_runtime18.jsx)(
          DialogBackdrop,
          {
            store,
            backdrop,
            hidden: hiddenProp,
            alwaysVisible
          }
        ),
        element
      ] });
    },
    [store, backdrop, hiddenProp, alwaysVisible]
  );
  const [headingId, setHeadingId] = (0, import_react38.useState)();
  const [descriptionId, setDescriptionId] = (0, import_react38.useState)();
  props = useWrapElement(
    props,
    (element) => (0, import_jsx_runtime18.jsx)(DialogScopedContextProvider, { value: store, children: (0, import_jsx_runtime18.jsx)(DialogHeadingContext.Provider, { value: setHeadingId, children: (0, import_jsx_runtime18.jsx)(DialogDescriptionContext.Provider, { value: setDescriptionId, children: element }) }) }),
    [store]
  );
  props = __spreadProps(__spreadValues({
    id,
    "data-dialog": "",
    role: "dialog",
    tabIndex: focusable ? -1 : void 0,
    "aria-labelledby": headingId,
    "aria-describedby": descriptionId
  }, props), {
    ref: useMergeRefs(ref, props.ref)
  });
  props = useFocusableContainer(__spreadProps(__spreadValues({}, props), {
    autoFocusOnShow: autoFocusEnabled
  }));
  props = useDisclosureContent(__spreadValues({ store }, props));
  props = useFocusable(__spreadProps(__spreadValues({}, props), { focusable }));
  props = usePortal(__spreadProps(__spreadValues({ portal }, props), { portalRef, preserveTabOrder }));
  return props;
});
function createDialogComponent(Component, useProviderContext = useDialogProviderContext) {
  return forwardRef2(function DialogComponent(props) {
    const context = useProviderContext();
    const store = props.store || context;
    const mounted = useStoreState(
      store,
      (state) => !props.unmountOnHide || (state == null ? void 0 : state.mounted) || !!props.open
    );
    if (!mounted)
      return null;
    return (0, import_jsx_runtime18.jsx)(Component, __spreadValues({}, props));
  });
}
var Dialog = createDialogComponent(
  forwardRef2(function Dialog2(props) {
    const htmlProps = useDialog(props);
    return createElement(TagName32, htmlProps);
  }),
  useDialogProviderContext
);

// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var sides = ["top", "right", "bottom", "left"];
var alignments = ["start", "end"];
var placements = sides.reduce((acc, side) => acc.concat(side, side + "-" + alignments[0], side + "-" + alignments[1]), []);
var min = Math.min;
var max = Math.max;
var round = Math.round;
var floor = Math.floor;
var createCoords = (v) => ({
  x: v,
  y: v
});
var oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
var oppositeAlignmentMap = {
  start: "end",
  end: "start"
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
  return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
}
function getSideList(side, isStart, rtl) {
  const lr = ["left", "right"];
  const rl = ["right", "left"];
  const tb = ["top", "bottom"];
  const bt = ["bottom", "top"];
  switch (side) {
    case "top":
    case "bottom":
      if (rtl)
        return isStart ? rl : lr;
      return isStart ? lr : rl;
    case "left":
    case "right":
      return isStart ? tb : bt;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}

// node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case "start":
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case "end":
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}
var computePosition = async (reference, floating, config) => {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2
  } = config;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    const {
      name,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platform2,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === "object") {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform: platform2,
    rects,
    elements: elements2,
    strategy
  } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements2[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements2.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    x,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements2.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: elements2,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
var arrow = (options) => ({
  name: "arrow",
  options,
  async fn(state) {
    const {
      x,
      y,
      placement,
      rects,
      platform: platform2,
      elements: elements2,
      middlewareData
    } = state;
    const {
      element,
      padding = 0
    } = evaluate(options, state) || {};
    if (element == null) {
      return {};
    }
    const paddingObject = getPaddingObject(padding);
    const coords = {
      x,
      y
    };
    const axis = getAlignmentAxis(placement);
    const length = getAxisLength(axis);
    const arrowDimensions = await platform2.getDimensions(element);
    const isYAxis = axis === "y";
    const minProp = isYAxis ? "top" : "left";
    const maxProp = isYAxis ? "bottom" : "right";
    const clientProp = isYAxis ? "clientHeight" : "clientWidth";
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const arrowOffsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(element));
    let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
    if (!clientSize || !await (platform2.isElement == null ? void 0 : platform2.isElement(arrowOffsetParent))) {
      clientSize = elements2.floating[clientProp] || rects.floating[length];
    }
    const centerToReference = endDiff / 2 - startDiff / 2;
    const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
    const minPadding = min(paddingObject[minProp], largestPossiblePadding);
    const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
    const min$1 = minPadding;
    const max2 = clientSize - arrowDimensions[length] - maxPadding;
    const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset3 = clamp(min$1, center, max2);
    const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset3 && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
    const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max2 : 0;
    return {
      [axis]: coords[axis] + alignmentOffset,
      data: {
        [axis]: offset3,
        centerOffset: center - offset3 - alignmentOffset,
        ...shouldAddOffset && {
          alignmentOffset
        }
      },
      reset: shouldAddOffset
    };
  }
});
var flip = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "flip",
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform: platform2,
        elements: elements2
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = "bestFit",
        fallbackAxisSideDirection = "none",
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements2.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements2 = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides2 = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];
      if (!overflows.every((side2) => side2 <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements2[nextIndex];
        if (nextPlacement) {
          return {
            data: {
              index: nextIndex,
              overflows: overflowsData
            },
            reset: {
              placement: nextPlacement
            }
          };
        }
        let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case "bestFit": {
              var _overflowsData$filter2;
              const placement2 = (_overflowsData$filter2 = overflowsData.filter((d) => {
                if (hasFallbackAxisSideDirection) {
                  const currentSideAxis = getSideAxis(d.placement);
                  return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  currentSideAxis === "y";
                }
                return true;
              }).map((d) => [d.placement, d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
              if (placement2) {
                resetPlacement = placement2;
              }
              break;
            }
            case "initialPlacement":
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform: platform2,
    elements: elements2
  } = state;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements2.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
var offset = function(options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: "offset",
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x,
        y,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};
var shift = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "shift",
    options,
    async fn(state) {
      const {
        x,
        y,
        placement
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: (_ref) => {
            let {
              x: x2,
              y: y2
            } = _ref;
            return {
              x: x2,
              y: y2
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === "y" ? "top" : "left";
        const maxSide = mainAxis === "y" ? "bottom" : "right";
        const min2 = mainAxisCoord + overflow[minSide];
        const max2 = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp(min2, mainAxisCoord, max2);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === "y" ? "top" : "left";
        const maxSide = crossAxis === "y" ? "bottom" : "right";
        const min2 = crossAxisCoord + overflow[minSide];
        const max2 = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp(min2, crossAxisCoord, max2);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};
var limitShift = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    options,
    fn(state) {
      const {
        x,
        y,
        placement,
        rects,
        middlewareData
      } = state;
      const {
        offset: offset3 = 0,
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const crossAxis = getSideAxis(placement);
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      const rawOffset = evaluate(offset3, state);
      const computedOffset = typeof rawOffset === "number" ? {
        mainAxis: rawOffset,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...rawOffset
      };
      if (checkMainAxis) {
        const len = mainAxis === "y" ? "height" : "width";
        const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
        const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
        if (mainAxisCoord < limitMin) {
          mainAxisCoord = limitMin;
        } else if (mainAxisCoord > limitMax) {
          mainAxisCoord = limitMax;
        }
      }
      if (checkCrossAxis) {
        var _middlewareData$offse, _middlewareData$offse2;
        const len = mainAxis === "y" ? "width" : "height";
        const isOriginSide = ["top", "left"].includes(getSide(placement));
        const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
        const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
        if (crossAxisCoord < limitMin) {
          crossAxisCoord = limitMin;
        } else if (crossAxisCoord > limitMax) {
          crossAxisCoord = limitMax;
        }
      }
      return {
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      };
    }
  };
};
var size = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "size",
    options,
    async fn(state) {
      var _state$middlewareData, _state$middlewareData2;
      const {
        placement,
        rects,
        platform: platform2,
        elements: elements2
      } = state;
      const {
        apply = () => {
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const side = getSide(placement);
      const alignment = getAlignment(placement);
      const isYAxis = getSideAxis(placement) === "y";
      const {
        width,
        height
      } = rects.floating;
      let heightSide;
      let widthSide;
      if (side === "top" || side === "bottom") {
        heightSide = side;
        widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements2.floating)) ? "start" : "end") ? "left" : "right";
      } else {
        widthSide = side;
        heightSide = alignment === "end" ? "top" : "bottom";
      }
      const maximumClippingHeight = height - overflow.top - overflow.bottom;
      const maximumClippingWidth = width - overflow.left - overflow.right;
      const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
      const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
      const noShift = !state.middlewareData.shift;
      let availableHeight = overflowAvailableHeight;
      let availableWidth = overflowAvailableWidth;
      if ((_state$middlewareData = state.middlewareData.shift) != null && _state$middlewareData.enabled.x) {
        availableWidth = maximumClippingWidth;
      }
      if ((_state$middlewareData2 = state.middlewareData.shift) != null && _state$middlewareData2.enabled.y) {
        availableHeight = maximumClippingHeight;
      }
      if (noShift && !alignment) {
        const xMin = max(overflow.left, 0);
        const xMax = max(overflow.right, 0);
        const yMin = max(overflow.top, 0);
        const yMax = max(overflow.bottom, 0);
        if (isYAxis) {
          availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
        } else {
          availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
        }
      }
      await apply({
        ...state,
        availableWidth,
        availableHeight
      });
      const nextDimensions = await platform2.getDimensions(elements2.floating);
      if (width !== nextDimensions.width || height !== nextDimensions.height) {
        return {
          reset: {
            rects: true
          }
        };
      }
      return {};
    }
  };
};

// node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow2(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow2(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow2(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow2(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow2(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle2(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
}
function isTableElement(element) {
  return ["table", "td", "th"].includes(getNodeName(element));
}
function isTopLayer(element) {
  return [":popover-open", ":modal"].some((selector2) => {
    try {
      return element.matches(selector2);
    } catch (e) {
      return false;
    }
  });
}
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css = isElement(elementOrCss) ? getComputedStyle2(elementOrCss) : elementOrCss;
  return css.transform !== "none" || css.perspective !== "none" || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || ["transform", "perspective", "filter"].some((value) => (css.willChange || "").includes(value)) || ["paint", "layout", "strict", "content"].some((value) => (css.contain || "").includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === "undefined" || !CSS.supports)
    return false;
  return CSS.supports("-webkit-backdrop-filter", "none");
}
function isLastTraversableNode(node) {
  return ["html", "body", "#document"].includes(getNodeName(node));
}
function getComputedStyle2(element) {
  return getWindow2(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow2(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
  const css = getComputedStyle2(element);
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;
  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}
var noOffsets = createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow2(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow2(element)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow2(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow2(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle2(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow2(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements: elements2,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === "fixed";
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements2 ? isTopLayer(elements2.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
  };
}
function getClientRects(element) {
  return Array.from(element.getClientRects());
}
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle2(body).direction === "rtl") {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getViewportRect(element, strategy) {
  const win = getWindow2(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport") {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      ...clippingAncestor,
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle2(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle2(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element) : element;
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle2(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === "fixed") {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && ["absolute", "fixed"].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}
function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  let htmlX = 0;
  let htmlY = 0;
  if (documentElement && !isOffsetParentAnElement && !isFixed) {
    const htmlRect = documentElement.getBoundingClientRect();
    htmlY = htmlRect.top + scroll.scrollTop;
    htmlX = htmlRect.left + scroll.scrollLeft - // RTL <body> scrollbar.
    getWindowScrollBarX(documentElement, htmlRect);
  }
  const x = rect.left + scroll.scrollLeft - offsets.x - htmlX;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlY;
  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}
function isStaticPositioned(element) {
  return getComputedStyle2(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
  const win = getWindow2(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}
var getElementRects = async function(data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};
function isRTL(element) {
  return getComputedStyle2(element).direction === "rtl";
}
var platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const {
      left,
      top,
      width,
      height
    } = element.getBoundingClientRect();
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1e3);
        } else {
          refresh(false, ratio);
        }
      }
      isFirstUpdate = false;
    }
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === "function",
    layoutShift = typeof IntersectionObserver === "function",
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener("resize", update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref) => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    var _resizeObserver2;
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update);
      ancestorResize && ancestor.removeEventListener("resize", update);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
var offset2 = offset;
var shift2 = shift;
var flip2 = flip;
var size2 = size;
var arrow2 = arrow;
var limitShift2 = limitShift;
var computePosition2 = (reference, floating, options) => {
  const cache = /* @__PURE__ */ new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

// node_modules/@ariakit/react-core/esm/__chunks/FK7DPXBE.js
var import_react39 = __toESM(require_react(), 1);
var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
var TagName33 = "div";
function createDOMRect(x = 0, y = 0, width = 0, height = 0) {
  if (typeof DOMRect === "function") {
    return new DOMRect(x, y, width, height);
  }
  const rect = {
    x,
    y,
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x
  };
  return __spreadProps(__spreadValues({}, rect), { toJSON: () => rect });
}
function getDOMRect(anchorRect) {
  if (!anchorRect)
    return createDOMRect();
  const { x, y, width, height } = anchorRect;
  return createDOMRect(x, y, width, height);
}
function getAnchorElement(anchorElement, getAnchorRect) {
  const contextElement = anchorElement || void 0;
  return {
    contextElement,
    getBoundingClientRect: () => {
      const anchor = anchorElement;
      const anchorRect = getAnchorRect == null ? void 0 : getAnchorRect(anchor);
      if (anchorRect || !anchor) {
        return getDOMRect(anchorRect);
      }
      return anchor.getBoundingClientRect();
    }
  };
}
function isValidPlacement(flip22) {
  return /^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(flip22);
}
function roundByDPR(value) {
  const dpr = window.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}
function getOffsetMiddleware(arrowElement, props) {
  return offset2(({ placement }) => {
    var _a;
    const arrowOffset = ((arrowElement == null ? void 0 : arrowElement.clientHeight) || 0) / 2;
    const finalGutter = typeof props.gutter === "number" ? props.gutter + arrowOffset : (_a = props.gutter) != null ? _a : arrowOffset;
    const hasAlignment = !!placement.split("-")[1];
    return {
      crossAxis: !hasAlignment ? props.shift : void 0,
      mainAxis: finalGutter,
      alignmentAxis: props.shift
    };
  });
}
function getFlipMiddleware(props) {
  if (props.flip === false)
    return;
  const fallbackPlacements = typeof props.flip === "string" ? props.flip.split(" ") : void 0;
  invariant(
    !fallbackPlacements || fallbackPlacements.every(isValidPlacement),
    "`flip` expects a spaced-delimited list of placements"
  );
  return flip2({
    padding: props.overflowPadding,
    fallbackPlacements
  });
}
function getShiftMiddleware(props) {
  if (!props.slide && !props.overlap)
    return;
  return shift2({
    mainAxis: props.slide,
    crossAxis: props.overlap,
    padding: props.overflowPadding,
    limiter: limitShift2()
  });
}
function getSizeMiddleware(props) {
  return size2({
    padding: props.overflowPadding,
    apply({ elements: elements2, availableWidth, availableHeight, rects }) {
      const wrapper = elements2.floating;
      const referenceWidth = Math.round(rects.reference.width);
      availableWidth = Math.floor(availableWidth);
      availableHeight = Math.floor(availableHeight);
      wrapper.style.setProperty(
        "--popover-anchor-width",
        `${referenceWidth}px`
      );
      wrapper.style.setProperty(
        "--popover-available-width",
        `${availableWidth}px`
      );
      wrapper.style.setProperty(
        "--popover-available-height",
        `${availableHeight}px`
      );
      if (props.sameWidth) {
        wrapper.style.width = `${referenceWidth}px`;
      }
      if (props.fitViewport) {
        wrapper.style.maxWidth = `${availableWidth}px`;
        wrapper.style.maxHeight = `${availableHeight}px`;
      }
    }
  });
}
function getArrowMiddleware(arrowElement, props) {
  if (!arrowElement)
    return;
  return arrow2({
    element: arrowElement,
    padding: props.arrowPadding
  });
}
var usePopover = createHook(
  function usePopover2(_a) {
    var _b = _a, {
      store,
      modal = false,
      portal = !!modal,
      preserveTabOrder = true,
      autoFocusOnShow = true,
      wrapperProps,
      fixed = false,
      flip: flip22 = true,
      shift: shift22 = 0,
      slide = true,
      overlap = false,
      sameWidth = false,
      fitViewport = false,
      gutter,
      arrowPadding = 4,
      overflowPadding = 8,
      getAnchorRect,
      updatePosition
    } = _b, props = __objRest(_b, [
      "store",
      "modal",
      "portal",
      "preserveTabOrder",
      "autoFocusOnShow",
      "wrapperProps",
      "fixed",
      "flip",
      "shift",
      "slide",
      "overlap",
      "sameWidth",
      "fitViewport",
      "gutter",
      "arrowPadding",
      "overflowPadding",
      "getAnchorRect",
      "updatePosition"
    ]);
    const context = usePopoverProviderContext();
    store = store || context;
    invariant(
      store,
      "Popover must receive a `store` prop or be wrapped in a PopoverProvider component."
    );
    const arrowElement = store.useState("arrowElement");
    const anchorElement = store.useState("anchorElement");
    const disclosureElement = store.useState("disclosureElement");
    const popoverElement = store.useState("popoverElement");
    const contentElement = store.useState("contentElement");
    const placement = store.useState("placement");
    const mounted = store.useState("mounted");
    const rendered = store.useState("rendered");
    const defaultArrowElementRef = (0, import_react39.useRef)(null);
    const [positioned, setPositioned] = (0, import_react39.useState)(false);
    const { portalRef, domReady } = usePortalRef(portal, props.portalRef);
    const getAnchorRectProp = useEvent(getAnchorRect);
    const updatePositionProp = useEvent(updatePosition);
    const hasCustomUpdatePosition = !!updatePosition;
    useSafeLayoutEffect(() => {
      if (!(popoverElement == null ? void 0 : popoverElement.isConnected))
        return;
      popoverElement.style.setProperty(
        "--popover-overflow-padding",
        `${overflowPadding}px`
      );
      const anchor = getAnchorElement(anchorElement, getAnchorRectProp);
      const updatePosition2 = async () => {
        if (!mounted)
          return;
        if (!arrowElement) {
          defaultArrowElementRef.current = defaultArrowElementRef.current || document.createElement("div");
        }
        const arrow22 = arrowElement || defaultArrowElementRef.current;
        const middleware = [
          getOffsetMiddleware(arrow22, { gutter, shift: shift22 }),
          getFlipMiddleware({ flip: flip22, overflowPadding }),
          getShiftMiddleware({ slide, shift: shift22, overlap, overflowPadding }),
          getArrowMiddleware(arrow22, { arrowPadding }),
          getSizeMiddleware({
            sameWidth,
            fitViewport,
            overflowPadding
          })
        ];
        const pos = await computePosition2(anchor, popoverElement, {
          placement,
          strategy: fixed ? "fixed" : "absolute",
          middleware
        });
        store == null ? void 0 : store.setState("currentPlacement", pos.placement);
        setPositioned(true);
        const x = roundByDPR(pos.x);
        const y = roundByDPR(pos.y);
        Object.assign(popoverElement.style, {
          top: "0",
          left: "0",
          transform: `translate3d(${x}px,${y}px,0)`
        });
        if (arrow22 && pos.middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = pos.middlewareData.arrow;
          const side = pos.placement.split("-")[0];
          const centerX = arrow22.clientWidth / 2;
          const centerY = arrow22.clientHeight / 2;
          const originX = arrowX != null ? arrowX + centerX : -centerX;
          const originY = arrowY != null ? arrowY + centerY : -centerY;
          popoverElement.style.setProperty(
            "--popover-transform-origin",
            {
              top: `${originX}px calc(100% + ${centerY}px)`,
              bottom: `${originX}px ${-centerY}px`,
              left: `calc(100% + ${centerX}px) ${originY}px`,
              right: `${-centerX}px ${originY}px`
            }[side]
          );
          Object.assign(arrow22.style, {
            left: arrowX != null ? `${arrowX}px` : "",
            top: arrowY != null ? `${arrowY}px` : "",
            [side]: "100%"
          });
        }
      };
      const update = async () => {
        if (hasCustomUpdatePosition) {
          await updatePositionProp({ updatePosition: updatePosition2 });
          setPositioned(true);
        } else {
          await updatePosition2();
        }
      };
      const cancelAutoUpdate = autoUpdate(anchor, popoverElement, update, {
        // JSDOM doesn't support ResizeObserver
        elementResize: typeof ResizeObserver === "function"
      });
      return () => {
        setPositioned(false);
        cancelAutoUpdate();
      };
    }, [
      store,
      rendered,
      popoverElement,
      arrowElement,
      anchorElement,
      popoverElement,
      placement,
      mounted,
      domReady,
      fixed,
      flip22,
      shift22,
      slide,
      overlap,
      sameWidth,
      fitViewport,
      gutter,
      arrowPadding,
      overflowPadding,
      getAnchorRectProp,
      hasCustomUpdatePosition,
      updatePositionProp
    ]);
    useSafeLayoutEffect(() => {
      if (!mounted)
        return;
      if (!domReady)
        return;
      if (!(popoverElement == null ? void 0 : popoverElement.isConnected))
        return;
      if (!(contentElement == null ? void 0 : contentElement.isConnected))
        return;
      const applyZIndex = () => {
        popoverElement.style.zIndex = getComputedStyle(contentElement).zIndex;
      };
      applyZIndex();
      let raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(applyZIndex);
      });
      return () => cancelAnimationFrame(raf);
    }, [mounted, domReady, popoverElement, contentElement]);
    const position = fixed ? "fixed" : "absolute";
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime19.jsx)(
        "div",
        __spreadProps(__spreadValues({}, wrapperProps), {
          style: __spreadValues({
            // https://floating-ui.com/docs/computeposition#initial-layout
            position,
            top: 0,
            left: 0,
            width: "max-content"
          }, wrapperProps == null ? void 0 : wrapperProps.style),
          ref: store == null ? void 0 : store.setPopoverElement,
          children: element
        })
      ),
      [store, position, wrapperProps]
    );
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime19.jsx)(PopoverScopedContextProvider, { value: store, children: element }),
      [store]
    );
    props = __spreadProps(__spreadValues({
      // data-placing is not part of the public API. We're setting this here so
      // we can wait for the popover to be positioned before other components
      // move focus into it. For example, this attribute is observed by the
      // Combobox component with the autoSelect behavior.
      "data-placing": !positioned || void 0
    }, props), {
      style: __spreadValues({
        position: "relative"
      }, props.style)
    });
    props = useDialog(__spreadProps(__spreadValues({
      store,
      modal,
      portal,
      preserveTabOrder,
      preserveTabOrderAnchor: disclosureElement || anchorElement,
      autoFocusOnShow: positioned && autoFocusOnShow
    }, props), {
      portalRef
    }));
    return props;
  }
);
var Popover = createDialogComponent(
  forwardRef2(function Popover2(props) {
    const htmlProps = usePopover(props);
    return createElement(TagName33, htmlProps);
  }),
  usePopoverProviderContext
);

// node_modules/@ariakit/react-core/esm/combobox/combobox-popover.js
var import_react40 = __toESM(require_react());
var TagName34 = "div";
function isController(target, ...ids) {
  if (!target)
    return false;
  if ("id" in target) {
    const selector2 = ids.filter(Boolean).map((id) => `[aria-controls~="${id}"]`).join(", ");
    if (!selector2)
      return false;
    return target.matches(selector2);
  }
  return false;
}
var useComboboxPopover = createHook(
  function useComboboxPopover2(_a) {
    var _b = _a, {
      store,
      modal,
      tabIndex,
      alwaysVisible,
      autoFocusOnHide = true,
      hideOnInteractOutside = true
    } = _b, props = __objRest(_b, [
      "store",
      "modal",
      "tabIndex",
      "alwaysVisible",
      "autoFocusOnHide",
      "hideOnInteractOutside"
    ]);
    const context = useComboboxProviderContext();
    store = store || context;
    invariant(
      store,
      "ComboboxPopover must receive a `store` prop or be wrapped in a ComboboxProvider component."
    );
    const baseElement = store.useState("baseElement");
    const hiddenByClickOutsideRef = (0, import_react40.useRef)(false);
    const treeSnapshotKey = useStoreState(
      store.tag,
      (state) => state == null ? void 0 : state.renderedItems.length
    );
    props = useComboboxList(__spreadValues({ store, alwaysVisible }, props));
    props = usePopover(__spreadProps(__spreadValues({
      store,
      modal,
      alwaysVisible,
      backdrop: false,
      autoFocusOnShow: false,
      finalFocus: baseElement,
      preserveTabOrderAnchor: null,
      unstable_treeSnapshotKey: treeSnapshotKey
    }, props), {
      // When the combobox popover is modal, we make sure to include the
      // combobox input and all the combobox controls (cancel, disclosure) in
      // the list of persistent elements so they make part of the modal context,
      // allowing users to tab through them.
      getPersistentElements() {
        var _a2;
        const elements2 = ((_a2 = props.getPersistentElements) == null ? void 0 : _a2.call(props)) || [];
        if (!modal)
          return elements2;
        if (!store)
          return elements2;
        const { contentElement, baseElement: baseElement2 } = store.getState();
        if (!baseElement2)
          return elements2;
        const doc = getDocument(baseElement2);
        const selectors = [];
        if (contentElement == null ? void 0 : contentElement.id) {
          selectors.push(`[aria-controls~="${contentElement.id}"]`);
        }
        if (baseElement2 == null ? void 0 : baseElement2.id) {
          selectors.push(`[aria-controls~="${baseElement2.id}"]`);
        }
        if (!selectors.length)
          return [...elements2, baseElement2];
        const selector2 = selectors.join(",");
        const controlElements = doc.querySelectorAll(selector2);
        return [...elements2, ...controlElements];
      },
      // The combobox popover should focus on the combobox input when it hides,
      // unless the event was triggered by a click outside the popover, in which
      // case the input shouldn't be re-focused.
      autoFocusOnHide(element) {
        if (isFalsyBooleanCallback(autoFocusOnHide, element))
          return false;
        if (hiddenByClickOutsideRef.current) {
          hiddenByClickOutsideRef.current = false;
          return false;
        }
        return true;
      },
      // Make sure we don't hide the popover when the user interacts with the
      // combobox cancel or the combobox disclosure buttons. They will have the
      // aria-controls attribute pointing to either the combobox input or the
      // combobox popover elements.
      hideOnInteractOutside(event) {
        var _a2, _b2;
        const state = store == null ? void 0 : store.getState();
        const contentId = (_a2 = state == null ? void 0 : state.contentElement) == null ? void 0 : _a2.id;
        const baseId = (_b2 = state == null ? void 0 : state.baseElement) == null ? void 0 : _b2.id;
        if (isController(event.target, contentId, baseId))
          return false;
        const result = typeof hideOnInteractOutside === "function" ? hideOnInteractOutside(event) : hideOnInteractOutside;
        if (result) {
          hiddenByClickOutsideRef.current = event.type === "click";
        }
        return result;
      }
    }));
    return props;
  }
);
var ComboboxPopover = createDialogComponent(
  forwardRef2(function ComboboxPopover2(props) {
    const htmlProps = useComboboxPopover(props);
    return createElement(TagName34, htmlProps);
  }),
  useComboboxProviderContext
);

// node_modules/@ariakit/react-core/esm/__chunks/6BE7QOX5.js
var import_react41 = __toESM(require_react(), 1);
var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
var TagName35 = "div";
var useCompositeRow = createHook(
  function useCompositeRow2(_a) {
    var _b = _a, {
      store,
      "aria-setsize": ariaSetSize,
      "aria-posinset": ariaPosInSet
    } = _b, props = __objRest(_b, [
      "store",
      "aria-setsize",
      "aria-posinset"
    ]);
    const context = useCompositeContext();
    store = store || context;
    invariant(
      store,
      "CompositeRow must be wrapped in a Composite component."
    );
    const id = useId(props.id);
    const baseElement = store.useState(
      (state) => state.baseElement || void 0
    );
    const providerValue = (0, import_react41.useMemo)(
      () => ({ id, baseElement, ariaSetSize, ariaPosInSet }),
      [id, baseElement, ariaSetSize, ariaPosInSet]
    );
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime20.jsx)(CompositeRowContext.Provider, { value: providerValue, children: element }),
      [providerValue]
    );
    props = __spreadValues({ id }, props);
    return removeUndefinedValues(props);
  }
);
var CompositeRow = forwardRef2(function CompositeRow2(props) {
  const htmlProps = useCompositeRow(props);
  return createElement(TagName35, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox-row.js
var TagName36 = "div";
var useComboboxRow = createHook(
  function useComboboxRow2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useComboboxScopedContext();
    store = store || context;
    invariant(
      store,
      "ComboboxRow must be wrapped in a ComboboxList or ComboboxPopover component"
    );
    const contentElement = store.useState("contentElement");
    const popupRole = getPopupRole(contentElement);
    const role = popupRole === "grid" ? "row" : "presentation";
    props = __spreadValues({ role }, props);
    props = useCompositeRow(__spreadValues({ store }, props));
    return props;
  }
);
var ComboboxRow = forwardRef2(function ComboboxRow2(props) {
  const htmlProps = useComboboxRow(props);
  return createElement(TagName36, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/LOI6GHIP.js
var TagName37 = "hr";
var useSeparator = createHook(
  function useSeparator2(_a) {
    var _b = _a, { orientation = "horizontal" } = _b, props = __objRest(_b, ["orientation"]);
    props = __spreadValues({
      role: "separator",
      "aria-orientation": orientation
    }, props);
    return props;
  }
);
var Separator = forwardRef2(function Separator2(props) {
  const htmlProps = useSeparator(props);
  return createElement(TagName37, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/WEEEI3KU.js
var TagName38 = "hr";
var useCompositeSeparator = createHook(function useCompositeSeparator2(_a) {
  var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
  const context = useCompositeContext();
  store = store || context;
  invariant(
    store,
    "CompositeSeparator must be wrapped in a Composite component."
  );
  const orientation = store.useState(
    (state) => state.orientation === "horizontal" ? "vertical" : "horizontal"
  );
  props = useSeparator(__spreadProps(__spreadValues({}, props), { orientation }));
  return props;
});
var CompositeSeparator = forwardRef2(function CompositeSeparator2(props) {
  const htmlProps = useCompositeSeparator(props);
  return createElement(TagName38, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox-separator.js
var TagName39 = "hr";
var useComboboxSeparator = createHook(function useComboboxSeparator2(_a) {
  var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
  const context = useComboboxScopedContext();
  store = store || context;
  invariant(
    store,
    "ComboboxSeparator must be wrapped in a ComboboxList or ComboboxPopover component."
  );
  props = useCompositeSeparator(__spreadValues({ store }, props));
  return props;
});
var ComboboxSeparator = forwardRef2(function ComboboxSeparator2(props) {
  const htmlProps = useComboboxSeparator(props);
  return createElement(TagName39, htmlProps);
});

// node_modules/@ariakit/react-core/esm/combobox/combobox-value.js
function ComboboxValue({ store, children: children3 } = {}) {
  const context = useComboboxContext();
  store = store || context;
  invariant(
    store,
    "ComboboxValue must receive a `store` prop or be wrapped in a ComboboxProvider component."
  );
  const value = store.useState("value");
  if (children3) {
    return children3(value);
  }
  return value;
}

// node_modules/@ariakit/react-core/esm/collection/collection.js
var import_jsx_runtime21 = __toESM(require_jsx_runtime());
var TagName40 = "div";
var useCollection = createHook(
  function useCollection2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useCollectionProviderContext();
    store = store || context;
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime21.jsx)(CollectionScopedContextProvider, { value: store, children: element }),
      [store]
    );
    return removeUndefinedValues(props);
  }
);
var Collection = forwardRef2(function Collection2(props) {
  const htmlProps = useCollection(props);
  return createElement(TagName40, htmlProps);
});

// node_modules/@ariakit/react-core/esm/collection/collection-provider.js
var import_jsx_runtime22 = __toESM(require_jsx_runtime());
function CollectionProvider(props = {}) {
  const store = useCollectionStore(props);
  return (0, import_jsx_runtime22.jsx)(CollectionContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/core/esm/checkbox/checkbox-store.js
function createCheckboxStore(props = {}) {
  var _a;
  throwOnConflictingProps(props, props.store);
  const syncState = (_a = props.store) == null ? void 0 : _a.getState();
  const initialState = {
    value: defaultValue(
      props.value,
      syncState == null ? void 0 : syncState.value,
      props.defaultValue,
      false
    )
  };
  const checkbox = createStore(initialState, props.store);
  return __spreadProps2(__spreadValues2({}, checkbox), {
    setValue: (value) => checkbox.setState("value", value)
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/EJOTW52C.js
function useCheckboxStoreProps(store, update, props) {
  useUpdateEffect(update, [props.store]);
  useStoreProps(store, props, "value", "setValue");
  return store;
}
function useCheckboxStore(props = {}) {
  const [store, update] = useStore(createCheckboxStore, props);
  return useCheckboxStoreProps(store, update, props);
}

// node_modules/@ariakit/react-core/esm/__chunks/AUGWLYYL.js
var ctx8 = createStoreContext();
var useCheckboxContext = ctx8.useContext;
var useCheckboxScopedContext = ctx8.useScopedContext;
var useCheckboxProviderContext = ctx8.useProviderContext;
var CheckboxContextProvider = ctx8.ContextProvider;
var CheckboxScopedContextProvider = ctx8.ScopedContextProvider;

// node_modules/@ariakit/react-core/esm/__chunks/U5ZVLSUU.js
var import_react42 = __toESM(require_react(), 1);
var import_jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
var TagName41 = "input";
function setMixed(element, mixed) {
  if (mixed) {
    element.indeterminate = true;
  } else if (element.indeterminate) {
    element.indeterminate = false;
  }
}
function isNativeCheckbox(tagName, type) {
  return tagName === "input" && (!type || type === "checkbox");
}
function getPrimitiveValue(value) {
  if (Array.isArray(value)) {
    return value.toString();
  }
  return value;
}
var useCheckbox = createHook(
  function useCheckbox2(_a) {
    var _b = _a, {
      store,
      name,
      value: valueProp,
      checked: checkedProp,
      defaultChecked
    } = _b, props = __objRest(_b, [
      "store",
      "name",
      "value",
      "checked",
      "defaultChecked"
    ]);
    const context = useCheckboxContext();
    store = store || context;
    const [_checked, setChecked] = (0, import_react42.useState)(defaultChecked != null ? defaultChecked : false);
    const checked = useStoreState(store, (state) => {
      if (checkedProp !== void 0)
        return checkedProp;
      if ((state == null ? void 0 : state.value) === void 0)
        return _checked;
      if (valueProp != null) {
        if (Array.isArray(state.value)) {
          const primitiveValue = getPrimitiveValue(valueProp);
          return state.value.includes(primitiveValue);
        }
        return state.value === valueProp;
      }
      if (Array.isArray(state.value))
        return false;
      if (typeof state.value === "boolean")
        return state.value;
      return false;
    });
    const ref = (0, import_react42.useRef)(null);
    const tagName = useTagName(ref, TagName41);
    const nativeCheckbox = isNativeCheckbox(tagName, props.type);
    const mixed = checked ? checked === "mixed" : void 0;
    const isChecked = checked === "mixed" ? false : checked;
    const disabled = disabledFromProps(props);
    const [propertyUpdated, schedulePropertyUpdate] = useForceUpdate();
    (0, import_react42.useEffect)(() => {
      const element = ref.current;
      if (!element)
        return;
      setMixed(element, mixed);
      if (nativeCheckbox)
        return;
      element.checked = isChecked;
      if (name !== void 0) {
        element.name = name;
      }
      if (valueProp !== void 0) {
        element.value = `${valueProp}`;
      }
    }, [propertyUpdated, mixed, nativeCheckbox, isChecked, name, valueProp]);
    const onChangeProp = props.onChange;
    const onChange = useEvent((event) => {
      if (disabled) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }
      setMixed(event.currentTarget, mixed);
      if (!nativeCheckbox) {
        event.currentTarget.checked = !event.currentTarget.checked;
        schedulePropertyUpdate();
      }
      onChangeProp == null ? void 0 : onChangeProp(event);
      if (event.defaultPrevented)
        return;
      const elementChecked = event.currentTarget.checked;
      setChecked(elementChecked);
      store == null ? void 0 : store.setValue((prevValue) => {
        if (valueProp == null)
          return elementChecked;
        const primitiveValue = getPrimitiveValue(valueProp);
        if (!Array.isArray(prevValue)) {
          return prevValue === primitiveValue ? false : primitiveValue;
        }
        if (elementChecked) {
          if (prevValue.includes(primitiveValue)) {
            return prevValue;
          }
          return [...prevValue, primitiveValue];
        }
        return prevValue.filter((v) => v !== primitiveValue);
      });
    });
    const onClickProp = props.onClick;
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      if (nativeCheckbox)
        return;
      onChange(event);
    });
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime23.jsx)(CheckboxCheckedContext.Provider, { value: isChecked, children: element }),
      [isChecked]
    );
    props = __spreadProps(__spreadValues({
      role: !nativeCheckbox ? "checkbox" : void 0,
      type: nativeCheckbox ? "checkbox" : void 0,
      "aria-checked": checked
    }, props), {
      ref: useMergeRefs(ref, props.ref),
      onChange,
      onClick
    });
    props = useCommand(__spreadValues({ clickOnEnter: !nativeCheckbox }, props));
    return removeUndefinedValues(__spreadValues({
      name: nativeCheckbox ? name : void 0,
      value: nativeCheckbox ? valueProp : void 0,
      checked: isChecked
    }, props));
  }
);
var Checkbox = forwardRef2(function Checkbox2(props) {
  const htmlProps = useCheckbox(props);
  return createElement(TagName41, htmlProps);
});

// node_modules/@ariakit/react-core/esm/checkbox/checkbox-provider.js
var import_jsx_runtime24 = __toESM(require_jsx_runtime());
function CheckboxProvider(props = {}) {
  const store = useCheckboxStore(props);
  return (0, import_jsx_runtime24.jsx)(CheckboxContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/core/esm/form/form-store.js
function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
function hasMessages(object) {
  return Object.keys(object).some((key) => {
    if (isObject(object[key])) {
      return hasMessages(object[key]);
    }
    return !!object[key];
  });
}
function get(values, path, defaultValue2) {
  var _a;
  const [key, ...rest] = Array.isArray(path) ? path : `${path}`.split(".");
  if (key == null || !values) {
    return defaultValue2;
  }
  if (!rest.length) {
    return (_a = values[key]) != null ? _a : defaultValue2;
  }
  return get(values[key], rest, defaultValue2);
}
function set(values, path, value) {
  const [k, ...rest] = Array.isArray(path) ? path : `${path}`.split(".");
  if (k == null)
    return values;
  const key = k;
  const isIntegerKey = isInteger(key);
  const nextValues = isIntegerKey ? values || [] : values || {};
  const nestedValues = nextValues[key];
  const result = rest.length && (Array.isArray(nestedValues) || isObject(nestedValues)) ? set(nestedValues, rest, value) : value;
  if (isIntegerKey) {
    const index = Number(key);
    if (values && Array.isArray(values)) {
      return [
        ...values.slice(0, index),
        result,
        ...values.slice(index + 1)
      ];
    }
    const nextValues2 = [];
    nextValues2[index] = result;
    return nextValues2;
  }
  return __spreadProps2(__spreadValues2({}, values), { [key]: result });
}
function setAll(values, value) {
  const result = {};
  const keys = Object.keys(values);
  for (const key of keys) {
    const currentValue = values[key];
    if (Array.isArray(currentValue)) {
      result[key] = currentValue.map((v) => {
        if (isObject(v)) {
          return setAll(v, value);
        }
        return value;
      });
    } else if (isObject(currentValue)) {
      result[key] = setAll(currentValue, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
function getNameHandler(cache, prevKeys = []) {
  const handler = {
    get(target, key) {
      if (["toString", "valueOf", Symbol.toPrimitive].includes(key)) {
        return () => prevKeys.join(".");
      }
      const nextKeys = [...prevKeys, key];
      const nextKey = nextKeys.join(".");
      if (cache[nextKey]) {
        return cache[nextKey];
      }
      const nextProxy = new Proxy(target, getNameHandler(cache, nextKeys));
      cache[nextKey] = nextProxy;
      return nextProxy;
    }
  };
  return handler;
}
function getStoreCallbacks(store) {
  return store == null ? void 0 : store.__unstableCallbacks;
}
function createNames() {
  const cache = /* @__PURE__ */ Object.create(null);
  return new Proxy(/* @__PURE__ */ Object.create(null), getNameHandler(cache));
}
function createFormStore(props = {}) {
  var _a;
  throwOnConflictingProps(props, props.store);
  const syncState = (_a = props.store) == null ? void 0 : _a.getState();
  const collection = createCollectionStore(props);
  const values = defaultValue(
    props.values,
    syncState == null ? void 0 : syncState.values,
    props.defaultValues,
    {}
  );
  const errors = defaultValue(
    props.errors,
    syncState == null ? void 0 : syncState.errors,
    props.defaultErrors,
    {}
  );
  const touched = defaultValue(
    props.touched,
    syncState == null ? void 0 : syncState.touched,
    props.defaultTouched,
    {}
  );
  const initialState = __spreadProps2(__spreadValues2({}, collection.getState()), {
    values,
    errors,
    touched,
    validating: defaultValue(syncState == null ? void 0 : syncState.validating, false),
    submitting: defaultValue(syncState == null ? void 0 : syncState.submitting, false),
    submitSucceed: defaultValue(syncState == null ? void 0 : syncState.submitSucceed, 0),
    submitFailed: defaultValue(syncState == null ? void 0 : syncState.submitFailed, 0),
    valid: !hasMessages(errors)
  });
  const form = createStore(initialState, collection, props.store);
  const syncCallbacks = getStoreCallbacks(props.store);
  const syncCallbacksState = syncCallbacks == null ? void 0 : syncCallbacks.getState();
  const callbacksInitialState = {
    validate: (syncCallbacksState == null ? void 0 : syncCallbacksState.validate) || [],
    submit: (syncCallbacksState == null ? void 0 : syncCallbacksState.submit) || []
  };
  const callbacks = createStore(callbacksInitialState, syncCallbacks);
  setup(form, () => init(callbacks));
  const validate = async () => {
    form.setState("validating", true);
    form.setState("errors", {});
    const validateCallbacks = callbacks.getState().validate;
    try {
      for (const callback of validateCallbacks) {
        await callback(form.getState());
      }
      await nextFrame();
      return !hasMessages(form.getState().errors);
    } finally {
      form.setState("validating", false);
    }
  };
  return __spreadProps2(__spreadValues2(__spreadValues2({}, collection), form), {
    names: createNames(),
    setValues: (values2) => form.setState("values", values2),
    getValue: (name) => get(form.getState().values, name),
    setValue: (name, value) => form.setState("values", (values2) => {
      const prevValue = get(values2, name);
      const nextValue = applyState(value, prevValue);
      if (nextValue === prevValue)
        return values2;
      return set(values2, name, nextValue);
    }),
    pushValue: (name, value) => form.setState("values", (values2) => {
      const array = get(values2, name, []);
      return set(values2, name, [...array, value]);
    }),
    removeValue: (name, index) => form.setState("values", (values2) => {
      const array = get(values2, name, []);
      return set(values2, name, [
        ...array.slice(0, index),
        null,
        ...array.slice(index + 1)
      ]);
    }),
    setErrors: (errors2) => form.setState("errors", errors2),
    getError: (name) => get(form.getState().errors, name),
    setError: (name, error) => form.setState("errors", (errors2) => {
      const prevError = get(errors2, name);
      const nextError = applyState(error, prevError);
      if (nextError === prevError)
        return errors2;
      return set(errors2, name, nextError);
    }),
    setTouched: (touched2) => form.setState("touched", touched2),
    getFieldTouched: (name) => !!get(form.getState().touched, name),
    setFieldTouched: (name, value) => form.setState("touched", (touched2) => {
      const prevValue = get(touched2, name);
      const nextValue = applyState(value, prevValue);
      if (nextValue === prevValue)
        return touched2;
      return set(touched2, name, nextValue);
    }),
    onValidate: (callback) => {
      callbacks.setState("validate", (callbacks2) => [...callbacks2, callback]);
      return () => {
        callbacks.setState(
          "validate",
          (callbacks2) => callbacks2.filter((c) => c !== callback)
        );
      };
    },
    validate,
    onSubmit: (callback) => {
      callbacks.setState("submit", (callbacks2) => [...callbacks2, callback]);
      return () => {
        callbacks.setState(
          "submit",
          (callbacks2) => callbacks2.filter((c) => c !== callback)
        );
      };
    },
    submit: async () => {
      form.setState("submitting", true);
      form.setState("touched", setAll(form.getState().values, true));
      try {
        if (await validate()) {
          const submitCallbacks = callbacks.getState().submit;
          for (const callback of submitCallbacks) {
            await callback(form.getState());
          }
          await nextFrame();
          if (!hasMessages(form.getState().errors)) {
            form.setState("submitSucceed", (count) => count + 1);
            return true;
          }
        }
        form.setState("submitFailed", (count) => count + 1);
        return false;
      } catch (error) {
        form.setState("submitFailed", (count) => count + 1);
        throw error;
      } finally {
        form.setState("submitting", false);
      }
    },
    reset: () => {
      form.setState("values", values);
      form.setState("errors", errors);
      form.setState("touched", touched);
      form.setState("validating", false);
      form.setState("submitting", false);
      form.setState("submitSucceed", 0);
      form.setState("submitFailed", 0);
    },
    // @ts-expect-error Internal
    __unstableCallbacks: callbacks
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/KD77H3QU.js
var import_react43 = __toESM(require_react(), 1);
function useFormStoreProps(store, update, props) {
  store = useCollectionStoreProps(store, update, props);
  useStoreProps(store, props, "values", "setValues");
  useStoreProps(store, props, "errors", "setErrors");
  useStoreProps(store, props, "touched", "setTouched");
  const useValue = (0, import_react43.useCallback)(
    (name) => store.useState(() => store.getValue(name)),
    [store]
  );
  const useValidate = (0, import_react43.useCallback)(
    (callback) => {
      callback = useEvent(callback);
      const items = store.useState("items");
      (0, import_react43.useEffect)(() => store.onValidate(callback), [items, callback]);
    },
    [store]
  );
  const useSubmit = (0, import_react43.useCallback)(
    (callback) => {
      callback = useEvent(callback);
      const items = store.useState("items");
      (0, import_react43.useEffect)(() => store.onSubmit(callback), [items, callback]);
    },
    [store]
  );
  return (0, import_react43.useMemo)(
    () => __spreadProps(__spreadValues({}, store), {
      useValue,
      useValidate,
      useSubmit
    }),
    []
  );
}
function useFormStore(props = {}) {
  const [store, update] = useStore(createFormStore, props);
  return useFormStoreProps(store, update, props);
}

// node_modules/@ariakit/react-core/esm/__chunks/XJENYSWS.js
var ctx9 = createStoreContext(
  [CollectionContextProvider],
  [CollectionScopedContextProvider]
);
var useFormContext = ctx9.useContext;
var useFormScopedContext = ctx9.useScopedContext;
var useFormProviderContext = ctx9.useProviderContext;
var FormContextProvider = ctx9.ContextProvider;
var FormScopedContextProvider = ctx9.ScopedContextProvider;

// node_modules/@ariakit/react-core/esm/form/form.js
var import_react44 = __toESM(require_react());
var import_jsx_runtime25 = __toESM(require_jsx_runtime());
var TagName42 = "form";
function isField(element, items) {
  return items.some(
    (item) => item.type === "field" && item.element === element
  );
}
function getFirstInvalidField(items) {
  return items.find(
    (item) => {
      var _a;
      return item.type === "field" && ((_a = item.element) == null ? void 0 : _a.getAttribute("aria-invalid")) === "true";
    }
  );
}
var useForm = createHook(function useForm2(_a) {
  var _b = _a, {
    store,
    validateOnChange = true,
    validateOnBlur = true,
    resetOnUnmount = false,
    resetOnSubmit = true,
    autoFocusOnSubmit = true
  } = _b, props = __objRest(_b, [
    "store",
    "validateOnChange",
    "validateOnBlur",
    "resetOnUnmount",
    "resetOnSubmit",
    "autoFocusOnSubmit"
  ]);
  const context = useFormContext();
  store = store || context;
  invariant(
    store,
    "Form must receive a `store` prop or be wrapped in a FormProvider component."
  );
  const ref = (0, import_react44.useRef)(null);
  const values = store.useState("values");
  const submitSucceed = store.useState("submitSucceed");
  const submitFailed = store.useState("submitFailed");
  const items = store.useState("items");
  const defaultValues = useInitialValue(values);
  (0, import_react44.useEffect)(
    () => resetOnUnmount ? store == null ? void 0 : store.reset : void 0,
    [resetOnUnmount, store]
  );
  useUpdateEffect(() => {
    if (!validateOnChange)
      return;
    if (values === defaultValues)
      return;
    store == null ? void 0 : store.validate();
  }, [validateOnChange, values, defaultValues, store]);
  (0, import_react44.useEffect)(() => {
    if (!resetOnSubmit)
      return;
    if (!submitSucceed)
      return;
    store == null ? void 0 : store.reset();
  }, [resetOnSubmit, submitSucceed, store]);
  const [shouldFocusOnSubmit, setShouldFocusOnSubmit] = (0, import_react44.useState)(false);
  (0, import_react44.useEffect)(() => {
    if (!shouldFocusOnSubmit)
      return;
    if (!submitFailed)
      return;
    const field = getFirstInvalidField(items);
    const element = field == null ? void 0 : field.element;
    if (!element)
      return;
    setShouldFocusOnSubmit(false);
    element.focus();
    if (isTextField(element)) {
      element.select();
    }
  }, [autoFocusOnSubmit, submitFailed, items]);
  const onSubmitProp = props.onSubmit;
  const onSubmit = useEvent((event) => {
    onSubmitProp == null ? void 0 : onSubmitProp(event);
    if (event.defaultPrevented)
      return;
    event.preventDefault();
    store == null ? void 0 : store.submit();
    if (!autoFocusOnSubmit)
      return;
    setShouldFocusOnSubmit(true);
  });
  const onBlurProp = props.onBlur;
  const onBlur = useEvent((event) => {
    onBlurProp == null ? void 0 : onBlurProp(event);
    if (event.defaultPrevented)
      return;
    if (!validateOnBlur)
      return;
    if (!store)
      return;
    if (!isField(event.target, store.getState().items))
      return;
    store.validate();
  });
  const onResetProp = props.onReset;
  const onReset = useEvent((event) => {
    onResetProp == null ? void 0 : onResetProp(event);
    if (event.defaultPrevented)
      return;
    event.preventDefault();
    store == null ? void 0 : store.reset();
  });
  props = useWrapElement(
    props,
    (element) => (0, import_jsx_runtime25.jsx)(FormScopedContextProvider, { value: store, children: element }),
    [store]
  );
  const tagName = useTagName(ref, TagName42);
  props = __spreadProps(__spreadValues({
    role: tagName !== "form" ? "form" : void 0,
    noValidate: true
  }, props), {
    ref: useMergeRefs(ref, props.ref),
    onSubmit,
    onBlur,
    onReset
  });
  return props;
});
var Form = forwardRef2(function Form2(props) {
  const htmlProps = useForm(props);
  return createElement(TagName42, htmlProps);
});

// node_modules/@ariakit/react-core/esm/form/form-provider.js
var import_jsx_runtime26 = __toESM(require_jsx_runtime());
function FormProvider(props = {}) {
  const store = useFormStore(props);
  return (0, import_jsx_runtime26.jsx)(FormContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/__chunks/ZRJAYXZW.js
var import_react45 = __toESM(require_react(), 1);
var TagName43 = "input";
function getNamedElement(ref, name) {
  const element = ref.current;
  if (!element)
    return null;
  if (element.name === name)
    return element;
  if (element.form) {
    return element.form.elements.namedItem(name);
  }
  const document2 = getDocument(element);
  return document2.getElementsByName(name)[0];
}
function useItem(store, name, type) {
  return store.useState(
    (state) => state.items.find((item) => item.type === type && item.name === name)
  );
}
var useFormControl = createHook(
  function useFormControl2(_a) {
    var _b = _a, {
      store,
      name: nameProp,
      getItem: getItemProp,
      touchOnBlur = true
    } = _b, props = __objRest(_b, [
      "store",
      "name",
      "getItem",
      "touchOnBlur"
    ]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormControl must be wrapped in a Form component."
    );
    const name = `${nameProp}`;
    const id = useId(props.id);
    const ref = (0, import_react45.useRef)(null);
    store.useValidate(async () => {
      const element = getNamedElement(ref, name);
      if (!element)
        return;
      await Promise.resolve();
      if ("validity" in element && !element.validity.valid) {
        store == null ? void 0 : store.setError(name, element.validationMessage);
      }
    });
    const getItem = (0, import_react45.useCallback)(
      (item) => {
        const nextItem = __spreadProps(__spreadValues({}, item), { id: id || item.id, name, type: "field" });
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, name, getItemProp]
    );
    const onBlurProp = props.onBlur;
    const touchOnBlurProp = useBooleanEvent(touchOnBlur);
    const onBlur = useEvent((event) => {
      onBlurProp == null ? void 0 : onBlurProp(event);
      if (event.defaultPrevented)
        return;
      if (!touchOnBlurProp(event))
        return;
      store == null ? void 0 : store.setFieldTouched(name, true);
    });
    const label = useItem(store, name, "label");
    const error = useItem(store, name, "error");
    const description = useItem(store, name, "description");
    const describedBy = cx(
      error == null ? void 0 : error.id,
      description == null ? void 0 : description.id,
      props["aria-describedby"]
    );
    const invalid = store.useState(
      () => !!(store == null ? void 0 : store.getError(name)) && store.getFieldTouched(name)
    );
    props = __spreadProps(__spreadValues({
      id,
      "aria-labelledby": label == null ? void 0 : label.id,
      "aria-invalid": invalid
    }, props), {
      "aria-describedby": describedBy || void 0,
      ref: useMergeRefs(ref, props.ref),
      onBlur
    });
    props = useCollectionItem(__spreadProps(__spreadValues({ store }, props), { name, getItem }));
    return props;
  }
);
var FormControl = memo2(
  forwardRef2(function FormControl2(props) {
    const htmlProps = useFormControl(props);
    return createElement(TagName43, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/form/form-checkbox.js
var TagName44 = "input";
var useFormCheckbox = createHook(
  function useFormCheckbox2(_a) {
    var _b = _a, {
      store,
      name: nameProp,
      value,
      checked,
      defaultChecked
    } = _b, props = __objRest(_b, [
      "store",
      "name",
      "value",
      "checked",
      "defaultChecked"
    ]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormCheckbox must be wrapped in a Form component."
    );
    const name = `${nameProp}`;
    const checkboxStore = useCheckboxStore({
      value: store.useValue(name),
      setValue: (value2) => store == null ? void 0 : store.setValue(name, value2)
    });
    props = useCheckbox(__spreadValues({ store: checkboxStore, value, checked }, props));
    props = useFormControl(__spreadValues({
      store,
      name,
      "aria-labelledby": void 0
    }, props));
    return props;
  }
);
var FormCheckbox = memo2(
  forwardRef2(function FormCheckbox2(props) {
    const htmlProps = useFormCheckbox(props);
    return createElement(TagName44, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/form/form-description.js
var import_react46 = __toESM(require_react());
var TagName45 = "div";
var useFormDescription = createHook(
  function useFormDescription2(_a) {
    var _b = _a, {
      store,
      name: nameProp,
      getItem: getItemProp
    } = _b, props = __objRest(_b, [
      "store",
      "name",
      "getItem"
    ]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormDescription must be wrapped in a Form component."
    );
    const id = useId(props.id);
    const ref = (0, import_react46.useRef)(null);
    const name = `${nameProp}`;
    const getItem = (0, import_react46.useCallback)(
      (item) => {
        const nextItem = __spreadProps(__spreadValues({}, item), {
          id: id || item.id,
          name,
          type: "description"
        });
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, name, getItemProp]
    );
    props = __spreadProps(__spreadValues({
      id
    }, props), {
      ref: useMergeRefs(ref, props.ref)
    });
    props = useCollectionItem(__spreadProps(__spreadValues({ store }, props), { getItem }));
    return props;
  }
);
var FormDescription = memo2(
  forwardRef2(function FormDescription2(props) {
    const htmlProps = useFormDescription(props);
    return createElement(TagName45, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/form/form-error.js
var import_react47 = __toESM(require_react());
var TagName46 = "div";
var useFormError = createHook(
  function useFormError2(_a) {
    var _b = _a, {
      store,
      name: nameProp,
      getItem: getItemProp
    } = _b, props = __objRest(_b, [
      "store",
      "name",
      "getItem"
    ]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormError must be wrapped in a Form component."
    );
    const id = useId(props.id);
    const ref = (0, import_react47.useRef)(null);
    const name = `${nameProp}`;
    const getItem = (0, import_react47.useCallback)(
      (item) => {
        const nextItem = __spreadProps(__spreadValues({}, item), { id: id || item.id, name, type: "error" });
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, name, getItemProp]
    );
    const children3 = store.useState(() => {
      const error = store == null ? void 0 : store.getError(name);
      if (error == null)
        return;
      if (!(store == null ? void 0 : store.getFieldTouched(name)))
        return;
      return error;
    });
    props = __spreadProps(__spreadValues({
      id,
      role: "alert",
      children: children3
    }, props), {
      ref: useMergeRefs(ref, props.ref)
    });
    props = useCollectionItem(__spreadProps(__spreadValues({ store }, props), { getItem }));
    return props;
  }
);
var FormError = memo2(
  forwardRef2(function FormError2(props) {
    const htmlProps = useFormError(props);
    return createElement(TagName46, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/form/form-field.js
var TagName47 = "input";
var useFormField = createHook(
  function useFormField2(props) {
    return useFormControl(props);
  }
);
var FormField = memo2(
  forwardRef2(function FormField2(props) {
    const htmlProps = useFormField(props);
    return createElement(TagName47, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/form/form-group-label.js
var TagName48 = "div";
var useFormGroupLabel = createHook(
  function useFormGroupLabel2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    props = useGroupLabel(props);
    return props;
  }
);
var FormGroupLabel = forwardRef2(function FormGroupLabel2(props) {
  const htmlProps = useFormGroupLabel(props);
  return createElement(TagName48, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/UPCYNCRR.js
var TagName49 = "div";
var useFormGroup = createHook(
  function useFormGroup2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    props = useGroup(props);
    return props;
  }
);
var FormGroup = forwardRef2(function FormGroup2(props) {
  const htmlProps = useFormGroup(props);
  return createElement(TagName49, htmlProps);
});

// node_modules/@ariakit/react-core/esm/form/form-input.js
var TagName50 = "input";
var useFormInput = createHook(
  function useFormInput2(_a) {
    var _b = _a, { store, name: nameProp } = _b, props = __objRest(_b, ["store", "name"]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormInput must be wrapped in a Form component."
    );
    const name = `${nameProp}`;
    const onChangeProp = props.onChange;
    const onChange = useEvent((event) => {
      onChangeProp == null ? void 0 : onChangeProp(event);
      if (event.defaultPrevented)
        return;
      store == null ? void 0 : store.setValue(name, event.target.value);
    });
    const value = store.useValue(name);
    props = __spreadProps(__spreadValues({
      value
    }, props), {
      onChange
    });
    props = useFocusable(props);
    props = useFormControl(__spreadValues({ store, name }, props));
    return props;
  }
);
var FormInput = memo2(
  forwardRef2(function FormInput2(props) {
    const htmlProps = useFormInput(props);
    return createElement(TagName50, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/form/form-label.js
var import_react48 = __toESM(require_react());
var import_jsx_runtime27 = __toESM(require_jsx_runtime());
var TagName51 = "label";
function supportsNativeLabel(tagName) {
  return tagName === "input" || tagName === "textarea" || tagName === "select" || tagName === "meter" || tagName === "progress";
}
var useFormLabel = createHook(
  function useFormLabel2(_a) {
    var _b = _a, {
      store,
      name: nameProp,
      getItem: getItemProp
    } = _b, props = __objRest(_b, [
      "store",
      "name",
      "getItem"
    ]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormLabel must be wrapped in a Form component."
    );
    const id = useId(props.id);
    const ref = (0, import_react48.useRef)(null);
    const name = `${nameProp}`;
    const getItem = (0, import_react48.useCallback)(
      (item) => {
        const nextItem = __spreadProps(__spreadValues({}, item), { id: id || item.id, name, type: "label" });
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, name, getItemProp]
    );
    const field = store.useState(
      (state) => state.items.find((item) => item.type === "field" && item.name === name)
    );
    const fieldTagName = useTagName(field == null ? void 0 : field.element, "input");
    const isNativeLabel = supportsNativeLabel(fieldTagName);
    const onClickProp = props.onClick;
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      if (isNativeLabel)
        return;
      const fieldElement = field == null ? void 0 : field.element;
      if (!fieldElement)
        return;
      queueMicrotask(() => {
        const focusableElement = getFirstTabbableIn(fieldElement, true, true);
        focusableElement == null ? void 0 : focusableElement.focus();
        const role = focusableElement == null ? void 0 : focusableElement.getAttribute("role");
        if (role === "combobox")
          return;
        focusableElement == null ? void 0 : focusableElement.click();
      });
    });
    props = __spreadProps(__spreadValues({
      id,
      render: isNativeLabel ? (0, import_jsx_runtime27.jsx)("label", {}) : (0, import_jsx_runtime27.jsx)("span", {}),
      htmlFor: isNativeLabel ? field == null ? void 0 : field.id : void 0
    }, props), {
      ref: useMergeRefs(ref, props.ref),
      onClick
    });
    if (!isNativeLabel) {
      props = __spreadProps(__spreadValues({}, props), {
        style: __spreadValues({
          cursor: "default"
        }, props.style)
      });
    }
    props = useCollectionItem(__spreadProps(__spreadValues({ store }, props), { getItem }));
    return props;
  }
);
var FormLabel = memo2(
  forwardRef2(function FormLabel2(props) {
    const htmlProps = useFormLabel(props);
    return createElement(TagName51, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/form/form-push.js
var import_react49 = __toESM(require_react());
var TagName52 = "button";
function getFirstFieldsByName(items, name) {
  if (!items)
    return [];
  const fields = [];
  for (const item of items) {
    if (item.type !== "field")
      continue;
    if (!item.name.startsWith(name))
      continue;
    const nameWithIndex = item.name.replace(/(\.\d+)\..+$/, "$1");
    const regex = new RegExp(`^${nameWithIndex}`);
    if (!fields.some((i) => regex.test(i.name))) {
      fields.push(item);
    }
  }
  return fields;
}
var useFormPush = createHook(
  function useFormPush2(_a) {
    var _b = _a, {
      store,
      value,
      name: nameProp,
      getItem: getItemProp,
      autoFocusOnClick = true
    } = _b, props = __objRest(_b, [
      "store",
      "value",
      "name",
      "getItem",
      "autoFocusOnClick"
    ]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormPush must be wrapped in a Form component."
    );
    const name = `${nameProp}`;
    const [shouldFocus, setShouldFocus] = (0, import_react49.useState)(false);
    (0, import_react49.useEffect)(() => {
      var _a2;
      if (!shouldFocus)
        return;
      const items = getFirstFieldsByName(store == null ? void 0 : store.getState().items, name);
      const element = (_a2 = items == null ? void 0 : items[items.length - 1]) == null ? void 0 : _a2.element;
      if (!element)
        return;
      element.focus();
      setShouldFocus(false);
    }, [store, shouldFocus, name]);
    const getItem = (0, import_react49.useCallback)(
      (item) => {
        const nextItem = __spreadProps(__spreadValues({}, item), { type: "button", name });
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [name, getItemProp]
    );
    const onClickProp = props.onClick;
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      store == null ? void 0 : store.pushValue(name, value);
      if (!autoFocusOnClick)
        return;
      setShouldFocus(true);
    });
    props = __spreadProps(__spreadValues({}, props), {
      onClick
    });
    props = useButton(props);
    props = useCollectionItem(__spreadProps(__spreadValues({ store }, props), { getItem }));
    return props;
  }
);
var FormPush = forwardRef2(function FormPush2(props) {
  const htmlProps = useFormPush(props);
  return createElement(TagName52, htmlProps);
});

// node_modules/@ariakit/react-core/esm/form/form-radio-group.js
var TagName53 = "div";
var useFormRadioGroup = createHook(
  function useFormRadioGroup2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    props = __spreadValues({ role: "radiogroup" }, props);
    props = useFormGroup(props);
    return props;
  }
);
var FormRadioGroup = forwardRef2(function FormRadioGroup2(props) {
  const htmlProps = useFormRadioGroup(props);
  return createElement(TagName53, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/SOKV3TSX.js
var ctx10 = createStoreContext(
  [CompositeContextProvider],
  [CompositeScopedContextProvider]
);
var useRadioContext = ctx10.useContext;
var useRadioScopedContext = ctx10.useScopedContext;
var useRadioProviderContext = ctx10.useProviderContext;
var RadioContextProvider = ctx10.ContextProvider;
var RadioScopedContextProvider = ctx10.ScopedContextProvider;

// node_modules/@ariakit/react-core/esm/__chunks/6N3EKIOI.js
var import_react50 = __toESM(require_react(), 1);
var TagName54 = "input";
function getIsChecked(value, storeValue) {
  if (storeValue === void 0)
    return;
  if (value != null && storeValue != null) {
    return storeValue === value;
  }
  return !!storeValue;
}
function isNativeRadio(tagName, type) {
  return tagName === "input" && (!type || type === "radio");
}
var useRadio = createHook(function useRadio2(_a) {
  var _b = _a, {
    store,
    name,
    value,
    checked
  } = _b, props = __objRest(_b, [
    "store",
    "name",
    "value",
    "checked"
  ]);
  const context = useRadioContext();
  store = store || context;
  const id = useId(props.id);
  const ref = (0, import_react50.useRef)(null);
  const isChecked = useStoreState(
    store,
    (state) => checked != null ? checked : getIsChecked(value, state == null ? void 0 : state.value)
  );
  (0, import_react50.useEffect)(() => {
    if (!id)
      return;
    if (!isChecked)
      return;
    const isActiveItem = (store == null ? void 0 : store.getState().activeId) === id;
    if (isActiveItem)
      return;
    store == null ? void 0 : store.setActiveId(id);
  }, [store, isChecked, id]);
  const onChangeProp = props.onChange;
  const tagName = useTagName(ref, TagName54);
  const nativeRadio = isNativeRadio(tagName, props.type);
  const disabled = disabledFromProps(props);
  const [propertyUpdated, schedulePropertyUpdate] = useForceUpdate();
  (0, import_react50.useEffect)(() => {
    const element = ref.current;
    if (!element)
      return;
    if (nativeRadio)
      return;
    if (isChecked !== void 0) {
      element.checked = isChecked;
    }
    if (name !== void 0) {
      element.name = name;
    }
    if (value !== void 0) {
      element.value = `${value}`;
    }
  }, [propertyUpdated, nativeRadio, isChecked, name, value]);
  const onChange = useEvent((event) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!nativeRadio) {
      event.currentTarget.checked = true;
      schedulePropertyUpdate();
    }
    onChangeProp == null ? void 0 : onChangeProp(event);
    if (event.defaultPrevented)
      return;
    store == null ? void 0 : store.setValue(value);
  });
  const onClickProp = props.onClick;
  const onClick = useEvent((event) => {
    onClickProp == null ? void 0 : onClickProp(event);
    if (event.defaultPrevented)
      return;
    if (nativeRadio)
      return;
    onChange(event);
  });
  const onFocusProp = props.onFocus;
  const onFocus = useEvent((event) => {
    onFocusProp == null ? void 0 : onFocusProp(event);
    if (event.defaultPrevented)
      return;
    if (!nativeRadio)
      return;
    if (!store)
      return;
    const { moves, activeId } = store.getState();
    if (!moves)
      return;
    if (id && activeId !== id)
      return;
    onChange(event);
  });
  props = __spreadProps(__spreadValues({
    id,
    role: !nativeRadio ? "radio" : void 0,
    type: nativeRadio ? "radio" : void 0,
    "aria-checked": isChecked
  }, props), {
    ref: useMergeRefs(ref, props.ref),
    onChange,
    onClick,
    onFocus
  });
  props = useCompositeItem(__spreadValues({
    store,
    clickOnEnter: !nativeRadio
  }, props));
  return removeUndefinedValues(__spreadValues({
    name: nativeRadio ? name : void 0,
    value: nativeRadio ? value : void 0,
    checked: isChecked
  }, props));
});
var Radio = memo2(
  forwardRef2(function Radio2(props) {
    const htmlProps = useRadio(props);
    return createElement(TagName54, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/form/form-radio.js
var TagName55 = "input";
var useFormRadio = createHook(
  function useFormRadio2(_a) {
    var _b = _a, { store, name: nameProp, value } = _b, props = __objRest(_b, ["store", "name", "value"]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormRadio must be wrapped in a Form component."
    );
    const name = `${nameProp}`;
    const onChangeProp = props.onChange;
    const onChange = useEvent((event) => {
      onChangeProp == null ? void 0 : onChangeProp(event);
      if (event.defaultPrevented)
        return;
      store == null ? void 0 : store.setValue(name, value);
    });
    const checkedProp = props.checked;
    const checked = store.useState(
      () => checkedProp != null ? checkedProp : (store == null ? void 0 : store.getValue(name)) === value
    );
    props = __spreadProps(__spreadValues({}, props), {
      checked,
      onChange
    });
    props = useRadio(__spreadValues({ value }, props));
    props = useFormControl(__spreadValues({
      store,
      name,
      "aria-labelledby": void 0
    }, props));
    return props;
  }
);
var FormRadio = memo2(
  forwardRef2(function FormRadio2(props) {
    const htmlProps = useFormRadio(props);
    return createElement(TagName55, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/form/form-remove.js
var TagName56 = "button";
function findNextOrPreviousField(items, name, index) {
  const fields = items == null ? void 0 : items.filter(
    (item) => item.type === "field" && item.name.startsWith(name)
  );
  const regex = new RegExp(`^${name}\\.(\\d+)`);
  const nextField = fields == null ? void 0 : fields.find((field) => {
    const fieldIndex = field.name.replace(regex, "$1");
    return Number.parseInt(fieldIndex) > index;
  });
  if (nextField)
    return nextField;
  return fields == null ? void 0 : fields.reverse().find((field) => {
    const fieldIndex = field.name.replace(regex, "$1");
    return Number.parseInt(fieldIndex) < index;
  });
}
function findPushButton(items, name) {
  return items == null ? void 0 : items.find((item) => item.type === "button" && item.name === name);
}
var useFormRemove = createHook(
  function useFormRemove2(_a) {
    var _b = _a, {
      store,
      name: nameProp,
      index,
      autoFocusOnClick = true
    } = _b, props = __objRest(_b, [
      "store",
      "name",
      "index",
      "autoFocusOnClick"
    ]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormRemove must be wrapped in a Form component."
    );
    const name = `${nameProp}`;
    const onClickProp = props.onClick;
    const onClick = useEvent((event) => {
      var _a2;
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      if (!store)
        return;
      store.removeValue(name, index);
      if (!autoFocusOnClick)
        return;
      const { items } = store.getState();
      const item = findNextOrPreviousField(items, name, index);
      const element = item == null ? void 0 : item.element;
      if (element) {
        element.focus();
        if (isTextField(element)) {
          element.select();
        }
      } else {
        const pushButton = findPushButton(items, name);
        (_a2 = pushButton == null ? void 0 : pushButton.element) == null ? void 0 : _a2.focus();
      }
    });
    props = __spreadProps(__spreadValues({}, props), {
      onClick
    });
    props = useButton(props);
    return props;
  }
);
var FormRemove = forwardRef2(function FormRemove2(props) {
  const htmlProps = useFormRemove(props);
  return createElement(TagName56, htmlProps);
});

// node_modules/@ariakit/react-core/esm/form/form-reset.js
var TagName57 = "button";
var useFormReset = createHook(
  function useFormReset2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormReset must be wrapped in a Form component."
    );
    props = __spreadValues({
      type: "reset",
      disabled: store.useState("submitting")
    }, props);
    props = useButton(props);
    return props;
  }
);
var FormReset = forwardRef2(function FormReset2(props) {
  const htmlProps = useFormReset(props);
  return createElement(TagName57, htmlProps);
});

// node_modules/@ariakit/react-core/esm/form/form-submit.js
var TagName58 = "button";
var useFormSubmit = createHook(
  function useFormSubmit2(_a) {
    var _b = _a, { store, accessibleWhenDisabled = true } = _b, props = __objRest(_b, ["store", "accessibleWhenDisabled"]);
    const context = useFormContext();
    store = store || context;
    invariant(
      store,
      "FormSubmit must be wrapped in a Form component."
    );
    props = __spreadValues({
      type: "submit",
      disabled: store.useState("submitting")
    }, props);
    props = useButton(__spreadProps(__spreadValues({}, props), { accessibleWhenDisabled }));
    return props;
  }
);
var FormSubmit = forwardRef2(function FormSubmit2(props) {
  const htmlProps = useFormSubmit(props);
  return createElement(TagName58, htmlProps);
});

// node_modules/@ariakit/react-core/esm/focus-trap/focus-trap-region.js
var import_react51 = __toESM(require_react());
var import_jsx_runtime28 = __toESM(require_jsx_runtime());
var TagName59 = "div";
var useFocusTrapRegion = createHook(
  function useFocusTrapRegion2(_a) {
    var _b = _a, { enabled = false } = _b, props = __objRest(_b, ["enabled"]);
    const ref = (0, import_react51.useRef)(null);
    props = useWrapElement(
      props,
      (element) => {
        const renderFocusTrap = () => {
          if (!enabled)
            return null;
          return (0, import_jsx_runtime28.jsx)(
            FocusTrap,
            {
              onFocus: (event) => {
                const container = ref.current;
                if (!container)
                  return;
                const tabbables = getAllTabbableIn(container, true);
                const first = tabbables[0];
                const last = tabbables[tabbables.length - 1];
                if (!tabbables.length) {
                  container.focus();
                  return;
                }
                if (event.relatedTarget === first) {
                  last == null ? void 0 : last.focus();
                } else {
                  first == null ? void 0 : first.focus();
                }
              }
            }
          );
        };
        return (0, import_jsx_runtime28.jsxs)(import_jsx_runtime28.Fragment, { children: [
          renderFocusTrap(),
          element,
          renderFocusTrap()
        ] });
      },
      [enabled]
    );
    props = __spreadProps(__spreadValues({}, props), {
      ref: useMergeRefs(ref, props.ref)
    });
    return removeUndefinedValues(props);
  }
);
var FocusTrapRegion = forwardRef2(function FocusTrapRegion2(props) {
  const htmlProps = useFocusTrapRegion(props);
  return createElement(TagName59, htmlProps);
});

// node_modules/@ariakit/react-core/esm/disclosure/disclosure-provider.js
var import_jsx_runtime29 = __toESM(require_jsx_runtime());
function DisclosureProvider(props = {}) {
  const store = useDisclosureStore(props);
  return (0, import_jsx_runtime29.jsx)(DisclosureContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/dialog/dialog-provider.js
var import_jsx_runtime30 = __toESM(require_jsx_runtime());
function DialogProvider(props = {}) {
  const store = useDialogStore(props);
  return (0, import_jsx_runtime30.jsx)(DialogContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/__chunks/O37V6X5C.js
var import_react52 = __toESM(require_react(), 1);
var TagName60 = "p";
var useDialogDescription = createHook(function useDialogDescription2(_a) {
  var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
  const setDescriptionId = (0, import_react52.useContext)(DialogDescriptionContext);
  const id = useId(props.id);
  useSafeLayoutEffect(() => {
    setDescriptionId == null ? void 0 : setDescriptionId(id);
    return () => setDescriptionId == null ? void 0 : setDescriptionId(void 0);
  }, [setDescriptionId, id]);
  props = __spreadValues({
    id
  }, props);
  return removeUndefinedValues(props);
});
var DialogDescription = forwardRef2(function DialogDescription2(props) {
  const htmlProps = useDialogDescription(props);
  return createElement(TagName60, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/2HYYGA6R.js
var import_react53 = __toESM(require_react(), 1);
var import_jsx_runtime31 = __toESM(require_jsx_runtime(), 1);
var TagName61 = "button";
var useDialogDismiss = createHook(
  function useDialogDismiss2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useDialogScopedContext();
    store = store || context;
    const onClickProp = props.onClick;
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      store == null ? void 0 : store.hide();
    });
    const children3 = (0, import_react53.useMemo)(
      () => (0, import_jsx_runtime31.jsxs)(
        "svg",
        {
          "aria-label": "Dismiss popup",
          display: "block",
          fill: "none",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 1.5,
          viewBox: "0 0 16 16",
          height: "1em",
          width: "1em",
          children: [
            (0, import_jsx_runtime31.jsx)("line", { x1: "4", y1: "4", x2: "12", y2: "12" }),
            (0, import_jsx_runtime31.jsx)("line", { x1: "4", y1: "12", x2: "12", y2: "4" })
          ]
        }
      ),
      []
    );
    props = __spreadProps(__spreadValues({
      "data-dialog-dismiss": "",
      children: children3
    }, props), {
      onClick
    });
    props = useButton(props);
    return props;
  }
);
var DialogDismiss = forwardRef2(function DialogDismiss2(props) {
  const htmlProps = useDialogDismiss(props);
  return createElement(TagName61, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/OYB5INBF.js
var import_react54 = __toESM(require_react(), 1);
var import_jsx_runtime32 = __toESM(require_jsx_runtime(), 1);
var TagName62 = "h1";
var useHeading = createHook(
  function useHeading2(props) {
    const ref = (0, import_react54.useRef)(null);
    const level = (0, import_react54.useContext)(HeadingContext) || 1;
    const Element2 = `h${level}`;
    const tagName = useTagName(ref, Element2);
    const isNativeHeading = (0, import_react54.useMemo)(
      () => !!tagName && /^h\d$/.test(tagName),
      [tagName]
    );
    props = __spreadProps(__spreadValues({
      render: (0, import_jsx_runtime32.jsx)(Element2, {}),
      role: !isNativeHeading ? "heading" : void 0,
      "aria-level": !isNativeHeading ? level : void 0
    }, props), {
      ref: useMergeRefs(ref, props.ref)
    });
    return props;
  }
);
var Heading = forwardRef2(function Heading2(props) {
  const htmlProps = useHeading(props);
  return createElement(TagName62, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/6FZVKQWP.js
var import_react55 = __toESM(require_react(), 1);
var TagName63 = "h1";
var useDialogHeading = createHook(
  function useDialogHeading2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const setHeadingId = (0, import_react55.useContext)(DialogHeadingContext);
    const id = useId(props.id);
    useSafeLayoutEffect(() => {
      setHeadingId == null ? void 0 : setHeadingId(id);
      return () => setHeadingId == null ? void 0 : setHeadingId(void 0);
    }, [setHeadingId, id]);
    props = __spreadValues({
      id
    }, props);
    props = useHeading(props);
    return props;
  }
);
var DialogHeading = forwardRef2(function DialogHeading2(props) {
  const htmlProps = useDialogHeading(props);
  return createElement(TagName63, htmlProps);
});

// node_modules/@ariakit/react-core/esm/composite/composite-provider.js
var import_jsx_runtime33 = __toESM(require_jsx_runtime());
function CompositeProvider(props = {}) {
  const store = useCompositeStore(props);
  return (0, import_jsx_runtime33.jsx)(CompositeContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/__chunks/DS36B3MQ.js
var import_react56 = __toESM(require_react(), 1);
var TagName64 = "div";
var chars = "";
function clearChars() {
  chars = "";
}
function isValidTypeaheadEvent(event) {
  const target = event.target;
  if (target && isTextField(target))
    return false;
  if (event.key === " " && chars.length)
    return true;
  return event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey && /^[\p{Letter}\p{Number}]$/u.test(event.key);
}
function isSelfTargetOrItem(event, items) {
  if (isSelfTarget(event))
    return true;
  const target = event.target;
  if (!target)
    return false;
  const isItem2 = items.some((item) => item.element === target);
  return isItem2;
}
function getEnabledItems2(items) {
  return items.filter((item) => !item.disabled);
}
function itemTextStartsWith(item, text) {
  var _a;
  const itemText = ((_a = item.element) == null ? void 0 : _a.textContent) || item.children || // The composite item object itself doesn't include a value property, but
  // other components like Select do. Since CompositeTypeahead is a generic
  // component that can be used with those as well, we also consider the value
  // property as a fallback for the typeahead text content.
  "value" in item && item.value;
  if (!itemText)
    return false;
  return normalizeString(itemText).trim().toLowerCase().startsWith(text.toLowerCase());
}
function getSameInitialItems(items, char, activeId) {
  if (!activeId)
    return items;
  const activeItem = items.find((item) => item.id === activeId);
  if (!activeItem)
    return items;
  if (!itemTextStartsWith(activeItem, char))
    return items;
  if (chars !== char && itemTextStartsWith(activeItem, chars))
    return items;
  chars = char;
  return flipItems2(
    items.filter((item) => itemTextStartsWith(item, chars)),
    activeId
  ).filter((item) => item.id !== activeId);
}
var useCompositeTypeahead = createHook(function useCompositeTypeahead2(_a) {
  var _b = _a, { store, typeahead = true } = _b, props = __objRest(_b, ["store", "typeahead"]);
  const context = useCompositeContext();
  store = store || context;
  invariant(
    store,
    "CompositeTypeahead must be a Composite component"
  );
  const onKeyDownCaptureProp = props.onKeyDownCapture;
  const cleanupTimeoutRef = (0, import_react56.useRef)(0);
  const onKeyDownCapture = useEvent((event) => {
    onKeyDownCaptureProp == null ? void 0 : onKeyDownCaptureProp(event);
    if (event.defaultPrevented)
      return;
    if (!typeahead)
      return;
    if (!store)
      return;
    const { renderedItems, items, activeId } = store.getState();
    if (!isValidTypeaheadEvent(event))
      return clearChars();
    let enabledItems = getEnabledItems2(
      renderedItems.length ? renderedItems : items
    );
    if (!isSelfTargetOrItem(event, enabledItems))
      return clearChars();
    event.preventDefault();
    window.clearTimeout(cleanupTimeoutRef.current);
    cleanupTimeoutRef.current = window.setTimeout(() => {
      chars = "";
    }, 500);
    const char = event.key.toLowerCase();
    chars += char;
    enabledItems = getSameInitialItems(enabledItems, char, activeId);
    const item = enabledItems.find((item2) => itemTextStartsWith(item2, chars));
    if (item) {
      store.move(item.id);
    } else {
      clearChars();
    }
  });
  props = __spreadProps(__spreadValues({}, props), {
    onKeyDownCapture
  });
  return removeUndefinedValues(props);
});
var CompositeTypeahead = forwardRef2(function CompositeTypeahead2(props) {
  const htmlProps = useCompositeTypeahead(props);
  return createElement(TagName64, htmlProps);
});

// node_modules/@ariakit/core/esm/radio/radio-store.js
function createRadioStore(_a = {}) {
  var props = __objRest2(_a, []);
  var _a2;
  const syncState = (_a2 = props.store) == null ? void 0 : _a2.getState();
  const composite = createCompositeStore(__spreadProps2(__spreadValues2({}, props), {
    focusLoop: defaultValue(props.focusLoop, syncState == null ? void 0 : syncState.focusLoop, true)
  }));
  const initialState = __spreadProps2(__spreadValues2({}, composite.getState()), {
    value: defaultValue(
      props.value,
      syncState == null ? void 0 : syncState.value,
      props.defaultValue,
      null
    )
  });
  const radio = createStore(initialState, composite, props.store);
  return __spreadProps2(__spreadValues2(__spreadValues2({}, composite), radio), {
    setValue: (value) => radio.setState("value", value)
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/DYHFBFEH.js
function useRadioStoreProps(store, update, props) {
  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "value", "setValue");
  return store;
}
function useRadioStore(props = {}) {
  const [store, update] = useStore(createRadioStore, props);
  return useRadioStoreProps(store, update, props);
}

// node_modules/@ariakit/react-core/esm/radio/radio-provider.js
var import_jsx_runtime34 = __toESM(require_jsx_runtime());
function RadioProvider(props = {}) {
  const store = useRadioStore(props);
  return (0, import_jsx_runtime34.jsx)(RadioContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/radio/radio-group.js
var import_jsx_runtime35 = __toESM(require_jsx_runtime());
var TagName65 = "div";
var useRadioGroup = createHook(
  function useRadioGroup2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useRadioProviderContext();
    store = store || context;
    invariant(
      store,
      "RadioGroup must receive a `store` prop or be wrapped in a RadioProvider component."
    );
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime35.jsx)(RadioScopedContextProvider, { value: store, children: element }),
      [store]
    );
    props = __spreadValues({
      role: "radiogroup"
    }, props);
    props = useComposite(__spreadValues({ store }, props));
    return props;
  }
);
var RadioGroup = forwardRef2(function RadioGroup2(props) {
  const htmlProps = useRadioGroup(props);
  return createElement(TagName65, htmlProps);
});

// node_modules/@ariakit/react-core/esm/popover/popover-provider.js
var import_jsx_runtime36 = __toESM(require_jsx_runtime());
function PopoverProvider(props = {}) {
  const store = usePopoverStore(props);
  return (0, import_jsx_runtime36.jsx)(PopoverContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/__chunks/QFL5V2DO.js
var POPOVER_ARROW_PATH = "M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z";

// node_modules/@ariakit/react-core/esm/__chunks/QS6GU7GL.js
var import_react57 = __toESM(require_react(), 1);
var import_jsx_runtime37 = __toESM(require_jsx_runtime(), 1);
var TagName66 = "div";
var defaultSize = 30;
var halfDefaultSize = defaultSize / 2;
var rotateMap = {
  top: `rotate(180 ${halfDefaultSize} ${halfDefaultSize})`,
  right: `rotate(-90 ${halfDefaultSize} ${halfDefaultSize})`,
  bottom: `rotate(0 ${halfDefaultSize} ${halfDefaultSize})`,
  left: `rotate(90 ${halfDefaultSize} ${halfDefaultSize})`
};
function useComputedStyle(store) {
  const [style, setStyle] = (0, import_react57.useState)();
  const contentElement = store.useState("contentElement");
  useSafeLayoutEffect(() => {
    if (!contentElement)
      return;
    const win = getWindow(contentElement);
    const computedStyle = win.getComputedStyle(contentElement);
    setStyle(computedStyle);
  }, [contentElement]);
  return style;
}
var usePopoverArrow = createHook(
  function usePopoverArrow2(_a) {
    var _b = _a, { store, size: size3 = defaultSize } = _b, props = __objRest(_b, ["store", "size"]);
    const context = usePopoverContext();
    store = store || context;
    invariant(
      store,
      "PopoverArrow must be wrapped in a Popover component."
    );
    const dir = store.useState(
      (state) => state.currentPlacement.split("-")[0]
    );
    const style = useComputedStyle(store);
    const fill = (style == null ? void 0 : style.getPropertyValue("background-color")) || "none";
    const stroke = (style == null ? void 0 : style.getPropertyValue(`border-${dir}-color`)) || "none";
    const borderWidth = (style == null ? void 0 : style.getPropertyValue(`border-${dir}-width`)) || "0px";
    const strokeWidth = Number.parseInt(borderWidth) * 2 * (defaultSize / size3);
    const transform = rotateMap[dir];
    const children3 = (0, import_react57.useMemo)(
      () => (0, import_jsx_runtime37.jsx)("svg", { display: "block", viewBox: "0 0 30 30", children: (0, import_jsx_runtime37.jsxs)("g", { transform, children: [
        (0, import_jsx_runtime37.jsx)("path", { fill: "none", d: POPOVER_ARROW_PATH }),
        (0, import_jsx_runtime37.jsx)("path", { stroke: "none", d: POPOVER_ARROW_PATH })
      ] }) }),
      [transform]
    );
    props = __spreadProps(__spreadValues({
      children: children3,
      "aria-hidden": true
    }, props), {
      ref: useMergeRefs(store.setArrowElement, props.ref),
      style: __spreadValues({
        // server side rendering
        position: "absolute",
        fontSize: size3,
        width: "1em",
        height: "1em",
        pointerEvents: "none",
        fill,
        stroke,
        strokeWidth
      }, props.style)
    });
    return removeUndefinedValues(props);
  }
);
var PopoverArrow = forwardRef2(function PopoverArrow2(props) {
  const htmlProps = usePopoverArrow(props);
  return createElement(TagName66, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/656RZDJD.js
var TagName67 = "p";
var usePopoverDescription = createHook(function usePopoverDescription2(props) {
  props = useDialogDescription(props);
  return props;
});
var PopoverDescription = forwardRef2(function PopoverDescription2(props) {
  const htmlProps = usePopoverDescription(props);
  return createElement(TagName67, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/CAGM4AEJ.js
var import_react58 = __toESM(require_react(), 1);
var import_jsx_runtime38 = __toESM(require_jsx_runtime(), 1);
var TagName68 = "span";
var pointsMap = {
  top: "4,10 8,6 12,10",
  right: "6,4 10,8 6,12",
  bottom: "4,6 8,10 12,6",
  left: "10,4 6,8 10,12"
};
var usePopoverDisclosureArrow = createHook(function usePopoverDisclosureArrow2(_a) {
  var _b = _a, { store, placement } = _b, props = __objRest(_b, ["store", "placement"]);
  const context = usePopoverContext();
  store = store || context;
  invariant(
    store,
    "PopoverDisclosureArrow must be wrapped in a PopoverDisclosure component."
  );
  const position = store.useState((state) => placement || state.placement);
  const dir = position.split("-")[0];
  const points = pointsMap[dir];
  const children3 = (0, import_react58.useMemo)(
    () => (0, import_jsx_runtime38.jsx)(
      "svg",
      {
        display: "block",
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        viewBox: "0 0 16 16",
        height: "1em",
        width: "1em",
        children: (0, import_jsx_runtime38.jsx)("polyline", { points })
      }
    ),
    [points]
  );
  props = __spreadProps(__spreadValues({
    children: children3,
    "aria-hidden": true
  }, props), {
    style: __spreadValues({
      width: "1em",
      height: "1em",
      pointerEvents: "none"
    }, props.style)
  });
  return removeUndefinedValues(props);
});
var PopoverDisclosureArrow = forwardRef2(
  function PopoverDisclosureArrow2(props) {
    const htmlProps = usePopoverDisclosureArrow(props);
    return createElement(TagName68, htmlProps);
  }
);

// node_modules/@ariakit/react-core/esm/__chunks/52IKNGON.js
var import_jsx_runtime39 = __toESM(require_jsx_runtime(), 1);
var TagName69 = "button";
var usePopoverDisclosure = createHook(function usePopoverDisclosure2(_a) {
  var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
  const context = usePopoverProviderContext();
  store = store || context;
  invariant(
    store,
    "PopoverDisclosure must receive a `store` prop or be wrapped in a PopoverProvider component."
  );
  const onClickProp = props.onClick;
  const onClick = useEvent((event) => {
    store == null ? void 0 : store.setAnchorElement(event.currentTarget);
    onClickProp == null ? void 0 : onClickProp(event);
  });
  props = useWrapElement(
    props,
    (element) => (0, import_jsx_runtime39.jsx)(PopoverScopedContextProvider, { value: store, children: element }),
    [store]
  );
  props = __spreadProps(__spreadValues({}, props), {
    onClick
  });
  props = usePopoverAnchor(__spreadValues({ store }, props));
  props = useDialogDisclosure(__spreadValues({ store }, props));
  return props;
});
var PopoverDisclosure = forwardRef2(function PopoverDisclosure2(props) {
  const htmlProps = usePopoverDisclosure(props);
  return createElement(TagName69, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/LW6D6LS6.js
var TagName70 = "button";
var usePopoverDismiss = createHook(
  function usePopoverDismiss2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = usePopoverScopedContext();
    store = store || context;
    props = useDialogDismiss(__spreadValues({ store }, props));
    return props;
  }
);
var PopoverDismiss = forwardRef2(function PopoverDismiss2(props) {
  const htmlProps = usePopoverDismiss(props);
  return createElement(TagName70, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/4FY2MBIB.js
var TagName71 = "h1";
var usePopoverHeading = createHook(
  function usePopoverHeading2(props) {
    props = useDialogHeading(props);
    return props;
  }
);
var PopoverHeading = forwardRef2(function PopoverHeading2(props) {
  const htmlProps = usePopoverHeading(props);
  return createElement(TagName71, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/WSQNIDGC.js
var import_react59 = __toESM(require_react(), 1);
var menubar = createStoreContext(
  [CompositeContextProvider],
  [CompositeScopedContextProvider]
);
var useMenubarContext = menubar.useContext;
var useMenubarScopedContext = menubar.useScopedContext;
var useMenubarProviderContext = menubar.useProviderContext;
var MenubarContextProvider = menubar.ContextProvider;
var MenubarScopedContextProvider = menubar.ScopedContextProvider;
var MenuItemCheckedContext = (0, import_react59.createContext)(
  void 0
);

// node_modules/@ariakit/core/esm/__chunks/PIWLWQMB.js
function createMenubarStore(props = {}) {
  var _a;
  const syncState = (_a = props.store) == null ? void 0 : _a.getState();
  const composite = createCompositeStore(__spreadProps2(__spreadValues2({}, props), {
    orientation: defaultValue(
      props.orientation,
      syncState == null ? void 0 : syncState.orientation,
      "horizontal"
    ),
    focusLoop: defaultValue(props.focusLoop, syncState == null ? void 0 : syncState.focusLoop, true)
  }));
  const initialState = __spreadValues2({}, composite.getState());
  const menubar2 = createStore(initialState, composite, props.store);
  return __spreadValues2(__spreadValues2({}, composite), menubar2);
}

// node_modules/@ariakit/react-core/esm/__chunks/E5PXVSMA.js
function useMenubarStoreProps(store, update, props) {
  return useCompositeStoreProps(store, update, props);
}
function useMenubarStore(props = {}) {
  const [store, update] = useStore(createMenubarStore, props);
  return useMenubarStoreProps(store, update, props);
}

// node_modules/@ariakit/react-core/esm/__chunks/TVTGWHT4.js
var import_jsx_runtime40 = __toESM(require_jsx_runtime(), 1);
var TagName72 = "div";
var useMenubar = createHook(
  function useMenubar2(_a) {
    var _b = _a, {
      store: storeProp,
      composite = true,
      orientation: orientationProp,
      virtualFocus,
      focusLoop,
      rtl
    } = _b, props = __objRest(_b, [
      "store",
      "composite",
      "orientation",
      "virtualFocus",
      "focusLoop",
      "rtl"
    ]);
    const context = useMenubarProviderContext();
    storeProp = storeProp || context;
    const store = useMenubarStore({
      store: storeProp,
      orientation: orientationProp,
      virtualFocus,
      focusLoop,
      rtl
    });
    const orientation = store.useState(
      (state) => !composite || state.orientation === "both" ? void 0 : state.orientation
    );
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime40.jsx)(MenubarScopedContextProvider, { value: store, children: element }),
      [store]
    );
    if (composite) {
      props = __spreadValues({
        role: "menubar",
        "aria-orientation": orientation
      }, props);
    }
    props = useComposite(__spreadValues({ store, composite }, props));
    return props;
  }
);
var Menubar = forwardRef2(function Menubar2(props) {
  const htmlProps = useMenubar(props);
  return createElement(TagName72, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/L3MGZQ3I.js
var import_jsx_runtime41 = __toESM(require_jsx_runtime(), 1);
function MenubarProvider(props = {}) {
  const store = useMenubarStore(props);
  return (0, import_jsx_runtime41.jsx)(MenubarContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/__chunks/CTQR3VDU.js
var ctx11 = createStoreContext(
  [PopoverContextProvider],
  [PopoverScopedContextProvider]
);
var useHovercardContext = ctx11.useContext;
var useHovercardScopedContext = ctx11.useScopedContext;
var useHovercardProviderContext = ctx11.useProviderContext;
var HovercardContextProvider = ctx11.ContextProvider;
var HovercardScopedContextProvider = ctx11.ScopedContextProvider;

// node_modules/@ariakit/react-core/esm/__chunks/LG4RFBHV.js
var import_react60 = __toESM(require_react(), 1);
var menu = createStoreContext(
  [CompositeContextProvider, HovercardContextProvider],
  [CompositeScopedContextProvider, HovercardScopedContextProvider]
);
var useMenuContext = menu.useContext;
var useMenuScopedContext = menu.useScopedContext;
var useMenuProviderContext = menu.useProviderContext;
var MenuContextProvider = menu.ContextProvider;
var MenuScopedContextProvider = menu.ScopedContextProvider;
var useMenuBarContext = useMenubarContext;
var MenuItemCheckedContext2 = (0, import_react60.createContext)(
  void 0
);

// node_modules/@ariakit/core/esm/__chunks/EACLTACN.js
function createHovercardStore(props = {}) {
  var _a;
  const syncState = (_a = props.store) == null ? void 0 : _a.getState();
  const popover = createPopoverStore(__spreadProps2(__spreadValues2({}, props), {
    placement: defaultValue(
      props.placement,
      syncState == null ? void 0 : syncState.placement,
      "bottom"
    )
  }));
  const timeout = defaultValue(props.timeout, syncState == null ? void 0 : syncState.timeout, 500);
  const initialState = __spreadProps2(__spreadValues2({}, popover.getState()), {
    timeout,
    showTimeout: defaultValue(props.showTimeout, syncState == null ? void 0 : syncState.showTimeout),
    hideTimeout: defaultValue(props.hideTimeout, syncState == null ? void 0 : syncState.hideTimeout),
    autoFocusOnShow: defaultValue(syncState == null ? void 0 : syncState.autoFocusOnShow, false)
  });
  const hovercard = createStore(initialState, popover, props.store);
  return __spreadProps2(__spreadValues2(__spreadValues2({}, popover), hovercard), {
    setAutoFocusOnShow: (value) => hovercard.setState("autoFocusOnShow", value)
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/XMDAT5SM.js
function useHovercardStoreProps(store, update, props) {
  useStoreProps(store, props, "timeout");
  useStoreProps(store, props, "showTimeout");
  useStoreProps(store, props, "hideTimeout");
  return usePopoverStoreProps(store, update, props);
}
function useHovercardStore(props = {}) {
  const [store, update] = useStore(createHovercardStore, props);
  return useHovercardStoreProps(store, update, props);
}

// node_modules/@ariakit/core/esm/menu/menu-store.js
function createMenuStore(_a = {}) {
  var _b = _a, {
    combobox,
    parent,
    menubar: menubar2
  } = _b, props = __objRest2(_b, [
    "combobox",
    "parent",
    "menubar"
  ]);
  const parentIsMenubar = !!menubar2 && !parent;
  const store = mergeStore(
    props.store,
    pick2(parent, ["values"]),
    omit2(combobox, [
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement"
    ])
  );
  throwOnConflictingProps(props, store);
  const syncState = store.getState();
  const composite = createCompositeStore(__spreadProps2(__spreadValues2({}, props), {
    store,
    orientation: defaultValue(
      props.orientation,
      syncState.orientation,
      "vertical"
    )
  }));
  const hovercard = createHovercardStore(__spreadProps2(__spreadValues2({}, props), {
    store,
    placement: defaultValue(
      props.placement,
      syncState.placement,
      "bottom-start"
    ),
    timeout: defaultValue(
      props.timeout,
      syncState.timeout,
      parentIsMenubar ? 0 : 150
    ),
    hideTimeout: defaultValue(props.hideTimeout, syncState.hideTimeout, 0)
  }));
  const initialState = __spreadProps2(__spreadValues2(__spreadValues2({}, composite.getState()), hovercard.getState()), {
    initialFocus: defaultValue(syncState.initialFocus, "container"),
    values: defaultValue(
      props.values,
      syncState.values,
      props.defaultValues,
      {}
    )
  });
  const menu2 = createStore(initialState, composite, hovercard, store);
  setup(
    menu2,
    () => sync(menu2, ["mounted"], (state) => {
      if (state.mounted)
        return;
      menu2.setState("activeId", null);
    })
  );
  setup(
    menu2,
    () => sync(parent, ["orientation"], (state) => {
      menu2.setState(
        "placement",
        state.orientation === "vertical" ? "right-start" : "bottom-start"
      );
    })
  );
  return __spreadProps2(__spreadValues2(__spreadValues2(__spreadValues2({}, composite), hovercard), menu2), {
    combobox,
    parent,
    menubar: menubar2,
    hideAll: () => {
      hovercard.hide();
      parent == null ? void 0 : parent.hideAll();
    },
    setInitialFocus: (value) => menu2.setState("initialFocus", value),
    setValues: (values) => menu2.setState("values", values),
    setValue: (name, value) => {
      if (name === "__proto__")
        return;
      if (name === "constructor")
        return;
      if (Array.isArray(name))
        return;
      menu2.setState("values", (values) => {
        const prevValue = values[name];
        const nextValue = applyState(value, prevValue);
        if (nextValue === prevValue)
          return values;
        return __spreadProps2(__spreadValues2({}, values), {
          [name]: nextValue !== void 0 && nextValue
        });
      });
    }
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/MS4VD4RJ.js
function useMenuStoreProps(store, update, props) {
  useUpdateEffect(update, [props.combobox, props.parent, props.menubar]);
  useStoreProps(store, props, "values", "setValues");
  return Object.assign(
    useHovercardStoreProps(
      useCompositeStoreProps(store, update, props),
      update,
      props
    ),
    {
      combobox: props.combobox,
      parent: props.parent,
      menubar: props.menubar
    }
  );
}
function useMenuStore(props = {}) {
  const parent = useMenuContext();
  const menubar2 = useMenubarContext();
  const combobox = useComboboxProviderContext();
  props = __spreadProps(__spreadValues({}, props), {
    parent: props.parent !== void 0 ? props.parent : parent,
    menubar: props.menubar !== void 0 ? props.menubar : menubar2,
    combobox: props.combobox !== void 0 ? props.combobox : combobox
  });
  const [store, update] = useStore(createMenuStore, props);
  return useMenuStoreProps(store, update, props);
}

// node_modules/@ariakit/react-core/esm/menu/menu-bar-store.js
var import_react61 = __toESM(require_react());
function useMenuBarStore(props = {}) {
  (0, import_react61.useEffect)(() => {
    if (true) {
      console.warn(
        "useMenuBarStore is deprecated. Use useMenubarStore instead.",
        "See https://ariakit.org/reference/use-menubar-store"
      );
    }
  }, []);
  return useMenubarStore(props);
}

// node_modules/@ariakit/react-core/esm/__chunks/GFJK2WVK.js
var import_react62 = __toESM(require_react(), 1);
var import_jsx_runtime42 = __toESM(require_jsx_runtime(), 1);
var TagName73 = "div";
function useAriaLabelledBy(_a) {
  var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
  const [id, setId] = (0, import_react62.useState)(void 0);
  const label = props["aria-label"];
  const disclosureElement = useStoreState(store, "disclosureElement");
  const contentElement = useStoreState(store, "contentElement");
  (0, import_react62.useEffect)(() => {
    const disclosure = disclosureElement;
    if (!disclosure)
      return;
    const menu2 = contentElement;
    if (!menu2)
      return;
    const menuLabel = label || menu2.hasAttribute("aria-label");
    if (menuLabel) {
      setId(void 0);
    } else if (disclosure.id) {
      setId(disclosure.id);
    }
  }, [label, disclosureElement, contentElement]);
  return id;
}
var useMenuList = createHook(
  function useMenuList2(_a) {
    var _b = _a, { store, alwaysVisible, composite } = _b, props = __objRest(_b, ["store", "alwaysVisible", "composite"]);
    const context = useMenuProviderContext();
    store = store || context;
    invariant(
      store,
      "MenuList must receive a `store` prop or be wrapped in a MenuProvider component."
    );
    const parentMenu = store.parent;
    const parentMenubar = store.menubar;
    const hasParentMenu = !!parentMenu;
    const id = useId(props.id);
    const onKeyDownProp = props.onKeyDown;
    const dir = store.useState(
      (state) => state.placement.split("-")[0]
    );
    const orientation = store.useState(
      (state) => state.orientation === "both" ? void 0 : state.orientation
    );
    const isHorizontal = orientation !== "vertical";
    const isMenubarHorizontal = useStoreState(
      parentMenubar,
      (state) => !!state && state.orientation !== "vertical"
    );
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (event.defaultPrevented)
        return;
      if (hasParentMenu || parentMenubar && !isHorizontal) {
        const hideMap = {
          ArrowRight: () => dir === "left" && !isHorizontal,
          ArrowLeft: () => dir === "right" && !isHorizontal,
          ArrowUp: () => dir === "bottom" && isHorizontal,
          ArrowDown: () => dir === "top" && isHorizontal
        };
        const action = hideMap[event.key];
        if (action == null ? void 0 : action()) {
          event.stopPropagation();
          event.preventDefault();
          return store == null ? void 0 : store.hide();
        }
      }
      if (parentMenubar) {
        const keyMap = {
          ArrowRight: () => {
            if (!isMenubarHorizontal)
              return;
            return parentMenubar.next();
          },
          ArrowLeft: () => {
            if (!isMenubarHorizontal)
              return;
            return parentMenubar.previous();
          },
          ArrowDown: () => {
            if (isMenubarHorizontal)
              return;
            return parentMenubar.next();
          },
          ArrowUp: () => {
            if (isMenubarHorizontal)
              return;
            return parentMenubar.previous();
          }
        };
        const action = keyMap[event.key];
        const id2 = action == null ? void 0 : action();
        if (id2 !== void 0) {
          event.stopPropagation();
          event.preventDefault();
          parentMenubar.move(id2);
        }
      }
    });
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime42.jsx)(MenuScopedContextProvider, { value: store, children: element }),
      [store]
    );
    const ariaLabelledBy = useAriaLabelledBy(__spreadValues({ store }, props));
    const mounted = store.useState("mounted");
    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? __spreadProps(__spreadValues({}, props.style), { display: "none" }) : props.style;
    props = __spreadProps(__spreadValues({
      id,
      "aria-labelledby": ariaLabelledBy,
      hidden
    }, props), {
      ref: useMergeRefs(id ? store.setContentElement : null, props.ref),
      style,
      onKeyDown
    });
    const hasCombobox = !!store.combobox;
    composite = composite != null ? composite : !hasCombobox;
    if (composite) {
      props = __spreadValues({
        role: "menu",
        "aria-orientation": orientation
      }, props);
    }
    props = useComposite(__spreadValues({ store, composite }, props));
    props = useCompositeTypeahead(__spreadValues({ store, typeahead: !hasCombobox }, props));
    return props;
  }
);
var MenuList = forwardRef2(function MenuList2(props) {
  const htmlProps = useMenuList(props);
  return createElement(TagName73, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/X7QOZUD3.js
function getEventPoint(event) {
  return [event.clientX, event.clientY];
}
function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  const length = polygon.length;
  for (let l = length, i = 0, j = l - 1; i < l; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const [, vy] = polygon[j === 0 ? l - 1 : j - 1] || [0, 0];
    const where = (yi - yj) * (x - xi) - (xi - xj) * (y - yi);
    if (yj < yi) {
      if (y >= yj && y < yi) {
        if (where === 0)
          return true;
        if (where > 0) {
          if (y === yj) {
            if (y > vy) {
              inside = !inside;
            }
          } else {
            inside = !inside;
          }
        }
      }
    } else if (yi < yj) {
      if (y > yi && y <= yj) {
        if (where === 0)
          return true;
        if (where < 0) {
          if (y === yj) {
            if (y < vy) {
              inside = !inside;
            }
          } else {
            inside = !inside;
          }
        }
      }
    } else if (y === yi && (x >= xj && x <= xi || x >= xi && x <= xj)) {
      return true;
    }
  }
  return inside;
}
function getEnterPointPlacement(enterPoint, rect) {
  const { top, right, bottom, left } = rect;
  const [x, y] = enterPoint;
  const placementX = x < left ? "left" : x > right ? "right" : null;
  const placementY = y < top ? "top" : y > bottom ? "bottom" : null;
  return [placementX, placementY];
}
function getElementPolygon(element, enterPoint) {
  const rect = element.getBoundingClientRect();
  const { top, right, bottom, left } = rect;
  const [x, y] = getEnterPointPlacement(enterPoint, rect);
  const polygon = [enterPoint];
  if (x) {
    if (y !== "top") {
      polygon.push([x === "left" ? left : right, top]);
    }
    polygon.push([x === "left" ? right : left, top]);
    polygon.push([x === "left" ? right : left, bottom]);
    if (y !== "bottom") {
      polygon.push([x === "left" ? left : right, bottom]);
    }
  } else if (y === "top") {
    polygon.push([left, top]);
    polygon.push([left, bottom]);
    polygon.push([right, bottom]);
    polygon.push([right, top]);
  } else {
    polygon.push([left, bottom]);
    polygon.push([left, top]);
    polygon.push([right, top]);
    polygon.push([right, bottom]);
  }
  return polygon;
}

// node_modules/@ariakit/react-core/esm/__chunks/4GR366MD.js
var import_react63 = __toESM(require_react(), 1);
var import_jsx_runtime43 = __toESM(require_jsx_runtime(), 1);
var TagName74 = "div";
function isMovingOnHovercard(target, card, anchor, nested) {
  if (hasFocusWithin(card))
    return true;
  if (!target)
    return false;
  if (contains(card, target))
    return true;
  if (anchor && contains(anchor, target))
    return true;
  if (nested == null ? void 0 : nested.some((card2) => isMovingOnHovercard(target, card2, anchor))) {
    return true;
  }
  return false;
}
function useAutoFocusOnHide(_a) {
  var _b = _a, {
    store
  } = _b, props = __objRest(_b, [
    "store"
  ]);
  const [autoFocusOnHide, setAutoFocusOnHide] = (0, import_react63.useState)(false);
  const mounted = store.useState("mounted");
  (0, import_react63.useEffect)(() => {
    if (!mounted) {
      setAutoFocusOnHide(false);
    }
  }, [mounted]);
  const onFocusProp = props.onFocus;
  const onFocus = useEvent((event) => {
    onFocusProp == null ? void 0 : onFocusProp(event);
    if (event.defaultPrevented)
      return;
    setAutoFocusOnHide(true);
  });
  const finalFocusRef = (0, import_react63.useRef)(null);
  (0, import_react63.useEffect)(() => {
    return sync(store, ["anchorElement"], (state) => {
      finalFocusRef.current = state.anchorElement;
    });
  }, []);
  props = __spreadProps(__spreadValues({
    autoFocusOnHide,
    finalFocus: finalFocusRef
  }, props), {
    onFocus
  });
  return props;
}
var NestedHovercardContext = (0, import_react63.createContext)(null);
var useHovercard = createHook(
  function useHovercard2(_a) {
    var _b = _a, {
      store,
      modal = false,
      portal = !!modal,
      hideOnEscape = true,
      hideOnHoverOutside = true,
      disablePointerEventsOnApproach = !!hideOnHoverOutside
    } = _b, props = __objRest(_b, [
      "store",
      "modal",
      "portal",
      "hideOnEscape",
      "hideOnHoverOutside",
      "disablePointerEventsOnApproach"
    ]);
    const context = useHovercardProviderContext();
    store = store || context;
    invariant(
      store,
      "Hovercard must receive a `store` prop or be wrapped in a HovercardProvider component."
    );
    const ref = (0, import_react63.useRef)(null);
    const [nestedHovercards, setNestedHovercards] = (0, import_react63.useState)([]);
    const hideTimeoutRef = (0, import_react63.useRef)(0);
    const enterPointRef = (0, import_react63.useRef)(null);
    const { portalRef, domReady } = usePortalRef(portal, props.portalRef);
    const isMouseMoving = useIsMouseMoving();
    const mayHideOnHoverOutside = !!hideOnHoverOutside;
    const hideOnHoverOutsideProp = useBooleanEvent(hideOnHoverOutside);
    const mayDisablePointerEvents = !!disablePointerEventsOnApproach;
    const disablePointerEventsProp = useBooleanEvent(
      disablePointerEventsOnApproach
    );
    const open = store.useState("open");
    const mounted = store.useState("mounted");
    (0, import_react63.useEffect)(() => {
      if (!domReady)
        return;
      if (!mounted)
        return;
      if (!mayHideOnHoverOutside && !mayDisablePointerEvents)
        return;
      const element = ref.current;
      if (!element)
        return;
      const onMouseMove = (event) => {
        if (!store)
          return;
        if (!isMouseMoving())
          return;
        const { anchorElement, hideTimeout, timeout } = store.getState();
        const enterPoint = enterPointRef.current;
        const [target] = event.composedPath();
        const anchor = anchorElement;
        if (isMovingOnHovercard(target, element, anchor, nestedHovercards)) {
          enterPointRef.current = target && anchor && contains(anchor, target) ? getEventPoint(event) : null;
          window.clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = 0;
          return;
        }
        if (hideTimeoutRef.current)
          return;
        if (enterPoint) {
          const currentPoint = getEventPoint(event);
          const polygon = getElementPolygon(element, enterPoint);
          if (isPointInPolygon(currentPoint, polygon)) {
            enterPointRef.current = currentPoint;
            if (!disablePointerEventsProp(event))
              return;
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
        if (!hideOnHoverOutsideProp(event))
          return;
        hideTimeoutRef.current = window.setTimeout(() => {
          hideTimeoutRef.current = 0;
          store == null ? void 0 : store.hide();
        }, hideTimeout != null ? hideTimeout : timeout);
      };
      return chain(
        addGlobalEventListener("mousemove", onMouseMove, true),
        () => clearTimeout(hideTimeoutRef.current)
      );
    }, [
      store,
      isMouseMoving,
      domReady,
      mounted,
      mayHideOnHoverOutside,
      mayDisablePointerEvents,
      nestedHovercards,
      disablePointerEventsProp,
      hideOnHoverOutsideProp
    ]);
    (0, import_react63.useEffect)(() => {
      if (!domReady)
        return;
      if (!mounted)
        return;
      if (!mayDisablePointerEvents)
        return;
      const disableEvent = (event) => {
        const element = ref.current;
        if (!element)
          return;
        const enterPoint = enterPointRef.current;
        if (!enterPoint)
          return;
        const polygon = getElementPolygon(element, enterPoint);
        if (isPointInPolygon(getEventPoint(event), polygon)) {
          if (!disablePointerEventsProp(event))
            return;
          event.preventDefault();
          event.stopPropagation();
        }
      };
      return chain(
        // Note: we may need to add pointer events here in the future.
        addGlobalEventListener("mouseenter", disableEvent, true),
        addGlobalEventListener("mouseover", disableEvent, true),
        addGlobalEventListener("mouseout", disableEvent, true),
        addGlobalEventListener("mouseleave", disableEvent, true)
      );
    }, [domReady, mounted, mayDisablePointerEvents, disablePointerEventsProp]);
    (0, import_react63.useEffect)(() => {
      if (!domReady)
        return;
      if (open)
        return;
      store == null ? void 0 : store.setAutoFocusOnShow(false);
    }, [store, domReady, open]);
    const openRef = useLiveRef(open);
    (0, import_react63.useEffect)(() => {
      if (!domReady)
        return;
      return () => {
        if (!openRef.current) {
          store == null ? void 0 : store.setAutoFocusOnShow(false);
        }
      };
    }, [store, domReady]);
    const registerOnParent = (0, import_react63.useContext)(NestedHovercardContext);
    useSafeLayoutEffect(() => {
      if (modal)
        return;
      if (!portal)
        return;
      if (!mounted)
        return;
      if (!domReady)
        return;
      const element = ref.current;
      if (!element)
        return;
      return registerOnParent == null ? void 0 : registerOnParent(element);
    }, [modal, portal, mounted, domReady]);
    const registerNestedHovercard = (0, import_react63.useCallback)(
      (element) => {
        setNestedHovercards((prevElements) => [...prevElements, element]);
        const parentUnregister = registerOnParent == null ? void 0 : registerOnParent(element);
        return () => {
          setNestedHovercards(
            (prevElements) => prevElements.filter((item) => item !== element)
          );
          parentUnregister == null ? void 0 : parentUnregister();
        };
      },
      [registerOnParent]
    );
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime43.jsx)(HovercardScopedContextProvider, { value: store, children: (0, import_jsx_runtime43.jsx)(NestedHovercardContext.Provider, { value: registerNestedHovercard, children: element }) }),
      [store, registerNestedHovercard]
    );
    props = __spreadProps(__spreadValues({}, props), {
      ref: useMergeRefs(ref, props.ref)
    });
    props = useAutoFocusOnHide(__spreadValues({ store }, props));
    const autoFocusOnShow = store.useState(
      (state) => modal || state.autoFocusOnShow
    );
    props = usePopover(__spreadProps(__spreadValues({
      store,
      modal,
      portal,
      autoFocusOnShow
    }, props), {
      portalRef,
      hideOnEscape(event) {
        if (isFalsyBooleanCallback(hideOnEscape, event))
          return false;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            store == null ? void 0 : store.hide();
          });
        });
        return true;
      }
    }));
    return props;
  }
);
var Hovercard = createDialogComponent(
  forwardRef2(function Hovercard2(props) {
    const htmlProps = useHovercard(props);
    return createElement(TagName74, htmlProps);
  }),
  useHovercardProviderContext
);

// node_modules/@ariakit/react-core/esm/menu/menu.js
var import_react64 = __toESM(require_react());
var TagName75 = "div";
var useMenu = createHook(function useMenu2(_a) {
  var _b = _a, {
    store,
    modal: modalProp = false,
    portal = !!modalProp,
    hideOnEscape = true,
    autoFocusOnShow = true,
    hideOnHoverOutside,
    alwaysVisible
  } = _b, props = __objRest(_b, [
    "store",
    "modal",
    "portal",
    "hideOnEscape",
    "autoFocusOnShow",
    "hideOnHoverOutside",
    "alwaysVisible"
  ]);
  const context = useMenuProviderContext();
  store = store || context;
  invariant(
    store,
    "Menu must receive a `store` prop or be wrapped in a MenuProvider component."
  );
  const ref = (0, import_react64.useRef)(null);
  const parentMenu = store.parent;
  const parentMenubar = store.menubar;
  const hasParentMenu = !!parentMenu;
  const parentIsMenubar = !!parentMenubar && !hasParentMenu;
  props = __spreadProps(__spreadValues({}, props), {
    ref: useMergeRefs(ref, props.ref)
  });
  const _a2 = useMenuList(__spreadValues({
    store,
    alwaysVisible
  }, props)), { "aria-labelledby": ariaLabelledBy } = _a2, menuListProps = __objRest(_a2, ["aria-labelledby"]);
  props = menuListProps;
  const [initialFocusRef, setInitialFocusRef] = (0, import_react64.useState)();
  const autoFocusOnShowState = store.useState("autoFocusOnShow");
  const initialFocus = store.useState("initialFocus");
  const baseElement = store.useState("baseElement");
  const items = store.useState("renderedItems");
  (0, import_react64.useEffect)(() => {
    let cleaning = false;
    setInitialFocusRef((prevInitialFocusRef) => {
      var _a3, _b2, _c;
      if (cleaning)
        return;
      if (!autoFocusOnShowState)
        return;
      if ((_a3 = prevInitialFocusRef == null ? void 0 : prevInitialFocusRef.current) == null ? void 0 : _a3.isConnected)
        return prevInitialFocusRef;
      const ref2 = (0, import_react64.createRef)();
      switch (initialFocus) {
        case "first":
          ref2.current = ((_b2 = items.find((item) => !item.disabled && item.element)) == null ? void 0 : _b2.element) || null;
          break;
        case "last":
          ref2.current = ((_c = [...items].reverse().find((item) => !item.disabled && item.element)) == null ? void 0 : _c.element) || null;
          break;
        default:
          ref2.current = baseElement;
      }
      return ref2;
    });
    return () => {
      cleaning = true;
    };
  }, [store, autoFocusOnShowState, initialFocus, items, baseElement]);
  const modal = hasParentMenu ? false : modalProp;
  const mayAutoFocusOnShow = !!autoFocusOnShow;
  const canAutoFocusOnShow = !!initialFocusRef || !!props.initialFocus || !!modal;
  const contentElement = useStoreState(
    store.combobox || store,
    "contentElement"
  );
  const parentContentElement = useStoreState(
    (parentMenu == null ? void 0 : parentMenu.combobox) || parentMenu,
    "contentElement"
  );
  const preserveTabOrderAnchor = (0, import_react64.useMemo)(() => {
    if (!parentContentElement)
      return;
    if (!contentElement)
      return;
    const role = contentElement.getAttribute("role");
    const parentRole = parentContentElement.getAttribute("role");
    const parentIsMenuOrMenubar = parentRole === "menu" || parentRole === "menubar";
    if (parentIsMenuOrMenubar && role === "menu")
      return;
    return parentContentElement;
  }, [contentElement, parentContentElement]);
  if (preserveTabOrderAnchor !== void 0) {
    props = __spreadValues({
      preserveTabOrderAnchor
    }, props);
  }
  props = useHovercard(__spreadProps(__spreadValues({
    store,
    alwaysVisible,
    initialFocus: initialFocusRef,
    autoFocusOnShow: mayAutoFocusOnShow ? canAutoFocusOnShow && autoFocusOnShow : autoFocusOnShowState || !!modal
  }, props), {
    hideOnEscape(event) {
      if (isFalsyBooleanCallback(hideOnEscape, event))
        return false;
      store == null ? void 0 : store.hideAll();
      return true;
    },
    hideOnHoverOutside(event) {
      const disclosureElement = store == null ? void 0 : store.getState().disclosureElement;
      const getHideOnHoverOutside = () => {
        if (typeof hideOnHoverOutside === "function") {
          return hideOnHoverOutside(event);
        }
        if (hideOnHoverOutside != null)
          return hideOnHoverOutside;
        if (hasParentMenu)
          return true;
        if (!parentIsMenubar)
          return false;
        if (!disclosureElement)
          return true;
        if (hasFocusWithin(disclosureElement))
          return false;
        return true;
      };
      if (!getHideOnHoverOutside())
        return false;
      if (event.defaultPrevented)
        return true;
      if (!hasParentMenu)
        return true;
      if (!disclosureElement)
        return true;
      fireEvent(disclosureElement, "mouseout", event);
      if (!hasFocusWithin(disclosureElement))
        return true;
      requestAnimationFrame(() => {
        if (hasFocusWithin(disclosureElement))
          return;
        store == null ? void 0 : store.hide();
      });
      return false;
    },
    modal,
    portal,
    backdrop: hasParentMenu ? false : props.backdrop
  }));
  props = __spreadValues({
    "aria-labelledby": ariaLabelledBy
  }, props);
  return props;
});
var Menu = createDialogComponent(
  forwardRef2(function Menu2(props) {
    const htmlProps = useMenu(props);
    return createElement(TagName75, htmlProps);
  }),
  useMenuProviderContext
);

// node_modules/@ariakit/react-core/esm/menu/menu-provider.js
var import_jsx_runtime44 = __toESM(require_jsx_runtime());
function MenuProvider(props = {}) {
  const store = useMenuStore(props);
  return (0, import_jsx_runtime44.jsx)(MenuContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/menu/menu-bar.js
var import_react65 = __toESM(require_react());
var TagName76 = "div";
var useMenuBar = createHook(
  function useMenuBar2(props) {
    (0, import_react65.useEffect)(() => {
      if (true) {
        console.warn(
          "MenuBar is deprecated. Use Menubar instead.",
          "See https://ariakit.org/reference/menubar"
        );
      }
    }, []);
    return useMenubar(props);
  }
);
var MenuBar = forwardRef2(function MenuBar2(props) {
  const htmlProps = useMenuBar(props);
  return createElement(TagName76, htmlProps);
});

// node_modules/@ariakit/react-core/esm/menu/menu-bar-provider.js
var import_react66 = __toESM(require_react());
var import_jsx_runtime45 = __toESM(require_jsx_runtime());
function MenuBarProvider(props = {}) {
  (0, import_react66.useEffect)(() => {
    if (true) {
      console.warn(
        "MenuBarProvider is deprecated. Use MenubarProvider instead.",
        "See https://ariakit.org/reference/menubar-provider"
      );
    }
  }, []);
  return (0, import_jsx_runtime45.jsx)(MenubarProvider, __spreadValues({}, props));
}

// node_modules/@ariakit/react-core/esm/menu/menu-arrow.js
var TagName77 = "div";
var useMenuArrow = createHook(
  function useMenuArrow2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useMenuContext();
    store = store || context;
    return usePopoverArrow(__spreadValues({ store }, props));
  }
);
var MenuArrow = forwardRef2(function MenuArrow2(props) {
  const htmlProps = useMenuArrow(props);
  return createElement(TagName77, htmlProps);
});

// node_modules/@ariakit/react-core/esm/menu/menu-button-arrow.js
var TagName78 = "span";
var useMenuButtonArrow = createHook(
  function useMenuButtonArrow2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useMenuContext();
    store = store || context;
    props = usePopoverDisclosureArrow(__spreadValues({ store }, props));
    return props;
  }
);
var MenuButtonArrow = forwardRef2(function MenuButtonArrow2(props) {
  const htmlProps = useMenuButtonArrow(props);
  return createElement(TagName78, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/CF4NC545.js
var import_react67 = __toESM(require_react(), 1);
var TagName79 = "a";
var useHovercardAnchor = createHook(
  function useHovercardAnchor2(_a) {
    var _b = _a, { store, showOnHover = true } = _b, props = __objRest(_b, ["store", "showOnHover"]);
    const context = useHovercardProviderContext();
    store = store || context;
    invariant(
      store,
      "HovercardAnchor must receive a `store` prop or be wrapped in a HovercardProvider component."
    );
    const disabled = disabledFromProps(props);
    const showTimeoutRef = (0, import_react67.useRef)(0);
    (0, import_react67.useEffect)(() => () => window.clearTimeout(showTimeoutRef.current), []);
    (0, import_react67.useEffect)(() => {
      const onMouseLeave = (event) => {
        if (!store)
          return;
        const { anchorElement } = store.getState();
        if (!anchorElement)
          return;
        if (event.target !== anchorElement)
          return;
        window.clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = 0;
      };
      return addGlobalEventListener("mouseleave", onMouseLeave, true);
    }, [store]);
    const onMouseMoveProp = props.onMouseMove;
    const showOnHoverProp = useBooleanEvent(showOnHover);
    const isMouseMoving = useIsMouseMoving();
    const onMouseMove = useEvent((event) => {
      onMouseMoveProp == null ? void 0 : onMouseMoveProp(event);
      if (disabled)
        return;
      if (!store)
        return;
      if (event.defaultPrevented)
        return;
      if (showTimeoutRef.current)
        return;
      if (!isMouseMoving())
        return;
      if (!showOnHoverProp(event))
        return;
      const element = event.currentTarget;
      store.setAnchorElement(element);
      store.setDisclosureElement(element);
      const { showTimeout, timeout } = store.getState();
      const showHovercard = () => {
        showTimeoutRef.current = 0;
        if (!isMouseMoving())
          return;
        store == null ? void 0 : store.setAnchorElement(element);
        store == null ? void 0 : store.show();
        queueMicrotask(() => {
          store == null ? void 0 : store.setDisclosureElement(element);
        });
      };
      const timeoutMs = showTimeout != null ? showTimeout : timeout;
      if (timeoutMs === 0) {
        showHovercard();
      } else {
        showTimeoutRef.current = window.setTimeout(showHovercard, timeoutMs);
      }
    });
    const onClickProp = props.onClick;
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (!store)
        return;
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = 0;
    });
    const ref = (0, import_react67.useCallback)(
      (element) => {
        if (!store)
          return;
        const { anchorElement } = store.getState();
        if (anchorElement == null ? void 0 : anchorElement.isConnected)
          return;
        store.setAnchorElement(element);
      },
      [store]
    );
    props = __spreadProps(__spreadValues({}, props), {
      ref: useMergeRefs(ref, props.ref),
      onMouseMove,
      onClick
    });
    props = useFocusable(props);
    return props;
  }
);
var HovercardAnchor = forwardRef2(function HovercardAnchor2(props) {
  const htmlProps = useHovercardAnchor(props);
  return createElement(TagName79, htmlProps);
});

// node_modules/@ariakit/react-core/esm/menu/menu-button.js
var import_react68 = __toESM(require_react());
var import_jsx_runtime46 = __toESM(require_jsx_runtime());
var TagName80 = "button";
function getInitialFocus(event, dir) {
  const keyMap = {
    ArrowDown: dir === "bottom" || dir === "top" ? "first" : false,
    ArrowUp: dir === "bottom" || dir === "top" ? "last" : false,
    ArrowRight: dir === "right" ? "first" : false,
    ArrowLeft: dir === "left" ? "first" : false
  };
  return keyMap[event.key];
}
function hasActiveItem(items, excludeElement) {
  return !!(items == null ? void 0 : items.some((item) => {
    if (!item.element)
      return false;
    if (item.element === excludeElement)
      return false;
    return item.element.getAttribute("aria-expanded") === "true";
  }));
}
var useMenuButton = createHook(
  function useMenuButton2(_a) {
    var _b = _a, {
      store,
      focusable,
      accessibleWhenDisabled,
      showOnHover
    } = _b, props = __objRest(_b, [
      "store",
      "focusable",
      "accessibleWhenDisabled",
      "showOnHover"
    ]);
    const context = useMenuProviderContext();
    store = store || context;
    invariant(
      store,
      "MenuButton must receive a `store` prop or be wrapped in a MenuProvider component."
    );
    const ref = (0, import_react68.useRef)(null);
    const parentMenu = store.parent;
    const parentMenubar = store.menubar;
    const hasParentMenu = !!parentMenu;
    const parentIsMenubar = !!parentMenubar && !hasParentMenu;
    const disabled = disabledFromProps(props);
    const showMenu = () => {
      const trigger = ref.current;
      if (!trigger)
        return;
      store == null ? void 0 : store.setDisclosureElement(trigger);
      store == null ? void 0 : store.setAnchorElement(trigger);
      store == null ? void 0 : store.show();
    };
    const onFocusProp = props.onFocus;
    const onFocus = useEvent((event) => {
      onFocusProp == null ? void 0 : onFocusProp(event);
      if (disabled)
        return;
      if (event.defaultPrevented)
        return;
      store == null ? void 0 : store.setAutoFocusOnShow(false);
      store == null ? void 0 : store.setActiveId(null);
      if (!parentMenubar)
        return;
      if (!parentIsMenubar)
        return;
      const { items } = parentMenubar.getState();
      if (hasActiveItem(items, event.currentTarget)) {
        showMenu();
      }
    });
    const dir = store.useState(
      (state) => state.placement.split("-")[0]
    );
    const onKeyDownProp = props.onKeyDown;
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (disabled)
        return;
      if (event.defaultPrevented)
        return;
      const initialFocus = getInitialFocus(event, dir);
      if (initialFocus) {
        event.preventDefault();
        showMenu();
        store == null ? void 0 : store.setAutoFocusOnShow(true);
        store == null ? void 0 : store.setInitialFocus(initialFocus);
      }
    });
    const onClickProp = props.onClick;
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      if (!store)
        return;
      const isKeyboardClick = !event.detail;
      const { open } = store.getState();
      if (!open || isKeyboardClick) {
        if (!hasParentMenu || isKeyboardClick) {
          store.setAutoFocusOnShow(true);
        }
        store.setInitialFocus(isKeyboardClick ? "first" : "container");
      }
      if (hasParentMenu) {
        showMenu();
      }
    });
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime46.jsx)(MenuContextProvider, { value: store, children: element }),
      [store]
    );
    if (hasParentMenu) {
      props = __spreadProps(__spreadValues({}, props), {
        render: (0, import_jsx_runtime46.jsx)(Role.div, { render: props.render })
      });
    }
    const id = useId(props.id);
    const parentContentElement = useStoreState(
      (parentMenu == null ? void 0 : parentMenu.combobox) || parentMenu,
      "contentElement"
    );
    const role = hasParentMenu || parentIsMenubar ? getPopupItemRole(parentContentElement, "menuitem") : void 0;
    const contentElement = store.useState("contentElement");
    props = __spreadProps(__spreadValues({
      id,
      role,
      "aria-haspopup": getPopupRole(contentElement, "menu")
    }, props), {
      ref: useMergeRefs(ref, props.ref),
      onFocus,
      onKeyDown,
      onClick
    });
    props = useHovercardAnchor(__spreadProps(__spreadValues({
      store,
      focusable,
      accessibleWhenDisabled
    }, props), {
      showOnHover: (event) => {
        const getShowOnHover = () => {
          if (typeof showOnHover === "function")
            return showOnHover(event);
          if (showOnHover != null)
            return showOnHover;
          if (hasParentMenu)
            return true;
          if (!parentMenubar)
            return false;
          const { items } = parentMenubar.getState();
          return parentIsMenubar && hasActiveItem(items);
        };
        const canShowOnHover = getShowOnHover();
        if (!canShowOnHover)
          return false;
        const parent = parentIsMenubar ? parentMenubar : parentMenu;
        if (!parent)
          return true;
        parent.setActiveId(event.currentTarget.id);
        return true;
      }
    }));
    props = usePopoverDisclosure(__spreadValues({
      store,
      toggleOnClick: !hasParentMenu,
      focusable,
      accessibleWhenDisabled
    }, props));
    props = useCompositeTypeahead(__spreadValues({
      store,
      typeahead: parentIsMenubar
    }, props));
    return props;
  }
);
var MenuButton = forwardRef2(function MenuButton2(props) {
  const htmlProps = useMenuButton(props);
  return createElement(TagName80, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/AYTT7WWV.js
var TagName81 = "p";
var useHovercardDescription = createHook(function useHovercardDescription2(props) {
  props = usePopoverDescription(props);
  return props;
});
var HovercardDescription = forwardRef2(function HovercardDescription2(props) {
  const htmlProps = useHovercardDescription(props);
  return createElement(TagName81, htmlProps);
});

// node_modules/@ariakit/react-core/esm/menu/menu-description.js
var TagName82 = "p";
var useMenuDescription = createHook(
  function useMenuDescription2(props) {
    props = useHovercardDescription(props);
    return props;
  }
);
var MenuDescription = forwardRef2(function MenuDescription2(props) {
  const htmlProps = useMenuDescription(props);
  return createElement(TagName82, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/FKGRZZ4P.js
var TagName83 = "button";
var useHovercardDismiss = createHook(
  function useHovercardDismiss2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useHovercardScopedContext();
    store = store || context;
    props = usePopoverDismiss(__spreadValues({ store }, props));
    return props;
  }
);
var HovercardDismiss = forwardRef2(function HovercardDismiss2(props) {
  const htmlProps = useHovercardDismiss(props);
  return createElement(TagName83, htmlProps);
});

// node_modules/@ariakit/react-core/esm/menu/menu-dismiss.js
var TagName84 = "button";
var useMenuDismiss = createHook(
  function useMenuDismiss2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useMenuScopedContext();
    store = store || context;
    props = useHovercardDismiss(__spreadValues({ store }, props));
    return props;
  }
);
var MenuDismiss = forwardRef2(function MenuDismiss2(props) {
  const htmlProps = useMenuDismiss(props);
  return createElement(TagName84, htmlProps);
});

// node_modules/@ariakit/react-core/esm/menu/menu-group-label.js
var TagName85 = "div";
var useMenuGroupLabel = createHook(
  function useMenuGroupLabel2(props) {
    props = useCompositeGroupLabel(props);
    return props;
  }
);
var MenuGroupLabel = forwardRef2(function MenuGroupLabel2(props) {
  const htmlProps = useMenuGroupLabel(props);
  return createElement(TagName85, htmlProps);
});

// node_modules/@ariakit/react-core/esm/menu/menu-group.js
var TagName86 = "div";
var useMenuGroup = createHook(
  function useMenuGroup2(props) {
    props = useCompositeGroup(props);
    return props;
  }
);
var MenuGroup = forwardRef2(function MenuGroup2(props) {
  const htmlProps = useMenuGroup(props);
  return createElement(TagName86, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/BTK3EXKD.js
var TagName87 = "h1";
var useHovercardHeading = createHook(
  function useHovercardHeading2(props) {
    props = usePopoverHeading(props);
    return props;
  }
);
var HovercardHeading = forwardRef2(function HovercardHeading2(props) {
  const htmlProps = useHovercardHeading(props);
  return createElement(TagName87, htmlProps);
});

// node_modules/@ariakit/react-core/esm/menu/menu-heading.js
var TagName88 = "h1";
var useMenuHeading = createHook(
  function useMenuHeading2(props) {
    props = useHovercardHeading(props);
    return props;
  }
);
var MenuHeading = forwardRef2(function MenuHeading2(props) {
  const htmlProps = useMenuHeading(props);
  return createElement(TagName88, htmlProps);
});

// node_modules/@ariakit/react-core/esm/menu/menu-item-check.js
var import_react69 = __toESM(require_react());
var TagName89 = "span";
var useMenuItemCheck = createHook(
  function useMenuItemCheck2(_a) {
    var _b = _a, { store, checked } = _b, props = __objRest(_b, ["store", "checked"]);
    const context = (0, import_react69.useContext)(MenuItemCheckedContext2);
    checked = checked != null ? checked : context;
    props = useCheckboxCheck(__spreadProps(__spreadValues({}, props), { checked }));
    return props;
  }
);
var MenuItemCheck = forwardRef2(function MenuItemCheck2(props) {
  const htmlProps = useMenuItemCheck(props);
  return createElement(TagName89, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/UQC4RYOT.js
var TagName90 = "div";
function menuHasFocus(baseElement, items, currentTarget) {
  var _a;
  if (!baseElement)
    return false;
  if (hasFocusWithin(baseElement))
    return true;
  const expandedItem = items == null ? void 0 : items.find((item) => {
    var _a2;
    if (item.element === currentTarget)
      return false;
    return ((_a2 = item.element) == null ? void 0 : _a2.getAttribute("aria-expanded")) === "true";
  });
  const expandedMenuId = (_a = expandedItem == null ? void 0 : expandedItem.element) == null ? void 0 : _a.getAttribute("aria-controls");
  if (!expandedMenuId)
    return false;
  const doc = getDocument(baseElement);
  const expandedMenu = doc.getElementById(expandedMenuId);
  if (!expandedMenu)
    return false;
  if (hasFocusWithin(expandedMenu))
    return true;
  return !!expandedMenu.querySelector("[role=menuitem][aria-expanded=true]");
}
var useMenuItem = createHook(
  function useMenuItem2(_a) {
    var _b = _a, {
      store,
      hideOnClick = true,
      preventScrollOnKeyDown = true,
      focusOnHover,
      blurOnHoverEnd
    } = _b, props = __objRest(_b, [
      "store",
      "hideOnClick",
      "preventScrollOnKeyDown",
      "focusOnHover",
      "blurOnHoverEnd"
    ]);
    const menuContext = useMenuScopedContext(true);
    const menubarContext = useMenubarScopedContext();
    store = store || menuContext || menubarContext;
    invariant(
      store,
      "MenuItem must be wrapped in a MenuList, Menu or Menubar component"
    );
    const onClickProp = props.onClick;
    const hideOnClickProp = useBooleanEvent(hideOnClick);
    const hideMenu = "hideAll" in store ? store.hideAll : void 0;
    const isWithinMenu = !!hideMenu;
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      if (isDownloading(event))
        return;
      if (isOpeningInNewTab(event))
        return;
      if (!hideMenu)
        return;
      const popupType = event.currentTarget.getAttribute("aria-haspopup");
      if (popupType === "menu")
        return;
      if (!hideOnClickProp(event))
        return;
      hideMenu();
    });
    const contentElement = useStoreState(
      store,
      (state) => "contentElement" in state ? state.contentElement : null
    );
    const role = getPopupItemRole(contentElement, "menuitem");
    props = __spreadProps(__spreadValues({
      role
    }, props), {
      onClick
    });
    props = useCompositeItem(__spreadValues({
      store,
      preventScrollOnKeyDown
    }, props));
    props = useCompositeHover(__spreadProps(__spreadValues({
      store
    }, props), {
      focusOnHover(event) {
        const getFocusOnHover = () => {
          if (typeof focusOnHover === "function")
            return focusOnHover(event);
          if (focusOnHover != null)
            return focusOnHover;
          return true;
        };
        if (!store)
          return false;
        if (!getFocusOnHover())
          return false;
        const { baseElement, items } = store.getState();
        if (isWithinMenu) {
          if (event.currentTarget.hasAttribute("aria-expanded")) {
            event.currentTarget.focus();
          }
          return true;
        }
        if (menuHasFocus(baseElement, items, event.currentTarget)) {
          event.currentTarget.focus();
          return true;
        }
        return false;
      },
      blurOnHoverEnd(event) {
        if (typeof blurOnHoverEnd === "function")
          return blurOnHoverEnd(event);
        if (blurOnHoverEnd != null)
          return blurOnHoverEnd;
        return isWithinMenu;
      }
    }));
    return props;
  }
);
var MenuItem = memo2(
  forwardRef2(function MenuItem2(props) {
    const htmlProps = useMenuItem(props);
    return createElement(TagName90, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/menu/menu-item-checkbox.js
var import_react70 = __toESM(require_react());
var TagName91 = "div";
function getPrimitiveValue2(value) {
  if (Array.isArray(value)) {
    return value.toString();
  }
  return value;
}
function getValue(storeValue, value, checked) {
  if (value === void 0) {
    if (Array.isArray(storeValue))
      return storeValue;
    return !!checked;
  }
  const primitiveValue = getPrimitiveValue2(value);
  if (!Array.isArray(storeValue)) {
    if (checked) {
      return primitiveValue;
    }
    return storeValue === primitiveValue ? false : storeValue;
  }
  if (checked) {
    if (storeValue.includes(primitiveValue)) {
      return storeValue;
    }
    return [...storeValue, primitiveValue];
  }
  return storeValue.filter((v) => v !== primitiveValue);
}
var useMenuItemCheckbox = createHook(
  function useMenuItemCheckbox2(_a) {
    var _b = _a, {
      store,
      name,
      value,
      checked,
      defaultChecked: defaultCheckedProp,
      hideOnClick = false
    } = _b, props = __objRest(_b, [
      "store",
      "name",
      "value",
      "checked",
      "defaultChecked",
      "hideOnClick"
    ]);
    const context = useMenuScopedContext();
    store = store || context;
    invariant(
      store,
      "MenuItemCheckbox must be wrapped in a MenuList or Menu component"
    );
    const defaultChecked = useInitialValue(defaultCheckedProp);
    (0, import_react70.useEffect)(() => {
      store == null ? void 0 : store.setValue(name, (prevValue = []) => {
        if (!defaultChecked)
          return prevValue;
        return getValue(prevValue, value, true);
      });
    }, [store, name, value, defaultChecked]);
    (0, import_react70.useEffect)(() => {
      if (checked === void 0)
        return;
      store == null ? void 0 : store.setValue(name, (prevValue) => {
        return getValue(prevValue, value, checked);
      });
    }, [store, name, value, checked]);
    const checkboxStore = useCheckboxStore({
      value: store.useState((state) => state.values[name]),
      setValue(internalValue) {
        store == null ? void 0 : store.setValue(name, () => {
          if (checked === void 0)
            return internalValue;
          const nextValue = getValue(internalValue, value, checked);
          if (!Array.isArray(nextValue))
            return nextValue;
          if (!Array.isArray(internalValue))
            return nextValue;
          if (shallowEqual(internalValue, nextValue))
            return internalValue;
          return nextValue;
        });
      }
    });
    props = __spreadValues({
      role: "menuitemcheckbox"
    }, props);
    props = useCheckbox(__spreadValues({
      store: checkboxStore,
      name,
      value,
      checked
    }, props));
    props = useMenuItem(__spreadValues({ store, hideOnClick }, props));
    return props;
  }
);
var MenuItemCheckbox = memo2(
  forwardRef2(function MenuItemCheckbox2(props) {
    const htmlProps = useMenuItemCheckbox(props);
    return createElement(TagName91, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/menu/menu-item-radio.js
var import_react71 = __toESM(require_react());
var import_jsx_runtime47 = __toESM(require_jsx_runtime());
var TagName92 = "div";
function getValue2(prevValue, value, checked) {
  if (checked === void 0)
    return prevValue;
  if (checked)
    return value;
  return prevValue;
}
var useMenuItemRadio = createHook(
  function useMenuItemRadio2(_a) {
    var _b = _a, {
      store,
      name,
      value,
      checked,
      onChange: onChangeProp,
      hideOnClick = false
    } = _b, props = __objRest(_b, [
      "store",
      "name",
      "value",
      "checked",
      "onChange",
      "hideOnClick"
    ]);
    const context = useMenuScopedContext();
    store = store || context;
    invariant(
      store,
      "MenuItemRadio must be wrapped in a MenuList or Menu component"
    );
    const defaultChecked = useInitialValue(props.defaultChecked);
    (0, import_react71.useEffect)(() => {
      store == null ? void 0 : store.setValue(name, (prevValue = false) => {
        return getValue2(prevValue, value, defaultChecked);
      });
    }, [store, name, value, defaultChecked]);
    (0, import_react71.useEffect)(() => {
      if (checked === void 0)
        return;
      store == null ? void 0 : store.setValue(name, (prevValue) => {
        return getValue2(prevValue, value, checked);
      });
    }, [store, name, value, checked]);
    const isChecked = store.useState((state) => state.values[name] === value);
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime47.jsx)(MenuItemCheckedContext2.Provider, { value: !!isChecked, children: element }),
      [isChecked]
    );
    props = __spreadValues({
      role: "menuitemradio"
    }, props);
    props = useRadio(__spreadValues({
      name,
      value,
      checked: isChecked,
      onChange(event) {
        onChangeProp == null ? void 0 : onChangeProp(event);
        if (event.defaultPrevented)
          return;
        const element = event.currentTarget;
        store == null ? void 0 : store.setValue(name, (prevValue) => {
          return getValue2(prevValue, value, checked != null ? checked : element.checked);
        });
      }
    }, props));
    props = useMenuItem(__spreadValues({ store, hideOnClick }, props));
    return props;
  }
);
var MenuItemRadio = memo2(
  forwardRef2(function MenuItemRadio2(props) {
    const htmlProps = useMenuItemRadio(props);
    return createElement(TagName92, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/menu/menu-separator.js
var TagName93 = "hr";
var useMenuSeparator = createHook(
  function useMenuSeparator2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useMenuContext();
    store = store || context;
    props = useCompositeSeparator(__spreadValues({ store }, props));
    return props;
  }
);
var MenuSeparator = forwardRef2(function MenuSeparator2(props) {
  const htmlProps = useMenuSeparator(props);
  return createElement(TagName93, htmlProps);
});

// node_modules/@ariakit/react-core/esm/hovercard/hovercard-provider.js
var import_jsx_runtime48 = __toESM(require_jsx_runtime());
function HovercardProvider(props = {}) {
  const store = useHovercardStore(props);
  return (0, import_jsx_runtime48.jsx)(HovercardContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/hovercard/hovercard-arrow.js
var TagName94 = "div";
var useHovercardArrow = createHook(
  function useHovercardArrow2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useHovercardContext();
    store = store || context;
    props = usePopoverArrow(__spreadValues({ store }, props));
    return props;
  }
);
var HovercardArrow = forwardRef2(function HovercardArrow2(props) {
  const htmlProps = useHovercardArrow(props);
  return createElement(TagName94, htmlProps);
});

// node_modules/@ariakit/react-core/esm/hovercard/hovercard-disclosure.js
var import_react72 = __toESM(require_react());
var import_jsx_runtime49 = __toESM(require_jsx_runtime());
var TagName95 = "button";
var useHovercardDisclosure = createHook(function useHovercardDisclosure2(_a) {
  var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
  const context = useHovercardProviderContext();
  store = store || context;
  invariant(
    store,
    "HovercardDisclosure must receive a `store` prop or be wrapped in a HovercardProvider component."
  );
  const [visible, setVisible] = (0, import_react72.useState)(false);
  (0, import_react72.useEffect)(() => {
    if (!visible)
      return;
    const onBlur = (event) => {
      if (!store)
        return;
      const nextActiveElement = event.relatedTarget;
      if (nextActiveElement) {
        const {
          anchorElement: anchor,
          popoverElement: popover,
          disclosureElement: disclosure
        } = store.getState();
        if (anchor && contains(anchor, nextActiveElement))
          return;
        if (popover && contains(popover, nextActiveElement))
          return;
        if (disclosure && contains(disclosure, nextActiveElement))
          return;
        if (nextActiveElement.hasAttribute("data-focus-trap"))
          return;
      }
      setVisible(false);
    };
    return addGlobalEventListener("focusout", onBlur, true);
  }, [visible, store]);
  (0, import_react72.useEffect)(() => {
    return sync(store, ["anchorElement"], (state) => {
      const anchor = state.anchorElement;
      if (!anchor)
        return;
      const observer = new MutationObserver(() => {
        if (!anchor.hasAttribute("data-focus-visible"))
          return;
        setVisible(true);
      });
      observer.observe(anchor, { attributeFilter: ["data-focus-visible"] });
      return () => observer.disconnect();
    });
  }, [store]);
  const onClickProp = props.onClick;
  const onClick = useEvent((event) => {
    onClickProp == null ? void 0 : onClickProp(event);
    if (event.defaultPrevented)
      return;
    store == null ? void 0 : store.setAutoFocusOnShow(true);
  });
  const onFocusProp = props.onFocus;
  const onFocus = useEvent((event) => {
    onFocusProp == null ? void 0 : onFocusProp(event);
    if (event.defaultPrevented)
      return;
    setVisible(true);
  });
  const { style } = useVisuallyHidden();
  if (!visible) {
    props = __spreadProps(__spreadValues({}, props), {
      style: __spreadValues(__spreadValues({}, style), props.style)
    });
  }
  const children3 = (0, import_jsx_runtime49.jsx)(
    "svg",
    {
      display: "block",
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 1.5,
      viewBox: "0 0 16 16",
      height: "1em",
      width: "1em",
      children: (0, import_jsx_runtime49.jsx)("polyline", { points: "4,6 8,10 12,6" })
    }
  );
  props = __spreadProps(__spreadValues({
    children: children3
  }, props), {
    ref: useMergeRefs(store.setDisclosureElement, props.ref),
    onClick,
    onFocus
  });
  props = useDialogDisclosure(__spreadValues({ store }, props));
  return props;
});
var HovercardDisclosure = forwardRef2(function HovercardDisclosure2(props) {
  const htmlProps = useHovercardDisclosure(props);
  return createElement(TagName95, htmlProps);
});

// node_modules/@ariakit/core/esm/tooltip/tooltip-store.js
function createTooltipStore(props = {}) {
  var _a;
  if (true) {
    if (props.type === "label") {
      console.warn(
        "The `type` option on the tooltip store is deprecated.",
        "Render a visually hidden label or use the `aria-label` or `aria-labelledby` attributes on the anchor element instead.",
        "See https://ariakit.org/components/tooltip#tooltip-anchors-must-have-accessible-names"
      );
    }
  }
  const syncState = (_a = props.store) == null ? void 0 : _a.getState();
  const hovercard = createHovercardStore(__spreadProps2(__spreadValues2({}, props), {
    placement: defaultValue(
      props.placement,
      syncState == null ? void 0 : syncState.placement,
      "top"
    ),
    hideTimeout: defaultValue(props.hideTimeout, syncState == null ? void 0 : syncState.hideTimeout, 0)
  }));
  const initialState = __spreadProps2(__spreadValues2({}, hovercard.getState()), {
    type: defaultValue(props.type, syncState == null ? void 0 : syncState.type, "description"),
    skipTimeout: defaultValue(props.skipTimeout, syncState == null ? void 0 : syncState.skipTimeout, 300)
  });
  const tooltip = createStore(initialState, hovercard, props.store);
  return __spreadValues2(__spreadValues2({}, hovercard), tooltip);
}

// node_modules/@ariakit/react-core/esm/__chunks/2D53SX6Q.js
function useTooltipStoreProps(store, update, props) {
  useStoreProps(store, props, "type");
  useStoreProps(store, props, "skipTimeout");
  return useHovercardStoreProps(store, update, props);
}
function useTooltipStore(props = {}) {
  const [store, update] = useStore(createTooltipStore, props);
  return useTooltipStoreProps(store, update, props);
}

// node_modules/@ariakit/react-core/esm/__chunks/TWCRTUOB.js
var ctx12 = createStoreContext(
  [HovercardContextProvider],
  [HovercardScopedContextProvider]
);
var useTooltipContext = ctx12.useContext;
var useTooltipScopedContext = ctx12.useScopedContext;
var useTooltipProviderContext = ctx12.useProviderContext;
var TooltipContextProvider = ctx12.ContextProvider;
var TooltipScopedContextProvider = ctx12.ScopedContextProvider;

// node_modules/@ariakit/react-core/esm/tooltip/tooltip.js
var import_jsx_runtime50 = __toESM(require_jsx_runtime());
var TagName96 = "div";
var useTooltip = createHook(
  function useTooltip2(_a) {
    var _b = _a, {
      store,
      portal = true,
      gutter = 8,
      preserveTabOrder = false,
      hideOnHoverOutside = true,
      hideOnInteractOutside = true
    } = _b, props = __objRest(_b, [
      "store",
      "portal",
      "gutter",
      "preserveTabOrder",
      "hideOnHoverOutside",
      "hideOnInteractOutside"
    ]);
    const context = useTooltipProviderContext();
    store = store || context;
    invariant(
      store,
      "Tooltip must receive a `store` prop or be wrapped in a TooltipProvider component."
    );
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime50.jsx)(TooltipScopedContextProvider, { value: store, children: element }),
      [store]
    );
    const role = store.useState(
      (state) => state.type === "description" ? "tooltip" : "none"
    );
    props = __spreadValues({ role }, props);
    props = useHovercard(__spreadProps(__spreadValues({}, props), {
      store,
      portal,
      gutter,
      preserveTabOrder,
      hideOnHoverOutside(event) {
        if (isFalsyBooleanCallback(hideOnHoverOutside, event))
          return false;
        const anchorElement = store == null ? void 0 : store.getState().anchorElement;
        if (!anchorElement)
          return true;
        if ("focusVisible" in anchorElement.dataset)
          return false;
        return true;
      },
      hideOnInteractOutside: (event) => {
        if (isFalsyBooleanCallback(hideOnInteractOutside, event))
          return false;
        const anchorElement = store == null ? void 0 : store.getState().anchorElement;
        if (!anchorElement)
          return true;
        if (contains(anchorElement, event.target))
          return false;
        return true;
      }
    }));
    return props;
  }
);
var Tooltip = createDialogComponent(
  forwardRef2(function Tooltip2(props) {
    const htmlProps = useTooltip(props);
    return createElement(TagName96, htmlProps);
  }),
  useTooltipProviderContext
);

// node_modules/@ariakit/react-core/esm/tooltip/tooltip-provider.js
var import_jsx_runtime51 = __toESM(require_jsx_runtime());
function TooltipProvider(props = {}) {
  const store = useTooltipStore(props);
  return (0, import_jsx_runtime51.jsx)(TooltipContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/tooltip/tooltip-anchor.js
var import_react73 = __toESM(require_react());
var TagName97 = "div";
var globalStore = createStore({
  activeStore: null
});
function createRemoveStoreCallback(store) {
  return () => {
    const { activeStore } = globalStore.getState();
    if (activeStore !== store)
      return;
    globalStore.setState("activeStore", null);
  };
}
var useTooltipAnchor = createHook(
  function useTooltipAnchor2(_a) {
    var _b = _a, { store, showOnHover = true } = _b, props = __objRest(_b, ["store", "showOnHover"]);
    const context = useTooltipProviderContext();
    store = store || context;
    invariant(
      store,
      "TooltipAnchor must receive a `store` prop or be wrapped in a TooltipProvider component."
    );
    const canShowOnHoverRef = (0, import_react73.useRef)(false);
    (0, import_react73.useEffect)(() => {
      return sync(store, ["mounted"], (state) => {
        if (state.mounted)
          return;
        canShowOnHoverRef.current = false;
      });
    }, [store]);
    (0, import_react73.useEffect)(() => {
      if (!store)
        return;
      return chain(
        // Immediately remove the current store from the global store when
        // the component unmounts. This is useful, for example, to avoid
        // showing tooltips immediately on serial tests.
        createRemoveStoreCallback(store),
        sync(store, ["mounted", "skipTimeout"], (state) => {
          if (!store)
            return;
          if (state.mounted) {
            const { activeStore } = globalStore.getState();
            if (activeStore !== store) {
              activeStore == null ? void 0 : activeStore.hide();
            }
            return globalStore.setState("activeStore", store);
          }
          const id = setTimeout(
            createRemoveStoreCallback(store),
            state.skipTimeout
          );
          return () => clearTimeout(id);
        })
      );
    }, [store]);
    const onMouseEnterProp = props.onMouseEnter;
    const onMouseEnter = useEvent((event) => {
      onMouseEnterProp == null ? void 0 : onMouseEnterProp(event);
      canShowOnHoverRef.current = true;
    });
    const onFocusVisibleProp = props.onFocusVisible;
    const onFocusVisible = useEvent((event) => {
      onFocusVisibleProp == null ? void 0 : onFocusVisibleProp(event);
      if (event.defaultPrevented)
        return;
      store == null ? void 0 : store.setAnchorElement(event.currentTarget);
      store == null ? void 0 : store.show();
    });
    const onBlurProp = props.onBlur;
    const onBlur = useEvent((event) => {
      onBlurProp == null ? void 0 : onBlurProp(event);
      if (event.defaultPrevented)
        return;
      const { activeStore } = globalStore.getState();
      canShowOnHoverRef.current = false;
      if (activeStore === store) {
        globalStore.setState("activeStore", null);
      }
    });
    const type = store.useState("type");
    const contentId = store.useState((state) => {
      var _a2;
      return (_a2 = state.contentElement) == null ? void 0 : _a2.id;
    });
    props = __spreadProps(__spreadValues({
      "aria-labelledby": type === "label" ? contentId : void 0
    }, props), {
      onMouseEnter,
      onFocusVisible,
      onBlur
    });
    props = useHovercardAnchor(__spreadValues({
      store,
      showOnHover(event) {
        if (!canShowOnHoverRef.current)
          return false;
        if (isFalsyBooleanCallback(showOnHover, event))
          return false;
        const { activeStore } = globalStore.getState();
        if (!activeStore)
          return true;
        store == null ? void 0 : store.show();
        return false;
      }
    }, props));
    return props;
  }
);
var TooltipAnchor = forwardRef2(function TooltipAnchor2(props) {
  const htmlProps = useTooltipAnchor(props);
  return createElement(TagName97, htmlProps);
});

// node_modules/@ariakit/react-core/esm/tooltip/tooltip-arrow.js
var TagName98 = "div";
var useTooltipArrow = createHook(
  function useTooltipArrow2(_a) {
    var _b = _a, { store, size: size3 = 16 } = _b, props = __objRest(_b, ["store", "size"]);
    const context = useTooltipContext();
    store = store || context;
    invariant(
      store,
      "TooltipArrow must be wrapped in a Tooltip component."
    );
    props = usePopoverArrow(__spreadValues({ store, size: size3 }, props));
    return props;
  }
);
var TooltipArrow = forwardRef2(function TooltipArrow2(props) {
  const htmlProps = useTooltipArrow(props);
  return createElement(TagName98, htmlProps);
});

// node_modules/@ariakit/core/esm/toolbar/toolbar-store.js
function createToolbarStore(props = {}) {
  var _a;
  const syncState = (_a = props.store) == null ? void 0 : _a.getState();
  return createCompositeStore(__spreadProps2(__spreadValues2({}, props), {
    orientation: defaultValue(
      props.orientation,
      syncState == null ? void 0 : syncState.orientation,
      "horizontal"
    ),
    focusLoop: defaultValue(props.focusLoop, syncState == null ? void 0 : syncState.focusLoop, true)
  }));
}

// node_modules/@ariakit/react-core/esm/__chunks/GO2SPXQX.js
function useToolbarStoreProps(store, update, props) {
  return useCompositeStoreProps(store, update, props);
}
function useToolbarStore(props = {}) {
  const [store, update] = useStore(createToolbarStore, props);
  return useToolbarStoreProps(store, update, props);
}

// node_modules/@ariakit/react-core/esm/__chunks/IIER4YBF.js
var ctx13 = createStoreContext(
  [CompositeContextProvider],
  [CompositeScopedContextProvider]
);
var useToolbarContext = ctx13.useContext;
var useToolbarScopedContext = ctx13.useScopedContext;
var useToolbarProviderContext = ctx13.useProviderContext;
var ToolbarContextProvider = ctx13.ContextProvider;
var ToolbarScopedContextProvider = ctx13.ScopedContextProvider;

// node_modules/@ariakit/react-core/esm/toolbar/toolbar.js
var import_jsx_runtime52 = __toESM(require_jsx_runtime());
var TagName99 = "div";
var useToolbar = createHook(
  function useToolbar2(_a) {
    var _b = _a, {
      store: storeProp,
      orientation: orientationProp,
      virtualFocus,
      focusLoop,
      rtl
    } = _b, props = __objRest(_b, [
      "store",
      "orientation",
      "virtualFocus",
      "focusLoop",
      "rtl"
    ]);
    const context = useToolbarProviderContext();
    storeProp = storeProp || context;
    const store = useToolbarStore({
      store: storeProp,
      orientation: orientationProp,
      virtualFocus,
      focusLoop,
      rtl
    });
    const orientation = store.useState(
      (state) => state.orientation === "both" ? void 0 : state.orientation
    );
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime52.jsx)(ToolbarScopedContextProvider, { value: store, children: element }),
      [store]
    );
    props = __spreadValues({
      role: "toolbar",
      "aria-orientation": orientation
    }, props);
    props = useComposite(__spreadValues({ store }, props));
    return props;
  }
);
var Toolbar = forwardRef2(function Toolbar2(props) {
  const htmlProps = useToolbar(props);
  return createElement(TagName99, htmlProps);
});

// node_modules/@ariakit/react-core/esm/toolbar/toolbar-provider.js
var import_jsx_runtime53 = __toESM(require_jsx_runtime());
function ToolbarProvider(props = {}) {
  const store = useToolbarStore(props);
  return (0, import_jsx_runtime53.jsx)(ToolbarContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/__chunks/42UBRT4A.js
var import_react74 = __toESM(require_react(), 1);
var TagName100 = "div";
function getFirstTabbable(container) {
  restoreFocusIn(container);
  const tabbable = getFirstTabbableIn(container);
  disableFocusIn(container);
  return tabbable;
}
var useCompositeContainer = createHook(function useCompositeContainer2(_a) {
  var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
  const context = useCompositeContext();
  store = store || context;
  const ref = (0, import_react74.useRef)(null);
  const isOpenRef = (0, import_react74.useRef)(false);
  const open = (collapseToEnd = false) => {
    const container = ref.current;
    if (!container)
      return;
    restoreFocusIn(container);
    const tabbable = getFirstTabbableIn(container);
    if (!tabbable) {
      disableFocusIn(container);
      return;
    }
    isOpenRef.current = true;
    queueMicrotask(() => {
      tabbable.focus();
      if (isTextField(tabbable) || tabbable.isContentEditable) {
        selectTextField(tabbable, collapseToEnd);
      }
    });
  };
  const close = () => {
    const container = ref.current;
    if (!container)
      return;
    isOpenRef.current = false;
    disableFocusIn(container);
  };
  const renderedItems = useStoreState(store, "renderedItems");
  (0, import_react74.useEffect)(() => {
    const container = ref.current;
    if (!container)
      return;
    const isOpen = isOpenRef.current;
    if (!isOpen && (renderedItems == null ? void 0 : renderedItems.length)) {
      disableFocusIn(container);
    }
  }, [renderedItems]);
  const onFocusProp = props.onFocus;
  const onFocus = useEvent((event) => {
    onFocusProp == null ? void 0 : onFocusProp(event);
    if (event.defaultPrevented)
      return;
    if (!store)
      return;
    const isOpen = isOpenRef.current;
    if (isSelfTarget(event)) {
      isOpenRef.current = false;
      const { baseElement } = store.getState();
      const composite = baseElement;
      const selector2 = "[data-composite-container]";
      const containers = composite == null ? void 0 : composite.querySelectorAll(selector2);
      if (containers) {
        for (const container of containers) {
          disableFocusIn(container);
        }
      }
    } else if (!isOpen) {
      isOpenRef.current = true;
      restoreFocusIn(event.currentTarget);
      store == null ? void 0 : store.setState("moves", 0);
    }
  });
  const onBlurProp = props.onBlur;
  const onBlur = useEvent((event) => {
    onBlurProp == null ? void 0 : onBlurProp(event);
    if (event.defaultPrevented)
      return;
    if (isFocusEventOutside(event)) {
      close();
    }
  });
  const onKeyDownProp = props.onKeyDown;
  const onKeyDown = useEvent((event) => {
    onKeyDownProp == null ? void 0 : onKeyDownProp(event);
    if (event.defaultPrevented)
      return;
    if (event.altKey)
      return;
    if (event.ctrlKey)
      return;
    if (event.metaKey)
      return;
    if (event.shiftKey)
      return;
    const container = event.currentTarget;
    if (isSelfTarget(event)) {
      if (event.key.length === 1 && event.key !== " ") {
        const tabbable = getFirstTabbable(container);
        if (!tabbable)
          return;
        if (isTextField(tabbable) || tabbable.isContentEditable) {
          event.stopPropagation();
          open();
        }
      } else if (event.key === "Delete" || event.key === "Backspace") {
        const tabbable = getFirstTabbable(container);
        if (!tabbable)
          return;
        if (isTextField(tabbable) || tabbable.isContentEditable) {
          open();
          const onInput = () => queueMicrotask(() => container.focus());
          container.addEventListener("input", onInput, { once: true });
        }
      }
    } else if (event.key === "Escape") {
      queueMicrotask(() => container.focus());
    } else if (event.key === "Enter") {
      const target = event.target;
      const isInput = target.tagName === "INPUT" && !isButton(target) || target.tagName === "TEXTAREA";
      if (isInput || target.isContentEditable) {
        event.preventDefault();
        queueMicrotask(() => container.focus());
      }
    }
  });
  const onClickProp = props.onClick;
  const onClick = useEvent((event) => {
    onClickProp == null ? void 0 : onClickProp(event);
    if (event.defaultPrevented)
      return;
    if (isSelfTarget(event) && !event.detail) {
      open(true);
    }
  });
  props = __spreadProps(__spreadValues({
    "data-composite-container": ""
  }, props), {
    ref: useMergeRefs(ref, props.ref),
    onFocus,
    onBlur,
    onKeyDown,
    onClick
  });
  return removeUndefinedValues(props);
});
var CompositeContainer = forwardRef2(function CompositeContainer2(props) {
  const htmlProps = useCompositeContainer(props);
  return createElement(TagName100, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/IE4UOD3X.js
var TagName101 = "button";
var useToolbarItem = createHook(
  function useToolbarItem2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useToolbarContext();
    store = store || context;
    props = useCompositeItem(__spreadValues({ store }, props));
    return props;
  }
);
var ToolbarItem = memo2(
  forwardRef2(function ToolbarItem2(props) {
    const htmlProps = useToolbarItem(props);
    return createElement(TagName101, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/toolbar/toolbar-container.js
var TagName102 = "div";
var useToolbarContainer = createHook(
  function useToolbarContainer2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useToolbarContext();
    store = store || context;
    props = useCompositeContainer(__spreadValues({ store }, props));
    props = useToolbarItem(__spreadValues({ store }, props));
    return props;
  }
);
var ToolbarContainer = memo2(
  forwardRef2(function ToolbarContainer2(props) {
    const htmlProps = useToolbarContainer(props);
    return createElement(TagName102, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/toolbar/toolbar-input.js
var TagName103 = "input";
var useToolbarInput = createHook(
  function useToolbarInput2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useToolbarContext();
    store = store || context;
    props = useToolbarItem(__spreadValues({ store }, props));
    return props;
  }
);
var ToolbarInput = memo2(
  forwardRef2(function ToolbarInput2(props) {
    const htmlProps = useToolbarInput(props);
    return createElement(TagName103, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/toolbar/toolbar-separator.js
var TagName104 = "hr";
var useToolbarSeparator = createHook(
  function useToolbarSeparator2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useToolbarContext();
    store = store || context;
    props = useCompositeSeparator(__spreadValues({ store }, props));
    return props;
  }
);
var ToolbarSeparator = forwardRef2(function ToolbarSeparator2(props) {
  const htmlProps = useToolbarSeparator(props);
  return createElement(TagName104, htmlProps);
});

// node_modules/@ariakit/react-core/esm/__chunks/KZ2S4ZC5.js
var import_react75 = __toESM(require_react(), 1);
var ctx14 = createStoreContext(
  [PopoverContextProvider, CompositeContextProvider],
  [PopoverScopedContextProvider, CompositeScopedContextProvider]
);
var useSelectContext = ctx14.useContext;
var useSelectScopedContext = ctx14.useScopedContext;
var useSelectProviderContext = ctx14.useProviderContext;
var SelectContextProvider = ctx14.ContextProvider;
var SelectScopedContextProvider = ctx14.ScopedContextProvider;
var SelectItemCheckedContext = (0, import_react75.createContext)(false);
var SelectHeadingContext = (0, import_react75.createContext)(null);

// node_modules/@ariakit/core/esm/tab/tab-store.js
function createTabStore(_a = {}) {
  var _b = _a, {
    composite: parentComposite,
    combobox
  } = _b, props = __objRest2(_b, [
    "composite",
    "combobox"
  ]);
  const independentKeys = [
    "items",
    "renderedItems",
    "moves",
    "orientation",
    "virtualFocus",
    "includesBaseElement",
    "baseElement",
    "focusLoop",
    "focusShift",
    "focusWrap"
  ];
  const store = mergeStore(
    props.store,
    omit2(parentComposite, independentKeys),
    omit2(combobox, independentKeys)
  );
  const syncState = store == null ? void 0 : store.getState();
  const composite = createCompositeStore(__spreadProps2(__spreadValues2({}, props), {
    store,
    // We need to explicitly set the default value of `includesBaseElement` to
    // `false` since we don't want the composite store to default it to `true`
    // when the activeId state is null, which could be the case when rendering
    // combobox with tab.
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState == null ? void 0 : syncState.includesBaseElement,
      false
    ),
    orientation: defaultValue(
      props.orientation,
      syncState == null ? void 0 : syncState.orientation,
      "horizontal"
    ),
    focusLoop: defaultValue(props.focusLoop, syncState == null ? void 0 : syncState.focusLoop, true)
  }));
  const panels = createCollectionStore();
  const initialState = __spreadProps2(__spreadValues2({}, composite.getState()), {
    selectedId: defaultValue(
      props.selectedId,
      syncState == null ? void 0 : syncState.selectedId,
      props.defaultSelectedId
    ),
    selectOnMove: defaultValue(
      props.selectOnMove,
      syncState == null ? void 0 : syncState.selectOnMove,
      true
    )
  });
  const tab = createStore(initialState, composite, store);
  setup(
    tab,
    () => sync(tab, ["moves"], () => {
      const { activeId, selectOnMove } = tab.getState();
      if (!selectOnMove)
        return;
      if (!activeId)
        return;
      const tabItem = composite.item(activeId);
      if (!tabItem)
        return;
      if (tabItem.dimmed)
        return;
      if (tabItem.disabled)
        return;
      tab.setState("selectedId", tabItem.id);
    })
  );
  let syncActiveId = true;
  setup(
    tab,
    () => batch(tab, ["selectedId"], (state, prev) => {
      if (!syncActiveId) {
        syncActiveId = true;
        return;
      }
      if (parentComposite && state.selectedId === prev.selectedId)
        return;
      tab.setState("activeId", state.selectedId);
    })
  );
  setup(
    tab,
    () => sync(tab, ["selectedId", "renderedItems"], (state) => {
      if (state.selectedId !== void 0)
        return;
      const { activeId, renderedItems } = tab.getState();
      const tabItem = composite.item(activeId);
      if (tabItem && !tabItem.disabled && !tabItem.dimmed) {
        tab.setState("selectedId", tabItem.id);
      } else {
        const tabItem2 = renderedItems.find(
          (item) => !item.disabled && !item.dimmed
        );
        tab.setState("selectedId", tabItem2 == null ? void 0 : tabItem2.id);
      }
    })
  );
  setup(
    tab,
    () => sync(tab, ["renderedItems"], (state) => {
      const tabs = state.renderedItems;
      if (!tabs.length)
        return;
      return sync(panels, ["renderedItems"], (state2) => {
        const items = state2.renderedItems;
        const hasOrphanPanels = items.some((panel) => !panel.tabId);
        if (!hasOrphanPanels)
          return;
        items.forEach((panel, i) => {
          if (panel.tabId)
            return;
          const tabItem = tabs[i];
          if (!tabItem)
            return;
          panels.renderItem(__spreadProps2(__spreadValues2({}, panel), { tabId: tabItem.id }));
        });
      });
    })
  );
  let selectedIdFromSelectedValue = null;
  setup(tab, () => {
    const backupSelectedId = () => {
      selectedIdFromSelectedValue = tab.getState().selectedId;
    };
    const restoreSelectedId = () => {
      syncActiveId = false;
      tab.setState("selectedId", selectedIdFromSelectedValue);
    };
    if (parentComposite && "setSelectElement" in parentComposite) {
      return chain(
        sync(parentComposite, ["value"], backupSelectedId),
        sync(parentComposite, ["mounted"], restoreSelectedId)
      );
    }
    if (!combobox)
      return;
    return chain(
      sync(combobox, ["selectedValue"], backupSelectedId),
      sync(combobox, ["mounted"], restoreSelectedId)
    );
  });
  return __spreadProps2(__spreadValues2(__spreadValues2({}, composite), tab), {
    panels,
    setSelectedId: (id) => tab.setState("selectedId", id),
    select: (id) => {
      tab.setState("selectedId", id);
      composite.move(id);
    }
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/JZUY7XL6.js
var import_react76 = __toESM(require_react(), 1);
function useTabStoreProps(store, update, props) {
  useUpdateEffect(update, [props.composite, props.combobox]);
  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "selectedId", "setSelectedId");
  useStoreProps(store, props, "selectOnMove");
  const [panels, updatePanels] = useStore(() => store.panels, {});
  useUpdateEffect(updatePanels, [store, updatePanels]);
  return Object.assign(
    (0, import_react76.useMemo)(() => __spreadProps(__spreadValues({}, store), { panels }), [store, panels]),
    { composite: props.composite, combobox: props.combobox }
  );
}
function useTabStore(props = {}) {
  const combobox = useComboboxContext();
  const composite = useSelectContext() || combobox;
  props = __spreadProps(__spreadValues({}, props), {
    composite: props.composite !== void 0 ? props.composite : composite,
    combobox: props.combobox !== void 0 ? props.combobox : combobox
  });
  const [store, update] = useStore(createTabStore, props);
  return useTabStoreProps(store, update, props);
}

// node_modules/@ariakit/react-core/esm/__chunks/TNITL632.js
var ctx15 = createStoreContext(
  [CompositeContextProvider],
  [CompositeScopedContextProvider]
);
var useTabContext = ctx15.useContext;
var useTabScopedContext = ctx15.useScopedContext;
var useTabProviderContext = ctx15.useProviderContext;
var TabContextProvider = ctx15.ContextProvider;
var TabScopedContextProvider = ctx15.ScopedContextProvider;

// node_modules/@ariakit/react-core/esm/tab/tab.js
var import_react77 = __toESM(require_react());
var import_jsx_runtime54 = __toESM(require_jsx_runtime());
var TagName105 = "button";
var useTab = createHook(function useTab2(_a) {
  var _b = _a, {
    store,
    getItem: getItemProp
  } = _b, props = __objRest(_b, [
    "store",
    "getItem"
  ]);
  var _a2;
  const context = useTabScopedContext();
  store = store || context;
  invariant(
    store,
    "Tab must be wrapped in a TabList component."
  );
  const defaultId = useId();
  const id = props.id || defaultId;
  const dimmed = disabledFromProps(props);
  const getItem = (0, import_react77.useCallback)(
    (item) => {
      const nextItem = __spreadProps(__spreadValues({}, item), { dimmed });
      if (getItemProp) {
        return getItemProp(nextItem);
      }
      return nextItem;
    },
    [dimmed, getItemProp]
  );
  const onClickProp = props.onClick;
  const onClick = useEvent((event) => {
    onClickProp == null ? void 0 : onClickProp(event);
    if (event.defaultPrevented)
      return;
    store == null ? void 0 : store.setSelectedId(id);
  });
  const panelId = store.panels.useState(
    (state) => {
      var _a3;
      return (_a3 = state.items.find((item) => item.tabId === id)) == null ? void 0 : _a3.id;
    }
  );
  const shouldRegisterItem = defaultId ? props.shouldRegisterItem : false;
  const isActive = store.useState((state) => !!id && state.activeId === id);
  const selected = store.useState((state) => !!id && state.selectedId === id);
  const hasActiveItem2 = store.useState((state) => !!store.item(state.activeId));
  const canRegisterComposedItem = isActive || selected && !hasActiveItem2;
  const accessibleWhenDisabled = selected || ((_a2 = props.accessibleWhenDisabled) != null ? _a2 : true);
  const isWithinVirtualFocusComposite = useStoreState(
    store.combobox || store.composite,
    "virtualFocus"
  );
  if (isWithinVirtualFocusComposite) {
    props = __spreadProps(__spreadValues({}, props), {
      tabIndex: -1
    });
  }
  props = __spreadProps(__spreadValues({
    id,
    role: "tab",
    "aria-selected": selected,
    "aria-controls": panelId || void 0
  }, props), {
    onClick
  });
  if (store.composite) {
    const defaultProps = {
      id,
      accessibleWhenDisabled,
      store: store.composite,
      shouldRegisterItem: canRegisterComposedItem && shouldRegisterItem,
      render: props.render
    };
    props = __spreadProps(__spreadValues({}, props), {
      render: (0, import_jsx_runtime54.jsx)(
        CompositeItem,
        __spreadProps(__spreadValues({}, defaultProps), {
          render: store.combobox && store.composite !== store.combobox ? (0, import_jsx_runtime54.jsx)(CompositeItem, __spreadProps(__spreadValues({}, defaultProps), { store: store.combobox })) : defaultProps.render
        })
      )
    });
  }
  props = useCompositeItem(__spreadProps(__spreadValues({
    store
  }, props), {
    accessibleWhenDisabled,
    getItem,
    shouldRegisterItem
  }));
  return props;
});
var Tab = memo2(
  forwardRef2(function Tab2(props) {
    const htmlProps = useTab(props);
    return createElement(TagName105, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/tab/tab-provider.js
var import_jsx_runtime55 = __toESM(require_jsx_runtime());
function TabProvider(props = {}) {
  const store = useTabStore(props);
  return (0, import_jsx_runtime55.jsx)(TabContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/tab/tab-list.js
var import_jsx_runtime56 = __toESM(require_jsx_runtime());
var TagName106 = "div";
var useTabList = createHook(
  function useTabList2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useTabProviderContext();
    store = store || context;
    invariant(
      store,
      "TabList must receive a `store` prop or be wrapped in a TabProvider component."
    );
    const orientation = store.useState(
      (state) => state.orientation === "both" ? void 0 : state.orientation
    );
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime56.jsx)(TabScopedContextProvider, { value: store, children: element }),
      [store]
    );
    if (store.composite) {
      props = __spreadValues({
        focusable: false
      }, props);
    }
    props = __spreadValues({
      role: "tablist",
      "aria-orientation": orientation
    }, props);
    props = useComposite(__spreadValues({ store }, props));
    return props;
  }
);
var TabList = forwardRef2(function TabList2(props) {
  const htmlProps = useTabList(props);
  return createElement(TagName106, htmlProps);
});

// node_modules/@ariakit/react-core/esm/tab/tab-panel.js
var import_react78 = __toESM(require_react());
var import_jsx_runtime57 = __toESM(require_jsx_runtime());
var TagName107 = "div";
var useTabPanel = createHook(
  function useTabPanel2(_a) {
    var _b = _a, {
      store,
      unmountOnHide,
      tabId: tabIdProp,
      getItem: getItemProp
    } = _b, props = __objRest(_b, [
      "store",
      "unmountOnHide",
      "tabId",
      "getItem"
    ]);
    const context = useTabProviderContext();
    store = store || context;
    invariant(
      store,
      "TabPanel must receive a `store` prop or be wrapped in a TabProvider component."
    );
    const ref = (0, import_react78.useRef)(null);
    const id = useId(props.id);
    const [hasTabbableChildren, setHasTabbableChildren] = (0, import_react78.useState)(false);
    (0, import_react78.useEffect)(() => {
      const element = ref.current;
      if (!element)
        return;
      const tabbable = getAllTabbableIn(element);
      setHasTabbableChildren(!!tabbable.length);
    }, []);
    const getItem = (0, import_react78.useCallback)(
      (item) => {
        const nextItem = __spreadProps(__spreadValues({}, item), { id: id || item.id, tabId: tabIdProp });
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, tabIdProp, getItemProp]
    );
    const onKeyDownProp = props.onKeyDown;
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (event.defaultPrevented)
        return;
      if (!(store == null ? void 0 : store.composite))
        return;
      const state = store.getState();
      const tab = createTabStore(__spreadProps(__spreadValues({}, state), { activeId: state.selectedId }));
      tab.setState("renderedItems", state.renderedItems);
      const keyMap = {
        ArrowLeft: tab.previous,
        ArrowRight: tab.next,
        Home: tab.first,
        End: tab.last
      };
      const action = keyMap[event.key];
      if (!action)
        return;
      const nextId = action();
      if (!nextId)
        return;
      event.preventDefault();
      store.move(nextId);
    });
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime57.jsx)(TabScopedContextProvider, { value: store, children: element }),
      [store]
    );
    const tabId = store.panels.useState(
      () => {
        var _a2;
        return tabIdProp || ((_a2 = store == null ? void 0 : store.panels.item(id)) == null ? void 0 : _a2.tabId);
      }
    );
    const open = store.useState(
      (state) => !!tabId && state.selectedId === tabId
    );
    const disclosure = useDisclosureStore({ open });
    const mounted = disclosure.useState("mounted");
    props = __spreadProps(__spreadValues({
      id,
      role: "tabpanel",
      "aria-labelledby": tabId || void 0
    }, props), {
      children: unmountOnHide && !mounted ? null : props.children,
      ref: useMergeRefs(ref, props.ref),
      onKeyDown
    });
    props = useFocusable(__spreadValues({
      // If the tab panel is rendered as part of another composite widget such
      // as combobox, it should not be focusable.
      focusable: !store.composite && !hasTabbableChildren
    }, props));
    props = useDisclosureContent(__spreadValues({ store: disclosure }, props));
    props = useCollectionItem(__spreadProps(__spreadValues({ store: store.panels }, props), { getItem }));
    return props;
  }
);
var TabPanel = forwardRef2(function TabPanel2(props) {
  const htmlProps = useTabPanel(props);
  return createElement(TagName107, htmlProps);
});

// node_modules/@ariakit/core/esm/select/select-store.js
function createSelectStore(_a = {}) {
  var _b = _a, {
    combobox
  } = _b, props = __objRest2(_b, [
    "combobox"
  ]);
  const store = mergeStore(
    props.store,
    omit2(combobox, [
      "value",
      "items",
      "renderedItems",
      "baseElement",
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement"
    ])
  );
  throwOnConflictingProps(props, store);
  const syncState = store.getState();
  const composite = createCompositeStore(__spreadProps2(__spreadValues2({}, props), {
    store,
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState.virtualFocus,
      true
    ),
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState.includesBaseElement,
      false
    ),
    activeId: defaultValue(
      props.activeId,
      syncState.activeId,
      props.defaultActiveId,
      null
    ),
    orientation: defaultValue(
      props.orientation,
      syncState.orientation,
      "vertical"
    )
  }));
  const popover = createPopoverStore(__spreadProps2(__spreadValues2({}, props), {
    store,
    placement: defaultValue(
      props.placement,
      syncState.placement,
      "bottom-start"
    )
  }));
  const initialValue = new String("");
  const initialState = __spreadProps2(__spreadValues2(__spreadValues2({}, composite.getState()), popover.getState()), {
    value: defaultValue(
      props.value,
      syncState.value,
      props.defaultValue,
      initialValue
    ),
    setValueOnMove: defaultValue(
      props.setValueOnMove,
      syncState.setValueOnMove,
      false
    ),
    labelElement: defaultValue(syncState.labelElement, null),
    selectElement: defaultValue(syncState.selectElement, null),
    listElement: defaultValue(syncState.listElement, null)
  });
  const select = createStore(initialState, composite, popover, store);
  setup(
    select,
    () => sync(select, ["value", "items"], (state) => {
      if (state.value !== initialValue)
        return;
      if (!state.items.length)
        return;
      const item = state.items.find(
        (item2) => !item2.disabled && item2.value != null
      );
      if ((item == null ? void 0 : item.value) == null)
        return;
      select.setState("value", item.value);
    })
  );
  setup(
    select,
    () => sync(select, ["mounted"], (state) => {
      if (state.mounted)
        return;
      select.setState("activeId", initialState.activeId);
    })
  );
  setup(
    select,
    () => sync(select, ["mounted", "items", "value"], (state) => {
      if (combobox)
        return;
      if (state.mounted)
        return;
      const values = toArray(state.value);
      const lastValue = values[values.length - 1];
      if (lastValue == null)
        return;
      const item = state.items.find(
        (item2) => !item2.disabled && item2.value === lastValue
      );
      if (!item)
        return;
      select.setState("activeId", item.id);
    })
  );
  setup(
    select,
    () => batch(select, ["setValueOnMove", "moves"], (state) => {
      const { mounted, value, activeId } = select.getState();
      if (!state.setValueOnMove && mounted)
        return;
      if (Array.isArray(value))
        return;
      if (!state.moves)
        return;
      if (!activeId)
        return;
      const item = composite.item(activeId);
      if (!item || item.disabled || item.value == null)
        return;
      select.setState("value", item.value);
    })
  );
  return __spreadProps2(__spreadValues2(__spreadValues2(__spreadValues2({}, composite), popover), select), {
    combobox,
    setValue: (value) => select.setState("value", value),
    setLabelElement: (element) => select.setState("labelElement", element),
    setSelectElement: (element) => select.setState("selectElement", element),
    setListElement: (element) => select.setState("listElement", element)
  });
}

// node_modules/@ariakit/react-core/esm/__chunks/X5LAA6JI.js
function useSelectStoreProps(store, update, props) {
  useUpdateEffect(update, [props.combobox]);
  useStoreProps(store, props, "value", "setValue");
  useStoreProps(store, props, "setValueOnMove");
  return Object.assign(
    usePopoverStoreProps(
      useCompositeStoreProps(store, update, props),
      update,
      props
    ),
    { combobox: props.combobox }
  );
}
function useSelectStore(props = {}) {
  const combobox = useComboboxProviderContext();
  props = __spreadProps(__spreadValues({}, props), {
    combobox: props.combobox !== void 0 ? props.combobox : combobox
  });
  const [store, update] = useStore(createSelectStore, props);
  return useSelectStoreProps(store, update, props);
}

// node_modules/@ariakit/react-core/esm/__chunks/2UJDTHC7.js
var TagName108 = "span";
var useSelectArrow = createHook(
  function useSelectArrow2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useSelectContext();
    store = store || context;
    props = usePopoverDisclosureArrow(__spreadValues({ store }, props));
    return props;
  }
);
var SelectArrow = forwardRef2(function SelectArrow2(props) {
  const htmlProps = useSelectArrow(props);
  return createElement(TagName108, htmlProps);
});

// node_modules/@ariakit/react-core/esm/select/select.js
var import_react79 = __toESM(require_react());
var import_jsx_runtime58 = __toESM(require_jsx_runtime());
var TagName109 = "button";
function getSelectedValues(select) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}
function nextWithValue(store, next) {
  return () => {
    const nextId = next();
    if (!nextId)
      return;
    let i = 0;
    let nextItem = store.item(nextId);
    const firstItem = nextItem;
    while (nextItem && nextItem.value == null) {
      const nextId2 = next(++i);
      if (!nextId2)
        return;
      nextItem = store.item(nextId2);
      if (nextItem === firstItem)
        break;
    }
    return nextItem == null ? void 0 : nextItem.id;
  };
}
var useSelect = createHook(function useSelect2(_a) {
  var _b = _a, {
    store,
    name,
    form,
    required,
    showOnKeyDown = true,
    moveOnKeyDown = true,
    toggleOnPress = true,
    toggleOnClick = toggleOnPress
  } = _b, props = __objRest(_b, [
    "store",
    "name",
    "form",
    "required",
    "showOnKeyDown",
    "moveOnKeyDown",
    "toggleOnPress",
    "toggleOnClick"
  ]);
  const context = useSelectProviderContext();
  store = store || context;
  invariant(
    store,
    "Select must receive a `store` prop or be wrapped in a SelectProvider component."
  );
  const onKeyDownProp = props.onKeyDown;
  const showOnKeyDownProp = useBooleanEvent(showOnKeyDown);
  const moveOnKeyDownProp = useBooleanEvent(moveOnKeyDown);
  const placement = store.useState("placement");
  const dir = placement.split("-")[0];
  const value = store.useState("value");
  const multiSelectable = Array.isArray(value);
  const onKeyDown = useEvent((event) => {
    var _a2;
    onKeyDownProp == null ? void 0 : onKeyDownProp(event);
    if (event.defaultPrevented)
      return;
    if (!store)
      return;
    const { orientation, items: items2, activeId } = store.getState();
    const isVertical = orientation !== "horizontal";
    const isHorizontal = orientation !== "vertical";
    const isGrid2 = !!((_a2 = items2.find((item) => !item.disabled && item.value != null)) == null ? void 0 : _a2.rowId);
    const moveKeyMap = {
      ArrowUp: (isGrid2 || isVertical) && nextWithValue(store, store.up),
      ArrowRight: (isGrid2 || isHorizontal) && nextWithValue(store, store.next),
      ArrowDown: (isGrid2 || isVertical) && nextWithValue(store, store.down),
      ArrowLeft: (isGrid2 || isHorizontal) && nextWithValue(store, store.previous)
    };
    const getId = moveKeyMap[event.key];
    if (getId && moveOnKeyDownProp(event)) {
      event.preventDefault();
      store.move(getId());
    }
    const isTopOrBottom = dir === "top" || dir === "bottom";
    const isLeft = dir === "left";
    const isRight = dir === "right";
    const canShowKeyMap = {
      ArrowDown: isTopOrBottom,
      ArrowUp: isTopOrBottom,
      ArrowLeft: isLeft,
      ArrowRight: isRight
    };
    const canShow = canShowKeyMap[event.key];
    if (canShow && showOnKeyDownProp(event)) {
      event.preventDefault();
      store.move(activeId);
      queueBeforeEvent(event.currentTarget, "keyup", store.show);
    }
  });
  props = useWrapElement(
    props,
    (element) => (0, import_jsx_runtime58.jsx)(SelectScopedContextProvider, { value: store, children: element }),
    [store]
  );
  const [autofill, setAutofill] = (0, import_react79.useState)(false);
  const nativeSelectChangedRef = (0, import_react79.useRef)(false);
  (0, import_react79.useEffect)(() => {
    const nativeSelectChanged = nativeSelectChangedRef.current;
    nativeSelectChangedRef.current = false;
    if (nativeSelectChanged)
      return;
    setAutofill(false);
  }, [value]);
  const labelId = store.useState((state) => {
    var _a2;
    return (_a2 = state.labelElement) == null ? void 0 : _a2.id;
  });
  const label = props["aria-label"];
  const labelledBy = props["aria-labelledby"] || labelId;
  const items = store.useState((state) => {
    if (!name)
      return;
    return state.items;
  });
  const values = (0, import_react79.useMemo)(() => {
    return [...new Set(items == null ? void 0 : items.map((i) => i.value).filter((v) => v != null))];
  }, [items]);
  props = useWrapElement(
    props,
    (element) => {
      if (!name)
        return element;
      return (0, import_jsx_runtime58.jsxs)(import_jsx_runtime58.Fragment, { children: [
        (0, import_jsx_runtime58.jsxs)(
          "select",
          {
            style: {
              border: 0,
              clip: "rect(0 0 0 0)",
              height: "1px",
              margin: "-1px",
              overflow: "hidden",
              padding: 0,
              position: "absolute",
              whiteSpace: "nowrap",
              width: "1px"
            },
            tabIndex: -1,
            "aria-hidden": true,
            "aria-label": label,
            "aria-labelledby": labelledBy,
            name,
            form,
            required,
            value,
            multiple: multiSelectable,
            onFocus: () => {
              var _a2;
              return (_a2 = store == null ? void 0 : store.getState().selectElement) == null ? void 0 : _a2.focus();
            },
            onChange: (event) => {
              nativeSelectChangedRef.current = true;
              setAutofill(true);
              store == null ? void 0 : store.setValue(
                multiSelectable ? getSelectedValues(event.target) : event.target.value
              );
            },
            children: [
              toArray(value).map((value2) => {
                if (value2 == null)
                  return null;
                if (values.includes(value2))
                  return null;
                return (0, import_jsx_runtime58.jsx)("option", { value: value2, children: value2 }, value2);
              }),
              values.map((value2) => (0, import_jsx_runtime58.jsx)("option", { value: value2, children: value2 }, value2))
            ]
          }
        ),
        element
      ] });
    },
    [
      store,
      label,
      labelledBy,
      name,
      form,
      required,
      value,
      multiSelectable,
      values
    ]
  );
  const children3 = (0, import_jsx_runtime58.jsxs)(import_jsx_runtime58.Fragment, { children: [
    value,
    (0, import_jsx_runtime58.jsx)(SelectArrow, {})
  ] });
  const contentElement = store.useState("contentElement");
  props = __spreadProps(__spreadValues({
    role: "combobox",
    "aria-autocomplete": "none",
    "aria-labelledby": labelId,
    "aria-haspopup": getPopupRole(contentElement, "listbox"),
    "data-autofill": autofill || void 0,
    "data-name": name,
    children: children3
  }, props), {
    ref: useMergeRefs(store.setSelectElement, props.ref),
    onKeyDown
  });
  props = usePopoverDisclosure(__spreadValues({ store, toggleOnClick }, props));
  props = useCompositeTypeahead(__spreadValues({ store }, props));
  return props;
});
var Select = forwardRef2(function Select2(props) {
  const htmlProps = useSelect(props);
  return createElement(TagName109, htmlProps);
});

// node_modules/@ariakit/react-core/esm/select/select-provider.js
var import_jsx_runtime59 = __toESM(require_jsx_runtime());
function SelectProvider(props = {}) {
  const store = useSelectStore(props);
  return (0, import_jsx_runtime59.jsx)(SelectContextProvider, { value: store, children: props.children });
}

// node_modules/@ariakit/react-core/esm/select/select-dismiss.js
var TagName110 = "button";
var useSelectDismiss = createHook(
  function useSelectDismiss2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useSelectScopedContext();
    store = store || context;
    props = usePopoverDismiss(__spreadValues({ store }, props));
    return props;
  }
);
var SelectDismiss = forwardRef2(function SelectDismiss2(props) {
  const htmlProps = useSelectDismiss(props);
  return createElement(TagName110, htmlProps);
});

// node_modules/@ariakit/react-core/esm/select/select-group-label.js
var TagName111 = "div";
var useSelectGroupLabel = createHook(
  function useSelectGroupLabel2(props) {
    props = useCompositeGroupLabel(props);
    return props;
  }
);
var SelectGroupLabel = forwardRef2(function SelectGroupLabel2(props) {
  const htmlProps = useSelectGroupLabel(props);
  return createElement(TagName111, htmlProps);
});

// node_modules/@ariakit/react-core/esm/select/select-group.js
var TagName112 = "div";
var useSelectGroup = createHook(
  function useSelectGroup2(props) {
    props = useCompositeGroup(props);
    return props;
  }
);
var SelectGroup = forwardRef2(function SelectGroup2(props) {
  const htmlProps = useSelectGroup(props);
  return createElement(TagName112, htmlProps);
});

// node_modules/@ariakit/react-core/esm/select/select-heading.js
var import_react80 = __toESM(require_react());
var TagName113 = "h1";
var useSelectHeading = createHook(
  function useSelectHeading2(props) {
    const [, setHeadingId] = (0, import_react80.useContext)(SelectHeadingContext) || [];
    const id = useId(props.id);
    useSafeLayoutEffect(() => {
      setHeadingId == null ? void 0 : setHeadingId(id);
      return () => setHeadingId == null ? void 0 : setHeadingId(void 0);
    }, [setHeadingId, id]);
    props = __spreadValues({
      id
    }, props);
    props = usePopoverHeading(props);
    return props;
  }
);
var SelectHeading = forwardRef2(function SelectHeading2(props) {
  const htmlProps = useSelectHeading(props);
  return createElement(TagName113, htmlProps);
});

// node_modules/@ariakit/react-core/esm/select/select-item-check.js
var import_react81 = __toESM(require_react());
var TagName114 = "span";
var useSelectItemCheck = createHook(
  function useSelectItemCheck2(_a) {
    var _b = _a, { store, checked } = _b, props = __objRest(_b, ["store", "checked"]);
    const context = (0, import_react81.useContext)(SelectItemCheckedContext);
    checked = checked != null ? checked : context;
    props = useCheckboxCheck(__spreadProps(__spreadValues({}, props), { checked }));
    return props;
  }
);
var SelectItemCheck = forwardRef2(function SelectItemCheck2(props) {
  const htmlProps = useSelectItemCheck(props);
  return createElement(TagName114, htmlProps);
});

// node_modules/@ariakit/react-core/esm/select/select-item.js
var import_react82 = __toESM(require_react());
var import_jsx_runtime60 = __toESM(require_jsx_runtime());
var TagName115 = "div";
function isSelected2(storeValue, itemValue) {
  if (itemValue == null)
    return;
  if (storeValue == null)
    return false;
  if (Array.isArray(storeValue)) {
    return storeValue.includes(itemValue);
  }
  return storeValue === itemValue;
}
var useSelectItem = createHook(
  function useSelectItem2(_a) {
    var _b = _a, {
      store,
      value,
      getItem: getItemProp,
      hideOnClick,
      setValueOnClick = value != null,
      preventScrollOnKeyDown = true,
      focusOnHover = true
    } = _b, props = __objRest(_b, [
      "store",
      "value",
      "getItem",
      "hideOnClick",
      "setValueOnClick",
      "preventScrollOnKeyDown",
      "focusOnHover"
    ]);
    var _a2;
    const context = useSelectScopedContext();
    store = store || context;
    invariant(
      store,
      "SelectItem must be wrapped in a SelectList or SelectPopover component."
    );
    const id = useId(props.id);
    const disabled = disabledFromProps(props);
    const getItem = (0, import_react82.useCallback)(
      (item) => {
        const nextItem = __spreadProps(__spreadValues({}, item), {
          value: disabled ? void 0 : value,
          children: value
        });
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [disabled, value, getItemProp]
    );
    const multiSelectable = store.useState(
      (state) => Array.isArray(state.value)
    );
    hideOnClick = hideOnClick != null ? hideOnClick : value != null && !multiSelectable;
    const onClickProp = props.onClick;
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const hideOnClickProp = useBooleanEvent(hideOnClick);
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      if (isDownloading(event))
        return;
      if (isOpeningInNewTab(event))
        return;
      if (setValueOnClickProp(event) && value != null) {
        store == null ? void 0 : store.setValue((prevValue) => {
          if (!Array.isArray(prevValue))
            return value;
          if (prevValue.includes(value)) {
            return prevValue.filter((v) => v !== value);
          }
          return [...prevValue, value];
        });
      }
      if (hideOnClickProp(event)) {
        store == null ? void 0 : store.hide();
      }
    });
    const selected = store.useState((state) => isSelected2(state.value, value));
    props = useWrapElement(
      props,
      (element) => (0, import_jsx_runtime60.jsx)(SelectItemCheckedContext.Provider, { value: selected != null ? selected : false, children: element }),
      [selected]
    );
    const listElement = store.useState("listElement");
    const autoFocus = store.useState((state) => {
      if (value == null)
        return false;
      if (state.value == null)
        return false;
      if (state.activeId !== id && (store == null ? void 0 : store.item(state.activeId)))
        return false;
      if (Array.isArray(state.value)) {
        return state.value[state.value.length - 1] === value;
      }
      return state.value === value;
    });
    props = __spreadProps(__spreadValues({
      id,
      role: getPopupItemRole(listElement),
      "aria-selected": selected,
      children: value
    }, props), {
      autoFocus: (_a2 = props.autoFocus) != null ? _a2 : autoFocus,
      onClick
    });
    props = useCompositeItem(__spreadValues({
      store,
      getItem,
      preventScrollOnKeyDown
    }, props));
    const focusOnHoverProp = useBooleanEvent(focusOnHover);
    props = useCompositeHover(__spreadProps(__spreadValues({
      store
    }, props), {
      // We have to disable focusOnHover when the popup is closed, otherwise
      // the active item will change to null (the container) when the popup is
      // closed by clicking on an item.
      focusOnHover(event) {
        if (!focusOnHoverProp(event))
          return false;
        const state = store == null ? void 0 : store.getState();
        return !!(state == null ? void 0 : state.open);
      }
    }));
    return props;
  }
);
var SelectItem = memo2(
  forwardRef2(function SelectItem2(props) {
    const htmlProps = useSelectItem(props);
    return createElement(TagName115, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/select/select-label.js
var TagName116 = "div";
var useSelectLabel = createHook(
  function useSelectLabel2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useSelectProviderContext();
    store = store || context;
    invariant(
      store,
      "SelectLabel must receive a `store` prop or be wrapped in a SelectProvider component."
    );
    const id = useId(props.id);
    const onClickProp = props.onClick;
    const onClick = useEvent((event) => {
      onClickProp == null ? void 0 : onClickProp(event);
      if (event.defaultPrevented)
        return;
      queueMicrotask(() => {
        const select = store == null ? void 0 : store.getState().selectElement;
        select == null ? void 0 : select.focus();
      });
    });
    props = __spreadProps(__spreadValues({
      id
    }, props), {
      ref: useMergeRefs(store.setLabelElement, props.ref),
      onClick,
      style: __spreadValues({
        cursor: "default"
      }, props.style)
    });
    return removeUndefinedValues(props);
  }
);
var SelectLabel = memo2(
  forwardRef2(function SelectLabel2(props) {
    const htmlProps = useSelectLabel(props);
    return createElement(TagName116, htmlProps);
  })
);

// node_modules/@ariakit/react-core/esm/__chunks/EQC5P6YO.js
var import_react83 = __toESM(require_react(), 1);
var import_jsx_runtime61 = __toESM(require_jsx_runtime(), 1);
var TagName117 = "div";
var SelectListContext = (0, import_react83.createContext)(null);
var useSelectList = createHook(
  function useSelectList2(_a) {
    var _b = _a, {
      store,
      resetOnEscape = true,
      hideOnEnter = true,
      focusOnMove = true,
      composite,
      alwaysVisible
    } = _b, props = __objRest(_b, [
      "store",
      "resetOnEscape",
      "hideOnEnter",
      "focusOnMove",
      "composite",
      "alwaysVisible"
    ]);
    const context = useSelectContext();
    store = store || context;
    invariant(
      store,
      "SelectList must receive a `store` prop or be wrapped in a SelectProvider component."
    );
    const id = useId(props.id);
    const value = store.useState("value");
    const multiSelectable = Array.isArray(value);
    const [defaultValue2, setDefaultValue] = (0, import_react83.useState)(value);
    const mounted = store.useState("mounted");
    (0, import_react83.useEffect)(() => {
      if (mounted)
        return;
      setDefaultValue(value);
    }, [mounted, value]);
    resetOnEscape = resetOnEscape && !multiSelectable;
    const onKeyDownProp = props.onKeyDown;
    const resetOnEscapeProp = useBooleanEvent(resetOnEscape);
    const hideOnEnterProp = useBooleanEvent(hideOnEnter);
    const onKeyDown = useEvent((event) => {
      onKeyDownProp == null ? void 0 : onKeyDownProp(event);
      if (event.defaultPrevented)
        return;
      if (event.key === "Escape" && resetOnEscapeProp(event)) {
        store == null ? void 0 : store.setValue(defaultValue2);
      }
      if (event.key === " " || event.key === "Enter") {
        if (isSelfTarget(event) && hideOnEnterProp(event)) {
          event.preventDefault();
          store == null ? void 0 : store.hide();
        }
      }
    });
    const headingContext = (0, import_react83.useContext)(SelectHeadingContext);
    const headingState = (0, import_react83.useState)();
    const [headingId, setHeadingId] = headingContext || headingState;
    const headingContextValue = (0, import_react83.useMemo)(
      () => [headingId, setHeadingId],
      [headingId]
    );
    const [childStore, setChildStore] = (0, import_react83.useState)(null);
    const setStore = (0, import_react83.useContext)(SelectListContext);
    (0, import_react83.useEffect)(() => {
      if (!setStore)
        return;
      setStore(store);
      return () => setStore(null);
    }, [setStore, store]);
    props = useWrapElement(
      props,
      (element2) => (0, import_jsx_runtime61.jsx)(SelectScopedContextProvider, { value: store, children: (0, import_jsx_runtime61.jsx)(SelectListContext.Provider, { value: setChildStore, children: (0, import_jsx_runtime61.jsx)(SelectHeadingContext.Provider, { value: headingContextValue, children: element2 }) }) }),
      [store, headingContextValue]
    );
    const hasCombobox = !!store.combobox;
    composite = composite != null ? composite : !hasCombobox && childStore !== store;
    const [element, setElement] = useTransactionState(
      composite ? store.setListElement : null
    );
    const role = useAttribute(element, "role", props.role);
    const isCompositeRole = role === "listbox" || role === "menu" || role === "tree" || role === "grid";
    const ariaMultiSelectable = composite || isCompositeRole ? multiSelectable || void 0 : void 0;
    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? __spreadProps(__spreadValues({}, props.style), { display: "none" }) : props.style;
    if (composite) {
      props = __spreadValues({
        role: "listbox",
        "aria-multiselectable": ariaMultiSelectable
      }, props);
    }
    const labelId = store.useState(
      (state) => {
        var _a2;
        return headingId || ((_a2 = state.labelElement) == null ? void 0 : _a2.id);
      }
    );
    props = __spreadProps(__spreadValues({
      id,
      "aria-labelledby": labelId,
      hidden
    }, props), {
      ref: useMergeRefs(setElement, props.ref),
      style,
      onKeyDown
    });
    props = useComposite(__spreadProps(__spreadValues({ store }, props), { composite }));
    props = useCompositeTypeahead(__spreadValues({ store, typeahead: !hasCombobox }, props));
    return props;
  }
);
var SelectList = forwardRef2(function SelectList2(props) {
  const htmlProps = useSelectList(props);
  return createElement(TagName117, htmlProps);
});

// node_modules/@ariakit/react-core/esm/select/select-popover.js
var TagName118 = "div";
var useSelectPopover = createHook(
  function useSelectPopover2(_a) {
    var _b = _a, { store, alwaysVisible } = _b, props = __objRest(_b, ["store", "alwaysVisible"]);
    const context = useSelectProviderContext();
    store = store || context;
    props = useSelectList(__spreadValues({ store, alwaysVisible }, props));
    props = usePopover(__spreadValues({ store, alwaysVisible }, props));
    return props;
  }
);
var SelectPopover = createDialogComponent(
  forwardRef2(function SelectPopover2(props) {
    const htmlProps = useSelectPopover(props);
    return createElement(TagName118, htmlProps);
  }),
  useSelectProviderContext
);

// node_modules/@ariakit/react-core/esm/select/select-row.js
var TagName119 = "div";
var useSelectRow = createHook(
  function useSelectRow2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useSelectContext();
    store = store || context;
    invariant(
      store,
      "SelectRow must be wrapped in a SelectList or SelectPopover component"
    );
    const listElement = store.useState("listElement");
    const popupRole = getPopupRole(listElement);
    const role = popupRole === "grid" ? "row" : "presentation";
    props = __spreadValues({ role }, props);
    props = useCompositeRow(__spreadValues({ store }, props));
    return props;
  }
);
var SelectRow = forwardRef2(function SelectRow2(props) {
  const htmlProps = useSelectRow(props);
  return createElement(TagName119, htmlProps);
});

// node_modules/@ariakit/react-core/esm/select/select-separator.js
var TagName120 = "hr";
var useSelectSeparator = createHook(
  function useSelectSeparator2(_a) {
    var _b = _a, { store } = _b, props = __objRest(_b, ["store"]);
    const context = useSelectContext();
    store = store || context;
    props = useCompositeSeparator(__spreadValues({ store }, props));
    return props;
  }
);
var SelectSeparator = forwardRef2(function SelectSeparator2(props) {
  const htmlProps = useSelectSeparator(props);
  return createElement(TagName120, htmlProps);
});

// node_modules/@ariakit/react-core/esm/select/select-value.js
function SelectValue({
  store,
  fallback,
  children: children3
} = {}) {
  const context = useSelectContext();
  store = store || context;
  const value = useStoreState(store, (state) => (state == null ? void 0 : state.value) || fallback);
  if (children3) {
    return children3(value || "");
  }
  return value;
}
export {
  Button,
  Checkbox,
  CheckboxCheck,
  CheckboxProvider,
  Collection,
  CollectionItem,
  CollectionProvider,
  Combobox,
  ComboboxCancel,
  ComboboxDisclosure,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxItemCheck,
  ComboboxItemValue,
  ComboboxLabel,
  ComboboxList,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxRow,
  ComboboxSeparator,
  ComboboxValue,
  Command,
  Composite,
  CompositeGroup,
  CompositeGroupLabel,
  CompositeHover,
  CompositeItem,
  CompositeProvider,
  CompositeRow,
  CompositeSeparator,
  CompositeTypeahead,
  Dialog,
  DialogDescription,
  DialogDisclosure,
  DialogDismiss,
  DialogHeading,
  DialogProvider,
  Disclosure,
  DisclosureContent,
  DisclosureProvider,
  FocusTrap,
  FocusTrapRegion,
  Focusable,
  Form,
  FormCheckbox,
  FormControl,
  FormDescription,
  FormError,
  FormField,
  FormGroup,
  FormGroupLabel,
  FormInput,
  FormLabel,
  FormProvider,
  FormPush,
  FormRadio,
  FormRadioGroup,
  FormRemove,
  FormReset,
  FormSubmit,
  Group,
  GroupLabel,
  Heading,
  HeadingLevel,
  Hovercard,
  HovercardAnchor,
  HovercardArrow,
  HovercardDescription,
  HovercardDisclosure,
  HovercardDismiss,
  HovercardHeading,
  HovercardProvider,
  Menu,
  MenuArrow,
  MenuBar,
  MenuBarProvider,
  MenuButton,
  MenuButtonArrow,
  MenuDescription,
  MenuDismiss,
  MenuGroup,
  MenuGroupLabel,
  MenuHeading,
  MenuItem,
  MenuItemCheck,
  MenuItemCheckbox,
  MenuItemRadio,
  MenuList,
  MenuProvider,
  MenuSeparator,
  Menubar,
  MenubarProvider,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverDescription,
  PopoverDisclosure,
  PopoverDisclosureArrow,
  PopoverDismiss,
  PopoverHeading,
  PopoverProvider,
  Portal,
  PortalContext,
  Radio,
  RadioGroup,
  RadioProvider,
  Role,
  Select,
  SelectArrow,
  SelectDismiss,
  SelectGroup,
  SelectGroupLabel,
  SelectHeading,
  SelectItem,
  SelectItemCheck,
  SelectLabel,
  SelectList,
  SelectPopover,
  SelectProvider,
  SelectRow,
  SelectSeparator,
  SelectValue,
  Separator,
  Tab,
  TabList,
  TabPanel,
  TabProvider,
  Toolbar,
  ToolbarContainer,
  ToolbarInput,
  ToolbarItem,
  ToolbarProvider,
  ToolbarSeparator,
  Tooltip,
  TooltipAnchor,
  TooltipArrow,
  TooltipProvider,
  VisuallyHidden,
  useCheckboxContext,
  useCheckboxStore,
  useCollectionContext,
  useCollectionStore,
  useComboboxContext,
  useComboboxStore,
  useCompositeContext,
  useCompositeStore,
  useDialogContext,
  useDialogStore,
  useDisclosureContext,
  useDisclosureStore,
  useFormContext,
  useFormStore,
  useHovercardContext,
  useHovercardStore,
  useMenuBarContext,
  useMenuBarStore,
  useMenuContext,
  useMenuStore,
  useMenubarContext,
  useMenubarStore,
  usePopoverContext,
  usePopoverStore,
  useRadioContext,
  useRadioStore,
  useSelectContext,
  useSelectStore,
  useStoreState,
  useTabContext,
  useTabStore,
  useToolbarContext,
  useToolbarStore,
  useTooltipContext,
  useTooltipStore
};
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=@ariakit_react.js.map
