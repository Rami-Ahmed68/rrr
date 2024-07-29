const jwt = require("jsonwebtoken");
const ApiErrors = require("../validation_error/ApiErrors");
const dotenv = require("dotenv");
dotenv.config({ path: "../../config/.env" });

const VerifyToken = async (header, next) => {
  // check if the header is exists
  if (!header || !header.startsWith("Bearer")) {
    return next(
      new ApiErrors(
        JSON.stringify({
          english: "Sorry, invalid header format ...",
          arabic: "... عذرا خطأ في البيانات",
        }),
        404
      )
    );
  }

  // extract the token from header
  const token = header.split(" ")[1];

  // check if the token is exists
  if (!token) {
    return next(
      new ApiErrors(
        JSON.stringify({
          english: "Sorry, token is required ...",
          arabic: "... عذرا يجب ارسال البيانات كاملة",
        }),
        404
      )
    );
  }

  // extract the data from token
  const TokenData = jwt.verify(token, process.env.SECRET_KEY);

  // return the data
  return TokenData;
};

module.exports = VerifyToken;
