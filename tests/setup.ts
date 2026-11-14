import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

class TestIntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];
  readonly scrollMargin = "0px";

  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve() {}
}

vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);

HTMLElement.prototype.scrollTo = function (
  options: ScrollToOptions | number = {},
) {
  this.scrollTop = typeof options === "number" ? options : (options.top ?? 0);
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
