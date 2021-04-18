import { User } from '../reducer/user';

export type Actions = ReturnType<typeof updateUserName | typeof incrementCount>;

export const updateUserName = (name: User['name']) =>
  ({
    type: 'UPDATE_USER_NAME',
    payload: {
      name,
    },
  } as const);

export const incrementCount = () =>
  ({
    type: 'INCREMENT_COUNT',
  } as const);
