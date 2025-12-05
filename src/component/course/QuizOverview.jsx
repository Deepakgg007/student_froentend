import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';

/**
 * QuizOverview - Modern landing page before starting quiz
 * Shows quiz info, attempt status, and start/view results button
 */
const QuizOverview = ({ questions = [], task, onStartQuiz, onViewResults, onReattempt, refreshKey, hasAttemptProp, submissions, isDarkMode = false }) => {
    const [loading, setLoading] = useState(false);
    const [attemptStatus, setAttemptStatus] = useState({
        hasAttempt: false,
        totalAnswered: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        score: 0,
        percentage: 0
    });

    // Calculate status from props first
    useEffect(() => {
        if (hasAttemptProp !== undefined && submissions) {
            calculateStatusFromProps();
        } else if (task?.id && questions.length > 0) {
            fetchAttemptStatus();
        }
    }, [task?.id, questions.length, refreshKey, hasAttemptProp, submissions]);

    const calculateStatusFromProps = () => {
        let answeredCount = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let totalScore = 0;

        Object.values(submissions).forEach(sub => {
            answeredCount++;
            if (sub.is_correct) {
                correctCount++;
            } else {
                wrongCount++;
            }
            totalScore += parseFloat(sub.score || 0);
        });

        setAttemptStatus({
            hasAttempt: answeredCount > 0,
            totalAnswered: answeredCount,
            correctAnswers: correctCount,
            wrongAnswers: wrongCount,
            score: totalScore,
            percentage: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
        });
    };

    const fetchAttemptStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/tasks/${task.id}/submissions/`);
            let submissionData = response.data.data || response.data.results || response.data;

            if (!Array.isArray(submissionData) && submissionData.data) {
                submissionData = submissionData.data;
            }

            let answeredCount = 0;
            let correctCount = 0;
            let wrongCount = 0;
            let totalScore = 0;

            if (Array.isArray(submissionData)) {
                submissionData.forEach((sub) => {
                    if (sub.submission_type === 'question' && sub.mcq_selected_choice) {
                        const questionId = sub.question || sub.question_id;
                        if (questionId) {
                            answeredCount++;
                            if (sub.is_correct) {
                                correctCount++;
                            } else {
                                wrongCount++;
                            }
                            totalScore += parseFloat(sub.score || 0);
                        }
                    }
                });
            }

            setAttemptStatus({
                hasAttempt: answeredCount > 0,
                totalAnswered: answeredCount,
                correctAnswers: correctCount,
                wrongAnswers: wrongCount,
                score: totalScore,
                percentage: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
            });
        } catch (err) {
            // Error fetching attempt status
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const totalQuestions = questions.length;
    const { hasAttempt, correctAnswers, wrongAnswers, score, percentage } = attemptStatus;

    return (
        <div className="container py-4" style={{ maxWidth: '900px' }}>
            {/* Header Section */}
            <div className="mb-5">
                <h3 className="mb-2" style={{ fontSize: '24px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#212529' }}>
                    {task?.title || 'Quiz Assessment'}
                </h3>
                <p className="mb-0" style={{ fontSize: '14px', color: isDarkMode ? '#adb5bd' : '#6c757d' }}>
                    Multiple Choice Quiz • Test your knowledge
                </p>
            </div>

            {/* Quiz Info Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div style={{
                        padding: '20px',
                        border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef',
                        borderRadius: '8px',
                        background: isDarkMode ? 'transparent' : '#ffffff'
                    }}>
                        <div style={{ fontSize: '13px', color: isDarkMode ? '#adb5bd' : '#6c757d', marginBottom: '8px' }}>Total Questions</div>
                        <div style={{ fontSize: '28px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#212529' }}>{totalQuestions}</div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div style={{
                        padding: '20px',
                        border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef',
                        borderRadius: '8px',
                        background: isDarkMode ? 'transparent' : '#ffffff'
                    }}>
                        <div style={{ fontSize: '13px', color: isDarkMode ? '#adb5bd' : '#6c757d', marginBottom: '8px' }}>Passing Score</div>
                        <div style={{ fontSize: '28px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#212529' }}>{task?.passing_score || 'N/A'}</div>
                    </div>
                </div>
            </div>

            {/* Attempt Status */}
            {hasAttempt ? (
                <>
                    {/* Results Card */}
                    <div style={{
                        padding: '32px',
                        border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef',
                        borderRadius: '8px',
                        background: isDarkMode ? 'transparent' : '#ffffff',
                        marginBottom: '24px'
                    }}>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h5 className="mb-0" style={{ fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#212529' }}>Quiz Completed</h5>
                            <span style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '500',
                                background: percentage >= 60 ? '#d4edda' : '#f8d7da',
                                color: percentage >= 60 ? '#155724' : '#721c24'
                            }}>
                                {percentage >= 60 ? '✓ Passed' : '✗ Not Passed'}
                            </span>
                        </div>

                        {/* Score Display */}
                        <div className="text-center mb-4">
                            <div style={{ fontSize: '48px', fontWeight: '700', color: percentage >= 60 ? '#28a745' : '#dc3545', marginBottom: '8px' }}>
                                {percentage}%
                            </div>
                            <div style={{ fontSize: '14px', color: isDarkMode ? '#adb5bd' : '#6c757d' }}>Final Score</div>
                        </div>

                        {/* Stats Grid */}
                        <div className="row g-3 text-center">
                            <div className="col-4">
                                <div style={{
                                    padding: '16px',
                                    border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef',
                                    borderRadius: '6px',
                                    background: isDarkMode ? 'transparent' : 'transparent'
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#28a745', marginBottom: '4px' }}>
                                        {correctAnswers}
                                    </div>
                                    <div style={{ fontSize: '13px', color: isDarkMode ? '#adb5bd' : '#6c757d' }}>Correct</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div style={{
                                    padding: '16px',
                                    border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef',
                                    borderRadius: '6px',
                                    background: isDarkMode ? 'transparent' : 'transparent'
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc3545', marginBottom: '4px' }}>
                                        {wrongAnswers}
                                    </div>
                                    <div style={{ fontSize: '13px', color: isDarkMode ? '#adb5bd' : '#6c757d' }}>Wrong</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div style={{
                                    padding: '16px',
                                    border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef',
                                    borderRadius: '6px',
                                    background: isDarkMode ? 'transparent' : 'transparent'
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#17a2b8', marginBottom: '4px' }}>
                                        {score.toFixed(1)}
                                    </div>
                                    <div style={{ fontSize: '13px', color: isDarkMode ? '#adb5bd' : '#6c757d' }}>Points</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <button
                            onClick={onViewResults}
                            style={{
                                padding: '12px 32px',
                                fontSize: '15px',
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                            <i className="icofont-eye me-2"></i>
                            View Answers
                        </button>
                        <button
                            onClick={onReattempt}
                            style={{
                                padding: '12px 32px',
                                fontSize: '15px',
                                background: 'transparent',
                                color: isDarkMode ? '#adb5bd' : '#6c757d',
                                border: isDarkMode ? '1px solid #444' : '1px solid #dee2e6',
                                borderRadius: '6px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}>
                            <i className="icofont-refresh me-2"></i>
                            Try Again
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Not Attempted Card */}
                    <div style={{
                        padding: '40px',
                        border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef',
                        borderRadius: '8px',
                        background: isDarkMode ? 'transparent' : '#f8f9fa',
                        marginBottom: '32px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', color: isDarkMode ? '#adb5bd' : '#6c757d', marginBottom: '16px' }}>
                            <i className="icofont-question-circle"></i>
                        </div>
                        <h5 style={{ fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#212529', marginBottom: '12px' }}>
                            Ready to Test Your Knowledge?
                        </h5>
                        <p style={{ fontSize: '14px', color: isDarkMode ? '#adb5bd' : '#6c757d', marginBottom: '0' }}>
                            This quiz contains {totalQuestions} multiple choice questions.<br/>
                            Take your time and answer carefully. Good luck!
                        </p>
                    </div>

                    {/* Start Button */}
                    <div className="text-center">
                        <button
                            onClick={onStartQuiz}
                            style={{
                                padding: '14px 48px',
                                fontSize: '16px',
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                            <i className="icofont-play me-2"></i>
                            Start Quiz
                        </button>
                        <p style={{ fontSize: '13px', color: isDarkMode ? '#adb5bd' : '#6c757d', marginTop: '16px', marginBottom: '0' }}>
                            You can review your answers before final submission
                        </p>
                    </div>
                </>
            )}

            {/* Instructions */}
            {task?.instructions && (
                <div style={{
                    padding: '24px',
                    border: isDarkMode ? '1px solid #444' : '1px solid #e9ecef',
                    borderRadius: '8px',
                    background: isDarkMode ? 'transparent' : '#ffffff',
                    marginTop: '24px'
                }}>
                    <h6 style={{ fontSize: '15px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#212529', marginBottom: '16px' }}>
                        <i className="icofont-list me-2" style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}></i>
                        Instructions
                    </h6>
                    <div style={{ fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: isDarkMode ? '#e0e0e0' : '#495057' }}>
                        {task.instructions}
                    </div>
                </div>
            )}
        </div>
    );
};

QuizOverview.propTypes = {
    questions: PropTypes.array,
    task: PropTypes.object,
    onStartQuiz: PropTypes.func.isRequired,
    onViewResults: PropTypes.func.isRequired,
    onReattempt: PropTypes.func,
    refreshKey: PropTypes.number,
    hasAttemptProp: PropTypes.bool,
    submissions: PropTypes.object,
    isDarkMode: PropTypes.bool,
};

export default QuizOverview;
