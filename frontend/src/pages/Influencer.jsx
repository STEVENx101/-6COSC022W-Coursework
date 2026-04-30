import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import {
  HiOutlineStar, HiOutlineLightningBolt, HiOutlineUserCircle
} from "react-icons/hi";

function Influencer() {
  const [influencer, setInfluencer] = useState(null);
  const [noInfluencer, setNoInfluencer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => { fetchToday(); }, []);

  async function fetchToday() {
    setLoading(true);
    try {
      const res = await API.get("/influencer/today");
      setInfluencer(res.data);
      setNoInfluencer(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setNoInfluencer(true);
        setInfluencer(null);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Influencer of the Day">
        <div className="skeleton" style={{ height: 300, marginBottom: 24 }} />
        <div className="grid-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout title="Influencer of the Day">
      <Toaster position="top-right" toastOptions={{ className: "toast-custom" }} />

      {/* Featured Influencer */}
      {influencer ? (
        <div className="feature-card fade-in" style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 8, fontSize: 13, color: "var(--accent-amber)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
            ⭐ Alumni Influencer of the Day
          </div>

          <div className="feature-avatar">
            {influencer.profile?.profile_image ? (
              <img src={influencer.profile.profile_image} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              (influencer.profile?.full_name || influencer.user?.email || "?")[0].toUpperCase()
            )}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            {influencer.profile?.full_name || "Alumni User"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
            {influencer.user?.email}
          </p>
          {influencer.profile?.bio && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 16, maxWidth: 500, margin: "8px auto 16px" }}>
              "{influencer.profile.bio}"
            </p>
          )}
          {influencer.profile?.linkedin_url && (
            <a href={influencer.profile.linkedin_url} target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: "var(--accent-cyan)" }}>
              View LinkedIn Profile →
            </a>
          )}
        </div>
      ) : noInfluencer ? (
        <div className="feature-card fade-in" style={{ marginBottom: 28 }}>
          <HiOutlineUserCircle style={{ fontSize: 64, color: "var(--text-muted)", marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "var(--text-secondary)" }}>
            No Influencer Assigned Today
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
            The winner of the daily bidding system is automatically featured here.
          </p>
        </div>
      ) : null}

      {/* Test Winner Selection */}
      <div className="glass-card fade-in" style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Manual Winner Selection</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Trigger the scheduler to pick tomorrow's winner from today's bids.</div>
        </div>
        <button
          className="btn-primary"
          disabled={selecting}
          onClick={async () => {
            setSelecting(true);
            try {
              const res = await API.post("/influencer/test-select-winner");
              toast.success(res.data.message);
              fetchToday();
            } catch (err) {
              toast.error(err.response?.data?.message || "Selection failed");
            } finally {
              setSelecting(false);
            }
          }}
        >
          <HiOutlineLightningBolt /> {selecting ? "Selecting..." : "Select Winner Now"}
        </button>
      </div>

      {/* Stats */}
      <div className="glass-card fade-in" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>
          <HiOutlineStar style={{ color: "var(--accent-amber)" }} /> Active Date
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          {influencer?.active_date || new Date().toISOString().split("T")[0]}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Status: {influencer?.is_active ? (
            <span className="badge badge-green">Active</span>
          ) : (
            <span className="badge badge-red">Inactive</span>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="glass-card fade-in" style={{ padding: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>How Influencer of the Day Works</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13, color: "var(--text-secondary)" }}>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>🏆 Selection</strong>
            <p>Alumni who win the daily bid are featured as the influencer of the day. Their profile is showcased prominently on the platform.</p>
          </div>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>💰 Sponsorship</strong>
            <p>When a bid is won, the winning amount is deducted from the alumni's sponsorship pool across their certifications and courses.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Influencer;
