import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import {
  HiOutlineStar, HiOutlineEye, HiOutlineRefresh,
  HiOutlineLightningBolt, HiOutlineUserCircle
} from "react-icons/hi";

function Influencer() {
  const [influencer, setInfluencer] = useState(null);
  const [noInfluencer, setNoInfluencer] = useState(false);
  const [loading, setLoading] = useState(true);

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


  async function handleUpdateAppearance() {
    if (!influencer?.user?.id) return;
    try {
      await API.put(`/influencer/update-appearance/${influencer.user.id}`);
      toast.success("Appearance count incremented");
      fetchToday();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  }

  async function handleResetAppearance() {
    if (!influencer?.user?.id) return;
    if (!confirm("Reset the appearance count to 0?")) return;
    try {
      await API.put(`/influencer/reset-appearance/${influencer.user.id}`);
      toast.success("Appearance count reset");
      fetchToday();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
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

      {/* Stats & Actions */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {/* Appearance Count */}
        <div className="glass-card fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>
            <HiOutlineEye style={{ color: "var(--accent-cyan)" }} /> Appearance Count
          </div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>
            {influencer?.appearance_count ?? 0}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            Times displayed today
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary btn-sm" onClick={handleUpdateAppearance} disabled={!influencer}>
              <HiOutlineEye /> Increment
            </button>
            <button className="btn-danger btn-sm" onClick={handleResetAppearance} disabled={!influencer}>
              <HiOutlineRefresh /> Reset
            </button>
          </div>
        </div>

        {/* Active Date */}
        <div className="glass-card fade-in">
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
            <strong style={{ color: "var(--text-primary)" }}>📊 Tracking</strong>
            <p>The appearance count tracks how many times the influencer's profile has been viewed. It can be incremented and reset as needed.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Influencer;
