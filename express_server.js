const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const { findUserByEmail, fetchUsersURL, generateRandomString } = require("./helpers")

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
// finds user by password
const findUserByPassword = function (user, password) {
  if (bcrypt.compareSync(password, user.password)) {
    return true;
  } else {
    return false;
  }
}
// object of ursers
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    // bcrypt hashs the password
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    // bcrypt hashs the password
    password: bcrypt.hashSync("whatever", 10)
  }
}

const { request } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));

// user urls page
app.get("/urls", (req, res) => {
  const userID = req.session["user_id"]
  let userURLs;
  // checking if userID is valid 
  if (userID != null) {
    userURLs = fetchUsersURL(urlDatabase, userID)
  } else {
    // return status code and Message
    res.status(403).send("Unauthorized Access")
  }
  const templateVars = {
    urls: userURLs,
    user: users[req.session["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// main page
app.post("/urls", (req, res) => {

  const userId = req.session["user_id"]
  const newUser = fetchUsersURL(urlDatabase, userId)
  if (!newUser) {
    return res.status(403).send("Unauthorized Access")
  } else {
    // function generates random string and assigns it to temURL
    let tempURL = generateRandomString();
    urlDatabase[tempURL] = {
      longURL: req.body.longURL,
      userID: req.session["user_id"]
    };
  }
  res.redirect('/urls')
})

// creates new url
app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"]
  // checks if user is logged in
  if (!userId) {
    return res.status(403).redirect("/login")
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(403).send("Please login.")
  }
  let userURLs = fetchUsersURL(urlDatabase, req.session["user_id"])
  if(Object.keys(userURLs).includes(req.params.shortURL)) {
    const templateVars =
    {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user: users[req.session["user_id"]]
    };
    res.render("urls_show", templateVars);
  } else{
    res.status(403).send("You dont own this shortURL");
    
  }
  
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  const newLongURL = req.body.updateURL
  urlDatabase[shortURL].longURL = newLongURL
  res.redirect("/urls")
})

//editing the longurl;
app.post("/urls/:shortUrl/edit", (req, res) => {
  urlDatabase[req.params.shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  }
  res.redirect('/urls')
})

// redirecting link
app.get("/u/:shortURL", (req, res) => {
  
  const longURL = urlDatabase[req.params.shortURL].longURL
  const templateVars =
  {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };
  res.redirect(longURL);

});

//register
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
  // checks if user already exists 
    return res.status(400).send('a user with that email already exists');
  }
// checks if email and password are present
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

// login page
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

// checks if user users password is  valid
  if (user) {
    if (findUserByPassword(user, password)) {
      req.session["user_id"] = user["id"];
    } else {
      res.status(403).send('Password is incorrect')
    }
  } else {
    res.status(403).send("There is no record of this user")
  }
  res.redirect("/urls")

});

// Delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session["user_id"]
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(403).send("Unauthorized Access")
  }
  if (urlDatabase[shortURL].userID && urlDatabase[shortURL] === userId) {
    return res.status(403).send("Unauthorized Access")
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls")
});

//logout 
app.post("/logout", (req, res) => {
  // deletes cookies
  req.session = null;
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



