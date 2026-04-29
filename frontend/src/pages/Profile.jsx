import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import {
  HiOutlineUser, HiOutlineAcademicCap, HiOutlineBadgeCheck,
  HiOutlineDocumentText, HiOutlineBookOpen, HiOutlineBriefcase,
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineLink
} from "react-icons/hi";

/* ───── Generic CRUD Section ───── */
function CrudSection({ title, subtitle, icon: Icon, items, fields, apiPath, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  function openAdd() { setEditing(null); setForm({}); setShowModal(true); }
  function openEdit(item) { setEditing(item); setForm({ ...item }); setShowModal(true); }

  async function handleSave() {
    try {
      if (editing) {
        await API.put(`${apiPath}/${editing.id}`, form);
        toast.success("Updated successfully");
      } else {
        await API.post(apiPath, form);
        toast.success("Added successfully");
      }
      setShowModal(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this item?")) return;
    try {
      await API.delete(`${apiPath}/${id}`);
      toast.success("Deleted successfully");
      onRefresh();
    } catch (err) {
      toast.error("Delete failed");
    }
  }

  return (
    <>
      <div className="section-card fade-in">
        <div className="section-title">
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon style={{ color: "var(--accent-blue)" }} /> {title}
          </span>
          <button className="btn-primary btn-sm" onClick={openAdd}>
            <HiOutlinePlus /> Add
          </button>
        </div>
        <div className="section-subtitle">{subtitle}</div>

        {items.length === 0 ? (
          <div className="empty-state"><p>No {title.toLowerCase()} added yet</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {fields.map(f => <th key={f.key}>{f.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  {fields.map(f => (
                    <td key={f.key} style={f.key === fields[0].key ? { fontWeight: 600 } : {}}>
                      {item[f.key] || "—"}
                    </td>
                  ))}
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(item)}><HiOutlinePencil /></button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(item.id)}><HiOutlineTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}</div>
            {fields.map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input
                  className="form-input"
                  type={f.type || "text"}
                  placeholder={f.placeholder || f.label}
                  value={form[f.key] || ""}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>{editing ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ───── Profile Page ───── */
function Profile() {
  const [profile, setProfile] = useState(null);
  const [degrees, setDegrees] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [licences, setLicences] = useState([]);
  const [courses, setCourses] = useState([]);
  const [employment, setEmployment] = useState([]);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [linkedinModal, setLinkedinModal] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [fullRes, completionRes] = await Promise.all([
        API.get("/profile/me/full"),
        API.get("/profile/me/completion")
      ]);
      setProfile(fullRes.data.profile);
      setDegrees(fullRes.data.degrees);
      setCertifications(fullRes.data.certifications);
      setLicences(fullRes.data.licences);
      setCourses(fullRes.data.courses);
      setEmployment(fullRes.data.employment);
      setCompletion(completionRes.data);
      if (fullRes.data.profile) {
        setProfileForm({
          full_name: fullRes.data.profile.full_name || "",
          bio: fullRes.data.profile.bio || "",
          profile_image: fullRes.data.profile.profile_image || "",
          linkedin_url: fullRes.data.profile.linkedin_url || ""
        });
        setLinkedinUrl(fullRes.data.profile.linkedin_url || "");
      }
    } catch (err) {
      // Profile might not exist yet
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProfile() {
    try {
      await API.post("/profile", profileForm);
      toast.success("Profile created!");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create profile");
    }
  }

  async function handleUpdateProfile() {
    try {
      await API.put("/profile/me", profileForm);
      toast.success("Profile updated!");
      setEditingProfile(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  }

  async function handleUpdateLinkedIn() {
    try {
      await API.put("/profile/me/linkedin", { linkedin_url: linkedinUrl });
      toast.success("LinkedIn URL updated!");
      setLinkedinModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="skeleton" style={{ height: 200 }} />
          <div className="skeleton" style={{ height: 200 }} />
        </div>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, marginBottom: 16 }} />)}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile">
      <Toaster position="top-right" toastOptions={{ className: "toast-custom" }} />

      {/* Profile Header + Completion */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Profile Info */}
        <div className="section-card fade-in">
          <div className="section-title">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlineUser style={{ color: "var(--accent-blue)" }} /> Profile Information
            </span>
            {profile && !editingProfile && (
              <button className="btn-secondary btn-sm" onClick={() => setEditingProfile(true)}>
                <HiOutlinePencil /> Edit
              </button>
            )}
          </div>

          {!profile ? (
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>No profile created yet. Set up your profile below.</p>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={profileForm.full_name || ""} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <input className="form-input" value={profileForm.bio || ""} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="A short bio about yourself" />
              </div>
              <div className="form-group">
                <label className="form-label">Profile Image URL</label>
                <input className="form-input" value={profileForm.profile_image || ""} onChange={e => setProfileForm({ ...profileForm, profile_image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input className="form-input" value={profileForm.linkedin_url || ""} onChange={e => setProfileForm({ ...profileForm, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
              </div>
              <button className="btn-primary" onClick={handleCreateProfile}>Create Profile</button>
            </div>
          ) : editingProfile ? (
            <div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <input className="form-input" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Profile Image URL</label>
                <input className="form-input" value={profileForm.profile_image} onChange={e => setProfileForm({ ...profileForm, profile_image: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={handleUpdateProfile}>Save Changes</button>
                <button className="btn-secondary" onClick={() => setEditingProfile(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                {profile.profile_image ? (
                  <img src={profile.profile_image} alt="Profile" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-color)" }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff" }}>
                    {(profile.full_name || "?")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{profile.full_name || "No name set"}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{profile.bio || "No bio"}</div>
                </div>
              </div>
              {profile.linkedin_url && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--accent-cyan)" }}>
                  <HiOutlineLink /> <a href={profile.linkedin_url} target="_blank" rel="noreferrer">{profile.linkedin_url}</a>
                </div>
              )}
              <button className="btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => { setLinkedinUrl(profile.linkedin_url || ""); setLinkedinModal(true); }}>
                <HiOutlineLink /> Update LinkedIn
              </button>
            </div>
          )}
        </div>

        {/* Completion Card */}
        <div className="section-card fade-in">
          <div className="section-title">Profile Completion</div>
          <div className="section-subtitle">Complete your profile to improve visibility</div>
          {completion && (
            <>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
                {completion.percentage}<span style={{ fontSize: 18, color: "var(--text-secondary)" }}>%</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 20 }}>
                <div className="progress-fill" style={{ width: `${completion.percentage}%` }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(completion.details).map(([key, done]) => (
                  <div key={key} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: done ? "var(--accent-green)" : "var(--text-muted)", flexShrink: 0 }} />
                    <span style={{ color: done ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* CRUD Sections */}
      <CrudSection
        title="Degrees"
        subtitle="Your academic qualifications"
        icon={HiOutlineAcademicCap}
        items={degrees}
        fields={[
          { key: "degree_name", label: "Degree Name", placeholder: "e.g. BSc Computer Science" },
          { key: "institution", label: "Institution", placeholder: "e.g. University of Westminster" },
          { key: "year", label: "Year", type: "number", placeholder: "e.g. 2024" }
        ]}
        apiPath="/profile/degrees"
        onRefresh={fetchAll}
      />

      <CrudSection
        title="Certifications"
        subtitle="Professional certifications and credentials"
        icon={HiOutlineBadgeCheck}
        items={certifications}
        fields={[
          { key: "title", label: "Title", placeholder: "e.g. AWS Solutions Architect" },
          { key: "organization", label: "Organization", placeholder: "e.g. Amazon Web Services" },
          { key: "year", label: "Year", type: "number", placeholder: "e.g. 2024" },
          { key: "sponsorship_amount", label: "Sponsorship (£)", type: "number", placeholder: "e.g. 200" }
        ]}
        apiPath="/profile/certifications"
        onRefresh={fetchAll}
      />

      <CrudSection
        title="Licences"
        subtitle="Professional licences and permits"
        icon={HiOutlineDocumentText}
        items={licences}
        fields={[
          { key: "title", label: "Title", placeholder: "e.g. Project Management Professional" },
          { key: "issuer", label: "Issuer", placeholder: "e.g. PMI" },
          { key: "year", label: "Year", type: "number", placeholder: "e.g. 2024" },
          { key: "sponsorship_amount", label: "Sponsorship (£)", type: "number", placeholder: "e.g. 200" }
        ]}
        apiPath="/profile/licences"
        onRefresh={fetchAll}
      />

      <CrudSection
        title="Courses"
        subtitle="Completed courses and training programmes"
        icon={HiOutlineBookOpen}
        items={courses}
        fields={[
          { key: "course_name", label: "Course Name", placeholder: "e.g. Machine Learning Fundamentals" },
          { key: "provider", label: "Provider", placeholder: "e.g. Coursera" },
          { key: "year", label: "Year", type: "number", placeholder: "e.g. 2024" },
          { key: "sponsorship_amount", label: "Sponsorship (£)", type: "number", placeholder: "e.g. 200" }
        ]}
        apiPath="/profile/courses"
        onRefresh={fetchAll}
      />

      <CrudSection
        title="Employment History"
        subtitle="Your work experience"
        icon={HiOutlineBriefcase}
        items={employment}
        fields={[
          { key: "company", label: "Company", placeholder: "e.g. Google" },
          { key: "role", label: "Role", placeholder: "e.g. Software Engineer" },
          { key: "start_date", label: "Start Date", type: "date" },
          { key: "end_date", label: "End Date (leave empty if current)", type: "date" }
        ]}
        apiPath="/profile/employment"
        onRefresh={fetchAll}
      />

      {/* LinkedIn Modal */}
      {linkedinModal && (
        <div className="modal-overlay" onClick={() => setLinkedinModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Update LinkedIn URL</div>
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input className="form-input" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/your-profile" />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setLinkedinModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdateLinkedIn}>Update</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Profile;
