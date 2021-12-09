const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser')


// hold database of preset urls includes shorturl and longurls

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  ksm5xK: {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  },
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

const findUserByEmail = function (users, email) {
  for (let name in users) {
    if (users[name].email === email) {
      return true
    }
  }
  return false;
}

const findUserByPassword = function (user, password) {
  if (user.password === password) {
    return true;
  } else {
    return false;
  }
}

const fetchUsersURL = function (urlDatabase, userID){
  let usersURL = {}
  for (let shortURL in urlDatabase){
    if (urlDatabase[shortURL].userID == userID) {
      usersURL[shortURL] = urlDatabase[shortURL].longURL
    }
  }
  return usersURL
}

const fetchURLs = function (urlDatabase){
  let allUrls = {}
  for (let shortURL in urlDatabase){
    allUrls[shortURL] = urlDatabase[shortURL].longURL
  }
  return allUrls
}

const bodyParser = require("body-parser");

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
app.use(bodyParser.urlencoded({ extended: true }));

// sends message hello once in home page 


// shows preset database as json object

app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  let userURLs;
  if (userID != null){
    userURLs = fetchUsersURL(urlDatabase,userID)
  } else{
    userURLs = fetchURLs(urlDatabase)
  }
  const templateVars = {
    urls: userURLs,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = users[req.cookies["user_id"]]
  if (!userId){
    return res.status(403).send("Cannot access")
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
 
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars =
  {
    shortURL: req.params.shortURL,
    // urldatabases as pbject uses shortURL as key
    longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  const templateVars =
  {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_login", templateVars);
});


app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"]
  if (!userId){
    return res.status(401).send("Unauthorized")
  }
  const longURL = req.body.longURL
  const newShortURL = generateRandomString()
  urlDatabase[newShortURL] = {
    longURL,
    userID: userId
  }
  res.redirect("/urls")
})



app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls")
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURLs = req.body.longURL
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  }
  res.redirect("/urls")
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(users, email);

  if (user) {
    if (findUserByPassword(user, password)) {
      res.cookie("user_id", user["id"]);
    } else {
      res.status(403).send('Password is incorrect')
    }
  } else {
    res.status(403).send("There is no record of this user")
  }
  res.redirect("/urls")

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(users, email)

  if (user) {
    return res.status(400).send('a user with that email already exists');
  }

  if (!email || !password) {
    return res.status(400).send('Email and password cannot be empty')
  }
  users[id] = {
    id: id,
    email: email,
    password: password
  }
  res.cookie("user_id", id)
  res.redirect('/urls');

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



