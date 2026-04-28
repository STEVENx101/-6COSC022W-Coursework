import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleForgot(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("Reset link sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally { setLoading(false); }
  }

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/reset-password", { token, newPassword });
      toast.success("Password reset successful! You can now login.");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <Toaster position="top-right" toastOptions={{ className: "toast-custom" }} />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="sidebar-logo">A</div>
          <span>Alumni Analytics</span>
        </div>

        {step === 1 && (
          <>
            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-subtitle">Enter your email to receive a reset link</p>
            <form onSubmit={handleForgot}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="Your university email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">Enter the token from your email and your new password</p>
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label className="form-label">Reset Token</label>
                <input className="form-input" type="text" placeholder="Paste token here" value={token} onChange={e => setToken(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="Min 8 chars, uppercase, number, special" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="auth-title">Password Reset!</h2>
            <p className="auth-subtitle">Your password has been updated successfully.</p>
            <Link to="/login" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "flex", marginTop: 16 }}>
              Go to Login
            </Link>
          </>
        )}

        <div className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
