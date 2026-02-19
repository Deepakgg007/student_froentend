import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import CertificationExam from '../../component/certification/CertificationExam';
import CertificationResult from '../../component/certification/CertificationResult';
import { getCertificationById } from '../../services/api';

const CertificationPage = () => {
  const { certificationId, collegeSlug } = useParams();
  const navigate = useNavigate();
  const [certification, setCertification] = useState(null);
  const [examState, setExamState] = useState('loading'); // loading, exam, result
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  // Load certification details
  useEffect(() => {
    const loadCertification = async () => {
      try {
        setError('');
        const response = await getCertificationById(certificationId);

        const data = response.data.data || response.data;

        if (!data || !data.title) {
          throw new Error('Invalid certification data received');
        }

        setCertification(data);
        setExamState('exam');
      } catch (err) {
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

  // Prevent browser back button and show confirmation during exam
  useEffect(() => {
    if (examState !== 'exam') return;

    const handleBeforeUnload = (e) => {
      if (isExiting) return; // Don't block if exiting
      e.preventDefault();
      e.returnValue = 'Your exam is in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    const handlePopState = async () => {
      // Prevent multiple dialogs
      if (isExiting) return;

      // Push state back immediately to prevent navigation
      window.history.pushState(null, '', window.location.pathname);

      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Exit Exam?',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p style="margin-bottom: 15px; font-weight: 600; color: #dc3545;">⚠️ Warning: Leaving this page will:</p>
            <ul style="margin-left: 20px; color: #6c757d;">
              <li>End your current exam session</li>
              <li>Stop the camera monitoring</li>
              <li>Your progress will be lost</li>
              <li>This attempt may be counted</li>
            </ul>
            <p style="margin-top: 15px; font-weight: 600; color: #212529;">Are you sure you want to exit?</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Exit Exam',
        cancelButtonText: 'Stay on Exam',
        reverseButtons: true,
        focusCancel: true
      });

      if (result.isConfirmed) {
        setIsExiting(true);
      }
    };

    // Add initial history state
    window.history.pushState(null, '', window.location.pathname);

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [examState, isExiting]);

  // Handle navigation when isExiting becomes true - redirect to certificates page
  useEffect(() => {
    if (isExiting) {
      if (collegeSlug) {
        navigate(`/${collegeSlug}/profile?tab=certificates`);
      } else {
        navigate('/profile?tab=certificates');
      }
    }
  }, [isExiting, navigate, collegeSlug]);

  const handleExamComplete = (examResult) => {
    setResult(examResult);
    setExamState('result');
  };

  const handleRetake = () => {
    setResult(null);
    setExamState('exam');
  };

  // Handle back button with confirmation
  const handleBackButton = async () => {
    // Only show confirmation if exam is in progress and not already exiting
    if (examState === 'exam' && !isExiting) {
      const result = await Swal.fire({
        title: 'Exit Exam?',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p style="margin-bottom: 15px; font-weight: 600; color: #dc3545;">⚠️ Warning: Leaving this page will:</p>
            <ul style="margin-left: 20px; color: #6c757d;">
              <li>End your current exam session</li>
              <li>Stop the camera monitoring</li>
              <li>Your progress will be lost</li>
              <li>This attempt may be counted</li>
            </ul>
            <p style="margin-top: 15px; font-weight: 600; color: #212529;">Are you sure you want to exit?</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Exit Exam',
        cancelButtonText: 'Stay on Exam',
        reverseButtons: true,
        focusCancel: true
      });

      if (result.isConfirmed) {
        setIsExiting(true);
      }
    } else {
      // If not in exam state, redirect to certificates page
      if (collegeSlug) {
        navigate(`/${collegeSlug}/profile?tab=certificates`);
      } else {
        navigate('/profile?tab=certificates');
      }
    }
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
          onClick={handleBackButton}
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
            collegeSlug={collegeSlug}
          />
        )}

        {examState === 'result' && result && (
          <CertificationResult
            result={result}
            certification={certification}
            onRetake={handleRetake}
            collegeSlug={collegeSlug}
          />
        )}
      </div>
    </div>
  );
};

export default CertificationPage;
