export class Subscription<S> {
  private listeners: Set<(state: S) => void>;

  constructor() {
    this.listeners = new Set<(state: S) => void>();
  }

  trySubscribe = (store: S) => {
    this.listeners.forEach((listener) => {
      listener(store);
    });
  };

  addListener = (listener: (state: S) => void) => {
    this.listeners.add(listener);
  };

  deleteListener = (listener: (state: S) => void) => {
    this.listeners.delete(listener);
  };

  reset = () => {
    this.listeners = new Set<(state: S) => void>();
  };
}
