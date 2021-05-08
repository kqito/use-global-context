import { createContext } from 'react';
import { Store } from './store';

export const globalContext = createContext<Store<any>>(null as any, () => 0);

globalContext.displayName = 'GlobalContext';
