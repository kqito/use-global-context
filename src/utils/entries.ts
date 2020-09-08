type Entries<T> = {
  [P in keyof T]: [P, T[P]];
}[keyof T][];

export const entries = <T>(values: T): Entries<T> =>
  Object.entries(values) as Entries<T>;
