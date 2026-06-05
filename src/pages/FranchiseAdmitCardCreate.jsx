import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

export default function FranchiseAdmitCardCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cardId = params.get("id");
  const isEditMode = Boolean(cardId);

  const [rollNumber, setRollNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [examCenterAddress, setExamCenterAddress] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [reportingTime, setReportingTime] = useState("");
  const [examDuration, setExamDuration] = useState("");
  const [photo, setPhoto] = useState("");

  const [franchiseName, setFranchiseName] = useState("");
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [enrollmentInput, setEnrollmentInput] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [profileRes, coursesRes] = await Promise.all([
          API.get("/franchise-profile/me"),
          API.get("/franchise/courses"),
        ]);
        const profile = profileRes.data?.data || profileRes.data;
        if (profile?.instituteName) setFranchiseName(profile.instituteName);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (!isEditMode || !cardId) return;
    const fetchCard = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/franchise/admit-cards/${cardId}`);
        const card = res.data?.data || res.data;
        if (card) {
          setRollNumber(card.rollNumber || "");
          setStudentName(card.studentName || "");
          setFatherName(card.fatherName || "");
          setMotherName(card.motherName || "");
          setCourseName(card.courseName || "");
          setExamCenterAddress(card.examCenterAddress || "");
          setExamDate(card.examDate ? new Date(card.examDate).toISOString().split("T")[0] : "");
          setExamTime(card.examTime || "");
          setReportingTime(card.reportingTime || "");
          setExamDuration(card.examDuration || "");
          setPhoto(card.photo || "");
        }
      } catch (err) {
        setMessageType("danger");
        setMessage("Failed to load admit card");
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [isEditMode, cardId]);

  const handleLookup = async () => {
    if (!enrollmentInput.trim()) {
      setMessageType("danger");
      setMessage("Enter an enrollment / roll number first.");
      return;
    }
    setLookingUp(true);
    setMessage("");
    try {
      const res = await API.get("/franchise/students");
      const students = Array.isArray(res.data) ? res.data : [];
      const student = students.find(
        (s) => s.enrollmentNo === enrollmentInput.trim() || s.rollNumber === enrollmentInput.trim()
      );
      if (student) {
        setStudentName(student.name || "");
        setFatherName(student.fatherName || "");
        setMotherName(student.motherName || "");
        setRollNumber(student.rollNumber || "");
        setPhoto(student.photo || "");
        if (student.courseName) setCourseName(student.courseName);
        setMessageType("success");
        setMessage("Student details loaded.");
      } else {
        setMessageType("danger");
        setMessage("Student not found in your franchise.");
      }
    } catch (err) {
      setMessageType("danger");
      setMessage("Lookup failed. Try again.");
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim() || !studentName.trim() || !fatherName.trim() || !motherName.trim() ||
        !courseName.trim() || !examCenterAddress.trim() || !examDate || !examTime.trim() ||
        !reportingTime.trim() || !examDuration.trim()) {
      setMessageType("danger");
      setMessage("All fields are required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        rollNumber: rollNumber.trim(),
        studentName: studentName.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        courseName: courseName.trim(),
        examCenterAddress: examCenterAddress.trim(),
        examDate,
        examTime: examTime.trim(),
        reportingTime: reportingTime.trim(),
        examDuration: examDuration.trim(),
        photo,
      };

      if (isEditMode) {
        await API.put(`/franchise/admit-cards/${cardId}`, payload);
        setMessageType("success");
        setMessage("Admit card updated successfully.");
      } else {
        await API.post("/franchise/admit-cards", payload);
        setMessageType("success");
        setMessage("Admit card created successfully. Download it from the list.");
      }
      setTimeout(() => navigate("/franchise/admit-cards"), 1500);
    } catch (err) {
      setMessageType("danger");
      setMessage(err.response?.data?.message || "Failed to save admit card.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <FranchiseLayout>
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary me-2" /> Loading…
        </div>
      </FranchiseLayout>
    );
  }

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">{isEditMode ? "Edit Admit Card" : "Create Admit Card"}</h2>
          <small className="text-muted">Student admit card for your franchise</small>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/franchise/admit-cards")} disabled={saving}>
          Back to Admit Cards
        </button>
      </div>

      {franchiseName && (
        <div className="alert alert-info py-2 mb-3">
          Institute name on admit card: <strong>{franchiseName}</strong> (auto-set)
        </div>
      )}

      {message && <div className={`alert alert-${messageType}`}>{message}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            {!isEditMode && (
              <div className="col-12">
                <label className="form-label">Student Lookup (by enrollment / roll number)</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={enrollmentInput}
                    onChange={(e) => setEnrollmentInput(e.target.value)}
                    placeholder="Enter enrollment or roll number"
                  />
                  <button type="button" className="btn btn-outline-primary" onClick={handleLookup} disabled={lookingUp}>
                    {lookingUp ? "Looking up…" : "Lookup"}
                  </button>
                </div>
                <small className="text-muted">Auto-fills student details from your franchise records</small>
              </div>
            )}

            <div className="col-12"><h6 className="text-primary">Student Details</h6></div>

            <div className="col-md-6">
              <label className="form-label">Roll Number <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Student Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Father Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Mother Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={motherName} onChange={(e) => setMotherName(e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Course Name <span className="text-danger">*</span></label>
              <select className="form-select" value={courseName} onChange={(e) => setCourseName(e.target.value)}>
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c.title || c.name}>{c.title || c.name}</option>
                ))}
              </select>
              {courses.length === 0 && (
                <input type="text" className="form-control mt-1" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Type course name" required />
              )}
            </div>

            <div className="col-12"><h6 className="text-primary mt-2">Exam Details</h6></div>

            <div className="col-md-6">
              <label className="form-label">Exam Center Address <span className="text-danger">*</span></label>
              <textarea className="form-control" rows={2} value={examCenterAddress} onChange={(e) => setExamCenterAddress(e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Exam Date <span className="text-danger">*</span></label>
              <input type="date" className="form-control" value={examDate} onChange={(e) => setExamDate(e.target.value)} required />
            </div>

            <div className="col-md-4">
              <label className="form-label">Exam Time <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={examTime} onChange={(e) => setExamTime(e.target.value)} placeholder="e.g. 10:00 AM" required />
            </div>

            <div className="col-md-4">
              <label className="form-label">Reporting Time <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={reportingTime} onChange={(e) => setReportingTime(e.target.value)} placeholder="e.g. 9:30 AM" required />
            </div>

            <div className="col-md-4">
              <label className="form-label">Exam Duration <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={examDuration} onChange={(e) => setExamDuration(e.target.value)} placeholder="e.g. 3 Hours" required />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                {saving ? "Saving…" : isEditMode ? "Update Admit Card" : "Create Admit Card"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FranchiseLayout>
  );
}
