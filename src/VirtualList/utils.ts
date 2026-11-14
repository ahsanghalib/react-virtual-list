/* eslint-disable @typescript-eslint/no-this-alias */
/* istanbul ignore file */
import memoizeOne from "memoize-one";

const getHeightsAndOffsets = memoizeOne((elements: any) => {
  const heights: number[] = [];
  const offsets: number[] = [];
  let maxHeight = 0;
  let minHeight = 0;
  let totalHeight = 0;
  let avgHeight = 0;

  if (!elements || !Array.isArray(elements)) {
    return { heights, offsets, totalHeight, maxHeight, minHeight, avgHeight };
  }

  elements.forEach((e) => {
    offsets.push(heights.reduce((a, c) => a + c, 0));
    const h = Math.max(parseInt(e?.props?.height, 0), 0);

    if (maxHeight === 0 || h > maxHeight) {
      maxHeight = h;
    }

    if (minHeight === 0 || h < minHeight) {
      minHeight = h;
    }

    heights.push(h);
  });

  totalHeight = heights.reduce((a, c) => a + c, 0);
  avgHeight = (maxHeight + minHeight) / 2;

  return { heights, offsets, totalHeight, maxHeight, minHeight, avgHeight };
});

const search = memoizeOne((array: any, target: number) => {
  let start = 0;
  let end = array?.length - 1;
  while (start <= end) {
    const middle = Math.floor((start + end) / 2);
    if (target < array[start + 1]) return start;
    if (target > array[end]) return end;
    if (
      target === array[middle] ||
      (target > array[middle - 1] && target < array[middle + 1])
    )
      return middle;
    if (target > array[middle]) start = middle + 1;
    if (target < array[middle]) end = middle - 1;
  }
  return -1;
});

/* c8 ignore start */
const createDetectElementResize = (nonce = null) => {
  let _window: any;

  if (typeof window !== "undefined") {
    _window = window;
  } else {
    _window = globalThis as any;
  }

  const attachEvent =
    typeof _window.document !== "undefined" && _window.document.attachEvent;

  let animation = false;
  let keyframeprefix = "";
  let animationstartevent = "animationstart";
  const domPrefixes = "Webkit Moz O ms".split(" ");
  const startEvents =
    "webkitAnimationStart animationstart oAnimationStart MSAnimationStart".split(
      " ",
    );
  const animationName = "resizeanim";

  const requestFrame = (() => {
    const func = (fn: () => void) => _window.setTimeout(fn, 20);
    const raf =
      _window.requestAnimationFrame ||
      _window.mozRequestAnimationFrame ||
      _window.webkitCancelAnimationFrame ||
      func;
    return (fn: () => void) => raf(fn);
  })();

  const cancelFrame = (() => {
    const cancel =
      _window.cancelAnimationFrame ||
      _window.mozCancelAnimationFrame ||
      _window.webkitCancelAnimationFrame ||
      _window.clearTimeout;

    return (id: number) => cancel(id);
  })();

  const resetTriggers = (elem: any): void => {
    const triggers = elem.__resizeTriggers__;
    const expand = triggers.firstElementChild;
    const contract = triggers.lastElementChild;
    const expandChild = expand.firstElementChild;
    contract.scrollLeft = contract.scrollWidth;
    contract.scrollTop = contract.scrollHeight;
    expandChild.style.width = `${expand.offsetWidth + 1}px`;
    expandChild.style.height = `${expand.offsetHeight + 1}px`;
    expand.scrollLeft = expand.scrollWidth;
    expand.scrollTop = expand.scrollHeight;
  };

  const checkTriggers = (elem: any) =>
    elem.offsetWidth !== elem.__resizeLast__.width ||
    elem.offsetHeight !== elem.__resizeLast__.height;

  const scrollListener = function (this: any, e: Event): void {
    if (
      e.target instanceof Element &&
      e.target.className &&
      typeof e.target.className.indexOf === "function" &&
      e.target.className.indexOf("contract-trigger") < 0 &&
      e.target.className.indexOf("expand-trigger") < 0
    ) {
      return;
    }

    const elem = this; // to get actual element where scroll event is added;
    resetTriggers(elem);
    if (elem.__resizeRAF__) {
      cancelFrame(elem.__resizeRAF__);
    }

    elem.__resizeRAF__ = requestFrame(() => {
      if (checkTriggers(elem)) {
        elem.__resizeLast__.width = elem.offsetWidth;
        elem.__resizeLast__.height = elem.offsetHeight;
        elem.__resizeListeners__.forEach((fn: any) => {
          fn.call(elem, e);
        });
      }
    });
  };

  const elem = _window.document.createElement("fakeelement");
  if (elem.style.animationName !== undefined) {
    animation = true;
  }

  if (!animation) {
    for (let i = 0; i < domPrefixes.length; i++) {
      if (elem.style[`${domPrefixes[i]}AnimationName`] !== undefined) {
        keyframeprefix = `-${domPrefixes[i].toLowerCase()}-`;
        animationstartevent = startEvents[i];
        break;
      }
    }
  }

  const animationKeyframes = `@${keyframeprefix}keyframes ${animationName} { from { opacity: 0; } to { opacity: 0; } } `;
  const animationStyle = `${keyframeprefix}animation: 1ms ${animationName}; `;

  const createStyles = (doc: Document): void => {
    if (!doc.getElementById("detectElementResize")) {
      const css =
        `${animationKeyframes || ""}.resize-triggers { ${
          animationStyle || ""
        }visibility: hidden; opacity: 0; } ` +
        `.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: -1; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }`;
      const head = doc.head || doc.getElementsByTagName("head")[0];
      const style = doc.createElement("style");

      style.id = "detectElementResize";

      if (nonce != null) {
        style.setAttribute("nonce", nonce);
      }

      if (style.textContent) {
        style.textContent = css;
      } else {
        style.appendChild(doc.createTextNode(css));
      }

      head.appendChild(style);
    }
  };

  const addResizeListener = (elem: any, fn: EventListener) => {
    if (attachEvent) {
      elem.attachEvent("onresize", fn);
    } else {
      if (!elem.__resizeTriggers__) {
        const doc = elem.ownerDocument;
        const elementStyle = _window.getComputedStyle(elem);
        if (elementStyle && elementStyle.position === "static") {
          elem.style.position = "relative";
        }
        createStyles(doc);
        elem.__resizeLast__ = {};
        elem.__resizeListeners__ = [];
        elem.__resizeTriggers__ = doc.createElement("div");
        elem.__resizeTriggers__.className = "resize-triggers";
        const expandTrigger = doc.createElement("div");
        expandTrigger.className = "expand-trigger";
        expandTrigger.appendChild(doc.createElement("div"));
        const contractTrigger = doc.createElement("div");
        contractTrigger.className = "contract-trigger";
        elem.__resizeTriggers__.appendChild(expandTrigger);
        elem.__resizeTriggers__.appendChild(contractTrigger);
        elem.appendChild(elem.__resizeTriggers__);
        resetTriggers(elem);
        elem.addEventListener("scroll", scrollListener, true);

        if (animationstartevent) {
          elem.__resizeTriggers__.__animationListener__ = (e: any) => {
            if (e.animationName === animationName) {
              resetTriggers(elem);
            }
          };
          elem.__resizeTriggers__.addEventListener(
            animationstartevent,
            elem.__resizeTriggers__.__animationListener__,
          );
        }
      }

      elem.__resizeListeners__.push(fn);
    }
  };

  const removeResizeListener = (elem: any, fn: (e: Event) => void) => {
    if (attachEvent) {
      elem.detachEvent("onresize", fn);
    } else {
      elem.__resizeListeners__.splice(elem.__resizeListeners__.indexOf(fn), 1);
      if (!elem.__resizeListeners__.length) {
        elem.removeEventListener("scroll", scrollListener, true);
        if (elem.__resizeTriggers__.__animationListener__) {
          elem.__resizeTriggers__.removeEventListener(
            animationstartevent,
            elem.__resizeTriggers__.__animationListener__,
          );
          elem.__resizeTriggers__.__animationListener__ = null;
        }
        try {
          elem.__resizeTriggers__ = !elem.removeChild(elem.__resizeTriggers__);
        } catch {
          // Cleanup is best-effort if another handler already removed the node.
        }
      }
    }
  };

  return {
    addResizeListener,
    removeResizeListener,
  };
};
/* c8 ignore stop */

export { createDetectElementResize, getHeightsAndOffsets, search };
