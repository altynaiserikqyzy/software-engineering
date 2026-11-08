Smart Campus Room Availability Checker

1. Project Overview

Smart Campus Room Availability Checker is a web application designed to help students and university staff find available rooms based on capacity, equipment requirements, and booking schedules.

Users can select the minimum number of attendees, choose required equipment, and check whether a room is available for a requested time interval.

The project was developed as part of the Software Engineering course.

2. Main Features

Room Catalog

The application includes at least four fictional rooms with different configurations.

Each room contains:

* Unique ID.
* Room name.
* Capacity.
* Available equipment.
* Blocked status.
* Existing bookings.

Room Filtering

The application supports filtering rooms according to the following requirements:

* F1 – Capacity Filter: Displays rooms whose capacity is greater than or equal to the requested number of attendees.
* F2 – Equipment Filter: Displays rooms containing all selected equipment.
* F3 – Availability Check: Checks whether a room is available during the requested time interval.
* F4 – Booking Conflict Detection: Prevents rooms from being considered available when existing bookings overlap with the requested interval.
* F5 – Room Status: Excludes rooms that are currently blocked.

Availability Rules

The application preserves the original availability rules (AC1–AC5).

Room availability is evaluated using existing bookings, time intervals, room status, and campus scheduling rules.

3. Technologies Used

* React
* TypeScript
* Vite
* Vitest
* JavaScript
* CSS

4. Project Structure

The project separates application logic, UI components, and automated tests.

software-engineering/
│
├── src/
│   ├── components/
│   │   └── Reusable UI components
│   │
│   ├── lib/
│   │   └── availability.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── tests/
│   ├── availability.test.ts
│   ├── roomFilters.test.ts
│   └── App.integration.test.tsx
│
├── vitest.config.ts
├── test-setup.ts
├── package.json
└── README.md



5. Installation

Prerequisites

* Node.js
* npm
* Git

Clone the Repository

git clone https://github.com/altynaiserikqyzy/software-engineering

Navigate to the project directory:

cd software-engineering

Install dependencies:

npm install

If the test environment requires jsdom and it is not installed, install it as a development dependency:

npm install -D jsdom

6. Running the Application

Start the development server:

npm run dev

Vite will display the local development URL in the terminal.

Open the displayed URL in your browser to access the application.

7. Running Automated Tests

The project uses Vitest for automated testing.

Run all tests:

npx vitest run

Run tests in watch mode:

npx vitest

The automated tests cover:

* Original AC1–AC5 regression requirements.
* New F1–F5 functional requirements.
* Capacity filtering.
* Equipment filtering.
* Availability and booking conflicts.
* Time interval boundaries.
* Exact capacity and insufficient capacity.
* Integration or UI behavior.

Important Boundary Cases

The test suite includes checks for:

Scenario	Expected Behavior
Duration exactly 120 minutes	Evaluated according to the campus duration rule
Duration 121 minutes	Rejected if the maximum duration is 120 minutes
Touching booking intervals	No overlap
Overlapping booking intervals	Room is unavailable
Exact room capacity	Room is included
Insufficient room capacity	Room is excluded
Blocked room	Room is excluded

8. Refactoring

The refactoring process focused on improving code organization, readability, and maintainability while preserving existing application behavior.

The main improvements include:

* Extracting shared TypeScript types.
* Separating filtering logic from UI components.
* Extracting reusable presentational components.
* Organizing availability-related functionality.
* Improving testability through separation of responsibilities.

The refactored architecture makes the application easier to maintain, extend, and test.

9. Testing and Evaluation

Automated tests are used to verify both existing functionality and newly implemented features.

The testing strategy includes:

1. Regression testing to verify original availability rules.
2. Functional testing for capacity and equipment filters.
3. Boundary testing for time intervals.
4. Booking conflict testing.
5. Integration testing for UI behavior.

Actual test execution results and evaluation evidence are documented separately in the submission materials.

10. AI Assistance

AI-assisted development tools were used during the assignment.

AI assistance included:

* Analyzing the existing project structure.
* Suggesting refactoring improvements.
* Separating application logic and UI components.
* Assisting with automated test development.
* Identifying potential edge cases.

All generated suggestions and code changes were subject to human review.

The developer reviewed implementation changes, evaluated test results, and checked the application against the assignment requirements.

Detailed AI usage records, selected prompts, outputs, decisions, and verification evidence are provided in the AI Evidence Appendix.

11. Assignment Information

Course: Software Engineering

Assignment: #04 – Automated Testing and Refactoring

Project: Smart Campus Room Availability Checker

Author: Altynai Rgalbekova

Academic Year: 2026
