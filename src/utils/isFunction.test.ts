import { isFunction } from './isFunction';

describe('isFunction', () => {
  it('Should be function', () => {
    const fn = jest.fn();
    if (!isFunction(fn)) {
      expect(fn).toThrowError();
    }
  });

  it('Should be not function', () => {
    const obj: any = {};
    const num: any = 0;

    if (isFunction(obj)) {
      expect(obj).toThrowError();
    }

    if (isFunction(num)) {
      expect(num).toThrowError();
    }
  });
});
