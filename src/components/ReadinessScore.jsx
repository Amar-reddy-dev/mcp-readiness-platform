import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import './ReadinessScore.css';

const ReadinessScore = ({ score, totalRuns, successful, failed }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle size={32} />;
    if (score >= 60) return <AlertTriangle size={32} />;
    return <XCircle size={32} />;
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Production Ready';
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Needs Improvement';
    if (score >= 40) return 'High Risk';
    return 'Critical Issues';
  };

  const scoreColor = getScoreColor(score);
  const successRate = ((successful / totalRuns) * 100).toFixed(1);
  const failureRate = ((failed / totalRuns) * 100).toFixed(1);

  return (
    <div className="readiness-score-container fade-in">
      <div className={`score-card score-${scoreColor}`}>
        <div className="score-header">
          <div className="score-icon">
            {getScoreIcon(score)}
          </div>
          <div className="score-info">
            <h2>Readiness Score</h2>
            <p className="score-label">{getScoreLabel(score)}</p>
          </div>
        </div>
        
        <div className="score-display">
          <div className="score-number">{score}</div>
          <div className="score-max">/100</div>
        </div>

        <div className="score-bar">
          <div 
            className={`score-fill score-fill-${scoreColor}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="simulation-stats">
        <div className="stat-card">
          <div className="stat-icon success">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{successful}/{totalRuns}</div>
            <div className="stat-label">Successful Runs</div>
            <div className="stat-percentage success">{successRate}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{failed}/{totalRuns}</div>
            <div className="stat-label">Failed Runs</div>
            <div className="stat-percentage danger">{failureRate}%</div>
          </div>
        </div>
      </div>

      <div className="confidence-indicator">
        <div className="confidence-header">
          <span className="confidence-label">Confidence Level</span>
          <span className={`confidence-badge badge-${scoreColor}`}>
            {score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low'}
          </span>
        </div>
        <p className="confidence-description">
          Based on {totalRuns} simulated production scenarios analyzing authentication, 
          network reliability, performance, and observability.
        </p>
      </div>
    </div>
  );
};

export default ReadinessScore;

// Made with Bob
