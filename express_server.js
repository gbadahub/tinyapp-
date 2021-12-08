const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");




// hold database of preset urls includes shorturl and longurls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// generates random string  for ShortURL
function generateRandomString() {
    let randomString = "";
    for (let i = 0; i < 6; i++) {
      const randomCharCode = Math.floor(Math.random() * 26 + 97);
      const randomChar = String.fromCharCode(randomCharCode);
      randomString += randomChar;
    }
    return randomString;
}


const { request } = require("express");
app.use(bodyParser.urlencoded({extended: true}));

// sends message hello once in home page 
app.get("/", (req, res) => {
  res.send("Hello!");
});

// shows preset database as json object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };  
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new",templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars =
   { shortURL: req.params.shortURL, 
    // urldatabases as pbject uses shortURL as key
    longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] 
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };  
  res.redirect(longURL, templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
  }
  res.render("urls_register",templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const newShortURL = generateRandomString()
  urlDatabase[newShortURL] = req.body.longURL
  res.redirect("/urls")
})


app.post("/urls/:shortURL/delete", (req,res)=>{
const shortURL = req.params.shortURL
delete urlDatabase[shortURL]
res.redirect("/urls")
});

app.post("/urls/:id", (req,res)=>{
  const shortURL = req.params.id
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls")
  });

  app.post("/login", (req,res) =>{
    const username = req.body.username;
    res.cookie("username",username);
    res.redirect("/urls");
  });

  app.post("/logout", (req,res) =>{
    const username = req.body.username;
    res.clearCookie("username",username);
    res.redirect("/urls");
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



