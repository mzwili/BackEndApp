require("dotenv").config()
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
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



app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(cookieParser());


app.use(function(request, response, next){
    response.locals.errors = [];
    

    try{
        const decodeTkn = jwt.verify(request.cookies.backEndApp, process.env.JWTSECRET);
        request.user = decodeTkn;
    }catch (error){
        request.user = false;
    }

    response.locals.user = request.user;
    next();
})




app.get("/", (request, response) => {
    if (request.user){
        return response.render("dashboard");
    }
    response.render("homepage");
});

app.get("/login", (request, response) => {
    response.render("login");
});

app.get("/logout",(request, response) => {
    response.clearCookie("backEndApp");
    response.redirect("/");
});

app.post("/login", (request, response) => {

    let errors = [];

    if(typeof request.body.username !== "string") request.body.username = "";
    if(typeof request.body.password !== "string") request.body.password = "";

    if(request.body.username.trim() == "" || request.body.password == "") errors = ["Invalid username / password"];

    if(errors.length){
        return response.render("login", {errors});
    }

    const selectUserStatement = db.prepare("SELECT * FROM users WHERE USERNAME = ?");
    const selectedUser = selectUserStatement.get(request.body.username);

    if(!selectedUser){
        errors = ["Invalid username / password"];
        return response.render("login", { errors })
    }

    const comparePassword = bcrypt.compareSync(request.body.password, selectedUser.password);

    if(!comparePassword){
        errors = ["Invalid username / password"];
        return response.render("login", { errors });
    }

    let tokenExpiryDate = Math.floor(Date.now() / 1000) + 60 * 60 * 124;
    const tokenValue = jwt.sign({exp: tokenExpiryDate, userid: selectedUser.id, username: selectedUser.username }, process.env.JWTSECRET)

    //user cookie
    response.cookie("backEndApp", tokenValue, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    })

    return response.render("dashboard",{ errors });

});

app.post("/register", (request, response) => {
    const errors = [];
    
    if(typeof request.body.username !== "string") request.body.username = "";
    if(typeof request.body.password !== "string") request.body.password = "";

    request.body.username = request.body.username.trim();

    //validate username
    if(!request.body.username) errors.push("You must provide a Username.");
    if(request.body.username && request.body.username.length < 3) errors.push("Username less then 3");
    if(request.body.username && request.body.username.length > 15) errors.push("Username greater then 15");
    if(request.body.username && !request.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username must contain letters and numbers");

    //check if username exists

    const usernameStatement = db.prepare("SELECT * FROM users WHERE USERNAME = ?");
    const usernameCheck = usernameStatement.get(request.body.username);

    if(usernameCheck) errors.push("Username already exists!!!")

    if(!request.body.password) errors.push("You must provide a Password.");
    if(request.body.password && request.body.password.length < 5) errors.push("Password less then 5");
    if(request.body.password && request.body.password.length > 25) errors.push("Password greater then 15");

    if(errors.length){
        return response.render("homepage", { errors });
    }

    //save new user into db
    const salt = bcrypt.genSaltSync(10);
    request.body.password = bcrypt.hashSync(request.body.password, salt);

    const databaseStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    const dbResult = databaseStatement.run(request.body.username, request.body.password);

    const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID  = ?");
    const ourUser = lookupStatement.get(dbResult.lastInsertRowid)
    const tokenExpiryDate = Math.floor(Date.now() / 1000) + 60 * 60 * 124;
    const tokenValue = jwt.sign({exp: tokenExpiryDate, userid: ourUser.id, username: ourUser.username }, process.env.JWTSECRET)

    //user cookie
    response.cookie("backEndApp", tokenValue, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    })

    return response.render("dashboard",{ errors })
    
});

app.listen(4000);

