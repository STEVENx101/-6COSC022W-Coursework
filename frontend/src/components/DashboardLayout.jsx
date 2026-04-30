import { useState } from "react";
import Sidebar from "./Sidebar";
import { HiOutlineMenu } from "react-icons/hi";

function DashboardLayout({ children, title }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-bar-title">{title || "Dashboard"}</h1>
          </div>
          <div className="top-bar-right">
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              University Analytics
            </span>
          </div>
        </div>

        <div className="page-content fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
