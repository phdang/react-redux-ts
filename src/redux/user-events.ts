import { AnyAction } from 'redux';

interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

interface UserEventState {
  byIds: Record<UserEvent['id'], UserEvent>;
  allIds: UserEvent['id'][];
}

const initialState: UserEventState = {
  byIds: {},
  allIds: [],
};

const userEventsReducer = (
  state: UserEventState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default userEventsReducer;
