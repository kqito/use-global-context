
# use-global-context
**Use-global-context** is a new way to use [`useContext`](https://reactjs.org/docs/hooks-reference.html#usecontext) better.

![build status](https://github.com/kqito/use-global-context/workflows/Node.js%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/use-global-context.svg)](https://badge.fury.io/js/use-global-context)
![license](https://img.shields.io/github/license/kqito/use-global-context)

## Features
- Easy global state management with `useState` or `useReducer`.
- Prevents the unnecessary renders.
- `useSelector` function.
- Support for SSR.

## Why
The [`context API`](https://reactjs.org/docs/context.html) allows you to create a simple store in combination with hooks such as [`useState`](https://reactjs.org/docs/hooks-reference.html#usestate) and [`useReducer`](https://reactjs.org/docs/hooks-reference.html#usereducer).

However, it can lead to unnecessary renders if you don't split the context with proper granularity. It also doesn't have a feature like redux's useSelector. That means you have to memo. Please see [the solutions](https://github.com/facebook/react/issues/15156#issuecomment-474590693).

On the other hand, while redux is appropriate for managing large amounts of state, I don't think it's necessary for small projects to adopt such a large library.

This library is intended to avoid the implementation costs of redux and also to prevent unnecessary renders, which is a problem with the context API.

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
```javascript
import React from "react";
import { createUseStateContext } from "use-global-context";

// You can add global state here. easy !!
const [useGlobalContext, ContextProvider] = createUseStateContext({
  counter: 0,
  message: "",
  app: {
    name: "use-global-context",
    description: "A easy global state management library",
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
  const counter = useGlobalContext(({ state }) => state.counter);

  return <p>counter: {counter}</p>;
};

const CounterButton = () => {
  const counterDispatch = useGlobalContext(({ dispatch }) => dispatch.counter);

  return (
    <>
      <button onClick={() => counterDispatch((c) => c + 1)}>+ 1</button>
      <button onClick={() => counterDispatch((c) => c - 1)}>- 1</button>
    </>
  );
};

```


## API
### `createUseStateContext` API
`createUseStateContext` is an API that executes each value of the argument as the value of `useState` and generates the result as hooks.

```javascript
import React from "react";
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

You can use it as follows.

```javascript
const state = useGlobalContext(({ state, dispatch }) => state);
// {
//   counter: 0,
//   message: '',
//   app: {
//     name: 'use-global-context',
//     description: 'A easy global state management library'
//   }
// }


const app = useGlobalContext(({ state, dispatch }) => state.app);
// {
//   name: "use-global-context",
//   description: "A easy global state management library",
// }

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

### `createUseReducerContext` API
`createUseReducerContext` is an API that executes each value of the argument as a value of `useRecuer` and generates the result as hooks.

Each argument of this API can be the same as `useReducer`.

```javascript
import React from "react";
import { createUseReducerContext } from "use-global-context";

import { counterReducer, counterInitialState } from './reducer/counter'
import { messageReducer, messageInitialState } from './reducer/message'
import { userReducer, userInitialState } from './reducer/user'


export const [useGlobalContext, ContextProvider] = createUseReducerContext({
  counter: {
    reducer: counterReducer,
    initialState: counterInitialState,
  },
  message: {
    reducer: messageReducer,
    initialState: messageInitialState,
  },
  user: {
    reducer: userReducer,
    initialState: userInitialState,
  },
});
```

The usage is the same as [`createUseStateContext` API](https://github.com/kqito/use-global-context#createusestatecontext-api).

## Examples
### [CreateUseStateContext API example](https://codesandbox.io/s/use-global-contextexamplecreateusestatecontext-p5ug4 "CodeSandBox")
This is an example of a counter app that uses the `createUseStateContext` API.

Notice that each time you increase/decrease the count, only the render of the Counter comport is running. (No unnecessary renders are happening.)


------------
### [CreateUseReducerContext API example](https://codesandbox.io/s/use-global-contextexamplecreateusereducercontext-xfdxc "CodeSandBox")
Similar to the example above, this is an example of a counter app using the `createUseReducerContext` API.


------------

## License
[MIT © kqito](./LICENSE)
