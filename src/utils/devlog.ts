export const error = (message: any): void => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  /* eslint no-console: 0 */
  console.error(message);
};

export const warn = (message: any): void => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  /* eslint no-console: 0 */
  console.warn(message);
};

export const log = (message: any): void => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  /* eslint no-console: 0 */
  console.log(message);
};
export const devlog = {
  log,
  warn,
  error,
};
