const jwt = require("jsonwebtoken");
const { returnCommonResponse } = require("../common/common");

const verifyAuthToken = async (req, res, next) => {
  let token = req.headers["authorization"];
  if (token != null && token.length > 0) {
    token = token.replace("Bearer ", "");
  } else {
    await returnCommonResponse(res, 401, "Missing Authentication Token", {})
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded?.roll_type && decoded.roll_type == 1) {
      req.user = decoded;
    } else {
      await returnCommonResponse(res, 401, "Access Denied", {})
    }
  } catch (error) {
    await returnCommonResponse(res, 401, error.message, error)
  }
  return next();
};

module.exports = verifyAuthToken;
