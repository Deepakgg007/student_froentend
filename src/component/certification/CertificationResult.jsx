import { useNavigate } from 'react-router-dom';

/**
 * CertificationResult Component
 * Displays exam results and score
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
const CertificationResult = ({ result, certification, onRetake, collegeSlug }) => {
  const navigate = useNavigate();

  const scorePercentage = Math.round(result.score);
  const scoreColor = result.passed ? '#28a745' : '#dc3545';

  // Navigate to profile certificates page
  const handleGoToCertificates = () => {
    if (collegeSlug) {
      navigate(`/${collegeSlug}/profile?tab=certificates`);
    } else {
      navigate('/profile?tab=certificates');
    }
  };

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

      {/* Certificate Success Message - Redirect to Profile */}
      {result.passed && (
        <div style={{
          padding: '24px',
          border: '1px solid #d4edda',
          borderRadius: '8px',
          backgroundColor: '#d4edda',
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
            color: '#155724',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Certificate Generated Successfully!
          </h5>
          <p style={{
            color: '#155724',
            fontSize: '14px',
            margin: '0 0 16px 0'
          }}>
            Your certificate has been saved to your profile. You can download it anytime from your certificates page.
          </p>

          <button
            onClick={handleGoToCertificates}
            style={{
              padding: '12px 32px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#218838';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#28a745';
            }}
          >
            <i className="icofont-certificate me-2"></i>
            View & Download Certificate
          </button>
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
