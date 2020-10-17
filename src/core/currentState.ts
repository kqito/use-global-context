export const createCurrentState = <T extends Record<string, unknown>>(
  initialState: T
) => {
  let currentState = { ...initialState };
  const getCurrentState = () => currentState;
  const setCurrentState = (value: T[keyof T], key: keyof T) => {
    currentState[key] = value;
  };
  const resetCurrentState = () => {
    currentState = { ...initialState };
  };

  return {
    getCurrentState,
    setCurrentState,
    resetCurrentState,
  };
};
