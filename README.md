# Task Manager PWA

A production-quality Progressive Web Application (PWA) for task management, built with React and Firebase. The app is **installable**, **offline-first**, and **responsive**, delivering a native app-like experience on the web.



1. **Authentication**
   - Email & password signup and login using Firebase Auth
   - Form validation, error handling, and user-friendly messages
   - Session handling via Firebase Auth persistence (localStorage)

2. **Navigation**
   - React Router with three main screens:
     - **Login / Signup** – Auth flows with redirects
     - **Task Dashboard** – List + filters (All, Active, Completed)
     - **Task Detail** – View/edit task with title, description, due date
   - Protected routes and auth redirects (unauthenticated → login; authenticated → dashboard)

3. **Data Persistence**
   - **Local storage**: IndexedDB (via `idb`) for offline task storage
   - **Remote sync**: Firebase Firestore for real-time cloud sync
   - **Schema**: task id, title, description, completed flag, timestamps, optional dueDate

4. **Task Management**
   - CRUD: create, read, update, delete tasks
   - Mark tasks complete/incomplete with immediate UI updates
   - Optimistic UI updates where appropriate

5. **State Management**
   - React Context for Auth and Tasks
   - Normalized, modular state

### PWA Features

- **Installable** – Add to Home Screen on desktop and mobile
- **Offline-first** – Works without network; tasks stored in IndexedDB and synced when online
- **Service Worker** – Caches static assets and app shell for offline use
- **Web App Manifest** – Metadata for installation and branding

### Advanced Features

- **Offline Sync** – Tasks created/updated offline are queued and synced to Firestore when the connection returns

## Tech Stack

- **React** 19
- **React Router** 7
- **Firebase** (Auth, Firestore)
- **IndexedDB** (via `idb`) for offline storage
- **Create React App** (react-scripts 5)

## How to Run the App

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a project at [Firebase Console](https://console.firebase.google.com)
   - Enable Email/Password authentication
   - Create a Firestore database
   - Copy `.env.example` to `.env` and fill in your Firebase config:
     ```env
     REACT_APP_FIREBASE_API_KEY=...
     REACT_APP_FIREBASE_AUTH_DOMAIN=...
     REACT_APP_FIREBASE_PROJECT_ID=...
     REACT_APP_FIREBASE_STORAGE_BUCKET=...
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
     REACT_APP_FIREBASE_APP_ID=...
     ```

3. **Firestore Security Rules**
   - In Firebase Console → Firestore → Rules, use the rules from `firestore.rules` in this repo.

4. **Start the app**
   ```bash
   npm start
   ```
   Open [http://localhost:5000](http://localhost:5000).

5. **Build for production**
   ```bash
   npm run build
   ```
   Serve the `build` folder. The service worker is in `public/service-worker.js` and will be served with the app.

6. **Run tests**
   ```bash
   npm test
   ```

## State Management Approach

- **AuthContext**: Holds the current user from Firebase Auth. Provides `login`, `signup`, `logout` and exposes `user` and `loading`.
- **TaskContext**: Holds tasks for the current user. When online, subscribes to Firestore for real-time updates. When offline, reads from IndexedDB. CRUD operations write to Firestore when online, or to IndexedDB + sync queue when offline.

## Offline Sync Strategy

1. **Online**: Tasks are read/written directly to Firestore. Real-time subscription keeps UI in sync.
2. **Offline**: Tasks are stored in IndexedDB. Create/update/delete operations are added to a sync queue.
3. **Back online**: `online` event triggers `syncOfflineQueue`, which replays queued operations to Firestore, then clears the queue. Firestore subscription updates the UI with the new data.

## AI Usage Disclosure

AI tools were used to help with:
- Initial Firebase setup and Auth/Firestore integration
- Task service architecture (offline queue, IndexedDB + Firestore)
- To professionalize the "README.md" file

## Known Issues / Limitations

- **Firestore Index**: If you use `orderBy("createdAt", "desc")`, Firestore may prompt you to create a composite index on first run. Follow the link in the console to create it.
- **Push Notifications**: FCM is not implemented; listed as an advanced feature for future work.
- **Voice Input**: Not implemented (Expo Speech package targets React Native, not web PWA).
