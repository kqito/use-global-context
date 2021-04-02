<h3 align="center">
  use-global-context
</h3>

<p align="center">
Use-global-context is a new way to use <a href="https://reactjs.org/docs/hooks-reference.html#usecontext">useContext</a> better with selector.
</p>

<p align="center">
  <a href="https://github.com/kqito/use-global-context/actions/workflows/node.js.yml"><img src="https://github.com/kqito/use-global-context/workflows/Node.js%20CI/badge.svg" alt="Build status"></a>
  <a href="https://badge.fury.io/js/use-global-context"><img src="https://badge.fury.io/js/use-global-context.svg" alt="Npm version"></a>
  <a href="https://github.com/kqito/use-global-context/blob/master/LICENSE"><img src="https://img.shields.io/github/license/kqito/use-global-context" alt="License"></a>
</p>

## Features
- Easy global state management with `useState` or `useReducer`.
- `useSelector` function.
- Prevents the unnecessary renders.
- Support for SSR.

## Why
The [`context API`](https://reactjs.org/docs/context.html) allows you to create a simple store in combination with hooks such as [`useState`](https://reactjs.org/docs/hooks-reference.html#usestate) and [`useReducer`](https://reactjs.org/docs/hooks-reference.html#usereducer).

However, it can lead to unnecessary renders if you don't split the context with proper granularity. It also doesn't have a feature like redux's useSelector. That means you have to memo. Please see [the solutions](https://github.com/facebook/react/issues/15156#issuecomment-474590693).

This library is intended to prevent unnecessary renders with selector, which is a problem with the context API.

And This library is also kqito's own test experimental implementation for [RCF #119](https://github.com/reactjs/rfcs/pull/119).

## Installation
You can install the package from npm.
```
npm install use-global-context
```

or
```
yarn add use-global-context
```


## Usage
### General
The first step is to define the reducer and its state.

```javascript
export const incrementCount = () => ({ type: "INCREMENT" });
export const decrementCount = () => ({ type: "DECREMENT" });

export const counterReducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT": {
      return {
        count: state.count + 1
      };
    }

    case "DECREMENT": {
      return {
        count: state.count - 1
      };
    }

    default: {
      return state;
    }
  }
};

export const initialCounterState = {
  count: 100,
  error: null,
  status: null,
};
```

Next, you can use it in the use-global-context API as follows.

```javascript
import { createUseReducerContext } from "use-global-context";
import {
  incrementCount,
  decrementCount,
  counterReducer,
  initialCounterState,
} from "./reducer/counter";

export const [useGlobalContext, ContextProvider] = createUseReducerContext({
  counter: {
    reducer: counterReducer,
    initialState: initialCounterState
  },
});

const App = () => (
  <ContextProvider>
    <Counter />
    <CounterButton />
  </ContextProvider>
)

const Counter = () => {
  // You can get the state value of the context as follows
  const count = useGlobalContext(({ state }) => state.counter.count);

  return <p>count: {count}</p>;
};

const CounterButton = () => {
  const counterDispatch = useGlobalContext(({ dispatch }) => dispatch.counter);

  return (
    <>
      <button onClick={() => counterDispatch(incrementCount())}>+ 1</button>
      <button onClick={() => counterDispatch(decrementCount())}>- 1</button>
    </>
  );
};

```


## API
### `createUseReducerContext` API
`createUseReducerContext` is an API that executes each value of the argument as a value of `useRecuer` and generates the result as hooks.

Each argument of this API can be the same as `useReducer`.

```javascript
import { createUseReducerContext } from "use-global-context";

import { counterReducer, counterInitialState } from './reducer/counter'
import { messageReducer, messageInitialState } from './reducer/message'
import { appReducer, appInitialState } from './reducer/app'

export const [useGlobalContext, ContextProvider] = createUseReducerContext({
  counter: {
    reducer: counterReducer,
    initialState: counterInitialState,
  },
  app: {
    reducer: appReducer,
    initialState: appInitialState,
  },
});
```

You can use `useGlobalContext` hooks as follows.

```javascript
const state = useGlobalContext(({ state, dispatch }) => state);
// {
//   counter: {
//     count: 100,
//     error: null,
//     status: null,
//   },
//   app: {
//     name: 'use-global-context',
//     description: 'A easy global state management library'
//   }
// }


const counter = useGlobalContext(({ state, dispatch }) => state.counter);
// {
//   count: 100,
//   error: null,
//   status: null,
// }

const count = useGlobalContext(({ state, dispatch }) => state.counter.count);
// 100

const dispatch = useGlobalContext(({ state, dispatch }) => dispatch)
// Each of the dispatch functions
// {
//   counter: ƒ dispatchAction,
//   message: ƒ dispatchAction,
//   app: ƒ dispatchAction
// }

const counterDispatch = useGlobalContext(({ state, dispatch }) => dispatch.counter);
// counter: ƒ dispatchAction,
```

### `createUseStateContext` API
`createUseStateContext` is an API that executes each value of the argument as the value of `useState` and generates the result as hooks.

```javascript
import { createUseStateContext } from "use-global-context";

const [useGlobalContext, ContextProvider] = createUseStateContext({
  counter: 0,
  message: "",
  app: {
    name: "use-global-context",
    description: "A easy global state management library",
  }
});
```

The usage is the same as [`createUseReducerContext` API](https://github.com/kqito/use-global-context#createusereducercontext-api).


## TypeScript
### Context value's type
You can define the value type of the context as follows.
For example, to define the type of the value of a context created with `createUseReducerContext`, you can use the following.

```typescript
import {
  createUseReducerContext,
  UseReducerContextValue,
} from 'use-global-context';
import { counterReducer, counterInitialState } from './reducer/counter'
import { messageReducer, messageInitialState } from './reducer/message'
import { appReducer, appInitialState } from './reducer/app'

const contextValue = {
  counter: {
    reducer: counterReducer,
    initialState: counterInitialState,
  },
  message: {
    reducer: messageReducer,
    initialState: messageInitialState,
  },
  app: {
    reducer: appReducer,
    initialState: appInitialState,
  },
}

const [useGlobalContext, ContextProvider] = createUseReducerContext(contextValue);

// You can define like this !!
type GlobalContextValue = UseReducerContextValue<typeof contextValue>;

const appNameSelector = (state: GlobalContextValue) => state.app.name

const appName = useGlobalContext(appNameSelector)
```

You can also define the type of the value of a context created by `createUseStateContext` by using the `UseStateContextValue` type as well.


## Examples
### [CreateUseReducerContext API example](https://codesandbox.io/s/use-global-contextexamplecreateusereducercontext-xfdxc "CodeSandBox")
This is an example of a counter app that uses the `createUseReducerContext` API.


------------
### [CreateUseStateContext API example](https://codesandbox.io/s/use-global-contextexamplecreateusestatecontext-p5ug4 "CodeSandBox")
This is an example of a counter app that uses the `createUseStateContext` API.


------------

## License
[MIT © kqito](./LICENSE)
