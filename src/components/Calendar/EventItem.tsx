import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addZero } from '../../llb/utils';
import {
  deleteUserEvent,
  editUserEvent,
  UserEvent,
} from '../../redux/user-events';

interface Props {
  event: UserEvent;
}
const getHours = (date: string) => {
  return addZero(new Date(date).getHours());
};
const getMinutes = (date: string) => {
  return addZero(new Date(date).getMinutes());
};
const EventItem: React.FC<Props> = ({ event }) => {
  const dispatch = useDispatch();

  const handleEventClick = () => {
    dispatch(deleteUserEvent(event.id));
  };

  const [editable, setEditable] = useState(false);

  const handleClickTitle = () => {
    setEditable(true);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editable]);
  const [title, setTitle] = useState(event.title);
  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleEditEvent = () => {
    if (title !== event.title) {
      const editEvent = {
        title,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd,
      };
      dispatch(editUserEvent(event.id, editEvent));
    }

    setEditable(false);
  };

  const handleBlurInput = () => {
    handleEditEvent();
  };

  const handleKeyupInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      handleEditEvent();
    }
  };

  return (
    <div className='calendar-event'>
      <div className='calendar-event-info'>
        <div className='calendar-event-time'>
          {getHours(event.dateStart)}:{getMinutes(event.dateStart)} -{' '}
          {getHours(event.dateEnd)}:{getMinutes(event.dateEnd)}
        </div>
        <div className='calendar-event-title'>
          {editable ? (
            <input
              ref={inputRef}
              type='text'
              onChange={handleChangeInput}
              onKeyUp={handleKeyupInput}
              onBlur={handleBlurInput}
              value={title}
            />
          ) : (
            <span onClick={handleClickTitle}>{event.title}</span>
          )}
        </div>
      </div>
      <button
        className='calendar-event-delete-button'
        onClick={handleEventClick}
      >
        &times;
      </button>
    </div>
  );
};

export default EventItem;
