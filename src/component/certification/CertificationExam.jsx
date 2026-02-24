import { useState, useEffect, useCallback } from 'react';
import Timer from './Timer';
import ProctorMonitor from './ProctorMonitor';
import ExamTerminated from './ExamTerminated';
import {
  startCertificationAttempt,
  getCertificationQuestions,
  submitCertificationAttempt
} from '../../services/api';

/**
 * CertificationExam Component
 * Clean, modern exam interface with question palette
 */
const CertificationExam = ({
  certificationId,
  certificationTitle,
  duration,
  attemptData,
  enableProctoring = true,
  collegeSlug = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(attemptData || null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeExpired, setTimeExpired] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Proctoring state
  const [examTerminated, setExamTerminated] = useState(false);
  const [violations, setViolations] = useState([]);
  const [proctoringActive, setProctoringActive] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);

  // Handle fullscreen change - detect when user exits fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || document.mozFullScreenElement;
      if (!isFullscreen && examStarted && !loading && !submitting && !examTerminated && !timeExpired) {
        setShowFullscreenWarning(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [examStarted, loading, submitting, examTerminated, timeExpired]);

  // Start exam with fullscreen
  const startExam = useCallback(async () => {
    try {
      // Request fullscreen first (requires user gesture)
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      }
    } catch (err) {
      console.log('Fullscreen request failed:', err);
    }
    // Start exam regardless of fullscreen success
    setExamStarted(true);
  }, []);

  // Handle quit exam from fullscreen warning
  const handleQuitExam = () => {
    setShowFullscreenWarning(false);
    setExamTerminated(true);
    setProctoringActive(false);
    setTimeExpired(true);

    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen().catch(() => {});
    }

    // Redirect to certificates page
    const returnPath = collegeSlug ? `/${collegeSlug}/certificates` : '/certificates';
    window.location.href = returnPath;
  };

  // Handle resume exam (re-enter fullscreen)
  const handleResumeExam = () => {
    setShowFullscreenWarning(false);
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen().catch(() => {});
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen().catch(() => {});
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen().catch(() => {});
    }
  };

  // Handle violation exceeded - terminate exam and submit as failed
  const handleViolationExceeded = useCallback(async (recordedViolations) => {
    setProctoringActive(false);
    setViolations(recordedViolations);
    setExamTerminated(true);

    // Stop the timer by setting time expired
    setTimeExpired(true);

    // Submit the exam as terminated (with empty answers to mark as failed)
    if (attempt && attempt.id) {
      try {
        // Submit with empty answers array to mark attempt as terminated
        await submitCertificationAttempt(attempt.id, []);
      } catch (err) {
        // Silently handle submission error - exam is already terminated UI-wise
      }
    }
  }, [attempt]);

  // Handle violation count change
  const handleViolationCountChange = useCallback(() => {
    // Violation count updated silently
  }, []);

  // Prevent context menu, copy, cut, paste, and text selection
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e) => {
      e.preventDefault();
      return false;
    };

    const handleCut = (e) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Hide header and footer when exam is active
  useEffect(() => {
    const hideAppElements = () => {
      const header = document.querySelector('.nk-header');
      const footer = document.querySelector('.nk-footer');
      const sidebar = document.querySelector('.nk-sidebar');
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
    };

    const showAppElements = () => {
      const header = document.querySelector('.nk-header');
      const footer = document.querySelector('.nk-footer');
      const sidebar = document.querySelector('.nk-sidebar');
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      if (sidebar) sidebar.style.display = '';
    };

    hideAppElements();
    return () => showAppElements();
  }, []);

  // Initialize exam on mount
  useEffect(() => {
    const initializeExam = async () => {
      try {
        setLoading(true);
        setError('');

        let attemptResponse;
        if (attemptData?.id) {
          attemptResponse = { data: { data: attemptData } };
        } else {
          attemptResponse = await startCertificationAttempt(certificationId);
        }

        let attemptInfo = attemptResponse.data.data || attemptResponse.data;
        if (attemptInfo.attempt_id && !attemptInfo.id) {
          attemptInfo.id = attemptInfo.attempt_id;
        }

        setAttempt(attemptInfo);

        const questionsResponse = await getCertificationQuestions(certificationId);
        const questionsData = questionsResponse.data.data || questionsResponse.data;
        const questionsList = Array.isArray(questionsData)
          ? questionsData
          : questionsData.results || [];

        setQuestions(questionsList);

        const initialAnswers = {};
        questionsList.forEach(q => {
          initialAnswers[q.id] = null;
        });
        setAnswers(initialAnswers);

        // Activate proctoring after exam loads
        if (enableProctoring) {
          setProctoringActive(true);
        }
      } catch (err) {
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
  }, [certificationId, attemptData, enableProctoring]);

  // Handle answer change
  const handleAnswerChange = (questionId, selectedOptionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOptionId
    }));
  };

  // Navigation handlers
  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  // Handle time expiration
  const handleTimeExpired = () => {
    setTimeExpired(true);
    setTimeout(() => handleSubmitExam(), 100);
  };

  // Submit exam
  const handleSubmitExam = async () => {
    try {
      if (!attempt || !attempt.id) {
        setError('Exam session not initialized. Please refresh and try again.');
        setSubmitting(false);
        return;
      }

      setSubmitting(true);
      setError('');

      const answersArray = Object.entries(answers)
        .filter(([, optionId]) => optionId !== null)
        .map(([questionId, selectedOptionId]) => ({
          question: parseInt(questionId),
          selected_options: [selectedOptionId]
        }));

      await submitCertificationAttempt(attempt.id, answersArray);

      // Exit fullscreen before redirecting
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen().catch(() => {});
      }

      // Redirect to certificates page
      const certificatesPath = collegeSlug ? `/${collegeSlug}/certificates` : '/certificates';
      window.location.href = certificatesPath;
    } catch (err) {
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

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentAnswered = currentQuestion ? answers[currentQuestion.id] !== null : false;

  // Helper function to render text - handles both inline code and multi-line code blocks
  const renderTextWithCode = (text) => {
    if (!text) return '';

    // First, process multi-line code blocks (triple backticks)
    let processedText = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _code, codeContent) => {
      // Escape HTML entities in code
      const escapedCode = codeContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      // Return pre-formatted code block with line breaks preserved
      return `<pre style="background: #1e293b; color: #e2e8f0; padding: 12px 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap; margin: 8px 0;"><code>${escapedCode}</code></pre>`;
    });

    // Then process inline code (single backticks) - but avoid matching within pre tags
    const inlineCodeStyle = 'font-family: monospace; color: #e11d48; background: #fef2f2; padding: 2px 6px; border-radius: 4px;';
    processedText = processedText.replace(/`([^`]+)`/g, `<code style="${inlineCodeStyle}">$1</code>`);

    // Convert remaining newlines to <br> for non-code text
    processedText = processedText.replace(/\n/g, '<br />');

    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  // Show start screen before exam begins
  if (!examStarted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f7fa',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: 'clamp(24px, 5vw, 40px)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ fontSize: 'clamp(40px, 8vw, 48px)', marginBottom: '20px' }}>📝</div>
          <h1 style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 12px 0'
          }}>
            {certificationTitle}
          </h1>
          <p style={{
            fontSize: 'clamp(13px, 3vw, 15px)',
            color: '#64748b',
            margin: '0 0 8px 0'
          }}>
            Duration: {duration} minutes
          </p>
          <p style={{
            fontSize: 'clamp(13px, 3vw, 15px)',
            color: '#64748b',
            margin: '0 0 24px 0'
          }}>
            Questions: {questions.length}
          </p>

          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: 'clamp(12px, 3vw, 16px)',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: '600',
              color: '#92400e',
              margin: '0 0 8px 0'
            }}>
              ⚠️ Important Instructions:
            </h3>
            <ul style={{
              fontSize: 'clamp(11px, 2.5vw, 13px)',
              color: '#78350f',
              margin: 0,
              paddingLeft: '20px',
              lineHeight: '1.6'
            }}>
              <li>The exam will open in fullscreen mode</li>
              <li>Camera access is required for proctoring</li>
              <li>Do not exit fullscreen during the exam</li>
              <li>Ensure stable internet connection</li>
            </ul>
          </div>

          <button
            onClick={startExam}
            style={{
              width: '100%',
              padding: 'clamp(14px, 3vw, 16px) 32px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
            }}
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f7fa',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading exam...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f7fa',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>
            Error Loading Exam
          </div>
          <div style={{ color: '#b91c1c', fontSize: '14px' }}>{error}</div>
        </div>
      </div>
    );
  }

  // Show termination screen if exam was terminated due to violations
  if (examTerminated) {
    const returnPath = collegeSlug ? `/${collegeSlug}/certificates` : '/certificates';
    return <ExamTerminated violations={violations} onReturn={() => window.location.href = returnPath} />;
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        backgroundColor: '#f5f7fa',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        zIndex: 9999
      }}>
        {/* Top Header */}
        <div className="exam-header" style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              {certificationTitle}
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
              Attempt #{attempt?.attempt_number || 1}
            </p>
          </div>

          <div className="exam-header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Progress */}
            <div className="progress-count" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Answered</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                {answeredQuestions}<span style={{ color: '#94a3b8', fontWeight: '400' }}>/{totalQuestionCount}</span>
              </div>
            </div>

            {/* Timer */}
            <div className="timer-component">
              <Timer
                initialMinutes={duration}
                onTimeExpired={handleTimeExpired}
                isActive={!timeExpired && !submitting && !examTerminated}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
              <button
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                className="nav-button"
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentQuestionIndex === 0 ? '#f1f5f9' : '#ffffff',
                  color: currentQuestionIndex === 0 ? '#94a3b8' : '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="nav-button-text">Previous</span>
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting || timeExpired}
                  className="submit-button"
                  style={{
                    padding: '8px 20px',
                    backgroundColor: submitting ? '#94a3b8' : '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {submitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M13 5l-7 7-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="nav-button-text">Submit ({answeredQuestions}/{totalQuestionCount})</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={goToNext}
                  className="next-button"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span className="nav-button-text">Next</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="exam-main-content" style={{ display: 'flex', padding: '16px', gap: '16px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Left Sidebar - Hide on small mobile, show on larger screens */}
          <div className="exam-sidebar" style={{ width: '280px', flexShrink: 0 }}>
            {/* Proctoring Camera in Sidebar - This single instance handles both widget and warning banners */}
            {enableProctoring && (
              <ProctorMonitor
                isActive={proctoringActive && !timeExpired && !submitting && !examTerminated}
                isEnabled={true}
                onViolationExceeded={handleViolationExceeded}
                onViolationCountChange={handleViolationCountChange}
                showWidget={true}
              />
            )}

            {/* Question Palette */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#475569', margin: 0 }}>
                  Questions
                </h3>
              </div>

              <div style={{ padding: '16px' }}>
                <div className="question-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                  {questions.map((question, index) => {
                    const isAnswered = answers[question.id] !== null;
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={question.id}
                        onClick={() => goToQuestion(index)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: isCurrent ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                          backgroundColor: isAnswered ? '#10b981' : '#f1f5f9',
                          color: isAnswered ? '#ffffff' : '#64748b',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        className="question-number"
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#10b981' }}></div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Answered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}></div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Not Answered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '2px solid #3b82f6' }}></div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Current</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="question-area" style={{ flex: 1, maxWidth: '900px' }}>
            {error && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#92400e'
              }}>
                {error}
              </div>
            )}

            {timeExpired && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#991b1b',
                fontWeight: '500'
              }}>
                Time expired! Your exam has been submitted.
              </div>
            )}

            {currentQuestion && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                {/* Question Header */}
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {currentQuestionIndex + 1}
                      </span>
                      <p className="question-text" style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#1e293b',
                        margin: 0,
                        lineHeight: '1.5'
                      }}>
                        {renderTextWithCode(currentQuestion.text || currentQuestion.question_text)}
                      </p>
                    </div>
                    {isCurrentAnswered && (
                      <span style={{
                        backgroundColor: '#d1fae5',
                        color: '#059669',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}>
                        Answered
                      </span>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div style={{ padding: '24px' }}>
                  {(currentQuestion.options || currentQuestion.choices || []).map((option, optIdx) => {
                    const isSelected = answers[currentQuestion.id] === option.id;
                    const optionLabel = String.fromCharCode(65 + optIdx);

                    return (
                      <div
                        key={option.id}
                        onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
                        className="option-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px 20px',
                          marginBottom: '12px',
                          border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {/* Option Badge */}
                        <span className="option-badge" style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#3b82f6' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#64748b',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '16px',
                          flexShrink: 0
                        }}>
                          {optionLabel}
                        </span>

                        {/* Option Text */}
                        <span className="option-text" style={{
                          fontSize: '15px',
                          color: '#1e293b',
                          flex: 1,
                          lineHeight: '1.5'
                        }}>
                          {renderTextWithCode(option.text || option.option_text)}
                        </span>

                        {/* Selection Indicator */}
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                          backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M11.5 3.5L5.5 9.5L2.5 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {currentQuestion.is_multiple_correct && (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      This question has multiple correct answers
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive and Global Styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Prevent text selection */
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }

        /* Responsive layout */
        @media (max-width: 1024px) {
          .exam-main-content {
            flex-direction: column !important;
            padding: 16px !important;
          }

          .exam-sidebar {
            width: 100% !important;
            display: block !important;
          }

          .question-grid {
            grid-template-columns: repeat(10, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .exam-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 12px 16px !important;
          }

          .exam-header h1 {
            font-size: 16px !important;
          }

          .exam-header p {
            font-size: 11px !important;
          }

          .exam-header-right {
            width: 100% !important;
            flex-wrap: wrap !important;
            justify-content: space-between !important;
            gap: 8px !important;
          }

          .progress-count {
            flex: 1 !important;
            min-width: 80px !important;
          }

          .timer-component {
            flex: 1 !important;
          }

          .nav-buttons {
            width: 100% !important;
            justify-content: space-between !important;
          }

          .nav-button, .next-button, .submit-button {
            flex: 1 !important;
            justify-content: center !important;
            padding: 10px 12px !important;
            font-size: 12px !important;
          }

          .question-grid {
            grid-template-columns: repeat(8, 1fr) !important;
            gap: 6px !important;
          }

          .question-number {
            width: 32px !important;
            height: 32px !important;
            font-size: 12px !important;
          }

          .option-card {
            padding: 12px 14px !important;
            margin-bottom: 10px !important;
          }

          .option-badge {
            width: 28px !important;
            height: 28px !important;
            font-size: 12px !important;
            margin-right: 12px !important;
          }

          .option-text {
            font-size: 14px !important;
          }

          .question-text {
            font-size: 14px !important;
          }
        }

        @media (max-width: 480px) {
          .exam-header {
            padding: 10px 12px !important;
          }

          .exam-header h1 {
            font-size: 14px !important;
            line-height: 1.3 !important;
          }

          .exam-main-content {
            padding: 10px !important;
            gap: 10px !important;
          }

          .question-grid {
            grid-template-columns: repeat(6, 1fr) !important;
            gap: 4px !important;
          }

          .question-number {
            width: 28px !important;
            height: 28px !important;
            font-size: 11px !important;
          }

          .nav-button svg, .next-button svg, .submit-button svg {
            width: 12px !important;
            height: 12px !important;
          }

          .nav-button-text {
            display: none !important;
          }

          .progress-count div:first-child {
            font-size: 10px !important;
          }

          .progress-count div:last-child {
            font-size: 16px !important;
          }

          .timer-component {
            font-size: 14px !important;
          }

          .option-card {
            padding: 10px 12px !important;
          }

          .option-badge {
            width: 26px !important;
            height: 26px !important;
            font-size: 11px !important;
          }

          .option-text {
            font-size: 13px !important;
          }
        }

        @media (max-width: 360px) {
          .question-grid {
            grid-template-columns: repeat(5, 1fr) !important;
          }

          .question-number {
            width: 26px !important;
            height: 26px !important;
          }

          .nav-button, .next-button, .submit-button {
            padding: 8px 10px !important;
            font-size: 11px !important;
          }
        }

        /* Hide sidebar on very small screens */
        @media (max-width: 640px) {
          .exam-sidebar {
            display: none !important;
          }

          .question-area {
            maxWidth: 100% !important;
          }
        }
      `}</style>

      {/* Fullscreen Warning Modal */}
      {showFullscreenWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(16px, 4vw, 20px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: 'clamp(24px, 5vw, 40px)',
            maxWidth: '450px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ fontSize: 'clamp(48px, 10vw, 64px)', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: '700',
              color: '#991b1b',
              margin: '0 0 12px 0'
            }}>
              Fullscreen Exited!
            </h2>
            <p style={{
              fontSize: 'clamp(13px, 3vw, 15px)',
              color: '#64748b',
              margin: '0 0 6px 0',
              lineHeight: '1.5'
            }}>
              You have exited fullscreen mode during the exam.
            </p>
            <p style={{
              fontSize: 'clamp(13px, 3vw, 15px)',
              color: '#64748b',
              margin: '0 0 20px 0',
              lineHeight: '1.5'
            }}>
              This is a violation of exam protocol. You must continue in fullscreen mode or quit the exam.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <button
                onClick={handleResumeExam}
                style={{
                  width: '100%',
                  padding: 'clamp(14px, 3vw, 16px) 24px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                }}
              >
                📺 Re-enter Fullscreen & Continue
              </button>
              <button
                onClick={handleQuitExam}
                style={{
                  width: '100%',
                  padding: 'clamp(12px, 3vw, 14px) 24px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 'clamp(13px, 3vw, 15px)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                }}
              >
                🚪 Quit Exam
              </button>
            </div>

            <p style={{
              fontSize: 'clamp(11px, 2.5vw, 13px)',
              color: '#94a3b8',
              margin: '16px 0 0 0'
            }}>
              Choosing "Quit Exam" will end your current attempt.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificationExam;
