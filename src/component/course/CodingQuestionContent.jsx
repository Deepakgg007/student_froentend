import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CodingQuestionOverview from './CodingQuestionOverview';
import CodingQuestionEditor from './CodingQuestionEditor';
import api from '../../services/api';

/**
 * CodingQuestionContent - Wrapper component for coding questions
 * Manages state between overview and editor views
 */
const CodingQuestionContent = ({ question, task, onComplete, onBack }) => {
    const [showEditor, setShowEditor] = useState(false);
    const [hasSubmission, setHasSubmission] = useState(false);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSubmission();
    }, [question?.id, task?.id]);

    const checkSubmission = async () => {
        try {
            const response = await api.get(`/student/tasks/${task.id}/submissions/`);
            let submissionData = response.data.data || response.data.results || response.data;

            if (!Array.isArray(submissionData) && submissionData.data) {
                submissionData = submissionData.data;
            }

            if (Array.isArray(submissionData)) {
                const codingSubmission = submissionData.find(
                    sub => sub.submission_type === 'question' &&
                           sub.question === question.id &&
                           sub.code_submitted
                );

                if (codingSubmission) {
                    setHasSubmission(true);
                    setSubmission(codingSubmission);
                }
            }
        } catch (err) {
            console.error('Failed to check submission:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartCoding = () => {
        setShowEditor(true);
    };

    const handleBackToOverview = () => {
        setShowEditor(false);
    };

    const handleComplete = async () => {
        await checkSubmission();
        if (onComplete) {
            await onComplete();
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (showEditor) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                background: 'white'
            }}>
                <CodingQuestionEditor
                    question={question}
                    task={task}
                    onComplete={handleComplete}
                    onBack={handleBackToOverview}
                />
            </div>
        );
    }

    return (
        <CodingQuestionOverview
            question={question}
            task={task}
            onStartCoding={handleStartCoding}
            hasSubmission={hasSubmission}
            submission={submission}
        />
    );
};

CodingQuestionContent.propTypes = {
    question: PropTypes.object.isRequired,
    task: PropTypes.object.isRequired,
    onComplete: PropTypes.func,
    onBack: PropTypes.func
};

export default CodingQuestionContent;
