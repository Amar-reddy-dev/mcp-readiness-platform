// Risk Detection Engine
// Identifies and categorizes risks in MCP configurations

export const RiskCategories = {
  AUTHENTICATION: 'authentication',
  NETWORK: 'network',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  OBSERVABILITY: 'observability',
  CONFIGURATION: 'configuration',
  RELIABILITY: 'reliability'
};

export const RiskSeverity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Risk detection rules
export const RiskRules = [
  // Authentication Risks
  {
    id: 'auth-001',
    category: RiskCategories.AUTHENTICATION,
    severity: RiskSeverity.CRITICAL,
    title: 'OAuth Not Configured',
    detect: (config) => !config.oauth || !config.oauth.enabled,
    probability: 0.95,
    impact: 'All authenticated requests will fail',
    description: 'OAuth authentication is not configured. Service will reject all requests requiring authentication.',
    mitigation: 'Configure OAuth with proper provider, clientId, issuer, and audience settings.'
  },
  {
    id: 'auth-002',
    category: RiskCategories.AUTHENTICATION,
    severity: RiskSeverity.HIGH,
    title: 'Missing Token Endpoint',
    detect: (config) => config.oauth?.enabled && !config.oauth.tokenEndpoint,
    probability: 0.42,
    impact: 'Token refresh will fail, causing authentication errors',
    description: 'OAuth is enabled but token endpoint is not configured. Token refresh operations will fail.',
    mitigation: 'Add tokenEndpoint to OAuth configuration for automatic token refresh.'
  },
  {
    id: 'auth-003',
    category: RiskCategories.AUTHENTICATION,
    severity: RiskSeverity.HIGH,
    title: 'Invalid OAuth Configuration',
    detect: (config) => config.oauth?.enabled && (!config.oauth.issuer || !config.oauth.audience),
    probability: 0.85,
    impact: 'Token validation will fail',
    description: 'OAuth issuer or audience is missing. Tokens cannot be properly validated.',
    mitigation: 'Configure both issuer and audience in OAuth settings.'
  },

  // Network Risks
  {
    id: 'net-001',
    category: RiskCategories.NETWORK,
    severity: RiskSeverity.CRITICAL,
    title: 'Gateway Not Subscribed',
    detect: (config) => config.gateway && !config.gateway.subscribed,
    probability: 1.0,
    impact: 'Service will be unreachable',
    description: 'Gateway subscription is not active. Service will not be accessible through the gateway.',
    mitigation: 'Subscribe to the MCP gateway and configure rate limits.'
  },
  {
    id: 'net-002',
    category: RiskCategories.NETWORK,
    severity: RiskSeverity.MEDIUM,
    title: 'No Rate Limits Configured',
    detect: (config) => config.gateway?.subscribed && !config.gateway.rateLimits,
    probability: 0.35,
    impact: 'May face throttling or service degradation',
    description: 'Rate limits are not configured. Service may be throttled unexpectedly.',
    mitigation: 'Configure appropriate rate limits based on your tier and expected load.'
  },
  {
    id: 'net-003',
    category: RiskCategories.NETWORK,
    severity: RiskSeverity.MEDIUM,
    title: 'Insecure Transport Protocol',
    detect: (config) => config.server?.transport === 'http',
    probability: 0.28,
    impact: 'Data transmitted without encryption',
    description: 'Using HTTP instead of HTTPS. Data will be transmitted without encryption.',
    mitigation: 'Switch to HTTPS or SSE transport for secure communication.'
  },

  // Performance Risks
  {
    id: 'perf-001',
    category: RiskCategories.PERFORMANCE,
    severity: RiskSeverity.HIGH,
    title: 'Tools Not Registered',
    detect: (config) => config.tools?.some(t => !t.registered),
    probability: 0.72,
    impact: 'Tool operations will fail',
    description: 'One or more tools are not registered. These tools will fail when invoked.',
    mitigation: 'Register all tools with the MCP server before deployment.'
  },
  {
    id: 'perf-002',
    category: RiskCategories.PERFORMANCE,
    severity: RiskSeverity.MEDIUM,
    title: 'Excessive Tool Timeouts',
    detect: (config) => config.tools?.some(t => t.timeout && t.timeout > 60000),
    probability: 0.31,
    impact: 'Slow response times and poor user experience',
    description: 'Some tools have timeouts exceeding 60 seconds. This will cause slow response times.',
    mitigation: 'Reduce tool timeouts to 30 seconds or less for better performance.'
  },
  {
    id: 'perf-003',
    category: RiskCategories.PERFORMANCE,
    severity: RiskSeverity.LOW,
    title: 'Missing Retry Policies',
    detect: (config) => config.tools?.some(t => !t.retryPolicy),
    probability: 0.25,
    impact: 'Transient failures will not be retried',
    description: 'Some tools lack retry policies. Transient failures will not be automatically retried.',
    mitigation: 'Configure retry policies with exponential backoff for all tools.'
  },

  // Security Risks
  {
    id: 'sec-001',
    category: RiskCategories.SECURITY,
    severity: RiskSeverity.HIGH,
    title: 'No Security Configuration',
    detect: (config) => !config.security,
    probability: 0.38,
    impact: 'Vulnerable to security attacks',
    description: 'Security configuration is missing. Service may be vulnerable to attacks.',
    mitigation: 'Add security configuration with TLS 1.3 and certificate validation.'
  },
  {
    id: 'sec-002',
    category: RiskCategories.SECURITY,
    severity: RiskSeverity.MEDIUM,
    title: 'Outdated TLS Version',
    detect: (config) => config.security?.tlsVersion && config.security.tlsVersion !== '1.3',
    probability: 0.22,
    impact: 'Using less secure encryption',
    description: 'TLS version is not 1.3. Using older, less secure encryption protocols.',
    mitigation: 'Upgrade to TLS 1.3 for better security.'
  },
  {
    id: 'sec-003',
    category: RiskCategories.SECURITY,
    severity: RiskSeverity.MEDIUM,
    title: 'Certificate Validation Disabled',
    detect: (config) => config.security && !config.security.certificateValidation,
    probability: 0.45,
    impact: 'Vulnerable to man-in-the-middle attacks',
    description: 'Certificate validation is disabled. Service is vulnerable to MITM attacks.',
    mitigation: 'Enable certificate validation in security settings.'
  },

  // Observability Risks
  {
    id: 'obs-001',
    category: RiskCategories.OBSERVABILITY,
    severity: RiskSeverity.MEDIUM,
    title: 'Monitoring Disabled',
    detect: (config) => !config.monitoring || !config.monitoring.enabled,
    probability: 0.45,
    impact: 'MTTR increases by 60%, difficult to debug issues',
    description: 'Monitoring is not enabled. Production issues will be difficult to detect and debug.',
    mitigation: 'Enable monitoring with tracing and metrics for better observability.'
  },
  {
    id: 'obs-002',
    category: RiskCategories.OBSERVABILITY,
    severity: RiskSeverity.LOW,
    title: 'Tracing Disabled',
    detect: (config) => config.monitoring?.enabled && !config.monitoring.tracing,
    probability: 0.22,
    impact: 'Difficult to trace request flows',
    description: 'Distributed tracing is disabled. Request flows will be difficult to trace.',
    mitigation: 'Enable tracing in monitoring configuration.'
  },
  {
    id: 'obs-003',
    category: RiskCategories.OBSERVABILITY,
    severity: RiskSeverity.LOW,
    title: 'No Production Logging',
    detect: (config) => config.monitoring?.enabled && 
      !['cloudwatch', 'datadog', 'splunk'].includes(config.monitoring.logging?.destination),
    probability: 0.18,
    impact: 'Logs may be lost or difficult to access',
    description: 'Logging destination is not configured for production. Logs may be lost.',
    mitigation: 'Configure production logging destination (CloudWatch, Datadog, or Splunk).'
  },

  // Configuration Risks
  {
    id: 'conf-001',
    category: RiskCategories.CONFIGURATION,
    severity: RiskSeverity.HIGH,
    title: 'Invalid Server Configuration',
    detect: (config) => !config.server || !config.server.name || !config.server.version,
    probability: 0.88,
    impact: 'Server cannot start or register',
    description: 'Server configuration is incomplete. Server may fail to start or register.',
    mitigation: 'Complete server configuration with name, version, and transport.'
  },
  {
    id: 'conf-002',
    category: RiskCategories.CONFIGURATION,
    severity: RiskSeverity.MEDIUM,
    title: 'No Tools Configured',
    detect: (config) => !config.tools || config.tools.length === 0,
    probability: 0.55,
    impact: 'No functionality available',
    description: 'No tools are configured. Service will have no functionality.',
    mitigation: 'Configure at least one tool with proper registration and timeout settings.'
  }
];

// Detect all risks in a configuration
export const detectRisks = (config) => {
  const detectedRisks = [];

  RiskRules.forEach(rule => {
    try {
      if (rule.detect(config)) {
        detectedRisks.push({
          id: rule.id,
          category: rule.category,
          severity: rule.severity,
          title: rule.title,
          probability: `${Math.round(rule.probability * 100)}%`,
          impact: rule.impact,
          description: rule.description,
          mitigation: rule.mitigation,
          detectedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      // Rule detection failed, skip this rule
      console.warn(`Risk detection failed for rule ${rule.id}:`, error.message);
    }
  });

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  detectedRisks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return detectedRisks;
};

// Get risk summary
export const getRiskSummary = (risks) => {
  const summary = {
    total: risks.length,
    critical: risks.filter(r => r.severity === RiskSeverity.CRITICAL).length,
    high: risks.filter(r => r.severity === RiskSeverity.HIGH).length,
    medium: risks.filter(r => r.severity === RiskSeverity.MEDIUM).length,
    low: risks.filter(r => r.severity === RiskSeverity.LOW).length,
    byCategory: {}
  };

  // Group by category
  Object.values(RiskCategories).forEach(category => {
    summary.byCategory[category] = risks.filter(r => r.category === category).length;
  });

  return summary;
};

// Calculate risk score (0-100, lower is better)
export const calculateRiskScore = (risks) => {
  let score = 0;

  risks.forEach(risk => {
    switch (risk.severity) {
      case RiskSeverity.CRITICAL:
        score += 25;
        break;
      case RiskSeverity.HIGH:
        score += 15;
        break;
      case RiskSeverity.MEDIUM:
        score += 8;
        break;
      case RiskSeverity.LOW:
        score += 3;
        break;
    }
  });

  return Math.min(100, score);
};

// Get risk level interpretation
export const getRiskLevel = (riskScore) => {
  if (riskScore === 0) return { level: 'none', label: 'No Risks', color: 'success' };
  if (riskScore <= 10) return { level: 'low', label: 'Low Risk', color: 'success' };
  if (riskScore <= 30) return { level: 'medium', label: 'Medium Risk', color: 'warning' };
  if (riskScore <= 60) return { level: 'high', label: 'High Risk', color: 'danger' };
  return { level: 'critical', label: 'Critical Risk', color: 'danger' };
};

// Generate risk report
export const generateRiskReport = (config) => {
  const risks = detectRisks(config);
  const summary = getRiskSummary(risks);
  const riskScore = calculateRiskScore(risks);
  const riskLevel = getRiskLevel(riskScore);

  return {
    risks,
    summary,
    riskScore,
    riskLevel,
    timestamp: new Date().toISOString(),
    recommendations: risks.map(risk => ({
      priority: risk.severity,
      title: risk.title,
      action: risk.mitigation,
      impact: risk.impact
    }))
  };
};

// Made with Bob
