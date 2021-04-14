import { User } from '../reducer/user';

export type Actions = ReturnType<typeof updateUserProfile>;

export const updateUserProfile = (user: User) =>
  ({
    type: 'UPDATE_USER_PROFILE',
    payload: {
      user,
    },
  } as const);
