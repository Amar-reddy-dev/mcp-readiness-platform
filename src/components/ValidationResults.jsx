import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import './ValidationResults.css';

const ValidationResults = ({ results }) => {
  if (!results) return null;

  const { valid, errors = [], warnings = [] } = results;

  return (
    <div className="validation-results fade-in">
      {/* Status Header */}
      <div className={`validation-header ${valid ? 'valid' : 'invalid'}`}>
        {valid ? (
          <>
            <CheckCircle size={24} />
            <div>
              <h3>Configuration Valid</h3>
              <p>Your configuration passed all validation checks</p>
            </div>
          </>
        ) : (
          <>
            <XCircle size={24} />
            <div>
              <h3>Configuration Invalid</h3>
              <p>{errors.length} error{errors.length !== 1 ? 's' : ''} found</p>
            </div>
          </>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="validation-section errors">
          <div className="section-header">
            <XCircle size={20} />
            <h4>Errors ({errors.length})</h4>
          </div>
          <div className="validation-items">
            {errors.map((error, index) => (
              <div key={index} className="validation-item error">
                <div className="item-header">
                  <span className="item-path">{error.path}</span>
                  <span className="item-type">{error.type}</span>
                </div>
                <p className="item-message">{error.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="validation-section warnings">
          <div className="section-header">
            <AlertTriangle size={20} />
            <h4>Warnings ({warnings.length})</h4>
          </div>
          <div className="validation-items">
            {warnings.map((warning, index) => (
              <div key={index} className="validation-item warning">
                <div className="item-header">
                  <span className="item-path">{warning.path}</span>
                  <span className="item-badge">Best Practice</span>
                </div>
                <p className="item-message">{warning.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {valid && warnings.length === 0 && (
        <div className="validation-success">
          <Info size={20} />
          <p>No issues found. Your configuration follows all best practices.</p>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;

// Made with Bob
