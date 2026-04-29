import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import {
  HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineXCircle, HiOutlineBan, HiOutlinePlus, HiOutlinePencil,
  HiOutlineCalendar, HiOutlineTrendingUp
} from "react-icons/hi";

function Bids() {
  const [bids, setBids] = useState([]);
  const [status, setStatus] = useState(null);

  const [tomorrowSlot, setTomorrowSlot] = useState(null);
  const [history, setHistory] = useState(null);
  const [sponsorship, setSponsorship] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("bids");
  const [showCreate, setShowCreate] = useState(false);
  const [editingBid, setEditingBid] = useState(null);
  const [form, setForm] = useState({ bid_amount: "", bid_date: "", slot_date: "" });
  const [editForm, setEditForm] = useState({ bid_amount: "", status: "" });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [bidsRes, statusRes, slotRes, histRes, profileRes] = await Promise.all([
        API.get("/bids/me"),
        API.get("/bids/status/me"),
        API.get("/bids/tomorrow-slot"),
        API.get("/bids/history"),
        API.get("/profile/me/full")
      ]);
      setBids(bidsRes.data);
      setStatus(statusRes.data);
      setTomorrowSlot(slotRes.data);
      setHistory(histRes.data);

      // Calculate total sponsorship
      const certs = profileRes.data.certifications || [];
      const licences = profileRes.data.licences || [];
      const courses = profileRes.data.courses || [];
      const total = [...certs, ...licences, ...courses].reduce((sum, item) => sum + (parseFloat(item.sponsorship_amount) || 0), 0);
      setSponsorship(total);
    } catch (err) {
      console.error("Bids fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      await API.post("/bids", {
        bid_amount: parseFloat(form.bid_amount),
        bid_date: form.bid_date,
        slot_date: form.slot_date || undefined
      });
      toast.success("Bid created successfully!");
      setShowCreate(false);
      setForm({ bid_amount: "", bid_date: "", slot_date: "" });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create bid");
    }
  }

  async function handleUpdate(id) {
    try {
      const payload = {};
      if (editForm.bid_amount) payload.bid_amount = parseFloat(editForm.bid_amount);
      if (editForm.status) payload.status = editForm.status;
      await API.put(`/bids/${id}`, payload);
      toast.success("Bid updated!");
      setEditingBid(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  }

  async function handleCancel(id) {
    if (!confirm("Cancel this bid? This action cannot be undone.")) return;
    try {
      await API.put(`/bids/${id}/cancel`);
      toast.success("Bid cancelled");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    }
  }

  function getStatusBadge(bid) {
    if (bid.cancelled) return <span className="badge badge-red">CANCELLED</span>;
    const map = {
      PENDING: "badge-amber",
      WON: "badge-green",
      LOST: "badge-red"
    };
    
    if (bid.status === "PENDING" && bid.competitive_status) {
      const color = bid.competitive_status === "Winning" ? "badge-green" : "badge-red";
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className={`badge ${map[bid.status]}`}>{bid.status}</span>
          <span className={`badge ${color}`} style={{ fontSize: 10 }}>{bid.competitive_status}</span>
        </div>
      );
    }

    return <span className={`badge ${map[bid.status] || "badge-blue"}`}>{bid.status}</span>;
  }

  if (loading) {
    return (
      <DashboardLayout title="Bidding">
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
        <div className="skeleton" style={{ height: 400 }} />
      </DashboardLayout>
    );
  }

  const statCards = status ? [
    { label: "Total Bids", value: status.total, icon: HiOutlineCurrencyDollar, color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
    { label: "Pending", value: status.pending, icon: HiOutlineClock, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    { label: "Won", value: status.won, icon: HiOutlineCheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.15)" },
    { label: "Lost", value: status.lost, icon: HiOutlineXCircle, color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  ] : [];

  return (
    <DashboardLayout title="Bidding">
      <Toaster position="top-right" toastOptions={{ className: "toast-custom" }} />

      {/* Status Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="stat-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon />
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Market Info */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="section-card fade-in">
          <div className="section-title">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlineTrendingUp style={{ color: "var(--accent-cyan)" }} /> Tomorrow's Slot
            </span>
          </div>
          {tomorrowSlot && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 8 }}>
                Date: <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{tomorrowSlot.slot_date}</span>
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>
                Competing Bids: <span style={{ fontWeight: 700, color: "var(--accent-amber)" }}>{tomorrowSlot.totalBids}</span>
              </div>
              {tomorrowSlot.bids.length > 0 ? (
                <table className="data-table" style={{ fontSize: 13 }}>
                  <thead><tr><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {tomorrowSlot.bids.slice(0, 5).map((b, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>£{parseFloat(b.bid_amount).toFixed(2)}</td>
                        <td>{b.status === "WON" ? <span className="badge badge-green">WON</span> : <span className="badge badge-amber">{b.status}</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No bids for tomorrow yet</p>
              )}
            </div>
          )}
        </div>

        {/* Sponsorship Info */}
        <div className="section-card fade-in">
          <div className="section-title">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlineCurrencyDollar style={{ color: "var(--accent-green)" }} /> Sponsorship Wallet
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-green)" }}>
              £{sponsorship.toFixed(2)}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
              Total potential funding from your sponsored certifications and courses. You can use this to outbid others!
            </p>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 12, padding: 8, background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
              Note: Sponsors only pay if you win the Alumni of the Day slot.
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-group">
        <button className={`tab-btn ${tab === "bids" ? "active" : ""}`} onClick={() => setTab("bids")}>My Bids</button>
        <button className={`tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>Full History</button>
      </div>

      {/* Create Bid */}
      <div style={{ marginBottom: 20 }}>
        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <HiOutlinePlus /> Place New Bid
        </button>
      </div>

      {showCreate && (
        <div className="section-card fade-in" style={{ marginBottom: 20 }}>
          <div className="section-title">Place a New Bid</div>
          <div style={{ marginTop: 12, padding: 12, background: "rgba(99,102,241,0.05)", borderRadius: 8, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
              <strong>Rules:</strong>
            </p>
            <ul style={{ fontSize: 12, color: "var(--text-muted)", paddingLeft: 16 }}>
              <li>Maximum bid: <strong>£{sponsorship.toFixed(2)}</strong> (your total sponsorship)</li>
              <li>Only <strong>one active bid</strong> allowed per calendar month.</li>
              <li>Bids cannot be decreased once placed.</li>
            </ul>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label">Bid Amount (£)</label>
              <input className="form-input" type="number" step="0.01" min="0.01" max={sponsorship} value={form.bid_amount} onChange={e => setForm({ ...form, bid_amount: e.target.value })} placeholder={`Max £${sponsorship.toFixed(2)}`} />
            </div>
            <div className="form-group">
              <label className="form-label">Bid Date</label>
              <input className="form-input" type="date" value={form.bid_date} onChange={e => setForm({ ...form, bid_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Slot Date (optional)</label>
              <input className="form-input" type="date" value={form.slot_date} onChange={e => setForm({ ...form, slot_date: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={handleCreate}>Submit Bid</button>
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Bids Table */}
      {tab === "bids" && (
        <div className="glass-card fade-in">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>My Active Bids</h3>
          {bids.length === 0 ? (
            <div className="empty-state"><p>No bids placed yet. Place your first bid above!</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Amount</th><th>Bid Date</th><th>Slot Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bids.map(bid => (
                  <>
                    <tr key={bid.id}>
                      <td style={{ fontWeight: 700, fontSize: 16 }}>£{parseFloat(bid.bid_amount).toFixed(2)}</td>
                      <td>{bid.bid_date}</td>
                      <td>{bid.slot_date || "—"}</td>
                      <td>{getStatusBadge(bid)}</td>
                      <td style={{ display: "flex", gap: 6 }}>
                        {!bid.cancelled && bid.status === "PENDING" && (
                          <>
                            <button className="btn-secondary btn-sm" onClick={() => {
                              setEditingBid(editingBid === bid.id ? null : bid.id);
                              setEditForm({ bid_amount: bid.bid_amount, status: bid.status });
                            }}>
                              <HiOutlinePencil />
                            </button>
                            <button className="btn-danger btn-sm" onClick={() => handleCancel(bid.id)}>
                              <HiOutlineBan />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                    {editingBid === bid.id && (
                      <tr key={`edit-${bid.id}`}>
                        <td colSpan={5} style={{ background: "var(--bg-card)", padding: 16 }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                              <label className="form-label">New Amount (must be ≥ current)</label>
                              <input className="form-input" type="number" step="0.01" value={editForm.bid_amount} onChange={e => setEditForm({ ...editForm, bid_amount: e.target.value })} />
                            </div>
                            <button className="btn-primary btn-sm" onClick={() => handleUpdate(bid.id)}>Update</button>
                            <button className="btn-secondary btn-sm" onClick={() => setEditingBid(null)}>Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="glass-card fade-in">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Bid History</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
            Total records: {history?.total || 0}
          </p>
          {history && history.bids.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr><th>Amount</th><th>Bid Date</th><th>Slot Date</th><th>Status</th><th>Created</th></tr>
              </thead>
              <tbody>
                {history.bids.map(bid => (
                  <tr key={bid.id}>
                    <td style={{ fontWeight: 700 }}>£{parseFloat(bid.bid_amount).toFixed(2)}</td>
                    <td>{bid.bid_date}</td>
                    <td>{bid.slot_date || "—"}</td>
                    <td>{getStatusBadge(bid)}</td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {new Date(bid.createdAt || bid.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state"><p>No bid history available</p></div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Bids;
