import { useState } from "react";
import API from "../api/axiosInstance";

export default function Login() {
  const [type, setType] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let res;

      if (type === "student") {
        res = await API.post("/student-auth/login", {
          username,
          password,
        });

        localStorage.setItem("student_token", res.data.token);
        localStorage.setItem("user_role", "student");
        window.location.href = "/student/profile";
      } else {
        res = await API.post("/franchise-auth/login", {
          username,
          password,
        });

        localStorage.setItem("franchise_token", res.data.token);
        localStorage.setItem("user_role", "franchise");
        window.location.href = "/franchise/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">

              <h3 className="text-center fw-bold mb-1">Welcome Back</h3>
              <p className="text-center text-muted mb-4">
                Login to continue
              </p>

              {error && (
                <div className="alert alert-danger py-2 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* LOGIN TYPE */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Login As</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="franchise">Franchise</option>
                  </select>
                </div>

                {/* USERNAME / ROLL NUMBER */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    {type === "student" ? "Roll Number" : "Username"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={type === "student" ? "Enter roll number" : "Enter username"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                      </button>
                    </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold"
                >
                  Login
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
