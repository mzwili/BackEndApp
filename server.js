const bcrypt = require("bcrypt");
const express = require("express");
const db = require("better-sqlite3")("backendApp.db");
db.pragma("journal_mode = WAL");

// writeDb.pragma("synchronous = NORMAL");
const app = express();

// database setup
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL
        )
        `
    ).run()
})

createTables();

app.use(function(request, response, next){
    response.locals.errors = [];
    next();
})


app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
app.use(express.static("public"));

app.get("/", (request, response) => {
    response.render("homepage");
});

app.get("/login", (request, response) => {
    response.render("login");
});

app.post("/register", (request, response) => {
    const errors = [];
    
    if(typeof request.body.username !== "string") request.body.username = "";
    if(typeof request.body.password !== "string") request.body.password = "";

    request.body.username = request.body.username.trim();

    if(!request.body.username) errors.push("You must provide a Username.");
    if(request.body.username && request.body.username.length < 3) errors.push("Username less then 3");
    if(request.body.username && request.body.username.length > 15) errors.push("Username greater then 15");
    if(request.body.username && !request.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username must contain letters and numbers");

    if(!request.body.password) errors.push("You must provide a Password.");
    if(request.body.password && request.body.password.length < 5) errors.push("Password less then 5");
    if(request.body.password && request.body.password.length > 25) errors.push("Password greater then 15");

    if(errors.length){
        return response.render("homepage", { errors });
    } else {
        response.send("Form Successfully Sent, Thank You!!!")
    }

    //save new user into db
    const databaseStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    databaseStatement.run(request.body.username, request.body.password)
    response.send("Thank you!")
    
});

app.listen(4000);

