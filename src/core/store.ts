export type Store<T extends Record<string, unknown>> = {
  getState: () => T;
  setState: (value: T[keyof T], key: keyof T) => void;
  resetState: () => void;
};

export const createInitialStore = <T extends Record<string, unknown>>(
  initialState: T
): Store<T> => {
  let currentState = { ...initialState };
  const getState = () => currentState;
  const setState = (value: T[keyof T], key: keyof T) => {
    currentState[key] = value;
  };
  const resetState = () => {
    currentState = { ...initialState };
  };

  return {
    getState,
    setState,
    resetState,
  };
};
