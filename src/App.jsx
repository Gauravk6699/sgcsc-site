// src/App.jsx
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SocialStickyBar from './components/SocialStickyBar';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

import CertificateVerify from './pages/CertificateVerify';
import FranchiseProfile from "./pages/FranchiseProfile";
import FranchiseCredits from "./pages/FranchiseCredits";
import FranchiseDashboard from "./pages/FranchiseDashboard";
import FranchiseAddStudent from "./pages/FranchiseAddStudent";
import FranchiseViewStudent from "./pages/FranchiseViewStudent";
import FranchiseStudents from "./pages/FranchiseStudents";
import FranchiseCourses from "./pages/FranchiseCourses";
import FranchiseCreateCourse from "./pages/FranchiseCreateCourse";
import FranchiseSubjectList from "./pages/FranchiseSubjectList";
import FranchiseCreateSubject from "./pages/FranchiseCreateSubject";
import FranchiseResultsList from "./pages/FranchiseResultsList";
import FranchiseViewResult from "./pages/FranchiseViewResult";
import FranchiseAddResults from "./pages/FranchiseAddResults";
import FranchiseCertificateList from "./pages/FranchiseCertificateList";
import FranchiseViewCertificate from "./pages/FranchiseViewCertificate";
import FranchiseCertificateCreate from "./pages/FranchiseCertificateCreate";

import FranchiseTypingCertificateList from "./pages/FranchiseTypingCertificateList";
import FranchiseTypingCertificateCreate from "./pages/FranchiseTypingCertificateCreate";
import FranchiseIdCardCreate from "./pages/FranchiseIdCardCreate";
import FranchiseIdCardList from "./pages/FranchiseIdCardList";
import FranchiseAdmitCardCreate from "./pages/FranchiseAdmitCardCreate";
import FranchiseAdmitCardList from "./pages/FranchiseAdmitCardList";
import FranchiseMarksheetCreate from "./pages/FranchiseMarksheetCreate";
import FranchiseMarksheetList from "./pages/FranchiseMarksheetList";
import FranchiseFeeReceipt from "./pages/FranchiseFeeReceipt";
import FranchiseReceiptManagement from "./pages/FranchiseReceiptManagement";
import FranchiseProtectedRoute from "./components/FranchiseProtectedRoute";
import FranchiseLogin from "./pages/FranchiseLogin";
import { FranchiseAuthProvider } from "./context/FranchiseAuthContext";


import StudentProtectedRoute from "./components/StudentProtectedRoute";
import StudentProfile from "./pages/StudentProfile";
import StudentResults from "./pages/StudentResults";
import StudentAdmitCard from "./pages/StudentAdmitCard";

import StudentEnrollmentVerification from "./pages/StudentEnrollmentVerification";
import StudentResultVerification from "./pages/StudentResultVerification";
import CertificateVerification from "./pages/CertificateVerification";



// DEV: local test logo you uploaded (will be converted to a URL by your tooling)
// Use this only in development; replace with a CDN/real URL in production.
export const DEV_LOGO_URL = '/mnt/data/58e83842-f724-41ef-b678-0d3ad1e30ed8.png';

// Lazy-loaded pages for smaller initial bundle
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Courses = lazy(() => import('./pages/Courses'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const FranchiseVerification = lazy(() => import('./pages/FranchiseVerification'));
const FranchiseList = lazy(() => import('./pages/FranchiseList'));
const FranchiseRegistration = lazy(() => import('./pages/FranchiseRegistration'));
const StudyCenterList = lazy(() => import('./pages/StudyCenterList'));
const AdmitCard = lazy(() => import('./pages/AdmitCard'));

const LongTermCourses = lazy(() => import('./pages/LongTermCourses'));
const ShortTermCourses = lazy(() => import('./pages/ShortTermCourses'));
const CertificateCourses = lazy(() => import('./pages/CertificateCourses'));

const Login = lazy(() => import('./pages/Login'));



// Small UX: scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <FranchiseAuthProvider>
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <SocialStickyBar />

        <div className="flex-grow-1">
          <Suspense fallback={<div className="text-center py-5">Loading...</div>}>
            <ScrollToTop />
            <Routes>
              {/* Public pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />

              {/* Courses */}
              <Route path="/courses" element={<Courses />} />
              <Route path="/long-term-courses" element={<LongTermCourses />} />
              <Route path="/short-term-courses" element={<ShortTermCourses />} />
              <Route path="/certificate-courses" element={<CertificateCourses />} />

              {/* Gallery & Contact */}
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />

              {/* Franchise flows */}
              <Route path="/franchise-list" element={<FranchiseList />} />
              <Route path="/franchise-registration" element={<FranchiseRegistration />} />


              <Route path="/franchise-verification" element={<FranchiseVerification />} />

              {/* Student flows */}
              {/* <Route path="/student-login" element={<StudentLogin />} /> */}
              {/* <Route path="/student-signup" element={<StudentSignup />} /> */}

              <Route path="/login" element={<Login />} />
              <Route path="/franchise-login" element={<FranchiseLogin />} />

              <Route
  path="/student/enrollment-verification"
  element={<StudentEnrollmentVerification />}
/>

<Route
  path="/student/result-verification"
  element={<StudentResultVerification />}
/>

<Route
  path="/student/certificate-verification"
  element={<CertificateVerification />}
/>




<Route
  path="/student/profile"
  element={
    <StudentProtectedRoute>
      <StudentProfile />
    </StudentProtectedRoute>
  }
/>

<Route
  path="/student/results"
  element={
    <StudentProtectedRoute>
      <StudentResults />
    </StudentProtectedRoute>
  }
/>

<Route path="/verify/:certNo" element={<CertificateVerify />} />

<Route
  path="/student/admit-card"
  element={
    <StudentProtectedRoute>
      <StudentAdmitCard />
    </StudentProtectedRoute>
  }
/>



              {/* Utility / verification pages */}
              <Route path="/study-centers" element={<StudyCenterList />} />
              <Route path="/admit-card" element={<AdmitCard />} />

<Route
  path="/franchise/dashboard"
  element={
    <FranchiseProtectedRoute>
      <FranchiseDashboard />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/profile"
  element={
    <FranchiseProtectedRoute>
      <FranchiseProfile />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/credits"
  element={
    <FranchiseProtectedRoute>
      <FranchiseCredits />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/students/add"
  element={
    <FranchiseProtectedRoute>
      <FranchiseAddStudent />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/students/edit/:id"
  element={
    <FranchiseProtectedRoute>
      <FranchiseAddStudent />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/students/view/:id"
  element={
    <FranchiseProtectedRoute>
      <FranchiseViewStudent />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/students"
  element={
    <FranchiseProtectedRoute>
      <FranchiseStudents />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/courses"
  element={
    <FranchiseProtectedRoute>
      <FranchiseCourses />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/courses/create"
  element={
    <FranchiseProtectedRoute>
      <FranchiseCreateCourse />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/subjects"
  element={
    <FranchiseProtectedRoute>
      <FranchiseSubjectList />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/subjects/create"
  element={
    <FranchiseProtectedRoute>
      <FranchiseCreateSubject />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/results"
  element={
    <FranchiseProtectedRoute>
      <FranchiseResultsList />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/results/create"
  element={
    <FranchiseProtectedRoute>
      <FranchiseAddResults />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/results/view/:id"
  element={
    <FranchiseProtectedRoute>
      <FranchiseViewResult />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/results/add"
  element={
    <FranchiseProtectedRoute>
      <FranchiseAddResults />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/certificates"
  element={
    <FranchiseProtectedRoute>
      <FranchiseCertificateList />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/certificates/create"
  element={
    <FranchiseProtectedRoute>
      <FranchiseCertificateCreate />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/certificates/view/:id"
  element={
    <FranchiseProtectedRoute>
      <FranchiseViewCertificate />
    </FranchiseProtectedRoute>
  }
/>



<Route
  path="/franchise/typing-certificates"
  element={
    <FranchiseProtectedRoute>
      <FranchiseTypingCertificateList />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/typing-certificates/create"
  element={
    <FranchiseProtectedRoute>
      <FranchiseTypingCertificateCreate />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/certificates/add"
  element={
    <FranchiseProtectedRoute>
      <FranchiseCertificateCreate />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/id-cards"
  element={
    <FranchiseProtectedRoute>
      <FranchiseIdCardList />
    </FranchiseProtectedRoute>
  }
/>
<Route
  path="/franchise/id-cards/create"
  element={
    <FranchiseProtectedRoute>
      <FranchiseIdCardCreate />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/admit-cards"
  element={
    <FranchiseProtectedRoute>
      <FranchiseAdmitCardList />
    </FranchiseProtectedRoute>
  }
/>
<Route
  path="/franchise/admit-cards/create"
  element={
    <FranchiseProtectedRoute>
      <FranchiseAdmitCardCreate />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/marksheets"
  element={
    <FranchiseProtectedRoute>
      <FranchiseMarksheetList />
    </FranchiseProtectedRoute>
  }
/>
<Route
  path="/franchise/marksheets/create"
  element={
    <FranchiseProtectedRoute>
      <FranchiseMarksheetCreate />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/receipts/create"
  element={
    <FranchiseProtectedRoute>
      <FranchiseFeeReceipt />
    </FranchiseProtectedRoute>
  }
/>

<Route
  path="/franchise/receipts"
  element={
    <FranchiseProtectedRoute>
      <FranchiseReceiptManagement />
    </FranchiseProtectedRoute>
  }
/>


              {/* Legal */}
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              {/* 404 fallback */}
              <Route
                path="*"
                element={
                  <div className="container my-5 text-center">
                    <h2 className="mb-3">404 — Page not found</h2>
                    <p className="text-muted">The page you're looking for doesn't exist.</p>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </div>

        <Footer />
      </div>
    </Router>
    </FranchiseAuthProvider>
  );
}
