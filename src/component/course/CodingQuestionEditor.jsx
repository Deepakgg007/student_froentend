import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Editor from "@monaco-editor/react";
import api from '../../services/api';
import { markContentComplete } from '../../services/contentProgressService';
import Swal from 'sweetalert2';

/**
 * CodingQuestionEditor - Split screen coding interface
 * Left: Problem description and test cases
 * Right: Code editor and output
 */
const CodingQuestionEditor = ({ question, task, onComplete, onBack, isDarkMode = false }) => {
    const { courseId } = useParams();
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [testResults, setTestResults] = useState(null);

    const codingDetails = question?.coding_details;
    const language = codingDetails?.language || 'python';

    // Load previous submission if exists
    useEffect(() => {
        fetchPreviousSubmission();
    }, [question?.id, task?.id]);

    const fetchPreviousSubmission = async () => {
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

                if (codingSubmission?.code_submitted) {
                    setCode(codingSubmission.code_submitted);
                } else {
                    // Set default template based on language
                    setCode(getDefaultTemplate(language));
                }
            } else {
                setCode(getDefaultTemplate(language));
            }
        } catch (err) {
            console.error('Failed to fetch previous submission:', err);
            setCode(getDefaultTemplate(language));
        }
    };

    const getDefaultTemplate = (lang) => {
        const templates = {
            python: '# Write your solution here\n\ndef solution():\n    pass\n\n# Test your code\nif __name__ == "__main__":\n    result = solution()\n    print(result)',
            javascript: '// Write your solution here\n\nfunction solution() {\n    // Your code\n}\n\n// Test your code\nconsole.log(solution());',
            java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}',
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
            c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}'
        };
        return templates[lang] || '// Write your solution here\n';
    };

    const handleRunCode = async () => {
        if (!code.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'No Code',
                text: 'Please write some code first!',
                confirmButtonColor: '#f0ad4e'
            });
            return;
        }

        setRunning(true);
        setOutput('Running code...');
        setTestResults(null);

        try {
            const response = await api.post('/student/submissions/run/', {
                code: code,
                language: language,
                input: codingDetails?.sample_input || '',
                challenge_slug: null,
                task_question_id: question.id
            });

            const data = response.data;

            if (data.success) {
                if (data.results && Array.isArray(data.results)) {
                    // Multiple test cases
                    const passedCount = data.results.filter(r => r.is_correct).length;
                    setTestResults({
                        passed: passedCount,
                        total: data.results.length,
                        results: data.results
                    });

                    let outputText = `${passedCount}/${data.results.length} Test Cases Passed\n\n`;
                    data.results.forEach((result, idx) => {
                        outputText += `Test Case ${idx + 1}: ${result.is_correct ? '✓ Passed' : '✗ Failed'}\n`;
                        if (!result.hidden) {
                            outputText += `Input: ${result.input || '(empty)'}\n`;
                            outputText += `Expected: ${result.expected || '(empty)'}\n`;
                            // Handle Python's None value in output
                            const userOut = result.user_output || result.output || '';
                            const displayOut = (userOut === 'None' || userOut === 'null' || !userOut.trim()) 
                                ? '(No output)' 
                                : userOut;
                            outputText += `Your Output: ${displayOut}\n`;
                            outputText += `Runtime: ${result.runtime?.toFixed(2) || 0}ms\n\n`;
                        }
                    });
                    setOutput(outputText);
                } else {
                    // Single execution - Compare output with expected
                    const actualOutput = data.output || data.user_output || '';
                    const expectedOutput = codingDetails?.sample_output || '';
                    
                    // Normalize outputs for comparison (trim whitespace)
                    const normalizedActual = actualOutput.trim();
                    const normalizedExpected = expectedOutput.trim();
                    
                    // Check if outputs match
                    const isCorrect = data.status === 'OK' && 
                                     normalizedActual && 
                                     normalizedActual !== 'None' && 
                                     normalizedActual !== 'null' &&
                                     normalizedActual === normalizedExpected;
                    
                    setTestResults({
                        passed: isCorrect ? 1 : 0,
                        total: 1,
                        status: data.status
                    });

                    let outputText = '';
                    if (isCorrect) {
                        outputText = '✓ Test Case Passed!\n\n';
                    } else if (data.error) {
                        outputText = '✗ Execution Failed\n\n';
                    } else {
                        outputText = '✗ Test Case Failed\n\n';
                    }
                    
                    if (codingDetails?.sample_input) {
                        outputText += `Input:\n${codingDetails.sample_input}\n\n`;
                    }
                    if (codingDetails?.sample_output) {
                        outputText += `Expected Output:\n${codingDetails.sample_output}\n\n`;
                    }
                    
                    // Handle Python's None value properly
                    const displayOutput = (actualOutput === 'None' || actualOutput === 'null' || !actualOutput.trim()) 
                        ? '(No output - make sure your code prints the result)' 
                        : actualOutput;
                    outputText += `Your Output:\n${displayOutput}`;
                    
                    if (data.error) {
                        outputText += `\n\nError:\n${data.error}`;
                    }
                    
                    setOutput(outputText);
                }
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to execute code';
            setOutput(`Error: ${errorMsg}`);
            setTestResults({ passed: 0, total: 1 });
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        // Button is already disabled if validation fails, but double-check
        if (!testResults || testResults.passed !== testResults.total || testResults.total === 0) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await api.post(`/student/tasks/${task.id}/submit-coding/`, {
                question_id: question.id,
                code: code
            });

            const data = response.data;
            const allTestsPassed = data.all_tests_passed || data.success;
            const passedTests = data.passed_tests || 0;
            const totalTests = data.total_tests || 0;

            // Build output text for editor
            let outputText = '';

            if (allTestsPassed) {
                outputText = `✓ All Tests Passed! Code Saved.\n`;
                outputText += `Score: ${data.score}/${data.max_score} points\n\n`;
            } else {
                outputText = `✗ Some Tests Failed. Please fix your code.\n`;
                outputText += `${passedTests}/${totalTests} Test Cases Passed\n\n`;
            }

            // Show test case results in output
            if (data.results && Array.isArray(data.results)) {
                data.results.forEach((testResult, idx) => {
                    const isPassed = testResult.is_correct;
                    outputText += `Test Case ${idx + 1}: ${isPassed ? '✓ Passed' : '✗ Failed'}\n`;

                    if (!testResult.hidden) {
                        outputText += `  Input: ${testResult.input || '(empty)'}\n`;
                        outputText += `  Expected: ${testResult.expected || '(empty)'}\n`;
                        // Handle Python's None value
                        const userOut = testResult.user_output || '';
                        const displayOut = (userOut === 'None' || userOut === 'null' || !userOut.trim()) 
                            ? '(No output)' 
                            : userOut;
                        outputText += `  Your Output: ${displayOut}\n`;
                        if (testResult.error) {
                            outputText += `  Error: ${testResult.error}\n`;
                        }
                        outputText += `  Runtime: ${testResult.runtime?.toFixed(2) || 0}ms\n`;
                    } else {
                        outputText += `  (Hidden test case)\n`;
                    }
                    outputText += '\n';
                });
            }

            // Show output in editor
            setOutput(outputText);
            setTestResults({
                passed: passedTests,
                total: totalTests
            });

            // Scroll to output panel
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

            // Simple success notification - only submit if all tests pass
            if (allTestsPassed) {
                // Mark question as complete in progress tracking
                if (markContentComplete && courseId) {
                    try {
                        await markContentComplete('question', question.id, task.id, parseInt(courseId));
                    } catch (err) {
                        console.warn(`Failed to mark question ${question.id} complete:`, err);
                    }
                }

                // Refresh task completion status
                if (onComplete) {
                    await onComplete();
                }

                // Show success toast
                Swal.fire({
                    icon: 'success',
                    title: `Submitted! +${data.score} points`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                
                // Navigate back after brief delay
                setTimeout(() => {
                    if (onBack) {
                        onBack();
                    }
                }, 1500);
            } else {
                // This shouldn't happen due to pre-check, but handle it
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: `Only ${passedTests}/${totalTests} test cases passed. Please fix your code.`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 4000,
                    timerProgressBar: true
                });
            }
        } catch (err) {
            console.error('Failed to submit code:', err);
            console.error('Error response:', err.response?.data);

            setOutput(`Error: ${err.response?.data?.message || err.message || 'Failed to submit code. Please try again.'}`);
            setTestResults({ passed: 0, total: 1 });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="coding-question-editor" style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff'
        }}>
            {/* Header */}
            <div className="border-bottom" style={{
                padding: '16px 24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
                borderBottomColor: isDarkMode ? '#444' : '#dee2e6'
            }}>
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                        {onBack && (
                            <button className="btn btn-sm" style={{
                                backgroundColor: 'transparent',
                                color: isDarkMode ? '#adb5bd' : '#6c757d',
                                border: isDarkMode ? '1px solid #444' : '1px solid #6c757d'
                            }} onClick={onBack}>
                                <i className="icofont-arrow-left me-2"></i>
                                Back to Overview
                            </button>
                        )}
                        <div>
                            <h5 className="mb-0 fw-bold" style={{ color: isDarkMode ? '#ffffff' : '#212529' }}>{question?.question_text}</h5>
                            <small style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>{language} • {question?.marks} points</small>
                        </div>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        {testResults && testResults.total > 0 && (
                            <span className="badge" style={{
                                fontSize: '12px',
                                padding: '6px 10px',
                                backgroundColor: testResults.passed === testResults.total ? '#28a745' : '#dc3545',
                                color: 'white'
                            }}>
                                {testResults.passed}/{testResults.total} Tests Passed
                            </span>
                        )}
                        <button
                            className="btn"
                            style={{
                                backgroundColor: 'transparent',
                                color: isDarkMode ? '#6ec1e4' : '#0d6efd',
                                border: isDarkMode ? '1px solid #6ec1e4' : '1px solid #0d6efd'
                            }}
                            onClick={handleRunCode}
                            disabled={running}>
                            <i className="icofont-play me-2"></i>
                            {running ? 'Running...' : 'Run Code'}
                        </button>
                        <button
                            className="btn"
                            style={{
                                backgroundColor: testResults && testResults.passed === testResults.total && testResults.total > 0 ? '#28a745' : '#6c757d',
                                color: 'white',
                                border: 'none'
                            }}
                            onClick={handleSubmit}
                            disabled={submitting || !testResults || testResults.passed !== testResults.total || testResults.total === 0}
                            title={!testResults || testResults.passed !== testResults.total ? 'Run code and pass all tests first' : 'Submit your solution'}>
                            <i className="icofont-check me-2"></i>
                            {submitting ? 'Submitting...' : (testResults && testResults.passed === testResults.total && testResults.total > 0 ? 'Submit Solution' : 'Submit (Disabled)')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Split Screen Layout */}
            <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
                {/* Left Panel - Problem Description */}
                <div className="border-end" style={{
                    width: '45%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '24px',
                    borderRightColor: isDarkMode ? '#444' : '#dee2e6',
                    backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff'
                }}>
                    {/* Problem Description */}
                    <div className="mb-4">
                        <h6 className="fw-bold mb-3" style={{ color: isDarkMode ? '#6ec1e4' : '#0d6efd' }}>Problem Description</h6>
                        <p style={{ fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: isDarkMode ? '#e0e0e0' : '#495057' }}>
                            {codingDetails?.problem_description}
                        </p>
                    </div>

                    {/* Input/Output Format */}
                    <div className="row g-3 mb-4">
                        <div className="col-12">
                            <div className="card" style={{
                                background: isDarkMode ? 'transparent' : '#f8f9fa',
                                border: isDarkMode ? '1px solid #444' : 'none'
                            }}>
                                <div className="card-body p-3">
                                    <h6 className="fw-bold mb-2" style={{ fontSize: '13px', color: isDarkMode ? '#ffffff' : '#212529' }}>Input Format</h6>
                                    <pre className="mb-0" style={{
                                        fontSize: '12px',
                                        whiteSpace: 'pre-wrap',
                                        color: isDarkMode ? '#e0e0e0' : '#495057'
                                    }}>
{codingDetails?.input_description}
                                    </pre>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="card" style={{
                                background: isDarkMode ? 'transparent' : '#f8f9fa',
                                border: isDarkMode ? '1px solid #444' : 'none'
                            }}>
                                <div className="card-body p-3">
                                    <h6 className="fw-bold mb-2" style={{ fontSize: '13px', color: isDarkMode ? '#ffffff' : '#212529' }}>Output Format</h6>
                                    <pre className="mb-0" style={{
                                        fontSize: '12px',
                                        whiteSpace: 'pre-wrap',
                                        color: isDarkMode ? '#e0e0e0' : '#495057'
                                    }}>
{codingDetails?.output_description}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                     {/* Constraints */}
                    {codingDetails?.constraints && (
                        <div className="card mb-3" style={{
                            background: isDarkMode ? 'transparent' : '#fff3cd',
                            border: isDarkMode ? '1px solid #ffc107' : 'none'
                        }}>
                            <div className="card-body p-3">
                                <h6 className="fw-bold mb-2" style={{ fontSize: '13px', color: isDarkMode ? '#ffc107' : '#856404' }}>
                                    Constraints
                                </h6>
                                <div style={{
                                    fontSize: '12px',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.7',
                                    color: isDarkMode ? '#e0e0e0' : '#856404'
                                }}>
                                    {codingDetails.constraints}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sample Test Case */}
                    <div className="card mb-4" style={{
                        background: isDarkMode ? 'transparent' : '#e7f3ff',
                        border: isDarkMode ? '1px solid #17a2b8' : 'none'
                    }}>
                        <div className="card-body p-3">

                            <div className="mb-2">
                                <small className="fw-bold" style={{ color: isDarkMode ? '#17a2b8' : '#004085' }}>INPUT</small>
                                <pre className="mt-1 p-2 rounded" style={{
                                    background: isDarkMode ? '#2d2d2d' : 'white',
                                    fontSize: '12px',
                                    whiteSpace: 'pre-wrap',
                                    color: isDarkMode ? '#e0e0e0' : '#212529',
                                    border: isDarkMode ? '1px solid #444' : 'none'
                                }}>
{codingDetails?.sample_input}
                                </pre>
                            </div>
                            <div>
                                <small className="fw-bold" style={{ color: isDarkMode ? '#17a2b8' : '#004085' }}>EXPECTED OUTPUT</small>
                                <pre className="mt-1 p-2 rounded" style={{
                                    background: isDarkMode ? '#2d2d2d' : 'white',
                                    fontSize: '12px',
                                    whiteSpace: 'pre-wrap',
                                    color: isDarkMode ? '#e0e0e0' : '#212529',
                                    border: isDarkMode ? '1px solid #444' : 'none'
                                }}>
{codingDetails?.sample_output}
                                </pre>
                            </div>
                        </div>
                    </div>

                   

                    {/* Hints */}
                    {codingDetails?.hints && (
                        <div className="card" style={{
                            background: isDarkMode ? 'transparent' : '#d1ecf1',
                            border: isDarkMode ? '1px solid #17a2b8' : 'none'
                        }}>
                            <div className="card-body p-3">
                                <h6 className="fw-bold mb-2" style={{ fontSize: '13px', color: isDarkMode ? '#17a2b8' : '#0c5460' }}>
                                    <i className="icofont-bulb-alt me-2"></i>
                                    Hints
                                </h6>
                                <div style={{
                                    fontSize: '12px',
                                    whiteSpace: 'pre-wrap',
                                    color: isDarkMode ? '#e0e0e0' : '#0c5460'
                                }}>
                                    {codingDetails.hints}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Code Editor */}
                <div className="d-flex flex-column" style={{
                    width: '55%',
                    backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff'
                }}>
                    {/* Code Editor */}
                    <div className="flex-grow-1" style={{ position: 'relative' }}>
                        <Editor
                            height="100%"
                            language={language}
                            theme={isDarkMode ? "vs-dark" : "light"}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 4
                            }}
                        />
                    </div>

                    {/* Output Panel */}
                    <div className="border-top" style={{ height: '30%', background: '#1e1e1e', padding: '16px', overflowY: 'auto' }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <h6 className="mb-0 text-white">
                                <i className="icofont-terminal me-2"></i>
                                Output
                            </h6>
                            {testResults && (
                                <span className={`badge ${testResults.passed === testResults.total ? 'bg-success' : 'bg-danger'}`}>
                                    {testResults.passed}/{testResults.total} Test Cases Passed
                                </span>
                            )}
                        </div>
                        <pre className="mb-0 text-white" style={{
                            fontSize: '13px',
                            fontFamily: 'Satoshi, Verdana, sans-serif',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                        }}>
{output || 'Run your code to see the output...'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

CodingQuestionEditor.propTypes = {
    question: PropTypes.object.isRequired,
    task: PropTypes.object.isRequired,
    onComplete: PropTypes.func,
    onBack: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool,
};

export default CodingQuestionEditor;
