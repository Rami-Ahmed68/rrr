const bcrypt = require("bcrypt");

// compare password's
const compare = (password1, password2) => {
  return bcrypt.compare(password1, password2);
};

module.exports = compare;
