# Calendar Application

## Overview

This calendar application allows users to manage and view their events. It features functionalities such as event creation, editing, deletion, and reminders. Users can also switch between day, week, and month views, search and filter events, and export events to CSV. The application maintains events using local storage to ensure data persistence across page refreshes.

## Features

- **View Modes**: Switch between Day, Week, and Month views.
- **Event Management**: Create, edit, delete, and update events.
- **Search and Filter**: Search events by description and filter by category.
- **Export to CSV**: Export events to a CSV file.
- **Navigation**: Navigate between months and years, and jump to the current date.
- **Local Storage**: Persist events across page refreshes.
- **Responsive Panels**: Panels for selecting months and years are scrollable.

## Getting Started

To get started with this project, follow the steps below:

### Prerequisites

- [Node.js](https://nodejs.org/) and npm (Node Package Manager) should be installed.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ankurhalder/calendar.git
   ```

2. Navigate to the project directory:

   ```bash
   cd calendar-application
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

### Usage

1. Start the development server:

   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000` to view the application.

### Code Description

- **`Calendar.js`**: The main component of the application. It handles the rendering of the calendar, event management, and view switching.
- **`Calendar.css`**: Contains styling for the calendar and related components.

### Local Storage Integration

The application uses the browser's local storage to persist events. Events are saved to local storage on any update or addition and loaded from local storage on initialization.

### Error Handling

The application includes error handling for required fields and operational errors. Users receive feedback if they attempt to add or update events with missing or invalid data.

### Code Summary

- **Events Data Structure**: Events are stored in an object where the keys are date strings and the values are arrays of event objects.
- **Event Object**: An event object includes `description`, `recurrence`, `category`, and `reminder`.
- **State Management**: Uses React's `useState` and `useEffect` hooks for managing state and side effects.

## Contributing

Contributions are welcome! Please submit a pull request with your proposed changes.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

- **Name**: Ankur Halder
- **Email**: [ankur.halder12345@gmail.com](mailto:ankur.halder12345@gmail.com)
- **Website**: [ankurhalder.in](https://www.ankurhalder.in)
- **GitHub**: [ankurhalder](https://github.com/ankurhalder)
- **Location**: Kolkata, West Bengal, India
