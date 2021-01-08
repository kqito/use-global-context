export interface Store<T extends Record<string, unknown>> {
  getState: () => T;
  setState: (key: keyof T, value: T[keyof T]) => void;
}

export const createStore = <T extends Record<string, unknown>>(
  initialValue: T
) => {
  let currentState = { ...initialValue };
  const getState = () => currentState;
  const setState = (key: keyof T, value: T[keyof T]) => {
    currentState[key] = value;
  };

  return {
    getState,
    setState,
  };
};
