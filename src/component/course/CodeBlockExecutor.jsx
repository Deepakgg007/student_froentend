import React, { useState } from 'react';
import './CodeBlockExecutor.css';

const CodeBlockExecutor = ({ code, language = 'javascript', title = '', description = '', isDarkMode = false }) => {
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedCode, setEditedCode] = useState(code);

    const handleCopyCode = async () => {
        try {
            const codeToCopy = isEditMode ? editedCode : code;
            await navigator.clipboard.writeText(codeToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        setError('');
        setOutput('');
        setShowOutput(true);

        try {
            const codeToRun = isEditMode ? editedCode : code;
            const langLower = language.toLowerCase();

            // For JavaScript - execute directly in browser (works instantly!)
            if (langLower === 'javascript' || langLower === 'js') {
                try {
                    // Capture console output
                    const logs = [];
                    const originalLog = console.log;
                    const originalError = console.error;
                    const originalWarn = console.warn;

                    console.log = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                    console.error = (...args) => logs.push('ERROR: ' + args.join(' '));
                    console.warn = (...args) => logs.push('WARN: ' + args.join(' '));

                    // Execute the code
                    const result = eval(codeToRun);

                    // Restore console
                    console.log = originalLog;
                    console.error = originalError;
                    console.warn = originalWarn;

                    // Display output
                    if (logs.length > 0) {
                        setOutput(logs.join('\n'));
                    } else if (result !== undefined) {
                        setOutput(String(result));
                    } else {
                        setOutput('Code executed successfully with no output');
                    }
                    return;
                } catch (execError) {
                    setError(`Runtime Error:\n${execError.message}`);
                    return;
                }
            }

            // For other languages - use backend Docker sandbox
            // Try backend first, then fallback to online compiler message
            const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? 'https://shobhaconsultancy.in/api'
                : 'https://shobhaconsultancy.in/api';

            try {
                const response = await fetch(`${API_BASE_URL}/student/execute-code-rich-text/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: codeToRun,
                        language: langLower
                    })
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.success) {
                        if (data.error) {
                            setError(data.error);
                        } else {
                            setOutput(data.output || 'Code executed successfully with no output');
                        }
                        return;
                    } else {
                        throw new Error(data.error || 'Execution failed');
                    }
                } else {
                    throw new Error(`Backend returned HTTP ${response.status}`);
                }
            } catch (backendError) {
                throw backendError;
            }

        } catch (err) {
            setError(err.message || 'Code execution failed');
        } finally {
            setIsRunning(false);
        }
    };

    const handleResetCode = () => {
        setEditedCode(code);
    };

    const getFileExtension = (lang) => {
        const extensions = {
            'javascript': 'js',
            'python': 'py',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'csharp': 'cs',
            'php': 'php',
            'ruby': 'rb',
            'go': 'go',
            'rust': 'rs',
        };
        return extensions[lang.toLowerCase()] || 'txt';
    };

    const getLanguageName = (lang) => {
        const languageNames = {
            'javascript': 'JavaScript',
            'python': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'csharp': 'C#',
            'php': 'PHP',
            'ruby': 'Ruby',
            'go': 'Go',
            'rust': 'Rust',
        };
        return languageNames[lang.toLowerCase()] || lang;
    };

    return (
        <div className="code-block-executor" style={{
            borderColor: isDarkMode ? '#444' : '#e2e8f0'
        }}>
            <div className="code-block-header" style={{
                borderBottomColor: isDarkMode ? '#444' : '#e2e8f0'
            }}>
                <div className="code-block-title-section">
                    {title && <h5 className="code-block-title" style={{
                        color: isDarkMode ? '#ffffff' : '#1a202c'
                    }}>{title}</h5>}
                    {description && <p className="code-block-description" style={{
                        color: isDarkMode ? '#adb5bd' : '#718096'
                    }}>{description}</p>}
                </div>
                <div className="code-block-right-section">
                    <div className="code-language-badge">
                        <span className={`language-tag language-${language.toLowerCase()}`}>
                            {getLanguageName(language)}
                        </span>
                    </div>
                    <div className="code-block-actions">
                    <button
                        className={`btn-action copy-btn ${copied ? 'copied' : ''}`}
                        onClick={handleCopyCode}
                        title={copied ? 'Copied!' : 'Copy code'}
                        style={{
                            borderColor: isDarkMode ? '#555' : '#cbd5e0',
                            color: isDarkMode ? '#e0e0e0' : '#4a5568',
                            backgroundColor: 'transparent'
                        }}
                    >
                        <i className={`icofont-${copied ? 'check' : 'copy'}`}></i>
                    </button>
                    <button
                        className={`btn-action edit-btn ${isEditMode ? 'active' : ''}`}
                        onClick={() => setIsEditMode(!isEditMode)}
                        title={isEditMode ? 'Exit edit mode' : 'Edit code'}
                        style={{
                            borderColor: isDarkMode ? '#555' : '#cbd5e0',
                            color: isDarkMode ? '#e0e0e0' : '#4a5568',
                            backgroundColor: 'transparent'
                        }}
                    >
                        <i className={`icofont-${isEditMode ? 'close' : 'edit'}`}></i>
                    </button>
                    <button
                        className="btn-action run-btn"
                        onClick={runCode}
                        disabled={isRunning}
                        title={isRunning ? 'Running...' : 'Run code'}
                        style={{
                            borderColor: isDarkMode ? '#555' : '#cbd5e0',
                            color: isDarkMode ? '#e0e0e0' : '#4a5568',
                            backgroundColor: 'transparent'
                        }}
                    >
                        {isRunning ? (
                            <span className="spinner-small"></span>
                        ) : (
                            <i className="icofont-play"></i>
                        )}
                    </button>
                    </div>
                </div>
            </div>

            {isEditMode ? (
                <div className="code-block-editor">
                    <textarea
                        className="code-editor-textarea"
                        value={editedCode}
                        onChange={(e) => setEditedCode(e.target.value)}
                        spellCheck="false"
                    />
                    <div className="editor-actions">
                        <button
                            className="btn-reset"
                            onClick={handleResetCode}
                            title="Reset to original code"
                            style={{
                                borderColor: isDarkMode ? '#555' : '#cbd5e0',
                                color: isDarkMode ? '#e0e0e0' : '#4a5568',
                                backgroundColor: 'transparent'
                            }}
                        >
                            <i className="icofont-refresh"></i>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="code-block-content">
                    <pre className={`p-3 rounded language-${language}`} style={{
                        backgroundColor: '#1e1e1e',
                        color: '#e0e0e0',
                        margin: 0
                    }}>
                        <code>{code}</code>
                    </pre>
                </div>
            )}

            {showOutput && (
                <div className="code-output-section" style={{
                    backgroundColor: '#1e1e1e',
                    borderTopColor: isDarkMode ? '#444' : '#e2e8f0'
                }}>
                    <div className="output-header" style={{
                        backgroundColor: '#1e1e1e',
                        borderBottomColor: isDarkMode ? '#444' : '#e2e8f0',
                        padding: '0.5rem 0.75rem'
                    }}>
                        <h6 style={{
                            color: '#e0e0e0',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>Output</h6>
                        <button
                            className="btn-close-output"
                            onClick={() => setShowOutput(false)}
                            title="Close output"
                            style={{
                                color: '#adb5bd'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {error ? (
                        <div className="output-error" style={{
                            backgroundColor: '#1e1e1e',
                            color: '#ff6b6b',
                            padding: '0.75rem'
                        }}>
                            <pre style={{
                                color: '#ff6b6b',
                                margin: 0,
                                backgroundColor: 'transparent'
                            }}>{error}</pre>
                        </div>
                    ) : (
                        <div className="output-success" style={{
                            backgroundColor: '#1e1e1e',
                            color: '#e0e0e0',
                            padding: '0.75rem'
                        }}>
                            <pre style={{
                                color: '#e0e0e0',
                                margin: 0,
                                backgroundColor: 'transparent'
                            }}>{output}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CodeBlockExecutor;
