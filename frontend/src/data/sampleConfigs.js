// Sample MCP configurations for testing
export const sampleConfigs = {
  healthy: {
    name: "Healthy Production Config",
    config: {
      "server": {
        "name": "production-mcp-server",
        "version": "2.1.0",
        "transport": "sse",
        "endpoint": "https://api.example.com/mcp"
      },
      "oauth": {
        "enabled": true,
        "provider": "auth0",
        "clientId": "prod_client_abc123",
        "issuer": "https://auth.example.com",
        "audience": "https://api.example.com",
        "tokenEndpoint": "https://auth.example.com/oauth/token",
        "scopes": ["read:data", "write:data"]
      },
      "gateway": {
        "subscribed": true,
        "tier": "enterprise",
        "rateLimits": {
          "requestsPerMinute": 1000,
          "burstSize": 100
        }
      },
      "tools": [
        {
          "name": "data_processor",
          "registered": true,
          "timeout": 30000,
          "retryPolicy": {
            "maxRetries": 3,
            "backoff": "exponential"
          }
        },
        {
          "name": "analytics_engine",
          "registered": true,
          "timeout": 45000,
          "retryPolicy": {
            "maxRetries": 2,
            "backoff": "linear"
          }
        }
      ],
      "monitoring": {
        "enabled": true,
        "tracing": true,
        "metrics": true,
        "logging": {
          "level": "info",
          "destination": "cloudwatch"
        }
      },
      "security": {
        "tlsVersion": "1.3",
        "certificateValidation": true,
        "ipWhitelist": ["10.0.0.0/8"]
      }
    }
  },
  broken: {
    name: "Problematic Config",
    config: {
      "server": {
        "name": "test-mcp-server",
        "version": "1.0.0",
        "transport": "http"
      },
      "oauth": {
        "enabled": true,
        "provider": "custom",
        "clientId": "test_client"
      },
      "gateway": {
        "subscribed": false
      },
      "tools": [
        {
          "name": "slow_processor",
          "registered": false,
          "timeout": 120000
        }
      ],
      "monitoring": {
        "enabled": false
      }
    }
  },
  minimal: {
    name: "Minimal Config",
    config: {
      "server": {
        "name": "basic-server",
        "version": "1.0.0",
        "transport": "stdio"
      },
      "tools": [
        {
          "name": "simple_tool",
          "registered": true
        }
      ]
    }
  }
};

// Made with Bob
