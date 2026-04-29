import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineKey,
  HiOutlineHome,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUserCircle,
  HiOutlineCurrencyDollar,
  HiOutlineStar,
  HiOutlineShieldCheck
} from "react-icons/hi";
import { useState } from "react";
import API from "../api/api";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: HiOutlineHome, roles: ["admin"] },
  { path: "/alumni", label: "Alumni Directory", icon: HiOutlineUsers, roles: ["clients", "admin"] },
  { path: "/profile", label: "My Profile", icon: HiOutlineUserCircle },
  { path: "/bids", label: "Bidding", icon: HiOutlineCurrencyDollar, roles: ["user"] },
  { path: "/influencer", label: "Influencer of Day", icon: HiOutlineStar, roles: ["clients", "admin", "user"] },
  { path: "/api-keys", label: "API Keys", icon: HiOutlineKey, roles: ["developer"] },
  { path: "/admin", label: "Admin Panel", icon: HiOutlineShieldCheck, roles: ["admin"] },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  async function logout() {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      // Even if the API call fails, proceed with local logout
      console.error("Logout API error:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("apiKey");
    navigate("/login");
  }

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">A</div>
        <span>Alumni Analytics</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.filter(item => {
          if (!item.roles) return true;
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          return item.roles.includes(user?.role);
        }).map((item) => (
          <button
            key={item.path}
            className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon />
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={logout}>
          <HiOutlineLogout />
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
