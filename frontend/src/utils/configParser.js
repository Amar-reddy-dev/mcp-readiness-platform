// Configuration Parser
// Parses and normalizes MCP configurations for validation and analysis

export class ConfigParser {
  constructor(config) {
    this.rawConfig = config;
    this.parsedConfig = null;
    this.metadata = {
      parsedAt: new Date().toISOString(),
      configSize: JSON.stringify(config).length,
      sections: []
    };
  }

  parse() {
    try {
      // Normalize configuration structure
      this.parsedConfig = {
        server: this.parseServer(),
        oauth: this.parseOAuth(),
        gateway: this.parseGateway(),
        tools: this.parseTools(),
        monitoring: this.parseMonitoring(),
        security: this.parseSecurity()
      };

      // Extract metadata
      this.metadata.sections = Object.keys(this.parsedConfig).filter(
        key => this.parsedConfig[key] !== null
      );

      return {
        success: true,
        config: this.parsedConfig,
        metadata: this.metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata: this.metadata
      };
    }
  }

  parseServer() {
    const server = this.rawConfig.server;
    if (!server) return null;

    return {
      name: server.name || null,
      version: server.version || null,
      transport: server.transport || null,
      endpoint: server.endpoint || null,
      // Derived properties
      isSecure: server.transport === 'https' || server.transport === 'sse',
      hasEndpoint: !!server.endpoint
    };
  }

  parseOAuth() {
    const oauth = this.rawConfig.oauth;
    if (!oauth) return null;

    return {
      enabled: oauth.enabled || false,
      provider: oauth.provider || null,
      clientId: oauth.clientId || null,
      issuer: oauth.issuer || null,
      audience: oauth.audience || null,
      tokenEndpoint: oauth.tokenEndpoint || null,
      scopes: oauth.scopes || [],
      // Derived properties
      hasTokenRefresh: !!oauth.tokenEndpoint,
      scopeCount: (oauth.scopes || []).length,
      isFullyConfigured: !!(oauth.enabled && oauth.clientId && oauth.issuer && oauth.audience)
    };
  }

  parseGateway() {
    const gateway = this.rawConfig.gateway;
    if (!gateway) return null;

    return {
      subscribed: gateway.subscribed || false,
      tier: gateway.tier || null,
      rateLimits: gateway.rateLimits ? {
        requestsPerMinute: gateway.rateLimits.requestsPerMinute || null,
        burstSize: gateway.rateLimits.burstSize || null
      } : null,
      // Derived properties
      hasRateLimits: !!gateway.rateLimits,
      isPremiumTier: gateway.tier === 'professional' || gateway.tier === 'enterprise'
    };
  }

  parseTools() {
    const tools = this.rawConfig.tools;
    if (!tools || !Array.isArray(tools)) return null;

    return tools.map(tool => ({
      name: tool.name || null,
      registered: tool.registered || false,
      timeout: tool.timeout || null,
      retryPolicy: tool.retryPolicy ? {
        maxRetries: tool.retryPolicy.maxRetries || 0,
        backoff: tool.retryPolicy.backoff || null
      } : null,
      // Derived properties
      hasTimeout: !!tool.timeout,
      hasRetryPolicy: !!tool.retryPolicy,
      timeoutSeconds: tool.timeout ? tool.timeout / 1000 : null,
      isOptimized: tool.timeout && tool.timeout <= 30000 && tool.retryPolicy
    }));
  }

  parseMonitoring() {
    const monitoring = this.rawConfig.monitoring;
    if (!monitoring) return null;

    return {
      enabled: monitoring.enabled || false,
      tracing: monitoring.tracing || false,
      metrics: monitoring.metrics || false,
      logging: monitoring.logging ? {
        level: monitoring.logging.level || null,
        destination: monitoring.logging.destination || null
      } : null,
      // Derived properties
      hasLogging: !!monitoring.logging,
      hasFullObservability: monitoring.enabled && monitoring.tracing && monitoring.metrics,
      observabilityScore: this.calculateObservabilityScore(monitoring)
    };
  }

  parseSecurity() {
    const security = this.rawConfig.security;
    if (!security) return null;

    return {
      tlsVersion: security.tlsVersion || null,
      certificateValidation: security.certificateValidation || false,
      ipWhitelist: security.ipWhitelist || [],
      // Derived properties
      hasTLS: !!security.tlsVersion,
      hasIPWhitelist: !!(security.ipWhitelist && security.ipWhitelist.length > 0),
      isModernTLS: security.tlsVersion === '1.3',
      securityScore: this.calculateSecurityScore(security)
    };
  }

  calculateObservabilityScore(monitoring) {
    let score = 0;
    if (monitoring.enabled) score += 40;
    if (monitoring.tracing) score += 30;
    if (monitoring.metrics) score += 30;
    return score;
  }

  calculateSecurityScore(security) {
    let score = 0;
    if (security.tlsVersion) score += 40;
    if (security.tlsVersion === '1.3') score += 20;
    if (security.certificateValidation) score += 20;
    if (security.ipWhitelist && security.ipWhitelist.length > 0) score += 20;
    return score;
  }

  // Extract configuration statistics
  getStatistics() {
    if (!this.parsedConfig) {
      throw new Error('Configuration not parsed yet');
    }

    return {
      totalSections: this.metadata.sections.length,
      toolCount: this.parsedConfig.tools ? this.parsedConfig.tools.length : 0,
      registeredTools: this.parsedConfig.tools 
        ? this.parsedConfig.tools.filter(t => t.registered).length 
        : 0,
      hasOAuth: !!this.parsedConfig.oauth?.enabled,
      hasMonitoring: !!this.parsedConfig.monitoring?.enabled,
      hasSecurity: !!this.parsedConfig.security,
      isGatewaySubscribed: !!this.parsedConfig.gateway?.subscribed,
      observabilityScore: this.parsedConfig.monitoring?.observabilityScore || 0,
      securityScore: this.parsedConfig.security?.securityScore || 0
    };
  }

  // Get configuration complexity level
  getComplexityLevel() {
    const stats = this.getStatistics();
    let complexity = 0;

    complexity += stats.totalSections * 10;
    complexity += stats.toolCount * 5;
    if (stats.hasOAuth) complexity += 20;
    if (stats.hasMonitoring) complexity += 15;
    if (stats.hasSecurity) complexity += 15;

    if (complexity < 50) return 'simple';
    if (complexity < 100) return 'moderate';
    return 'complex';
  }

  // Validate parsed configuration structure
  validateStructure() {
    const errors = [];

    if (!this.parsedConfig.server) {
      errors.push('Server configuration is required');
    }

    if (this.parsedConfig.oauth?.enabled && !this.parsedConfig.oauth.isFullyConfigured) {
      errors.push('OAuth is enabled but not fully configured');
    }

    if (this.parsedConfig.tools && this.parsedConfig.tools.length === 0) {
      errors.push('No tools configured');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Helper function to parse configuration
export const parseConfig = (config) => {
  const parser = new ConfigParser(config);
  return parser.parse();
};

// Helper function to get configuration insights
export const getConfigInsights = (config) => {
  const parser = new ConfigParser(config);
  parser.parse();
  
  return {
    statistics: parser.getStatistics(),
    complexity: parser.getComplexityLevel(),
    structure: parser.validateStructure()
  };
};

// Made with Bob
