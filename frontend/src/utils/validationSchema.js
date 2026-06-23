// MCP Configuration Validation Schema
// Validates structure, required fields, and data types

export const ValidationRules = {
  // Server configuration rules
  server: {
    required: true,
    fields: {
      name: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9-_]+$/,
        message: 'Server name must be alphanumeric with hyphens/underscores'
      },
      version: {
        type: 'string',
        required: true,
        pattern: /^\d+\.\d+\.\d+$/,
        message: 'Version must follow semantic versioning (e.g., 1.0.0)'
      },
      transport: {
        type: 'string',
        required: true,
        enum: ['http', 'https', 'sse', 'stdio', 'websocket'],
        message: 'Transport must be one of: http, https, sse, stdio, websocket'
      },
      endpoint: {
        type: 'string',
        required: false,
        pattern: /^https?:\/\/.+/,
        message: 'Endpoint must be a valid HTTP/HTTPS URL'
      }
    }
  },

  // OAuth configuration rules
  oauth: {
    required: false,
    fields: {
      enabled: {
        type: 'boolean',
        required: true,
        message: 'OAuth enabled must be a boolean'
      },
      provider: {
        type: 'string',
        required: true,
        enum: ['auth0', 'okta', 'custom', 'azure-ad', 'google', 'github'],
        message: 'Provider must be a supported OAuth provider'
      },
      clientId: {
        type: 'string',
        required: true,
        minLength: 10,
        message: 'Client ID is required and must be at least 10 characters'
      },
      issuer: {
        type: 'string',
        required: true,
        pattern: /^https:\/\/.+/,
        message: 'Issuer must be a valid HTTPS URL'
      },
      audience: {
        type: 'string',
        required: true,
        pattern: /^https?:\/\/.+/,
        message: 'Audience must be a valid URL'
      },
      tokenEndpoint: {
        type: 'string',
        required: false,
        pattern: /^https:\/\/.+/,
        message: 'Token endpoint must be a valid HTTPS URL'
      },
      scopes: {
        type: 'array',
        required: false,
        itemType: 'string',
        message: 'Scopes must be an array of strings'
      }
    }
  },

  // Gateway configuration rules
  gateway: {
    required: false,
    fields: {
      subscribed: {
        type: 'boolean',
        required: true,
        message: 'Gateway subscribed must be a boolean'
      },
      tier: {
        type: 'string',
        required: false,
        enum: ['free', 'basic', 'professional', 'enterprise'],
        message: 'Tier must be one of: free, basic, professional, enterprise'
      },
      rateLimits: {
        type: 'object',
        required: false,
        fields: {
          requestsPerMinute: {
            type: 'number',
            required: true,
            min: 1,
            max: 10000,
            message: 'Requests per minute must be between 1 and 10000'
          },
          burstSize: {
            type: 'number',
            required: false,
            min: 1,
            max: 1000,
            message: 'Burst size must be between 1 and 1000'
          }
        }
      }
    }
  },

  // Tools configuration rules
  tools: {
    required: false,
    type: 'array',
    minItems: 0,
    maxItems: 50,
    itemSchema: {
      name: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9-_]+$/,
        message: 'Tool name must be alphanumeric with hyphens/underscores'
      },
      registered: {
        type: 'boolean',
        required: true,
        message: 'Tool registered must be a boolean'
      },
      timeout: {
        type: 'number',
        required: false,
        min: 1000,
        max: 300000,
        message: 'Timeout must be between 1000ms and 300000ms (5 minutes)'
      },
      retryPolicy: {
        type: 'object',
        required: false,
        fields: {
          maxRetries: {
            type: 'number',
            required: true,
            min: 0,
            max: 10,
            message: 'Max retries must be between 0 and 10'
          },
          backoff: {
            type: 'string',
            required: true,
            enum: ['linear', 'exponential', 'fixed'],
            message: 'Backoff must be one of: linear, exponential, fixed'
          }
        }
      }
    }
  },

  // Monitoring configuration rules
  monitoring: {
    required: false,
    fields: {
      enabled: {
        type: 'boolean',
        required: true,
        message: 'Monitoring enabled must be a boolean'
      },
      tracing: {
        type: 'boolean',
        required: false,
        message: 'Tracing must be a boolean'
      },
      metrics: {
        type: 'boolean',
        required: false,
        message: 'Metrics must be a boolean'
      },
      logging: {
        type: 'object',
        required: false,
        fields: {
          level: {
            type: 'string',
            required: true,
            enum: ['debug', 'info', 'warn', 'error'],
            message: 'Log level must be one of: debug, info, warn, error'
          },
          destination: {
            type: 'string',
            required: false,
            enum: ['console', 'file', 'cloudwatch', 'datadog', 'splunk'],
            message: 'Destination must be a supported logging destination'
          }
        }
      }
    }
  },

  // Security configuration rules
  security: {
    required: false,
    fields: {
      tlsVersion: {
        type: 'string',
        required: false,
        enum: ['1.2', '1.3'],
        message: 'TLS version must be 1.2 or 1.3'
      },
      certificateValidation: {
        type: 'boolean',
        required: false,
        message: 'Certificate validation must be a boolean'
      },
      ipWhitelist: {
        type: 'array',
        required: false,
        itemType: 'string',
        pattern: /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/,
        message: 'IP whitelist must contain valid IP addresses or CIDR blocks'
      }
    }
  }
};

// Validation error types
export const ValidationErrorTypes = {
  MISSING_REQUIRED: 'missing_required',
  INVALID_TYPE: 'invalid_type',
  INVALID_VALUE: 'invalid_value',
  INVALID_FORMAT: 'invalid_format',
  OUT_OF_RANGE: 'out_of_range',
  INVALID_ENUM: 'invalid_enum',
  PATTERN_MISMATCH: 'pattern_mismatch'
};

// Main validation function
export const validateConfig = (config) => {
  const errors = [];
  const warnings = [];

  if (!config || typeof config !== 'object') {
    return {
      valid: false,
      errors: [{
        type: ValidationErrorTypes.INVALID_TYPE,
        path: 'root',
        message: 'Configuration must be a valid JSON object'
      }],
      warnings: []
    };
  }

  // Validate each section
  Object.keys(ValidationRules).forEach(section => {
    const sectionRules = ValidationRules[section];
    const sectionData = config[section];

    // Check if required section is missing
    if (sectionRules.required && !sectionData) {
      errors.push({
        type: ValidationErrorTypes.MISSING_REQUIRED,
        path: section,
        message: `Required section '${section}' is missing`
      });
      return;
    }

    // Skip validation if section is optional and not provided
    if (!sectionData) return;

    // Validate array type sections (like tools)
    if (sectionRules.type === 'array') {
      if (!Array.isArray(sectionData)) {
        errors.push({
          type: ValidationErrorTypes.INVALID_TYPE,
          path: section,
          message: `'${section}' must be an array`
        });
        return;
      }

      // Validate array length
      if (sectionRules.minItems !== undefined && sectionData.length < sectionRules.minItems) {
        warnings.push({
          path: section,
          message: `'${section}' should have at least ${sectionRules.minItems} items`
        });
      }

      if (sectionRules.maxItems !== undefined && sectionData.length > sectionRules.maxItems) {
        errors.push({
          type: ValidationErrorTypes.OUT_OF_RANGE,
          path: section,
          message: `'${section}' cannot have more than ${sectionRules.maxItems} items`
        });
      }

      // Validate each item in array
      sectionData.forEach((item, index) => {
        const itemErrors = validateObject(item, sectionRules.itemSchema, `${section}[${index}]`);
        errors.push(...itemErrors);
      });
    } else {
      // Validate object type sections
      const sectionErrors = validateObject(sectionData, sectionRules.fields, section);
      errors.push(...sectionErrors);
    }
  });

  // Add warnings for best practices
  addBestPracticeWarnings(config, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// Validate object against field rules
const validateObject = (obj, fieldRules, path) => {
  const errors = [];

  if (!fieldRules) return errors;

  Object.keys(fieldRules).forEach(fieldName => {
    const rule = fieldRules[fieldName];
    const value = obj[fieldName];
    const fieldPath = `${path}.${fieldName}`;

    // Check required fields
    if (rule.required && (value === undefined || value === null)) {
      errors.push({
        type: ValidationErrorTypes.MISSING_REQUIRED,
        path: fieldPath,
        message: rule.message || `Required field '${fieldName}' is missing`
      });
      return;
    }

    // Skip validation if field is optional and not provided
    if (value === undefined || value === null) return;

    // Validate type
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (rule.type && actualType !== rule.type) {
      errors.push({
        type: ValidationErrorTypes.INVALID_TYPE,
        path: fieldPath,
        message: `'${fieldName}' must be of type ${rule.type}, got ${actualType}`
      });
      return;
    }

    // Validate string rules
    if (rule.type === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          type: ValidationErrorTypes.OUT_OF_RANGE,
          path: fieldPath,
          message: `'${fieldName}' must be at least ${rule.minLength} characters`
        });
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          type: ValidationErrorTypes.OUT_OF_RANGE,
          path: fieldPath,
          message: `'${fieldName}' must be at most ${rule.maxLength} characters`
        });
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          type: ValidationErrorTypes.PATTERN_MISMATCH,
          path: fieldPath,
          message: rule.message || `'${fieldName}' has invalid format`
        });
      }

      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({
          type: ValidationErrorTypes.INVALID_ENUM,
          path: fieldPath,
          message: rule.message || `'${fieldName}' must be one of: ${rule.enum.join(', ')}`
        });
      }
    }

    // Validate number rules
    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          type: ValidationErrorTypes.OUT_OF_RANGE,
          path: fieldPath,
          message: `'${fieldName}' must be at least ${rule.min}`
        });
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          type: ValidationErrorTypes.OUT_OF_RANGE,
          path: fieldPath,
          message: `'${fieldName}' must be at most ${rule.max}`
        });
      }
    }

    // Validate array rules
    if (rule.type === 'array') {
      if (rule.itemType) {
        value.forEach((item, index) => {
          const itemType = typeof item;
          if (itemType !== rule.itemType) {
            errors.push({
              type: ValidationErrorTypes.INVALID_TYPE,
              path: `${fieldPath}[${index}]`,
              message: `Array items must be of type ${rule.itemType}`
            });
          }

          if (rule.pattern && !rule.pattern.test(item)) {
            errors.push({
              type: ValidationErrorTypes.PATTERN_MISMATCH,
              path: `${fieldPath}[${index}]`,
              message: rule.message || `Array item has invalid format`
            });
          }
        });
      }
    }

    // Validate nested objects
    if (rule.type === 'object' && rule.fields) {
      const nestedErrors = validateObject(value, rule.fields, fieldPath);
      errors.push(...nestedErrors);
    }
  });

  return errors;
};

// Add best practice warnings
const addBestPracticeWarnings = (config, warnings) => {
  // Warn if OAuth is enabled but missing token endpoint
  if (config.oauth?.enabled && !config.oauth.tokenEndpoint) {
    warnings.push({
      path: 'oauth.tokenEndpoint',
      message: 'Token endpoint is recommended for OAuth token refresh'
    });
  }

  // Warn if monitoring is disabled
  if (config.monitoring?.enabled === false) {
    warnings.push({
      path: 'monitoring.enabled',
      message: 'Monitoring is recommended for production environments'
    });
  }

  // Warn if tools have high timeouts
  if (config.tools) {
    config.tools.forEach((tool, index) => {
      if (tool.timeout && tool.timeout > 60000) {
        warnings.push({
          path: `tools[${index}].timeout`,
          message: `Tool '${tool.name}' has a high timeout (${tool.timeout}ms). Consider reducing for better performance`
        });
      }

      if (!tool.retryPolicy) {
        warnings.push({
          path: `tools[${index}].retryPolicy`,
          message: `Tool '${tool.name}' should have a retry policy for better reliability`
        });
      }
    });
  }

  // Warn if security settings are missing
  if (!config.security) {
    warnings.push({
      path: 'security',
      message: 'Security configuration is recommended for production deployments'
    });
  }

  // Warn if using HTTP instead of HTTPS
  if (config.server?.transport === 'http') {
    warnings.push({
      path: 'server.transport',
      message: 'Consider using HTTPS for secure communication'
    });
  }

  // Warn if TLS version is not 1.3
  if (config.security?.tlsVersion && config.security.tlsVersion !== '1.3') {
    warnings.push({
      path: 'security.tlsVersion',
      message: 'TLS 1.3 is recommended for better security'
    });
  }
};

// Helper function to format validation results for display
export const formatValidationResults = (results) => {
  if (results.valid) {
    return {
      status: 'success',
      message: 'Configuration is valid',
      details: results.warnings.length > 0 
        ? `${results.warnings.length} warning(s) found` 
        : 'No issues found'
    };
  }

  return {
    status: 'error',
    message: `Configuration has ${results.errors.length} error(s)`,
    errors: results.errors.map(err => ({
      path: err.path,
      type: err.type,
      message: err.message
    })),
    warnings: results.warnings
  };
};

// Made with Bob
