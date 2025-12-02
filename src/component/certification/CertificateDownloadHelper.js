/**
 * CertificateDownloadHelper.js
 * Handles frontend certificate PDF generation using html2canvas and jsPDF
 *
 * This utility provides methods to download certificates as PDFs with:
 * - Custom layout (Z1 logo, signature on top-left, college logo/signature on top-right/bottom-right)
 * - Dynamic college branding (logo, signature, contact info)
 * - Professional styling and print optimization
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Download certificate as PDF from frontend template
 * @param {React.RefObject} certificateRef - Reference to the certificate DOM element
 * @param {string} certificateTitle - Title for the downloaded PDF file
 * @returns {Promise<void>}
 */
export const downloadCertificateAsPDF = async (certificateRef, certificateTitle = 'Certificate') => {
  if (!certificateRef || !certificateRef.current) {
    throw new Error('Certificate reference is invalid');
  }

  try {
    // Step 1: Convert certificate DOM to canvas image
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow cross-origin images (college logos, signatures)
      allowTaint: false, // Security: only allow clean images
      backgroundColor: '#ffffff', // White background
      logging: false, // Disable console logging
      imageTimeout: 0, // No timeout for loading images
      ignoreElements: (element) => {
        // Ignore elements with data-no-download attribute
        return element.hasAttribute('data-no-download');
      }
    });

    // Step 2: Create PDF in landscape A4 format
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Step 3: Calculate dimensions to fit canvas to PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png');

    // Calculate scaling to fit PDF
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let finalWidth = pdfWidth;
    let finalHeight = pdfWidth / ratio;

    if (finalHeight > pdfHeight) {
      finalHeight = pdfHeight;
      finalWidth = pdfHeight * ratio;
    }

    // Center image on PDF
    const xOffset = (pdfWidth - finalWidth) / 2;
    const yOffset = (pdfHeight - finalHeight) / 2;

    // Step 4: Add image to PDF
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

    // Step 5: Save PDF file
    pdf.save(`${certificateTitle}-Certificate.pdf`);

    return {
      success: true,
      message: 'Certificate downloaded successfully',
    };
  } catch (error) {
    console.error('Error downloading certificate as PDF:', error);
    throw new Error(`Failed to download certificate: ${error.message}`);
  }
};

/**
 * Print certificate using browser print dialog
 * @param {React.RefObject} certificateRef - Reference to the certificate DOM element
 * @returns {Promise<void>}
 */
export const printCertificate = async (certificateRef) => {
  if (!certificateRef || !certificateRef.current) {
    throw new Error('Certificate reference is invalid');
  }

  try {
    // Clone the certificate element for printing
    const printContent = certificateRef.current.cloneNode(true);

    // Create a new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Check browser popup settings.');
    }

    // Write certificate HTML to print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - Print</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              padding: 0;
              background: white;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .certificate-container {
                background-color: white;
                padding: 0;
                margin: 0;
                border-radius: 0;
                max-width: none;
              }
              .certificate-wrapper {
                aspect-ratio: unset;
                page-break-inside: avoid;
              }
              .certificate-border {
                border-radius: 0;
                box-shadow: none;
              }
            }
          </style>
          <link rel="stylesheet" href="${window.location.origin}/index.css">
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait a moment for styles to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Optionally close the window after printing
      // printWindow.close();
    }, 500);

    return {
      success: true,
      message: 'Print dialog opened',
    };
  } catch (error) {
    console.error('Error printing certificate:', error);
    throw new Error(`Failed to print certificate: ${error.message}`);
  }
};

/**
 * Generate certificate preview as image (base64)
 * Useful for sharing via email or APIs
 * @param {React.RefObject} certificateRef - Reference to the certificate DOM element
 * @param {number} scale - Canvas scale factor (default: 2)
 * @returns {Promise<string>} Base64 encoded image data
 */
export const generateCertificateImage = async (certificateRef, scale = 2) => {
  if (!certificateRef || !certificateRef.current) {
    throw new Error('Certificate reference is invalid');
  }

  try {
    const canvas = await html2canvas(certificateRef.current, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating certificate image:', error);
    throw new Error(`Failed to generate certificate image: ${error.message}`);
  }
};

/**
 * Download certificate with custom options
 * @param {React.RefObject} certificateRef - Reference to the certificate DOM element
 * @param {Object} options - Download options
 * @param {string} options.fileName - File name without extension
 * @param {string} options.format - Output format ('pdf' or 'image')
 * @param {number} options.quality - Image quality for JPEG (0-100)
 * @returns {Promise<Object>} Result object with success status
 */
export const downloadCertificateWithOptions = async (
  certificateRef,
  {
    fileName = 'Certificate',
    format = 'pdf',
    quality = 95,
  } = {}
) => {
  if (!certificateRef || !certificateRef.current) {
    throw new Error('Certificate reference is invalid');
  }

  try {
    if (format === 'pdf') {
      return await downloadCertificateAsPDF(certificateRef, fileName);
    } else if (format === 'image') {
      const imageData = await generateCertificateImage(certificateRef);

      // Create download link
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `${fileName}-Certificate.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return {
        success: true,
        message: 'Certificate image downloaded successfully',
      };
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
};

export default {
  downloadCertificateAsPDF,
  printCertificate,
  generateCertificateImage,
  downloadCertificateWithOptions,
};
