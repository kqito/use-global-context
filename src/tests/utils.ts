export const testId = (id: string): string => `[data-testid="${id}"]`;

export const deepEqual = (a: any, b: any) =>
  JSON.stringify(a) === JSON.stringify(b);
