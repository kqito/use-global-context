export const error = (message: any): void => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  /* eslint no-console: 0 */
  console.error(message);
};

export const log = {
  error,
};
