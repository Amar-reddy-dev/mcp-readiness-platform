# MCP Readiness Platform Server

Model Context Protocol (MCP) server for the MCP Readiness Platform, providing simulation tools and LLM-powered validation using IBM watsonx Orchestrate.

## Overview

This MCP server implements six powerful simulation tools that help validate MCP configurations and predict deployment readiness:

1. **simulate_token_expiry** - Tests OAuth token handling and refresh mechanisms
2. **simulate_gateway_failure** - Tests network resilience and fallback strategies
3. **simulate_tool_timeout** - Tests timeout handling and retry policies
4. **simulate_invalid_audience** - Tests token validation and security
5. **simulate_observability_gap** - Tests monitoring coverage and blind spots
6. **generate_go_no_go_decision** - Generates comprehensive deployment decisions

## Features

- ✅ **IBM Standards Compliant** - Follows IBM watsonx Orchestrate best practices
- ✅ **LLM-Powered Analysis** - Uses IBM Granite models for intelligent insights
- ✅ **Rule-Based Validation** - Leverages existing validation utilities
- ✅ **Comprehensive Simulation** - Tests multiple failure scenarios
- ✅ **Production-Ready** - Includes error handling, logging, and monitoring

## Installation

```bash
cd backend
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# IBM watsonx Configuration
IBM_WATSONX_API_KEY=your_api_key_here
IBM_WATSONX_PROJECT_ID=your_project_id_here
IBM_WATSONX_REGION=us-south
IBM_WATSONX_MODEL=ibm/granite-13b-chat-v2
IBM_WATSONX_API_URL=https://us-south.ml.cloud.ibm.com/ml/v1/text/generation
```

### Getting IBM watsonx Credentials

1. Sign up for IBM Cloud: https://cloud.ibm.com
2. Create a watsonx.ai instance
3. Generate API key from IBM Cloud IAM
4. Create a project and get the project ID
5. Add credentials to `.env` file

## Usage

### Starting the Server

```bash
npm start
```

The server runs on stdio transport (MCP standard).

### Development Mode

```bash
npm run dev
```

Runs with auto-reload on file changes.

## MCP Tools

### 1. simulate_token_expiry

Simulates OAuth token expiration scenarios.

**Input:**
```json
{
  "config": { /* MCP configuration */ },
  "expiryTime": 3600,
  "includeRefresh": true
}
```

**Output:**
```json
{
  "tool": "simulate_token_expiry",
  "scenarios": [...],
  "summary": {
    "total_scenarios": 4,
    "passed": 3,
    "failed": 1
  },
  "overall_assessment": {
    "ready_for_production": false,
    "confidence_level": "medium",
    "failure_probability": "25%"
  }
}
```

### 2. simulate_gateway_failure

Simulates gateway unavailability and network failures.

**Input:**
```json
{
  "config": { /* MCP configuration */ },
  "failureType": "timeout",
  "duration": 5000
}
```

**Failure Types:**
- `timeout` - Gateway timeout
- `connection_refused` - Connection refused
- `dns_failure` - DNS resolution failure
- `rate_limit` - Rate limit exceeded

### 3. simulate_tool_timeout

Simulates tool execution timeouts.

**Input:**
```json
{
  "config": { /* MCP configuration */ },
  "toolName": "specific_tool",
  "timeoutDuration": 30000
}
```

### 4. simulate_invalid_audience

Simulates invalid OAuth audience scenarios.

**Input:**
```json
{
  "config": { /* MCP configuration */ },
  "invalidAudience": "https://invalid.audience.com"
}
```

### 5. simulate_observability_gap

Simulates observability gaps and monitoring blind spots.

**Input:**
```json
{
  "config": { /* MCP configuration */ },
  "gapType": "all"
}
```

**Gap Types:**
- `missing_traces` - Tracing gaps
- `missing_metrics` - Metrics gaps
- `missing_logs` - Logging gaps
- `all` - All observability gaps

### 6. generate_go_no_go_decision

Generates comprehensive deployment decision using validation rules and LLM analysis.

**Input:**
```json
{
  "config": { /* MCP configuration */ },
  "environment": "production",
  "useLLM": true
}
```

**Environments:**
- `development` - Relaxed criteria
- `staging` - Moderate criteria
- `production` - Strict criteria

**Output:**
```json
{
  "decision": "GO|NO_GO|GO_WITH_CAUTION",
  "confidence": "high|medium|low",
  "analysis": {
    "validation": {...},
    "scoring": {...},
    "risks": {...},
    "llm_analysis": {...}
  },
  "criteria": {
    "passed": [...],
    "failed": [...],
    "warnings": [...]
  },
  "recommendations": [...],
  "deployment_checklist": [...]
}
```

## Integration with Existing Utilities

The MCP server integrates seamlessly with existing validation utilities:

```javascript
// Uses frontend validation schema
import { validateConfig } from '../../frontend/src/utils/validationSchema.js';

// Uses frontend scoring rules
import { getScoringReport } from '../../frontend/src/utils/scoringRules.js';

// Uses frontend risk detection
import { generateRiskReport } from '../../frontend/src/utils/riskDetection.js';
```

## IBM watsonx Integration

The server uses IBM watsonx.ai for LLM-powered analysis:

```javascript
import { validateWithLLM } from './integrations/ibmWatsonxOrchestrate.js';

// Generate LLM-powered insights
const llmAnalysis = await validateWithLLM(config, {
  validation,
  scoring,
  riskReport,
  environment
});
```

### LLM Features

- **Deep Analysis** - Context-aware configuration analysis
- **Pattern Recognition** - Identifies common failure patterns
- **Intelligent Recommendations** - Actionable improvement suggestions
- **Confidence Scoring** - Reliability assessment of predictions

## Architecture

```
backend/
├── server.js                          # Main MCP server
├── package.json                       # Dependencies and metadata
├── tools/                             # Simulation tools
│   ├── simulateTokenExpiry.js
│   ├── simulateGatewayFailure.js
│   ├── simulateToolTimeout.js
│   ├── simulateInvalidAudience.js
│   ├── simulateObservabilityGap.js
│   └── generateGoNoGoDecision.js
└── integrations/                      # External integrations
    └── ibmWatsonxOrchestrate.js      # IBM watsonx integration
```

## Error Handling

The server includes comprehensive error handling:

- **Validation Errors** - Invalid input detection
- **Tool Execution Errors** - Graceful failure handling
- **LLM Errors** - Fallback to rule-based validation
- **Network Errors** - Retry logic with exponential backoff

## Logging

Logs are written to stderr (MCP standard):

```javascript
console.error('MCP Readiness Platform Server running on stdio');
console.error('Step 1: Validating configuration...');
```

## Testing

```bash
npm test
```

## Development

### Adding New Tools

1. Create tool file in `tools/` directory
2. Implement tool function with MCP response format
3. Register tool in `server.js` TOOL_REGISTRY
4. Add tool handler in request handler

### Example Tool Structure

```javascript
export async function myNewTool(args) {
  const { config, ...params } = args;
  
  // Validate configuration
  const validation = validateConfig(config);
  
  // Perform simulation
  const results = {
    tool: 'my_new_tool',
    timestamp: new Date().toISOString(),
    scenarios: [],
    summary: {}
  };
  
  // Return MCP response
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(results, null, 2)
      }
    ]
  };
}
```

## Best Practices

1. **Always validate input** - Use existing validation utilities
2. **Provide detailed feedback** - Include scenarios, probabilities, and mitigations
3. **Use structured output** - Follow consistent JSON format
4. **Handle errors gracefully** - Never crash the server
5. **Log appropriately** - Use stderr for logs, stdout for MCP protocol

## Troubleshooting

### Server Won't Start

- Check Node.js version (>=18.0.0 required)
- Verify all dependencies are installed
- Check for syntax errors in tool files

### LLM Analysis Not Working

- Verify IBM watsonx credentials in `.env`
- Check API key permissions
- Ensure project ID is correct
- Verify network connectivity to IBM Cloud

### Tools Returning Errors

- Validate input configuration format
- Check tool-specific parameters
- Review error messages in stderr logs

## Contributing

1. Follow IBM coding standards
2. Add tests for new tools
3. Update documentation
4. Follow MCP protocol specifications

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [repository-url]
- Documentation: See MCP_ARCHITECTURE.md
- IBM watsonx Docs: https://www.ibm.com/docs/en/watsonx-as-a-service

## Acknowledgments

- Built with Model Context Protocol SDK
- Powered by IBM watsonx.ai
- Uses IBM Granite models for LLM analysis