import { userReducerArgs } from '../utils/reducer/user';
import { applicationReducerArgs } from '../utils/reducer/application';
import { mergeInitialState } from '../../index';

describe('mergeInitialState', () => {
  it('Pass another initial state', () => {
    const contextValue = {
      user: userReducerArgs,
      application: applicationReducerArgs,
    };

    const result = mergeInitialState(contextValue, {
      user: {
        loginCount: 100,
      },
    });

    expect(result.user.reducer).toEqual(userReducerArgs.reducer);
    expect(result.user.initialState).toEqual({
      ...userReducerArgs.initialState,
      loginCount: 100,
    });
    expect(result.application).toEqual(applicationReducerArgs);
  });

  it('Pass undefined', () => {
    const contextValue = {
      user: userReducerArgs,
      application: applicationReducerArgs,
    };

    const result = mergeInitialState(contextValue);

    expect(result.user.reducer).toEqual(userReducerArgs.reducer);
    expect(result.user.initialState).toEqual(userReducerArgs.initialState);
    expect(result.application).toEqual(applicationReducerArgs);
  });

  it('Pass empty object', () => {
    const contextValue = {
      user: userReducerArgs,
      application: applicationReducerArgs,
    };

    const result = mergeInitialState(contextValue, {});

    expect(result.user.reducer).toEqual(userReducerArgs.reducer);
    expect(result.user.initialState).toEqual(userReducerArgs.initialState);
    expect(result.application).toEqual(applicationReducerArgs);
  });
});
