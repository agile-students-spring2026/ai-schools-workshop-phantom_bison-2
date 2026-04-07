import '@testing-library/jest-dom'

// Stub ResizeObserver for recharts
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).ResizeObserver = ResizeObserverStub
