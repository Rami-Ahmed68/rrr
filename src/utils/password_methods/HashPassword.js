const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config({ path : "../../config/.env" })

const HashPassword = async function(password) {
    const salt = await bcrypt.genSalt(Number(process.env.SALTROUNDS));
    return password = bcrypt.hash(password , salt);
};

module.exports = HashPassword;