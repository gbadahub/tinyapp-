
const findUserByEmail = function (users, email) {
  for (let name in users) {
    if (users[name].email === email) {
      return users[name];
    }
  } return undefined
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

function generateRandomString() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
}

module.exports = {findUserByEmail, fetchUsersURL, generateRandomString }

