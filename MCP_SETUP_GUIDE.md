# MCP Server Setup Guide

Complete guide to setting up and using the MCP Readiness Platform Server with IBM watsonx Orchestrate.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [IBM watsonx Configuration](#ibm-watsonx-configuration)
4. [MCP Server Setup](#mcp-server-setup)
5. [Claude Desktop Integration](#claude-desktop-integration)
6. [Testing the Server](#testing-the-server)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Claude Desktop**: Latest version (for MCP integration)

### Optional (for LLM features)

- **IBM Cloud Account**: For watsonx.ai access
- **IBM watsonx.ai Instance**: With Granite model access

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mcp-readiness-platform
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install MCP Server Dependencies

```bash
cd ../backend
npm install
```

## IBM watsonx Configuration

### Step 1: Create IBM Cloud Account

1. Go to [IBM Cloud](https://cloud.ibm.com)
2. Sign up for a free account or log in
3. Navigate to the IBM Cloud dashboard

### Step 2: Create watsonx.ai Instance

1. In IBM Cloud dashboard, click **"Create resource"**
2. Search for **"watsonx.ai"**
3. Select the service and choose a plan:
   - **Lite Plan**: Free tier (limited usage)
   - **Essentials Plan**: Pay-as-you-go
   - **Standard Plan**: Enterprise features
4. Click **"Create"**

### Step 3: Get API Credentials

1. In your watsonx.ai instance, go to **"Service credentials"**
2. Click **"New credential"**
3. Copy the following values:
   - `apikey`: Your IBM Cloud API key
   - `url`: Service endpoint URL

### Step 4: Create a Project

1. In watsonx.ai, go to **"Projects"**
2. Click **"New project"**
3. Choose **"Create an empty project"**
4. Name your project (e.g., "MCP Readiness Platform")
5. Copy the **Project ID** from the project settings

### Step 5: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following content:

```env
# IBM watsonx Configuration
IBM_WATSONX_API_KEY=your_api_key_here
IBM_WATSONX_PROJECT_ID=your_project_id_here
IBM_WATSONX_REGION=us-south
IBM_WATSONX_MODEL=ibm/granite-13b-chat-v2
IBM_WATSONX_API_URL=https://us-south.ml.cloud.ibm.com/ml/v1/text/generation
```

Replace `your_api_key_here` and `your_project_id_here` with your actual credentials.

## MCP Server Setup

### 1. Test the Server Locally

```bash
cd backend
npm start
```

You should see:

```
MCP Readiness Platform Server running on stdio
Server: mcp-readiness-platform v1.0.0
Tools available: 6
```

Press `Ctrl+C` to stop the server.

### 2. Verify Tool Registration

The server should register these tools:

1. ✅ simulate_token_expiry
2. ✅ simulate_gateway_failure
3. ✅ simulate_tool_timeout
4. ✅ simulate_invalid_audience
5. ✅ simulate_observability_gap
6. ✅ generate_go_no_go_decision

## Claude Desktop Integration

### Step 1: Locate Claude Desktop Config

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Update Configuration

Open the config file and add the MCP server:

```json
{
  "mcpServers": {
    "mcp-readiness-platform": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-readiness-platform/backend/server.js"
      ],
      "env": {
        "IBM_WATSONX_API_KEY": "${IBM_WATSONX_API_KEY}",
        "IBM_WATSONX_PROJECT_ID": "${IBM_WATSONX_PROJECT_ID}",
        "IBM_WATSONX_REGION": "us-south",
        "IBM_WATSONX_MODEL": "ibm/granite-13b-chat-v2"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/` with the actual path to your project.

### Step 3: Set Environment Variables

**macOS/Linux:**

Add to `~/.zshrc` or `~/.bashrc`:

```bash
export IBM_WATSONX_API_KEY="your_api_key_here"
export IBM_WATSONX_PROJECT_ID="your_project_id_here"
```

Then reload:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

**Windows:**

Set system environment variables:

```powershell
setx IBM_WATSONX_API_KEY "your_api_key_here"
setx IBM_WATSONX_PROJECT_ID "your_project_id_here"
```

### Step 4: Restart Claude Desktop

1. Quit Claude Desktop completely
2. Reopen Claude Desktop
3. The MCP server should now be available

### Step 5: Verify Integration

In Claude Desktop, you should see the MCP tools available. Try asking:

```
Can you list the available MCP tools?
```

You should see all 6 simulation tools listed.

## Testing the Server

### Test 1: Token Expiry Simulation

In Claude Desktop, ask:

```
Use the simulate_token_expiry tool to test this configuration:
{
  "server": {
    "name": "test-server",
    "version": "1.0.0",
    "transport": "https"
  },
  "oauth": {
    "enabled": true,
    "provider": "auth0",
    "clientId": "test-client-id-12345",
    "issuer": "https://auth.example.com",
    "audience": "https://api.example.com"
  }
}
```

### Test 2: Go/No-Go Decision

```
Use the generate_go_no_go_decision tool to analyze this configuration for production deployment:
{
  "server": {
    "name": "prod-server",
    "version": "1.0.0",
    "transport": "https"
  },
  "oauth": {
    "enabled": true,
    "provider": "auth0",
    "clientId": "prod-client-12345",
    "issuer": "https://auth.example.com",
    "audience": "https://api.example.com",
    "tokenEndpoint": "https://auth.example.com/oauth/token"
  },
  "gateway": {
    "subscribed": true,
    "tier": "professional",
    "rateLimits": {
      "requestsPerMinute": 1000,
      "burstSize": 100
    }
  },
  "monitoring": {
    "enabled": true,
    "tracing": true,
    "metrics": true,
    "logging": {
      "level": "info",
      "destination": "cloudwatch"
    }
  },
  "tools": [
    {
      "name": "data-processor",
      "registered": true,
      "timeout": 30000,
      "retryPolicy": {
        "maxRetries": 3,
        "backoff": "exponential"
      }
    }
  ]
}
```

### Test 3: All Simulation Tools

```
Run all simulation tools on this configuration and provide a comprehensive analysis.
```

## Troubleshooting

### Issue: Server Won't Start

**Symptom:** Error when running `npm start`

**Solutions:**

1. Check Node.js version:
   ```bash
   node --version  # Should be >= 18.0.0
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check for syntax errors:
   ```bash
   npm run lint
   ```

### Issue: Claude Desktop Can't Find Server

**Symptom:** MCP tools not available in Claude

**Solutions:**

1. Verify absolute path in config:
   ```bash
   pwd  # Run in backend directory
   ```

2. Check file permissions:
   ```bash
   chmod +x server.js
   ```

3. Test server manually:
   ```bash
   node server.js
   ```

4. Check Claude Desktop logs:
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

### Issue: IBM watsonx Authentication Failed

**Symptom:** LLM analysis returns errors

**Solutions:**

1. Verify API key:
   ```bash
   echo $IBM_WATSONX_API_KEY
   ```

2. Test API key with curl:
   ```bash
   curl -X GET "https://iam.cloud.ibm.com/identity/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=$IBM_WATSONX_API_KEY"
   ```

3. Check project ID in watsonx.ai dashboard

4. Verify region matches your instance

### Issue: Tools Return Validation Errors

**Symptom:** Tools fail with validation errors

**Solutions:**

1. Verify configuration format:
   ```json
   {
     "server": { ... },
     "oauth": { ... },
     "gateway": { ... }
   }
   ```

2. Check required fields in validation schema

3. Use sample configurations from `frontend/src/data/sampleConfigs.js`

### Issue: Slow LLM Responses

**Symptom:** Tools take long time to respond

**Solutions:**

1. Disable LLM for faster testing:
   ```json
   {
     "config": { ... },
     "useLLM": false
   }
   ```

2. Check IBM Cloud service status

3. Consider upgrading watsonx.ai plan

## Advanced Configuration

### Custom Model Selection

Edit `backend/integrations/ibmWatsonxOrchestrate.js`:

```javascript
const WATSONX_CONFIG = {
  model: 'ibm/granite-20b-multilingual',  // Larger model
  // or
  model: 'ibm/granite-13b-instruct-v2',   // Instruction-tuned
};
```

### Adjusting Timeout Settings

Edit `backend/server.js`:

```javascript
const SERVER_CONFIG = {
  timeout: 60000,  // 60 seconds
  maxRetries: 3
};
```

### Custom Validation Rules

Add rules in `frontend/src/utils/validationSchema.js`:

```javascript
export const ValidationRules = {
  // Add your custom rules
  customSection: {
    required: true,
    fields: { ... }
  }
};
```

## Production Deployment

### Security Checklist

- [ ] Store API keys in secure vault (not .env)
- [ ] Use environment-specific configurations
- [ ] Enable rate limiting
- [ ] Implement audit logging
- [ ] Use HTTPS for all endpoints
- [ ] Rotate API keys regularly

### Monitoring

1. Enable logging:
   ```javascript
   console.error('Tool execution:', toolName, 'Duration:', duration);
   ```

2. Track metrics:
   - Tool execution times
   - Success/failure rates
   - LLM response times
   - Error frequencies

3. Set up alerts for:
   - High error rates
   - Slow response times
   - API quota limits

## Support

- **Documentation**: See [backend/README.md](backend/README.md)
- **Architecture**: See [MCP_ARCHITECTURE.md](MCP_ARCHITECTURE.md)
- **Issues**: GitHub Issues
- **IBM watsonx**: [IBM Documentation](https://www.ibm.com/docs/en/watsonx-as-a-service)

## Next Steps

1. ✅ Complete setup and testing
2. ✅ Run sample configurations
3. ✅ Integrate with your CI/CD pipeline
4. ✅ Customize validation rules for your use case
5. ✅ Set up monitoring and alerts
6. ✅ Train team on using MCP tools

---

**Setup Complete!** 🎉

You now have a fully functional MCP server with IBM watsonx integration for intelligent configuration validation.