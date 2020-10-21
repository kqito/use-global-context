export type Subscription<State> = Set<(nextStore: State) => void>;
