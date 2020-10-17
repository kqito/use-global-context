export const isBrowser =
  (typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined') ||
  (process.env.NODE_ENV !== 'production' &&
    process.env.TEST_MODE === 'Browser');
