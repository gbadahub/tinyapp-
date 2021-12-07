const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
    let randomString = "";
    for (let i = 0; i < 6; i++) {
      const randomCharCode = Math.floor(Math.random() * 26 + 97);
      const randomChar = String.fromCharCode(randomCharCode);
      randomString += randomChar;
    }
    return randomString;
}


const bodyParser = require("body-parser");
const { request } = require("express");
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars =
   { shortURL: req.params.shortURL, 
    // urldatabases as pbject uses shortURL as key
    longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] 
  res.redirect(longURL);
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
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



