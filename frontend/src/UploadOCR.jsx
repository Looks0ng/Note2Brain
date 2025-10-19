import React, { useState, useRef } from 'react';
import './UploadOCR.css';
import { useNavigate } from "react-router-dom";
import "./Document.css";

export default function UploadOCR() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/pdf') {
        setFile(selectedFile);
    } else {
        setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error("User not logged in");
      }

      const response = await fetch(`http://localhost:8000/upload?user_id=${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('OCR process failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container page-transition">
      <div className="upload-card">
        <div className="upload-header">
          <img src="/logo.png" alt="logo" className="upload-logo" />
        </div>
        <h1 className="upload-title">
          PDF EXTRACTOR
        </h1>

        <form onSubmit={handleSubmit} className="upload-form">
          <label 
            htmlFor="file-input"
            className={`file-upload-area ${file ? 'has-file' : ''}`}
            data-file-name={file ? file.name : ''}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input"
              ref={fileInputRef}
              onClick={(e) => { 
                e.currentTarget.value = null
              }}
            />
          </label>

          <button
            type="submit"
            disabled={!file || loading}
            className={`submit-button ${!file ? 'disabled' : ''}`}
          >
            {loading ? 'Processing...' : 'Extract Text'}
          </button>
        </form>

        {result && (
          <div className="result-section">
            <div className="summary-section">
              <h2 className="summary-title">Summary:</h2>
              <div className="summary-content">
                <p className="summary-text">
                  {result.summary}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}