# MCP Readiness Platform

> **Predictive Integration Simulation for MCP Configurations**

A revolutionary platform that doesn't just validate your MCP configuration—it **predicts what will happen in production** by simulating 100 real-world scenarios.

## 🎯 The Problem

Traditional validation tools tell you what's wrong with your config. But they don't tell you:
- What will actually fail in production
- How likely failures are to occur
- What the impact will be on your system
- How to fix issues before deployment

## 💡 Our Solution

Instead of checking config files, we **simulate production environments** and run your configuration through 100 scenarios:

- ✅ Token expiration
- ✅ Gateway unavailability
- ✅ Tool timeouts
- ✅ OAuth misconfigurations
- ✅ Rate limiting
- ✅ Security vulnerabilities
- ✅ Missing monitoring
- ✅ Tool registration failures

Then we provide:
- **Readiness Score** (0-100) based on simulation results
- **Risk Analysis** with failure probabilities
- **Actionable Recommendations** with code examples
- **Predictive Insights** on what will likely fail

## 🚀 Features

### 1. **Predictive Simulation Engine**
- Runs 100 production scenarios
- Calculates failure probabilities
- Identifies critical risks before deployment

### 2. **Intelligent Risk Detection**
- Authentication failures (OAuth, token refresh)
- Network issues (gateway, timeouts)
- Performance problems (tool timeouts)
- Security vulnerabilities (TLS, certificates)
- Observability gaps (monitoring, tracing)

### 3. **Actionable Recommendations**
- Prioritized by impact (Critical → Low)
- Code-level fixes included
- Effort estimates (Quick Fix, Moderate, Complex)
- Impact analysis for each recommendation

### 4. **Beautiful UI**
- Sample configs (Healthy, Broken, Minimal)
- Drag & drop file upload
- Real-time simulation visualization
- Interactive results dashboard

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **MCP Server**: Model Context Protocol SDK
- **LLM**: IBM watsonx.ai (Granite models)
- **Styling**: Custom CSS with modern design system
- **Icons**: Lucide React
- **Charts**: Recharts (for future enhancements)
- **Simulation**: Custom JavaScript engine with MCP tools

## 📦 Installation

### Frontend Application

```bash
# Clone the repository
git clone <repository-url>
cd mcp-readiness-platform

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### MCP Server (Optional - for LLM-powered analysis)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure IBM watsonx credentials (optional)
# Create .env file with:
# IBM_WATSONX_API_KEY=your_api_key
# IBM_WATSONX_PROJECT_ID=your_project_id

# Start MCP server
npm start
```

See [backend/README.md](backend/README.md) for detailed MCP server documentation.

## 🎮 Usage

1. **Select a Sample Config** or upload your own JSON file
2. Click **"Run Readiness Check"**
3. Watch the simulation run across 100 scenarios
4. Review your **Readiness Score**
5. Analyze **Detected Risks** with failure probabilities
6. Implement **Recommendations** to improve your score

## 📊 Sample Configurations

### Healthy Config
- ✅ OAuth properly configured
- ✅ Gateway subscribed
- ✅ Monitoring enabled
- ✅ Tools registered
- **Expected Score**: 85-95

### Broken Config
- ❌ Missing OAuth token endpoint
- ❌ Gateway not subscribed
- ❌ No monitoring
- ❌ Tools not registered
- **Expected Score**: 20-40

### Minimal Config
- ⚠️ Basic setup only
- ⚠️ Missing best practices
- **Expected Score**: 50-65

## 🎯 How It Works

### 1. Configuration Analysis
```javascript
// Upload your MCP config
{
  "server": { ... },
  "oauth": { ... },
  "gateway": { ... },
  "tools": [ ... ],
  "monitoring": { ... }
}
```

### 2. Scenario Simulation
The platform creates a digital test environment and runs scenarios:
- **Scenario 1**: Token expires → What happens?
- **Scenario 2**: Gateway unavailable → What happens?
- **Scenario 3**: Tool becomes slow → What happens?
- **Scenario 4**: Wrong OAuth audience → What happens?

### 3. Results Generation
```
Out of 100 simulated production runs:
- 72 succeeded
- 18 failed authentication
- 10 failed due to timeout

Readiness Score: 78%
Confidence: Medium Risk
```

### 4. Recommendations
Get specific, actionable fixes:
```json
{
  "priority": "critical",
  "title": "Configure OAuth Authentication",
  "action": "Add OAuth configuration with provider, clientId, issuer, and audience",
  "code": "{ ... }" // Actual code example provided
}
```

## 🏗️ Architecture

```
mcp-readiness-platform/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfigUpload.jsx
│   │   │   ├── ReadinessScore.jsx
│   │   │   ├── RiskCards.jsx
│   │   │   └── RecommendationsPanel.jsx
│   │   ├── data/
│   │   │   └── sampleConfigs.js
│   │   ├── utils/
│   │   │   ├── validationSchema.js
│   │   │   ├── scoringRules.js
│   │   │   ├── riskDetection.js
│   │   │   └── simulationEngine.js
│   │   └── App.jsx
│   ├── public/
│   ├── index.html
│   └── vite.config.js
│
├── backend/                   # MCP server
│   ├── server.js
│   ├── tools/
│   │   ├── simulateTokenExpiry.js
│   │   ├── simulateGatewayFailure.js
│   │   ├── simulateToolTimeout.js
│   │   ├── simulateInvalidAudience.js
│   │   ├── simulateObservabilityGap.js
│   │   └── generateGoNoGoDecision.js
│   └── integrations/
│       └── ibmWatsonxOrchestrate.js
│
└── MCP_ARCHITECTURE.md        # Detailed architecture diagram
```

See [MCP_ARCHITECTURE.md](MCP_ARCHITECTURE.md) for detailed system architecture.

## 🎨 Design System

- **Primary Color**: Indigo (#6366f1)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Dark Theme**: Slate backgrounds

## 🆕 New Features (MCP Server)

### MCP Simulation Tools
- ✅ **simulate_token_expiry** - Tests OAuth token handling
- ✅ **simulate_gateway_failure** - Tests network resilience
- ✅ **simulate_tool_timeout** - Tests timeout handling
- ✅ **simulate_invalid_audience** - Tests token validation
- ✅ **simulate_observability_gap** - Tests monitoring coverage
- ✅ **generate_go_no_go_decision** - LLM-powered deployment decisions

### IBM watsonx Integration
- ✅ **LLM-Powered Analysis** - Uses IBM Granite models
- ✅ **Intelligent Recommendations** - Context-aware suggestions
- ✅ **Pattern Recognition** - Identifies common failure patterns
- ✅ **Confidence Scoring** - Reliability assessment

## 🚧 Future Enhancements

- [ ] Real-time MCP server testing via web UI
- [ ] Historical analysis & trends
- [ ] Team collaboration features
- [ ] CI/CD integration
- [ ] Custom scenario creation
- [ ] Export reports (PDF, JSON)
- [ ] API for programmatic access
- [ ] Production IBM watsonx API integration

## 🤝 Contributing

This project was built for the MCP Hackathon. Contributions are welcome!

## 📝 License

MIT License - feel free to use this project for your own MCP configurations.

## 🙏 Acknowledgments

- Built with ❤️ for the MCP Hackathon
- Inspired by the need for predictive validation
- Thanks to the MCP community for feedback

---

**Made with Bob** 🤖
