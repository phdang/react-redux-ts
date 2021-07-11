import React, { useEffect } from 'react';
import './Calendar.css';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../redux/store';
import {
  selectUserEventsArray,
  loadUserEvents,
  UserEvent,
} from '../../redux/user-events';
import { addZero } from '../../llb/utils';
import EventItem from './EventItem';

const mapState = (state: RootState) => ({
  events: selectUserEventsArray(state),
});

const mapDispatch = {
  loadUserEvents,
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends PropsFromRedux {}

const createDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${addZero(year)}-${addZero(month)}-${addZero(day)}`;
};

const groupEventsByDate = (events: UserEvent[]) => {
  const groups: Record<string, UserEvent[]> = {};
  const addToGroup = (dateKey: string, event: UserEvent) => {
    if (groups[dateKey] === undefined) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
  };
  events.forEach((event) => {
    const dateStartKey = createDateKey(new Date(event.dateStart));
    const dateEndKey = createDateKey(new Date(event.dateEnd));
    addToGroup(dateStartKey, event);
    if (dateEndKey !== dateStartKey) {
      addToGroup(dateEndKey, event);
    }
  });
  return groups;
};

const Calendar: React.FC<Props> = ({ events, loadUserEvents }) => {
  useEffect(() => {
    loadUserEvents();
  }, []);

  let groupedEvents: ReturnType<typeof groupEventsByDate> | undefined;

  let sortedGroupKeys: string[] | undefined;

  if (events.length) {
    groupedEvents = groupEventsByDate(events);
    sortedGroupKeys = Object.keys(groupedEvents).sort(
      (date1, date2) => new Date(date2).getTime() - new Date(date1).getTime()
    );
  }

  return groupedEvents && sortedGroupKeys ? (
    <div className='calendar'>
      {sortedGroupKeys.map((date) => {
        const events = groupedEvents ? groupedEvents[date] : [];
        const groupDate = new Date(date);
        const day = groupDate.getDate();
        const month = groupDate.toLocaleString(undefined, { month: 'long' });
        return (
          <div key={date} className='calendar-day'>
            <div className='calendar-day-label'>
              <span className='calendar-day-label'>
                {day} {month}
              </span>
            </div>
            <div className='calendar-events'>
              {events.map((event) => {
                return <EventItem key={event.id} event={event} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className='lds-wrapper'>
      <div className='lds-dual-ring'></div>
    </div>
  );
};

export default connector(Calendar);
