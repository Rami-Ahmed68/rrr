const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path : "../../config/.env" });

const GenerateToken = function(userId , userEmail) {
    const token = jwt.sign({
        _id : userId,
        email : userEmail
    } , process.env.SECRET_KEY);
    return token;
};

module.exports = GenerateToken;