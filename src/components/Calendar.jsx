import { useState, useEffect } from "react";
import Modal from "react-modal";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [category, setCategory] = useState("work");
  const [reminder, setReminder] = useState("");
  const [view, setView] = useState("month");
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
        if (event.reminder) {
          const eventDate = new Date(dateKey);
          eventDate.setHours(
            eventDate.getHours() - parseInt(event.reminder, 10)
          );
          if (now >= eventDate && now < new Date(eventDate.getTime() + 60000)) {
            alert(`Reminder: ${event.description} is coming up!`);
          }
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
    dateEvents = dateEvents.filter(
      (event) =>
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterCategory === "all" || event.category === filterCategory)
    );
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
        { description: newEvent, recurrence, category, reminder },
      ],
    };
    setEvents(updatedEvents);
    setNewEvent("");
    setReminder("");
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const openModal = (event) => {
    setCurrentEvent(event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const renderCalendarGrid = () => {
    const days =
      view === "month"
        ? generateCalendar()
        : view === "week"
        ? generateWeekView()
        : generateDayView();

    return (
      <div className={`calendar-grid ${darkMode ? "dark" : ""}`}>
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
                  onClick={() => openModal(event)}
                ></div>
              ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`calendar-container ${darkMode ? "dark" : ""}`}>
      <div className="calendar-header">
        <button onClick={prevYear}>&lt;&lt;</button>
        <button onClick={prevMonth}>&lt;</button>
        <div className="current-month">
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {currentDate.getFullYear()}
        </div>
        <button onClick={nextMonth}>&gt;</button>
        <button onClick={nextYear}>&gt;&gt;</button>
        <button onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
      <div className="view-switcher">
        <button onClick={() => changeView("month")}>Month</button>
        <button onClick={() => changeView("week")}>Week</button>
        <button onClick={() => changeView("day")}>Day</button>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search events"
      />
      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
      >
        <option value="all">All Categories</option>
        <option value="work">Work</option>
        <option value="personal">Personal</option>
        <option value="holiday">Holiday</option>
        <option value="birthday">Birthday</option>
      </select>
      {renderCalendarGrid()}
      {selectedDate && (
        <div className="event-form">
          <h3>Events on {selectedDate.toDateString()}</h3>
          <ul>
            {getEventsForDate(selectedDate).map((event, index) => (
              <li key={index} style={{ color: categories[event.category] }}>
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
            type="number"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            placeholder="Reminder (hours)"
          />
          <button onClick={handleAddEvent}>Add Event</button>
        </div>
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Event Details"
        className={`modal ${darkMode ? "dark" : ""}`}
        overlayClassName="overlay"
      >
        <h2>{currentEvent?.description}</h2>
        <p>Recurrence: {currentEvent?.recurrence}</p>
        <p>Category: {currentEvent?.category}</p>
        <p>Reminder: {currentEvent?.reminder} hours</p>
        <button
          onClick={() =>
            handleDeleteEvent(
              selectedDate,
              events[selectedDate.toDateString()].indexOf(currentEvent)
            )
          }
        >
          Delete
        </button>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default Calendar;
