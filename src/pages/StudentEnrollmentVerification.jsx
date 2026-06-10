import { useState, useEffect } from "react";
import API from "../api/axiosInstance";

export default function StudentEnrollmentVerification() {
  const [activeTab, setActiveTab] = useState("enrollment");

  // Enrollment state
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [dob, setDob] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // My certificates state (logged-in only)
  const [certPreviewUrls, setCertPreviewUrls] = useState({});
  const [certDownloading, setCertDownloading] = useState({});

  const studentToken = localStorage.getItem("student_token");
  const isLoggedIn = !!studentToken;
  const [myEnrollment, setMyEnrollment] = useState(null);
  const [loadingMyEnrollment, setLoadingMyEnrollment] = useState(false);
  const [myCertificates, setMyCertificates] = useState([]);
  const [loadingMyCertificates, setLoadingMyCertificates] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMyEnrollment();
      fetchMyCertificates();
    }
  }, [isLoggedIn]);

  const fetchMyEnrollment = async () => {
    setLoadingMyEnrollment(true);
    try {
      const res = await API.get("/student-profile/enrollment");
      if (res.data.success) setMyEnrollment(res.data.data);
    } catch (err) {
      console.error("Failed to fetch enrollment:", err);
    } finally {
      setLoadingMyEnrollment(false);
    }
  };

  const fetchMyCertificates = async () => {
    setLoadingMyCertificates(true);
    try {
      const res = await API.get("/student-profile/certificate");
      if (res.data.success) {
        const data = res.data.data;
        setMyCertificates(Array.isArray(data) ? data : [data]);
      }
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    } finally {
      setLoadingMyCertificates(false);
    }
  };

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await API.post("/public/enrollment", { enrollmentNo, dob });
      setResult(res.data.data);
    } catch {
      setError("No record found. Please check your enrollment number and date of birth.");
    } finally {
      setLoading(false);
    }
  };

  // Build data object for student CertificateGenerator
  const buildStudentCertData = (cert) => ({
    studentNameCombined: cert.name || "",
    courseName: cert.courseName || "",
    grade: cert.grade || "",
    courseDuration: cert.courseDuration || "",
    coursePeriodFrom: cert.coursePeriodFrom || "",
    coursePeriodTo: cert.coursePeriodTo || "",
    certificateNumber: cert.certificateNumber || "",
    dateOfIssue: cert.issueDate || "",
    photo: cert.photo || "",
    centerName: cert.centerName || cert.atcName || "",
  });

  // Build data object for TypingCertificateGenerator — fields match the model
  const buildTypingCertData = (cert) => ({
    studentName:       cert.studentName       || "",
    fatherHusbandName: cert.fatherHusbandName || "",
    motherName:        cert.motherName        || "",
    enrollmentNumber:  cert.enrollmentNumber  || "",
    computerTyping:    cert.computerTyping    || "",
    certificateNo:     cert.certificateNo     || "",
    dateOfIssue:       cert.dateOfIssue       || "",
    sessionFrom:       cert.sessionFrom       || "",
    sessionTo:         cert.sessionTo         || "",
    grade:             cert.grade             || "",
    studyCentre:       cert.studyCentre       || "",
    wordsPerMinute:    cert.wordsPerMinute    || "",
    photo:             cert.photo             || "",
  });

  const downloadCertPDF = async (cert, idx) => {
    if (cert.certType === "typing") {
      if (!window.TypingCertificateGenerator) {
        alert("Typing certificate generator not loaded. Please refresh the page.");
        return;
      }
      setCertDownloading((prev) => ({ ...prev, [idx]: true }));
      try {
        await window.TypingCertificateGenerator.loadTemplate("/typing-certificate-template.jpeg");
        await window.TypingCertificateGenerator.download(buildTypingCertData(cert));
      } catch (err) {
        console.error("Typing certificate download error:", err);
        alert("Failed to generate typing certificate PDF.");
      } finally {
        setCertDownloading((prev) => ({ ...prev, [idx]: false }));
      }
    } else {
      if (!window.CertificateGenerator) {
        alert("Certificate generator not loaded. Please refresh the page.");
        return;
      }
      setCertDownloading((prev) => ({ ...prev, [idx]: true }));
      try {
        await window.CertificateGenerator.loadTemplate("/student-certificate-template.jpeg");
        await window.CertificateGenerator.download(buildStudentCertData(cert));
      } catch (err) {
        console.error("Certificate download error:", err);
        alert("Failed to generate certificate PDF.");
      } finally {
        setCertDownloading((prev) => ({ ...prev, [idx]: false }));
      }
    }
  };

  const renderCertPreview = async (cert, idx, setUrls) => {
    if (!setUrls) setUrls = setCertPreviewUrls;
    if (cert.certType === "typing") {
      if (!window.TypingCertificateGenerator) return;
      try {
        await window.TypingCertificateGenerator.loadTemplate("/typing-certificate-template.jpeg");
        const url = await window.TypingCertificateGenerator.getDataURL(buildTypingCertData(cert));
        setUrls((prev) => ({ ...prev, [idx]: url }));
      } catch (err) {
        console.error("Typing cert preview error:", err);
      }
    } else {
      if (!window.CertificateGenerator) return;
      try {
        await window.CertificateGenerator.loadTemplate("/student-certificate-template.jpeg");
        const url = await window.CertificateGenerator.preview(buildStudentCertData(cert));
        setUrls((prev) => ({ ...prev, [idx]: url }));
      } catch (err) {
        console.error("Certificate preview error:", err);
      }
    }
  };

  // ── Logged-in student view ──────────────────────────────────────────────────
  if (isLoggedIn) {
    return (
      <div className="container py-5">
        <h2 className="text-center mb-4">Student Portal</h2>
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "enrollment" ? "active" : ""}`}
              onClick={() => setActiveTab("enrollment")}
            >
              <i className="bi bi-person-badge me-2"></i>My Enrollment
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "certificate" ? "active" : ""}`}
              onClick={() => setActiveTab("certificate")}
            >
              <i className="bi bi-award me-2"></i>My Certificates
            </button>
          </li>
        </ul>

        {activeTab === "enrollment" && (
          loadingMyEnrollment ? (
            <p className="text-center">Loading...</p>
          ) : myEnrollment ? (
            <EnrollmentDetails student={myEnrollment} />
          ) : (
            <div className="alert alert-warning">Unable to load enrollment details. Please contact your center.</div>
          )
        )}

        {activeTab === "certificate" && (
          loadingMyCertificates ? (
            <p className="text-center">Loading...</p>
          ) : myCertificates.length > 0 ? (
            <div>
              {myCertificates.map((cert, idx) => (
                <CertificateCard
                  key={idx}
                  cert={cert}
                  idx={idx}
                  downloading={certDownloading[idx]}
                  previewUrl={certPreviewUrls[idx]}
                  onDownload={() => downloadCertPDF(cert, idx)}
                  onPreview={() => renderCertPreview(cert, idx, setCertPreviewUrls)}
                />
              ))}
            </div>
          ) : (
            <div className="alert alert-warning">No certificates found. Please contact your center.</div>
          )
        )}
      </div>
    );
  }

  // ── Public verification ────────────────────────────────────────────────────
  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Enrollment Verification</h2>

      <h4 className="mb-3">Verify Your Enrollment</h4>
      <p className="text-muted mb-4">
        Enter your enrollment number to verify your enrollment details.
      </p>

      <form onSubmit={handleEnrollmentSubmit} className="card p-4 mx-auto" style={{ maxWidth: 500 }}>
        <div className="mb-3">
          <label className="form-label">Enrollment Number / Roll Number</label>
          <input
            className="form-control"
            placeholder="e.g. SG124368"
            value={enrollmentNo}
            onChange={(e) => setEnrollmentNo(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Date of Birth <span className="text-muted small">(optional, for extra verification)</span></label>
          <input
            type="date"
            className="form-control"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && (
        <div className="alert alert-danger mt-3 mx-auto" style={{ maxWidth: 500 }}>
          {error}
        </div>
      )}
      {result && <EnrollmentDetails student={result} />}
    </div>
  );
}

// ── Enrollment Details Card ─────────────────────────────────────────────────
function EnrollmentDetails({ student }) {
  const fmt = (date) => (date ? new Date(date).toLocaleDateString("en-IN") : "-");
  const pending = (student.feeAmount || 0) - (student.amountPaid || 0);

  return (
    <div className="card shadow-sm mt-4 mx-auto" style={{ maxWidth: 900 }}>
      <div className="card-header bg-primary text-white d-flex align-items-center gap-2">
        {student.photo && (
          <img
            src={student.photo}
            alt="Student"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid white",
            }}
          />
        )}
        <div>
          <h5 className="mb-0">{student.name}</h5>
          <small>Enrollment No: {student.enrollmentNo || student.rollNumber || "-"}</small>
        </div>
        <span
          className={`ms-auto badge ${student.isCertified ? "bg-success" : "bg-light text-dark"}`}
        >
          {student.isCertified ? "Certified" : "Enrolled"}
        </span>
      </div>

      <div className="card-body">
        <div className="row">
          {/* Personal Information */}
          <div className="col-md-6 mb-4">
            <h6 className="border-bottom pb-2 mb-3 text-primary">Personal Information</h6>
            <p className="mb-1"><strong>Name:</strong> {student.name || "-"}</p>
            <p className="mb-1"><strong>Father's Name:</strong> {student.fatherName || "-"}</p>
            <p className="mb-1"><strong>Mother's Name:</strong> {student.motherName || "-"}</p>
            <p className="mb-1"><strong>Gender:</strong> {student.gender || "-"}</p>
            <p className="mb-1"><strong>Date of Birth:</strong> {fmt(student.dob)}</p>
          </div>

          {/* Contact Information */}
          <div className="col-md-6 mb-4">
            <h6 className="border-bottom pb-2 mb-3 text-primary">Contact Information</h6>
            <p className="mb-1"><strong>Email:</strong> {student.email || "-"}</p>
            <p className="mb-1"><strong>Mobile:</strong> {student.mobile || "-"}</p>
            <p className="mb-1"><strong>State:</strong> {student.state || "-"}</p>
            <p className="mb-1"><strong>District:</strong> {student.district || "-"}</p>
            <p className="mb-1"><strong>Address:</strong> {student.address || "-"}</p>
          </div>

          {/* Academic Information */}
          <div className="col-md-6 mb-4">
            <h6 className="border-bottom pb-2 mb-3 text-primary">Academic Information</h6>
            <p className="mb-1"><strong>Roll Number:</strong> {student.rollNumber || "-"}</p>
            <p className="mb-1"><strong>Enrollment No:</strong> {student.enrollmentNo || "-"}</p>
            <p className="mb-1"><strong>Exam Passed:</strong> {student.examPassed || "-"}</p>
            <p className="mb-1"><strong>Board:</strong> {student.board || "-"}</p>
            <p className="mb-1"><strong>Marks/Grade:</strong> {student.marksOrGrade || "-"}</p>
          </div>

          {/* Fee Details */}
          <div className="col-md-6 mb-4">
            <h6 className="border-bottom pb-2 mb-3 text-primary">Fee Details</h6>
            <p className="mb-1"><strong>Total Fee:</strong> ₹{student.feeAmount || 0}</p>
            <p className="mb-1"><strong>Amount Paid:</strong> ₹{student.amountPaid || 0}</p>
            <p className="mb-1">
              <strong>Pending:</strong>{" "}
              <span className={`badge ${pending > 0 ? "bg-danger" : "bg-success"}`}>₹{pending}</span>
            </p>
            <p className="mb-1">
              <strong>Fees Paid:</strong>{" "}
              <span className={`badge ${student.feesPaid ? "bg-success" : "bg-warning text-dark"}`}>
                {student.feesPaid ? "Yes" : "Partial / No"}
              </span>
            </p>
          </div>

          {/* Enrolled Courses */}
          <div className="col-12 mb-4">
            <h6 className="border-bottom pb-2 mb-3 text-primary">Enrolled Courses</h6>
            {student.courses && student.courses.length > 0 ? (
              <div className="row">
                {student.courses.map((c, i) => {
                  const cp = (c.feeAmount || 0) - (c.amountPaid || 0);
                  return (
                    <div key={i} className="col-md-6 mb-3">
                      <div className="card border">
                        <div className="card-body p-3">
                          <h6 className="card-title mb-2">{c.courseName || `Course ${i + 1}`}</h6>
                          <p className="mb-1 small">
                            <strong>Session:</strong>{" "}
                            {c.sessionStart ? fmt(c.sessionStart) : "-"} –{" "}
                            {c.sessionEnd ? fmt(c.sessionEnd) : "-"}
                          </p>
                          <p className="mb-1 small"><strong>Fee:</strong> ₹{c.feeAmount || 0}</p>
                          <p className="mb-1 small"><strong>Paid:</strong> ₹{c.amountPaid || 0}</p>
                          <p className="mb-0 small">
                            <strong>Pending:</strong>{" "}
                            <span className={`badge ${cp > 0 ? "bg-danger" : "bg-success"}`}>₹{cp}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : student.courseName ? (
              // Single-course student: show course card from top-level fields
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="card border">
                    <div className="card-body p-3">
                      <h6 className="card-title mb-2">{student.courseName}</h6>
                      <p className="mb-1 small">
                        <strong>Session:</strong>{" "}
                        {student.sessionStart ? fmt(student.sessionStart) : "-"} –{" "}
                        {student.sessionEnd ? fmt(student.sessionEnd) : "-"}
                      </p>
                      <p className="mb-1 small"><strong>Fee:</strong> ₹{student.feeAmount || 0}</p>
                      <p className="mb-1 small"><strong>Paid:</strong> ₹{student.amountPaid || 0}</p>
                      <p className="mb-0 small">
                        <strong>Pending:</strong>{" "}
                        <span className={`badge ${pending > 0 ? "bg-danger" : "bg-success"}`}>₹{pending}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted small">No course information available.</p>
            )}
          </div>

          {/* Center Information */}
          <div className="col-12">
            <h6 className="border-bottom pb-2 mb-3 text-primary">Center Information</h6>
            <p className="mb-1"><strong>Center:</strong> {student.centerName || "-"}</p>
            {student.joinDate && (
              <p className="mb-1">
                <strong>Join Date:</strong> {new Date(student.joinDate).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Certificate Card ────────────────────────────────────────────────────────
function CertificateCard({ cert, idx, downloading, previewUrl, onDownload, onPreview }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    if (!expanded) onPreview();
    setExpanded((v) => !v);
  };

  const isTyping = cert.certType === "typing";

  // Use stored image if available, otherwise fall back to canvas-generated preview
  const imageToShow = cert.certificateImage || previewUrl;

  const title = isTyping
    ? cert.computerTyping || `Typing Certificate ${idx + 1}`
    : cert.courseName || `Certificate ${idx + 1}`;

  const certNo = isTyping ? cert.certificateNo : cert.certificateNumber;

  return (
    <div className="card shadow-sm mb-4 mx-auto" style={{ maxWidth: 800 }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <i className={`bi ${isTyping ? "bi-keyboard me-2 text-info" : "bi-award-fill me-2 text-warning"}`}></i>
          <strong>{title}</strong>
          <span className="ms-2 text-muted small">#{certNo}</span>
          <span className={`ms-2 badge ${isTyping ? "bg-info text-dark" : "bg-warning text-dark"}`}>
            {isTyping ? "Typing Certificate" : "Student Certificate"}
          </span>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={handleExpand}>
            <i className={`bi bi-${expanded ? "eye-slash" : "eye"} me-1`}></i>
            {expanded ? "Hide" : "View"}
          </button>
          <button className="btn btn-sm btn-primary" onClick={onDownload} disabled={downloading}>
            {downloading ? (
              <><span className="spinner-border spinner-border-sm me-1"></span>Generating...</>
            ) : (
              <><i className="bi bi-download me-1"></i>Download PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Certificate image */}
      {expanded && (
        <div className="card-body p-2 text-center bg-light">
          {imageToShow ? (
            <img
              src={imageToShow}
              alt={`Certificate ${certNo}`}
              style={{ maxWidth: "100%", borderRadius: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
            />
          ) : (
            <div className="py-4 text-muted">
              <div className="spinner-border spinner-border-sm me-2"></div>
              Generating preview...
            </div>
          )}
        </div>
      )}

      {/* Details */}
      <div className="card-body">
        {isTyping ? (
          <div className="row g-2">
            <div className="col-sm-6">
              <p className="mb-1"><strong>Name:</strong> {cert.studentName || "-"}</p>
              <p className="mb-1"><strong>Father/Husband:</strong> {cert.fatherHusbandName || "-"}</p>
              <p className="mb-1"><strong>Mother's Name:</strong> {cert.motherName || "-"}</p>
              <p className="mb-1"><strong>Enrollment No:</strong> {cert.enrollmentNumber || "-"}</p>
            </div>
            <div className="col-sm-6">
              <p className="mb-1"><strong>Computer Typing:</strong> {cert.computerTyping || "-"}</p>
              <p className="mb-1"><strong>Words/Min:</strong> {cert.wordsPerMinute || "-"}</p>
              <p className="mb-1">
                <strong>Grade:</strong>{" "}
                <span className="badge bg-success">{cert.grade || "-"}</span>
              </p>
              <p className="mb-1">
                <strong>Session:</strong> {cert.sessionFrom || "-"} – {cert.sessionTo || "-"}
              </p>
              <p className="mb-1">
                <strong>Issue Date:</strong>{" "}
                {cert.dateOfIssue ? new Date(cert.dateOfIssue).toLocaleDateString("en-IN") : "-"}
              </p>
              <p className="mb-1"><strong>Study Centre:</strong> {cert.studyCentre || "-"}</p>
            </div>
          </div>
        ) : (
          <div className="row g-2">
            <div className="col-sm-6">
              <p className="mb-1"><strong>Name:</strong> {cert.name || "-"}</p>
              <p className="mb-1"><strong>Father's Name:</strong> {cert.fatherName || "-"}</p>
              <p className="mb-1"><strong>Enrollment No:</strong> {cert.enrollmentNumber || "-"}</p>
            </div>
            <div className="col-sm-6">
              <p className="mb-1"><strong>Course:</strong> {cert.courseName || "-"}</p>
              <p className="mb-1">
                <strong>Grade:</strong>{" "}
                <span className="badge bg-success">{cert.grade || "-"}</span>
              </p>
              <p className="mb-1">
                <strong>Session:</strong> {cert.sessionFrom || "-"} – {cert.sessionTo || "-"}
              </p>
              <p className="mb-1">
                <strong>Issue Date:</strong>{" "}
                {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString("en-IN") : "-"}
              </p>
              <p className="mb-1"><strong>Center:</strong> {cert.centerName || cert.atcName || "-"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
