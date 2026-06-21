import { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const transactionTypeBadge = (type) => {
  const styles = {
    topup: { bg: "bg-success", icon: "bi-arrow-up-circle", label: "Top-up" },
    deduction: { bg: "bg-danger", icon: "bi-arrow-down-circle", label: "Deduction" },
  };
  const style = styles[type] || { bg: "bg-secondary", icon: "bi-circle", label: type };
  return (
    <span className={`badge ${style.bg} d-flex align-items-center gap-1 w-fit`}>
      <i className={`bi ${style.icon}`}></i>
      {style.label}
    </span>
  );
};

function StatCard({ icon, label, value, color, loading }) {
  const colorClasses = {
    primary: "bg-primary bg-opacity-10 text-primary",
    success: "bg-success bg-opacity-10 text-success",
    info: "bg-info bg-opacity-10 text-info",
    warning: "bg-warning bg-opacity-10 text-warning",
    danger: "bg-danger bg-opacity-10 text-danger",
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center p-4">
        <div className={`rounded-circle p-3 me-3 ${colorClasses[color] || colorClasses.primary}`}>
          <i className={`bi ${icon} fs-4`}></i>
        </div>
        <div>
          <h6 className="text-muted mb-1">{label}</h6>
          <h4 className="mb-0 fw-bold">{loading ? "—" : value}</h4>
        </div>
      </div>
    </div>
  );
}

export default function FranchiseDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [franchise, setFranchise] = useState(null);
  const [credits, setCredits] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ students: 0, courses: 0, results: 0, certificates: 0 });

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, creditsRes, transactionsRes] = await Promise.allSettled([
        API.get("/franchise-profile/me"),
        API.get("/credits/my-credits"),
        API.get("/credits/my-transactions?limit=5"),
      ]);

      if (profileRes.status === "fulfilled")
        setFranchise(profileRes.value.data?.data || profileRes.value.data);

      if (creditsRes.status === "fulfilled")
        setCredits(creditsRes.value.data?.data || null);

      if (transactionsRes.status === "fulfilled")
        setTransactions(transactionsRes.value.data?.data?.transactions || []);

      setStats({ students: 0, courses: 0, results: 0, certificates: 0 });
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Some dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const creditBalance = credits?.credits || 0;
  const showLowCreditWarning = creditBalance < 20 && creditBalance > 0;
  const showNoCreditWarning = creditBalance <= 0;

// Sidebar for Franchise Panel
function Sidebar({ franchise }) {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const mainLinkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-2 ${
      isActive ? "active bg-primary text-white" : "text-dark"
    } rounded py-2`;

  const subLinkClass = ({ isActive }) =>
    `nav-link small d-flex align-items-center ${
      isActive ? "text-primary fw-semibold" : "text-dark"
    } py-1`;

  const handleLogout = () => {
    localStorage.removeItem("franchise_token");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  return (
    <div
      className="offcanvas-md offcanvas-start bg-light border-end"
      tabIndex="-1"
      id="franchiseSidebar"
      style={{ width: "260px" }}
    >
      <div className="offcanvas-header d-md-none">
        <h2 className="offcanvas-title fs-5 fw-bold text-primary">Franchise Panel</h2>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          data-bs-target="#franchiseSidebar"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body vh-100 d-flex flex-column p-3">
      <div className="mb-4 d-none d-md-block">
        <h2 className="fs-5 fw-bold mb-1 text-primary">Franchise Panel</h2>
        <p className="small text-muted mb-0 text-truncate" title={franchise?.instituteName}>
          {franchise?.instituteName || "Loading..."}
        </p>
      </div>

      <ul className="nav nav-pills flex-column mb-auto">
        {/* Dashboard */}
        <li className="nav-item mb-2">
          <NavLink to="/franchise/dashboard" className={mainLinkClass}>
            <i className="bi bi-house-door"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>

        {/* Students */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("students")}
          >
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-people"></i>
              Students
            </span>
            <i className={`bi ${openMenu === "students" ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
          </button>
          {openMenu === "students" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/franchise/students/add" className={subLinkClass}>
                  Add Student
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/students" end className={subLinkClass}>
                  View Students
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Courses */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("courses")}
          >
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-book"></i>
              Courses
            </span>
            <i className={`bi ${openMenu === "courses" ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
          </button>
          {openMenu === "courses" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/franchise/courses/create" className={subLinkClass}>
                  Create Course
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/courses" end className={subLinkClass}>
                  View Courses
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Subjects */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("subjects")}
          >
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-journal-text"></i>
              Subjects
            </span>
            <i className={`bi ${openMenu === "subjects" ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
          </button>
          {openMenu === "subjects" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/franchise/subjects/create" className={subLinkClass}>
                  Create Subject
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/subjects" end className={subLinkClass}>
                  View Subjects
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Results */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("results")}
          >
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-clipboard-check"></i>
              Results
            </span>
            <i className={`bi ${openMenu === "results" ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
          </button>
          {openMenu === "results" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/franchise/results/add" className={subLinkClass}>
                  Add Result
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/results" end className={subLinkClass}>
                  View Results
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Certificates */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("certificates")}
          >
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-award"></i>
              Certificates
            </span>
            <i className={`bi ${openMenu === "certificates" ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
          </button>
          {openMenu === "certificates" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/franchise/certificates/create" className={subLinkClass}>
                  Student Certificates
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/certificates" end className={subLinkClass}>
                  View Student Certificates
                </NavLink>
              </li>
              <li className="mb-1">
                <hr className="my-2" />
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/franchise-certificates/create" className={subLinkClass}>
                  Franchise Certificates
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/franchise-certificates" end className={subLinkClass}>
                  View Franchise Certificates
                </NavLink>
              </li>
              <li className="mb-1">
                <hr className="my-2" />
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/typing-certificates/create" className={subLinkClass}>
                  Typing Certificates
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/typing-certificates" end className={subLinkClass}>
                  View Typing Certificates
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* My Credits */}
        <li className="nav-item mb-2">
          <NavLink to="/franchise/credits" className={mainLinkClass}>
            <i className="bi bi-credit-card-2-front"></i>
            <span>My Credits</span>
          </NavLink>
        </li>

        {/* My Profile */}
        <li className="nav-item mb-2">
          <NavLink to="/franchise/profile" className={mainLinkClass}>
            <i className="bi bi-person"></i>
            <span>My Profile</span>
          </NavLink>
        </li>
      </ul>

      {/* Logout */}
      <div className="mt-auto pt-3 border-top">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          Logout
        </button>
      </div>
      </div>
    </div>
  );
}

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <Sidebar franchise={franchise} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light min-vh-100" style={{ minWidth: 0 }}>
        <div className="container-fluid p-4">

          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="d-flex align-items-start gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary d-md-none"
                data-bs-toggle="offcanvas"
                data-bs-target="#franchiseSidebar"
                aria-controls="franchiseSidebar"
                aria-label="Toggle sidebar"
              >
                <i className="bi bi-list"></i>
              </button>
              <div>
                <h1 className="h3 mb-1">Franchise Dashboard</h1>
                <p className="text-muted mb-0">
                  Welcome back,{" "}
                  <strong>{franchise?.instituteName || franchise?.ownerName || "Franchise"}</strong>
                </p>
              </div>
            </div>
            <button
              className="btn btn-outline-secondary"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError("")} aria-label="Close"></button>
            </div>
          )}

          {showNoCreditWarning && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div>
                <strong>Out of Credits!</strong> You have no credits remaining.{" "}
                <NavLink to="/franchise/credits" className="alert-link">Top up now</NavLink>{" "}
                to continue using services.
              </div>
            </div>
          )}

          {showLowCreditWarning && (
            <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
              <i className="bi bi-info-circle-fill me-2 fs-5"></i>
              <div>
                <strong>Low Credit Warning!</strong> You only have {creditBalance} credits left.{" "}
                <NavLink to="/franchise/credits" className="alert-link">Top up now</NavLink>{" "}
                to avoid service interruption.
              </div>
            </div>
          )}

          {/* Credit Balance Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className={`rounded-circle p-3 me-3 ${creditBalance < 20 ? "bg-danger bg-opacity-10" : "bg-success bg-opacity-10"}`}>
                      <i className={`bi bi-wallet2 fs-3 ${creditBalance < 20 ? "text-danger" : "text-success"}`}></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Credit Balance</h6>
                      <h3 className={`mb-0 ${creditBalance < 20 ? "text-danger" : "text-success"}`}>
                        {loading ? "—" : creditBalance}
                        <small className="fs-6 text-muted ms-1">credits</small>
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 text-md-end mt-3 mt-md-0">
                  <NavLink to="/franchise/credits" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>Top Up Credits
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="row g-4 mb-4">
            {[
              { icon: "bi-people", label: "Total Students", value: stats.students, color: "primary" },
              { icon: "bi-book", label: "Total Courses", value: stats.courses, color: "info" },
              { icon: "bi-clipboard-check", label: "Total Results", value: stats.results, color: "warning" },
              { icon: "bi-award", label: "Total Certificates", value: stats.certificates, color: "success" },
            ].map((s) => (
              <div key={s.label} className="col-12 col-md-6 col-lg-3">
                <StatCard {...s} loading={loading} />
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2 text-primary"></i>Recent Activity
              </h5>
              <NavLink to="/franchise/credits" className="btn btn-sm btn-outline-primary">View All</NavLink>
            </div>
            <div className="card-body p-0">
              {transactions.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-inbox fs-2 mb-2 d-block"></i>
                  <p className="mb-0">No recent transactions</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th><th>Type</th><th>Description</th>
                        <th className="text-end">Amount</th><th className="text-end">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((tx) => (
                        <tr key={tx._id}>
                          <td>{formatDate(tx.createdAt)}</td>
                          <td>{transactionTypeBadge(tx.type)}</td>
                          <td>{tx.description || "—"}</td>
                          <td className="text-end">
                            <span className={`fw-semibold ${tx.type === "topup" ? "text-success" : "text-danger"}`}>
                              {tx.type === "topup" ? "+" : "-"}{tx.amount}
                            </span>
                          </td>
                          <td className="text-end"><span className="text-muted">{tx.balanceAfter}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row g-4 mt-2">
            <div className="col-12"><h5 className="mb-3">Quick Actions</h5></div>
            {[
              { to: "/franchise/students/add", icon: "bi-person-plus", color: "text-primary", label: "Add Student" },
              { to: "/franchise/results/add", icon: "bi-clipboard-plus", color: "text-warning", label: "Add Result" },
              { to: "/franchise/certificates/create", icon: "bi-award", color: "text-success", label: "Create Certificate" },
              { to: "/franchise/profile", icon: "bi-person-circle", color: "text-info", label: "View Profile" },
            ].map((action) => (
              <div key={action.to} className="col-6 col-md-3">
                <NavLink to={action.to} className="card text-decoration-none border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <i className={`bi ${action.icon} fs-2 ${action.color} mb-2`}></i>
                    <h6 className="mb-0">{action.label}</h6>
                  </div>
                </NavLink>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}