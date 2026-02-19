import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCertifications, getCertificationAttempts, getCertificationById, getCertificationAttemptById, getCurrentUserProfile, API_BASE_URL } from '../../services/api';
import { downloadCertificateAsPDF } from './CertificateDownloadHelper';
import { useSmoothData } from '../../hooks/useSmoothData';

/**
 * UserCertificates Component
 * Displays user's certificates and certification history
 * Shows available certifications and past attempts
 * @param {string} collegeSlug - College slug for routing
 */
const UserCertificates = ({ collegeSlug }) => {
  const [certifications, setCertifications] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);
  const certificateRefs = useRef({});

  // Fetch certifications with smooth transition
  const { data: fetchedData, loading } = useSmoothData(
    async () => {
      const certsResponse = await getCertifications();
      const certsData = certsResponse.data.data || certsResponse.data;
      const certsList = Array.isArray(certsData) ? certsData : certsData.results || [];

      const allAttempts = {};
      for (const cert of certsList) {
        try {
          const attemptsResponse = await getCertificationAttempts(cert.id);
          const attemptsData = attemptsResponse.data.data || attemptsResponse.data;
          allAttempts[cert.id] = Array.isArray(attemptsData)
            ? attemptsData
            : attemptsData.results || [];
        } catch (err) {
          allAttempts[cert.id] = [];
        }
      }

      return { data: { certifications: certsList, attempts: allAttempts } };
    },
    []
  );

  useEffect(() => {
    if (fetchedData) {
      setCertifications(fetchedData.certifications);
      setAttempts(fetchedData.attempts);
    }
  }, [fetchedData]);

  const handleDownloadCertificate = async (attemptId, certificationId) => {
    try {
      setDownloading(attemptId);

      let cert = certifications.find(c => c.id === certificationId);
      if (!cert) {
        throw new Error('Certification not found');
      }

      try {
        const fullCertResponse = await getCertificationById(certificationId);
        const fullCertData = fullCertResponse.data.data || fullCertResponse.data;
        cert = fullCertData;
      } catch (err) {
      }

      let attempt = attempts[certificationId]?.find(a => a.id === attemptId);
      if (!attempt) {
        throw new Error('Attempt not found');
      }

      // Fetch full attempt details to ensure college info is included
      try {
        const attemptResponse = await getCertificationAttemptById(certificationId, attemptId);
        const fullAttempt = attemptResponse.data.data || attemptResponse.data;
        if (fullAttempt) {
          attempt = fullAttempt;
        }
      } catch (err) {
      }

      const studentName = localStorage?.getItem('student_name') || attempt?.student_name || 'Student';

      // PRIORITY 1: Extract college from attempt object (should have full college details)
      let collegeInfo = {};

      // Check all possible paths where college data might be in the attempt
      if (attempt?.college) {
        collegeInfo = attempt.college;
      } else if (attempt?.certification?.college) {
        collegeInfo = attempt.certification.college;
      } else if (attempt?.certification?.course?.college) {
        collegeInfo = attempt.certification.course.college;
      }

      // PRIORITY 2: Extract college from certification object
      if ((!collegeInfo || Object.keys(collegeInfo).length === 0) && cert?.college) {
        collegeInfo = cert.college;
      } else if ((!collegeInfo || Object.keys(collegeInfo).length === 0) && cert?.course?.college) {
        collegeInfo = cert.course.college;
      }

      // PRIORITY 3: Fall back to alternative fields
      if (!collegeInfo || Object.keys(collegeInfo).length === 0) {
        collegeInfo = cert?.college_data || cert?.institution || attempt?.college_data || attempt?.institution || {};
      }

      // PRIORITY 4: Fetch from user profile (student's registered college)
      if (!collegeInfo || Object.keys(collegeInfo).length === 0) {
        try {
          const profileResponse = await getCurrentUserProfile();
          const profileData = profileResponse.data.data || profileResponse.data;
          if (profileData?.college_details) {
            collegeInfo = profileData.college_details;
          } else if (profileData?.college) {
            collegeInfo = profileData.college;
          }
        } catch (err) {
        }
      }



      const collegeName = collegeInfo?.name || cert?.college_name || attempt?.college_name || 'Z1 Education';

      // Extract college logo - check all possible field names
      let collegeLogo = collegeInfo?.logo || collegeInfo?.college_logo || null;

      // Ensure it's a full URL
      if (collegeLogo && !collegeLogo.startsWith('http')) {
        collegeLogo = `${API_BASE_URL}${collegeLogo}`;
      }
      if (collegeLogo && collegeLogo.startsWith('http:')) {
        collegeLogo = collegeLogo.replace('http:', 'https:');
      }

      // Extract college signature - check all possible field names
      // From student_user it comes as 'college_signature'
      // From API it comes as 'signature_display'
      let collegeSignature = collegeInfo?.signature_display || collegeInfo?.college_signature || collegeInfo?.signature || null;
      if (collegeSignature && !collegeSignature.startsWith('http')) {
        collegeSignature = `${API_BASE_URL}${collegeSignature}`;
      }
      if (collegeSignature && collegeSignature.startsWith('http:')) {
        collegeSignature = collegeSignature.replace('http:', 'https:');
      }

      // Convert images to base64 using backend proxy to avoid CORS issues
      const convertImageToBase64 = async (imageUrl) => {
        if (!imageUrl) {
          return null;
        }

        try {
          // Use backend proxy endpoint to convert image to base64
          const proxyUrl = `${API_BASE_URL}/api/utils/image-to-base64/?url=${encodeURIComponent(imageUrl)}`;
          const response = await fetch(proxyUrl);

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          if (data.success && data.base64) {
            return data.base64;
          } else {
            return null;
          }
        } catch (err) {
          return null;
        }
      };

      // Convert both images to base64
      const [collegeLogoBase64, collegeSignatureBase64] = await Promise.all([
        collegeLogo ? convertImageToBase64(collegeLogo) : Promise.resolve(null),
        collegeSignature ? convertImageToBase64(collegeSignature) : Promise.resolve(null)
      ]);

      // Use base64 images if conversion successful, otherwise use original URLs
      collegeLogo = collegeLogoBase64 || collegeLogo;
      collegeSignature = collegeSignatureBase64 || collegeSignature;


      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '1600px';
      tempContainer.style.height = '1100px';
      tempContainer.style.zIndex = '-1';
      tempContainer.style.pointerEvents = 'none';
      tempContainer.style.visibility = 'visible';

      const tempRef = { current: null };

      // TRADITIONAL ORNATE DESIGN - with gold borders and decorative elements
      const certificateHTML = `
        <div style="width: 100%; height: 100%; background: #e8e8e8; padding: 10px; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
          <div style="width: 1400px; height: 950px; background: #f5f1e8; border: 15px solid #d4af37; position: relative; padding: 50px 60px; display: flex; flex-direction: column; justify-content: space-between;">
            <!-- Decorative border frame -->
            <div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 2px solid #8b7355; pointer-events: none;"></div>
            <div style="position: absolute; top: 22px; left: 22px; width: 20px; height: 20px; border-top: 2px solid #8b7355; border-left: 2px solid #8b7355;"></div>
            <div style="position: absolute; top: 22px; right: 22px; width: 20px; height: 20px; border-top: 2px solid #8b7355; border-right: 2px solid #8b7355;"></div>
            <div style="position: absolute; bottom: 22px; left: 22px; width: 20px; height: 20px; border-bottom: 2px solid #8b7355; border-left: 2px solid #8b7355;"></div>
            <div style="position: absolute; bottom: 22px; right: 22px; width: 20px; height: 20px; border-bottom: 2px solid #8b7355; border-right: 2px solid #8b7355;"></div>

            <!-- Content -->
            <div style="position: relative; z-index: 1;">
              <!-- Header with Z1 and College Logos -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                <!-- Z1 Logo (Left) -->
                <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: flex-start;">
                  <img src="/z1logo.png" alt="Z1 Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                </div>

                <!-- Spacer -->
                <div style="flex: 1;"></div>

                <!-- College Logo (Right Top) -->
                <div style="width: 120px; height: 120px; display: flex; align-items: flex-start; justify-content: flex-end;">
                  ${collegeLogo ? `<img src="${collegeLogo}" alt="${collegeName} Logo" style="max-width: 120px; max-height: 120px; object-fit: contain;" />` : ''}
                </div>
              </div>

              <!-- Main Title -->
              <h1 style="font-family: 'Cinzel', serif; font-size: 52px; font-weight: 700; letter-spacing: 2px; color: #2c1810; text-align: center; margin: 0 0 10px 0; line-height: 1.2;">Certificate of Appreciation</h1>

              <!-- Subtitle -->
              <p style="font-size: 16px; font-style: italic; color: #555; letter-spacing: 1px; font-weight: 400; text-align: center; margin: 10px 0;">This Certificate is Proudly Presented to</p>

              <!-- Student Name -->
              <div style="text-align: center; margin: 20px 0 5px 0;">
                <h2 style="font-family: 'Tangerine', cursive; font-size: 80px; font-weight: 700; color: #2c1810; letter-spacing: 2px; margin: 0; padding: 10px 0; border-top: 2px solid #8b7355; border-bottom: 2px solid #8b7355; display: inline-block;">${studentName}</h2>
              </div>

              <!-- Achievement Text -->
              <p style="font-size: 18px; color: #2c1810; letter-spacing: 1px; font-weight: 600; text-transform: uppercase; text-align: center; margin: 15px 0;">For Successfully Completing the Course</p>

              <!-- Course Name -->
              <h3 style="font-family: 'Cinzel', serif; font-size: 28px; font-weight: 700; color: #8b7355; letter-spacing: 1px; text-transform: uppercase; text-align: center; margin: 15px 0;">${cert.title || 'Certification'}</h3>

              <!-- College Name Display -->
              <p style="font-size: 14px; color: #666; letter-spacing: 0.5px; text-align: center; margin: 10px 0; font-style: italic;">From ${collegeName}</p>
              <div style="text-align: center; margin: 20px 0;">
                <div style="width: 60%; margin: 0 auto; height: 1px; background: #8b7355;"></div>
              </div>

              <!-- Details Section -->
              <div style="text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; color: #555; font-weight: 400, letter-spacing: 0.5px;">Presented this ${attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #888; letter-spacing: 1px; font-weight: 500;">Certificate No: <span style="font-family: 'Courier New', monospace; color: #2c1810; font-weight: 600; letter-spacing: 2px;">CERT-${attemptId}</span></p>
              </div>
            </div>

            <!-- Signatures -->
            <div style="position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #8b7355;">
              <!-- Left Signature - Z1 Admin -->
              <div style="text-align: center;">
                <div style="width: 100%; height: 50px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 8px; overflow: hidden;">
                  <img src="/z1-sign.png" alt="Z1 Signature" style="max-width: 100%; max-height: 50px; object-fit: contain;" />
                </div>
                <div style="width: 150px; height: 2px; background: #2c1810; margin: 0 auto 5px;"></div>
                <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: #2c1810; letter-spacing: 1px;">Z1 Administrator</p>
                <p style="margin: 2px 0 0 0; font-size: 11px; color: #666;">Authorized by Z1</p>
              </div>
              <!-- Right Signature - College Principal -->
              <div style="text-align: center;">
                <div style="width: 100%; height: 50px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 8px; overflow: hidden;">
                  ${collegeSignature ? `<img src="${collegeSignature}" alt="${collegeName} Signature" style="max-width: 100%; max-height: 50px; object-fit: contain;" />` : '<div style="height: 2px; width: 100%;"></div>'}
                </div>
                <div style="width: 150px; height: 2px; background: #2c1810; margin: 0 auto 5px;"></div>
                <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: #2c1810; letter-spacing: 1px;">${collegeName}</p>
                <p style="margin: 2px 0 0 0; font-size: 11px; color: #666;">Principal / Director</p>
              </div>
            </div>
          </div>
        </div>
      `;

      tempContainer.innerHTML = certificateHTML;
      // Get the certificate wrapper div (the one with gold border and ornate design)
      tempRef.current = tempContainer.querySelector('div[style*="border: 15px solid"]');

      document.body.appendChild(tempContainer);

      // Wait for all images to load (with allowTaint=true in html2canvas, images will render even without CORS)
      const images = tempContainer.querySelectorAll('img');
      const imageLoadPromises = Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn('Image failed to load:', img.src);
              resolve(); // Continue even if image fails
            };
            // Timeout after 10 seconds
            setTimeout(() => resolve(), 10000);
          }
        });
      });

      await Promise.all(imageLoadPromises);
      // Extra wait to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 1500));

      try {
        await downloadCertificateAsPDF(tempRef, cert.title || 'Certificate');
      } finally {
        document.body.removeChild(tempContainer);
      }
    } catch (err) {
      console.error('Error downloading certificate:', err);
      setError('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Skeleton card 1 */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div className="skeleton-line" style={{ width: '60%', height: '24px' }}></div>
              <div className="skeleton-line" style={{ width: '80px', height: '28px', borderRadius: '20px' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
              <div className="skeleton-line" style={{ width: '100px', height: '16px' }}></div>
              <div className="skeleton-line" style={{ width: '100px', height: '16px' }}></div>
              <div className="skeleton-line" style={{ width: '100px', height: '16px' }}></div>
            </div>
            <div className="skeleton-line" style={{ width: '100%', height: '80px', borderRadius: '8px' }}></div>
          </div>
        </div>
        {/* Skeleton card 2 */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div className="skeleton-line" style={{ width: '50%', height: '24px' }}></div>
              <div className="skeleton-line" style={{ width: '80px', height: '28px', borderRadius: '20px' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
              <div className="skeleton-line" style={{ width: '100px', height: '16px' }}></div>
              <div className="skeleton-line" style={{ width: '100px', height: '16px' }}></div>
              <div className="skeleton-line" style={{ width: '100px', height: '16px' }}></div>
            </div>
            <div className="skeleton-line" style={{ width: '100%', height: '80px', borderRadius: '8px' }}></div>
          </div>
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
        <div
          style={{
            display: 'grid',
            gap: '20px',
            opacity: certifications.length ? 1 : 0,
            transition: 'opacity 0.4s ease-out',
          }}
        >
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.1rem', fontWeight: '700' }}>
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
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <i className="fas fa-check-circle"></i>
                        Passed
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fas fa-redo" style={{ color: '#667eea', fontSize: '12px' }}></i>
                      <span style={{ color: '#666' }}>Attempts: </span>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>{allAttempts}/{cert.max_attempts}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fas fa-percentage" style={{ color: '#667eea', fontSize: '12px' }}></i>
                      <span style={{ color: '#666' }}>Passing: </span>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>{cert.passing_score || 80}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fas fa-flag-checkered" style={{ color: '#667eea', fontSize: '12px' }}></i>
                      <span style={{ color: '#666' }}>Status: </span>
                      <span style={{ fontWeight: 'bold', color: passedAttempt ? '#28a745' : '#ff9800' }}>
                        {passedAttempt ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>

                  {certAttempts.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-history" style={{ color: '#667eea' }}></i>
                        Attempts History
                      </div>
                      {/* Grid layout - 5 attempts per row */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '12px'
                      }}>
                        {certAttempts.map((attempt, index) => (
                          <div
                            key={attempt.id}
                            style={{
                              padding: '16px',
                              backgroundColor: attempt.passed ? '#f0fdf4' : '#ffffff',
                              borderRadius: '12px',
                              border: `1px solid ${attempt.passed ? '#bbf7d0' : '#e9ecef'}`,
                              boxShadow: attempt.passed ? '0 2px 8px rgba(22, 163, 74, 0.1)' : '0 2px 4px rgba(0,0,0,0.06)',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = attempt.passed ? '0 4px 16px rgba(22, 163, 74, 0.2)' : '0 4px 12px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = attempt.passed ? '0 2px 8px rgba(22, 163, 74, 0.1)' : '0 2px 4px rgba(0,0,0,0.06)';
                            }}
                          >
                            {/* Header: Score & Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: attempt.passed ? '#16a34a' : '#ea580c',
                              }}>
                                <i className={`fas ${attempt.passed ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '6px', fontSize: '14px' }}></i>
                                {Math.round(attempt.score)}%
                              </span>
                              <span style={{
                                fontSize: '10px',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                backgroundColor: attempt.passed ? '#dcfce7' : '#f1f5f9',
                                color: attempt.passed ? '#166534' : '#64748b',
                                fontWeight: '600'
                              }}>
                                #{index + 1}
                              </span>
                            </div>

                            {/* Date */}
                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <i className="far fa-calendar" style={{ fontSize: '11px' }}></i>
                              {new Date(attempt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>

                            {/* Status Badge */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                backgroundColor: attempt.passed ? '#dcfce7' : '#f1f5f9',
                                color: attempt.passed ? '#166534' : '#64748b',
                                fontWeight: '600'
                              }}>
                                {attempt.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>

                            {/* Download Button */}
                            {attempt.passed && (
                              <button
                                onClick={() => handleDownloadCertificate(attempt.id, cert.id)}
                                style={{
                                  padding: '8px 14px',
                                  backgroundColor: '#16a34a',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '12px',
                                  transition: 'all 0.2s ease',
                                  opacity: downloading === attempt.id ? 0.7 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                }}
                                disabled={downloading === attempt.id}
                                onMouseEnter={(e) => {
                                  if (downloading !== attempt.id) {
                                    e.target.style.backgroundColor = '#15803d';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#16a34a';
                                }}
                              >
                                {downloading === attempt.id ? (
                                  <><i className="fas fa-spinner fa-spin"></i></>
                                ) : (
                                  <><i className="fas fa-download"></i> PDF</>
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                    {!passedAttempt && remainingAttempts > 0 && (
                      <Link
                        to={collegeSlug ? `/${collegeSlug}/certification/${cert.id}` : `/certification/${cert.id}`}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(255, 152, 0, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f57c00';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#ff9800';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(255, 152, 0, 0.2)';
                        }}
                      >
                        <i className={`fas ${allAttempts > 0 ? 'fa-redo' : 'fa-play'}`}></i>
                        {allAttempts > 0 ? 'Retry Exam' : 'Start Exam'}
                      </Link>
                    )}
                    {remainingAttempts === 0 && !passedAttempt && (
                      <div style={{
                        padding: '10px 20px',
                        backgroundColor: '#f0f0f0',
                        color: '#999',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <i className="fas fa-ban"></i>
                        No Attempts Remaining
                      </div>
                    )}
                    {passedAttempt && (
                      <>
                        <div style={{
                          padding: '10px 20px',
                          backgroundColor: '#d4edda',
                          color: '#155724',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <i className="fas fa-trophy"></i>
                          Certification Completed
                        </div>

                        <Link
                          to={collegeSlug ? `/${collegeSlug}/certification/${cert.id}` : `/certification/${cert.id}`}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 8px rgba(0, 123, 255, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#0056b3';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#007bff';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.2)';
                          }}
                        >
                          <i className="fas fa-video"></i>
                          Test Camera
                        </Link>
                      </>
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
