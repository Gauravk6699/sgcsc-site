// src/pages/FranchiseFeeReceipt.jsx
import { useEffect, useState, useRef } from "react";
import API from "../api/axiosInstance";
import { FranchiseLayout } from "./FranchiseStudents";

export default function FranchiseFeeReceipt() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [receiptNo, setReceiptNo] = useState("");
  const [sessionStart, setSessionStart] = useState("");
  const [monthlyFee, setMonthlyFee] = useState(600);
  const [dueAmount, setDueAmount] = useState(200);
  const [whatsappNumber, setWhatsappNumber] = useState("919889624850");

  const [selectedMonths, setSelectedMonths] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const [monthlyData, setMonthlyData] = useState({});
  const [saving, setSaving] = useState(false);

  const printRef = useRef();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getSessionYear = () => {
    if (!sessionStart) return new Date().getFullYear();
    return new Date(sessionStart).getFullYear();
  };

  const initializeMonthlyData = (monthsArray) => {
    const newData = {};
    const year = getSessionYear();
    monthsArray.forEach(index => {
      const monthNum = index + 1;
      newData[index] = {
        date: `${year}-${monthNum.toString().padStart(2, '0')}-01`,
        paid: monthlyFee,
        due: dueAmount
      };
    });
    setMonthlyData(newData);
  };

  const updateMonthlyData = (monthIndex, field, value) => {
    setMonthlyData(prev => ({
      ...prev,
      [monthIndex]: { ...prev[monthIndex], [field]: value }
    }));
  };

  const calculateTotals = () => {
    let totalPaid = 0;
    let totalDue = 0;
    selectedMonths.forEach(index => {
      const data = monthlyData[index];
      if (data) {
        totalPaid += Number(data.paid) || 0;
        totalDue += Number(data.due) || 0;
      }
    });
    return { totalPaid, totalDue };
  };

  const { totalPaid, totalDue } = calculateTotals();

  useEffect(() => {
    fetchStudents();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setReceiptNo(`RC${year}${month}${random}`);
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/franchise/students");
      const data = res.data;
      setStudents(Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Error fetching franchise students:", err);
    }
  };

  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(term) ||
      (s.rollNumber || "").toLowerCase().includes(term) ||
      (s.mobile || "").toLowerCase().includes(term)
    );
  });

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchTerm(student.name || "");
    setShowDropdown(false);

    if (student.sessionStart) {
      setSessionStart(new Date(student.sessionStart).toISOString().slice(0, 10));
    } else if (student.joinDate) {
      setSessionStart(new Date(student.joinDate).toISOString().slice(0, 10));
    } else {
      setSessionStart(new Date().toISOString().slice(0, 10));
    }

    if (student.courses && student.courses.length > 0) {
      setSelectedCourse(student.courses[0]);
      const totalFee = student.courses.reduce((sum, c) => sum + (Number(c.feeAmount) || 0), 0);
      const totalAmountPaid = student.courses.reduce((sum, c) => sum + (Number(c.amountPaid) || 0), 0);
      if (totalFee > 0) {
        setMonthlyFee(Math.ceil(totalFee / 12));
        setDueAmount(totalFee - totalAmountPaid);
      }
    } else {
      setSelectedCourse(null);
      if (student.feeAmount) {
        setMonthlyFee(Math.ceil(student.feeAmount / 12));
        setDueAmount(student.feeAmount - (student.amountPaid || 0));
      }
    }
  };

  const handleCourseChange = (courseIndex) => {
    if (selectedStudent?.courses?.[courseIndex]) {
      const course = selectedStudent.courses[courseIndex];
      setSelectedCourse(course);
      if (course.feeAmount) {
        setMonthlyFee(Math.ceil(course.feeAmount / 12));
        setDueAmount(course.feeAmount - (course.amountPaid || 0));
      }
    }
  };

  const toggleMonth = (monthIndex) => {
    setSelectedMonths(prev =>
      prev.includes(monthIndex)
        ? prev.filter(m => m !== monthIndex)
        : [...prev, monthIndex].sort((a, b) => a - b)
    );
  };

  const applyDefaultToAll = () => {
    initializeMonthlyData(selectedMonths);
  };

  const saveReceipt = async () => {
    if (!selectedStudent) { alert('Please select a student first'); return; }
    if (!receiptNo.trim()) { alert('Please enter a receipt number'); return; }

    setSaving(true);
    try {
      const totalPaidCalc = selectedMonths.reduce((sum, index) => sum + (Number(monthlyData[index]?.paid) || 0), 0);
      const totalDueCalc = selectedMonths.reduce((sum, index) => sum + (Number(monthlyData[index]?.due) || 0), 0);

      const monthlyPayments = selectedMonths.map(index => {
        const data = monthlyData[index] || { date: '', paid: 0, due: 0 };
        return {
          month: new Date(0, index).toLocaleString('default', { month: 'long' }),
          date: data.date,
          paid: data.paid || 0,
          due: data.due || 0,
          status: (data.paid || 0) > 0 ? 'Paid' : 'Pending'
        };
      });

      const receiptData = {
        studentId: selectedStudent._id || selectedStudent.id,
        courseId: selectedCourse?._id,
        receiptNo: receiptNo.trim(),
        sessionStart,
        sessionEnd: (getSessionYear() + 1).toString(),
        monthlyFee,
        dueAmount,
        totalPaid: totalPaidCalc,
        totalDue: totalDueCalc,
        paymentMethod: 'Cash',
        whatsappNumber,
        monthlyPayments,
        remarks: ''
      };

      const response = await API.post('/franchise/receipts', receiptData);
      if (response.data.success) {
        alert('Receipt saved successfully!');
      } else {
        alert('Failed to save receipt: ' + response.data.message);
      }
    } catch (error) {
      console.error('Save receipt error:', error);
      alert('Failed to save receipt: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

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
          ${document.querySelector('style')?.innerHTML || ''}
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
      </html>
    `);
    doc.close();

    printWhenReady(doc, triggerPrint);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('en-GB').replace(/\//g, '-');
  };

  const generateWhatsAppLink = () => {
    if (!selectedStudent) return "#";
    const text = `FEE%20RECEIPT%0AStudent:%20${selectedStudent.name}%0AReceipt%20No:%20${receiptNo}%0ATotal%20Paid:%20Rs.%20${totalPaid}%0ADue:%20Rs.%20${totalDue}`;
    return `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${text}`;
  };

  return (
    <FranchiseLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Fee Receipt</h2>
        </div>

        {/* Student Selection Form */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Search Student</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, roll number, or mobile..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      setSelectedStudent(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
                  {showDropdown && filteredStudents.length > 0 && (
                    <div className="position-absolute w-100 border rounded shadow-sm bg-white" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
                      {filteredStudents.slice(0, 10).map((student) => (
                        <div
                          key={student._id || student.id}
                          className="p-2 border-bottom"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectStudent(student)}
                        >
                          <div className="fw-semibold">{student.name}</div>
                          <div className="small text-muted">
                            {student.rollNumber} | {student.courseName} | {student.mobile}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-2 mb-3">
                <label className="form-label">Receipt No</label>
                <input
                  type="text"
                  className="form-control"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Session Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={sessionStart}
                  onChange={(e) => setSessionStart(e.target.value)}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">WhatsApp No</label>
                <input
                  type="text"
                  className="form-control"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Course Selection */}
            {selectedStudent?.courses?.length > 1 && (
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Select Course for Fee Receipt:</label>
                  <select
                    className="form-select"
                    value={selectedStudent.courses.findIndex(c => c._id === selectedCourse?._id)}
                    onChange={(e) => handleCourseChange(Number(e.target.value))}
                  >
                    {selectedStudent.courses.map((course, index) => (
                      <option key={index} value={index}>
                        {course.courseName} - ₹{course.feeAmount || 0} (Paid: ₹{course.amountPaid || 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Month Selection */}
            {selectedStudent && (
              <>
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label">Select Months:</label>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {months.map((month, index) => (
                        <div className="form-check" key={month}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`month-${index}`}
                            checked={selectedMonths.includes(index)}
                            onChange={() => {
                              toggleMonth(index);
                              if (!selectedMonths.includes(index)) {
                                const year = getSessionYear();
                                const monthNum = index + 1;
                                setTimeout(() => {
                                  setMonthlyData(prev => ({
                                    ...prev,
                                    [index]: {
                                      date: `${year}-${monthNum.toString().padStart(2, '0')}-01`,
                                      paid: monthlyFee,
                                      due: dueAmount
                                    }
                                  }));
                                }, 0);
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor={`month-${index}`}>
                            {month}
                          </label>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setSelectedMonths([0,1,2,3,4,5,6,7,8,9,10,11]); setTimeout(() => initializeMonthlyData([0,1,2,3,4,5,6,7,8,9,10,11]), 0); }}>
                      Select All
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSelectedMonths([]); setMonthlyData({}); }}>
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Default values */}
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label">Default Values for New Months:</label>
                    <div className="row">
                      <div className="col-md-3 mb-2">
                        <label className="form-label">Monthly Fee (₹)</label>
                        <input type="number" className="form-control" value={monthlyFee} onChange={(e) => setMonthlyFee(Number(e.target.value))} />
                      </div>
                      <div className="col-md-3 mb-2">
                        <label className="form-label">Due Amount (₹)</label>
                        <input type="number" className="form-control" value={dueAmount} onChange={(e) => setDueAmount(Number(e.target.value))} />
                      </div>
                      <div className="col-md-3 mb-2 d-flex align-items-end">
                        <button className="btn btn-secondary" onClick={applyDefaultToAll}>Apply to All Months</button>
                      </div>
                      <div className="col-md-3 mb-2">
                        <label className="form-label">Total:</label>
                        <div className="form-control-plaintext">
                          <strong>Paid: ₹{totalPaid} | Due: ₹{totalDue}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Per-month details */}
                {selectedMonths.length > 0 && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <label className="form-label"><strong>Monthly Details (click to edit):</strong></label>
                      <div className="table-responsive">
                        <table className="table table-bordered table-sm">
                          <thead className="table-light">
                            <tr>
                              <th>Month</th>
                              <th>Date</th>
                              <th>Paid (₹)</th>
                              <th>Due (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMonths.map((monthIndex) => (
                              <tr key={months[monthIndex]}>
                                <td>{months[monthIndex]}</td>
                                <td>
                                  <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={monthlyData[monthIndex]?.date || ''}
                                    onChange={(e) => updateMonthlyData(monthIndex, 'date', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={monthlyData[monthIndex]?.paid || 0}
                                    onChange={(e) => updateMonthlyData(monthIndex, 'paid', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={monthlyData[monthIndex]?.due || 0}
                                    onChange={(e) => updateMonthlyData(monthIndex, 'due', e.target.value)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row">
                  <div className="col-md-8 mb-3">
                    <button className="btn btn-success me-2" onClick={saveReceipt} disabled={saving || !selectedStudent}>
                      {saving ? 'Saving...' : 'Save Receipt'}
                    </button>
                    <button className="btn btn-primary me-2" onClick={handlePrint}>
                      Print Receipt
                    </button>
                    <a className="btn btn-success" href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                      Send on WhatsApp
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fee Receipt Preview */}
        <div className="doc-preview-wrapper">
        <div ref={printRef}>
          <style>{`
            .receipt {
              width: 490px;
              margin: 20px auto;
              background: #fff;
              border: 4px solid #25D366;
              padding: 8px;
              font-size: 12px;
              position: relative;
            }
            .center-name {
              width: 100%;
              margin: 5px auto 2px auto;
              background: #25D366;
              color: #fff;
              text-align: center;
              font-weight: bold;
              font-size: 16px;
              padding: 5px 0;
              border-radius: 10px;
              letter-spacing: 2px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .center-address {
              text-align: center;
              font-size: 13px;
              margin-bottom: 10px;
              color: #444;
            }
            .student {
              display: flex;
              justify-content: space-between;
            }
            .details {
              flex: 1;
              margin: 0 8px;
            }
            .row {
              margin-bottom: 3px;
            }
            .label {
              display: inline-block;
              width: 110px;
              font-weight: bold;
            }
            .fee-title {
              margin: 8px auto;
              width: 75%;
              background: #25D366;
              color: #fff;
              text-align: center;
              font-weight: bold;
              padding: 8px 0;
              border-radius: 30px;
              letter-spacing: 1px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .photo img {
              width: 90px;
              height: 90px;
              border: 1px solid #000;
              object-fit: cover;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-top: 6px;
            }
            th, td {
              border: 1px solid #000;
              padding: 3px;
              text-align: center;
            }
            th {
              background: #eaeaea;
            }
            .footer {
              margin-top: 6px;
              font-size: 10px;
            }
          `}</style>

          {selectedStudent ? (
            <div className="receipt">
              <div className="center-name">
                <hr style={{ margin: "2px 0", opacity: 0.5 }} />
                SHREE GANPATI COMPUTER AND STUDY CENTRE
                <hr style={{ margin: "2px 0", opacity: 0.5 }} />
              </div>
              <div className="center-address">
                <u>RAIPUR CHIRAIYAKOT MAU</u>
              </div>

              <div className="student">
                <div className="photo">
                  <img src={selectedStudent.photo || "https://via.placeholder.com/90"} alt="Student" />
                </div>
                <div className="details" style={{ flex: 1 }}>
                  <div className="row"><span className="label">Student's Name</span>: {selectedStudent.name || "N/A"}</div>
                  <div className="row"><span className="label">Father's Name</span>: {selectedStudent.fatherName || "N/A"}</div>
                  <div className="row"><span className="label">Date of Birth</span>: {formatDate(selectedStudent.dob)}</div>
                  <div className="row"><span className="label">Course Name</span>: {selectedCourse?.courseName || selectedStudent.courseName || "N/A"}</div>
                  <div className="row"><span className="label">Session Start</span>: {formatDate(sessionStart)}</div>
                  <div className="row"><span className="label">Receipt No</span>: {receiptNo}</div>
                  <div className="fee-title">STUDENT'S FEE RECEIPT</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Date</th>
                    <th>Paid</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMonths.map((monthIndex) => {
                    const data = monthlyData[monthIndex] || {};
                    return (
                      <tr key={months[monthIndex]}>
                        <td>{months[monthIndex]}</td>
                        <td>{data.date || '-'}</td>
                        <td>{data.paid || 0}</td>
                        <td>{data.due || 0}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <th>Total</th>
                    <th>-</th>
                    <th>{totalPaid}</th>
                    <th>{totalDue}</th>
                  </tr>
                </tbody>
              </table>

              <div className="footer">
                Received By: ............................................................ All fees are non-refundable
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center text-muted py-5">
                <h5>Select a student to generate fee receipt</h5>
                <p>Search for a student above to preview and print the receipt</p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </FranchiseLayout>
  );
}
