// src/pages/FranchiseSubjectList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

export default function FranchiseSubjectList() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // FIX: franchiseId fetched from API instead of relying on undefined `franchise`
  const [franchiseId, setFranchiseId] = useState(null);

  const navigate = useNavigate();

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

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [courseRes, subjectRes] = await Promise.all([
          API.get("/franchise/courses"),
          API.get("/franchise/subjects"),
        ]);

        setCourses(courseRes.data || []);
        setSubjects(subjectRes.data || []);
      } catch (err) {
        console.error("load subjects/courses", err);
        setError("Failed to load subjects or courses");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const normalizeCourse = (c) => ({
    id: String(c._id),
    name: c.title || c.name || "Untitled course",
  });

  const getSubjectCourseId = (s) => {
    if (!s.course) return "";
    return typeof s.course === "object"
      ? String(s.course._id || "")
      : String(s.course || s.courseId || "");
  };

  const courseMap = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      const n = normalizeCourse(c);
      map[n.id] = n.name;
    });
    return map;
  }, [courses]);

  const filteredSubjects = useMemo(() => {
    if (selectedCourse === "all") return subjects;
    return subjects.filter((s) => getSubjectCourseId(s) === selectedCourse);
  }, [subjects, selectedCourse]);

  // FIX: defined isOwnSubject — was called but never defined
  const isOwnSubject = (subject) => {
    if (!franchiseId) return false;
    const createdBy =
      typeof subject.createdBy === "object"
        ? (subject.createdBy?._id || subject.createdBy?.id || "").toString()
        : (subject.createdBy || "").toString();
    return createdBy === franchiseId;
  };

  const handleEdit = (s) => {
    navigate(`/franchise/subjects/create?id=${s._id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await API.delete(`/franchise/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete subject");
    }
  };

  if (loading) {
    return (
      <FranchiseLayout>
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-2" />
          Loading subjects…
        </div>
      </FranchiseLayout>
    );
  }

  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Subjects</h2>
          <small className="text-muted">
            View subjects from your courses and admin-created courses.
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/franchise/subjects/create")}
          >
            Add Subject
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="mb-3 col-md-4">
            <select
              className="form-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map((c) => {
                const n = normalizeCourse(c);
                return (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                );
              })}
            </select>
          </div>

          {filteredSubjects.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No subjects found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>Course</th>
                    <th>Subject</th>
                    <th className="text-center">Max Theory</th>
                    <th className="text-center">Max Practical</th>
                    <th className="text-center">Min Marks</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((s) => (
                    <tr key={s._id}>
                      <td>{courseMap[getSubjectCourseId(s)] || "-"}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {s.name}
                          {isOwnSubject(s) && (
                            <span className="badge bg-info text-dark">
                              Your Subject
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">{s.maxMarks ?? 0}</td>
                      <td className="text-center">{s.maxPracticalMarks ?? 0}</td>
                      <td className="text-center">{s.minMarks ?? 0}</td>
                      <td className="text-center">
                        {isOwnSubject(s) ? (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(s)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(s._id)}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-muted small">
                            Admin Subject - View Only
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </FranchiseLayout>
  );
}