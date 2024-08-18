import { useState } from "react";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({}); // Stores events by date
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState("");

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

    // Add the empty days at the start of the month
    while (day.getDay() !== 0) {
      day = new Date(day.setDate(day.getDate() - 1));
      calendarDays.unshift(null);
    }

    // Reset day to the first day of the month
    day = firstDayOfMonth;

    // Add all days of the month
    while (day <= lastDayOfMonth) {
      calendarDays.push(new Date(day));
      day = new Date(day.setDate(day.getDate() + 1));
    }

    // Add the empty days at the end of the month
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
      [dateKey]: [...(events[dateKey] || []), newEvent],
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
            {day && events[day.toDateString()] && (
              <span className="event-indicator">•</span>
            )}
          </div>
        ))}
      </div>
      {selectedDate && (
        <div className="event-form">
          <h3>Events on {selectedDate.toDateString()}</h3>
          <ul>
            {(events[selectedDate.toDateString()] || []).map((event, index) => (
              <li key={index}>
                {event}
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
          <button onClick={handleAddEvent}>Add Event</button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
