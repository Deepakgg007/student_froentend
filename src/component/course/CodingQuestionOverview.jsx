import React from 'react';
import PropTypes from 'prop-types';

/**
 * CodingQuestionOverview - Simple landing page for coding questions
 */
const CodingQuestionOverview = ({ question, task, onStartCoding, hasSubmission, submission }) => {
    const codingDetails = question?.coding_details;
    const marks = question?.marks || 0;

    return (
        <div className="container py-5" style={{ maxWidth: '800px' }}>
            {/* Simple Header */}
            <div className="text-center mb-4">
                <h2 className="fw-bold mb-3">{question?.question_text || 'Coding Challenge'}</h2>
                <div className="d-flex justify-content-center gap-4 mb-4">
                    <span className="badge bg-success px-3 py-2" style={{ fontSize: '14px' }}>
                        <i className="icofont-code-alt me-1"></i>
                        {codingDetails?.language || 'Python'}
                    </span>
                    <span className="badge bg-warning px-3 py-2" style={{ fontSize: '14px' }}>
                        <i className="icofont-star me-1"></i>
                        {marks} Points
                    </span>
                    {hasSubmission && (
                        <span className="badge bg-info px-3 py-2" style={{ fontSize: '14px' }}>
                            <i className="icofont-check-circled me-1"></i>
                            Submitted
                        </span>
                    )}
                </div>
            </div>

            {/* Problem Description */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-4 text-primary">Problem Description</h5>

                    {/* Description */}
                    {codingDetails?.problem_description && (
                        <div className="mb-4">
                            <div style={{ fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#495057' }}>
                                {codingDetails.problem_description}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Action Button */}
            <div className="text-center mt-4">
                <button
                    className={`btn btn-lg px-5 py-3 ${submission?.completed ? 'btn-success' : 'btn-primary'}`}
                    onClick={onStartCoding}
                    style={{
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600'
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
};

export default CodingQuestionOverview;
