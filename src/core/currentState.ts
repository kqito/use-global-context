export const createCurrentState = <T extends Record<string, unknown>>(
  initialState: T
) => {
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
