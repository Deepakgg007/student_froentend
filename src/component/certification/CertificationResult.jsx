import { useState, useRef } from 'react';
import { downloadCertificate } from '../../services/api';
import CertificateTemplate from '../certification/CertificateTemplate';
import { downloadCertificateAsPDF } from '../certification/CertificateDownloadHelper';

/**
 * CertificationResult Component
 * Displays exam results, score, and certificate download option
 *
 * @param {Object} result - Result object from submitCertificationAttempt
 *   - score: number (0-100)
 *   - passed: boolean
 *   - certificate_issued: boolean
 *   - attempt_id: number
 *   - course_name: string
 *   - certification_title: string
 * @param {Object} certification - Certification details from getCertificationById
 *   - college: College information with logo and signature
 */
const CertificationResult = ({ result, certification, onRetake }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const certificateRef = useRef(null);

  // Get student info from localStorage or props
  const studentName = localStorage?.getItem('student_name') || result.student_name || 'Student';

  // Get college info from result first (if available), then from certification prop, then default
  let collegeInfo = result.college;
  if (!collegeInfo && certification?.college) {
    collegeInfo = certification.college;
  }
  collegeInfo = collegeInfo || {};

  const collegeName = collegeInfo.name || 'Z1 Education';
  const collegeLogo = collegeInfo.logo || null;
  const collegeSignature = collegeInfo.signature_display || null;

  // Download frontend certificate as PDF
  const handleDownloadFrontendCertificate = async () => {
    try {
      setDownloading(true);
      setDownloadError('');

      if (!certificateRef.current) {
        throw new Error('Certificate template not available');
      }

      const certificateName = result.certification_title || 'Certificate';
      await downloadCertificateAsPDF(certificateRef, certificateName);
    } catch (err) {
      console.error('Error downloading frontend certificate:', err);
      setDownloadError(err.message || 'Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      setDownloading(true);
      setDownloadError('');

      if (!certificateRef.current) {
        console.warn('Certificate ref is not available, waiting a moment...');
        // Sometimes the ref isn't immediately available, give it a moment
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const certificateName = result.certification_title || 'Certificate';
      await downloadCertificateAsPDF(certificateRef, certificateName);
      return;

      // Old backend certificate download code (kept as fallback, not used)
      const attemptId = result.attempt_id || result.id;

      if (!attemptId) {
        throw new Error('Attempt ID not found in result');
      }


      const response = await downloadCertificate(attemptId);

      // Axios with responseType: 'blob' returns data as Blob
      let blob = response.data;

      // Validate that we have data
      if (!blob) {
        throw new Error('No data received from server');
      }

      // If it's not a Blob, try to convert it
      if (!(blob instanceof Blob)) {
        console.warn('Response is not a Blob, attempting to convert...');
        blob = new Blob([blob], { type: 'application/pdf' });
      }

      // Validate that the blob is not empty
      if (blob.size === 0) {
        throw new Error('Certificate file is empty');
      }

     
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${attemptId}.pdf`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (err) {
      console.error('Error downloading certificate:', err);

      // Handle specific error codes
      let errorMsg = 'Failed to download certificate. Please try again.';

      if (err.response?.status === 406) {
        errorMsg = 'Server content negotiation error. Please refresh and try again.';
      } else if (err.response?.status === 404) {
        errorMsg = 'Certificate not found. The exam may not have been passed.';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setDownloadError(errorMsg);
    } finally {
      setDownloading(false);
    }
  };

  const scorePercentage = Math.round(result.score);
  const scoreColor = result.passed ? '#28a745' : '#dc3545';

  return (
    <>
      {/* Header Section */}
      <div className="mb-5">
        <h3 className="mb-2" style={{ fontSize: '24px', fontWeight: '600', color: '#212529' }}>
          {result.certification_title || 'Certification Result'}
        </h3>
        <p className="mb-0" style={{ fontSize: '14px', color: '#6c757d' }}>
          Exam Completed • Attempt #{result.attempt_number || 1}
        </p>
      </div>

      {/* Results Card */}
      <div style={{ padding: '32px', border: '1px solid #e9ecef', borderRadius: '8px', background: '#ffffff', marginBottom: '24px' }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h5 className="mb-0" style={{ fontSize: '18px', fontWeight: '600', color: '#212529' }}>
            {result.passed ? 'Certification Passed' : 'Not Passed'}
          </h5>
          <span style={{
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '500',
            background: result.passed ? '#d4edda' : '#f8d7da',
            color: result.passed ? '#155724' : '#842029'
          }}>
            {result.passed ? '✓ Passed' : '✗ Not Passed'}
          </span>
        </div>

        {/* Score Display */}
        <div className="text-center mb-4">
          <div style={{ fontSize: '48px', fontWeight: '700', color: scoreColor, marginBottom: '8px' }}>
            {scorePercentage}%
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>Final Score</div>
        </div>

        {/* Details Grid */}
        <div className="row g-3 text-center mb-4">
          <div className="col-6">
            <div style={{ padding: '16px', border: '1px solid #e9ecef', borderRadius: '6px' }}>
              <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '8px' }}>Certification</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#212529' }}>
                {result.certification_title || 'N/A'}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div style={{ padding: '16px', border: '1px solid #e9ecef', borderRadius: '6px' }}>
              <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '8px' }}>Completed</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#212529' }}>
                {result.completed_at ? new Date(result.completed_at).toLocaleDateString() : 'Today'}
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {result.passed ? (
          <div style={{
            padding: '12px',
            backgroundColor: '#d4edda',
            border: '1px solid #28a745',
            borderRadius: '6px',
            color: '#155724',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            ✓ Congratulations! You have successfully passed this certification.
          </div>
        ) : (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c2c7',
            borderRadius: '6px',
            color: '#842029',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            You need a higher score to pass. Please review and try again.
          </div>
        )}
      </div>

      {/* Certificate Preview (Hidden from view but available for rendering) */}
      {result.passed && (
        <div style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '1200px',
          height: '900px',
          zIndex: '-1',
          pointerEvents: 'none',
          visibility: 'visible' // Ensure element is visible for html2canvas
        }}>
          <CertificateTemplate
            ref={certificateRef}
            studentName={studentName}
            courseName={result.certification_title || 'Certification'}
            completionDate={result.completed_at ? new Date(result.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            score={Math.round(result.score)}
            passingScore={result.passing_score || 80}
            collegeName={collegeName}
            collegeLogo={collegeLogo}
            collegeSignature={collegeSignature}
            certificateNumber={result.certificate_number || `CERT-${result.attempt_id || result.id}`}
            principalName={collegeInfo.principal_name || 'Director'}
          />
        </div>
      )}

      {/* Certificate Download Section */}
      {result.passed && (
        <div style={{
          padding: '24px',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            marginBottom: '12px'
          }}>
            📜
          </div>
          <h5 style={{
            margin: '0 0 8px 0',
            color: '#212529',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Your Certificate is Ready
          </h5>
          <p style={{
            color: '#6c757d',
            fontSize: '14px',
            margin: '0 0 16px 0'
          }}>
            Download your official certificate of completion
          </p>

          {downloadError && (
            <div style={{
              padding: '12px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c2c7',
              borderRadius: '6px',
              color: '#842029',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {downloadError}
            </div>
          )}

          <button
            onClick={handleDownloadCertificate}
            disabled={downloading}
            style={{
              padding: '12px 32px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.6 : 1,
              transition: 'all 0.3s ease',
              marginRight: '8px'
            }}
          >
            <i className="icofont-download me-2"></i>
            {downloading ? 'Downloading...' : 'Download Certificate'}
          </button>

          <button
            onClick={() => setShowCertificatePreview(!showCertificatePreview)}
            style={{
              padding: '12px 32px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="icofont-eye me-2"></i>
            {showCertificatePreview ? 'Hide Preview' : 'View Preview'}
          </button>
        </div>
      )}

      {/* Certificate Preview Display */}
      {result.passed && showCertificatePreview && (
        <div style={{
          padding: '24px',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          marginBottom: '24px'
        }}>
          <h5 style={{
            margin: '0 0 16px 0',
            color: '#212529',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Certificate Preview
          </h5>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ width: '100%', maxWidth: '900px' }}>
              <CertificateTemplate
                ref={certificateRef}
                studentName={studentName}
                courseName={result.certification_title || 'Certification'}
                completionDate={result.completed_at ? new Date(result.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                score={Math.round(result.score)}
                passingScore={result.passing_score || 80}
                collegeName={collegeName}
                collegeLogo={collegeLogo}
                collegeSignature={collegeSignature}
                certificateNumber={result.certificate_number || `CERT-${result.attempt_id || result.id}`}
                principalName={collegeInfo.principal_name || 'Director'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      {result.score_details && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          marginBottom: '30px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
            Score Breakdown
          </h4>
          {result.score_details.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: idx < result.score_details.length - 1 ? '1px solid #e0e0e0' : 'none'
              }}
            >
              <div style={{ color: '#666' }}>{item.label}</div>
              <div style={{ fontWeight: 'bold', color: '#333' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="d-flex gap-3 justify-content-center flex-wrap">
        {!result.passed && onRetake && (
          <button
            onClick={onRetake}
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              background: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
            <i className="icofont-refresh me-2"></i>
            Try Again
          </button>
        )}

        <button
          onClick={() => window.history.back()}
          style={{
            padding: '12px 32px',
            fontSize: '15px',
            background: 'transparent',
            color: '#6c757d',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
          <i className="icofont-arrow-left me-2"></i>
          Back to Course
        </button>
      </div>
    </>
  );
};

export default CertificationResult;
