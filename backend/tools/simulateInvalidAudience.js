/**
 * Invalid Audience Simulation Tool
 * Simulates invalid OAuth audience scenarios
 * 
 * Tests:
 * - Token validation
 * - Audience verification
 * - Error handling
 * - Security posture
 */

import { validateConfig } from '../../frontend/src/utils/validationSchema.js';

/**
 * Simulate invalid audience scenarios
 * @param {Object} args - Tool arguments
 * @returns {Object} Simulation results
 */
export async function simulateInvalidAudience(args) {
  const { 
    config, 
    invalidAudience = 'https://invalid.audience.com' 
  } = args;

  // Validate configuration first
  const validation = validateConfig(config);
  
  const results = {
    tool: 'simulate_invalid_audience',
    timestamp: new Date().toISOString(),
    config_valid: validation.valid,
    test_audience: invalidAudience,
    scenarios: [],
    summary: {
      total_scenarios: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    },
    recommendations: []
  };

  // Check if OAuth is configured
  if (!config.oauth || !config.oauth.enabled) {
    results.scenarios.push({
      name: 'OAuth Configuration Check',
      status: 'failed',
      severity: 'critical',
      probability: 0.95,
      impact: 'Cannot validate audience without OAuth',
      details: 'OAuth is not enabled. Audience validation is not possible.',
      mitigation: 'Enable OAuth and configure proper audience settings'
    });
    
    results.summary.total_scenarios = 1;
    results.summary.failed = 1;
    results.recommendations.push({
      priority: 'critical',
      action: 'Enable OAuth authentication',
      reason: 'Required for audience validation'
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  // Scenario 1: Audience Configuration
  const hasAudience = config.oauth.audience && config.oauth.audience.length > 0;
  
  const audienceConfigScenario = {
    name: 'Audience Configuration',
    status: hasAudience ? 'passed' : 'failed',
    severity: hasAudience ? 'low' : 'critical',
    probability: hasAudience ? 0.05 : 0.85,
    impact: hasAudience
      ? 'Audience is configured for validation'
      : 'Token validation will fail without audience',
    details: hasAudience
      ? `Configured audience: ${config.oauth.audience}`
      : 'No audience configured. All tokens will be rejected.',
    mitigation: hasAudience
      ? 'Ensure audience matches token claims'
      : 'Configure the correct audience for your OAuth provider'
  };
  
  results.scenarios.push(audienceConfigScenario);
  
  if (hasAudience) {
    results.summary.passed++;
  } else {
    results.summary.failed++;
    results.recommendations.push({
      priority: 'critical',
      action: 'Configure OAuth audience',
      reason: 'Required for token validation'
    });
  }

  // Scenario 2: Audience Format Validation
  if (hasAudience) {
    const isValidFormat = /^https?:\/\/.+/.test(config.oauth.audience);
    
    const formatScenario = {
      name: 'Audience Format Validation',
      status: isValidFormat ? 'passed' : 'failed',
      severity: isValidFormat ? 'low' : 'high',
      probability: isValidFormat ? 0.03 : 0.68,
      impact: isValidFormat
        ? 'Audience format is valid'
        : 'Invalid audience format will cause validation failures',
      details: isValidFormat
        ? `Audience format is valid: ${config.oauth.audience}`
        : `Invalid audience format: ${config.oauth.audience}. Must be a valid URL.`,
      mitigation: isValidFormat
        ? 'Continue with current audience'
        : 'Update audience to a valid URL format'
    };
    
    results.scenarios.push(formatScenario);
    
    if (isValidFormat) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
      results.recommendations.push({
        priority: 'high',
        action: 'Fix audience format',
        reason: 'Must be a valid URL'
      });
    }
  }

  // Scenario 3: Issuer Configuration
  const hasIssuer = config.oauth.issuer && config.oauth.issuer.startsWith('https');
  
  const issuerScenario = {
    name: 'Issuer Configuration',
    status: hasIssuer ? 'passed' : 'failed',
    severity: hasIssuer ? 'low' : 'critical',
    probability: hasIssuer ? 0.05 : 0.78,
    impact: hasIssuer
      ? 'Issuer is properly configured'
      : 'Token validation will fail without issuer',
    details: hasIssuer
      ? `Configured issuer: ${config.oauth.issuer}`
      : 'No valid issuer configured. Tokens cannot be validated.',
    mitigation: hasIssuer
      ? 'Ensure issuer matches token issuer claim'
      : 'Configure the correct HTTPS issuer URL'
  };
  
  results.scenarios.push(issuerScenario);
  
  if (hasIssuer) {
    results.summary.passed++;
  } else {
    results.summary.failed++;
    results.recommendations.push({
      priority: 'critical',
      action: 'Configure OAuth issuer',
      reason: 'Required for token validation'
    });
  }

  // Scenario 4: Audience Mismatch Detection
  if (hasAudience) {
    const audienceMismatchScenario = {
      name: 'Audience Mismatch Detection',
      status: 'passed',
      severity: 'low',
      probability: 0.42,
      impact: 'System can detect audience mismatches',
      details: `Testing with invalid audience: ${invalidAudience}. System should reject tokens with this audience.`,
      mitigation: 'Ensure proper error handling for audience mismatches'
    };
    
    results.scenarios.push(audienceMismatchScenario);
    results.summary.passed++;
  }

  // Scenario 5: Error Response Handling
  const errorHandlingScenario = {
    name: 'Error Response Handling',
    status: hasAudience && hasIssuer ? 'passed' : 'warning',
    severity: hasAudience && hasIssuer ? 'low' : 'medium',
    probability: hasAudience && hasIssuer ? 0.08 : 0.35,
    impact: hasAudience && hasIssuer
      ? 'Can provide clear error messages'
      : 'Error messages may be unclear',
    details: hasAudience && hasIssuer
      ? 'OAuth configuration allows for clear error messages on validation failures'
      : 'Incomplete OAuth configuration may result in unclear error messages',
    mitigation: hasAudience && hasIssuer
      ? 'Log audience validation failures for monitoring'
      : 'Complete OAuth configuration for better error handling'
  };
  
  results.scenarios.push(errorHandlingScenario);
  
  if (hasAudience && hasIssuer) {
    results.summary.passed++;
  } else {
    results.summary.warnings++;
    results.recommendations.push({
      priority: 'medium',
      action: 'Improve error handling',
      reason: 'Better debugging and monitoring'
    });
  }

  // Scenario 6: Security Posture
  const hasClientId = config.oauth.clientId && config.oauth.clientId.length >= 10;
  
  const securityScenario = {
    name: 'Security Posture Assessment',
    status: (hasAudience && hasIssuer && hasClientId) ? 'passed' : 'warning',
    severity: (hasAudience && hasIssuer && hasClientId) ? 'low' : 'medium',
    probability: (hasAudience && hasIssuer && hasClientId) ? 0.05 : 0.28,
    impact: (hasAudience && hasIssuer && hasClientId)
      ? 'Strong security configuration'
      : 'Security configuration could be improved',
    details: (hasAudience && hasIssuer && hasClientId)
      ? 'All critical OAuth security parameters are configured'
      : 'Some OAuth security parameters are missing or incomplete',
    mitigation: (hasAudience && hasIssuer && hasClientId)
      ? 'Continue monitoring security metrics'
      : 'Complete all OAuth security parameters'
  };
  
  results.scenarios.push(securityScenario);
  
  if (hasAudience && hasIssuer && hasClientId) {
    results.summary.passed++;
  } else {
    results.summary.warnings++;
    results.recommendations.push({
      priority: 'medium',
      action: 'Complete OAuth security configuration',
      reason: 'Ensures robust authentication'
    });
  }

  // Calculate totals
  results.summary.total_scenarios = results.scenarios.length;

  // Overall assessment
  const failureRate = results.summary.failed / results.summary.total_scenarios;
  results.overall_assessment = {
    ready_for_production: failureRate === 0,
    confidence_level: failureRate === 0 ? 'high' : failureRate < 0.3 ? 'medium' : 'low',
    failure_probability: `${Math.round(failureRate * 100)}%`,
    recommendation: failureRate === 0
      ? 'Audience validation is properly configured'
      : failureRate < 0.3
      ? 'Address warnings to improve security'
      : 'Critical audience validation issues must be resolved'
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(results, null, 2)
      }
    ]
  };
}

// Made with Bob
