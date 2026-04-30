import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import { HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineRefresh } from "react-icons/hi";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await API.get("/auth/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await API.put(`/auth/users/${userId}/role`, { role: newRole });
      toast.success("Role updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Admin Panel">
        <div className="skeleton" style={{ height: 400 }} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Panel">
      <Toaster position="top-right" />
      
      <div className="glass-card fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <HiOutlineShieldCheck style={{ fontSize: 24, color: "var(--accent-purple)" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>User Role Management</h3>
          </div>
          <button className="btn-secondary btn-sm" onClick={fetchUsers}>
            <HiOutlineRefresh /> Refresh
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Email</th>
                <th>Status</th>
                <th>Current Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.verified ? (
                      <span className="badge badge-green">Verified</span>
                    ) : (
                      <span className="badge badge-amber">Pending</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${user.role === "admin" ? "purple" : user.role === "developer" ? "cyan" : "gray"}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="form-input" 
                      style={{ padding: "4px 8px", fontSize: 12, width: "auto" }}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="developer">Developer</option>
                      <option value="clients">Clients</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminPanel;
