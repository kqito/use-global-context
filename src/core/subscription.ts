export type Subscription<S> = {
  trySubscribe: (value: S) => void;
  addListener: (listener: (state: S) => void) => void;
  deleteListener: (listener: (state: S) => void) => void;
};

export const createSubscription = <S>() => {
  const listeners = new Set<(state: S) => void>();
  const trySubscribe = (value: S) => {
    listeners.forEach((listener) => {
      listener(value);
    });
  };
  const addListener = (listener: (state: S) => void) => {
    listeners.add(listener);
  };
  const deleteListener = (listener: (state: S) => void) => {
    listeners.delete(listener);
  };

  const subscription: Subscription<S> = {
    trySubscribe,
    addListener,
    deleteListener,
  };

  return subscription;
};
