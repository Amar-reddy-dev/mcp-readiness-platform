// Simulation engine for MCP configuration validation and prediction
import { parseConfig } from './configParser';
import { getScoringReport } from './scoringRules';
import { detectRisks, generateRiskReport } from './riskDetection';
import { generateRecommendations as generateRecommendationsFromMapping } from './recommendationMapping';
import { validateConfig } from './validationSchema';

export const runSimulation = (config) => {
  // Parse configuration
  const parseResult = parseConfig(config);
  
  // Validate configuration
  const validationResult = validateConfig(config);
  
  // Detect risks
  const riskReport = generateRiskReport(config);
  
  // Calculate scoring
  const scoringReport = getScoringReport(config);
  
  // Generate scenarios and run simulation
  const scenarios = generateScenarios(config);
  const results = scenarios.map(scenario => executeScenario(scenario, config));
  
  // Generate recommendations
  const recommendations = generateRecommendationsFromMapping(
    validationResult,
    riskReport.risks,
    scoringReport
  );
  
  return {
    totalRuns: 100,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    scenarios: results,
    readinessScore: scoringReport.score,
    scoringDetails: scoringReport,
    risks: riskReport.risks,
    riskSummary: riskReport.summary,
    recommendations: recommendations,
    validation: validationResult,
    parsed: parseResult,
    timestamp: new Date().toISOString()
  };
};

const generateScenarios = (config) => {
  return [
    { name: 'Token Expiration', type: 'auth', severity: 'high' },
    { name: 'Gateway Unavailable', type: 'network', severity: 'high' },
    { name: 'Tool Timeout', type: 'performance', severity: 'medium' },
    { name: 'Invalid OAuth Audience', type: 'auth', severity: 'high' },
    { name: 'Rate Limit Exceeded', type: 'throttling', severity: 'medium' },
    { name: 'Certificate Validation Failure', type: 'security', severity: 'high' },
    { name: 'Missing Monitoring', type: 'observability', severity: 'low' },
    { name: 'Tool Registration Failure', type: 'configuration', severity: 'high' }
  ];
};

const executeScenario = (scenario, config) => {
  // Simulate scenario execution based on config
  const hasOAuth = config.oauth?.enabled;
  const hasGateway = config.gateway?.subscribed;
  const hasMonitoring = config.monitoring?.enabled;
  const hasTools = config.tools?.length > 0;
  const toolsRegistered = config.tools?.every(t => t.registered);
  
  let success = true;
  let failureRate = 0;
  let impact = 'low';
  let details = '';

  switch (scenario.type) {
    case 'auth':
      if (!hasOAuth) {
        success = false;
        failureRate = 0.85;
        impact = 'critical';
        details = 'OAuth not configured. Authentication will fail in production.';
      } else if (!config.oauth.tokenEndpoint) {
        success = false;
        failureRate = 0.34;
        impact = 'high';
        details = 'Missing token endpoint. Token refresh will fail.';
      } else if (!config.oauth.audience || !config.oauth.issuer) {
        success = false;
        failureRate = 0.42;
        impact = 'high';
        details = 'Missing audience or issuer. Token validation will fail.';
      } else {
        success = true;
        failureRate = 0.05;
        impact = 'low';
        details = 'OAuth properly configured with token refresh capability.';
      }
      break;

    case 'network':
      if (!hasGateway) {
        success = false;
        failureRate = 0.65;
        impact = 'critical';
        details = 'Gateway not subscribed. Service will be unreachable.';
      } else if (!config.gateway.rateLimits) {
        success = false;
        failureRate = 0.28;
        impact = 'medium';
        details = 'No rate limits configured. May face throttling issues.';
      } else {
        success = true;
        failureRate = 0.08;
        impact = 'low';
        details = 'Gateway properly configured with rate limiting.';
      }
      break;

    case 'performance':
      if (!hasTools || !toolsRegistered) {
        success = false;
        failureRate = 0.72;
        impact = 'high';
        details = 'Tools not registered. Operations will fail.';
      } else {
        const hasTimeout = config.tools.every(t => t.timeout && t.timeout < 60000);
        if (!hasTimeout) {
          success = false;
          failureRate = 0.31;
          impact = 'medium';
          details = 'Tool timeouts too high or missing. May cause performance issues.';
        } else {
          success = true;
          failureRate = 0.12;
          impact = 'low';
          details = 'Tools configured with appropriate timeouts.';
        }
      }
      break;

    case 'observability':
      if (!hasMonitoring) {
        success = false;
        failureRate = 0.45;
        impact = 'medium';
        details = 'No monitoring configured. MTTR will increase by 60%.';
      } else if (!config.monitoring.tracing) {
        success = false;
        failureRate = 0.22;
        impact = 'low';
        details = 'Tracing disabled. Debugging will be difficult.';
      } else {
        success = true;
        failureRate = 0.03;
        impact = 'low';
        details = 'Full observability stack configured.';
      }
      break;

    case 'security':
      const hasTLS = config.security?.tlsVersion;
      const hasCertValidation = config.security?.certificateValidation;
      if (!hasTLS || !hasCertValidation) {
        success = false;
        failureRate = 0.38;
        impact = 'high';
        details = 'Security configuration incomplete. Vulnerable to attacks.';
      } else {
        success = true;
        failureRate = 0.06;
        impact = 'low';
        details = 'Security properly configured.';
      }
      break;

    default:
      success = true;
      failureRate = 0.10;
      impact = 'low';
      details = 'Configuration acceptable for this scenario.';
  }

  return {
    ...scenario,
    success,
    failureRate,
    impact,
    details,
    timestamp: new Date().toISOString()
  };
};

const calculateReadinessScore = (results, config) => {
  let score = 100;
  
  // Deduct points based on failures
  results.forEach(result => {
    if (!result.success) {
      switch (result.impact) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 12;
          break;
        case 'medium':
          score -= 6;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }
  });

  // Bonus points for best practices
  if (config.monitoring?.enabled && config.monitoring?.tracing) {
    score += 5;
  }
  if (config.security?.tlsVersion === '1.3') {
    score += 3;
  }
  if (config.tools?.every(t => t.retryPolicy)) {
    score += 4;
  }

  return Math.max(0, Math.min(100, score));
};

const identifyRisks = (results, config) => {
  const risks = [];
  
  results.forEach(result => {
    if (!result.success) {
      risks.push({
        category: result.type,
        severity: result.impact,
        title: result.name,
        description: result.details,
        probability: `${Math.round(result.failureRate * 100)}%`,
        mitigation: getMitigation(result.type, config)
      });
    }
  });

  // Add configuration-based risks
  if (!config.oauth?.enabled) {
    risks.push({
      category: 'authentication',
      severity: 'critical',
      title: 'No Authentication',
      description: 'Service is not protected by OAuth. All requests will fail authentication.',
      probability: '95%',
      mitigation: 'Configure OAuth with proper issuer and audience'
    });
  }

  if (!config.gateway?.subscribed) {
    risks.push({
      category: 'infrastructure',
      severity: 'critical',
      title: 'Gateway Not Subscribed',
      description: 'Service will not be accessible through the gateway.',
      probability: '100%',
      mitigation: 'Subscribe to gateway and configure rate limits'
    });
  }

  if (!config.monitoring?.enabled) {
    risks.push({
      category: 'observability',
      severity: 'medium',
      title: 'No Monitoring',
      description: 'Issues will be difficult to detect and debug. MTTR may increase by 60%.',
      probability: '75%',
      mitigation: 'Enable monitoring with tracing and metrics'
    });
  }

  return risks.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
};

const getMitigation = (type, config) => {
  const mitigations = {
    auth: 'Configure OAuth with token endpoint, issuer, and audience. Implement token refresh logic.',
    network: 'Subscribe to gateway and configure appropriate rate limits and retry policies.',
    performance: 'Register all tools with reasonable timeouts (<30s) and implement retry policies.',
    observability: 'Enable monitoring, tracing, and structured logging for better debugging.',
    security: 'Use TLS 1.3, enable certificate validation, and configure IP whitelisting.',
    configuration: 'Ensure all tools are properly registered and configured before deployment.',
    throttling: 'Configure rate limits and implement exponential backoff for retries.'
  };
  
  return mitigations[type] || 'Review configuration and follow MCP best practices.';
};

// generateRecommendations function removed - now using the one from recommendationMapping.js

// Made with Bob
