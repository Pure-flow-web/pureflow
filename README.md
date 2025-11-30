# PureFlow

PureFlow is a minimal, clean, and beautiful productivity web app built with Next.js, Firebase, and Tailwind CSS.

## Features

- **Google Sign-In**: Simple one-click authentication.
- **Tasks**: Create, manage, and prioritize your tasks.
- **Notes**: A simple note-taking space with auto-save.
- **Pomodoro Timer**: A built-in timer to help you focus.
- **Dark/Light Mode**: Switch between themes for your comfort.
- **Fully Responsive**: Works perfectly on desktop and mobile devices.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Authentication & Firestore)
- Zustand
- Sonner (for notifications)
- react-datepicker
- lucide-react (for icons)

## Getting Started

1. **Clone the repository.**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   - Create a new Firebase project.
   - Enable Google Authentication.
   - Set up Firestore database.
   - Create a `.env.local` file in the root of the project and add your Firebase configuration:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
