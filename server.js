const express = require("express");
const app = express();


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

    response.send("Form Successfully Sent Thank You!!!")
});

app.listen(4000);

