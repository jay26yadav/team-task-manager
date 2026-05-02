# Team Task Manager 🚀

> A full-stack team task management platform built by **Jay Prakash**

![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20MySQL-5EEAD4?style=flat-square)
![Author](https://img.shields.io/badge/Author-Jay%20Prakash-818CF8?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Railway%20%2B%20Vercel-00b4d8?style=flat-square)

---

## 🌐 Live Demo

👉 https://team-task-manager-phi-nine.vercel.app

---

## 📂 GitHub Repository

👉 https://github.com/jay26yadav/team-task-manager

---

## ✨ Features

* Authentication (JWT-based signup/login)
* Role-based access (Admin / Member)
* Project Management
* Task Creation & Assignment
* Task Status Tracking
* Dashboard with live stats
* Overdue task detection

---

## 🛠 Tech Stack

| Layer      | Technology                            |
| ---------- | ------------------------------------- |
| Frontend   | React (Vite)                          |
| Backend    | Node.js, Express                      |
| Database   | MySQL                                 |
| Auth       | JWT + bcrypt                          |
| Deployment | Railway (Backend) + Vercel (Frontend) |

---

## ⚙️ Setup Instructions

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Add DB credentials
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

**Backend (.env)**

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=taskmanager
JWT_SECRET=your_secret
PORT=5000
```

**Frontend (.env)**

```
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Deployment

* Backend deployed on Railway
* Frontend deployed on Vercel

---

## 👨‍💻 Author

**Jay Prakash**
Full Stack Developer

---

## 📌 Note

This project was built as a full-stack assignment demonstrating authentication, role-based access, and task management.

---
