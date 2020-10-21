export const isBrowser =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined' &&
  !(
    process.env.NODE_ENV !== 'production' &&
    process.env.USE_GLOBAL_CONTEXT_TEST_MODE === 'server'
  );
