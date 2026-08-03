import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    console.log('Auth failed: No authorization header');
    return res.status(401).json({ error: "Not authorized" });
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    console.log('Auth failed: Malformed authorization header (no token)');
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables!');
      return res.status(500).json({ error: "Server configuration error" });
    }
    
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth successful for user:', user.userId);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth failed:', error.message);
    return res.status(401).json({ error: "Not authorized" });
  }
};