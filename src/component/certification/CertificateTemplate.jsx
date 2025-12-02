import React from 'react';
import './CertificateTemplate.css';

/**
 * CertificateTemplate Component - Frontend Edition
 * Displays a professional certificate for download with:
 * - Top Left: Z1 Logo
 * - Top Right: College Logo (dynamic)
 * - Bottom Left: Z1 Signature
 * - Bottom Right: College Signature (dynamic)
 * - Center: Certificate details (student name, course, date, score, etc.)
 *
 * This component is optimized for html2canvas PDF generation
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
        {/* Certificate Border */}
        <div className="certificate-border">

          {/* Header Section with Logos */}
          <div className="certificate-header">
            {/* Top Left - Z1 Logo */}
            <div className="top-left-section">
              <div className="logo-wrapper z1-logo-wrapper">
                <img
                  src="/z1logo.png"
                  alt="Z1 Logo"
                  className="z1-logo-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>

            {/* Center - Certificate Title */}
            <div className="title-section">
              <div className="certificate-title">
                CERTIFICATE OF COMPLETION
              </div>
              <div className="decorative-line"></div>
              <div className="certificate-subtitle">
                This is to certify that
              </div>
            </div>

            {/* Top Right - College Logo */}
            <div className="top-right-section">
              <div className="logo-wrapper college-logo-wrapper">
                {collegeLogo ? (
                  <img
                    src={collegeLogo}
                    alt={`${collegeName} Logo`}
                    className="college-logo-image"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="certificate-body">
            {/* Student Name */}
            <div className="student-name-section">
              <h1 className="student-name">{studentName}</h1>
              <div className="underline"></div>
            </div>

            {/* Certificate Text */}
            <div className="certificate-text">
              <p className="has-completed">
                has successfully completed the course
              </p>
            </div>

            {/* Course Name */}
            <div className="course-section">
              <h2 className="course-name">{courseName}</h2>
              <div className="underline course-underline"></div>
            </div>

            {/* Details Section */}
            <div className="details-section">
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Institution:</span>
                  <span className="detail-value">{collegeName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date of Completion:</span>
                  <span className="detail-value">{completionDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Score:</span>
                  <span className="detail-value">{score}% (Passing: {passingScore}%)</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Certificate No:</span>
                  <span className="detail-value">{certificateNumber}</span>
                </div>
              </div>
            </div>

            {/* Signature Section - Bottom Left and Right */}
            <div className="signature-section">
              {/* Bottom Left - Z1 Signature */}
              <div className="signature-area left-signature">
                <div className="signature-image-wrapper">
                  <img
                    src="/z1-sign.png"
                    alt="Z1 Signature"
                    className="college-signature-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      // Show placeholder if image fails to load
                      const placeholder = document.createElement('div');
                      placeholder.className = 'z1-signature-placeholder';
                      placeholder.innerHTML = '<p className="signature-placeholder-text">Z1 Signature</p>';
                      e.target.parentNode.appendChild(placeholder);
                    }}
                  />
                </div>
                <div className="signature-line"></div>
                <p className="signature-label">Z1 Admin</p>
                <p className="signature-title">Authorized By</p>
              </div>

              {/* Bottom Right - College Signature */}
              <div className="signature-area right-signature">
                <div className="signature-image-wrapper">
                  {collegeSignature ? (
                    <img
                      src={collegeSignature}
                      alt={`${collegeName} Signature`}
                      className="college-signature-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="signature-placeholder">
                      <p className="signature-placeholder-text">College Signature</p>
                    </div>
                  )}
                </div>
                <div className="signature-line"></div>
                <p className="signature-label">{principalName}</p>
                <p className="signature-title">Principal / Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
