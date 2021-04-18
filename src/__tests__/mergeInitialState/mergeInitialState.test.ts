import { userReducerArgs } from '../utils/reducer/user';
import { counterReducerArgs } from '../utils/reducer/counter';
import { mergeInitialState } from '../../index';

describe('mergeInitialState', () => {
  it('Pass another initial state', () => {
    const contextValue = {
      user: userReducerArgs,
      counter: counterReducerArgs,
    };

    const result = mergeInitialState(contextValue, {
      user: {
        ...userReducerArgs.initialState,
        loginCount: 100,
      },
    });

    expect(result.user.reducer).toEqual(userReducerArgs.reducer);
    expect(result.user.initialState).toEqual({
      ...userReducerArgs.initialState,
      loginCount: 100,
    });
    expect(result.counter).toEqual(counterReducerArgs);
  });

  it('Pass undefined', () => {
    const contextValue = {
      user: userReducerArgs,
      counter: counterReducerArgs,
    };

    const result = mergeInitialState(contextValue);

    expect(result.user.reducer).toEqual(userReducerArgs.reducer);
    expect(result.user.initialState).toEqual(userReducerArgs.initialState);
    expect(result.counter).toEqual(counterReducerArgs);
  });

  it('Pass empty object', () => {
    const contextValue = {
      user: userReducerArgs,
      counter: counterReducerArgs,
    };

    const result = mergeInitialState(contextValue, {});

    expect(result.user.reducer).toEqual(userReducerArgs.reducer);
    expect(result.user.initialState).toEqual(userReducerArgs.initialState);
    expect(result.counter).toEqual(counterReducerArgs);
  });
});
