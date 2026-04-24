# 🚀 Backend App (Node.js + Express + SQLite + Playwright)

This is a full-stack backend application built with **Node.js** and **Express.js**, featuring **JWT authentication**, **SQLite database**, and **end-to-end testing using Playwright (POM design pattern)**.

It demonstrates real-world backend development and QA automation practices.

---

## ✨ Features

- 🔐 **JWT Authentication** (Login, Register, Logout)
- 🔑 **Password Hashing** with bcrypt
- 🗄 **SQLite Database** (lightweight, file-based)
- 🎨 **EJS Templating Engine**
- 🍪 **Secure Cookies (HTTP-only)**
- 🧪 **Playwright E2E Testing (POM)**
- 🔄 **Auto-restart with Nodemon**
- ⚙️ **GitHub Actions CI Ready**

---

## 📌 Prerequisites

Make sure you have installed:

- **Node.js** (v18+ recommended)
- **npm**
- **Git**

---

## 🚀 Installation

### 1️⃣ Clone the repository

```sh
git clone https://github.com/mzwili/BackEndApp.git
cd BackEndApp

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Set Up the SQLite Database

```sh
npm run setup-db
```

---

## 📂 Project Structure

```
BackEndApp/
│── /public              # Static assets
│── /views               # EJS templates
│── /tests
│    ├── /pages          # Page Object Models (POM)
│    └── /specs          # Test cases
│── server.js            # Main app entry point
│── package.json         # Scripts & dependencies
│── .env                 # Environment variables (ignored)
│── .gitignore           # Ignored files
```

---

## ⚙️ Technologies Used

| Technology  | Description |
|-------------|------------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web framework for Node.js |
| **EJS** | Template engine for server-side rendering |
| **SQLite** | Lightweight relational database |
| **Simple.css** | Minimalist CSS framework |
| **Nodemon** | Automatic server restarts during development |

---

## ⚙️ Available Scripts

| Script             | Description                  |
| ------------------ | ---------------------------- |
| `npm start`        | Start server                 |
| `npm run dev`      | Start server with nodemon    |
| `npm test`         | Run Playwright tests         |
| `npm run test:e2e` | Start server + run E2E tests |
| `npm run test:ui`  | Run Playwright UI mode       |

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions are welcome!  
To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a **Pull Request**

---

## 📞 Support

For issues, suggestions, or questions, feel free to:

- Open an issue on [GitHub Issues](https://github.com/YOUR-USERNAME/YOUR-REPOSITORY/issues)
- Contact me via **email** at `your-email@example.com`

---

## 🌟 Acknowledgments

Thanks to:

- **Node.js & Express.js** – Making backend development easy
- **EJS & SQLite** – Simple and effective templating + storage
- **Simple.css** – Clean and minimalistic styling

---

### 📌 Notes:

- Replace `YOUR-USERNAME` and `YOUR-REPOSITORY` with your actual GitHub details.
- Replace `your-email@example.com` with your actual email.

🚀 **Happy Coding!** 🎉
