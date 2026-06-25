// src/pages/FranchiseCertificateCreate.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

export default function FranchiseCertificateCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const certificateId = params.get("id");
  const isEditMode = Boolean(certificateId);

  // Form fields
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [dob, setDob] = useState("");
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [sessionFrom, setSessionFrom] = useState("");
  const [sessionTo, setSessionTo] = useState("");
  const [coursePeriodFrom, setCoursePeriodFrom] = useState("");
  const [coursePeriodTo, setCoursePeriodTo] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [grade, setGrade] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [photo, setPhoto] = useState("");

  // State management
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksheets, setMarksheets] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [franchiseName, setFranchiseName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  // Grade table: 85-100 -> A+, 70-84 -> A, 55-69 -> B, 40-54 -> C (matches admin's CertificateCreate.jsx)
  const gradeFromPercentage = (pct) => {
    if (pct == null || isNaN(pct)) return "";
    const p = Number(pct);
    if (p >= 85) return "A+";
    if (p >= 70) return "A";
    if (p >= 55) return "B";
    if (p >= 40) return "C";
    return "";
  };

  // Fetch courses, profile, students, and marksheets on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [coursesRes, profileRes, studentsRes, marksheetsRes] = await Promise.all([
          API.get("/franchise/courses"),
          API.get("/franchise-profile/me"),
          API.get("/franchise/students"),
          API.get("/franchise/marksheets"),
        ]);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        const profile = profileRes.data?.data || profileRes.data;
        if (profile?.instituteName) setFranchiseName(profile.instituteName);
        const marksheetsData = marksheetsRes.data?.data;
        setMarksheets(Array.isArray(marksheetsData) ? marksheetsData : []);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };
    fetchInitialData();
  }, []);

  // Load existing certificate for edit
  useEffect(() => {
    if (!isEditMode || !certificateId) { setLoading(false); return; }
    const fetchCertificate = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/franchise/certificates/${certificateId}`);
        const cert = res.data;
        if (cert) {
          setName(cert.name || "");
          setFatherName(cert.fatherName || "");
          setCourseName(cert.courseName || "");
          setSessionFrom(cert.sessionFrom ? String(cert.sessionFrom) : "");
          setSessionTo(cert.sessionTo ? String(cert.sessionTo) : "");
          setCoursePeriodFrom(cert.coursePeriodFrom ? new Date(cert.coursePeriodFrom).toISOString().split("T")[0] : "");
          setCoursePeriodTo(cert.coursePeriodTo ? new Date(cert.coursePeriodTo).toISOString().split("T")[0] : "");
          setGrade(cert.grade || "");
          setEnrollmentNumber(cert.enrollmentNumber || "");
          setCertificateNumber(cert.certificateNumber || "");
          setIssueDate(cert.issueDate ? cert.issueDate.split("T")[0] : "");
          setCourseDuration(cert.courseDuration || "");
          setPhoto(cert.photo || "");
          if (cert.dob) setDob(new Date(cert.dob).toISOString().split("T")[0]);
        }
      } catch (err) {
        console.error("Failed to load certificate:", err);
        setMessageType("danger");
        setMessage("Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [isEditMode, certificateId]);

  const resolveCourseDuration = (cName, courseRef) => {
    const match = courses.find((c) => {
      if (courseRef && (c._id === courseRef || c.id === courseRef)) return true;
      return cName && (c.title || c.name || "").toLowerCase() === cName.toLowerCase();
    });
    return match?.duration || "";
  };

  const applyStudentFields = (student) => {
    setEnrollmentNumber(student.enrollmentNo || "");
    setName(student.name || "");
    setFatherName(student.fatherName || "");
    setPhoto(student.photo || "");
    if (student.dob) setDob(new Date(student.dob).toISOString().split("T")[0]);
    const c0 = student.courses?.[0];
    const cName = student.courseName || c0?.courseName || "";
    const courseRef = student.course || c0?.course;
    const sStart = student.sessionStart || c0?.sessionStart;
    const sEnd = student.sessionEnd || c0?.sessionEnd;
    if (cName) {
      setCourseName(cName);
      const duration = resolveCourseDuration(cName, courseRef);
      if (duration) setCourseDuration(duration);

      // Auto-fill grade from an existing marksheet for this student + course
      const enrollmentNo = student.enrollmentNo || student.rollNumber || "";
      const ms = marksheets.find(
        (m) => m.enrollmentNo === enrollmentNo && m.courseName === cName
      );
      if (ms) {
        const gradeValue = gradeFromPercentage(ms.percentage) || ms.overallGrade || "";
        if (gradeValue) setGrade(gradeValue);
      }
    }
    if (sStart) {
      setSessionFrom(new Date(sStart).getFullYear().toString());
      setCoursePeriodFrom(new Date(sStart).toISOString().split("T")[0]);
    }
    if (sEnd) {
      setSessionTo(new Date(sEnd).getFullYear().toString());
      setCoursePeriodTo(new Date(sEnd).toISOString().split("T")[0]);
    }
    setMessage("");
  };

  const handleSelectStudent = (id) => {
    if (!id) { setStudentId(""); return; }
    const student = students.find((s) => (s._id || s.id) === id);
    if (!student) return;
    setStudentId(id);
    applyStudentFields(student);
  };

  const handleLookupStudent = async () => {
    if (!enrollmentNumber.trim()) {
      setMessageType("danger");
      setMessage("Please enter an enrollment number first.");
      return;
    }
    setLoadingStudent(true);
    setMessage("");
    try {
      const studentsRes = await API.get("/franchise/students");
      const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const student = allStudents.find(
        (s) =>
          s.enrollmentNo === enrollmentNumber.trim() ||
          s.enrollment === enrollmentNumber.trim() ||
          s.rollNumber === enrollmentNumber.trim()
      );
      if (student) {
        applyStudentFields(student);
        setMessageType("success");
        setMessage("Student details loaded successfully!");
      } else {
        setMessageType("danger");
        setMessage("Student not found in your franchise with this enrollment number.");
      }
    } catch (err) {
      console.error("Student lookup error:", err);
      setMessageType("danger");
      setMessage("Student not found with this enrollment number.");
    } finally {
      setLoadingStudent(false);
    }
  };

  const validate = () => {
    if (!enrollmentNumber.trim()) return showError("Enrollment Number is required.");
    if (!name.trim()) return showError("Name is required.");
    if (!fatherName.trim()) return showError("Father's Name is required.");
    if (!courseName.trim()) return showError("Course Name is required.");
    if (!sessionFrom) return showError("Session From is required.");
    if (!sessionTo) return showError("Session To is required.");
    if (!coursePeriodFrom) return showError("Course Period From is required.");
    if (!coursePeriodTo) return showError("Course Period To is required.");
    if (!courseDuration.trim()) return showError("Course Duration is required.");
    if (!grade.trim()) return showError("Grade is required.");
    if (!certificateNumber.trim()) return showError("Certificate Number is required.");
    if (!issueDate) return showError("Issue Date is required.");
    return true;
  };

  function showError(msg) {
    setMessageType("danger");
    setMessage(msg);
    return false;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validate()) return;

    setSaving(true);
    try {
      // Generate a fresh certificate preview image to store in DB — same as
      // admin's create flow, so /verify/:certNo has an image before anyone
      // ever clicks Download.
      let certificateImage = null;
      try {
        if (window.CertificateGenerator) {
          await window.CertificateGenerator.loadTemplate('/student-certificate-template.jpeg');
          const studentData = {
            centerName: franchiseName || "",
            atcName: franchiseName || "",
            studentNameCombined: fatherName.trim()
              ? `${name.trim()} S/O, D/O, W/O ${fatherName.trim()}`
              : name.trim(),
            courseName: courseName.trim(),
            grade: grade.trim(),
            courseDuration: courseDuration.trim(),
            coursePeriodFrom,
            coursePeriodTo,
            certificateNumber: certificateNumber.trim(),
            dateOfIssue: issueDate,
            photo: photo || "",
          };
          certificateImage = await window.CertificateGenerator.getDataURL(studentData, 0.4);
        }
      } catch (imgErr) {
        console.warn("Certificate preview image generation failed:", imgErr);
      }

      const payload = {
        name: name.trim(),
        fatherName: fatherName.trim(),
        courseName: courseName.trim(),
        sessionFrom: parseInt(sessionFrom),
        sessionTo: parseInt(sessionTo),
        coursePeriodFrom,
        coursePeriodTo,
        courseDuration: courseDuration.trim(),
        grade: grade.trim(),
        enrollmentNumber: enrollmentNumber.trim(),
        certificateNumber: certificateNumber.trim(),
        issueDate,
        dob: dob || null,
        photo: photo || "",
        certificateImage,
      };

      if (isEditMode && certificateId) {
        await API.put(`/franchise/certificates/${certificateId}`, payload);
        setMessageType("success");
        setMessage("Certificate updated successfully.");
      } else {
        await API.post("/franchise/certificates", payload);
        setMessageType("success");
        setMessage("Certificate created successfully. Download it from the certificates list.");
      }

      setTimeout(() => navigate("/franchise/certificates"), 1500);
    } catch (err) {
      console.error("create certificate error:", err);
      setMessageType("danger");
      setMessage(err.response?.data?.message || "Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <FranchiseLayout>
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-2" />
          Loading…
        </div>
      </FranchiseLayout>
    );
  }

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">
            {isEditMode ? "Edit Certificate" : "Create Certificate"}
          </h2>
          <small className="text-muted">
            {isEditMode ? "Update certificate details." : "Creating a certificate will deduct credits from your account."}
          </small>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/franchise/certificates")} disabled={saving}>
          Back to Certificates
        </button>
      </div>

      {franchiseName && (
        <div className="alert alert-info py-2 mb-3">
          Centre name on certificate: <strong>{franchiseName}</strong>
        </div>
      )}

      {message && <div className={`alert alert-${messageType}`} role="alert">{message}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">

            {/* Student dropdown */}
            {!isEditMode && (
              <div className="col-12">
                <label className="form-label fw-semibold">Select Student</label>
                <select
                  className="form-select"
                  value={studentId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                >
                  <option value="">— Choose a student to auto-fill —</option>
                  {students.map((s) => {
                    const sid = s._id || s.id;
                    return (
                      <option key={sid} value={sid}>
                        {s.name} — {s.enrollmentNo || s.rollNumber || ""}
                      </option>
                    );
                  })}
                </select>
                <small className="text-muted">Or enter enrollment number manually below and click Lookup</small>
              </div>
            )}

            {/* Enrollment Number */}
            <div className="col-md-6">
              <label className="form-label">
                Enrollment Number {!isEditMode && <span className="text-danger">*</span>}
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                  placeholder="Enter enrollment number"
                  disabled={isEditMode}
                  required={!isEditMode}
                />
                {!isEditMode && (
                  <button type="button" className="btn btn-outline-primary" onClick={handleLookupStudent} disabled={loadingStudent}>
                    {loadingStudent ? "Looking up..." : "Lookup"}
                  </button>
                )}
              </div>
              <small className="text-muted">Click Lookup to auto-fill student details and photo</small>
            </div>

            {/* Date of Birth */}
            <div className="col-md-6">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-control" value={dob} onChange={(e) => setDob(e.target.value)} />
              <small className="text-muted">Used for public verification</small>
            </div>

            <div className="col-md-6">
              <label className="form-label">Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Father's Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
            </div>

            {/* Course Name */}
            <div className="col-md-6">
              <label className="form-label">Course Name <span className="text-danger">*</span></label>
              <select className="form-select" value={courseName} onChange={(e) => setCourseName(e.target.value)} required>
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course.title || course.name}>{course.title || course.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Session From <span className="text-danger">*</span></label>
              <select className="form-select" value={sessionFrom} onChange={(e) => setSessionFrom(e.target.value)} required>
                <option value="">Select Year</option>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Session To <span className="text-danger">*</span></label>
              <select className="form-select" value={sessionTo} onChange={(e) => setSessionTo(e.target.value)} required>
                <option value="">Select Year</option>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>

            {/* Course Period From / To */}
            <div className="col-md-6">
              <label className="form-label">Course Period From <span className="text-danger">*</span></label>
              <input type="date" className="form-control" value={coursePeriodFrom} onChange={(e) => setCoursePeriodFrom(e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Course Period To <span className="text-danger">*</span></label>
              <input type="date" className="form-control" value={coursePeriodTo} onChange={(e) => setCoursePeriodTo(e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Course Duration <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={courseDuration}
                onChange={(e) => setCourseDuration(e.target.value)}
                placeholder="e.g. 1 Year, 6 Months"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Grade <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., A, A+, First Division"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Certificate Number <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={certificateNumber} onChange={(e) => setCertificateNumber(e.target.value)} required />
              <small className="text-muted">Must be globally unique — used for QR code verification</small>
            </div>

            <div className="col-md-6">
              <label className="form-label">Issue Date <span className="text-danger">*</span></label>
              <input type="date" className="form-control" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                {saving ? "Saving…" : isEditMode ? "Update Certificate" : "Create Certificate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FranchiseLayout>
  );
}
