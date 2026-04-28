/**
 * Middleware to restrict access based on user roles.
 * @param {string[]} allowedRoles - Array of roles allowed to access the route.
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(", ")}` 
      });
    }

    next();
  };
};

module.exports = authorize;
