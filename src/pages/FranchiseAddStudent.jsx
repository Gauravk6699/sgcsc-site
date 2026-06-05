// src/pages/FranchiseAddStudent.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

// ---- Constants ----
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const initialForm = {
  name: "",
  gender: "",
  fatherName: "",
  motherName: "",
  dob: "",
  email: "",
  mobile: "",
  state: "",
  district: "",
  address: "",
  examPassed: "",
  marksOrGrade: "",
  board: "",
  passingYear: "",
  username: "",
  password: "",
  courseId: "",
  courseName: "",
  sessionStart: "",
  sessionEnd: "",
  feesPaid: false,
  isCertified: false,
  rollNumber: "",
  enrollmentNo: "",
  feeAmount: 0,
  courses: [
    {
      courseId: "",
      courseName: "",
      feeAmount: 0,
      amountPaid: 0,
      feesPaid: false,
      sessionStart: "",
      sessionEnd: "",
    },
  ],
};

const MAX_PHOTO_SIZE_MB = 2;
const MAX_PHOTO_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

export default function FranchiseAddStudent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // ---------- Fetch student data for edit mode ----------
  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchStudent = async () => {
      setLoadingMeta(true);
      try {
        const res = await API.get(`/franchise/students/${id}`);
        const student = res.data;
        if (student) {
          setForm({
            name: student.name || "",
            gender: student.gender || "",
            fatherName: student.fatherName || "",
            motherName: student.motherName || "",
            dob: student.dob ? student.dob.split("T")[0] : "",
            email: student.email || "",
            mobile: student.mobile || "",
            state: student.state || "",
            district: student.district || "",
            address: student.address || "",
            examPassed: student.examPassed || "",
            marksOrGrade: student.marksOrGrade || "",
            board: student.board || "",
            passingYear: student.passingYear || "",
            username: student.username || "",
            password: "",
            courseId: student.courseId || "",
            courseName: student.courseName || "",
            sessionStart: student.sessionStart
              ? student.sessionStart.split("T")[0]
              : "",
            sessionEnd: student.sessionEnd
              ? student.sessionEnd.split("T")[0]
              : "",
            feesPaid: student.feesPaid || false,
            isCertified: student.isCertified || false,
            rollNumber: student.rollNumber || "",
            enrollmentNo: student.enrollmentNo || student.enrollment || "",
            feeAmount: student.feeAmount || 0,
            courses:
              student.courses && student.courses.length > 0
                ? student.courses
                : initialForm.courses,
          });
          if (student.photo) {
            setPhotoPreview(student.photo);
          }
        }
      } catch (err) {
        console.error("fetchStudent error:", err);
        setError("Failed to load student data");
      } finally {
        setLoadingMeta(false);
      }
    };
    fetchStudent();
  }, [id, isEditMode]);

  // ---------- Meta (courses) ----------
  useEffect(() => {
    let mounted = true;

    async function loadMeta() {
      setLoadingMeta(true);
      setError("");
      try {
        const coursesRes = await API.get("/courses");
        if (mounted && coursesRes.status === 200) {
          const data = coursesRes.data;
          setCourses(Array.isArray(data) ? data : data?.data || []);
        }
      } catch (err) {
        console.error("loadMeta error:", err);
        if (mounted) {
          setError(
            err.userMessage ||
              "Failed to load courses. You can still fill the form."
          );
        }
      } finally {
        if (mounted) setLoadingMeta(false);
      }
    }

    loadMeta();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------- Helpers ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === "mobile") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, mobile: digits }));
      return;
    }

    if (name === "state") {
      setForm((prev) => ({ ...prev, state: value, district: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = () => {
    const newCourse = {
      courseId: "",
      courseName: "",
      feeAmount: 0,
      amountPaid: 0,
      feesPaid: false,
      sessionStart: "",
      sessionEnd: "",
    };
    setForm((prev) => ({ ...prev, courses: [...(prev.courses || []), newCourse] }));
  };

  const handleRemoveCourse = (index) => {
    setForm((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index),
    }));
  };

  const handleCourseArrayChange = (index, field, value) => {
    setForm((prev) => {
      const updatedCourses = [...(prev.courses || [])];

      if (field === "courseId") {
        const selected = courses.find(
          (c) => (c._id || c.id || "").toString() === value
        );
        updatedCourses[index] = {
          ...updatedCourses[index],
          courseId: value,
          courseName: selected ? selected.name || selected.title || "" : "",
          feeAmount: selected
            ? selected.feeAmount || 0
            : updatedCourses[index].feeAmount || 0,
        };
      } else if (field === "amountPaid") {
        updatedCourses[index] = {
          ...updatedCourses[index],
          amountPaid: Number(value) || 0,
        };
      } else if (field === "feesPaid") {
        updatedCourses[index] = { ...updatedCourses[index], feesPaid: value };
      } else {
        updatedCourses[index] = { ...updatedCourses[index], [field]: value };
      }

      return { ...prev, courses: updatedCourses };
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;

    if (!file) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setError(`Photo is too large. Maximum allowed size is ${MAX_PHOTO_SIZE_MB} MB.`);
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }

    setError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const isValidMobile = (digits) => /^\d{10}$/.test(digits || "");

  const validateForm = () => {
    if (!form.rollNumber.trim()) {
      setError("Roll number is required.");
      return false;
    }
    if (!form.enrollmentNo.trim()) {
      setError("Enrollment number is required.");
      return false;
    }
    if (!form.name.trim()) {
      setError("Student Name is required.");
      return false;
    }
    if (!isValidMobile(form.mobile)) {
      setError("Mobile number must be exactly 10 digits (without +91).");
      return false;
    }
    if (!form.state) {
      setError("State is required.");
      return false;
    }
    if (!form.district) {
      setError("District is required.");
      return false;
    }
    if (!form.address.trim()) {
      setError("Full address is required.");
      return false;
    }
    return true;
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const fd = new FormData();

      const coursesPayload = form.courses
        ? form.courses.map((c) => ({
            course: c.courseId || null,
            courseName: c.courseName,
            feeAmount: Number(c.feeAmount) || 0,
            amountPaid: Number(c.amountPaid) || 0,
            feesPaid: c.feesPaid || false,
            sessionStart: c.sessionStart || null,
            sessionEnd: c.sessionEnd || null,
          }))
        : [];

      const payload = {
        ...form,
        mobile: `+91${form.mobile}`,
        feeAmount: Number(form.feeAmount) || 0,
        amountPaid: Number(form.amountPaid) || 0,
        courses: coursesPayload,
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (Array.isArray(value)) {
            fd.append(key, JSON.stringify(value));
          } else {
            fd.append(key, value);
          }
        }
      });

      if (photoFile) {
        fd.append("photo", photoFile);
      }

      let res;
      if (isEditMode && id) {
        res = await API.put(`/franchise/students/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Student updated successfully.");
      } else {
        res = await API.post("/franchise/students", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Student added successfully.");
      }

      console.log("student saved:", res.data);

      if (!isEditMode) {
        setForm(initialForm);
        setPhotoFile(null);
        setPhotoPreview("");
      }

      setTimeout(() => {
        navigate("/franchise/students");
      }, 800);
    } catch (err) {
      console.error("student error:", err);
      setError(
        err.response?.data?.message ||
          err.userMessage ||
          (isEditMode ? "Failed to update student" : "Failed to add student")
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <FranchiseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0">
            {isEditMode ? "Edit Student" : "Add Student"}
          </h2>
          <small className="text-muted">
            Fill all required details to register a new student for your franchise.
          </small>
        </div>
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => navigate("/franchise/students")}
        >
          Back to Students
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card shadow-sm mx-auto"
        style={{ maxWidth: "1400px" }}
      >
        <div className="card-body">
          {loadingMeta && (
            <div className="mb-3 small text-muted">Loading courses…</div>
          )}

          {/* Roll Number & Enrollment */}
          <div className="row g-3 mb-4">
            <div className="col-lg-4 col-md-4">
              <label className="form-label">
                Roll Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-lg-4">
              <label className="form-label">
                Enrollment Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="enrollmentNo"
                value={form.enrollmentNo}
                onChange={handleChange}
                placeholder="Enter enrollment number"
                required
              />
            </div>
          </div>

          {/* Basic Info */}
          <h5 className="border-bottom pb-2 mb-3">Basic Information</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">
                Student Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="dob"
                value={form.dob}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Father's Name</label>
              <input
                type="text"
                className="form-control"
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Mother's Name</label>
              <input
                type="text"
                className="form-control"
                name="motherName"
                value={form.motherName}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Mobile <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                className="form-control"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
                maxLength={10}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Address */}
          <h5 className="border-bottom pb-2 mb-3">Address</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">
                State <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="state"
                value={form.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">
                District <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="district"
                value={form.district}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Full Address <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Education */}
          <h5 className="border-bottom pb-2 mb-3">Education Details</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label">Exam Passed</label>
              <input
                type="text"
                className="form-control"
                name="examPassed"
                value={form.examPassed}
                onChange={handleChange}
                placeholder="e.g., 10th, 12th"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Marks/Grade</label>
              <input
                type="text"
                className="form-control"
                name="marksOrGrade"
                value={form.marksOrGrade}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Board</label>
              <input
                type="text"
                className="form-control"
                name="board"
                value={form.board}
                onChange={handleChange}
                placeholder="e.g., CBSE, State"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Passing Year</label>
              <input
                type="text"
                className="form-control"
                name="passingYear"
                value={form.passingYear}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Course Selection */}
          <h5 className="border-bottom pb-2 mb-3">Course Details</h5>
          <div className="mb-4">
            {form.courses &&
              form.courses.length > 0 &&
              form.courses.map((course, index) => (
                <div key={index} className="card mb-3">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Select Course</label>
                        <select
                          className="form-select"
                          value={course.courseId}
                          onChange={(e) =>
                            handleCourseArrayChange(index, "courseId", e.target.value)
                          }
                        >
                          <option value="">Select Course</option>
                          {courses.map((c) => (
                            <option key={c._id || c.id} value={c._id || c.id}>
                              {c.name || c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Fee Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          value={course.feeAmount}
                          onChange={(e) =>
                            handleCourseArrayChange(index, "feeAmount", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Amount Paid</label>
                        <input
                          type="number"
                          className="form-control"
                          value={course.amountPaid}
                          onChange={(e) =>
                            handleCourseArrayChange(index, "amountPaid", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Session Start</label>
                        <input
                          type="date"
                          className="form-control"
                          value={course.sessionStart}
                          onChange={(e) =>
                            handleCourseArrayChange(index, "sessionStart", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Session End</label>
                        <input
                          type="date"
                          className="form-control"
                          value={course.sessionEnd}
                          onChange={(e) =>
                            handleCourseArrayChange(index, "sessionEnd", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-12">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`feesPaid-${index}`}
                            checked={course.feesPaid}
                            onChange={(e) =>
                              handleCourseArrayChange(index, "feesPaid", e.target.checked)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`feesPaid-${index}`}
                          >
                            Fees Paid
                          </label>
                        </div>
                      </div>
                      {form.courses.length > 1 && (
                        <div className="col-md-12">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveCourse(index)}
                          >
                            Remove Course
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleAddCourse}
            >
              + Add Another Course
            </button>
          </div>

          {/* Login Credentials */}
          <h5 className="border-bottom pb-2 mb-3">
            Login Credentials (Optional)
          </h5>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          {/* Photo */}
          <h5 className="border-bottom pb-2 mb-3">Photo (Optional)</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label">Upload Photo</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <small className="text-muted">
                Max size: {MAX_PHOTO_SIZE_MB} MB
              </small>
            </div>
            {photoPreview && (
              <div className="col-md-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="text-end">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading
                ? isEditMode
                  ? "Updating Student..."
                  : "Adding Student..."
                : isEditMode
                ? "Update Student"
                : "Add Student"}
            </button>
          </div>
        </div>
      </form>
    </FranchiseLayout>
  );
}