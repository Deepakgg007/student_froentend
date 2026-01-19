import React, { useState, useEffect, useRef } from 'react';
import Timer from './Timer';
import {
  startCertificationAttempt,
  getCertificationQuestions,
  submitCertificationAttempt
} from '../../services/api';

/**
 * CertificationExam Component
 * Uses the same clean card-based layout as MCQContent
 * Displays certification exam questions with timer and progress tracking
 * Includes webcam proctoring for exam monitoring
 */
const CertificationExam = ({
  certificationId,
  certificationTitle,
  duration,
  passingScore,
  totalQuestions,
  onComplete,
  attemptData
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(attemptData || null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeExpired, setTimeExpired] = useState(false);

  // Webcam proctoring states
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize exam on mount
  useEffect(() => {
    const initializeExam = async () => {
      try {
        setLoading(true);
        setError('');

        // Start or resume attempt
        let attemptResponse;
        if (attemptData?.id) {
          attemptResponse = { data: { data: attemptData } };
        } else {
          attemptResponse = await startCertificationAttempt(certificationId);
        }


        // Parse attempt response - handle multiple response formats
        let attemptInfo = attemptResponse.data.data || attemptResponse.data;

        // If attemptInfo is still not an object or doesn't have id, log it
        if (!attemptInfo || typeof attemptInfo !== 'object') {
          console.error('Invalid attempt response format:', attemptInfo);
          throw new Error('Invalid exam session response from server');
        }

        // Backend returns attempt_id, but we need id for our code to work
        // Normalize the response to ensure we have an 'id' field
        if (attemptInfo.attempt_id && !attemptInfo.id) {
          attemptInfo.id = attemptInfo.attempt_id;
        }

        setAttempt(attemptInfo);

        // Fetch questions
        const questionsResponse = await getCertificationQuestions(certificationId);
        const questionsData = questionsResponse.data.data || questionsResponse.data;

        // Ensure questions is an array
        const questionsList = Array.isArray(questionsData)
          ? questionsData
          : questionsData.results || [];

        setQuestions(questionsList);

        // Initialize empty answers
        const initialAnswers = {};
        questionsList.forEach(q => {
          initialAnswers[q.id] = null;
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Error initializing exam:', err);
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to load exam. Please refresh and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    initializeExam();
  }, [certificationId, attemptData]);

  // Initialize webcam for proctoring
  useEffect(() => {
    const startCamera = async () => {
      try {
        setCameraError('');
        setCameraPermissionDenied(false);

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 160 },
            height: { ideal: 120 },
            facingMode: 'user'
          },
          audio: false
        });

        // Store stream reference
        streamRef.current = stream;

        // Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setCameraEnabled(true);
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraEnabled(false);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraPermissionDenied(true);
          setCameraError('Camera access denied. Please enable your camera to continue the exam.');
        } else if (err.name === 'NotFoundError') {
          setCameraError('No camera found. Please connect a camera to continue the exam.');
        } else {
          setCameraError('Unable to access camera. Please check your camera settings.');
        }
      }
    };

    startCamera();

    // Cleanup: Stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Monitor camera status periodically
  useEffect(() => {
    if (!cameraEnabled || !streamRef.current) return;

    const checkCameraStatus = setInterval(() => {
      const tracks = streamRef.current?.getTracks();
      if (tracks && tracks.length > 0) {
        const videoTrack = tracks[0];
        if (videoTrack.readyState === 'ended' || !videoTrack.enabled) {
          setCameraError('⚠️ Camera has been disabled. Please enable it to continue.');
          setCameraEnabled(false);
        }
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(checkCameraStatus);
  }, [cameraEnabled]);

  // Handle answer change
  const handleAnswerChange = (questionId, selectedOptionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOptionId
    }));
  };

  // Handle time expiration
  const handleTimeExpired = () => {
    setTimeExpired(true);
    // Delay submission to ensure attempt is loaded
    setTimeout(() => {
      handleSubmitExam();
    }, 100);
  };

  // Submit exam
  const handleSubmitExam = async () => {
    try {
      // Validate that attempt is loaded
      if (!attempt || !attempt.id) {
        console.error('Attempt not initialized:', attempt);
        setError('Exam session not initialized. Please refresh and try again.');
        setSubmitting(false);
        return;
      }

      setSubmitting(true);
      setError('');

      // Build answers array
      // Backend expects "question" field (not "question_id") and "selected_options"
      const answersArray = Object.entries(answers)
        .filter(([, optionId]) => optionId !== null)
        .map(([questionId, selectedOptionId]) => ({
          question: parseInt(questionId),
          selected_options: [selectedOptionId]
        }));


      // Submit attempt
      const response = await submitCertificationAttempt(attempt.id, answersArray);
      const result = response.data.data || response.data;


      // Call completion callback
      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to submit exam. Please try again.'
      );
      setSubmitting(false);
    }
  };

  // Calculate stats
  const totalQuestionCount = questions.length;
  const answeredQuestions = Object.values(answers).filter(a => a !== null).length;
  const allAnswered = totalQuestionCount > 0 && answeredQuestions === totalQuestionCount;

  // Get student USN from localStorage
  const userUsn = typeof localStorage !== 'undefined' ? localStorage.getItem('student_usn') || 'STUDENT' : 'STUDENT';

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading exam...</span>
        </div>
        <p className="mt-3 text-muted">Loading certification exam...</p>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#ffebee',
        border: '1px solid #ef5350',
        borderRadius: '8px',
        color: '#c62828'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          Error Loading Exam
        </div>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="certification-exam" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Section - Similar to MCQContent */}
      <div className="mb-4 pb-3" style={{ borderBottom: '2px solid #e9ecef' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-1" style={{ fontSize: '20px', fontWeight: '600', color: '#212529', userSelect: 'none' }}>
              {certificationTitle}
            </h4>
            <p className="mb-0" style={{ fontSize: '14px', color: '#6c757d' }}>
              Certification Exam • Attempt #{attempt?.attempt_number || 1}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Progress Counter */}
            <div className="text-end">
              <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>Progress</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#212529' }}>
                {answeredQuestions} / {totalQuestionCount}
              </div>
            </div>
            {/* Timer */}
            <Timer
              initialMinutes={duration}
              onTimeExpired={handleTimeExpired}
              isActive={!timeExpired && !submitting}
            />
          </div>
        </div>
      </div>

      {/* Webcam Proctoring Section */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: cameraEnabled ? '2px solid #28a745' : '2px solid #dc3545'
      }}>
        {/* Camera Video Feed */}
        <div style={{ position: 'relative' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '160px',
              height: '120px',
              objectFit: 'cover',
              display: cameraEnabled ? 'block' : 'none',
              backgroundColor: '#000'
            }}
          />

          {/* Camera Status Overlay */}
          {!cameraEnabled && (
            <div style={{
              width: '160px',
              height: '120px',
              backgroundColor: '#f8d7da',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>📹</div>
              <div style={{ fontSize: '10px', color: '#842029', fontWeight: '600' }}>
                Camera Disabled
              </div>
            </div>
          )}

          {/* Status Label */}
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            backgroundColor: cameraEnabled ? 'rgba(40, 167, 69, 0.9)' : 'rgba(220, 53, 69, 0.9)',
            color: '#ffffff',
            padding: '3px 6px',
            borderRadius: '3px',
            fontSize: '9px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              backgroundColor: cameraEnabled ? '#fff' : '#fff',
              borderRadius: '50%',
              display: 'inline-block',
              animation: cameraEnabled ? 'pulse 2s infinite' : 'none'
            }}></span>
            {cameraEnabled ? 'LIVE' : 'OFF'}
          </div>
        </div>

        {/* Camera Label */}
        <div style={{
          padding: '4px 8px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
          fontSize: '9px',
          color: '#6c757d',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          PROCTORING
        </div>
      </div>

      {/* Pulse Animation for Recording Indicator */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Camera Error Warning */}
      {cameraError && (
        <div style={{
          padding: '16px',
          backgroundColor: cameraPermissionDenied ? '#f8d7da' : '#fff3cd',
          border: `2px solid ${cameraPermissionDenied ? '#dc3545' : '#ffc107'}`,
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'start',
          gap: '12px'
        }}>
          <div style={{ fontSize: '24px' }}>
            {cameraPermissionDenied ? '🚫' : '⚠️'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: '600',
              color: cameraPermissionDenied ? '#842029' : '#856404',
              marginBottom: '4px',
              fontSize: '14px'
            }}>
              {cameraPermissionDenied ? 'Camera Access Required' : 'Camera Warning'}
            </div>
            <div style={{
              color: cameraPermissionDenied ? '#842029' : '#856404',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {cameraError}
            </div>
            {cameraPermissionDenied && (
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#842029'
              }}>
                Please refresh the page and allow camera access to continue with the proctored exam.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '6px',
          color: '#856404',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Time Expired Notice */}
      {timeExpired && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c2c7',
          borderRadius: '6px',
          color: '#842029',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          ⏰ Time has expired! Your exam has been submitted.
        </div>
      )}

      {/* Questions - Card based like MCQContent */}
      {questions.map((question, qIdx) => {
        const isAnswered = answers[question.id] !== null;

        return (
          <div
            key={question.id}
            className="card mb-3"
            style={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Watermark for this card - shows student USN */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              fontSize: '54px',
              fontWeight: 'bold',
              color: 'rgba(0, 0, 0, 0.12)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 0,
              width: '150%',
              textAlign: 'center',
              userSelect: 'none',
              letterSpacing: '2px'
            }}>
              {userUsn}
            </div>

            {/* Question Header */}
            <div
              className="card-header"
              style={{
                background: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                padding: '12px 16px'
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center flex-grow-1">
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#495057',
                      marginRight: '12px',
                      userSelect: 'none'
                    }}
                  >
                    Q{qIdx + 1}.
                  </span>
                  <h6
                    className="mb-0"
                    style={{
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#212529',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none'
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onDrag={(e) => e.preventDefault()}
                  >
                    {question.text}
                  </h6>
                </div>
                {isAnswered && (
                  <span
                    className="badge bg-success"
                    style={{ fontSize: '11px', padding: '4px 8px', marginLeft: '12px' }}
                  >
                    ✓ Answered
                  </span>
                )}
              </div>
            </div>

            {/* Question Body */}
            <div className="card-body" style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
              {/* Options */}
              <div className="choices-container">
                {question.options && question.options.map((option, optIdx) => {
                  const isSelected = answers[question.id] === option.id;
                  const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <div
                      key={option.id}
                      className="form-check"
                      style={{
                        padding: '12px',
                        marginBottom: '12px',
                        border: isSelected ? '2px solid #2196f3' : '1px solid #e0e0e0',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? '#e3f2fd' : '#f8f9fa',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                      }}
                      onClick={() => handleAnswerChange(question.id, option.id)}
                    >
                      <div className="d-flex align-items-start">
                        <input
                          className="form-check-input"
                          type={question.is_multiple_correct ? 'checkbox' : 'radio'}
                          name={`question-${question.id}`}
                          id={`option-${question.id}-${option.id}`}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(question.id, option.id)}
                          style={{ marginTop: '4px' }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`option-${question.id}-${option.id}`}
                          style={{
                            marginLeft: '12px',
                            marginBottom: '0',
                            cursor: 'pointer',
                            flex: 1,
                            fontSize: '15px',
                            color: '#212529',
                            userSelect: 'none'
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          onCopy={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          onDrag={(e) => e.preventDefault()}
                        >
                          <span style={{ fontWeight: '600', marginRight: '8px' }}>{optionLabel}.</span>
                          {option.text}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Multiple choice indicator */}
              {question.is_multiple_correct && (
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#1976d2',
                  marginTop: '12px'
                }}>
                  ℹ️ This question has multiple correct answers
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Navigation Buttons */}
      <div
        className="d-flex gap-3 justify-content-center align-items-center"
        style={{
          paddingTop: '20px',
          paddingBottom: '20px',
          borderTop: '2px solid #e9ecef',
          marginTop: '30px'
        }}
      >
        <button
          onClick={handleSubmitExam}
          disabled={!allAnswered || submitting || timeExpired}
          style={{
            padding: '12px 32px',
            backgroundColor: allAnswered ? '#28a745' : '#d0d0d0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: allAnswered && !submitting ? 'pointer' : 'not-allowed',
            opacity: allAnswered ? 1 : 0.6,
            transition: 'all 0.3s ease',
            fontSize: '15px'
          }}
        >
          {submitting ? '⏳ Submitting...' : `✓ Submit Exam (${answeredQuestions}/${totalQuestionCount})`}
        </button>
      </div>
    </div>
  );
};

export default CertificationExam;
