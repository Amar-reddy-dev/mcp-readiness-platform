import { Lightbulb, CheckCircle, Code, ArrowRight, Clock, Zap } from 'lucide-react';
import './RecommendationsPanel.css';

const RecommendationsPanel = ({ recommendations }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle size={20} />;
      case 'high':
        return <Zap size={20} />;
      case 'medium':
        return <Lightbulb size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  const getEffortBadge = (effort) => {
    const effortMap = {
      low: { label: 'Quick Fix', color: 'success' },
      medium: { label: 'Moderate', color: 'warning' },
      high: { label: 'Complex', color: 'danger' }
    };
    return effortMap[effort] || effortMap.medium;
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendations-panel">
        <div className="no-recommendations">
          <CheckCircle size={48} />
          <h3>All Set!</h3>
          <p>No additional recommendations at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-panel fade-in">
      <div className="recommendations-header">
        <div className="header-content">
          <Lightbulb size={28} />
          <div>
            <h2>Recommendations</h2>
            <p>Actionable steps to improve your MCP configuration</p>
          </div>
        </div>
        <div className="recommendations-count">
          {recommendations.length} {recommendations.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div 
            key={index} 
            className={`recommendation-card priority-${rec.priority}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="recommendation-header">
              <div className={`priority-indicator priority-${rec.priority}`}>
                {getPriorityIcon(rec.priority)}
              </div>
              <div className="recommendation-title-section">
                <h3>{rec.title}</h3>
                <div className="recommendation-badges">
                  <span className={`priority-badge priority-${rec.priority}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                  {rec.effort && (
                    <span className={`effort-badge effort-${getEffortBadge(rec.effort).color}`}>
                      <Clock size={14} />
                      {getEffortBadge(rec.effort).label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="recommendation-content">
              <p className="recommendation-description">{rec.description}</p>

              <div className="recommendation-action">
                <div className="action-label">
                  <ArrowRight size={16} />
                  Action Required
                </div>
                <p className="action-text">{rec.action}</p>
              </div>

              {rec.impact && (
                <div className="recommendation-impact">
                  <Zap size={16} />
                  <span>Impact: {rec.impact}</span>
                </div>
              )}

              {rec.code && (
                <details className="code-example">
                  <summary>
                    <Code size={16} />
                    View Code Example
                  </summary>
                  <pre className="code-block">
                    <code>{rec.code}</code>
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="recommendations-footer">
        <div className="footer-tip">
          <Lightbulb size={20} />
          <p>
            <strong>Pro Tip:</strong> Address critical and high priority items before deploying to production.
            These recommendations are based on analysis of {recommendations.length} configuration patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

// Import missing icon
import { AlertCircle } from 'lucide-react';

export default RecommendationsPanel;

// Made with Bob
