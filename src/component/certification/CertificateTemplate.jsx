import React from 'react';
import './CertificateTemplate.css';

/**
 * CertificateTemplate Component - Traditional Ornate Design
 * Displays a professional certificate with classic ornate borders and decorative elements
 */
const CertificateTemplate = React.forwardRef(({
  studentName = "Student Name",
  courseName = "Course Name",
  completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  score = 100,
  passingScore = 80,
  collegeName = "Z1 Education",
  collegeLogo,
  collegeSignature,
  certificateNumber = "CERT-001",
  principalName = 'Director',
}, ref) => {
  return (
    <div ref={ref} className="certificate-container">
      <div className="certificate-wrapper">
        {/* Decorative Border Wrapper */}
        <div className="certificate-border-frame">
          <div className="certificate-corner top-left"></div>
          <div className="certificate-corner top-right"></div>
          <div className="certificate-corner bottom-left"></div>
          <div className="certificate-corner bottom-right"></div>
        </div>

        {/* Main Content */}
        <div className="certificate-content">
          {/* Logo Badge at Top Center */}
          <div className="certificate-logo-section">
            {collegeLogo ? (
              <img
                src={collegeLogo}
                alt={`${collegeName} Logo`}
                className="logo-badge-image"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="logo-badge-placeholder">
                <svg viewBox="0 0 100 100" className="badge-svg">
                  <circle cx="50" cy="50" r="45" fill="#f4a460" stroke="#8b7355" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="35" fill="white" stroke="#8b7355" strokeWidth="1.5"/>
                  <path d="M 50 20 L 61 35 L 77 35 L 64 45 L 70 60 L 50 50 L 30 60 L 36 45 L 23 35 L 39 35 Z" fill="#228b22"/>
                  <circle cx="50" cy="35" r="4" fill="white"/>
                </svg>
              </div>
            )}
          </div>

          {/* Main Title */}
          <h1 className="certificate-title">Certificate of Appreciation</h1>

          {/* Subtitle */}
          <p className="certificate-subtitle">This Certificate is Proudly Presented to</p>

          {/* Student Name - Elegant Script Style */}
          <h2 className="student-name">{studentName}</h2>
          <div className="name-underline"></div>

          {/* Achievement Description */}
          <p className="achievement-text">
            For Successfully Completing the Course
          </p>

          {/* Course Name - Bold & Prominent */}
          <h3 className="course-name">{courseName}</h3>

          {/* Decorative Elements */}
          <div className="decorative-divider"></div>

          {/* Details Section */}
          <div className="details-section">
            <p className="presented-line">
              Presented this {completionDate}
            </p>
            <p className="certificate-reference">
              Certificate No: <span className="cert-number">{certificateNumber}</span>
            </p>
          </div>

          {/* Footer - Signature Lines */}
          <div className="certificate-footer">
            <div className="signature-column">
              <div className="signature-space"></div>
              <div className="signature-line"></div>
              <p className="signature-label">SIGNATURE</p>
            </div>
            <div className="signature-column">
              <div className="signature-space"></div>
              <div className="signature-line"></div>
              <p className="signature-label">DATE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
