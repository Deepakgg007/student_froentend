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
  onComplete,
  attemptData,
  enableProctoring = true, // New prop to enable/disable proctoring
  collegeSlug = null, // For navigation
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
  }, [certificationId, attemptData]);

  // Handle violation exceeded - terminate exam
  const handleViolationExceeded = useCallback((recordedViolations) => {
    setProctoringActive(false);
    setViolations(recordedViolations);
    setExamTerminated(true);
  }, []);

  // Handle violation count change
  const handleViolationCountChange = useCallback(() => {
    // Violation count updated silently
  }, []);

  // Activate proctoring after exam loads
  useEffect(() => {
    if (!loading && questions.length > 0 && enableProctoring) {
      setProctoringActive(true);
    }
  }, [loading, questions.length, enableProctoring]);

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

      const response = await submitCertificationAttempt(attempt.id, answersArray);
      const result = response.data.data || response.data;

      if (onComplete) {
        onComplete(result);
      }
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
    const returnPath = collegeSlug ? `/${collegeSlug}/profile?tab=certificates` : '/profile?tab=certificates';
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
      <div style={{
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Progress */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Answered</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
              {answeredQuestions}<span style={{ color: '#94a3b8', fontWeight: '400' }}>/{totalQuestionCount}</span>
            </div>
          </div>

          {/* Timer */}
          <Timer
            initialMinutes={duration}
            onTimeExpired={handleTimeExpired}
            isActive={!timeExpired && !submitting}
          />

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <button
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
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
              Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitExam}
                disabled={submitting || timeExpired}
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
                    Submit ({answeredQuestions}/{totalQuestionCount})
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goToNext}
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
                Next
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', padding: '24px', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Left Sidebar */}
        <div style={{ width: '280px', flexShrink: 0 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
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
        <div style={{ flex: 1, maxWidth: '900px' }}>
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
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#1e293b',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {renderTextWithCode(currentQuestion.text)}
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
                {currentQuestion.options && currentQuestion.options.map((option, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  const optionLabel = String.fromCharCode(65 + optIdx);

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
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
                      <span style={{
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
                      <span style={{
                        fontSize: '15px',
                        color: '#1e293b',
                        flex: 1,
                        lineHeight: '1.5'
                      }}>
                        {renderTextWithCode(option.text)}
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
    </>
  );
};

export default CertificationExam;
