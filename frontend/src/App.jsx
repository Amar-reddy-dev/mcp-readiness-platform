import { useState } from 'react';
import { Activity, Sparkles, ArrowLeft } from 'lucide-react';
import ConfigUpload from './components/ConfigUpload';
import ReadinessScore from './components/ReadinessScore';
import RiskCards from './components/RiskCards';
import RecommendationsPanel from './components/RecommendationsPanel';
import { runSimulation } from './utils/simulationEngine';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleConfigSubmit = (config) => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay for better UX
    setTimeout(() => {
      const simulationResults = runSimulation(config);
      setResults(simulationResults);
      setIsAnalyzing(false);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }, 2000);
  };

  const handleReset = () => {
    setResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Activity size={32} />
              <div>
                <h1>MCP Readiness Platform</h1>
                <p className="tagline">Predictive Integration Simulation</p>
              </div>
            </div>
            {results && (
              <button className="btn btn-secondary" onClick={handleReset}>
                <ArrowLeft size={18} />
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!results && !isAnalyzing && (
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="hero-badge">
                <Sparkles size={16} />
                AI-Powered Simulation
              </div>
              <h2 className="hero-title">
                Predict Production Failures<br />
                <span className="gradient-text">Before They Happen</span>
              </h2>
              <p className="hero-description">
                Upload your MCP configuration and we'll simulate 100 production scenarios
                to predict authentication failures, timeouts, and configuration issues.
              </p>
              <div className="hero-features">
                <div className="feature">
                  <div className="feature-icon">🎯</div>
                  <div>
                    <h4>Predictive Analysis</h4>
                    <p>Simulate real-world scenarios</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">⚡</div>
                  <div>
                    <h4>Risk Detection</h4>
                    <p>Identify critical issues early</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">🔧</div>
                  <div>
                    <h4>Actionable Fixes</h4>
                    <p>Get code-level recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upload Section */}
      {!results && !isAnalyzing && (
        <section className="upload-section">
          <div className="container">
            <ConfigUpload onConfigSubmit={handleConfigSubmit} />
          </div>
        </section>
      )}

      {/* Analyzing State */}
      {isAnalyzing && (
        <section className="analyzing-section">
          <div className="container">
            <div className="analyzing-content">
              <div className="spinner-container">
                <div className="spinner"></div>
                <Activity className="spinner-icon" size={48} />
              </div>
              <h2>Running Simulation...</h2>
              <p>Analyzing your configuration across 100 production scenarios</p>
              <div className="analyzing-steps">
                <div className="step active">
                  <div className="step-number">1</div>
                  <span>Validating Configuration</span>
                </div>
                <div className="step active">
                  <div className="step-number">2</div>
                  <span>Creating Test Environment</span>
                </div>
                <div className="step active">
                  <div className="step-number">3</div>
                  <span>Simulating Scenarios</span>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <span>Generating Report</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {results && !isAnalyzing && (
        <section id="results-section" className="results-section">
          <div className="container">
            <div className="results-header">
              <h2>Simulation Results</h2>
              <p>Based on 100 simulated production runs</p>
            </div>

            {/* Readiness Score */}
            <ReadinessScore 
              score={results.readinessScore}
              totalRuns={results.totalRuns}
              successful={results.successful}
              failed={results.failed}
            />

            {/* Risk Cards */}
            <RiskCards risks={results.risks} />

            {/* Recommendations */}
            <RecommendationsPanel recommendations={results.recommendations} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <p>Built with ❤️ for the MCP Hackathon • Powered by AI Simulation</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

// Made with Bob
