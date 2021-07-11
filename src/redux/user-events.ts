import { stat } from 'fs';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { selectDateStart } from './recorder';
import { RootState } from './store';

export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

interface UserEventState {
  byIds: Record<UserEvent['id'], UserEvent>;
  allIds: UserEvent['id'][];
}

const LOAD_REQUEST = 'userEvents/load_request';
interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}

const LOAD_SUCCESS = 'userEvents/load_success';
interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: {
    events: UserEvent[];
  };
}

const LOAD_FAILURE = 'userEvents/load_failure';
interface LoadFailureAction extends Action<typeof LOAD_FAILURE> {
  error: string;
}

export const loadUserEvents =
  (): ThunkAction<
    void,
    RootState,
    undefined,
    LoadRequestAction | LoadSuccessAction | LoadFailureAction
  > =>
  async (dispatch, getState) => {
    dispatch({
      type: LOAD_REQUEST,
    });
    try {
      const response = await fetch('http://localhost:3001/events');

      const events: UserEvent[] = await response.json();

      dispatch({
        type: LOAD_SUCCESS,
        payload: { events },
      });
    } catch (e) {
      dispatch({
        type: LOAD_FAILURE,
        error: `Failed to load events. ${e}`,
      });
    }
  };

export const selectUserEventsState = (rootState: RootState) => {
  return rootState.userEvents;
};

export const selectUserEventsArray = (rootState: RootState) => {
  const state = selectUserEventsState(rootState);
  return state.allIds.map((id) => state.byIds[id]);
};

const CREATE_REQUEST = 'userEvents/create_request';

interface CreateRequestAction extends Action<typeof CREATE_REQUEST> {}

const CREATE_SUCCESS = 'userEvents/create_success';

interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}

const CREATE_FAILURE = 'userEvents/create_failure';

interface CreateFailureAction extends Action<typeof CREATE_FAILURE> {
  error: string;
}

export const createUserEvent =
  (): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    CreateRequestAction | CreateSuccessAction | CreateFailureAction
  > =>
  async (dispatch, getState) => {
    dispatch({
      type: CREATE_REQUEST,
    });

    try {
      const dateStart = selectDateStart(getState());
      const event: Omit<UserEvent, 'id'> = {
        title: 'Something todo',
        dateStart,
        dateEnd: new Date().toISOString(),
      };
      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const createdEvent: UserEvent = await response.json();

      dispatch({
        type: CREATE_SUCCESS,
        payload: { event: createdEvent },
      });
    } catch (e) {
      dispatch({
        type: CREATE_FAILURE,
        error: `Create user event failed with reason. ${e}`,
      });
    }
  };

const DELETE_REQUEST = 'userEvents/delete_request';

interface DeleteRequestAction extends Action<typeof DELETE_REQUEST> {}

const DELETE_SUCCESS = 'userEvents/delete_success';

interface DeleteSuccessAction extends Action<typeof DELETE_SUCCESS> {
  payload: {
    id: UserEvent['id'];
  };
}

const DELETE_FAILURE = 'userEvents/delete_failure';

interface DeleteFailureAction extends Action<typeof DELETE_FAILURE> {
  error: string;
}

export const deleteUserEvent =
  (
    id: UserEvent['id']
  ): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    DeleteRequestAction | DeleteSuccessAction | DeleteFailureAction
  > =>
  async (dispatch) => {
    dispatch({
      type: DELETE_REQUEST,
    });

    try {
      const response = await fetch(`http://localhost:3001/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        dispatch({
          type: DELETE_SUCCESS,
          payload: { id },
        });
      }
    } catch (e) {
      dispatch({
        type: DELETE_FAILURE,
        error: `Delete user event failed. ${e}`,
      });
    }
  };

const EDIT_REQUEST = 'userEvents/edit_request';

interface EditRequestAction extends Action<typeof EDIT_REQUEST> {}

const EDIT_SUCCESS = 'userEvents/edit_success';

interface EditSuccessAction extends Action<typeof EDIT_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}

const EDIT_FAILURE = 'userEvents/edit_failure';

interface EditFailureAction extends Action<typeof EDIT_FAILURE> {
  error: string;
}

export const editUserEvent =
  (
    id: UserEvent['id'],
    event: Omit<UserEvent, 'id'>
  ): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    EditRequestAction | EditSuccessAction | EditFailureAction
  > =>
  async (dispatch) => {
    dispatch({
      type: EDIT_REQUEST,
    });

    try {
      const response = await fetch(`http://localhost:3001/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const updatedEvent: UserEvent = await response.json();
      dispatch({
        type: EDIT_SUCCESS,
        payload: {
          event: updatedEvent,
        },
      });
    } catch (e) {
      dispatch({
        type: EDIT_FAILURE,
        error: `Edit User Event Failed. ${e}`,
      });
    }
  };

const initialState: UserEventState = {
  byIds: {},
  allIds: [],
};

const userEventsReducer = (
  state: UserEventState = initialState,
  action:
    | LoadSuccessAction
    | LoadRequestAction
    | LoadFailureAction
    | CreateSuccessAction
    | DeleteSuccessAction
    | EditSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload;
      const allIds = events.map((event) => event.id);
      const byIds = events.reduce<UserEventState['byIds']>((byIds, event) => {
        byIds[event.id] = event;
        return byIds;
      }, {});
      return { ...state, allIds, byIds };
    case CREATE_SUCCESS:
      const { event } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event },
      };
    case EDIT_SUCCESS:
      const editEvent = action.payload.event;
      const editId = editEvent.id;
      return {
        ...state,
        allIds: [...state.allIds],
        byIds: { ...state.byIds, [editId]: editEvent },
      };
    case DELETE_SUCCESS:
      const { id } = action.payload;
      const newState = {
        ...state,
        byIds: { ...state.byIds },
        allIds: state.allIds.filter((storeId) => storeId !== id),
      };
      delete newState.byIds[id];
      return newState;
    default:
      return state;
  }
};

export default userEventsReducer;
