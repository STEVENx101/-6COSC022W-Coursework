import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_CLASSES = ["", "strength-weak", "strength-fair", "strength-good", "strength-strong"];

function Register() {
  const [step, setStep] = useState(1); // 1=register, 2=verify
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  async function handleRegister(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      await API.post("/auth/register", { email, password });
      toast.success("Registration successful! Check your email for the verification code.");
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.map(e => e.msg).join(", ") || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/verify", { token });
      toast.success("Email verified! You can now login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
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

        {step === 1 ? (
          <>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Register with your university email</p>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">University Email</label>
                <input
                  id="register-email"
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
                  id="register-password"
                  className="form-input"
                  type="password"
                  placeholder="Min 8 chars, uppercase, number, special"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {password.length > 0 && (
                  <>
                    <div className={`password-strength ${STRENGTH_CLASSES[strength]}`}>
                      <div className="bar" /><div className="bar" /><div className="bar" /><div className="bar" />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                      {STRENGTH_LABELS[strength]}
                    </span>
                  </>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  id="register-confirm"
                  className="form-input"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                id="register-submit"
                type="submit"
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={loading}
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="auth-title">Verify Email</h2>
            <p className="auth-subtitle">Enter the verification code sent to {email}</p>

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <input
                  id="verify-token"
                  className="form-input"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  style={{ textAlign: "center", letterSpacing: 2, fontSize: 18, fontWeight: 700 }}
                />
              </div>

              <button
                id="verify-submit"
                type="submit"
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>
          </>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;