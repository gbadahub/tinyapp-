const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const {findUserByEmail, fetchUsersURL, generateRandomString } = require("./helpers")

app.use(cookieSession({
  name: 'session',
  keys: ["music"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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

const findUserByPassword = function (user, password) {
  if ( bcrypt.compareSync(password, user.password)) {
    return true;
  } else {
    return false;
  }
} 
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("whatever", 10)
  }
}


const { request } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/urls", (req, res) => {
  const userID = req.session["user_id"]
  let userURLs;
  if (userID != null){
    userURLs = fetchUsersURL(urlDatabase,userID)
  } else{
    return res.redirect('/login')
  }
  const templateVars = {
    urls: userURLs,
    user: users[req.session["user_id"]]
  };
  res.render("urls_index", templateVars);
});

//This route is for editing the longurl;
app.post("/urls/:shortUrl/edit", (req, res) => {
  urlDatabase[req.params.shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  }
  
  res.redirect('/urls')
})

//this one is being used for the new Part
app.post("/urls", (req, res) => {
 
  const userId = req.session["user_id"]
  const newUser = fetchUsersURL(urlDatabase, userId)
  if (!newUser){
    return res.status(403).send("Unauthorized Access")
  } else {
    let tempURL = generateRandomString();
      urlDatabase[tempURL] = {
        longURL: req.body.longURL,
        userID: req.session["user_id"]
      };
  }
  res.redirect('/urls')
})

app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"]
  if (!userId){
    return res.status(403).send("Cannot access")
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };
 
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars =
  {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL], 
    user: users[req.session["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  const templateVars =
  {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };
  
  res.redirect(longURL);
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  const newLongURL = req.body.updateURL
  urlDatabase[shortURL].longURL = newLongURL
  // urlDatabase[shortURL] = {
  //   longURL: req.body.longURL,
  //  // userID: req.session["user_id"],
  // }
  // urlDatabase[shortURL].longURL = req.body.longURL
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]]
  }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  const user = findUserByEmail(users, email)
  req.session["user_id"] = id

  if (user) {
    return res.status(400).send('a user with that email already exists');
  }

  if (!email || !password) {
    return res.status(400).send('Email and password cannot be empty')
  }
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  }
  
  res.redirect('/urls');

});


app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]]
  }
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(users, email);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (user) {
    if (findUserByPassword(user, password)) {
      req.session["user_id"] =user["id"];
    } else {
      res.status(403).send('Password is incorrect')
    }
  } else {
    res.status(403).send("There is no record of this user")
  }
  res.redirect("/urls")

});


app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session["user_id"]
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]){
    return res.status(403).send("Unauthorized Access")
  } 
  if (urlDatabase[shortURL].userID && urlDatabase[shortURL] === userId){
    return res.status(403).send("Unauthorized Access")
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



