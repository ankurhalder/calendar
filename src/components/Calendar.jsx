import { useState } from "react";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState("");
  const [recurrence, setRecurrence] = useState("none");

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const prevYear = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1)
    );
  };

  const nextYear = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1)
    );
  };

  const generateCalendar = () => {
    const calendarDays = [];
    let day = firstDayOfMonth;

    while (day.getDay() !== 0) {
      day = new Date(day.setDate(day.getDate() - 1));
      calendarDays.unshift(null);
    }

    day = firstDayOfMonth;

    while (day <= lastDayOfMonth) {
      calendarDays.push(new Date(day));
      day = new Date(day.setDate(day.getDate() + 1));
    }

    while (calendarDays.length % 7 !== 0) {
      calendarDays.push(null);
    }

    return calendarDays;
  };

  const calendarDays = generateCalendar();

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleAddEvent = () => {
    if (!newEvent) return;
    const dateKey = selectedDate.toDateString();
    const updatedEvents = {
      ...events,
      [dateKey]: [
        ...(events[dateKey] || []),
        { description: newEvent, recurrence },
      ],
    };
    setEvents(updatedEvents);
    setNewEvent("");
  };

  const handleDeleteEvent = (day, index) => {
    const dateKey = day.toDateString();
    const updatedEvents = { ...events };
    updatedEvents[dateKey].splice(index, 1);
    if (updatedEvents[dateKey].length === 0) {
      delete updatedEvents[dateKey];
    }
    setEvents(updatedEvents);
  };

  const getEventsForDate = (date) => {
    const dateKey = date.toDateString();
    let dateEvents = events[dateKey] || [];
    // Check for recurring events
    Object.keys(events).forEach((key) => {
      events[key].forEach((event) => {
        if (event.recurrence !== "none") {
          if (
            event.recurrence === "daily" ||
            (event.recurrence === "weekly" &&
              new Date(key).getDay() === date.getDay()) ||
            (event.recurrence === "monthly" &&
              new Date(key).getDate() === date.getDate()) ||
            (event.recurrence === "yearly" &&
              new Date(key).getMonth() === date.getMonth() &&
              new Date(key).getDate() === date.getDate())
          ) {
            dateEvents.push(event);
          }
        }
      });
    });
    return dateEvents;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevYear}>&lt;&lt;</button>
        <button onClick={prevMonth}>&lt;</button>
        <div className="current-month">
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {currentDate.getFullYear()}
        </div>
        <button onClick={nextMonth}>&gt;</button>
        <button onClick={nextYear}>&gt;&gt;</button>
      </div>
      <div className="calendar-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-of-week">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day ? "" : "empty"} ${
              day?.toDateString() === new Date().toDateString() ? "today" : ""
            }`}
            onClick={() => day && handleDayClick(day)}
          >
            {day ? day.getDate() : ""}
            {day && getEventsForDate(day).length > 0 && (
              <span className="event-indicator">•</span>
            )}
          </div>
        ))}
      </div>
      {selectedDate && (
        <div className="event-form">
          <h3>Events on {selectedDate.toDateString()}</h3>
          <ul>
            {getEventsForDate(selectedDate).map((event, index) => (
              <li key={index}>
                {event.description} ({event.recurrence})
                <button onClick={() => handleDeleteEvent(selectedDate, index)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="Add new event"
          />
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
          >
            <option value="none">No Recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button onClick={handleAddEvent}>Add Event</button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
