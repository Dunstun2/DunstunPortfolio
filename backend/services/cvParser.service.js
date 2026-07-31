/**
 * Document Text Extraction Service
 * 
 * Extracts text from various document formats (PDF, DOCX, TXT)
 * so it can be passed to the AI parser.
 */

const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

class CVParserService {
  /**
   * Extract text from uploaded file
   * @param {string} filePath - Path to the uploaded file
   * @param {string} fileType - MIME type of the file
   * @returns {Promise<string>} - Extracted text content
   */
  async extractText(filePath, fileType) {
    try {
      if (fileType === 'application/pdf' || filePath.endsWith('.pdf')) {
        return await this.extractFromPDF(filePath);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        filePath.endsWith('.docx')
      ) {
        return await this.extractFromDOCX(filePath);
      } else if (fileType === 'text/plain' || filePath.endsWith('.txt')) {
        return await this.extractFromTXT(filePath);
      } else {
        throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
      }
    } catch (error) {
      console.error('Error extracting text from document:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  /**
   * Helper to get a buffer from either a local path or remote URL
   */
  async _getFileBuffer(filePath) {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to download file from URL: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
    return await fs.readFile(filePath);
  }

  /**
   * Extract text from PDF file
   */
  async extractFromPDF(filePath) {
    try {
      const dataBuffer = await this._getFileBuffer(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Extract text from DOCX file
   */
  async extractFromDOCX(filePath) {
    try {
      const buffer = await this._getFileBuffer(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`DOCX parsing failed: ${error.message}`);
    }
  }

  /**
   * Extract text from TXT file
   */
  async extractFromTXT(filePath) {
    try {
      const buffer = await this._getFileBuffer(filePath);
      return buffer.toString('utf-8');
    } catch (error) {
      throw new Error(`TXT reading failed: ${error.message}`);
    }
  }
}

module.exports = new CVParserService();
