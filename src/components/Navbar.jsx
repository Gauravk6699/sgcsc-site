import { NavLink, useNavigate } from "react-router-dom";
import CreditBadge from "./CreditBadge";

export default function Navbar() {
  const navigate = useNavigate();

  const studentToken = localStorage.getItem("student_token");
  const franchiseToken = localStorage.getItem("franchise_token");
  const role = localStorage.getItem("user_role"); // "student" | "franchise"

  const isLoggedIn = !!studentToken || !!franchiseToken;

  // Fallback avatar generator (safe, free, no backend)
const getFallbackAvatar = (seed = "user") =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;


  const profileImage =
  localStorage.getItem("profile_image") ||
  getFallbackAvatar(role || "user");


  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const profileLink =
    role === "student"
      ? "/student/profile"
      : role === "franchise"
      ? "/franchise/profile"
      : "/login";

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        {/* Logo */}
        <NavLink className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <img src="/logo.jpeg" alt="SGCSC Logo" height="50" />
          <div className="d-flex flex-column lh-1">
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.04em', color: '#f59e0b' }}>
              S.G.C.S.C
            </span>
            <span style={{ fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' }}>
              Shree Ganpati Computer And Study Centre
            </span>
          </div>
        </NavLink>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">

            {/* Dashboard - Only shown for logged in franchise users */}
            {role === "franchise" ? (
              <li className="nav-item">
                <NavLink className="nav-link" to="/franchise/dashboard">Dashboard</NavLink>
              </li>
            ) : (
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Home</NavLink>
              </li>
            )}

            {/* About Company - Hidden for franchise users */}
            {role !== "franchise" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/about">About Company</NavLink>
              </li>
            )}

            {/* Courses - Hidden for franchise users */}
            {role !== "franchise" && (
              <li className="nav-item dropdown">
                <span className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                  Our Courses
                </span>
                <ul className="dropdown-menu">
                  <li><NavLink className="dropdown-item" to="/long-term-courses">Long Term Courses</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/short-term-courses">Short Term Courses</NavLink></li>
                  <li><NavLink className="dropdown-item" to="/certificate-courses">Certificate Courses</NavLink></li>
                </ul>
              </li>
            )}

            {/* Franchise - Hidden for franchise users (they see dashboard instead) */}
            {(!role || role === "franchise") && role !== "franchise" && (
              <li className="nav-item dropdown">
                <span className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                  Franchise
                </span>
                <ul className="dropdown-menu">
                  {!franchiseToken && (
                    <li>
                      <NavLink className="dropdown-item" to="/franchise-registration">
                        Franchise Registration
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <NavLink className="dropdown-item" to="/franchise-verification">
                      Franchise Verification
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/study-centers">
                      Franchise List
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}

            {/* Student - Hidden for franchise users */}
            {(!role || role === "student") && role !== "franchise" && (
              <li className="nav-item dropdown">
                <span className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                  Student
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink
                      className="dropdown-item"
                      to="/student/enrollment-verification"
                    >
                      Enrollment Verification
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className="dropdown-item"
                      to="/student/result-verification"
                    >
                      Result Verification
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className="dropdown-item"
                      to="/student/certificate-verification"
                    >
                      Certificate Verification
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}


            {/* Gallery - Hidden for franchise users */}
            {role !== "franchise" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/gallery">Gallery</NavLink>
              </li>
            )}

            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">Contact</NavLink>
            </li>

            {/* RIGHT SIDE AUTH */}
            {!isLoggedIn && (
              <NavLink to="/login" className="btn btn-primary ms-lg-3 mt-2 mt-lg-0 w-100 w-lg-auto">
                Login
              </NavLink>
            )}

            {/* Credit Badge for Franchise Users */}
            {role === "franchise" && <div className="ms-3"><CreditBadge /></div>}

            {isLoggedIn && (
              <div className="dropdown ms-3">
                <img
                  src={profileImage}
                  alt="Profile"
                  width="32"
                  height="32"
                  className="rounded-circle dropdown-toggle border"
                  style={{ cursor: "pointer", objectFit: "cover" }}
                  data-bs-toggle="dropdown"
                  onError={(e) => {
                    e.target.src = getFallbackAvatar(role);
                  }}
                />

                <ul className="dropdown-menu dropdown-menu-end">
                  {role === "franchise" && (
                    <li>
                      <NavLink className="dropdown-item" to="/franchise/dashboard">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <NavLink className="dropdown-item" to={profileLink}>
                      My Profile
                    </NavLink>
                  </li>
                  {role === "student" && (
                    <li>
                      <NavLink className="dropdown-item" to="/student/results">
                        <i className="bi bi-bar-chart-line me-2"></i>
                        My Results & Marksheet
                      </NavLink>
                    </li>
                  )}
                  {role === "franchise" && (
                    <li>
                      <NavLink className="dropdown-item" to="/franchise/credits">
                        <i className="bi bi-credit-card-2-front me-2"></i>
                        My Credits
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}


          </ul>
        </div>
      </div>
    </nav>
  );
}
