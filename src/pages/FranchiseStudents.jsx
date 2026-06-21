// src/pages/FranchiseStudents.jsx
import { useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

// Sidebar for Franchise Panel
export function FranchiseSidebar() {
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
      <div className="offcanvas-body vh-100 d-flex flex-column p-3" style={{ overflowY: "auto" }}>
      <div className="mb-4 d-none d-md-block">
        <h2 className="fs-5 fw-bold mb-1 text-primary">Franchise Panel</h2>
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
                  Create Certificate
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/certificates" end className={subLinkClass}>
                  View Certificates
                </NavLink>
              </li>
              <li className="mb-1"><hr className="my-2" /></li>
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

        {/* ID Cards */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("idcards")}
          >
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-person-badge"></i>
              ID Cards
            </span>
            <i className={`bi ${openMenu === "idcards" ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
          </button>
          {openMenu === "idcards" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/franchise/id-cards/create" className={subLinkClass}>
                  Create ID Card
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/id-cards" end className={subLinkClass}>
                  View ID Cards
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Admit Cards */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("admitcards")}
          >
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-card-list"></i>
              Admit Cards
            </span>
            <i className={`bi ${openMenu === "admitcards" ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
          </button>
          {openMenu === "admitcards" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/franchise/admit-cards/create" className={subLinkClass}>
                  Create Admit Card
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/admit-cards" end className={subLinkClass}>
                  View Admit Cards
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Marksheets */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("marksheets")}
          >
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-text"></i>
              Marksheets
            </span>
            <i className={`bi ${openMenu === "marksheets" ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
          </button>
          {openMenu === "marksheets" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/franchise/marksheets/create" className={subLinkClass}>
                  Create Marksheet
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/marksheets" end className={subLinkClass}>
                  View Marksheets
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Fee Receipts */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("receipts")}
          >
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-receipt"></i>
              Fee Receipts
            </span>
            <i className={`bi ${openMenu === "receipts" ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
          </button>
          {openMenu === "receipts" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/franchise/receipts/create" className={subLinkClass}>
                  Create Receipt
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/receipts" end className={subLinkClass}>
                  View Receipts
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

// Reusable layout wrapper — use this on every franchise page
export function FranchiseLayout({ children }) {
  return (
    <div className="d-flex min-vh-100">
      <FranchiseSidebar />
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="container-fluid p-4">
          <button
            type="button"
            className="btn btn-outline-secondary d-md-none mb-3"
            data-bs-toggle="offcanvas"
            data-bs-target="#franchiseSidebar"
            aria-controls="franchiseSidebar"
            aria-label="Toggle sidebar"
          >
            <i className="bi bi-list me-1"></i> Menu
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function FranchiseStudents() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");


  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/franchise/students");
      const data = res.data;
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];
      setStudents(arr);
    } catch (err) {
      console.error("fetchStudents:", err);
      setError(err.userMessage || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await API.delete(`/franchise/students/${id}`);
      setStudents((prev) => prev.filter((s) => (s._id || s.id) !== id));
    } catch (err) {
      console.error("delete student:", err);
      setError(err.userMessage || "Failed to delete student");
    }
  };

  const filteredStudents = students.filter((student) => {
    const q = search.toLowerCase();
    return (
      (student.name?.toLowerCase() || "").includes(q) ||
      (student.rollNumber?.toLowerCase() || "").includes(q) ||
      (student.enrollmentNo?.toLowerCase() || "").includes(q) ||
      (student.mobile?.toLowerCase() || "").includes(q) ||
      (student.email?.toLowerCase() || "").includes(q)
    );
  });

  return (
    <FranchiseLayout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0">Students</h2>
          <small className="text-muted">Manage your franchise students</small>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/franchise/students/add")}
        >
          + Add Student
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")} aria-label="Close"></button>
        </div>
      )}

      {/* Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, roll number, mobile, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status" />
              <p className="mt-2">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No students found.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/franchise/students/add")}
              >
                Add Your First Student
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Roll No.</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Fees Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const id = student._id || student.id;
                    const feeDetails =
                      student.courses && Array.isArray(student.courses) && student.courses.length > 0
                        ? {
                            fee: student.courses.reduce((sum, c) => sum + (Number(c.feeAmount) || 0), 0),
                            paid: student.courses.reduce((sum, c) => sum + (Number(c.amountPaid) || 0), 0),
                          }
                        : {
                            fee: Number(student.feeAmount) || 0,
                            paid: Number(student.amountPaid) || 0,
                          };
                    const pending = feeDetails.fee - feeDetails.paid;

                    return (
                      <tr key={id}>
                        <td>{student.rollNumber || "—"}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {student.photo && (
                              <img
                                src={student.photo}
                                alt=""
                                className="rounded-circle"
                                style={{ width: "32px", height: "32px", objectFit: "cover" }}
                              />
                            )}
                            <div>
                              <div className="fw-semibold">{student.name}</div>
                              {student.fatherName && (
                                <small className="text-muted">S/o {student.fatherName}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{student.mobile || "—"}</td>
                        <td>{student.email || "—"}</td>
                        <td>
                          {student.courseName ||
                            (student.courses && student.courses[0]?.courseName) ||
                            "—"}
                        </td>
                        <td>
                          <span className={`badge ${pending > 0 ? "bg-danger" : "bg-success"}`}>
                            {pending > 0 ? `₹${pending} Due` : "Paid"}
                          </span>
                        </td>
                        <td>
                          {student.joinDate || student.createdAt
                            ? new Date(student.joinDate || student.createdAt).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                             <button
                               className="btn btn-sm btn-outline-info"
                               onClick={() => navigate(`/franchise/students/view/${id}`)}
                               title="View"
                             >
                               <i className="bi bi-eye"></i>
                             </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/franchise/students/edit/${id}`)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(id)}
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


    </FranchiseLayout>
  );
}