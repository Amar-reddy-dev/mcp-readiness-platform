# MCP Configuration Validation Schema

## Overview

The validation schema provides comprehensive validation for MCP (Model Context Protocol) configurations. It ensures that configurations meet structural requirements, follow best practices, and are ready for production deployment.

## Features

- **Structural Validation**: Validates JSON structure and required fields
- **Type Checking**: Ensures correct data types for all fields
- **Format Validation**: Validates URLs, version numbers, IP addresses, etc.
- **Range Validation**: Checks numeric values are within acceptable ranges
- **Enum Validation**: Ensures values match predefined options
- **Best Practice Warnings**: Provides recommendations for optimal configuration

## Validation Rules

### Server Configuration

**Required**: Yes

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Alphanumeric with hyphens/underscores, 1-100 chars |
| `version` | string | Yes | Semantic versioning (e.g., 1.0.0) |
| `transport` | string | Yes | One of: http, https, sse, stdio, websocket |
| `endpoint` | string | No | Valid HTTP/HTTPS URL |

**Example:**
```json
{
  "server": {
    "name": "my-mcp-server",
    "version": "1.0.0",
    "transport": "https",
    "endpoint": "https://api.example.com/mcp"
  }
}
```

### OAuth Configuration

**Required**: No (but recommended for production)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `enabled` | boolean | Yes | true or false |
| `provider` | string | Yes | One of: auth0, okta, custom, azure-ad, google, github |
| `clientId` | string | Yes | Minimum 10 characters |
| `issuer` | string | Yes | Valid HTTPS URL |
| `audience` | string | Yes | Valid URL |
| `tokenEndpoint` | string | No | Valid HTTPS URL (recommended) |
| `scopes` | array | No | Array of strings |

**Example:**
```json
{
  "oauth": {
    "enabled": true,
    "provider": "auth0",
    "clientId": "your_client_id_here",
    "issuer": "https://your-domain.auth0.com",
    "audience": "https://api.your-domain.com",
    "tokenEndpoint": "https://your-domain.auth0.com/oauth/token",
    "scopes": ["read:data", "write:data"]
  }
}
```

### Gateway Configuration

**Required**: No

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `subscribed` | boolean | Yes | true or false |
| `tier` | string | No | One of: free, basic, professional, enterprise |
| `rateLimits.requestsPerMinute` | number | No | 1-10000 |
| `rateLimits.burstSize` | number | No | 1-1000 |

**Example:**
```json
{
  "gateway": {
    "subscribed": true,
    "tier": "enterprise",
    "rateLimits": {
      "requestsPerMinute": 1000,
      "burstSize": 100
    }
  }
}
```

### Tools Configuration

**Required**: No

**Type**: Array of tool objects (max 50 items)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Alphanumeric with hyphens/underscores, 1-100 chars |
| `registered` | boolean | Yes | true or false |
| `timeout` | number | No | 1000-300000 ms (1s-5min) |
| `retryPolicy.maxRetries` | number | No | 0-10 |
| `retryPolicy.backoff` | string | No | One of: linear, exponential, fixed |

**Example:**
```json
{
  "tools": [
    {
      "name": "data_processor",
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

### Monitoring Configuration

**Required**: No (but strongly recommended)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `enabled` | boolean | Yes | true or false |
| `tracing` | boolean | No | true or false |
| `metrics` | boolean | No | true or false |
| `logging.level` | string | No | One of: debug, info, warn, error |
| `logging.destination` | string | No | One of: console, file, cloudwatch, datadog, splunk |

**Example:**
```json
{
  "monitoring": {
    "enabled": true,
    "tracing": true,
    "metrics": true,
    "logging": {
      "level": "info",
      "destination": "cloudwatch"
    }
  }
}
```

### Security Configuration

**Required**: No (but recommended for production)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `tlsVersion` | string | No | One of: 1.2, 1.3 |
| `certificateValidation` | boolean | No | true or false |
| `ipWhitelist` | array | No | Array of valid IP addresses or CIDR blocks |

**Example:**
```json
{
  "security": {
    "tlsVersion": "1.3",
    "certificateValidation": true,
    "ipWhitelist": ["10.0.0.0/8", "192.168.1.0/24"]
  }
}
```

## Validation Error Types

| Type | Description |
|------|-------------|
| `missing_required` | A required field is missing |
| `invalid_type` | Field has wrong data type |
| `invalid_value` | Field value is not acceptable |
| `invalid_format` | Field format doesn't match pattern |
| `out_of_range` | Numeric value outside acceptable range |
| `invalid_enum` | Value not in allowed enum list |
| `pattern_mismatch` | String doesn't match required pattern |

## Best Practice Warnings

The validator provides warnings for configurations that are valid but not optimal:

1. **Missing Token Endpoint**: OAuth enabled without token endpoint
2. **Monitoring Disabled**: No monitoring in production
3. **High Timeouts**: Tool timeouts exceeding 60 seconds
4. **Missing Retry Policies**: Tools without retry configuration
5. **Missing Security**: No security configuration
6. **HTTP Transport**: Using HTTP instead of HTTPS
7. **Old TLS Version**: Using TLS 1.2 instead of 1.3

## Usage

### Basic Validation

```javascript
import { validateConfig } from './utils/validationSchema';

const config = {
  // your configuration
};

const results = validateConfig(config);

if (results.valid) {
  console.log('Configuration is valid!');
  if (results.warnings.length > 0) {
    console.log('Warnings:', results.warnings);
  }
} else {
  console.error('Validation errors:', results.errors);
}
```

### Validation Results Structure

```javascript
{
  valid: boolean,           // Overall validation status
  errors: [                 // Array of validation errors
    {
      type: string,         // Error type
      path: string,         // Field path (e.g., "oauth.clientId")
      message: string       // Human-readable error message
    }
  ],
  warnings: [               // Array of best practice warnings
    {
      path: string,         // Field path
      message: string       // Warning message
    }
  ]
}
```

## Integration with UI

The validation schema is integrated with the ConfigUpload component:

1. **Automatic Validation**: Runs before simulation
2. **Manual Validation**: "Validate Configuration" button
3. **Visual Feedback**: ValidationResults component displays errors/warnings
4. **Blocking**: Invalid configurations cannot run readiness checks

## Examples

### Valid Configuration

```json
{
  "server": {
    "name": "production-server",
    "version": "2.0.0",
    "transport": "https",
    "endpoint": "https://api.example.com"
  },
  "oauth": {
    "enabled": true,
    "provider": "auth0",
    "clientId": "abc123def456",
    "issuer": "https://auth.example.com",
    "audience": "https://api.example.com",
    "tokenEndpoint": "https://auth.example.com/oauth/token"
  },
  "gateway": {
    "subscribed": true,
    "tier": "enterprise"
  },
  "monitoring": {
    "enabled": true,
    "tracing": true
  }
}
```

**Result**: ✅ Valid with 0 warnings

### Configuration with Warnings

```json
{
  "server": {
    "name": "test-server",
    "version": "1.0.0",
    "transport": "http"
  },
  "monitoring": {
    "enabled": false
  }
}
```

**Result**: ✅ Valid with 2 warnings
- Consider using HTTPS for secure communication
- Monitoring is recommended for production environments

### Invalid Configuration

```json
{
  "server": {
    "name": "my server",  // Invalid: contains space
    "version": "1.0",     // Invalid: not semantic versioning
    "transport": "ftp"    // Invalid: not in enum
  },
  "oauth": {
    "enabled": true,
    "clientId": "short"   // Invalid: too short
  }
}
```

**Result**: ❌ Invalid with 4 errors

## Testing

The validation schema includes comprehensive test coverage:

```javascript
// Test valid configuration
const validConfig = { /* ... */ };
const result = validateConfig(validConfig);
expect(result.valid).toBe(true);

// Test invalid configuration
const invalidConfig = { /* ... */ };
const result = validateConfig(invalidConfig);
expect(result.valid).toBe(false);
expect(result.errors.length).toBeGreaterThan(0);
```

## Future Enhancements

- [ ] Custom validation rules via plugins
- [ ] Schema versioning support
- [ ] JSON Schema export
- [ ] OpenAPI specification generation
- [ ] Validation rule documentation generator
- [ ] Performance optimization for large configs
- [ ] Async validation for external checks

## Contributing

To add new validation rules:

1. Update `ValidationRules` in `validationSchema.js`
2. Add corresponding tests
3. Update this documentation
4. Add examples to sample configs

---

**Last Updated**: 2026-06-22