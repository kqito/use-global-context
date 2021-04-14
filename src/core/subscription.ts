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

  updateStore({
    newState,
    newDispatch,
  }: {
    newState?: Partial<S['state']>;
    newDispatch?: Partial<S['dispatch']>;
  }) {
    this.store.state = {
      ...this.store.state,
      ...(newState || {}),
    };

    this.store.dispatch = {
      ...this.store.dispatch,
      ...(newDispatch || {}),
    };
  }

  trySubscribe() {
    this.listeners.forEach((listener) => {
      listener(this.store);
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
