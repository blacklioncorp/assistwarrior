### Overview
This is a Next.js application that provides user authentication using Supabase. It includes pages for login, login confirmation, and a main landing page.

### Style & Design
*   **Framework:** Next.js with App Router
*   **Styling:** Tailwind CSS for styling.
*   **Components:** Uses `lucide-react` for icons.
*   **Layout:** Centered layout for login pages.
*   **Typography:** Simple and clean typography.
*   **Color Palette:** Primarily uses shades of gray.

### Features
*   **User Authentication:**
    *   Login form to submit an email address.
    *   Server Action to handle the form submission.
    *   Supabase for authentication.
    *   Redirect to a confirmation page after submitting the email.
*   **Routing:**
    *   `/`: Main landing page.
    *   `/login`: Login page.
    *   `/login/confirm`: Confirmation page after login link is sent.

### Plan for the current request:
The user wants me to fix the linting errors in the project.

### Steps:
1.  **Analyze the project:** I started by listing the files to understand the project structure.
2.  **Identify the linting issue:** I tried to run `npm run lint` but it failed.
3.  **Troubleshoot the linter:**
    *   Added `eslint` and `eslint-config-next` to `package.json`.
    *   Created a `.eslintrc.json` file.
    *   Corrected the `next` and `react` versions in `package.json` to resolve dependency conflicts.
4.  **Fix the linting error:**
    *   Ran the linter and found a `react/no-unescaped-entities` error in `app/login/confirm/page.tsx`.
    *   Corrected the unescaped apostrophe in the file.
5.  **Verify the fix:** Ran the linter again and confirmed that there are no more errors.
