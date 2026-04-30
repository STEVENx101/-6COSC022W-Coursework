import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import { HiOutlineKey, HiOutlinePlus, HiOutlineTrash, HiOutlineEye, HiOutlineChartBar } from "react-icons/hi";

function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [clientName, setClientName] = useState("Analytics Dashboard");
  const [perms, setPerms] = useState(["read:alumni", "read:analytics"]);
  const [logs, setLogs] = useState(null);
  const [logsKeyId, setLogsKeyId] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsKeyId, setStatsKeyId] = useState(null);
  const [allPerms, setAllPerms] = useState(["read:alumni", "read:analytics", "read:alumni_of_day"]);
  const [permDescriptions, setPermDescriptions] = useState({});

  useEffect(() => { fetchKeys(); fetchPermissions(); }, []);

  async function fetchPermissions() {
    try {
      const res = await API.get("/keys/permissions");
      setAllPerms(res.data.permissions);
      setPermDescriptions(res.data.description || {});
    } catch (err) { console.error("Failed to fetch permissions:", err); }
  }

  async function fetchKeys() {
    try {
      const res = await API.get("/keys/me");
      setKeys(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function createKey() {
    try {
      const res = await API.post("/keys/generate", { client_name: clientName, permissions: perms });
      toast.success("API key created!");
      localStorage.setItem("apiKey", res.data.key.api_key);
      setShowCreate(false);
      fetchKeys();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create key");
    }
  }

  async function revokeKey(id) {
    if (!confirm("Revoke this API key?")) return;
    try {
      await API.put(`/keys/${id}/revoke`);
      toast.success("API key revoked");
      fetchKeys();
    } catch (err) { toast.error("Failed to revoke"); }
  }

  async function viewLogs(id) {
    if (logsKeyId === id) { setLogs(null); setLogsKeyId(null); return; }
    try {
      const res = await API.get(`/keys/${id}/logs?limit=20`);
      setLogs(res.data);
      setLogsKeyId(id);
    } catch (err) { toast.error("Failed to load logs"); }
  }

  async function viewStats(id) {
    if (statsKeyId === id) { setStats(null); setStatsKeyId(null); return; }
    try {
      const res = await API.get(`/keys/${id}/stats`);
      setStats(res.data);
      setStatsKeyId(id);
    } catch (err) { toast.error("Failed to load stats"); }
  }

  function togglePerm(p) {
    setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  return (
    <DashboardLayout title="API Key Management">
      <Toaster position="top-right" toastOptions={{ className: "toast-custom" }} />

      {/* Create Key */}
      <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <HiOutlinePlus /> Generate New Key
        </button>
      </div>

      {showCreate && (
        <div className="glass-card fade-in" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create Scoped API Key</h3>
          <div className="form-group">
            <label className="form-label">Client Application Name</label>
            <input className="form-input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Analytics Dashboard" />
          </div>
          <div className="form-group">
            <label className="form-label">Permissions</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {allPerms.map(p => (
                <button key={p} className={perms.includes(p) ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => togglePerm(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={createKey}>Create Key</button>
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Permission Scoping Info */}
      <div className="glass-card" style={{ marginBottom: 24, padding: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>API Key Scoping</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 13 }}>
          {allPerms.map((p, i) => {
            const badges = ["badge-blue", "badge-purple", "badge-green"];
            return (
              <div key={p}>
                <span className={`badge ${badges[i % badges.length]}`} style={{ marginBottom: 4 }}>{p}</span>
                <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>{permDescriptions[p] || p}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keys Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your API Keys</h3>
        {loading ? (
          <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)}</div>
        ) : keys.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 32 }}>No API keys yet. Generate one above.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Client</th><th>Key</th><th>Permissions</th><th>Usage</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {keys.map(k => (
                <>
                  <tr key={k.id}>
                    <td style={{ fontWeight: 600 }}>{k.client_name}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-secondary)" }}>
                      {k.api_key.slice(0, 12)}...{k.api_key.slice(-8)}
                    </td>
                    <td>{(k.permissions || []).map(p => <span key={p} className="badge badge-blue" style={{ marginRight: 4, fontSize: 11 }}>{p}</span>)}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{k.usage_count}</span>
                      {k.last_used_at && <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>Last: {new Date(k.last_used_at).toLocaleString()}</span>}
                    </td>
                    <td>{k.is_active ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Revoked</span>}</td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn-secondary btn-sm" onClick={() => viewStats(k.id)} title="View stats"><HiOutlineChartBar /></button>
                      <button className="btn-secondary btn-sm" onClick={() => viewLogs(k.id)} title="View logs"><HiOutlineEye /></button>
                      {k.is_active && <button className="btn-danger btn-sm" onClick={() => revokeKey(k.id)} title="Revoke"><HiOutlineTrash /></button>}
                    </td>
                  </tr>
                  {statsKeyId === k.id && stats && (
                    <tr key={`stats-${k.id}`}>
                      <td colSpan={6} style={{ background: "var(--bg-card)", padding: 16 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Key Statistics</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                          <div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Client</div><div style={{ fontWeight: 600 }}>{stats.client_name}</div></div>
                          <div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Usage Count</div><div style={{ fontWeight: 700, fontSize: 18 }}>{stats.usage_count}</div></div>
                          <div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Last Used</div><div style={{ fontSize: 13 }}>{stats.last_used_at ? new Date(stats.last_used_at).toLocaleString() : "Never"}</div></div>
                          <div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Created</div><div style={{ fontSize: 13 }}>{new Date(stats.created_at).toLocaleString()}</div></div>
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Permissions</div>
                          {(stats.permissions || []).map(p => <span key={p} className="badge badge-blue" style={{ marginRight: 4 }}>{p}</span>)}
                        </div>
                        {stats.revoked_at && <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent-red)" }}>Revoked: {new Date(stats.revoked_at).toLocaleString()}</div>}
                      </td>
                    </tr>
                  )}
                  {logsKeyId === k.id && logs && (
                    <tr key={`logs-${k.id}`}>
                      <td colSpan={6} style={{ background: "var(--bg-card)", padding: 16 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Usage Logs ({logs.total} total)</h4>
                        {logs.logs.length > 0 ? (
                          <table className="data-table" style={{ fontSize: 12 }}>
                            <thead><tr><th>Endpoint</th><th>Method</th><th>IP</th><th>Time</th></tr></thead>
                            <tbody>
                              {logs.logs.map((l, i) => (
                                <tr key={i}>
                                  <td style={{ fontFamily: "monospace" }}>{l.endpoint}</td>
                                  <td><span className="badge badge-blue">{l.method}</span></td>
                                  <td style={{ color: "var(--text-muted)" }}>{l.ip_address}</td>
                                  <td style={{ color: "var(--text-muted)" }}>{new Date(l.accessed_at).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : <p style={{ color: "var(--text-muted)" }}>No logs yet</p>}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ApiKeys;
