import { isFunction } from './isFunction';

describe('isFunction', () => {
  it('Should be function', () => {
    const arrowFunc: any = () => {};

    if (!isFunction(arrowFunc)) {
      expect(arrowFunc).toThrowError();
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
