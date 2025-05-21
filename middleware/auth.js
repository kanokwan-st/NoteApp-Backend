import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];   //ดึง token ออกมาจาก header
  if (!token) {
    return res.json({
      success: false,
      message: "Access denied. No Token.",
    });
  }
  try {
    // ถอดรหัส token
    const decoded_token = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded_token.userId };
    next();
  } catch (err) {
    const isExpired = err.name === "TokenExpiredError";
    res.status(401).json({
      error: true,
      code: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN", //ในระบบ
      message: isExpired
        ? "Token has expired, please log in again" // ให้ human read
        : "Invalid token.",
    });
  }
};
