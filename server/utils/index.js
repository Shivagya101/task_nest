import jwt from "jsonwebtoken";

const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // Only secure in production
    sameSite: isProduction ? "none" : "lax", // 'lax' for local dev, 'none' for production (cross-site)
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};

export default createJWT;
