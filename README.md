# Kaizen Management - Frontend

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Description

This is the frontend application for the Kaizen Management system, a gym management solution built with React, Tailwind CSS, and Vite. It provides a user-friendly interface for managing members, membership plans, reports, user roles, and payment records.

## Features

*   **Dashboard:** Overview of key metrics and statistics.
*   **Member Management:** Add, edit, delete, and view member profiles.
*   **Membership Plans:** Create, update, and manage membership plans.
*   **Reports:** Generate financial and membership reports.
*   **User Management:** Manage user accounts, roles, and permissions.
*   **Payment Records:** Track and manage payment history.
*   **Authentication:** Secure login and signup functionality.
*   **Animations:** Animated alerts for successful payments and errors.

## Technologies

*   **React:** JavaScript library for building user interfaces.
*   **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
*   **Vite:** Build tool that provides a fast and optimized development experience.
*   **Axios:** Promise-based HTTP client for making API requests.
*   **React Router:** Declarative routing for React.
*   **Framer Motion:** Animation library for React.
*   **Headless UI:** Unstyled, fully accessible UI components.
*   **Moment.js**: For date and time formatting/manipulation

## Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

## Installation

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    ```

2.  Navigate to the frontend directory:

    ```bash
    cd gym-management/frontend
    ```

3.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

4.  Set up environment variables:

    *   Create a `.env` file in the root of the `frontend` directory.
    *   Add the following variables:

        ```
        VITE_API_URL=http://localhost:5050 # URL of the backend API
        ```

## Usage

1.  Start the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

2.  Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Building for Production

```bash
npm run build
# or
yarn build
```

This will create an optimized production build in the `dist` directory.

## Contributing

We welcome contributions! Please see the [Contributing Guidelines](CONTRIBUTING.md) for more information.

## Code of Conduct

Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
```

**3. CONTRIBUTING.md**

```markdown
# Contributing Guidelines

We welcome contributions to the Kaizen Management - Frontend project!  Please read these guidelines carefully before contributing.

## How to Contribute

1.  **Fork the repository:**  Create your own fork of the repository.

2.  **Create a branch:** Create a feature branch for your changes.

    ```bash
    git checkout -b feature/your-feature-name
    ```

3.  **Make your changes:** Implement your feature, fix a bug, or improve documentation.

4.  **Test your changes:**  Ensure that your changes work correctly and don't introduce new issues.  If applicable, write unit tests.

5.  **Lint and format your code:**  Use ESLint and Prettier to maintain code style.

    ```bash
    npm run lint
    npm run format
    ```

6.  **Commit your changes:**  Write clear and descriptive commit messages.

    ```bash
    git commit -m "feat: Add new feature"
    ```

7.  **Push to your fork:**

    ```bash
    git push origin feature/your-feature-name
    ```

8.  **Create a pull request:** Submit a pull request to the `main` branch of the original repository.

## Pull Request Guidelines

*   Follow the coding style of the project.
*   Write clear and concise commit messages.
*   Provide a detailed description of your changes in the pull request.
*   Include relevant screenshots or GIFs if the changes affect the UI.
*   Be responsive to feedback and address any comments or concerns.

## Reporting Bugs

*   Use the issues tab in github to report bugs.
*   Provide clear and detailed steps to reproduce the bug.
*   Include relevant information such as browser version, operating system, and error messages.

## Suggesting Enhancements

*   Use the issues tab in github to suggest enhancements.
*   Describe the problem you are trying to solve.
*   Explain your proposed solution in detail.

## Code Style

We use ESLint and Prettier to enforce a consistent code style.  Run `npm run lint` and `npm run format` before committing your changes.

## License

By contributing to this project, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).

## Code of Conduct

Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).