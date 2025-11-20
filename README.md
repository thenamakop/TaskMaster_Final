# TaskMaster: Modern Project Management Dashboard 🚀

Welcome to **TaskMaster** — a next-generation productivity board and project management tool inspired by modern platforms like Notion, Trello, and Asana. TaskMaster combines a visually appealing interface with powerful features for solo users and teams, making productivity organized, interactive, and fun.

---

## ⚡ Features

- **Kanban Workflow**: Drag-and-drop columns (Backlog, In Progress, Review, Done) with seamless updates and instant feedback.
- **Pinned Tasks**: Highlight important tasks for quick access.
- **Recent Activity Feed**: Instantly view your latest actions, task additions, and completions.
- **Analytics Dashboard**: Visual KPIs, colorful charts, and stats about productivity and assignees.
- **Scratchpad**: Jot down quick notes or tasks for your session.
- **Project Roadmap**: Customizable initiatives, filters, and detailed cards for high-level planning.
- **Profile & Theme Switcher**: Toggle between modern light and dark mode; see your avatar and user info in the sidebar.
- **Notification Toasts**: Real-time popups for actions and feedback.
- **Responsive Design**: Made for desktop and mobile.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, Custom CSS (with CSS variables and SVG icons)
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Other Libraries**: dotenv, localStorage, basic CORS support

---

## 🚀 Quick Start

### 1. **Clone The Repo**

```bash
git clone https://github.com/thenamakop/TaskMaster_Final.git
cd TaskMaster_Final/v2_withbackend
```

### 2. **Install & Run Backend**

```bash
npm install
node server.js
```

### 3. **Configure Environment**

In `v2_withbackend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=taskmaster
JWT_SECRET=my-secret-key
```

### 4. **Open The Dashboard**

- For development, open `index.html` in your browser (use a local server for best performance).
- Or configure Express to serve static files in production.

---

## 👩‍💻 Usage Guide

| Action              | How                                     |
|---------------------|-----------------------------------------|
| Move tasks          | Drag & drop Kanban cards                |
| Pin/unpin           | Click the star icon on a task           |
| Quick Add           | Type in scratchpad, hit Enter           |
| Toggle theme        | Use the sidebar switcher                |
| View analytics      | Go to Analytics page                    |
| Project Roadmap     | Filter and view details on Roadmap      |

- **Notifications**: Get real-time popups for task actions.
- **Scratchpad**: Use for notes, todos, or quick reminders.

---

## 🧩 Core Concepts

- **AppCore (JavaScript Class)**  
  Initializes the app, user data, theme preferences, sidebar, notifications, and renders Kanban boards.
- **Analytics**  
  Fetches tasks, calculates metrics, and visualizes with customizable charts.
- **Roadmap**  
  Initiative cards, modal dialogs with descriptions, filters by status/quarter/owner.

---

## 🔒 API Endpoints

```sh
POST   /api/auth/login      # Log in
POST   /api/auth/signup     # Sign up
GET    /api/auth/me         # Fetch user profile
POST   /api/auth/logout     # Log out
GET    /api/tasks           # List tasks
POST   /api/tasks           # Create task
PATCH  /api/tasks/:id       # Edit/move/pin/unpin
DELETE /api/tasks/:id       # Delete task
```

JWT token is required for all protected routes. Store in localStorage for user sessions.

---

## 🎨 Customization & Extensibility

- Add or edit board columns/statuses (in `js/app.js`)
- Extend analytics charts with new metrics (in `js/analytics.js`)
- Modify theme styles in `styles.css` (easy with CSS variables)
- Add or rearrange sidebar navigation links

---

## 🦺 Security

- JWT authentication for backend API
- API validates every route for authentication
- CORS enabled for local development

---

## Screenshots

> _Add screenshots/gifs of the Kanban board, analytics dashboard, roadmap, and different theme modes for visual reference._

---

## ✨ Contributing

Pull requests for features, themes, improvements, or fixes are welcome!  
Refer to `CONTRIBUTING.md` for guidelines.

---

## 🪪 License

MIT License. Free to use, modify, and share.

---

## About

Created and maintained by [@thenamakop](https://github.com/thenamakop)
Co-Authors : Nishchay Sethi & Nitish Kalkal

---
