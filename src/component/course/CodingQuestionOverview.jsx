import React from 'react';
import PropTypes from 'prop-types';

/**
 * CodingQuestionOverview - Simple landing page for coding questions
 */
const CodingQuestionOverview = ({ question, task, onStartCoding, hasSubmission, submission, isDarkMode = false }) => {
    const codingDetails = question?.coding_details;
    const marks = question?.marks || 0;

    return (
        <div className="container py-5" style={{ maxWidth: '800px' }}>
            {/* Simple Header */}
            <div className="text-center mb-4">
                <h2 className="fw-bold mb-3" style={{ color: isDarkMode ? '#ffffff' : '#212529' }}>{question?.question_text || 'Coding Challenge'}</h2>
                <div className="d-flex justify-content-center gap-4 mb-4">
                    <span className="badge px-3 py-2" style={{ fontSize: '14px', backgroundColor: '#28a745', color: 'white' }}>
                        <i className="icofont-code-alt me-1"></i>
                        {codingDetails?.language || 'Python'}
                    </span>
                    <span className="badge px-3 py-2" style={{ fontSize: '14px', backgroundColor: '#ffc107', color: '#212529' }}>
                        <i className="icofont-star me-1"></i>
                        {marks} Points
                    </span>
                    {hasSubmission && (
                        <span className="badge px-3 py-2" style={{ fontSize: '14px', backgroundColor: '#17a2b8', color: 'white' }}>
                            <i className="icofont-check-circled me-1"></i>
                            Submitted
                        </span>
                    )}
                </div>
            </div>

            {/* Problem Description */}
            <div className="card mb-4" style={{
                border: isDarkMode ? '1px solid #444' : 'none',
                boxShadow: isDarkMode ? 'none' : '0 .125rem .25rem rgba(0,0,0,.075)',
                backgroundColor: isDarkMode ? 'transparent' : '#ffffff'
            }}>
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#6ec1e4' : '#0d6efd' }}>Problem Description</h5>

                    {/* Description */}
                    {codingDetails?.problem_description && (
                        <div className="mb-4">
                            <div style={{ fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: isDarkMode ? '#e0e0e0' : '#495057' }}>
                                {codingDetails.problem_description}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Action Button */}
            <div className="text-center mt-4">
                <button
                    className="btn btn-lg px-5 py-3"
                    onClick={onStartCoding}
                    style={{
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        backgroundColor: submission?.completed ? '#28a745' : '#0d6efd',
                        color: 'white',
                        border: 'none'
                    }}>
                    <i className={`${submission?.completed ? 'icofont-eye' : 'icofont-code'} me-2`}></i>
                    {submission?.completed ? 'View Code' : (hasSubmission ? 'Continue Coding' : 'Start Coding')}
                </button>
            </div>
        </div>
    );
};

CodingQuestionOverview.propTypes = {
    question: PropTypes.object.isRequired,
    task: PropTypes.object,
    onStartCoding: PropTypes.func.isRequired,
    hasSubmission: PropTypes.bool,
    submission: PropTypes.object,
    isDarkMode: PropTypes.bool,
};

export default CodingQuestionOverview;
