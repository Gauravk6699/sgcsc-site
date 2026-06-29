import { useEffect, useState, useRef } from "react";
import API from "../api/axiosInstance";

// Default avatar SVG for students without a photo
const DEFAULT_AVATAR_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="40" fill="#a0a0a0"/>
      <circle cx="40" cy="30" r="14" fill="#e0e0e0"/>
      <path d="M20 68 Q40 45 60 68" fill="#e0e0e0"/>
    </svg>`
  );

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  // Admit card state
  const [admitCards, setAdmitCards] = useState([]);
  const [loadingAdmitCard, setLoadingAdmitCard] = useState(false);
  const [admitCardError, setAdmitCardError] = useState("");
  // ID card state
  const [idCard, setIdCard] = useState(null);
  const [loadingIdCard, setLoadingIdCard] = useState(false);
  const [idCardError, setIdCardError] = useState("");
  // Marksheet state
  const [marksheets, setMarksheets] = useState([]);
  const [downloadingMarksheet, setDownloadingMarksheet] = useState(null);
  // Typing certificate state
  const [typingCerts, setTypingCerts] = useState([]);
  const [loadingTypingCert, setLoadingTypingCert] = useState(false);
  const printRef = useRef();
  
  // Initialize selected course when student data loads
  useEffect(() => {
    if (student) {
      if (student.courses && student.courses.length > 0) {
        setSelectedCourse(student.courses[0]);
      } else {
        setSelectedCourse(null);
      }
    }
  }, [student]);
  
  // Handle course selection change for fee receipt
  const handleCourseChange = (courseIndex) => {
    if (student && student.courses && student.courses[courseIndex]) {
      setSelectedCourse(student.courses[courseIndex]);
    }
  };
  
  // Month names
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Generate default monthly data from student courses
  const generateMonthlyData = () => {
    const data = {};
    const currentYear = new Date().getFullYear();
    const yearStr = currentYear.toString().slice(-2);
    
    // Initialize all 12 months with default values
    for (let i = 0; i < 12; i++) {
      const monthNum = i + 1;
      data[i] = {
        date: `01-${monthNum.toString().padStart(2, '0')}-${yearStr}`,
        paid: student?.feeAmount ? Math.ceil(student.feeAmount / 12) : 0,
        due: 0
      };
    }
    return data;
  };

  const [monthlyData, setMonthlyData] = useState({});
  
  // Calculate totals
  const calculateTotals = () => {
    let totalPaid = 0;
    let totalDue = 0;
    Object.values(monthlyData).forEach(d => {
      totalPaid += Number(d.paid) || 0;
      totalDue += Number(d.due) || 0;
    });
    return { totalPaid, totalDue };
  };
  
  const { totalPaid, totalDue } = calculateTotals();
  
  // Generate receipt number
  const generateReceiptNo = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RC${year}${month}${random}`;
  };
  
  const [receiptNo] = useState(generateReceiptNo());
  
  // Initialize monthly data when student loads
  useEffect(() => {
    if (student) {
      setMonthlyData(generateMonthlyData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);
  
  // Wait for any images in the doc to finish loading (or fail/timeout) before
  // printing, so a slow connection can't print before the photo arrives.
  const printWhenReady = (doc, triggerPrint, maxWaitMs = 3000) => {
    const imgs = Array.from(doc.images || []);
    if (imgs.length === 0) {
      triggerPrint();
      return;
    }
    let remaining = imgs.length;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      triggerPrint();
    };
    const onOne = () => {
      remaining -= 1;
      if (remaining <= 0) finish();
    };
    imgs.forEach((img) => {
      if (img.complete) onOne();
      else {
        img.addEventListener('load', onOne, { once: true });
        img.addEventListener('error', onOne, { once: true });
      }
    });
    setTimeout(finish, maxWaitMs);
  };

  // Print via a hidden same-page <iframe> rather than a popup window.
  // window.open()-based printing is blocked far more aggressively on mobile
  // browsers (especially iOS Safari and in-app/webview browsers) than on
  // desktop, which throws once code tries to write into the null window
  // that comes back. An iframe needs no popup permission at all.
  const handlePrint = () => {
    const printContent = printRef.current;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const cleanup = () => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };

    const triggerPrint = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } finally {
        setTimeout(cleanup, 1000);
      }
    };

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Fee Receipt</title>
        <style>
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .receipt { width: 490px; margin: 20px auto; background: #fff; border: 4px solid #25D366; padding: 8px; font-size: 12px; }
          .center-name { width: 100%; margin: 5px auto 2px auto; background: #25D366; color: #fff; text-align: center; font-weight: bold; font-size: 16px; padding: 5px 0; border-radius: 10px; letter-spacing: 2px; }
          .center-address { text-align: center; font-size: 13px; margin-bottom: 10px; color: #444; }
          .student { display: flex; justify-content: space-between; }
          .details { flex: 1; margin: 0 8px; }
          .row { margin-bottom: 3px; }
          .label { display: inline-block; width: 110px; font-weight: bold; }
          .fee-title { margin: 8px auto; width: 75%; background: #25D366; color: #fff; text-align: center; font-weight: bold; padding: 8px 0; border-radius: 30px; letter-spacing: 1px; }
          .photo img { width: 90px; height: 90px; border: 1px solid #000; object-fit: cover; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
          th, td { border: 1px solid #000; padding: 3px; text-align: center; }
          th { background: #eaeaea; }
          .footer { margin-top: 6px; font-size: 10px; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    doc.close();

    printWhenReady(doc, triggerPrint);
  };
  
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

  // Fetch certificates for the student
  const fetchCertificates = async () => {
    try {
      const res = await API.get("/student-profile/certificate");
      if (res.data?.success && res.data?.data) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
      // Silent fail - certificates may not exist for this student
    }
  };

  // Download certificate as PDF using the template generator (matches admin output exactly)
  const downloadCertificate = async (cert) => {
    setLoadingCertificate(true);
    setCertificateError("");
    try {
      if (!window.CertificateGenerator) {
        setCertificateError("Certificate generator not loaded. Please refresh the page.");
        return;
      }
      await window.CertificateGenerator.loadTemplate("/student-certificate-template.jpeg");
      const studentNameCombined = cert.fatherName
        ? `${cert.name} S/O, D/O, W/O ${cert.fatherName}`
        : cert.name;
      await window.CertificateGenerator.download({
        centerName: cert.centerName || cert.atcName || "",
        studentNameCombined,
        courseName: cert.courseName,
        grade: cert.grade,
        courseDuration: cert.courseDuration,
        coursePeriodFrom: cert.coursePeriodFrom,
        coursePeriodTo: cert.coursePeriodTo,
        certificateNumber: cert.certificateNumber,
        dateOfIssue: cert.issueDate,
        photo: student?.photo || "",
      });
    } catch (err) {
      console.error("Certificate download error:", err);
      setCertificateError("Failed to download certificate. Please try again.");
    } finally {
      setLoadingCertificate(false);
    }
  };

  // Fetch admit card for the student
  const fetchAdmitCard = async () => {
    try {
      const res = await API.get("/student-profile/admit-card");
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setAdmitCards(Array.isArray(data) ? data : [data]);
      }
    } catch (err) {
      console.error("Error fetching admit card:", err);
    }
  };

  // Download admit card using the template
  const downloadAdmitCard = async (admitCard) => {
    setLoadingAdmitCard(true);
    setAdmitCardError("");

    try {
      if (window.AdmitCardGenerator) {
        const admitGen = window.AdmitCardGenerator;
        try {
          await admitGen.loadTemplate('/admit-card-template.jpeg');

          const admitCardData = {
            rollNumber: admitCard.rollNumber,
            studentName: admitCard.name,
            fatherName: admitCard.fatherName || '',
            motherName: admitCard.motherName || '',
            courseName: admitCard.course,
            instituteName: admitCard.institute || '',
            examCenterAddress: admitCard.center || '',
            examDate: admitCard.examDate,
            examTime: admitCard.examTime || '',
            reportingTime: admitCard.reportingTime || '',
            examDuration: admitCard.examDuration || '',
            photo: admitCard.photo || '',
          };

          admitGen.download(admitCardData);
        } catch (templateErr) {
          console.error("Admit card template load error:", templateErr);
          setAdmitCardError("Admit card template not found. Please contact admin.");
        }
      } else {
        setAdmitCardError("Admit card generator not loaded. Please refresh the page.");
      }
    } catch (err) {
      console.error("Download error:", err);
      setAdmitCardError("Failed to download admit card.");
    } finally {
      setLoadingAdmitCard(false);
    }
  };

  // Fetch marksheets for the student
  const fetchMarksheets = async () => {
    try {
      const res = await API.get("/student-profile/marksheet");
      if (res.data?.success && res.data?.data) {
        setMarksheets(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);
      }
    } catch {
      // Silent — marksheet may not exist yet
    }
  };

  const downloadMarksheetPDF = async (ms, index) => {
    setDownloadingMarksheet(index);
    try {
      if (!window.MarksheetGenerator) {
        alert("Marksheet generator not loaded. Please refresh the page.");
        return;
      }
      await window.MarksheetGenerator.loadTemplate("/marksheet-template.jpeg");
      await window.MarksheetGenerator.download(ms);
    } catch (err) {
      console.error("Marksheet download error:", err);
      alert("Failed to generate marksheet. Please try again.");
    } finally {
      setDownloadingMarksheet(null);
    }
  };

  // Fetch typing certificates for the student
  const fetchTypingCerts = async () => {
    try {
      const res = await API.get("/student-profile/typing-certificate");
      if (res.data?.success && res.data?.data) {
        setTypingCerts(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);
      }
    } catch {
      // Silent — typing cert may not exist yet
    }
  };

  const downloadTypingCert = async (cert) => {
    setLoadingTypingCert(true);
    try {
      if (cert.certificateImage) {
        // Pre-rendered image stored — download directly as JPEG
        const link = document.createElement("a");
        link.download = `typing_certificate_${cert.certificateNo || cert.enrollmentNumber || "student"}.jpg`;
        link.href = cert.certificateImage;
        link.click();
      } else if (window.TypingCertificateGenerator) {
        await window.TypingCertificateGenerator.loadTemplate("/typing-certificate-template.jpeg");
        await window.TypingCertificateGenerator.download(cert);
      } else {
        alert("Typing certificate generator not loaded. Please refresh the page.");
      }
    } catch (err) {
      console.error("Typing cert download error:", err);
      alert("Failed to download typing certificate.");
    } finally {
      setLoadingTypingCert(false);
    }
  };

  // Fetch ID card for the student
  const fetchIdCard = async () => {
    try {
      const res = await API.get("/student-profile/id-card");
      if (res.data?.success && res.data?.data) {
        setIdCard(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching ID card:", err);
    }
  };

  // Download ID card using the template
  const downloadIdCard = async () => {
    setLoadingIdCard(true);
    setIdCardError("");

    try {
      if (window.IDCardGenerator) {
        const idCardGen = window.IDCardGenerator;
        try {
          await idCardGen.loadTemplate('/id-card-template.jpeg');
          
          const idCardData = {
            studentName: idCard.studentName,
            fatherName: idCard.fatherName || '',
            motherName: idCard.motherName || '',
            enrollmentNo: idCard.enrollmentNo || '',
            dateOfBirth: idCard.dateOfBirth || '',
            contactNo: idCard.contactNo || '',
            address: idCard.address || '',
            mobileNo: idCard.mobileNo || '',
            courseName: idCard.courseName || '',
            centerName: idCard.centerName || '',
            sessionFrom: idCard.sessionFrom || '',
            sessionTo: idCard.sessionTo || '',
            photo: idCard.photo || '',
          };
          
          idCardGen.download(idCardData);
        } catch (templateErr) {
          console.error("ID card template load error:", templateErr);
          setIdCardError("ID card template not found. Please contact admin.");
        }
      } else {
        setIdCardError("ID card generator not loaded. Please refresh the page.");
      }
    } catch (err) {
      console.error("Download error:", err);
      setIdCardError("Failed to download ID card.");
    } finally {
      setLoadingIdCard(false);
    }
  };
  


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/student-profile/me");
        setStudent(res.data?.data || null);
        // Fetch certificates after profile loads
        fetchCertificates();
        // Fetch admit card after profile loads
        fetchAdmitCard();
        // Fetch ID card after profile loads
        fetchIdCard();
        // Fetch marksheets
        fetchMarksheets();
        // Fetch typing certificates
        fetchTypingCerts();
      } catch (err) {
        console.error("Student profile fetch failed:", err);
        setError("Unable to load student profile at the moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <p>Loading student profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5 text-center">
        <div className="alert alert-warning">{error}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container my-5 text-center">
        <p>No profile data found.</p>
      </div>
    );
  }

  const yesNoBadge = (value) => (
    <span className={`badge ${value ? "bg-success" : "bg-secondary"}`}>
      {value ? "Yes" : "No"}
    </span>
  );

  return (
    <div className="container my-5">
      <h3 className="mb-4 text-center">Student Profile</h3>

      <div className="card shadow-sm">
        <div className="profile-header">
          <div className="row align-items-center">
            <div className="col-md-3 text-center">
              <img
                src={student.photo || DEFAULT_AVATAR_SVG}
                alt="Student"
                className="img-fluid rounded border border-2 border-light"
                style={{ maxHeight: "150px" }}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR_SVG;
                }}
              />
            </div>
            <div className="col-md-9">
              <h4 className="fw-bold mb-1 text-white">{student.name}</h4>
              <p className="mb-1 profile-header-sub">{student.courseName || "-"}</p>
              <p className="mb-0 text-white">
                <strong>Center:</strong> {student.centerName || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="card-body">

          {/* ================= PERSONAL DETAILS ================= */}
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Personal Details
          </h6>
          <table className="table table-bordered mb-4">
            <tbody>
              <tr>
                <th>Gender</th>
                <td>{student.gender || "-"}</td>
              </tr>
              <tr>
                <th>Date of Birth</th>
                <td>{formatDate(student.dob)}</td>
              </tr>
              <tr>
                <th>Father's Name</th>
                <td>{student.fatherName || "-"}</td>
              </tr>
              <tr>
                <th>Mother's Name</th>
                <td>{student.motherName || "-"}</td>
              </tr>
            </tbody>
          </table>

          {/* ================= CONTACT DETAILS ================= */}
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Contact Details
          </h6>
          <table className="table table-bordered mb-4">
            <tbody>
              <tr>
                <th>Email</th>
                <td>{student.email || "-"}</td>
              </tr>
              <tr>
                <th>Mobile</th>
                <td>{student.mobile || student.contact || "-"}</td>
              </tr>
              <tr>
                <th>State</th>
                <td>{student.state || "-"}</td>
              </tr>
              <tr>
                <th>District</th>
                <td>{student.district || "-"}</td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{student.address || "-"}</td>
              </tr>
            </tbody>
          </table>

          {/* ================= ACADEMIC DETAILS ================= */}
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Academic Details
          </h6>
          <table className="table table-bordered mb-4">
            <tbody>
              <tr>
                <th>Exam Passed</th>
                <td>{student.examPassed || "-"}</td>
              </tr>
              <tr>
                <th>Board / University</th>
                <td>{student.board || "-"}</td>
              </tr>
              <tr>
                <th>Marks / Grade</th>
                <td>{student.marksOrGrade || "-"}</td>
              </tr>
              <tr>
                <th>Passing Year</th>
                <td>{student.passingYear || "-"}</td>
              </tr>
            </tbody>
          </table>

          {/* ================= COURSE & SESSION ================= */}
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Course & Session
          </h6>
          
          {/* Show all enrolled courses */}
          {student.courses && student.courses.length > 0 ? (
            student.courses.map((course, index) => (
              <div key={index} className="mb-3">
                <h6 className="text-muted">Course {index + 1}</h6>
                <table className="table table-bordered mb-3">
                  <tbody>
                    <tr>
                      <th>Course Name</th>
                      <td>{course.courseName || "-"}</td>
                    </tr>
                    <tr>
                      <th>Fee</th>
                      <td>₹{course.feeAmount || 0}</td>
                    </tr>
                    <tr>
                      <th>Amount Paid</th>
                      <td>₹{course.amountPaid || 0}</td>
                    </tr>
                    <tr>
                      <th>Pending</th>
                      <td>
                        <span className={`badge ${((course.feeAmount || 0) - (course.amountPaid || 0)) > 0 ? 'bg-danger' : 'bg-success'}`}>
                          ₹{(course.feeAmount || 0) - (course.amountPaid || 0)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>Session Start</th>
                      <td>{formatDate(course.sessionStart)}</td>
                    </tr>
                    <tr>
                      <th>Session End</th>
                      <td>{formatDate(course.sessionEnd)}</td>
                    </tr>
                    <tr>
                      <th>Paid?</th>
                      <td>{yesNoBadge(course.feesPaid)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <table className="table table-bordered mb-4">
              <tbody>
                <tr>
                  <th>Course Name</th>
                  <td>{student.courseName || "-"}</td>
                </tr>
                <tr>
                  <th>Semester</th>
                  <td>{student.semester ?? "-"}</td>
                </tr>
                <tr>
                  <th>Session Start</th>
                  <td>{formatDate(student.sessionStart)}</td>
                </tr>
                <tr>
                  <th>Session End</th>
                  <td>{formatDate(student.sessionEnd)}</td>
                </tr>
                <tr>
                  <th>Join Date</th>
                  <td>{formatDate(student.joinDate)}</td>
                </tr>
              </tbody>
            </table>
          )}

          {/* ================= FEE DETAILS ================= */}
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Fee Details
          </h6>
          <table className="table table-bordered mb-4">
            <tbody>
              <tr>
                <th>Total Fee</th>
                <td>₹{student.feeAmount || 0}</td>
              </tr>
              <tr>
                <th>Amount Paid</th>
                <td>₹{student.amountPaid || 0}</td>
              </tr>
              <tr>
                <th>Pending Amount</th>
                <td>
                  <span className={`badge ${(student.pendingAmount || 0) > 0 ? 'bg-danger' : 'bg-success'}`}>
                    ₹{student.pendingAmount || 0}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Payment Status</th>
                <td>{yesNoBadge(student.feesPaid)}</td>
              </tr>
            </tbody>
          </table>

          {/* ================= FEE RECEIPT ================= */}
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Fee Receipt
          </h6>
          <div className="mb-4">
            <button 
              className="btn btn-primary me-2" 
              onClick={() => setShowReceipt(!showReceipt)}
            >
              {showReceipt ? 'Hide Receipt' : 'View/Print Receipt'}
            </button>
          </div>
          
          {showReceipt && (
            <div className="card mb-4">
              <div className="card-body">
                {/* Course Selection - Only show if student has multiple courses */}
                {student.courses && student.courses.length > 1 && (
                  <div className="mb-3">
                    <label className="form-label">Select Course for Fee Receipt:</label>
                    <select
                      className="form-select"
                      value={student.courses.findIndex(c => c._id === selectedCourse?._id)}
                      onChange={(e) => handleCourseChange(Number(e.target.value))}
                    >
                      {student.courses.map((course, index) => (
                        <option key={index} value={index}>
                          {course.courseName} - ₹{course.feeAmount || 0} (Paid: ₹{course.amountPaid || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div ref={printRef}>
                  <div className="receipt" style={{ maxWidth: '490px', margin: '0 auto', border: '4px solid #25D366', padding: '10px', background: '#fff' }}>
                    <div style={{ background: '#25D366', color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', padding: '8px 0', borderRadius: '10px', marginBottom: '5px' }}>
                      SHREE GANPATI COMPUTER AND STUDY CENTRE
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '13px', marginBottom: '10px', color: '#444' }}>
                      <u>RAIPUR CHIRAIYAKOT MAU</u>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ width: '90px' }}>
                        <img 
                          src={student.photo || DEFAULT_AVATAR_SVG}
                          alt="Student"
                          style={{ width: '90px', height: '90px', border: '1px solid #000', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, marginLeft: '10px' }}>
                        <div style={{ marginBottom: '3px' }}>
                          <strong>Student's Name:</strong> {student.name || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '3px' }}>
                          <strong>Father's Name:</strong> {student.fatherName || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '3px' }}>
                          <strong>Course Name:</strong> {selectedCourse?.courseName || student.courseName || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '3px' }}>
                          <strong>Receipt No:</strong> {receiptNo}
                        </div>
                        <div style={{ background: '#25D366', color: '#fff', textAlign: 'center', fontWeight: 'bold', padding: '8px 0', borderRadius: '30px', marginTop: '8px' }}>
                          STUDENT'S FEE RECEIPT
                        </div>
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid #000', padding: '3px' }}>Month</th>
                          <th style={{ border: '1px solid #000', padding: '3px' }}>Date</th>
                          <th style={{ border: '1px solid #000', padding: '3px' }}>Paid</th>
                          <th style={{ border: '1px solid #000', padding: '3px' }}>Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(monthlyData).map((monthIndex) => (
                          <tr key={monthIndex}>
                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{months[monthIndex]}</td>
                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{monthlyData[monthIndex]?.date || '-'}</td>
                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{monthlyData[monthIndex]?.paid || 0}</td>
                            <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{monthlyData[monthIndex]?.due || 0}</td>
                          </tr>
                        ))}
                        <tr>
                          <th style={{ border: '1px solid #000', padding: '3px' }}>Total</th>
                          <th style={{ border: '1px solid #000', padding: '3px' }}>-</th>
                          <th style={{ border: '1px solid #000', padding: '3px' }}>{totalPaid}</th>
                          <th style={{ border: '1px solid #000', padding: '3px' }}>{totalDue}</th>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ marginTop: '10px', fontSize: '10px' }}>
                      Received By: ............................................................ All fees are non-refundable
                    </div>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <button className="btn btn-success" onClick={handlePrint}>
                    Download/Print Receipt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= ACCOUNT / STATUS ================= */}
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Account & Status
          </h6>
          <table className="table table-bordered mb-0">
            <tbody>
              <tr>
                <th>Username</th>
                <td>{student.username || "-"}</td>
              </tr>
              <tr>
                <th>Certified</th>
                <td>{yesNoBadge(student.isCertified)}</td>
              </tr>
            </tbody>
          </table>

          {/* ================= ADMIT CARD ================= */}
          {admitCards.length > 0 && (
            <>
              <h6 className="fw-bold border-bottom pb-2 mb-3 mt-4">
                My Admit Card{admitCards.length > 1 ? "s" : ""}
              </h6>
              <div className="mb-4">
                {admitCardError && (
                  <div className="alert alert-warning mb-3">
                    {admitCardError}
                  </div>
                )}
                {admitCards.map((admitCard, idx) => (
                  <div className="card mb-3" key={`${admitCard.rollNumber}-${idx}`}>
                    <div className="card-body">
                      <div className="row">
                        {admitCard.photo && (
                          <div className="col-md-3 text-center mb-3">
                            <img
                              src={admitCard.photo}
                              alt="Student"
                              className="img-thumbnail"
                              style={{ maxWidth: '120px', maxHeight: '120px' }}
                            />
                          </div>
                        )}
                        <div className={admitCard.photo ? "col-md-9" : "col-12"}>
                          <table className="table table-sm mb-3">
                            <tbody>
                              <tr>
                                <th>Roll Number</th>
                                <td>{admitCard.rollNumber || "-"}</td>
                              </tr>
                              <tr>
                                <th>Course</th>
                                <td>{admitCard.course || "-"}</td>
                              </tr>
                              {admitCard.examDate && (
                                <tr>
                                  <th>Exam Date</th>
                                  <td>{admitCard.examDate}</td>
                                </tr>
                              )}
                              {admitCard.examTime && (
                                <tr>
                                  <th>Exam Time</th>
                                  <td>{admitCard.examTime}</td>
                                </tr>
                              )}
                              {admitCard.center && (
                                <tr>
                                  <th>Exam Center</th>
                                  <td>{admitCard.center}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm w-100"
                        onClick={() => downloadAdmitCard(admitCard)}
                        disabled={loadingAdmitCard}
                      >
                        {loadingAdmitCard ? "Downloading..." : "Download Admit Card"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ================= ID CARD ================= */}
          {idCard && (
            <>
              <h6 className="fw-bold border-bottom pb-2 mb-3 mt-4">
                My ID Card
              </h6>
              <div className="mb-4">
                {idCardError && (
                  <div className="alert alert-warning mb-3">
                    {idCardError}
                  </div>
                )}
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      {idCard.photo && (
                        <div className="col-md-3 text-center mb-3">
                          <img 
                            src={idCard.photo} 
                            alt="Student" 
                            className="img-thumbnail" 
                            style={{ maxWidth: '120px', maxHeight: '120px' }}
                          />
                        </div>
                      )}
                      <div className={idCard.photo ? "col-md-9" : "col-12"}>
                        <table className="table table-sm mb-3">
                          <tbody>
                            <tr>
                              <th>Enrollment No.</th>
                              <td>{idCard.enrollmentNo || "-"}</td>
                            </tr>
                            <tr>
                              <th>Course</th>
                              <td>{idCard.courseName || "-"}</td>
                            </tr>
                            <tr>
                              <th>Center</th>
                              <td>{idCard.centerName || "-"}</td>
                            </tr>
                            {idCard.sessionFrom && idCard.sessionTo && (
                              <tr>
                                <th>Session</th>
                                <td>{idCard.sessionFrom} - {idCard.sessionTo}</td>
                              </tr>
                            )}
                            <tr>
                              <th>Date of Birth</th>
                              <td>{idCard.dateOfBirth || "-"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm w-100"
                      onClick={downloadIdCard}
                      disabled={loadingIdCard}
                    >
                      {loadingIdCard ? "Downloading..." : "Download ID Card"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ================= CERTIFICATES ================= */}
          {certificates && certificates.length > 0 && (
            <>
              <h6 className="fw-bold border-bottom pb-2 mb-3 mt-4">
                My Certificates
              </h6>
              <div className="mb-4">
                {certificateError && (
                  <div className="alert alert-warning mb-3">
                    {certificateError}
                  </div>
                )}
                <div className="row">
                  {certificates.map((cert, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-award me-2"></i>
                            {cert.courseName || "Certificate"}
                          </h6>
                          <table className="table table-sm mb-3">
                            <tbody>
                              <tr>
                                <th>Certificate No.</th>
                                <td>{cert.certificateNumber || "-"}</td>
                              </tr>
                              <tr>
                                <th>Issue Date</th>
                                <td>{formatDate(cert.issueDate)}</td>
                              </tr>
                              {cert.renewalDate && (
                                <tr>
                                  <th>Renewal Date</th>
                                  <td>{formatDate(cert.renewalDate)}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          <button
                            className="btn btn-primary btn-sm w-100"
                            onClick={() => downloadCertificate(cert)}
                            disabled={loadingCertificate}
                          >
                            {loadingCertificate ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Generating...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-download me-2"></i>
                                Download Certificate
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ================= TYPING CERTIFICATES ================= */}
          {typingCerts && typingCerts.length > 0 && (
            <>
              <h6 className="fw-bold border-bottom pb-2 mb-3 mt-4">
                My Typing Certificates
              </h6>
              <div className="mb-4">
                <div className="row">
                  {typingCerts.map((cert, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-keyboard me-2"></i>
                            Typing Certificate
                          </h6>
                          <table className="table table-sm mb-3">
                            <tbody>
                              <tr>
                                <th>Certificate No.</th>
                                <td>{cert.certificateNo || "-"}</td>
                              </tr>
                              <tr>
                                <th>Typing Type</th>
                                <td>{cert.computerTyping || "-"}</td>
                              </tr>
                              <tr>
                                <th>Words/Min</th>
                                <td>{cert.wordsPerMinute || "-"}</td>
                              </tr>
                              <tr>
                                <th>Grade</th>
                                <td>{cert.grade || "-"}</td>
                              </tr>
                              <tr>
                                <th>Issue Date</th>
                                <td>{formatDate(cert.dateOfIssue)}</td>
                              </tr>
                            </tbody>
                          </table>
                          <button
                            className="btn btn-primary btn-sm w-100"
                            onClick={() => downloadTypingCert(cert)}
                            disabled={loadingTypingCert}
                          >
                            {loadingTypingCert ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Generating...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-download me-2"></i>
                                Download Typing Certificate
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ================= MARKSHEETS ================= */}
          {marksheets && marksheets.length > 0 && (
            <>
              <h6 className="fw-bold border-bottom pb-2 mb-3 mt-4">
                My Marksheets
              </h6>
              <div className="mb-4">
                <div className="row">
                  {marksheets.map((ms, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-file-earmark-text me-2"></i>
                            {ms.courseName || "Marksheet"}
                          </h6>
                          <table className="table table-sm mb-3">
                            <tbody>
                              <tr>
                                <th>Enrollment No.</th>
                                <td>{ms.enrollmentNo || "-"}</td>
                              </tr>
                              <tr>
                                <th>Roll Number</th>
                                <td>{ms.rollNumber || "-"}</td>
                              </tr>
                              <tr>
                                <th>Percentage</th>
                                <td>{ms.percentage != null ? `${ms.percentage.toFixed(2)}%` : "-"}</td>
                              </tr>
                              <tr>
                                <th>Overall Grade</th>
                                <td>
                                  <span className="badge bg-success">{ms.overallGrade || "-"}</span>
                                </td>
                              </tr>
                              <tr>
                                <th>Issue Date</th>
                                <td>{formatDate(ms.dateOfIssue)}</td>
                              </tr>
                            </tbody>
                          </table>
                          <button
                            className="btn btn-primary btn-sm w-100"
                            onClick={() => downloadMarksheetPDF(ms, index)}
                            disabled={downloadingMarksheet === index}
                          >
                            {downloadingMarksheet === index ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Generating...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-download me-2"></i>
                                Download Marksheet
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
