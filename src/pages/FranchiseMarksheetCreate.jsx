import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

export default function FranchiseMarksheetCreate() {
  const navigate = useNavigate();

  // Student/course data
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [franchiseName, setFranchiseName] = useState("");

  // Form fields
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [studentName, setStudentName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [dob, setDob] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [coursePeriodFrom, setCoursePeriodFrom] = useState("");
  const [coursePeriodTo, setCoursePeriodTo] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [dateOfIssue, setDateOfIssue] = useState("");
  const [subjects, setSubjects] = useState([
    { subjectName: "", theoryMarks: "", practicalMarks: "", maxTheoryMarks: 100, maxPracticalMarks: 0, grade: "" },
  ]);

  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [profileRes, studentsRes, coursesRes, subjectsRes] = await Promise.all([
          API.get("/franchise-profile/me"),
          API.get("/franchise/students"),
          API.get("/franchise/courses"),
          API.get("/franchise/subjects"),
        ]);
        const profile = profileRes.data?.data || profileRes.data;
        if (profile?.instituteName) setFranchiseName(profile.instituteName);
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setAllSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      } finally {
        setLoadingInit(false);
      }
    };
    fetchInitial();
  }, []);

  const toId = (val) => {
    if (!val) return null;
    if (typeof val === "string") return val;
    if (typeof val === "object") return (val._id || val.id)?.toString() ?? null;
    return String(val);
  };

  const applySubjectsForCourse = (selectedCourseId) => {
    const courseSubjects = allSubjects.filter((s) => {
      const sCourseId = s.course?._id?.toString() || s.course?.toString();
      return sCourseId === selectedCourseId;
    });
    if (courseSubjects.length > 0) {
      setSubjects(
        courseSubjects.map((s) => ({
          subjectName: s.name || s.title || "",
          theoryMarks: "",
          practicalMarks: "",
          maxTheoryMarks: Number(s.maxMarks) || 100,
          maxPracticalMarks: Number(s.maxPracticalMarks) || 0,
          grade: "",
        }))
      );
    } else {
      setSubjects([{ subjectName: "", theoryMarks: "", practicalMarks: "", maxTheoryMarks: 100, maxPracticalMarks: 0, grade: "" }]);
    }
  };

  // Totals & grade
  const { totalTheory, totalPractical, totalCombined, maxTotal, percentage } = useMemo(() => {
    let tt = 0, tp = 0, tc = 0, mt = 0;
    subjects.forEach((s) => {
      const t = Number(s.theoryMarks) || 0;
      const p = Number(s.practicalMarks) || 0;
      const mt2 = Number(s.maxTheoryMarks) || 100;
      const mp = Number(s.maxPracticalMarks) || 0;
      tt += t; tp += p; tc += t + p; mt += mt2 + mp;
    });
    return { totalTheory: tt, totalPractical: tp, totalCombined: tc, maxTotal: mt, percentage: mt > 0 ? (tc / mt) * 100 : 0 };
  }, [subjects]);

  const calcGrade = (pct) => {
    if (pct >= 85) return "A+";
    if (pct >= 70) return "A";
    if (pct >= 55) return "B";
    if (pct >= 40) return "C";
    return "F";
  };

  const calcSubjectGrade = (sub) => {
    const tot = (Number(sub.theoryMarks) || 0) + (Number(sub.practicalMarks) || 0);
    const max = (Number(sub.maxTheoryMarks) || 100) + (Number(sub.maxPracticalMarks) || 0);
    return max > 0 ? calcGrade((tot / max) * 100) : "F";
  };

  const autoGrade = calcGrade(percentage);

  // Enrollment lookup
  const handleEnrollmentLookup = async () => {
    if (!enrollmentNo.trim()) {
      setMessageType("danger");
      setMessage("Enter an enrollment number first.");
      return;
    }
    setLookingUp(true);
    setMessage("");
    try {
      const res = await API.get(`/franchise/marksheets/student/${enrollmentNo.trim()}`);
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setStudentName(d.studentName || "");
        setFatherName(d.fatherName || "");
        setMotherName(d.motherName || "");
        setRollNumber(d.rollNumber || "");
        setCourseName(d.courseName || "");
        if (d.dob) setDob(new Date(d.dob).toISOString().split("T")[0]);
        if (d.studentId) setStudentId(d.studentId);
        setMessageType("success");
        setMessage("Student details loaded.");
      }
    } catch (err) {
      setMessageType("danger");
      setMessage(err.response?.data?.message || "Student not found in your franchise.");
    } finally {
      setLookingUp(false);
    }
  };

  // Student dropdown selection
  const handleStudentChange = (e) => {
    const selId = e.target.value;
    setStudentId(selId);
    if (!selId) return;
    const stu = students.find((s) => toId(s) === selId);
    if (!stu) return;
    setStudentName(stu.name || "");
    setFatherName(stu.fatherName || "");
    setMotherName(stu.motherName || "");
    setRollNumber(stu.rollNumber || "");
    setEnrollmentNo(stu.enrollmentNo || stu.rollNumber || "");
    if (stu.dob) setDob(new Date(stu.dob).toISOString().split("T")[0]);
    if (stu.sessionStart) setCoursePeriodFrom(new Date(stu.sessionStart).toISOString().split("T")[0]);
    if (stu.sessionEnd) setCoursePeriodTo(new Date(stu.sessionEnd).toISOString().split("T")[0]);

    if (stu.courseName) {
      setCourseName(stu.courseName);
      const matched = courses.find((c) => (c.name || c.title) === stu.courseName);
      if (matched) {
        const cid = toId(matched);
        setCourseId(cid);
        setCourseDuration(matched.duration || matched.readableDuration || "");
        applySubjectsForCourse(cid);
      }
    }
  };

  // Course dropdown selection
  const handleCourseChange = (e) => {
    const selId = e.target.value;
    setCourseId(selId);
    if (!selId) {
      setCourseName("");
      setCourseDuration("");
      setSubjects([{ subjectName: "", theoryMarks: "", practicalMarks: "", maxTheoryMarks: 100, maxPracticalMarks: 0, grade: "" }]);
      return;
    }
    const c = courses.find((x) => toId(x) === selId);
    if (c) {
      setCourseName(c.name || c.title || "");
      setCourseDuration(c.duration || c.readableDuration || "");
    }
    applySubjectsForCourse(selId);
  };

  const handleSubjectChange = (idx, field, value) => {
    const updated = [...subjects];
    if (["theoryMarks", "practicalMarks", "maxTheoryMarks", "maxPracticalMarks"].includes(field)) {
      updated[idx] = { ...updated[idx], [field]: value === "" ? "" : Number(value) };
    } else {
      updated[idx] = { ...updated[idx], [field]: value };
    }
    updated[idx].grade = calcSubjectGrade(updated[idx]);
    setSubjects(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enrollmentNo.trim() || !studentName.trim() || !fatherName.trim() || !motherName.trim() ||
        !courseName.trim() || !rollNumber.trim() || !dob || !coursePeriodFrom || !coursePeriodTo ||
        !courseDuration.trim() || !dateOfIssue) {
      setMessageType("danger");
      setMessage("All required fields must be filled.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await API.post("/franchise/marksheets", {
        enrollmentNo: enrollmentNo.trim(),
        studentName: studentName.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        courseName: courseName.trim(),
        rollNumber: rollNumber.trim(),
        dob,
        coursePeriodFrom,
        coursePeriodTo,
        courseDuration: courseDuration.trim(),
        dateOfIssue,
        subjects: subjects.map((s) => ({
          subjectName: s.subjectName.trim(),
          theoryMarks: Number(s.theoryMarks) || 0,
          practicalMarks: Number(s.practicalMarks) || 0,
          maxTheoryMarks: Number(s.maxTheoryMarks) || 100,
          maxPracticalMarks: Number(s.maxPracticalMarks) || 0,
          grade: s.grade || "",
        })),
        overallGrade: autoGrade,
        studentId: studentId || undefined,
        courseId: courseId || undefined,
      });
      setMessageType("success");
      setMessage("Marksheet created successfully!");
      setTimeout(() => navigate("/franchise/marksheets"), 800);
    } catch (err) {
      setMessageType("danger");
      setMessage(err.response?.data?.message || "Failed to create marksheet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Generate Marksheet</h2>
          <small className="text-muted">Create a marksheet for your franchise students</small>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/franchise/marksheets")}>
          Back to Marksheets
        </button>
      </div>

      {franchiseName && (
        <div className="alert alert-info py-2 mb-3">
          Institute name on marksheet: <strong>{franchiseName}</strong> (auto-set)
        </div>
      )}

      {message && <div className={`alert alert-${messageType}`}>{message}</div>}

      <div className="card shadow-sm" style={{ maxWidth: 1000 }}>
        <div className="card-body">
          {loadingInit ? (
            <div className="text-muted">Loading franchise data…</div>
          ) : (
            <form onSubmit={handleSubmit} className="row g-3">
              {/* Student Selection */}
              <div className="col-12"><h5 className="text-primary mb-2">Student Selection (Auto-fill)</h5></div>

              <div className="col-md-6">
                <label className="form-label">Select Student (optional — auto-fills details)</label>
                <select className="form-select" value={studentId} onChange={handleStudentChange}>
                  <option value="">Select a student</option>
                  {students.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.name || "Student"}{s.rollNumber ? ` (${s.rollNumber})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Enrollment Number <span className="text-danger">*</span></label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    placeholder="Enter enrollment number"
                    required
                  />
                  <button type="button" className="btn btn-outline-primary" onClick={handleEnrollmentLookup} disabled={lookingUp}>
                    {lookingUp ? "Loading…" : "Fetch Details"}
                  </button>
                </div>
                <small className="text-muted">Or enter manually and click Fetch Details</small>
              </div>

              {/* Student Details */}
              <div className="col-12 mt-2"><h5 className="text-primary mb-2">Student Details</h5></div>

              <div className="col-md-6">
                <label className="form-label">Student Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Father / Husband Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Mother Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" value={motherName} onChange={(e) => setMotherName(e.target.value)} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Roll Number <span className="text-danger">*</span></label>
                <input type="text" className="form-control" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
                <input type="date" className="form-control" value={dob} onChange={(e) => setDob(e.target.value)} required />
              </div>

              {/* Course Details */}
              <div className="col-12 mt-2"><h5 className="text-primary mb-2">Course & Period</h5></div>

              <div className="col-md-6">
                <label className="form-label">Select Course (auto-fills subjects)</label>
                <select className="form-select" value={courseId} onChange={handleCourseChange}>
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Course Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Enter course name" required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Course Duration <span className="text-danger">*</span></label>
                <input type="text" className="form-control" value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)} placeholder="e.g. 1 Year, 6 Months" required />
              </div>

              <div className="col-md-3">
                <label className="form-label">Course Period From <span className="text-danger">*</span></label>
                <input type="date" className="form-control" value={coursePeriodFrom} onChange={(e) => setCoursePeriodFrom(e.target.value)} required />
              </div>

              <div className="col-md-3">
                <label className="form-label">Course Period To <span className="text-danger">*</span></label>
                <input type="date" className="form-control" value={coursePeriodTo} onChange={(e) => setCoursePeriodTo(e.target.value)} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Date of Issue <span className="text-danger">*</span></label>
                <input type="date" className="form-control" value={dateOfIssue} onChange={(e) => setDateOfIssue(e.target.value)} required />
              </div>

              {/* Subjects */}
              <div className="col-12 mt-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="text-primary mb-0">Subjects & Marks</h5>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() =>
                      setSubjects([...subjects, { subjectName: "", theoryMarks: "", practicalMarks: "", maxTheoryMarks: 100, maxPracticalMarks: 0, grade: "" }])
                    }
                  >
                    Add Subject
                  </button>
                </div>
                <p className="text-muted small">Select a course above to auto-fill subjects from your course catalog.</p>
              </div>

              {subjects.map((sub, idx) => (
                <div key={idx} className="col-12">
                  <div className="card mb-2">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <strong>Subject {idx + 1}: {sub.subjectName || "Unnamed"}</strong>
                      {subjects.length > 1 && (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setSubjects(subjects.filter((_, i) => i !== idx))}>
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="card-body">
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label className="form-label">Subject Name</label>
                          <input type="text" className="form-control" value={sub.subjectName} onChange={(e) => handleSubjectChange(idx, "subjectName", e.target.value)} required />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Max Theory Marks</label>
                          <input type="number" className="form-control" value={sub.maxTheoryMarks} onChange={(e) => handleSubjectChange(idx, "maxTheoryMarks", e.target.value)} min="0" />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Max Practical Marks</label>
                          <input type="number" className="form-control" value={sub.maxPracticalMarks} onChange={(e) => handleSubjectChange(idx, "maxPracticalMarks", e.target.value)} min="0" />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Theory Marks Obtained</label>
                          <input type="number" className="form-control" value={sub.theoryMarks} onChange={(e) => handleSubjectChange(idx, "theoryMarks", e.target.value)} min="0" />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Practical Marks Obtained</label>
                          <input type="number" className="form-control" value={sub.practicalMarks} onChange={(e) => handleSubjectChange(idx, "practicalMarks", e.target.value)} min="0" />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Combined</label>
                          <input type="text" className="form-control" value={(Number(sub.theoryMarks) || 0) + (Number(sub.practicalMarks) || 0)} readOnly disabled />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Grade (Auto)</label>
                          <input type="text" className="form-control" value={sub.grade} readOnly disabled />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="col-12 mt-2">
                <div className="card bg-light">
                  <div className="card-header"><h5 className="mb-0 text-primary">Marks Summary</h5></div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4"><strong>Total Theory:</strong> {totalTheory}</div>
                      <div className="col-md-4"><strong>Total Practical:</strong> {totalPractical}</div>
                      <div className="col-md-4"><strong>Total Combined:</strong> {totalCombined} / {maxTotal}</div>
                      <div className="col-md-6 mt-2"><strong>Percentage:</strong> {percentage.toFixed(2)}%</div>
                      <div className="col-md-6 mt-2"><strong>Final Grade:</strong> {autoGrade}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary w-100" disabled={saving || loadingInit}>
                  {saving ? "Generating Marksheet…" : "Generate Marksheet"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </FranchiseLayout>
  );
}
