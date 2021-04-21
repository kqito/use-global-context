import { createBaseContext } from '../core/context';
import { Subscription } from '../core/subscription';
import { createUseSelector, UseSelector } from '../core/useSelector';
import { createProvider, GlobalContextProviderProps } from './createProvider';
import { CreateGlobalContextReducers, GlobalContextValue, State } from './type';

export type CreateGlobalContextResult<T extends CreateGlobalContextReducers> = [
  UseSelector<GlobalContextValue<T>>,
  React.FC<GlobalContextProviderProps<T>>,
  () => State<T>
];

export const createGlobalContext = <T extends CreateGlobalContextReducers>(
  reducers: T
): CreateGlobalContextResult<T> => {
  const initialStore = {
    state: {},
    dispatch: {},
  } as GlobalContextValue<T>;

  const context = createBaseContext<GlobalContextValue<T>>();
  const subscription = new Subscription<GlobalContextValue<T>>(initialStore);
  const useGlobalContext = createUseSelector(context, subscription);
  const getStore = () => subscription.getStore().state;
  const GlobalContextProvider = createProvider({
    reducers,
    subscription,
    initialStore,
    ContextProvider: context.Provider,
  });

  return [useGlobalContext, GlobalContextProvider, getStore];
};
