require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const express = require("express");
const db = require("better-sqlite3")("backendApp.db");

db.pragma("journal_mode = WAL");

const app = express();

// Ensure JWT secret exists
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env file");
}

// database setup
const createTables = db.transaction(() => {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username STRING NOT NULL UNIQUE,
      password STRING NOT NULL
    )
  `).run();
});

createTables();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(cookieParser());

// Auth middleware
app.use(function (request, response, next) {
  response.locals.errors = [];

  try {
    const decoded = jwt.verify(
      request.cookies.backEndApp,
      process.env.JWT_SECRET
    );
    request.user = decoded;
  } catch (error) {
    request.user = false;
  }

  response.locals.user = request.user;
  next();
});

// routes
app.get("/", (request, response) => {
  if (request.user) {
    return response.render("dashboard");
  }
  response.render("homepage");
});

app.get("/login", (request, response) => {
  response.render("login");
});

app.get("/logout", (request, response) => {
  response.clearCookie("backEndApp");
  response.redirect("/");
});

app.get("/register", (request, response) => {

  response.redirect("/");
});

app.post("/login", (request, response) => {
  let errors = [];

  if (typeof request.body.username !== "string") request.body.username = "";
  if (typeof request.body.password !== "string") request.body.password = "";

  if (
    request.body.username.trim() == "" ||
    request.body.password == ""
  )
    errors = ["Invalid username / password"];

  if (errors.length) {
    return response.render("login", { errors });
  }

  const selectUserStatement = db.prepare(
    "SELECT * FROM users WHERE username = ?"
  );
  const selectedUser = selectUserStatement.get(request.body.username);

  if (!selectedUser) {
    return response.render("login", {
      errors: ["Invalid username / password"],
    });
  }

  const match = bcrypt.compareSync(
    request.body.password,
    selectedUser.password
  );

  if (!match) {
    return response.render("login", {
      errors: ["Invalid username / password"],
    });
  }

  const token = jwt.sign(
    {
      userid: selectedUser.id,
      username: selectedUser.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  response.cookie("backEndApp", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24,
  });

  return response.redirect("/");
});

app.post("/register", (request, response) => {
  const errors = [];

  if (typeof request.body.username !== "string") request.body.username = "";
  if (typeof request.body.password !== "string") request.body.password = "";
  if (typeof request.body.confirmPassword !== "string") request.body.confirmPassword = "";

  request.body.username = request.body.username.trim();
  request.body.password = request.body.password.trim();
  request.body.confirmPassword = request.body.confirmPassword.trim();

  // validate username
  if (!request.body.username ) {
    errors.push("You must provide a Username.");
  }

  // validate password
  if (!request.body.password) {
    errors.push("You must provide a Password.");
  }

  if (request.body.username){
    if (request.body.username.length < 3)
      errors.push("Username less than 3");
    if (request.body.username.length > 15)
      errors.push("Username greater than 15");
    if (!request.body.username.match(/^[a-zA-Z0-9]+$/))
      errors.push("Username must contain letters and numbers");
  }
   
  

  // check if username exists
  const usernameCheck = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(request.body.username);

  if (usernameCheck) errors.push("Username already exists!!!");

  

  if (request.body.password){
     if (request.body.password.length < 5)
      errors.push("Password less than 5");
    if (request.body.password.length > 25)
      errors.push("Password greater than 25");
  }
    
 

  // check if passwords match
  if (request.body.password !== request.body.confirmPassword) {
  errors.push("Passwords do not match");
  }

  if (errors.length) {
    return response.render("homepage", { errors });
  }

  // hash password
  const hashedPassword = bcrypt.hashSync(
    request.body.password,
    bcrypt.genSaltSync(10)
  );

  const result = db
    .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    .run(request.body.username, hashedPassword);

  const user = db
    .prepare("SELECT * FROM users WHERE ROWID = ?")
    .get(result.lastInsertRowid);

  const token = jwt.sign(
    {
      userid: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  response.cookie("backEndApp", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24,
  });

  return response.redirect("/");
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});