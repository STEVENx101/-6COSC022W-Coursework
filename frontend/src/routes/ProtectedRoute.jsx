import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("User data corruption:", err);
    localStorage.removeItem("user");
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    const defaultPages = {
      admin: "/dashboard",
      clients: "/alumni",
      developer: "/api-keys",
      user: "/profile"
    };
    const target = defaultPages[user?.role] || "/profile";
    
    return <Navigate to={target} replace />;
  }

  return children;
}

export default ProtectedRoute;