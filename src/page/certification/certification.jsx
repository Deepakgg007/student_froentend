import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CertificationExam from '../../component/certification/CertificationExam';
import CertificationResult from '../../component/certification/CertificationResult';
import { getCertificationById } from '../../services/api';

const CertificationPage = () => {
  const { certificationId } = useParams();
  const navigate = useNavigate();
  const [certification, setCertification] = useState(null);
  const [examState, setExamState] = useState('loading'); // loading, exam, result
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Load certification details
  useEffect(() => {
    const loadCertification = async () => {
      try {
        setError('');
        console.log('📖 Loading certification ID:', certificationId);
        const response = await getCertificationById(certificationId);
        console.log('📖 Certification response:', response);

        const data = response.data.data || response.data;
        console.log('📖 Certification data:', data);

        if (!data || !data.title) {
          throw new Error('Invalid certification data received');
        }

        setCertification(data);
        setExamState('exam');
      } catch (err) {
        console.error('Error loading certification:', err);
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Failed to load certification. Please try again.'
        );
        setExamState('error');
      }
    };

    if (certificationId) {
      loadCertification();
    }
  }, [certificationId]);

  const handleExamComplete = (examResult) => {
    setResult(examResult);
    setExamState('result');
  };

  const handleRetake = () => {
    setResult(null);
    setExamState('exam');
  };

  // Get student USN for page watermark
  const studentUsn = typeof localStorage !== 'undefined' ? localStorage.getItem('student_usn') || 'STUDENT' : 'STUDENT';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '0px', position: 'relative', overflow: 'hidden' }}>
      {/* Page-level watermark with student USN */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '80px',
        fontWeight: 'bold',
        color: 'rgba(0, 0, 0, 0.06)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        zIndex: 0,
        width: '200%',
        textAlign: 'center',
        userSelect: 'none',
        letterSpacing: '3px'
      }}>
        {studentUsn}
      </div>

      {/* Back Button Header */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        position: 'sticky',
        top: '0',
        zIndex: '1000'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            color: '#495057',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#adb5bd';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderColor = '#dee2e6';
          }}
        >
          ← Back
        </button>
      </div>

      {/* Main Content */}
      <div className="container py-4" style={{ maxWidth: '900px', minHeight: '70vh' }}>
        {examState === 'loading' && (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {examState === 'error' && (
          <div style={{
            padding: '32px',
            border: '1px solid #f5c2c7',
            borderRadius: '8px',
            backgroundColor: '#f8d7da',
            textAlign: 'center'
          }}>
            <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#842029', marginBottom: '12px' }}>
              Error Loading Certification
            </h5>
            <p style={{ fontSize: '14px', color: '#842029', marginBottom: '20px' }}>{error}</p>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '12px 32px',
                backgroundColor: '#842029',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              ← Go Back
            </button>
          </div>
        )}

        {examState === 'exam' && certification && (
          <CertificationExam
            certificationId={parseInt(certificationId)}
            certificationTitle={certification.title}
            duration={certification.duration_minutes}
            passingScore={certification.passing_score}
            totalQuestions={certification.total_questions}
            onComplete={handleExamComplete}
          />
        )}

        {examState === 'result' && result && (
          <CertificationResult
            result={result}
            onRetake={handleRetake}
          />
        )}
      </div>
    </div>
  );
};

export default CertificationPage;
