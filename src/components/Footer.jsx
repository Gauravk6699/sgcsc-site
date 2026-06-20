import React from "react";

export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-5">
      <div className="container">
        <div className="row">

          {/* Important Links */}
          <div className="col-md-4 mb-4">
            <h5 className="mb-3">Important Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light text-decoration-none hover-link">Home</a></li>
              <li><a href="/about" className="text-light text-decoration-none hover-link">About Us</a></li>
              <li><a href="/long-term-courses" className="text-light text-decoration-none hover-link">Long Term Courses</a></li>
              <li><a href="/short-term-courses" className="text-light text-decoration-none hover-link">Short Term Courses</a></li>
              <li><a href="/certificate-courses" className="text-light text-decoration-none hover-link">Basic Courses</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/franchise-registration" className="text-light text-decoration-none hover-link">Franchise Registration</a></li>
              <li><a href="/student/result-verification" className="text-light text-decoration-none hover-link">Result Verification</a></li>
              <li><a href="/student/certificate-verification" className="text-light text-decoration-none hover-link">Certificate Verification</a></li>
              <li><a href="/login" className="text-light text-decoration-none hover-link">Student/Franchise Login</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-4 mb-4">
            <h5 className="mb-3">Contact Us</h5>
            <p className="mb-1">Address: Raipur (Chiraiyakot), Mau, Uttar Pradesh, India</p>
            <p className="mb-1">Phone: <a href="tel:+919889624850" className="text-light text-decoration-none">+91 9889624850</a></p>
            <p className="mb-0">Email: <a href="mailto:ajayamaurya@gmail.com" className="text-light text-decoration-none">ajayamaurya@gmail.com</a></p>
          </div>

        </div>

        <hr className="border-light" />

        {/* Bottom Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center py-3">
          <p className="mb-1 mb-md-0 text-center text-md-start">
            &copy; 2025 S.G.C.S.C™ All Rights Reserved
          </p>
          <p className="mb-1 mb-md-0 text-center text-md-start d-md-none">
            Last updated: Oct 25, 2025
          </p>
          <div className="text-center text-md-end mt-2 mt-md-0">
            <a href="/disclaimer" className="text-light text-decoration-none me-3 hover-link">Disclaimer</a>
            <a href="/privacy-policy" className="text-light text-decoration-none me-3 hover-link">Privacy Policy</a>
            <a href="/contact" className="text-light text-decoration-none hover-link">Contact</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-link:hover {
          color: #ffc107;
          text-decoration: underline;
        }
      `}</style>
    </footer>
  );
}
