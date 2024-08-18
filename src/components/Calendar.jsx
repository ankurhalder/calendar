/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import Papa from "papaparse";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showMonthPanel, setShowMonthPanel] = useState(false);
  const [showYearPanel, setShowYearPanel] = useState(false);
  const calendarRef = useRef(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [updatedEvent, setUpdatedEvent] = useState("");
  const [updatedRecurrence, setUpdatedRecurrence] = useState("none");
  const [updatedCategory, setUpdatedCategory] = useState("work");
  const [updatedReminder, setUpdatedReminder] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [successMessage, setSuccessMessage] = useState(""); // State for success messages

  const categories = {
    work: "blue",
    personal: "green",
    holiday: "red",
    birthday: "purple",
  };

  useEffect(() => {
    // Load events from local storage on component mount
    try {
      const storedEvents = localStorage.getItem("events");
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      setErrorMessage("Failed to load events from local storage.");
    }
  }, []);

  useEffect(() => {
    // Save events to local storage whenever they change
    try {
      localStorage.setItem("events", JSON.stringify(events));
    } catch (error) {
      setErrorMessage("Failed to save events to local storage.");
    }
  }, [events]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowMonthPanel(false);
        setShowYearPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleMonthSelect = (month) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
    setShowMonthPanel(false);
  };

  const handleYearSelect = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPanel(false);
  };

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

  const goToToday = () => {
    setCurrentDate(new Date());
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
    if (selectedDate && day.toDateString() === selectedDate.toDateString()) {
      setModalIsOpen(false);
      setSelectedDate(null);
    } else {
      setSelectedDate(day);
      const dateKey = day.toDateString();
      if (events[dateKey] && events[dateKey].length > 0) {
        setModalIsOpen(true);
      }
    }
  };

  const handleAddEvent = () => {
    if (!newEvent) {
      setErrorMessage("Event description is required.");
      return;
    }
    if (isNaN(reminder) || parseInt(reminder, 10) < 0) {
      setErrorMessage("Reminder should be a positive number.");
      return;
    }
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
    setErrorMessage(""); // Clear error message on successful add
    setSuccessMessage("Event added successfully."); // Set success message
  };

  const handleDeleteEvent = (day, index) => {
    const dateKey = day.toDateString();
    const updatedEvents = { ...events };
    updatedEvents[dateKey].splice(index, 1);
    if (updatedEvents[dateKey].length === 0) {
      delete updatedEvents[dateKey];
      setModalIsOpen(false);
    }
    setEvents(updatedEvents);
    setErrorMessage(""); // Clear error message on successful delete
    setSuccessMessage("Event deleted successfully."); // Set success message
  };

  const openModal = (event) => {
    setCurrentEvent(event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent) return;
    const dateKey = selectedDate.toDateString();
    const updatedEvents = { ...events };
    const eventIndex = updatedEvents[dateKey].indexOf(editingEvent);
    if (eventIndex !== -1) {
      updatedEvents[dateKey][eventIndex] = {
        description: updatedEvent,
        recurrence: updatedRecurrence,
        category: updatedCategory,
        reminder: updatedReminder,
      };

      setEvents(updatedEvents);
      setEditingEvent(null);
      setUpdatedEvent("");
      setUpdatedRecurrence("none");
      setUpdatedCategory("work");
      setUpdatedReminder("");
      setErrorMessage(""); // Clear error message on successful update
      setSuccessMessage("Event updated successfully."); // Set success message
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setUpdatedEvent(event.description);
    setUpdatedRecurrence(event.recurrence);
    setUpdatedCategory(event.category);
    setUpdatedReminder(event.reminder);
    setModalIsOpen(true);
  };

  const exportEventsToCSV = () => {
    try {
      const csv = Papa.unparse({
        fields: ["Date", "Description", "Recurrence", "Category", "Reminder"],
        data: Object.entries(events).flatMap(([dateKey, events]) =>
          events.map((event) => [
            dateKey,
            event.description,
            event.recurrence,
            event.category,
            event.reminder,
          ])
        ),
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "events.csv";
      link.click();
    } catch (error) {
      setErrorMessage("Failed to export events.");
    }
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
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-header-day">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${
              day && day.toDateString() === selectedDate?.toDateString()
                ? "selected"
                : ""
            }`}
            onClick={() => day && handleDayClick(day)}
          >
            {day ? day.getDate() : ""}
            <div className="events">
              {day &&
                getEventsForDate(day).map((event, i) => (
                  <div
                    key={i}
                    className="event"
                    style={{ backgroundColor: categories[event.category] }}
                    onClick={() => openModal(event)}
                  >
                    {event.description}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMonthPanel = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    return (
      <div className="month-panel">
        {months.map((month) => (
          <div
            key={month}
            className="month-item"
            onClick={() => handleMonthSelect(month)}
          >
            {new Date(0, month).toLocaleString("default", { month: "long" })}
          </div>
        ))}
      </div>
    );
  };

  const renderYearPanel = () => {
    const currentYear = currentDate.getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
    return (
      <div className="year-panel">
        {years.map((year) => (
          <div
            key={year}
            className="year-item"
            onClick={() => handleYearSelect(year)}
          >
            {year}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="calendar-container" ref={calendarRef}>
      <div className="calendar-header">
        <button onClick={prevYear}>&lt;&lt;</button>
        <button onClick={prevMonth}>&lt;</button>
        <div className="current-month-year">
          <div onClick={() => setShowMonthPanel(!showMonthPanel)}>
            {currentDate.toLocaleString("default", { month: "long" })}
          </div>
          <div onClick={() => setShowYearPanel(!showYearPanel)}>
            {currentDate.getFullYear()}
          </div>
        </div>
        <button onClick={nextMonth}>&gt;</button>
        <button onClick={nextYear}>&gt;&gt;</button>
        <button onClick={exportEventsToCSV}>Export CSV</button>
        <button onClick={goToToday}>Go to Today</button>
      </div>
      {showMonthPanel && renderMonthPanel()}
      {showYearPanel && renderYearPanel()}
      <div className="view-switcher">
        <button onClick={() => changeView("day")}>Day View</button>
        <button onClick={() => changeView("week")}>Week View</button>
        <button onClick={() => changeView("month")}>Month View</button>
      </div>
      <div className="search-filter">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Events"
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
      </div>
      {renderCalendarGrid()}
      {selectedDate && (
        <div className="event-form">
          <h3>Events on {selectedDate.toDateString()}</h3>
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
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
        </div>
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Event Details"
        className="modal"
        overlayClassName="overlay"
      >
        {currentEvent && (
          <div>
            <h2>{currentEvent.description}</h2>
            <p>Recurrence: {currentEvent.recurrence}</p>
            <p>Category: {currentEvent.category}</p>
            <p>Reminder: {currentEvent.reminder} hours</p>
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
            <button onClick={() => handleEditClick(currentEvent)}>Edit</button>
            <button onClick={closeModal}>Close</button>
          </div>
        )}
        {editingEvent && (
          <div>
            <h2>Edit Event</h2>
            <input
              type="text"
              value={updatedEvent}
              onChange={(e) => setUpdatedEvent(e.target.value)}
              placeholder="Event Description"
            />
            <select
              value={updatedRecurrence}
              onChange={(e) => setUpdatedRecurrence(e.target.value)}
            >
              <option value="none">No Recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <select
              value={updatedCategory}
              onChange={(e) => setUpdatedCategory(e.target.value)}
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="holiday">Holiday</option>
              <option value="birthday">Birthday</option>
            </select>
            <input
              type="number"
              value={updatedReminder}
              onChange={(e) => setUpdatedReminder(e.target.value)}
              placeholder="Reminder (hours)"
            />
            <button onClick={handleUpdateEvent}>Update Event</button>
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;
