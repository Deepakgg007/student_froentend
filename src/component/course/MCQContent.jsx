import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { markContentComplete } from "../../services/contentProgressService";
import QuizOverview from "./QuizOverview";
import Swal from "sweetalert2";

/**
 * MCQContent – renders MCQ questions with backend persistence
 * - Shows overview page first with attempt status
 * - Fetches previous submissions on load
 * - Saves answers to backend
 * - Shows correct/incorrect answers and explanations
 */
const MCQContent = ({ questions = [], task, onComplete, onRefresh, onNext, onPrev, isDarkMode = false }) => {
  const { courseId } = useParams();
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [submissions, setSubmissions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOverview, setShowOverview] = useState(null); // null = checking, true = show overview, false = show quiz
  const [overviewRefreshKey, setOverviewRefreshKey] = useState(0); // Force overview refresh
  const [hasCheckedSubmissions, setHasCheckedSubmissions] = useState(false);

  // Fetch previous submissions on mount
  useEffect(() => {
    if (task?.id && questions.length > 0) {
      fetchSubmissions();
    }
  }, [task?.id, questions.length]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/student/tasks/${task.id}/submissions/`);

      // Handle different response structures
      let submissionData = response.data.data || response.data.results || response.data;

      // If it's an object with a data property
      if (!Array.isArray(submissionData) && submissionData.data) {
        submissionData = submissionData.data;
      }

      // Build submissions map: { questionId: submissionDetails }
      const submissionsMap = {};
      const answersMap = {};
      let hasSubmissions = false;

      if (Array.isArray(submissionData)) {
        submissionData.forEach((sub) => {
          // Check if this is an MCQ submission
          if (sub.submission_type === 'question' && sub.mcq_selected_choice) {
            // Get question ID (handle both 'question' and 'question_id' field names)
            const questionId = sub.question || sub.question_id;

            if (questionId) {
              submissionsMap[questionId] = sub;
              answersMap[questionId] = sub.mcq_selected_choice;
              hasSubmissions = true;
            }
          }
        });
      }

      setSubmissions(submissionsMap);
      setAnswers(answersMap);
      setShowResult(hasSubmissions);

      // Now we know if there are submissions, decide what to show
      if (!hasCheckedSubmissions) {
        setShowOverview(true); // Always show overview first
        setHasCheckedSubmissions(true);
      }
    } catch (err) {
      // Even on error, show overview
      if (!hasCheckedSubmissions) {
        setShowOverview(true);
        setHasCheckedSubmissions(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceChange = (qId, choiceIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: choiceIdx }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Submit each MCQ answer to backend
      const submissionPromises = questions.map(q => {
        if (answers[q.id]) {
          return api.post(`/student/tasks/${task.id}/submit-mcq/`, {
            question_id: q.id,
            selected_choice: answers[q.id]
          });
        }
        return null;
      }).filter(Boolean);

      const responses = await Promise.all(submissionPromises);

      // Update submissions with response data
      const newSubmissions = {};
      responses.forEach((response) => {
        const data = response.data.data || response.data;
        if (data.question_id) {
          newSubmissions[data.question_id] = data;
        }
      });

      setSubmissions(newSubmissions);
      setShowResult(true);
      setOverviewRefreshKey(prev => prev + 1); // Trigger overview refresh

      // Mark each question as complete in progress tracking
      if (markContentComplete && courseId) {
        for (const question of questions) {
          if (answers[question.id]) {
            try {
              await markContentComplete('question', question.id, task.id, parseInt(courseId));
            } catch (err) {
              console.warn(`Failed to mark question ${question.id} complete:`, err);
            }
          }
        }
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Show success toast message (side notification)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Quiz Submitted!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      // Refresh course data after showing message to update progress bar and green ticks
      setTimeout(() => {
        if (onRefresh) {
          onRefresh();
        }
      }, 2100);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Submission Failed',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reattempt - clear submissions and start fresh
  const handleReattempt = async () => {
    const result = await Swal.fire({
      title: 'Reattempt Quiz?',
      text: 'Your previous answers will be deleted. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f0ad4e',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, reattempt!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      // Call backend to reset quiz submissions
      await api.post(`/student/tasks/${task.id}/reset-quiz/`);

      // Clear local state
      setAnswers({});
      setSubmissions({});
      setShowResult(false);
      setShowOverview(false); // Go directly to quiz
      setOverviewRefreshKey(prev => prev + 1); // Trigger overview refresh

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Quiz Reset!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      // Refresh course data after showing message to update progress bar and green ticks
      setTimeout(() => {
        if (onRefresh) {
          onRefresh();
        }
      }, 1600);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Reset Failed',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  };

  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(answers).length;
  
  // Calculate correct answers from submissions or local evaluation
  const correctAnswers = showResult 
    ? questions.filter((q) => {
        // Use backend submission data if available
        if (submissions[q.id]) {
          return submissions[q.id].is_correct;
        }
        // Fallback to local calculation
        const mcq = q.mcq_details;
        const choices = [
          { id: 1, correct: mcq.choice_1_is_correct },
          { id: 2, correct: mcq.choice_2_is_correct },
          { id: 3, correct: mcq.choice_3_is_correct },
          { id: 4, correct: mcq.choice_4_is_correct },
        ];
        return choices.find((c) => c.id === answers[q.id])?.correct;
      }).length
    : 0;

  // Wait until we've checked submissions before showing anything
  if (showOverview === null || loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading quiz...</span>
        </div>
        <p className="mt-3 text-muted">Checking quiz status...</p>
      </div>
    );
  }

  // Show overview page
  if (showOverview) {
    return (
      <QuizOverview
        questions={questions}
        task={task}
        refreshKey={overviewRefreshKey}
        hasAttemptProp={showResult}
        submissions={submissions}
        isDarkMode={isDarkMode}
        onStartQuiz={() => {
          setShowOverview(false);
          // Starting fresh quiz - clear state
          setAnswers({});
          setSubmissions({});
          setShowResult(false);
        }}
        onViewResults={() => {
          setShowOverview(false);
          // showResult and submissions already set from fetchSubmissions
        }}
        onReattempt={handleReattempt}
      />
    );
  }

  // Loading is now handled above with showOverview === null check

  return (
    <div className="mcq-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Quiz Header - Clean & Minimal */}
      <div className="mb-4 pb-3" style={{ borderBottom: isDarkMode ? '2px solid #444' : '2px solid #e9ecef' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-1" style={{ fontSize: '20px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#212529' }}>
              {task?.title}
            </h4>
            <p className="mb-0" style={{ fontSize: '14px', color: isDarkMode ? '#adb5bd' : '#6c757d' }}>
              Multiple Choice Quiz • {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}
            </p>
          </div>
          <div>
            {!showResult && (
              <div className="text-end">
                <div style={{ fontSize: '13px', color: isDarkMode ? '#adb5bd' : '#6c757d', marginBottom: '4px' }}>Progress</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#212529' }}>
                  {answeredQuestions} / {totalQuestions}
                </div>
              </div>
            )}
            {showResult && (
              <div className="text-end">
                <div style={{ fontSize: '13px', color: isDarkMode ? '#adb5bd' : '#6c757d', marginBottom: '4px' }}>Score</div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: correctAnswers === totalQuestions ? '#28a745' : correctAnswers >= totalQuestions * 0.7 ? '#ffc107' : '#dc3545' }}>
                  {correctAnswers}/{totalQuestions}
                  <span style={{ fontSize: '14px', marginLeft: '8px', fontWeight: '500' }}>
                    ({Math.round((correctAnswers / totalQuestions) * 100)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, qIdx) => {
        const mcq = q.mcq_details;
        if (!mcq) return null;

        const choices = [
          { id: 1, text: mcq.choice_1_text, correct: mcq.choice_1_is_correct },
          { id: 2, text: mcq.choice_2_text, correct: mcq.choice_2_is_correct },
          { id: 3, text: mcq.choice_3_text, correct: mcq.choice_3_is_correct },
          { id: 4, text: mcq.choice_4_text, correct: mcq.choice_4_is_correct },
        ].filter((c) => c.text);

        const isAnswered = answers[q.id] !== undefined;
        // Use backend submission data for correctness if available
        const isCorrect = showResult && (
          submissions[q.id] ? submissions[q.id].is_correct :
          choices.find((c) => c.id === answers[q.id])?.correct
        );

        return (
          <div
            key={q.id}
            className="card mb-3"
            style={{
              borderRadius: '8px',
              border: isDarkMode ? '1px solid #444' : '1px solid #e0e0e0',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
              background: isDarkMode ? 'transparent' : '#ffffff'
            }}
          >
            {/* Question Header */}
            <div
              className="card-header"
              style={{
                background: showResult
                  ? (isCorrect
                      ? (isDarkMode ? 'rgba(40, 167, 69, 0.15)' : '#d4edda')
                      : (isDarkMode ? 'rgba(220, 53, 69, 0.15)' : '#f8d7da'))
                  : isDarkMode ? 'transparent' : '#f8f9fa',
                borderBottom: isDarkMode ? '1px solid #444' : '1px solid #e0e0e0',
                padding: '12px 16px'
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center flex-grow-1">
                  <span
                    className="me-2"
                    style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: showResult ? (isCorrect ? '#28a745' : '#dc3545') : isDarkMode ? '#e0e0e0' : '#495057'
                    }}
                  >
                    Q{qIdx + 1}.
                  </span>
                  <h6 className="mb-0" style={{ fontSize: '15px', fontWeight: '500', color: isDarkMode ? '#ffffff' : '#212529' }}>
                    {q.question_text}
                  </h6>
                </div>
                {showResult && isAnswered && (
                  <span
                    className={`badge ${isCorrect ? 'bg-success' : 'bg-danger'}`}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>
            </div>

            <div className="card-body" style={{ padding: '16px' }}>
              {/* Choices */}
              <div className="choices-container">
                {choices.map((ch, idx) => {
                  const isSelected = answers[q.id] === ch.id;
                  const showCorrect = showResult && ch.correct;
                  const showIncorrect = showResult && isSelected && !ch.correct;

                  return (
                    <div
                      key={ch.id}
                      className="choice-item mb-2"
                      style={{
                        cursor: showResult ? 'default' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => !showResult && handleChoiceChange(q.id, ch.id)}
                    >
                      <div
                        className="p-2 rounded"
                        style={{
                          border: `1.5px solid ${
                            showCorrect ? '#28a745' :
                            showIncorrect ? '#dc3545' :
                            isSelected && !showResult ? (isDarkMode ? '#6ec1e4' : '#6c757d') : (isDarkMode ? '#444' : '#dee2e6')
                          }`,
                          background: showCorrect
                            ? (isDarkMode ? 'rgba(40, 167, 69, 0.15)' : '#d4edda')
                            : showIncorrect
                              ? (isDarkMode ? 'rgba(220, 53, 69, 0.15)' : '#f8d7da')
                              : isSelected && !showResult
                                ? (isDarkMode ? '#1a3a4a' : '#f8f9fa')
                                : isDarkMode ? 'transparent' : '#ffffff'
                        }}
                      >
                        <div className="d-flex align-items-center">
                          {/* Radio Button */}
                          <input
                            className="form-check-input me-2"
                            type="radio"
                            name={`question_${q.id}`}
                            checked={isSelected}
                            onChange={() => handleChoiceChange(q.id, ch.id)}
                            disabled={showResult}
                            style={{
                              cursor: showResult ? 'default' : 'pointer',
                              flexShrink: 0
                            }}
                          />

                          {/* Choice Letter */}
                          <span
                            className="me-2"
                            style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: showCorrect ? '#28a745' :
                                showIncorrect ? '#dc3545' : isDarkMode ? '#e0e0e0' : '#212529',
                              flexShrink: 0
                            }}
                          >
                            {String.fromCharCode(65 + idx)}.
                          </span>

                          {/* Choice Text */}
                          <label
                            className="flex-grow-1 mb-0"
                            style={{
                              cursor: showResult ? 'default' : 'pointer',
                              fontSize: '14px',
                              color: isDarkMode ? '#e0e0e0' : '#212529'
                            }}
                          >
                            {ch.text}
                          </label>

                          {/* Status Icons */}
                          {showCorrect && (
                            <i className="icofont-check-circled ms-2 text-success" style={{ fontSize: '18px', flexShrink: 0 }}></i>
                          )}
                          {showIncorrect && (
                            <i className="icofont-close-circled ms-2 text-danger" style={{ fontSize: '18px', flexShrink: 0 }}></i>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResult && submissions[q.id] && mcq.solution_explanation && (
                <div
                  className="mt-3 p-2 rounded"
                  style={{
                    background: isDarkMode ? 'transparent' : '#f8f9fa',
                    borderLeft: isDarkMode ? '3px solid #6ec1e4' : '3px solid #6c757d',
                    border: isDarkMode ? '1px solid #444' : 'none',
                    borderLeft: isDarkMode ? '3px solid #6ec1e4' : '3px solid #6c757d'
                  }}
                >
                  <div className="d-flex align-items-start">
                    <i className="icofont-info-circle me-2 mt-1" style={{ fontSize: '16px', flexShrink: 0, color: isDarkMode ? '#6ec1e4' : '#6c757d' }}></i>
                    <div>
                      <strong style={{ fontSize: '13px', color: isDarkMode ? '#ffffff' : '#212529' }}>Explanation:</strong>
                      <p className="mb-0 mt-1" style={{ fontSize: '13px', color: isDarkMode ? '#e0e0e0' : '#495057' }}>
                        {mcq.solution_explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="mt-5 pt-4" style={{ borderTop: isDarkMode ? '1px solid #444' : '1px solid #e9ecef' }}>
        {!showResult ? (
          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setOverviewRefreshKey(prev => prev + 1);
                setShowOverview(true);
              }}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                borderRadius: '6px',
                fontWeight: '500',
                backgroundColor: isDarkMode ? 'transparent' : '#fff',
                color: isDarkMode ? '#adb5bd' : '#6c757d',
                borderColor: isDarkMode ? '#444' : '#6c757d'
              }}
            >
              <i className="icofont-arrow-left me-2"></i>
              Back to Overview
            </button>
            <button
              className="btn"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length || isSubmitting}
              style={{
                padding: '12px 32px',
                fontSize: '15px',
                background: Object.keys(answers).length === questions.length && !isSubmitting ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                opacity: Object.keys(answers).length !== questions.length || isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="icofont-check-circled me-2"></i>
                  Submit Quiz ({Object.keys(answers).length}/{totalQuestions})
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setOverviewRefreshKey(prev => prev + 1);
                setShowOverview(true);
              }}
              style={{
                padding: '10px 28px',
                fontSize: '14px',
                borderRadius: '6px',
                fontWeight: '500',
                backgroundColor: isDarkMode ? 'transparent' : '#fff',
                color: isDarkMode ? '#adb5bd' : '#6c757d',
                borderColor: isDarkMode ? '#444' : '#6c757d'
              }}
            >
              <i className="icofont-arrow-left me-2"></i>
              Back to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

MCQContent.propTypes = {
  questions: PropTypes.array,
  task: PropTypes.object,
  onComplete: PropTypes.func, // Optional - not used for MCQ (only for document/video)
  onRefresh: PropTypes.func,  // Optional - trigger overview refresh
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
};

export default MCQContent;