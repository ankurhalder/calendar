import { useState, useEffect } from "react";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [category, setCategory] = useState("work");
  const [reminderTime, setReminderTime] = useState("");
  const [view, setView] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [startOfWeek, setStartOfWeek] = useState("Sunday");
  const [timeFormat, setTimeFormat] = useState("24-hour");

  const daysOfWeek =
    startOfWeek === "Monday"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const categories = {
    work: "blue",
    personal: "green",
    holiday: "red",
    birthday: "purple",
  };

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

  useEffect(() => {
    const now = new Date();
    Object.keys(events).forEach((dateKey) => {
      events[dateKey].forEach((event) => {
        if (event.reminder && new Date(event.reminder) <= now) {
          alert(`Reminder: ${event.description} is due now!`);
        }
      });
    });
  }, [events]);

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

  const changeView = (viewType) => {
    setView(viewType);
  };

  const generateCalendar = () => {
    const calendarDays = [];
    let day = firstDayOfMonth;

    while (day.getDay() !== daysOfWeek.indexOf(startOfWeek)) {
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

  const generateWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(new Date(startOfWeek));
      startOfWeek.setDate(startOfWeek.getDate() + 1);
    }
    return weekDays;
  };

  const generateDayView = () => {
    return [new Date(currentDate)];
  };

  const getEventsForDate = (date) => {
    const dateKey = date.toDateString();
    let dateEvents = events[dateKey] || [];
    if (searchTerm) {
      dateEvents = dateEvents.filter((event) =>
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCategory !== "all") {
      dateEvents = dateEvents.filter(
        (event) => event.category === filterCategory
      );
    }
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
        { description: newEvent, recurrence, category, reminder: reminderTime },
      ],
    };
    setEvents(updatedEvents);
    setNewEvent("");
    setReminderTime("");
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleShareEvent = (event) => {
    const eventDetails = `Event: ${
      event.description
    }\nDate: ${selectedDate.toDateString()}\nReminder: ${
      event.reminder ? new Date(event.reminder).toLocaleTimeString() : "None"
    }`;
    alert(eventDetails);
  };

  const renderCalendarGrid = () => {
    const days =
      view === "month"
        ? generateCalendar()
        : view === "week"
        ? generateWeekView()
        : generateDayView();

    return (
      <div className="calendar-grid">
        {view === "month" &&
          daysOfWeek.map((day) => (
            <div key={day} className="day-of-week">
              {day}
            </div>
          ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day ? "" : "empty"} ${
              day?.toDateString() === new Date().toDateString() ? "today" : ""
            }`}
            onClick={() => day && handleDayClick(day)}
          >
            {day ? day.getDate() : ""}
            {day &&
              getEventsForDate(day).map((event, idx) => (
                <div
                  key={idx}
                  className="event-indicator"
                  style={{ backgroundColor: categories[event.category] }}
                  title={event.description}
                ></div>
              ))}
          </div>
        ))}
      </div>
    );
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
      <div className="view-switcher">
        <button onClick={() => changeView("month")}>Month</button>
        <button onClick={() => changeView("week")}>Week</button>
        <button onClick={() => changeView("day")}>Day</button>
      </div>
      <div className="search-filter">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search events"
        />
        <select value={filterCategory} onChange={handleFilterChange}>
          <option value="all">All Categories</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="holiday">Holiday</option>
          <option value="birthday">Birthday</option>
        </select>
      </div>
      {renderCalendarGrid()}
      {selectedDate && (
        <div className="event-form">
          <h3>Events on {selectedDate.toDateString()}</h3>
          <ul>
            {getEventsForDate(selectedDate).map((event, index) => (
              <li key={index} style={{ color: categories[event.category] }}>
                {event.description} ({event.recurrence})
                {event.reminder && (
                  <span className="reminder-time">
                    Reminder: {new Date(event.reminder).toLocaleTimeString()}
                  </span>
                )}
                <button onClick={() => handleDeleteEvent(selectedDate, index)}>
                  Delete
                </button>
                <button onClick={() => handleShareEvent(event)}>Share</button>
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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="holiday">Holiday</option>
            <option value="birthday">Birthday</option>
          </select>
          <input
            type="datetime-local"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            placeholder="Set reminder"
          />
          <button onClick={handleAddEvent}>Add Event</button>
        </div>
      )}
      <div className="settings">
        <label>
          Start of Week:
          <select
            value={startOfWeek}
            onChange={(e) => setStartOfWeek(e.target.value)}
          >
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
          </select>
        </label>
        <label>
          Time Format:
          <select
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value)}
          >
            <option value="24-hour">24-hour</option>
            <option value="12-hour">12-hour</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default Calendar;
