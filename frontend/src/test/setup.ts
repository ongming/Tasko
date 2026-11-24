import '@testing-library/jest-dom/vitest'

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (typeof globalThis.DOMMatrixReadOnly === 'undefined') {
  // @ts-expect-error polyfill for jsdom in React Flow tests
  globalThis.DOMMatrixReadOnly = class DOMMatrixReadOnly {
    m22 = 1
    constructor() {}
  }
}
