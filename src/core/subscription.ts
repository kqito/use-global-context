export class Subscription<S extends { state: any; dispatch: any } = any> {
  private store: S;

  private listeners: Set<(state: S) => void>;

  constructor(store: S) {
    this.store = store;
    this.listeners = new Set<(state: S) => void>();
  }

  getStore() {
    return this.store;
  }

  setState<T extends keyof S['state']>(partial: T, value: S['state'][T]) {
    this.store.state[partial] = value;
  }

  setDispatchs<T extends keyof S['dispatch']>(
    partial: T,
    value: S['dispatch'][T]
  ) {
    this.store.dispatch[partial] = value;
  }

  trySubscribe() {
    this.listeners.forEach((listener) => {
      listener({ ...this.store });
    });
  }

  addListener(listener: (state: S) => void) {
    this.listeners.add(listener);
  }

  deleteListener(listener: (state: S) => void) {
    this.listeners.delete(listener);
  }

  reset(store: S) {
    this.store = store;
    this.listeners = new Set<(state: S) => void>();
  }
}
