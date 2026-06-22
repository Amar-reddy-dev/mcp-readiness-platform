import { useState, useRef } from 'react';
import { Upload, FileJson, X, AlertCircle, Play, CheckCircle2 } from 'lucide-react';
import { sampleConfigs } from '../data/sampleConfigs';
import { validateConfig } from '../utils/validationSchema';
import ValidationResults from './ValidationResults';
import './ConfigUpload.css';

const ConfigUpload = ({ onConfigSubmit }) => {
  const [dragActive, setDragActive] = useState(false);
  const [configText, setConfigText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [selectedSample, setSelectedSample] = useState('');
  const [validationResults, setValidationResults] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setFileName(file.name);
    setSelectedSample('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        JSON.parse(text); // Validate JSON
        setConfigText(text);
      } catch (err) {
        setError('Invalid JSON format');
      }
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e) => {
    setConfigText(e.target.value);
    setError('');
    setFileName('');
    setSelectedSample('');
    setValidationResults(null);
    setShowValidation(false);
  };

  const handleValidate = () => {
    if (!configText.trim()) {
      setError('Please provide a configuration');
      return;
    }

    try {
      const config = JSON.parse(configText);
      const results = validateConfig(config);
      setValidationResults(results);
      setShowValidation(true);
      setError('');
    } catch (err) {
      setError('Invalid JSON format. Please check your configuration.');
      setValidationResults(null);
      setShowValidation(false);
    }
  };

  const handleSubmit = () => {
    if (!configText.trim()) {
      setError('Please provide a configuration');
      return;
    }

    try {
      const config = JSON.parse(configText);
      
      // Validate before submitting
      const results = validateConfig(config);
      setValidationResults(results);
      
      if (!results.valid) {
        setShowValidation(true);
        setError('Configuration has validation errors. Please fix them before running the readiness check.');
        return;
      }
      
      onConfigSubmit(config);
    } catch (err) {
      setError('Invalid JSON format. Please check your configuration.');
    }
  };

  const handleClear = () => {
    setConfigText('');
    setFileName('');
    setError('');
    setSelectedSample('');
    setValidationResults(null);
    setShowValidation(false);
  };

  const loadSampleConfig = (sampleKey) => {
    const sample = sampleConfigs[sampleKey];
    if (sample) {
      setConfigText(JSON.stringify(sample.config, null, 2));
      setFileName('');
      setError('');
      setSelectedSample(sampleKey);
    }
  };

  return (
    <div className="config-upload">
      <div className="upload-section">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          Upload or Paste MCP Configuration
        </h2>

        {/* Sample Config Selector */}
        <div className="sample-configs">
          <button
            className={`sample-btn ${selectedSample === 'healthy' ? 'active' : ''}`}
            onClick={() => loadSampleConfig('healthy')}
          >
            ✅ Healthy Config
          </button>
          <button
            className={`sample-btn ${selectedSample === 'broken' ? 'active' : ''}`}
            onClick={() => loadSampleConfig('broken')}
          >
            ❌ Broken Config
          </button>
          <button
            className={`sample-btn ${selectedSample === 'minimal' ? 'active' : ''}`}
            onClick={() => loadSampleConfig('minimal')}
          >
            📄 Minimal Config
          </button>
        </div>

        {/* Drop Zone */}
        {!configText && (
          <div
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-content">
              <Upload className="upload-icon" />
              <h3>Drop your config file here</h3>
              <p>or click to browse • JSON files only</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              accept=".json"
              onChange={handleFileInput}
            />
          </div>
        )}

        {/* Config Editor */}
        {configText && (
          <div className="config-editor">
            <div className="editor-header">
              <h3>
                {fileName ? (
                  <span className="file-badge">
                    <FileJson size={16} />
                    {fileName}
                  </span>
                ) : (
                  'Configuration Editor'
                )}
              </h3>
              <button className="clear-btn" onClick={handleClear}>
                <X size={16} />
                Clear
              </button>
            </div>
            <textarea
              className="config-textarea"
              value={configText}
              onChange={handleTextChange}
              placeholder="Paste your MCP configuration JSON here..."
              spellCheck={false}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            {error}
          </div>
        )}

        {/* Validation Results */}
        {showValidation && validationResults && (
          <ValidationResults results={validationResults} />
        )}

        {/* Action Buttons */}
        {configText && (
          <div className="submit-section">
            <button
              className="btn-validate"
              onClick={handleValidate}
              disabled={!configText.trim()}
            >
              <CheckCircle2 size={20} />
              Validate Configuration
            </button>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!configText.trim()}
            >
              <Play size={20} />
              Run Readiness Check
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigUpload;

// Made with Bob
