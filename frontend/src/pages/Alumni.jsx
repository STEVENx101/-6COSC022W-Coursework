import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import { HiOutlineSearch, HiOutlineCurrencyDollar, HiOutlineOfficeBuilding, HiOutlineAcademicCap } from "react-icons/hi";

function Alumni() {
  const [alumni, setAlumni] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // Sponsorship Modal State
  const [sponsorModal, setSponsorModal] = useState(null); // { type, id, title }
  const [sponsorAmount, setSponsorAmount] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isClient = user.role === "clients" || user.role === "admin";

  useEffect(() => { fetchAlumni(); }, [page, search, degree, year, company]);

  async function fetchAlumni() {
    setLoading(true);
    const apiKey = localStorage.getItem("apiKey");
    const h = (apiKey && apiKey !== "null" && apiKey !== "undefined") ? { "x-api-key": apiKey } : {};
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set("search", search);
      if (degree) params.set("degree", degree);
      if (year) params.set("year", year);
      if (company) params.set("company", company);

      const res = await API.get(`/analytics/alumni?${params}`, { headers: h });
      setAlumni(res.data.alumni);
      setTotal(res.data.filtered);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleSponsor() {
    if (!sponsorAmount || isNaN(sponsorAmount)) return toast.error("Enter a valid amount");
    try {
      const path = sponsorModal.type === "cert" ? "certifications" : sponsorModal.type === "licence" ? "licences" : "courses";
      await API.put(`/profile/${path}/${sponsorModal.id}/sponsor`, { amount: parseFloat(sponsorAmount) });
      toast.success("Sponsorship offered!");
      setSponsorModal(null);
      setSponsorAmount("");
      fetchAlumni();
    } catch (err) {
      toast.error("Failed to offer sponsorship");
    }
  }

  return (
    <DashboardLayout title="Alumni Directory">
      <Toaster position="top-right" />
      
      {/* Filters */}
      <div className="glass-card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <HiOutlineSearch style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
            <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <input className="form-input" style={{ width: 180 }} placeholder="Filter by degree..." value={degree} onChange={e => { setDegree(e.target.value); setPage(1); }} />
          <input className="form-input" style={{ width: 120 }} placeholder="Year" type="number" value={year} onChange={e => { setYear(e.target.value); setPage(1); }} />
          <input className="form-input" style={{ width: 180 }} placeholder="Filter by company..." value={company} onChange={e => { setCompany(e.target.value); setPage(1); }} />
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{total} results</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: "auto" }}>
        {loading ? (
          <div>{[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />)}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Degrees</th>
                <th>Certifications</th>
                <th>Company</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((a, i) => (
                <>
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.Profile?.full_name || "—"}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{a.email}</td>
                    <td>{a.degrees.map(d => <span key={d.degree_name} className="badge badge-purple" style={{ marginRight: 4, marginBottom: 4 }}>{d.degree_name} ({d.year})</span>)}</td>
                    <td><span className="badge badge-blue">{a.certifications.length}</span></td>
                    <td>{a.employment.length > 0 ? a.employment[0].company : "—"}</td>
                    <td><button className="btn-secondary btn-sm" onClick={() => setExpanded(expanded === i ? null : i)}>
                      {expanded === i ? "Hide" : "View"}
                    </button></td>
                  </tr>
                  {expanded === i && (
                    <tr key={`detail-${i}`}>
                      <td colSpan={6} style={{ background: "var(--bg-card)", padding: 20 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                          <div>
                            <h4 style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                              <HiOutlineAcademicCap /> Certifications
                            </h4>
                            {a.certifications.map((c,j) => (
                              <div key={j} style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8, marginBottom: 8 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.organization}, {c.year}</div>
                                {c.sponsorship_amount > 0 && <div style={{ fontSize: 11, color: "var(--accent-green)", marginTop: 4 }}>Sponsored: £{c.sponsorship_amount}</div>}
                                {isClient && (
                                  <button className="btn-primary btn-sm" style={{ marginTop: 8, fontSize: 11, padding: "4px 8px" }} onClick={() => setSponsorModal({ type: "cert", id: c.id, title: c.title })}>
                                    <HiOutlineCurrencyDollar /> Sponsor
                                  </button>
                                )}
                              </div>
                            ))}
                            {a.certifications.length === 0 && <span style={{color:"var(--text-muted)", fontSize: 13}}>None</span>}
                          </div>
                          <div>
                            <h4 style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                              <HiOutlineAcademicCap /> Courses
                            </h4>
                            {a.courses.map((c,j) => (
                              <div key={j} style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8, marginBottom: 8 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.course_name}</div>
                                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.provider}, {c.year}</div>
                                {c.sponsorship_amount > 0 && <div style={{ fontSize: 11, color: "var(--accent-green)", marginTop: 4 }}>Sponsored: £{c.sponsorship_amount}</div>}
                                {isClient && (
                                  <button className="btn-primary btn-sm" style={{ marginTop: 8, fontSize: 11, padding: "4px 8px" }} onClick={() => setSponsorModal({ type: "course", id: c.id, title: c.course_name })}>
                                    <HiOutlineCurrencyDollar /> Sponsor
                                  </button>
                                )}
                              </div>
                            ))}
                            {a.courses.length === 0 && <span style={{color:"var(--text-muted)", fontSize: 13}}>None</span>}
                          </div>
                          <div>
                            <h4 style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                              <HiOutlineOfficeBuilding /> Employment
                            </h4>
                            {a.employment.map((e,j) => <div key={j} style={{ fontSize: 13, marginBottom: 8, background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>
                              <div style={{ fontWeight: 600 }}>{e.role}</div>
                              <div style={{ color: "var(--text-secondary)" }}>{e.company}</div>
                            </div>)}
                            {a.employment.length === 0 && <span style={{color:"var(--text-muted)", fontSize: 13}}>None</span>}
                          </div>
                        </div>
                        {a.Profile?.bio && <p style={{ marginTop: 16, padding: 12, background: "rgba(99,102,241,0.05)", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic" }}>{a.Profile.bio}</p>}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {alumni.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>No alumni found</td></tr>}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {total > 15 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            <button className="btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Previous</button>
            <span style={{ padding: "6px 14px", fontSize: 13, color: "var(--text-secondary)" }}>Page {page}</span>
            <button className="btn-secondary btn-sm" onClick={() => setPage(p => p+1)} disabled={alumni.length < 15}>Next</button>
          </div>
        )}
      </div>

      {/* Sponsor Modal */}
      {sponsorModal && (
        <div className="modal-overlay" onClick={() => setSponsorModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Sponsor {sponsorModal.title}</div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>Offer a sponsorship amount for this credential. The alumni can use this to bid for the Influencer slot.</p>
            <div className="form-group">
              <label className="form-label">Amount (£)</label>
              <input className="form-input" type="number" value={sponsorAmount} onChange={e => setSponsorAmount(e.target.value)} placeholder="e.g. 250" />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSponsorModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSponsor}>Confirm Offer</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Alumni;
