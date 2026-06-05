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
  const [grade, setGrade] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");

  // State management
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  // Fetch courses and students on mount
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [coursesRes, studentsRes] = await Promise.all([
          API.get("/franchise/courses"),
          API.get("/franchise/students"),
        ]);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };
    fetchInitial();
  }, []);

  // Load existing certificate for edit
  useEffect(() => {
    if (!isEditMode || !certificateId) {
      setLoading(false);
      return;
    }

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
          setGrade(cert.grade || "");
          setEnrollmentNumber(cert.enrollmentNumber || "");
          setCertificateNumber(cert.certificateNumber || "");
          setIssueDate(cert.issueDate ? cert.issueDate.split("T")[0] : "");
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

  const handleSelectStudent = (id) => {
    if (!id) { setStudentId(""); return; }
    const student = students.find((s) => (s._id || s.id) === id);
    if (!student) return;
    setStudentId(id);
    setEnrollmentNumber(student.enrollmentNo || "");
    setName(student.name || "");
    setFatherName(student.fatherName || "");
    if (student.dob) setDob(new Date(student.dob).toISOString().split("T")[0]);
    const c0 = student.courses?.[0];
    const cName = student.courseName || c0?.courseName || "";
    const sStart = student.sessionStart || c0?.sessionStart;
    const sEnd = student.sessionEnd || c0?.sessionEnd;
    if (cName) setCourseName(cName);
    if (sStart) setSessionFrom(new Date(sStart).getFullYear().toString());
    if (sEnd) setSessionTo(new Date(sEnd).getFullYear().toString());
    setMessage("");
  };

  // Lookup student by enrollment number
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
      const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const student = students.find(
        (s) =>
          s.enrollment === enrollmentNumber.trim() ||
          s.rollNumber === enrollmentNumber.trim()
      );

      if (student) {
        setName(student.name || "");
        setFatherName(student.fatherName || "");
        setCourseName(student.courseName || "");

        const c0 = student.courses?.[0];
        const sStart = student.sessionStart || c0?.sessionStart;
        const sEnd = student.sessionEnd || c0?.sessionEnd;
        if (sStart) setSessionFrom(new Date(sStart).getFullYear().toString());
        if (sEnd) setSessionTo(new Date(sEnd).getFullYear().toString());

        setMessageType("success");
        setMessage("Student details loaded successfully!");
      } else {
        setMessageType("danger");
        setMessage("Student not found with this enrollment number.");
      }
    } catch (err) {
      console.error("Student lookup error:", err);
      setMessageType("danger");
      setMessage(
        err.userMessage || "Student not found with this enrollment number."
      );
    } finally {
      setLoadingStudent(false);
    }
  };

  const validate = () => {
    if (!enrollmentNumber.trim()) {
      setMessageType("danger");
      setMessage("Enrollment Number is required.");
      return false;
    }
    if (!name.trim()) {
      setMessageType("danger");
      setMessage("Name is required.");
      return false;
    }
    if (!fatherName.trim()) {
      setMessageType("danger");
      setMessage("Father's Name is required.");
      return false;
    }
    if (!courseName.trim()) {
      setMessageType("danger");
      setMessage("Course Name is required.");
      return false;
    }
    if (!sessionFrom) {
      setMessageType("danger");
      setMessage("Session From is required.");
      return false;
    }
    if (!sessionTo) {
      setMessageType("danger");
      setMessage("Session To is required.");
      return false;
    }
    if (!grade.trim()) {
      setMessageType("danger");
      setMessage("Grade is required.");
      return false;
    }
    if (!certificateNumber.trim()) {
      setMessageType("danger");
      setMessage("Certificate Number is required.");
      return false;
    }
    if (!issueDate) {
      setMessageType("danger");
      setMessage("Issue Date is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        fatherName: fatherName.trim(),
        courseName: courseName.trim(),
        sessionFrom: parseInt(sessionFrom),
        sessionTo: parseInt(sessionTo),
        grade: grade.trim(),
        enrollmentNumber: enrollmentNumber.trim(),
        certificateNumber: certificateNumber.trim(),
        issueDate,
        dob: dob || null,
      };

      if (isEditMode && certificateId) {
        await API.put(`/franchise/certificates/${certificateId}`, payload);
        setMessageType("success");
        setMessage("Certificate updated successfully.");
      } else {
        await API.post("/franchise/certificates", payload);
        setMessageType("success");
        setMessage("Certificate created successfully.");
      }

      setTimeout(() => {
        navigate("/franchise/certificates");
      }, 1000);
    } catch (err) {
      console.error("create certificate error:", err);
      setMessageType("danger");
      setMessage(
        err.response?.data?.message ||
          err.userMessage ||
          "Failed to save certificate"
      );
    } finally {
      setSaving(false);
    }
  };

  // FIX: replaced broken loading spinner (used undefined Sidebar/franchise) with FranchiseLayout
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
            {isEditMode
              ? "Update certificate details."
              : "Creating a certificate will deduct credits from your account."}
          </small>
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/franchise/certificates")}
          disabled={saving}
        >
          Back to Certificates
        </button>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`} role="alert">
          {message}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
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
                Enrollment Number{" "}
                {!isEditMode && <span className="text-danger">*</span>}
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
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleLookupStudent}
                    disabled={loadingStudent}
                  >
                    {loadingStudent ? "Looking up..." : "Lookup"}
                  </button>
                )}
              </div>
              <small className="text-muted">
                Enter enrollment number and click Lookup to auto-fill student
                details
              </small>
            </div>

            {/* Date of Birth */}
            <div className="col-md-6">
              <label className="form-label">
                Date of Birth <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
              <small className="text-muted">Required for public verification</small>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Father's Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                required
              />
            </div>

            {/* Course Name */}
            <div className="col-md-6">
              <label className="form-label">
                Course Name <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course.title || course.name}>
                    {course.title || course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Session From <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={sessionFrom}
                onChange={(e) => setSessionFrom(e.target.value)}
                required
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Session To <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={sessionTo}
                onChange={(e) => setSessionTo(e.target.value)}
                required
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Grade <span className="text-danger">*</span>
              </label>
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
              <label className="form-label">
                Certificate Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Issue Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            <div className="col-12">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : isEditMode
                  ? "Update Certificate"
                  : "Create Certificate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FranchiseLayout>
  );
}