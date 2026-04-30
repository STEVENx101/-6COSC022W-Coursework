import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import { 
  HiOutlineUsers, HiOutlineAcademicCap, HiOutlineBriefcase, 
  HiOutlineCurrencyDollar, HiOutlineDownload
} from "react-icons/hi";
import { Bar, Doughnut, Pie, Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend
);

const SEMANTIC_COLORS = { critical: "#ef4444", significant: "#f59e0b", emerging: "#3b82f6", stable: "#10b981" };
const THEMES = {
  default: ["#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f43f5e", "#f59e0b"],
  vibrant: ["#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"],
  mono: ["#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"]
};

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [data, setData] = useState({ certs: [], courses: [], degrees: [], employment: null, skills: null, trends: null, bids: null });
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({ degree: "", year: "", company: "", course: "" });
  const [appliedFilters, setAppliedFilters] = useState({ degree: "", year: "", company: "", course: "" });
  
  // Customization State
  const [configs, setConfigs] = useState({
    certs: { type: "bar", theme: "default" },
    bids: { type: "doughnut", theme: "default" },
    courses: { type: "bar", theme: "default" },
    trends: { type: "line", theme: "default" },
    employment: { type: "pie", theme: "default" },
    skills: { type: "radar", theme: "default" },
    degrees: { type: "pie", theme: "default" },
    industry: { type: "bar", theme: "default" }
  });

  useEffect(() => { fetchData(); }, [appliedFilters]);

  async function fetchData() {
    setLoading(true);
    const h = { "x-api-key": localStorage.getItem("apiKey") || "" };
    const params = new URLSearchParams(appliedFilters).toString();
    const query = params ? `?${params}` : "";

    try {
      const [o, c1, c2, c3, c4, c5, c6, c7] = await Promise.all([
        API.get(`/analytics/overview${query}`, { headers: h }),
        API.get(`/analytics/certifications${query}`, { headers: h }),
        API.get(`/analytics/courses${query}`, { headers: h }),
        API.get(`/analytics/degrees${query}`, { headers: h }),
        API.get(`/analytics/employment${query}`, { headers: h }),
        API.get(`/analytics/skills-gap${query}`, { headers: h }),
        API.get(`/analytics/trends${query}`, { headers: h }),
        API.get(`/analytics/bid-activity${query}`, { headers: h }),
      ]);
      setOverview(o.data);
      setData({ certs: c1.data, courses: c2.data, degrees: c3.data, employment: c4.data, skills: c5.data, trends: c6.data, bids: c7.data });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const applyFilters = () => setAppliedFilters(filters);
  const clearFilters = () => {
    const empty = { degree: "", year: "", company: "", course: "" };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  async function captureChart(selector, name) {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = document.querySelector(selector);
      const canvas = await html2canvas(el, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `${name}_visual_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Visualization captured");
    } catch (err) { toast.error("Capture failed"); }
  }

  const updateConfig = (id, key, val) => setConfigs(p => ({ ...p, [id]: { ...p[id], [key]: val } }));

  // --- Rendering ---
  const renderChart = (id, title, subtitle, chartData, customOpts = {}) => {
    const config = configs[id];
    const type = config.type;
    const Component = type === "bar" ? Bar : type === "line" ? Line : type === "pie" ? Pie : type === "doughnut" ? Doughnut : Radar;
    
    const baseOpts = {
      responsive: true, maintainAspectRatio: false,
      plugins: { 
        legend: { display: type !== "bar", position: "bottom", labels: { usePointStyle: true, font: { size: 10 } } },
        tooltip: { backgroundColor: "#1e293b", padding: 12, cornerRadius: 8 }
      },
      scales: (type === "bar" || type === "line") ? {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 10 } } }
      } : type === "radar" ? {
        r: { ticks: { display: false }, grid: { color: "rgba(0,0,0,0.05)" } }
      } : {}
    };

    return (
      <div className={`chart-container fade-in chart-${id}`}>
        <div className="chart-header">
          <div>
            <div className="chart-title">{title}</div>
            <div className="chart-subtitle">{subtitle}</div>
          </div>
          <div className="chart-actions">
            <select className="chart-select" value={type} onChange={(e) => updateConfig(id, "type", e.target.value)}>
              <option value="bar">Bar</option><option value="line">Line</option><option value="pie">Pie</option><option value="doughnut">Doughnut</option><option value="radar">Radar</option>
            </select>
            <button className="icon-btn-sm" onClick={() => captureChart(`.chart-${id}`, id)}><HiOutlineDownload /></button>
          </div>
        </div>
        <div style={{ height: 260 }}><Component data={chartData} options={{ ...baseOpts, ...customOpts }} /></div>
      </div>
    );
  };

  if (loading) return <DashboardLayout title="Dashboard"><div className="skeleton" style={{ height: "80vh" }} /></DashboardLayout>;

  return (
    <DashboardLayout title="Dashboard & Intelligence">
      <Toaster position="top-right" />
      
      <div className="dashboard-controls fade-in">
        <div className="controls-left">
          <h2 className="section-title">System Intelligence</h2>
          <p className="section-subtitle">Real-time analytical insights synchronized from alumni databases.</p>
        </div>
      </div>

      <div className="filter-bar fade-in">
        <div className="filter-group">
          <label>Programme</label>
          <input type="text" name="degree" value={filters.degree} onChange={handleFilterChange} placeholder="e.g. Computer Science" />
        </div>
        <div className="filter-group">
          <label>Grad Year</label>
          <input type="number" name="year" value={filters.year} onChange={handleFilterChange} placeholder="e.g. 2023" />
        </div>
        <div className="filter-group">
          <label>Industry/Company</label>
          <input type="text" name="company" value={filters.company} onChange={handleFilterChange} placeholder="e.g. Google" />
        </div>
        <div className="filter-group">
          <label>Course</label>
          <input type="text" name="course" value={filters.course} onChange={handleFilterChange} placeholder="e.g. React Native" />
        </div>
        <div className="filter-actions">
          <button className="btn-filter-apply" onClick={applyFilters}>Apply Filters</button>
          <button className="btn-filter-clear" onClick={clearFilters}>Clear</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: "Total Alumni", value: overview?.totalAlumni, icon: HiOutlineUsers },
          { label: "Credentials", value: overview?.totalCertifications, icon: HiOutlineAcademicCap },
          { label: "Placement", value: overview?.totalEmployment, icon: HiOutlineBriefcase },
          { label: "Market Bids", value: overview?.totalBids, icon: HiOutlineCurrencyDollar }
        ].map((card, i) => (
          <div key={i} className="stat-card fade-in">
            <div className="stat-icon-neutral"><card.icon /></div>
            <div className="stat-info">
              <div className="stat-value">{card.value?.toLocaleString()}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 24, marginBottom: 32 }}>
        {renderChart("certs", "Top Credentials", "Most acquired certifications", {
          labels: data.certs.slice(0, 6).map(c => c.title),
          datasets: [{ label: "Alumni", data: data.certs.slice(0, 6).map(c => c.count), backgroundColor: THEMES[configs.certs.theme], borderRadius: 6 }]
        })}

        {renderChart("bids", "Recruitment Outcomes", "Current status of alumni market bids", {
          labels: data.bids?.statusDistribution.map(b => b.status),
          datasets: [{ data: data.bids?.statusDistribution.map(b => b.count), backgroundColor: [SEMANTIC_COLORS.significant, SEMANTIC_COLORS.stable, SEMANTIC_COLORS.critical] }]
        })}

        {renderChart("courses", "Post-Grad Engagement", "Popular upskilling courses by enrollment", {
          labels: data.courses.slice(0, 6).map(c => c.course_name),
          datasets: [{ label: "Enrollments", data: data.courses.slice(0, 6).map(c => c.count), backgroundColor: THEMES[configs.courses.theme], borderRadius: 6 }]
        })}

        {renderChart("trends", "Growth Trends", "Monthly data growth and record synchronization", {
          labels: data.trends?.certTrends.map(t => t.year),
          datasets: [{ label: "Synced Records", data: data.trends?.certTrends.map(t => t.count), borderColor: SEMANTIC_COLORS.emerging, tension: 0.4, fill: true, backgroundColor: "rgba(59, 130, 246, 0.05)" }]
        })}

        {renderChart("skills", "Provider Gap Analysis", "Skills availability vs Market demand", {
          labels: data.skills?.certifications.slice(0, 5).map(s => s.organization),
          datasets: [
            { label: "Availability", data: data.skills?.certifications.slice(0, 5).map(s => s.count), borderColor: SEMANTIC_COLORS.stable, backgroundColor: "rgba(16, 185, 129, 0.1)" },
            { label: "Gaps", data: data.skills?.courses.slice(0, 5).map(s => s.count), borderColor: SEMANTIC_COLORS.critical, backgroundColor: "rgba(239, 68, 68, 0.1)" }
          ]
        })}

        {renderChart("employment", "Industry Concentration", "Alumni distribution across companies", {
          labels: data.employment?.byCompany.slice(0, 5).map(e => e.company),
          datasets: [{ data: data.employment?.byCompany.slice(0, 5).map(e => e.count), backgroundColor: THEMES[configs.employment.theme] }]
        })}

        {renderChart("degrees", "Academic Diversity", "Breakdown of degrees held by alumni", {
          labels: data.degrees.slice(0, 5).map(d => d.degree_name),
          datasets: [{ data: data.degrees.slice(0, 5).map(d => d.count), backgroundColor: THEMES[configs.degrees.theme] }]
        })}

        {renderChart("industry", "Skill Demand Index", "Emerging vs Established skill requirements", {
          labels: ["AI/ML", "Cloud", "Fintech", "Health", "Cyber"],
          datasets: [{ label: "Demand", data: [85, 92, 78, 65, 88], backgroundColor: [SEMANTIC_COLORS.emerging, SEMANTIC_COLORS.stable, SEMANTIC_COLORS.significant, SEMANTIC_COLORS.stable, SEMANTIC_COLORS.critical], borderRadius: 6 }]
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-controls { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .controls-right { display: flex; gap: 12px; }
        .stat-card { background: #fff; border: 1px solid var(--border-color); padding: 24px; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 20px; transition: var(--transition); }
        .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card); }
        .stat-icon-neutral { width: 48px; height: 48px; border-radius: 12px; background: #f8fafc; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 1px solid var(--border-color); }
        .stat-value { font-size: 24px; font-weight: 800; color: #1e293b; line-height: 1; }
        .stat-label { font-size: 13px; color: #64748b; font-weight: 500; margin-top: 4px; }
        .chart-actions { display: flex; gap: 8px; align-items: center; }
        .chart-select { padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 11px; font-weight: 600; color: #64748b; background: #fff; cursor: pointer; outline: none; }
        .chart-select:hover { border-color: var(--accent-blue); }

        .filter-bar { background: #fff; border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-lg); display: flex; gap: 24px; align-items: flex-end; margin-bottom: 32px; }
        .filter-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .filter-group label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .filter-group input { padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 14px; outline: none; transition: 0.2s; }
        .filter-group input:focus { border-color: var(--accent-blue); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .filter-actions { display: flex; gap: 10px; }
        .btn-filter-apply { background: #1e293b; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-filter-apply:hover { background: #0f172a; }
        .btn-filter-clear { background: #f1f5f9; color: #64748b; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-filter-clear:hover { background: #e2e8f0; color: #1e293b; }
      ` }} />
    </DashboardLayout>
  );
}

export default Dashboard;