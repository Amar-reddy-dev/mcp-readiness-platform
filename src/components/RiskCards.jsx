import { AlertTriangle, AlertCircle, Info, Shield, Activity, Zap } from 'lucide-react';
import './RiskCards.css';

const RiskCards = ({ risks }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle size={20} />;
      case 'high':
        return <AlertTriangle size={20} />;
      case 'medium':
        return <Info size={20} />;
      default:
        return <Shield size={20} />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'authentication':
      case 'auth':
        return <Shield size={24} />;
      case 'network':
      case 'infrastructure':
        return <Activity size={24} />;
      case 'performance':
        return <Zap size={24} />;
      case 'observability':
        return <Info size={24} />;
      default:
        return <AlertTriangle size={24} />;
    }
  };

  if (!risks || risks.length === 0) {
    return (
      <div className="risk-cards-container">
        <div className="no-risks">
          <Shield size={48} />
          <h3>No Critical Risks Detected</h3>
          <p>Your configuration looks good! Review recommendations for optimization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-cards-container fade-in">
      <div className="risk-header">
        <h2>Detected Risks</h2>
        <div className="risk-summary">
          <span className="risk-count critical">
            {risks.filter(r => r.severity === 'critical').length} Critical
          </span>
          <span className="risk-count high">
            {risks.filter(r => r.severity === 'high').length} High
          </span>
          <span className="risk-count medium">
            {risks.filter(r => r.severity === 'medium').length} Medium
          </span>
        </div>
      </div>

      <div className="risk-grid">
        {risks.map((risk, index) => (
          <div 
            key={index} 
            className={`risk-card risk-${risk.severity}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="risk-card-header">
              <div className={`risk-category-icon ${risk.category}`}>
                {getCategoryIcon(risk.category)}
              </div>
              <div className="risk-title-section">
                <h3>{risk.title}</h3>
                <div className="risk-meta">
                  <span className={`severity-badge severity-${risk.severity}`}>
                    {getSeverityIcon(risk.severity)}
                    {risk.severity.toUpperCase()}
                  </span>
                  <span className="probability-badge">
                    {risk.probability} failure rate
                  </span>
                </div>
              </div>
            </div>

            <div className="risk-content">
              <p className="risk-description">{risk.description}</p>
              
              <div className="risk-mitigation">
                <div className="mitigation-label">
                  <Shield size={16} />
                  Mitigation
                </div>
                <p className="mitigation-text">{risk.mitigation}</p>
              </div>
            </div>

            <div className="risk-footer">
              <span className="risk-category">{risk.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskCards;

// Made with Bob
