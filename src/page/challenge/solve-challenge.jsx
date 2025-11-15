import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import AceEditor from 'react-ace';
import Swal from 'sweetalert2';
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/ext-language_tools';
import './solve-challenge.css';
import api from '../../services/api';

// Configure Ace Editor
ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.23.4/src-noconflict/');
ace.config.set('modePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.23.4/src-noconflict/');
ace.config.set('themePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.23.4/src-noconflict/');
ace.config.set('workerPath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.23.4/src-noconflict/');

const SolveChallenge = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [theme, setTheme] = useState('monokai');
  const [activeTab, setActiveTab] = useState('run-results');
  const [runResults, setRunResults] = useState(null);
  const [submissionResults, setSubmissionResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [starterCodes, setStarterCodes] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const languageModes = {
    python: 'python',
    java: 'java',
    c_cpp: 'c_cpp',
    c: 'c_cpp',
    javascript: 'javascript',
  };

  useEffect(() => {
    fetchChallenge();
  }, [slug]);

  useEffect(() => {
    if (starterCodes[language]) {
      setCode(starterCodes[language]);
    }
  }, [language, starterCodes]);

  const fetchChallenge = async () => {
    try {
      const response = await api.get(`/challenges/${slug}/`);
      const challengeData = response.data.data || response.data;
      setChallenge(challengeData);

      const codes = {};
      challengeData.starter_codes?.forEach((sc) => {
        codes[sc.language] = sc.code || '';
      });
      setStarterCodes(codes);

      // Try to load last submission code for this challenge
      try {
        const lastCodeResponse = await api.get(
          `/student/submissions/last-code/${slug}/`,
          {
            params: {
              language: language,
            }
          }
        );

        if (lastCodeResponse.data.success && lastCodeResponse.data.has_code) {
          // User has previous code - load it
          setCode(lastCodeResponse.data.code);
        } else if (codes[language]) {
          // No previous code - use starter code
          setCode(codes[language]);
        }
      } catch (error) {
        if (codes[language]) {
          setCode(codes[language]);
        }
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
      Swal.fire('Error', 'Failed to load challenge', 'error');
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      Swal.fire('Error', 'Please write some code before running', 'error');
      return;
    }

    setRunning(true);
    setActiveTab('run-results');
    setRunResults(null);

    try {
      const response = await api.post('/student/submissions/run/', {
        code: code,
        language: language,
        input: customInput,
        challenge_slug: slug,
      });

      const data = response.data;

      if (data.success) {
        if (data.results) {
          setSelectedTestCase(0);
          setRunResults({
            success: true,
            results: data.results,
            hasMultiple: true,
          });
        } else {
          setRunResults({
            success: true,
            status: data.status,
            output: data.output,
            error: data.error,
            runtime: data.runtime,
            memory: data.memory,
            hasMultiple: false,
          });
        }
      }
    } catch (error) {
      setRunResults({
        success: false,
        message: error.response?.data?.error || 'Failed to run code',
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      Swal.fire('Error', 'Please write some code before submitting', 'error');
      return;
    }

    // Simple confirmation - just ask if user wants to save
    const result = await Swal.fire({
      title: 'Save Your Code?',
      text: 'Are you sure you want to save this code?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#11998e',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Save',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      setSubmitting(true);

      try {
        const response = await api.post('/student/submissions/submit/', {
          challenge_slug: slug,
          code: code,
          language: language,
        });

        const data = response.data;

        if (data.success) {
          // Simple success message - no details
          await Swal.fire({
            icon: 'success',
            title: 'Code Saved Successfully!',
            text: 'Your solution has been saved.',
            confirmButtonColor: '#11998e',
            timer: 2000,
            showConfirmButton: false,
          });

          // Auto redirect to challenges list after 2 seconds
          setTimeout(() => {
            navigate('/challenges');
          }, 2000);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: error.response?.data?.error || 'Failed to save code. Please try again.',
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    if (starterCodes[language]) {
      setCode(starterCodes[language]);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleThemeMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-5">
        <h3>Challenge not found</h3>
        <Link to="/challenges" className="btn btn-primary mt-3">
          Back to Challenges
        </Link>
      </div>
    );
  }

  const difficultyColors = {
    EASY: 'success',
    MEDIUM: 'warning',
    HARD: 'danger',
  };

  return (
    <div className={`solve-challenge ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="top-nav">
        <div className="nav-left">
          <Link to="/challenges" className="back-btn">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Link>
          <div className="challenge-info">
            <h4 className="mb-0 fw-bold">{challenge.title}</h4>
            <Badge bg={difficultyColors[challenge.difficulty]} className="ms-2">
              {challenge.difficulty}
            </Badge>
            <Badge bg="primary" className="ms-2">
              {challenge.category}
            </Badge>
          </div>
        </div>
        <div className="nav-right">
          <button className="theme-toggle-btn" onClick={toggleThemeMode}>
            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
            <span className="ms-2">{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
          <Badge bg="info" className="ms-3">{challenge.max_score} points</Badge>
        </div>
      </div>

      <div className="solve-container">
        <div className="problem-panel">
          <div className="problem-content-area">
            <div className="problem-section">
              <h3>Problem Statement</h3>
              <div className="problem-content">{challenge.description}</div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="problem-section">
                  <h3>Input Format</h3>
                  <div className="problem-content">{challenge.input_format}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="problem-section">
                  <h3>Output Format</h3>
                  <div className="problem-content">{challenge.output_format}</div>
                </div>
              </div>
            </div>

            {challenge.constraints && (
              <div className="problem-section">
                <h3>Constraints</h3>
                <div className="problem-content">{challenge.constraints}</div>
              </div>
            )}

            <div className="row">
              <div className="col-md-6">
                <div className="problem-section">
                  <h3>Sample Input</h3>
                  <div className="sample-box">{challenge.sample_input}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="problem-section">
                  <h3>Sample Output</h3>
                  <div className="sample-box">{challenge.sample_output}</div>
                </div>
              </div>
            </div>

            {challenge.explanation && (
              <div className="problem-section">
                <h3>Explanation</h3>
                <div className="problem-content">{challenge.explanation}</div>
              </div>
            )}
          </div>
        </div>

        <div className="code-editor-panel">
          <div className="editor-header">
            <div className="editor-controls">
              <select className="editor-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c_cpp">C++</option>
                <option value="c">C</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <div className="editor-controls">
              <select className="editor-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="monokai">Monokai</option>
                <option value="github">Light</option>
                <option value="solarized_dark">Solarized Dark</option>
                <option value="tomorrow_night">Tomorrow Night</option>
              </select>
              <button className="editor-btn" onClick={handleReset}>
                <i className="fas fa-undo me-1"></i>Reset
              </button>
              <button className="editor-btn" onClick={toggleFullscreen}>
                <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'} me-1`}></i>
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </button>
            </div>
          </div>

          <div className="editor-main">
            <div className={`code-editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
              <AceEditor
                mode={languageModes[language]}
                theme={theme}
                value={code}
                onChange={setCode}
                name="code-editor"
                width="100%"
                height="100%"
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 4,
                }}
              />
            </div>

            {!isFullscreen && (
              <>
                <div className="results-panel">
                  <div className="tab-nav">
                    <button
                      className={`tab-nav-item ${activeTab === 'run-results' ? 'active' : ''}`}
                      onClick={() => setActiveTab('run-results')}
                    >
                      <i className="fas fa-play me-2"></i>Run Results
                    </button>
                    <button
                      className={`tab-nav-item ${activeTab === 'submission-results' ? 'active' : ''}`}
                      onClick={() => setActiveTab('submission-results')}
                    >
                      <i className="fas fa-check-circle me-2"></i>Submission
                    </button>
                  </div>

                  <div className="tab-content-wrapper">
                    {activeTab === 'run-results' && (
                      <div className="tab-content active">
                        {running ? (
                          <div className="text-center py-4">
                            <div className="spinner-border text-primary mb-3" role="status"></div>
                            <p className="text-muted">Executing your code...</p>
                          </div>
                        ) : runResults ? (
                          <div className="p-3">
                            {runResults.success ? (
                              runResults.hasMultiple ? (
                                <div className="test-cases-container">
                                  <div className="test-case-tabs">
                                    {runResults.results.map((result, idx) => (
                                      <button
                                        key={idx}
                                        className={`test-case-tab ${selectedTestCase === idx ? 'active' : ''} ${result.is_correct ? 'passed' : 'failed'}`}
                                        onClick={() => setSelectedTestCase(idx)}
                                      >
                                        <div className="test-tab-content">
                                          <span className="test-tab-label">Test {idx + 1}</span>
                                          <i className={`fas ${result.is_correct ? 'fa-check-circle' : 'fa-times-circle'} test-tab-icon`}></i>
                                        </div>
                                      </button>
                                    ))}
                                  </div>

                                  {runResults.results[selectedTestCase] && (
                                    <div className="test-case-details">
                                      <div className="test-case-header-info">
                                        <h6 className="test-case-title">Test Case {selectedTestCase + 1}</h6>
                                        <Badge bg={runResults.results[selectedTestCase].is_correct ? 'success' : 'danger'}>
                                          {runResults.results[selectedTestCase].is_correct ? 'Passed ✓' : 'Failed ✗'}
                                        </Badge>
                                      </div>

                                      {!runResults.results[selectedTestCase].hidden ? (
                                        <div className="test-case-content">
                                          <div className="test-detail-box">
                                            <label className="test-label">Input:</label>
                                            <div className="test-value">{runResults.results[selectedTestCase].input}</div>
                                          </div>
                                          <div className="test-detail-box">
                                            <label className="test-label">Expected:</label>
                                            <div className="test-value">{runResults.results[selectedTestCase].expected}</div>
                                          </div>
                                          <div className="test-detail-box">
                                            <label className="test-label">Your Output:</label>
                                            <div className="test-value">{runResults.results[selectedTestCase].output}</div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="hidden-test-info">
                                          <i className="fas fa-lock fa-2x mb-3"></i>
                                          <p>This test case is hidden</p>
                                        </div>
                                      )}

                                      <div className="test-metrics">
                                        <div className="metric-item">
                                          <i className="fas fa-clock"></i>
                                          <span>Runtime: {runResults.results[selectedTestCase].runtime.toFixed(2)}ms</span>
                                        </div>
                                        <div className="metric-item">
                                          <i className="fas fa-memory"></i>
                                          <span>Memory: {runResults.results[selectedTestCase].memory.toFixed(2)}KB</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <Badge bg={runResults.status === 'OK' ? 'success' : 'danger'} className="mb-3">
                                    {runResults.status}
                                  </Badge>
                                  <div className="terminal-output">
                                    <strong>Output:</strong>
                                    <pre className="mt-2">{runResults.output}</pre>
                                  </div>
                                </div>
                              )
                            ) : (
                              <div className="terminal-output text-danger">{runResults.message}</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <i className="fas fa-play fa-2x mb-3 text-white"></i>
                            <p className="text-white">Run your code to see results</p>
                            <div className="mt-3 px-3">
                              <label className="form-label text-white">Custom Input (Optional):</label>
                              <textarea
                                className="form-control"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="Enter custom input..."
                                rows={4}
                                style={{ fontFamily: 'monospace', fontSize: '13px' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'submission-results' && (
                      <div className="tab-content active">
                        {submitting ? (
                          <div className="text-center py-4">
                            <div className="spinner-border text-success mb-3" role="status"></div>
                            <p className="text-muted">Evaluating your code...</p>
                          </div>
                        ) : submissionResults ? (
                          <div className="p-3">
                            <Badge bg={submissionResults.status === 'ACCEPTED' ? 'success' : 'danger'} className="mb-3">
                              {submissionResults.status}
                            </Badge>
                            <div className="terminal-output">
                              <strong>Score:</strong> {submissionResults.score}/{challenge.max_score}<br />
                              <strong>Tests Passed:</strong> {submissionResults.passed_tests}/{submissionResults.total_tests}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <i className="fas fa-upload fa-2x mb-3"></i>
                            <p>Submit your code to see results</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="action-bar">
                  <button className="btn-run" onClick={handleRunCode} disabled={running}>
                    <i className="fas fa-play me-2"></i>
                    {running ? 'Running...' : 'Run Code'}
                  </button>
                  <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
                    <i className="fas fa-paper-plane me-2"></i>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolveChallenge;
