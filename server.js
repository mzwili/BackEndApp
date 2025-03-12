const express = require("express");
const app = express();

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
    
    if(typeof request.body.username !== "String") request.body.username = "";
    if(typeof request.body.password !== "String") request.body.password = "";

    request.body.username = request.body.username.trim();

    if(!request.body.username) errors.push("You must provide a Username.");
    if(request.body.username && request.body.username.length < 3) errors.push("Username less then 3");
    if(request.body.username && request.body.username.length > 15) errors.push("Username greater then 15");
    if(request.body.username && !request.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username must contain letters and numbers");

    if(!request.body.password) errors.push("You must provide a Password.");
    if(request.body.password && request.body.password.length < 9) errors.push("Password less then 3");
    if(request.body.password && request.body.password.length > 25) errors.push("Password greater then 15");

    if(errors.length){
        return response.render("homepage", { errors });
    } else {
        response.send("Form Successfully Sent, Thank You!!!")
    }
    
});

app.listen(4000);

