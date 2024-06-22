import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization && !authorization?.startsWith("Bearer")) {
    return res.status(401).send("Access denied");
  }
  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send("Access denied");
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

function isAdmin(req, res, next) {
  if (req.user.userType !== "admin") {
    return res.status(403).send("Admin access required");
  }
  next();
}

export { userAuth, isAdmin };
