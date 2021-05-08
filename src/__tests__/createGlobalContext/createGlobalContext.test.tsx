import { useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { render, cleanup } from '@testing-library/react';
import { getByTestId } from '@testing-library/dom';
import { createSelector } from 'reselect';
import deepEqual from 'fast-deep-equal';
import {
  createGlobalContext,
  GlobalContextValue,
  mergeInitialState,
} from '../../index';
import { updateUserName } from '../utils/actions/user';
import { userReducerArgs } from '../utils/reducer/user';
import { applicationReducerArgs } from '../utils/reducer/application';
import * as isomorphicHooks from '../../core/useIsomorphicLayoutEffect';

type ContextValue = GlobalContextValue<typeof contextValue>;

const contextValue = {
  user: userReducerArgs,
  application: applicationReducerArgs,
};

const initialState = {
  user: userReducerArgs.initialState,
  application: applicationReducerArgs.initialState,
};

const useEffectMock = jest.fn();
let useIsomorphicLayoutEffectSpy: jest.SpyInstance<any, any> | undefined;

const testOnCSR = (test: () => void) => {
  it('CSR', () => {
    useEffectMock.mockImplementation(useEffect);
    test();
  });
};

const testOnSSR = (test: () => void) => {
  it('SSR', () => {
    useEffectMock.mockImplementation((fn) => fn());
    useIsomorphicLayoutEffectSpy = jest
      .spyOn(isomorphicHooks, 'useIsomorphicLayoutEffect')
      .mockImplementation(isomorphicHooks.onServerFn);

    test();
  });
};

describe('createGlobalContext', () => {
  beforeEach(() => {
    useIsomorphicLayoutEffectSpy?.mockRestore();
    cleanup();
  });

  describe('Initial state', () => {
    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      contextValue
    );

    const Container = () => {
      const globalState = useGlobalContext(({ state }) => state);
      const isLoaded = useGlobalContext(
        ({ state }) => state.application.isLoaded
      );
      const user = useGlobalContext(({ state }) => state.user);
      const id = useGlobalContext(({ state }) => state.user.id);
      const loginCount = useGlobalContext(({ state }) => state.user.loginCount);
      const nullValue = useGlobalContext(() => null);
      const undefinedValue = useGlobalContext(() => undefined);
      const arrayValue = useGlobalContext(() => []);
      const stringValue = useGlobalContext(() => '');

      expect(globalState).toStrictEqual(initialState);
      expect(isLoaded).toBe(initialState.application.isLoaded);
      expect(user).toBe(initialState.user);
      expect(id).toBe(initialState.user.id);
      expect(loginCount).toBe(initialState.user.loginCount);
      expect(nullValue).toBeNull();
      expect(undefinedValue).toBeUndefined();
      expect(arrayValue).toStrictEqual([]);
      expect(stringValue).toBe('');

      return null;
    };

    render(
      <GlobalContextProvider>
        <Container />
      </GlobalContextProvider>
    );
  });

  describe('Dispatch', () => {
    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      contextValue
    );

    const Container = () => {
      const id = useGlobalContext(({ state }) => state.user.id);
      const name = useGlobalContext(({ state }) => state.user.name);
      const loginCount = useGlobalContext(({ state }) => state.user.loginCount);

      const globalDispatch = useGlobalContext(({ dispatch }) => dispatch);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);
      const applicationDispatch = useGlobalContext(
        ({ dispatch }) => dispatch.application
      );

      expect(Object.keys(globalDispatch)).toStrictEqual([
        'user',
        'application',
      ]);
      expect(typeof globalDispatch.user).toBe('function');
      expect(typeof globalDispatch.application).toBe('function');
      expect(typeof userDispatch).toBe('function');
      expect(typeof applicationDispatch).toBe('function');

      userDispatch(updateUserName('name'));

      return (
        <div>
          <p data-testid="id">{id}</p>
          <p data-testid="name">{name}</p>
          <p data-testid="loginCount">{loginCount}</p>
        </div>
      );
    };

    testOnCSR(() => {
      const renderResult = render(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      expect(renderResult.getByTestId('id').textContent).toBe('');
      expect(renderResult.getByTestId('name').textContent).toBe('name');
      expect(renderResult.getByTestId('loginCount').textContent).toBe('0');
    });

    testOnSSR(() => {
      const innerElement = renderToString(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      const container = document.createElement('div');
      container.innerHTML = innerElement;

      expect(getByTestId(container, 'id').textContent).toBe('');
      expect(getByTestId(container, 'name').textContent).toBe('name');
      expect(getByTestId(container, 'loginCount').textContent).toBe('0');
    });
  });

  describe('Without actions', () => {
    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      contextValue
    );

    const Container = () => {
      const isLoaded = useGlobalContext(
        ({ state }) => state.application.isLoaded
      );

      const globalDispatch = useGlobalContext(({ dispatch }) => dispatch);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);
      const applicationDispatch = useGlobalContext(
        ({ dispatch }) => dispatch.application
      );

      expect(Object.keys(globalDispatch)).toStrictEqual([
        'user',
        'application',
      ]);
      expect(typeof globalDispatch.user).toBe('function');
      expect(typeof globalDispatch.application).toBe('function');
      expect(typeof userDispatch).toBe('function');
      expect(typeof applicationDispatch).toBe('function');

      useEffectMock(() => {
        applicationDispatch();
      }, [applicationDispatch]);

      return (
        <div>
          <p data-testid="isLoaded">{isLoaded ? 'true' : 'false'}</p>
        </div>
      );
    };

    testOnCSR(() => {
      const renderResult = render(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      expect(renderResult.getByTestId('isLoaded').textContent).toBe('true');
    });

    testOnSSR(() => {
      const innerElement = renderToString(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      const container = document.createElement('div');
      container.innerHTML = innerElement;

      expect(getByTestId(container, 'isLoaded').textContent).toBe('true');
    });
  });

  describe('GetState', () => {
    const ssrState: ContextValue['state'] = {
      user: {
        id: 'id',
        name: '',
        loginCount: 0,
      },
      application: { isLoaded: true },
    };

    const [
      useGlobalContext,
      GlobalContextProvider,
      stateController,
    ] = createGlobalContext(mergeInitialState(contextValue, ssrState));

    const Container = () => {
      const id = useGlobalContext(({ state }) => state.user.id);
      const name = useGlobalContext(({ state }) => state.user.name);
      const loginCount = useGlobalContext(({ state }) => state.user.loginCount);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);

      useEffectMock(() => {
        userDispatch(updateUserName('name'));
      }, [userDispatch]);

      return (
        <div>
          <p data-testid="id">{id}</p>
          <p data-testid="name">{name}</p>
          <p data-testid="loginCount">{loginCount}</p>
        </div>
      );
    };

    testOnCSR(() => {
      const renderResult = render(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      expect(renderResult.getByTestId('id').textContent).toBe('id');
      expect(renderResult.getByTestId('name').textContent).toBe('name');
      expect(renderResult.getByTestId('loginCount').textContent).toBe('0');
      expect(stateController.getState()).toStrictEqual({
        ...ssrState,
        user: {
          ...ssrState.user,
          name: 'name',
        },
      });
    });

    testOnSSR(() => {
      const innerElement = renderToString(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      const container = document.createElement('div');
      container.innerHTML = innerElement;

      expect(getByTestId(container, 'id').textContent).toBe('id');
      expect(getByTestId(container, 'name').textContent).toBe('name');
      expect(getByTestId(container, 'loginCount').textContent).toBe('0');
      expect(stateController.getState()).toStrictEqual({
        ...ssrState,
        user: {
          ...ssrState.user,
          name: 'name',
        },
      });
    });
  });

  describe('EqualityFunction', () => {
    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      contextValue
    );

    const Container = () => {
      const user = useGlobalContext(({ state }) => state.user, deepEqual);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);

      useEffectMock(() => {
        userDispatch(updateUserName('name'));
      }, [userDispatch]);

      return (
        <div>
          <p data-testid="id">{user.id}</p>
          <p data-testid="name">{user.name}</p>
          <p data-testid="loginCount">{user.loginCount}</p>
        </div>
      );
    };

    testOnCSR(() => {
      const renderResult = render(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      expect(renderResult.getByTestId('id').textContent).toBe('');
      expect(renderResult.getByTestId('name').textContent).toBe('name');
      expect(renderResult.getByTestId('loginCount').textContent).toBe('0');
    });

    testOnSSR(() => {
      const innerElement = renderToString(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      const container = document.createElement('div');
      container.innerHTML = innerElement;

      expect(getByTestId(container, 'id').textContent).toBe('');
      expect(getByTestId(container, 'name').textContent).toBe('name');
      expect(getByTestId(container, 'loginCount').textContent).toBe('0');
    });
  });

  describe('With "reselect"', () => {
    const getUserSelector = ({ state }: ContextValue) => state.user.name;
    const getNameSelector = createSelector([getUserSelector], (name) => name);

    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      contextValue
    );

    const Container = () => {
      const name = useGlobalContext(getNameSelector);

      const id = useGlobalContext(({ state }) => state.user.id);
      const loginCount = useGlobalContext(({ state }) => state.user.loginCount);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);

      useEffectMock(() => {
        userDispatch(updateUserName('name'));
      }, [userDispatch]);

      return (
        <div>
          <p data-testid="id">{id}</p>
          <p data-testid="name">{name}</p>
          <p data-testid="loginCount">{loginCount}</p>
        </div>
      );
    };

    testOnCSR(() => {
      const renderResult = render(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      expect(renderResult.getByTestId('id').textContent).toBe('');
      expect(renderResult.getByTestId('name').textContent).toBe('name');
      expect(renderResult.getByTestId('loginCount').textContent).toBe('0');
    });

    testOnSSR(() => {
      const innerElement = renderToString(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      const container = document.createElement('div');
      container.innerHTML = innerElement;

      expect(getByTestId(container, 'id').textContent).toBe('');
      expect(getByTestId(container, 'name').textContent).toBe('name');
      expect(getByTestId(container, 'loginCount').textContent).toBe('0');
    });
  });

  describe('Pass state props of "GlobalContextProvider"', () => {
    const ssrState: ContextValue['state'] = {
      user: {
        id: 'id',
        name: '',
        loginCount: 0,
      },
      application: { isLoaded: true },
    };

    const [
      useGlobalContext,
      GlobalContextProvider,
      stateController,
    ] = createGlobalContext(contextValue);

    const Container = () => {
      const id = useGlobalContext(({ state }) => state.user.id);
      const name = useGlobalContext(({ state }) => state.user.name);
      const loginCount = useGlobalContext(({ state }) => state.user.loginCount);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);

      useEffectMock(() => {
        userDispatch(updateUserName('name'));
      }, [userDispatch]);

      return (
        <div>
          <p data-testid="id">{id}</p>
          <p data-testid="name">{name}</p>
          <p data-testid="loginCount">{loginCount}</p>
        </div>
      );
    };

    testOnCSR(() => {
      stateController.setState(ssrState);

      const renderResult = render(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      expect(renderResult.getByTestId('id').textContent).toBe('id');
      expect(renderResult.getByTestId('name').textContent).toBe('name');
      expect(renderResult.getByTestId('loginCount').textContent).toBe('0');
      expect(stateController.getState()).toStrictEqual({
        ...ssrState,
        user: {
          ...ssrState.user,
          name: 'name',
        },
      });
    });

    testOnSSR(() => {
      stateController.setState(ssrState);

      const innerElement = renderToString(
        <GlobalContextProvider>
          <Container />
        </GlobalContextProvider>
      );

      const container = document.createElement('div');
      container.innerHTML = innerElement;

      expect(getByTestId(container, 'id').textContent).toBe('id');
      expect(getByTestId(container, 'name').textContent).toBe('name');
      expect(getByTestId(container, 'loginCount').textContent).toBe('0');
      expect(stateController.getState()).toStrictEqual({
        ...ssrState,
        user: {
          ...ssrState.user,
          name: 'name',
        },
      });
    });
  });
});
