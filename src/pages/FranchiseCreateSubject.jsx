// src/pages/FranchiseCreateSubject.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

export default function FranchiseCreateSubject() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const subjectId = params.get("id");

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  // FIX: franchiseId fetched from API instead of referencing undefined `franchise`
  const [franchiseId, setFranchiseId] = useState(null);

  const [courseId, setCourseId] = useState("");
  const [name, setName] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [maxPracticalMarks, setMaxPracticalMarks] = useState("");
  const [minMarks, setMinMarks] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Load franchise profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/franchise/profile");
        setFranchiseId((res.data?._id || res.data?.id || "").toString());
      } catch (err) {
        console.error("Failed to load franchise profile:", err);
      }
    };
    loadProfile();
  }, []);

  /* ----------------------------------------------------
     Load courses FIRST (dropdown source of truth)
  ---------------------------------------------------- */
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await API.get("/franchise/courses");
        const arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setCourses(arr);
      } catch (err) {
        console.error("load courses", err);
        setError("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

  /* ----------------------------------------------------
     Load subject AFTER courses are available
  ---------------------------------------------------- */
  useEffect(() => {
    const loadSubject = async () => {
      if (!subjectId || courses.length === 0) {
        setInitialLoaded(true);
        return;
      }

      try {
        const res = await API.get(`/franchise/subjects/${subjectId}`);
        const s = res.data || {};

        // FIX: use franchiseId state instead of undefined `franchise`
        if (s.createdBy && franchiseId && s.createdBy !== franchiseId) {
          setError("You can only edit subjects you created.");
          return;
        }

        const extractedCourseId =
          s.course && typeof s.course === "object"
            ? s.course._id || s.course.id
            : s.course || s.courseId || "";

        setCourseId(String(extractedCourseId));
        setName(s.name || s.subjectName || "");
        setMaxMarks(s.maxMarks ?? s.max ?? "");
        setMaxPracticalMarks(s.maxPracticalMarks ?? "");
        setMinMarks(s.minMarks ?? s.min ?? "");
      } catch (err) {
        console.error("load subject", err);
        setError("Failed to load subject");
      } finally {
        setInitialLoaded(true);
      }
    };

    loadSubject();
  }, [subjectId, courses, franchiseId]);

  /* ----------------------------------------------------
     Submit
  ---------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!courseId) {
      setError("Please select a course");
      return;
    }

    if (!name.trim()) {
      setError("Subject name is required");
      return;
    }

    const payload = {
      course: courseId,
      name: name.trim(),
      maxMarks: Number(maxMarks) || 0,
      maxPracticalMarks: Number(maxPracticalMarks) || 0,
      minMarks: Number(minMarks) || 0,
    };

    setSaving(true);
    try {
      if (subjectId) {
        await API.put(`/franchise/subjects/${subjectId}`, payload);
      } else {
        await API.post("/franchise/subjects", payload);
      }
      navigate("/franchise/subjects");
    } catch (err) {
      console.error("save subject", err);
      setError(err?.response?.data?.message || "Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/franchise/subjects");

  if (!initialLoaded && subjectId) {
    return (
      <FranchiseLayout>
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-2" />
          Loading subject…
        </div>
      </FranchiseLayout>
    );
  }

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">
            {subjectId ? "Edit Subject" : "Create Subject"}
          </h2>
          <small className="text-muted">
            {subjectId
              ? "Update your subject details."
              : "Creating a new subject will deduct credits from your account."}
          </small>
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={handleCancel}
          disabled={saving}
        >
          Back to Subjects
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form
        onSubmit={handleSubmit}
        className="card shadow-sm p-4"
        style={{ maxWidth: 700 }}
      >
        <div className="mb-3">
          <label className="form-label">
            Course <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={loadingCourses}
            required
          >
            <option value="">
              {loadingCourses ? "Loading courses…" : "Select course"}
            </option>
            {courses.map((c) => (
              <option key={c._id} value={String(c._id)}>
                {c.title || c.name || "Untitled course"}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Subject Name <span className="text-danger">*</span>
          </label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Computer Fundamentals"
            required
          />
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Max Theory Marks</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              placeholder="100"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Max Practical Marks</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={maxPracticalMarks}
              onChange={(e) => setMaxPracticalMarks(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Minimum Marks</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={minMarks}
              onChange={(e) => setMinMarks(e.target.value)}
              placeholder="35"
            />
          </div>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary me-2"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : subjectId ? "Save Changes" : "Create Subject"}
          </button>
        </div>
      </form>
    </FranchiseLayout>
  );
}