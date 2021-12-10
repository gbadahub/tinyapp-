

const findUserByEmail = function (users, email) {
  for (let name in users) {
    if (users[name].email === email) {
      return users[name];
    }
  }
}