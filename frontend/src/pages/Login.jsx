import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("timeout")) {
      toast.error("Session expired. Please login again.", { id: "timeout-toast" });
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login successful!");

      // Auto-generate API key for dashboard if none exists
      try {
        const keysRes = await API.get("/keys/me");
        if (!keysRes.data || keysRes.data.length === 0) {
          const keyRes = await API.post("/keys/generate", {
            client_name: "Analytics Dashboard",
            permissions: ["read:alumni", "read:analytics", "read:alumni_of_day"]
          });
          localStorage.setItem("apiKey", keyRes.data.key.api_key);
        } else {
          const activeKey = keysRes.data.find(k => k.is_active);
          if (activeKey) localStorage.setItem("apiKey", activeKey.api_key);
        }
      } catch (keyErr) {
        console.error("API key setup:", keyErr);
      }

      const user = res.data.user;
      const defaultPages = {
        admin: "/dashboard",
        clients: "/alumni",
        developer: "/api-keys",
        user: "/bids"
      };

      setTimeout(() => navigate(defaultPages[user.role] || "/profile"), 500);
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Toaster position="top-right" toastOptions={{ className: "toast-custom" }} />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="sidebar-logo">A</div>
          <span>Alumni Analytics</span>
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to the University Analytics Dashboard</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">University Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="w1234567@my.westminster.ac.uk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link to="/forgot-password" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Forgot your password?
          </Link>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;