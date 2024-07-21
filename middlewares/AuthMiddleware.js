import jwtPackage from "jsonwebtoken";

const { verify } = jwtPackage;

export const verifyToken = (request, response, next) => {
  const token = request.cookies.jwt;
  if (!token) return response.status(401).send("You are not authenticated!");
  verify(token, process.env.JWT_KEY, async (error, payload) => {
    if (error) {
      return response.status(403).send("Token is not valid!");
    }
    request.userId = payload.userId;
    next();
  });
};
