const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const er = new Error("not authenticated");
    er.statusCode = 401;
    throw er;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "secretisalwaysasecret");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const er = new Error("not authenticated");
    er.statusCode = 401;
    throw er;
  }

  req.userId = decodedToken.userId;
  req.userName = decodedToken.name;
  next();
};
