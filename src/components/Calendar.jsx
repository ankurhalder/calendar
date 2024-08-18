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
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState({});
  const [showMonthPanel, setShowMonthPanel] = useState(false);
  const [showYearPanel, setShowYearPanel] = useState(false);
  const calendarRef = useRef(null);

  const categories = {
    work: "blue",
    personal: "green",
    holiday: "red",
    birthday: "purple",
  };

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

  const closeModal = () => {
    setModalIsOpen(false);
    setIsEditing(false);
    setEditedEvent({});
    setCurrentEvent(null);
    setSelectedDate(null);
  };

  const toggleModal = (day) => {
    if (
      selectedDate &&
      day &&
      selectedDate.toDateString() === day.toDateString()
    ) {
      // If the same date is clicked again, close the modal
      closeModal();
    } else {
      setSelectedDate(day);
      setCurrentEvent(null);
      setIsEditing(false);
      setEditedEvent({});
      setModalIsOpen(true);
    }
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
    return (events[date.toDateString()] || [])
      .filter((event) => {
        if (filterCategory === "all") {
          return true;
        }
        return event.category === filterCategory;
      })
      .filter((event) =>
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const handleDayClick = (day) => {
    toggleModal(day);
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent) return;

    const dateKey = selectedDate.toDateString();
    const newEvents = { ...events };

    if (!newEvents[dateKey]) {
      newEvents[dateKey] = [];
    }

    newEvents[dateKey].push({
      description: newEvent,
      recurrence,
      category,
      reminder: reminder || undefined,
    });

    setEvents(newEvents);
    setNewEvent("");
    setRecurrence("none");
    setCategory("work");
    setReminder("");
  };

  const handleDeleteEvent = (date, index) => {
    const dateKey = date.toDateString();
    const updatedEvents = { ...events };

    if (updatedEvents[dateKey]) {
      updatedEvents[dateKey].splice(index, 1);

      if (updatedEvents[dateKey].length === 0) {
        delete updatedEvents[dateKey];
        if (dateKey === selectedDate.toDateString()) {
          closeModal();
        }
      }

      setEvents(updatedEvents);
    }
  };

  const handleEditEvent = () => {
    setIsEditing(true);
    setEditedEvent({ ...currentEvent });
  };

  const handleUpdateEvent = () => {
    const dateKey = selectedDate.toDateString();
    const updatedEvents = { ...events };

    const eventIndex = updatedEvents[dateKey].findIndex(
      (event) => event === currentEvent
    );

    if (eventIndex > -1) {
      updatedEvents[dateKey][eventIndex] = editedEvent;

      if (!editedEvent.category) {
        delete editedEvent.category;
      }
      if (!editedEvent.reminder) {
        delete editedEvent.reminder;
      }

      setEvents(updatedEvents);
      setIsEditing(false);
      setEditedEvent({});
    }
  };

  const exportEventsToCSV = () => {
    const eventsArray = Object.keys(events).flatMap((date) =>
      events[date].map((event) => ({
        Date: date,
        Description: event.description,
        Recurrence: event.recurrence,
        Category: event.category,
        Reminder: event.reminder,
      }))
    );

    const csv = Papa.unparse(eventsArray);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "events.csv");
    link.click();
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentEvent(event);
                    setModalIsOpen(true);
                  }}
                ></div>
              ))}
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
        <button onClick={() => setCurrentDate(new Date())}>Today</button>
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
        </div>
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Event Details"
        className="modal"
        overlayClassName="overlay"
      >
        {isEditing ? (
          <div className="event-edit-form">
            <h2>Edit Event</h2>
            <input
              type="text"
              value={editedEvent.description || ""}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, description: e.target.value })
              }
              placeholder="Event Description"
            />
            <select
              value={editedEvent.recurrence || "none"}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, recurrence: e.target.value })
              }
            >
              <option value="none">No Recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <select
              value={editedEvent.category || "work"}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, category: e.target.value })
              }
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="holiday">Holiday</option>
              <option value="birthday">Birthday</option>
            </select>
            <input
              type="number"
              value={editedEvent.reminder || ""}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, reminder: e.target.value })
              }
              placeholder="Reminder (hours)"
            />
            <button onClick={handleUpdateEvent}>Update Event</button>
          </div>
        ) : (
          <>
            <h2>{currentEvent?.description}</h2>
            <p>Recurrence: {currentEvent?.recurrence}</p>
            <p>Category: {currentEvent?.category}</p>
            <p>Reminder: {currentEvent?.reminder} hours</p>
            <button onClick={handleEditEvent}>Edit</button>
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
          </>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;
