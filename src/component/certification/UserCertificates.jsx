import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCertifications, getCertificationAttempts, downloadCertificate } from '../../services/api';

/**
 * UserCertificates Component
 * Displays user's certificates and certification history
 * Shows available certifications and past attempts
 * @param {string} collegeSlug - College slug for routing
 */
const UserCertificates = ({ collegeSlug }) => {
  const [certifications, setCertifications] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch available certifications
      const certsResponse = await getCertifications();
      console.log('📡 Full certifications response:', certsResponse);

      const certsData = certsResponse.data.data || certsResponse.data;
      const certsList = Array.isArray(certsData) ? certsData : certsData.results || [];

      console.log('📜 Certifications loaded:', certsList);
      setCertifications(certsList);

      // Fetch attempts for each certification
      const allAttempts = {};
      for (const cert of certsList) {
        try {
          const attemptsResponse = await getCertificationAttempts(cert.id);
          const attemptsData = attemptsResponse.data.data || attemptsResponse.data;
          allAttempts[cert.id] = Array.isArray(attemptsData)
            ? attemptsData
            : attemptsData.results || [];
        } catch (err) {
          console.log(`Could not fetch attempts for cert ${cert.id}`);
          allAttempts[cert.id] = [];
        }
      }
      setAttempts(allAttempts);
    } catch (err) {
      console.error('Error loading certifications:', err);
      setError('Failed to load certifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (attemptId) => {
    try {
      setDownloading(attemptId);
      const response = await downloadCertificate(attemptId);

      // Extract blob from response (axios returns data in response.data)
      let blob = response.data;

      // If it's not a Blob, try to convert it
      if (!(blob instanceof Blob)) {
        console.warn('Response is not a Blob, attempting to convert...');
        blob = new Blob([blob], { type: 'application/pdf' });
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${attemptId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      setError('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '16px', color: '#666', marginBottom: '15px' }}>
          Loading certificates...
        </div>
        <div style={{
          width: '30px',
          height: '30px',
          border: '3px solid #e0e0e0',
          borderTop: '3px solid #2196f3',
          borderRadius: '50%',
          margin: '0 auto',
          animation: 'spin 1s linear infinite'
        }}>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#ffebee',
          border: '1px solid #ef5350',
          borderRadius: '8px',
          color: '#c62828',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {certifications.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: '1px dashed #e0e0e0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📜</div>
          <h3 style={{ color: '#666', margin: '0 0 10px 0' }}>
            No Certifications Yet
          </h3>
          <p style={{ color: '#999', margin: 0 }}>
            Complete courses to unlock certifications
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {certifications.map((cert) => {
            const certAttempts = attempts[cert.id] || [];
            const passedAttempt = certAttempts.find(a => a.passed);
            const allAttempts = certAttempts.length;
            const remainingAttempts = cert.max_attempts - allAttempts;

            return (
              <div
                key={cert.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{
                  padding: '20px',
                  borderLeft: `4px solid ${passedAttempt ? '#28a745' : '#ff9800'}`
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                        {cert.title}
                      </h4>
                      {cert.course_name && (
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          Course: {cert.course_name}
                        </div>
                      )}
                    </div>
                    {passedAttempt && (
                      <div style={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ✅ Passed
                      </div>
                    )}
                  </div>

                  {/* Certification Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                        Duration
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>
                        {cert.duration_minutes} minutes
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                        Passing Score
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>
                        {cert.passing_score}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                        Attempts
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>
                        {allAttempts} / {cert.max_attempts}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                        Questions
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>
                        {cert.total_questions || '?'}
                      </div>
                    </div>
                  </div>

                  {/* Attempt History */}
                  {certAttempts.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>
                        Attempt History
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {certAttempts.map((attempt, idx) => (
                          <div
                            key={attempt.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px',
                              backgroundColor: '#f9f9f9',
                              borderRadius: '6px',
                              border: `1px solid ${attempt.passed ? '#d4edda' : '#f8d7da'}`
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#333' }}>
                                Attempt #{attempt.attempt_number}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {new Date(attempt.completed_at || new Date()).toLocaleDateString()}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <div style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: attempt.passed ? '#28a745' : '#dc3545'
                              }}>
                                {Math.round(attempt.score)}%
                              </div>
                              {attempt.passed && attempt.certificate_issued && (
                                <button
                                  onClick={() => handleDownloadCertificate(attempt.id)}
                                  disabled={downloading === attempt.id}
                                  style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: downloading === attempt.id ? 'not-allowed' : 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    opacity: downloading === attempt.id ? 0.6 : 1,
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {downloading === attempt.id ? '⏳' : '📥'} Download
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    {!passedAttempt && remainingAttempts > 0 && (
                      <Link
                        to={collegeSlug ? `/${collegeSlug}/certification/${cert.id}` : `/certification/${cert.id}`}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: 'none',
                          display: 'inline-block'
                        }}
                      >
                        {allAttempts > 0 ? '🔄 Retry' : '📝 Start Exam'}
                      </Link>
                    )}
                    {remainingAttempts === 0 && !passedAttempt && (
                      <div style={{
                        padding: '10px 20px',
                        backgroundColor: '#f0f0f0',
                        color: '#999',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        ❌ No Attempts Remaining
                      </div>
                    )}
                    {passedAttempt && (
                      <div style={{
                        padding: '10px 20px',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        ✅ Certification Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserCertificates;
