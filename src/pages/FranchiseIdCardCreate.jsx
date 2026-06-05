import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

export default function FranchiseIdCardCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cardId = params.get("id");
  const isEditMode = Boolean(cardId);

  const [studentName, setStudentName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [centerMobileNo, setCenterMobileNo] = useState("");
  const [courseName, setCourseName] = useState("");
  const [sessionFrom, setSessionFrom] = useState("");
  const [sessionTo, setSessionTo] = useState("");
  const [photo, setPhoto] = useState("");

  const [franchiseName, setFranchiseName] = useState("");
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
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
        const res = await API.get(`/franchise/id-cards/${cardId}`);
        const card = res.data?.data || res.data;
        if (card) {
          setStudentName(card.studentName || "");
          setFatherName(card.fatherName || "");
          setMotherName(card.motherName || "");
          setEnrollmentNo(card.enrollmentNo || "");
          setDateOfBirth(card.dateOfBirth ? new Date(card.dateOfBirth).toISOString().split("T")[0] : "");
          setContactNo(card.contactNo || "");
          setAddress(card.address || "");
          setMobileNo(card.mobileNo || "");
          setCenterMobileNo(card.centerMobileNo || "");
          setCourseName(card.courseName || "");
          setSessionFrom(card.sessionFrom || "");
          setSessionTo(card.sessionTo || "");
          setPhoto(card.photo || "");
        }
      } catch (err) {
        setMessageType("danger");
        setMessage("Failed to load ID card");
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [isEditMode, cardId]);

  const handleLookup = async () => {
    if (!enrollmentNo.trim()) {
      setMessageType("danger");
      setMessage("Enter an enrollment number first.");
      return;
    }
    setLookingUp(true);
    setMessage("");
    try {
      const res = await API.get("/franchise/students");
      const students = Array.isArray(res.data) ? res.data : [];
      const student = students.find(
        (s) => s.enrollmentNo === enrollmentNo.trim() || s.rollNumber === enrollmentNo.trim()
      );
      if (student) {
        setStudentName(student.name || "");
        setFatherName(student.fatherName || "");
        setMotherName(student.motherName || "");
        setMobileNo(student.mobile || student.mobileNo || "");
        setContactNo(student.mobile || student.contactNo || "");
        setAddress(student.address || "");
        setPhoto(student.photo || "");
        if (student.dob) setDateOfBirth(new Date(student.dob).toISOString().split("T")[0]);
        if (student.courseName) setCourseName(student.courseName);
        if (student.sessionStart) setSessionFrom(new Date(student.sessionStart).getFullYear().toString());
        if (student.sessionEnd) setSessionTo(new Date(student.sessionEnd).getFullYear().toString());
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
    if (!studentName.trim() || !fatherName.trim() || !motherName.trim() || !enrollmentNo.trim() || !dateOfBirth) {
      setMessageType("danger");
      setMessage("Student Name, Father Name, Mother Name, Enrollment No, and Date of Birth are required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        studentName: studentName.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        enrollmentNo: enrollmentNo.trim(),
        dateOfBirth,
        contactNo: contactNo.trim(),
        address: address.trim(),
        mobileNo: mobileNo.trim(),
        centerMobileNo: centerMobileNo.trim(),
        courseName: courseName.trim(),
        sessionFrom: sessionFrom.trim(),
        sessionTo: sessionTo.trim(),
        photo,
      };

      if (isEditMode) {
        await API.put(`/franchise/id-cards/${cardId}`, payload);
        setMessageType("success");
        setMessage("ID Card updated successfully.");
      } else {
        await API.post("/franchise/id-cards", payload);
        setMessageType("success");
        setMessage("ID Card created successfully. Download it from the list.");
      }
      setTimeout(() => navigate("/franchise/id-cards"), 1500);
    } catch (err) {
      setMessageType("danger");
      setMessage(err.response?.data?.message || "Failed to save ID card.");
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
          <h2 className="fw-bold mb-1">{isEditMode ? "Edit ID Card" : "Create ID Card"}</h2>
          <small className="text-muted">Student ID card for your franchise</small>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/franchise/id-cards")} disabled={saving}>
          Back to ID Cards
        </button>
      </div>

      {franchiseName && (
        <div className="alert alert-info py-2 mb-3">
          Centre name on ID card: <strong>{franchiseName}</strong>
        </div>
      )}

      {message && <div className={`alert alert-${messageType}`}>{message}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Enrollment Number <span className="text-danger">*</span></label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value)}
                  placeholder="Enter enrollment / roll number"
                  disabled={isEditMode}
                />
                {!isEditMode && (
                  <button type="button" className="btn btn-outline-primary" onClick={handleLookup} disabled={lookingUp}>
                    {lookingUp ? "Looking up…" : "Lookup"}
                  </button>
                )}
              </div>
              <small className="text-muted">Click Lookup to auto-fill from student record</small>
            </div>

            <div className="col-md-6">
              <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
              <input type="date" className="form-control" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
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
              <label className="form-label">Course Name</label>
              <select className="form-select" value={courseName} onChange={(e) => setCourseName(e.target.value)}>
                <option value="">Select course (or type below)</option>
                {courses.map((c) => (
                  <option key={c._id} value={c.title || c.name}>{c.title || c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Session From</label>
              <input type="text" className="form-control" value={sessionFrom} onChange={(e) => setSessionFrom(e.target.value)} placeholder="e.g. 2024" />
            </div>

            <div className="col-md-3">
              <label className="form-label">Session To</label>
              <input type="text" className="form-control" value={sessionTo} onChange={(e) => setSessionTo(e.target.value)} placeholder="e.g. 2025" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Mobile No</label>
              <input type="text" className="form-control" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Contact No</label>
              <input type="text" className="form-control" value={contactNo} onChange={(e) => setContactNo(e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Centre Mobile No</label>
              <input type="text" className="form-control" value={centerMobileNo} onChange={(e) => setCenterMobileNo(e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                {saving ? "Saving…" : isEditMode ? "Update ID Card" : "Create ID Card"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FranchiseLayout>
  );
}
