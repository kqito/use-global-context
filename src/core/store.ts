import { createDispatch } from '../createGlobalContext/createDispatch';
import {
  GlobalContextReducers,
  State,
  Dispatch,
  GlobalContextValue,
  PartialState,
} from '../createGlobalContext/type';
import { mergeInitialState } from '../mergeInitialState';
import { entries } from '../utils/entries';
import { Subscription } from './subscription';

export class Store<R extends GlobalContextReducers> {
  private reducers: R;

  private state: State<R>;

  private dispatch: Dispatch<R>;

  private subscription: Subscription<any>;

  constructor(reducers: R, subscription: Subscription<GlobalContextValue<R>>) {
    this.reducers = reducers;
    this.reset(subscription);
  }

  getStore = (): GlobalContextValue<R> => ({
    state: this.state,
    dispatch: this.dispatch,
  });

  setState = (state: PartialState<R>) => {
    this.state = entries(mergeInitialState(this.reducers, state)).reduce(
      (acc, [partial, { initialState }]) => {
        acc[partial] = initialState as any;

        return acc;
      },
      {} as State<R>
    );
  };

  setPartialState = (
    partial: keyof State<R>,
    value: State<R>[keyof State<R>]
  ) => {
    this.state[partial] = value;

    return this.state;
  };

  getSubscription = () => this.subscription;

  trySubscribe = () => {
    const store = this.getStore();
    this.subscription.trySubscribe(store);
  };

  reset = (subscription: Subscription<GlobalContextValue<R>>) => {
    const state = entries(this.reducers).reduce(
      (acc, [partial, { initialState }]) => {
        acc[partial] = initialState as any;

        return acc;
      },
      {} as State<R>
    );

    const dispatch = entries(this.reducers).reduce(
      (acc, [partial, { reducer }]) => {
        acc[partial] = createDispatch({
          partial,
          reducer,
          getStore: this.getStore,
          setPartialState: this.setPartialState,
          trySubscribe: subscription.trySubscribe,
        });

        return acc;
      },
      {} as Dispatch<R>
    );

    this.state = state;
    this.dispatch = dispatch;
    this.subscription = subscription;
  };
}
