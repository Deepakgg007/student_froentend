// Solve Company Challenge Page
// Code editor interface for solving company concept challenges

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
import '../challenge/solve-challenge.css';
import api from '../../services/api';
import { getCompanyBySlug, getConceptById } from '../../services/api';

// Configure Ace Editor
ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.23.4/src-noconflict/');
ace.config.set('modePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.23.4/src-noconflict/');
ace.config.set('themePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.23.4/src-noconflict/');
ace.config.set('workerPath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.23.4/src-noconflict/');

const SolveCompanyChallenge = () => {
  const { companySlug, conceptSlug, challengeSlug } = useParams();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState(null);
  const [concept, setConcept] = useState(null);
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
    fetchChallengeData();
  }, [companySlug, conceptSlug, challengeSlug]);

  useEffect(() => {
    if (starterCodes[language]) {
      setCode(starterCodes[language]);
    }
  }, [language, starterCodes]);

  const fetchChallengeData = async () => {
    try {
      setLoading(true);

      const companyResponse = await getCompanyBySlug(companySlug);
      setCompany(companyResponse.data);

      const conceptResponse = await getConceptById(conceptSlug);
      setConcept(conceptResponse.data);

      const challengeResponse = await api.get(`/challenges/${challengeSlug}/`);
      const challengeData = challengeResponse.data.data || challengeResponse.data;
      setChallenge(challengeData);

      const codes = {};
      challengeData.starter_codes?.forEach((sc) => {
        codes[sc.language] = sc.code || '';
      });
      setStarterCodes(codes);

      // Try to load last submission code for this challenge
      try {
        const lastCodeResponse = await api.get(
          `/student/submissions/last-code/${challengeSlug}/`,
          {
            params: {
              language: language,
              company_id: companyResponse.data.id,
              concept_id: conceptResponse.data.id,
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
        // If fetching last code fails, fallback to starter code
        console.log('No previous submission found, using starter code');
        if (codes[language]) {
          setCode(codes[language]);
        }
      }

    } catch (error) {
      console.error('Error fetching challenge data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load challenge data',
      });
      navigate(`/companies/${companySlug}/concepts/${conceptSlug}`);
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
        challenge_slug: challengeSlug,
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
          challenge_slug: challengeSlug,
          code: code,
          language: language,
          company_id: company?.id,
          company_name: company?.name || '',
          concept_id: concept?.id,
          concept_name: concept?.name || '',
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
            navigate(`/companies/${companySlug}/concepts/${conceptSlug}`);
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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      EASY: 'success',
      MEDIUM: 'warning',
      HARD: 'danger',
      BEGINNER: 'success',
      INTERMEDIATE: 'warning',
      ADVANCED: 'danger',
      EXPERT: 'danger',
    };
    return colors[difficulty] || 'secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!challenge || !concept || !company) {
    return (
      <div className="text-center py-5">
        <h3>Challenge not found</h3>
        <Link to={`/companies/${companySlug}/concepts/${conceptSlug}`} className="btn btn-primary mt-3">
          Back to Concept
        </Link>
      </div>
    );
  }

  return (
    <div className={`solve-challenge ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Top Navigation */}
      <div className="top-nav">
        <div className="nav-left">
          <Link to={`/companies/${companySlug}/concepts/${conceptSlug}`} className="back-btn">
            <i className="fas fa-arrow-left me-2"></i>Back to Concept
          </Link>
          <div className="challenge-info">
            <h4 className="mb-0 fw-bold">{challenge.title}</h4>
            <Badge bg="info" className="ms-2">{company.name}</Badge>
            <Badge bg="secondary" className="ms-2">{concept.name}</Badge>
            <Badge bg={getDifficultyColor(challenge.difficulty)} className="ms-2">
              {challenge.difficulty}
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

      {/* Main Container */}
      <div className="solve-container">
        {/* Problem Panel */}
        <div className="problem-panel">
          <div className="problem-content-area">
            {/* Problem Statement */}
            <div className="problem-section">
              <h3>Problem Statement</h3>
              <div className="problem-content">{challenge.description}</div>
            </div>

            {/* Input/Output Format */}
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

            {/* Constraints */}
            {challenge.constraints && (
              <div className="problem-section">
                <h3>Constraints</h3>
                <div className="problem-content">{challenge.constraints}</div>
              </div>
            )}

            {/* Sample Input/Output */}
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

            {/* Explanation */}
            {challenge.explanation && (
              <div className="problem-section">
                <h3>Explanation</h3>
                <div className="problem-content">{challenge.explanation}</div>
              </div>
            )}
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="code-editor-panel">
          {/* Editor Header */}
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

          {/* Editor Main */}
          <div className="editor-main">
            {/* Code Editor */}
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

            {/* Results Panel (Non-Fullscreen Only) */}
            {!isFullscreen && (
              <>
                {/* Results Tabs */}
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

                  {/* Tab Content */}
                  <div className="tab-content-wrapper">
                    {/* Run Results Tab */}
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
                                /* Multiple Test Cases */
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

                                      <div className="test-case-io">
                                        {!runResults.results[selectedTestCase].hidden ? (
                                          <>
                                            <div className="test-io-section">
                                              <strong>Input:</strong>
                                              <pre>{runResults.results[selectedTestCase].input_data}</pre>
                                            </div>
                                            <div className="test-io-section">
                                              <strong>Expected Output:</strong>
                                              <pre>{runResults.results[selectedTestCase].expected_output}</pre>
                                            </div>
                                            <div className="test-io-section">
                                              <strong>Your Output:</strong>
                                              <pre className={runResults.results[selectedTestCase].is_correct ? 'text-success' : 'text-danger'}>
                                                {runResults.results[selectedTestCase].user_output}
                                              </pre>
                                            </div>
                                          </>
                                        ) : (
                                          <div className="alert alert-info">
                                            <i className="fas fa-lock me-2"></i>
                                            This is a hidden test case. Only pass/fail status is shown.
                                          </div>
                                        )}
                                        {runResults.results[selectedTestCase].error && (
                                          <div className="alert alert-danger mt-2">
                                            <strong>Error:</strong>
                                            <pre className="mb-0">{runResults.results[selectedTestCase].error}</pre>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* Single Result */
                                <div>
                                  <div className={`alert alert-${runResults.status === 'SUCCESS' ? 'success' : 'danger'}`}>
                                    <strong>Status:</strong> {runResults.status}
                                  </div>
                                  {runResults.output && (
                                    <div>
                                      <strong>Output:</strong>
                                      <pre className="output-box">{runResults.output}</pre>
                                    </div>
                                  )}
                                  {runResults.error && (
                                    <div>
                                      <strong>Error:</strong>
                                      <pre className="error-box">{runResults.error}</pre>
                                    </div>
                                  )}
                                </div>
                              )
                            ) : (
                              <div className="alert alert-danger">
                                {runResults.message || 'An error occurred while running your code'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-5 text-muted">
                            <i className="fas fa-play-circle fa-3x mb-3"></i>
                            <p>Click "Run Code" to test your solution</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submission Results Tab */}
                    {activeTab === 'submission-results' && (
                      <div className="tab-content active">
                        {submitting ? (
                          <div className="text-center py-4">
                            <div className="spinner-border text-success mb-3" role="status"></div>
                            <p className="text-muted">Submitting your solution...</p>
                          </div>
                        ) : submissionResults ? (
                          <div className="p-3">
                            {submissionResults.success ? (
                              <div>
                                <div className={`alert alert-${submissionResults.status === 'ACCEPTED' ? 'success' : 'warning'}`}>
                                  <h5 className="mb-2">{submissionResults.status}</h5>
                                  <p className="mb-1"><strong>Score:</strong> {submissionResults.score}/{challenge.max_score}</p>
                                  <p className="mb-0"><strong>Test Cases Passed:</strong> {submissionResults.passed_tests}/{submissionResults.total_tests}</p>
                                </div>

                                {submissionResults.results && submissionResults.results.length > 0 && (
                                  <div className="test-results-list">
                                    <h6 className="mb-3">Detailed Results:</h6>
                                    {submissionResults.results.map((result, idx) => (
                                      <div key={idx} className={`test-result-item ${result.is_correct ? 'passed' : 'failed'}`}>
                                        <div className="result-header">
                                          <span>Test Case {idx + 1}</span>
                                          <Badge bg={result.is_correct ? 'success' : 'danger'}>
                                            {result.is_correct ? '✓ Passed' : '✗ Failed'}
                                          </Badge>
                                        </div>
                                        {!result.hidden && result.is_sample && (
                                          <div className="result-details">
                                            <div><strong>Input:</strong> <code>{result.input_data}</code></div>
                                            <div><strong>Expected:</strong> <code>{result.expected_output}</code></div>
                                            <div><strong>Got:</strong> <code className={result.is_correct ? 'text-success' : 'text-danger'}>{result.user_output}</code></div>
                                          </div>
                                        )}
                                        {result.hidden && (
                                          <div className="result-details">
                                            <small className="text-muted">
                                              <i className="fas fa-lock me-1"></i>
                                              Hidden test case
                                            </small>
                                          </div>
                                        )}
                                        {result.error && (
                                          <div className="alert alert-danger mt-2 mb-0">
                                            <small><strong>Error:</strong> {result.error}</small>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="alert alert-danger">
                                {submissionResults.message || 'Submission failed'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-5 text-muted">
                            <i className="fas fa-upload fa-3x mb-3"></i>
                            <p>Click "Submit" to evaluate your solution</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="action-bar">
                  <div className="custom-input-section">
                    <label className="form-label text-muted">Custom Input (optional):</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter custom test input..."
                    />
                  </div>
                  <div className="action-buttons">
                    <button className="btn-run" onClick={handleRunCode} disabled={running}>
                      {running ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Running...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play me-2"></i>
                          Run Code
                        </>
                      )}
                    </button>
                    <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-2"></i>
                          Submit
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolveCompanyChallenge;