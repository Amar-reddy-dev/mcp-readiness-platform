// Scoring Rules Engine
// Defines rules and weights for calculating readiness scores

export const ScoringWeights = {
  // Core configuration weights (total: 100)
  server: 15,
  oauth: 25,
  gateway: 20,
  tools: 20,
  monitoring: 15,
  security: 5
};

export const ScoringRules = {
  // Server scoring rules
  server: {
    base: 15,
    rules: [
      {
        condition: (config) => config.server?.name && /^[a-zA-Z0-9-_]+$/.test(config.server.name),
        points: 3,
        description: 'Valid server name'
      },
      {
        condition: (config) => config.server?.version && /^\d+\.\d+\.\d+$/.test(config.server.version),
        points: 3,
        description: 'Valid semantic version'
      },
      {
        condition: (config) => ['https', 'sse'].includes(config.server?.transport),
        points: 5,
        description: 'Secure transport protocol'
      },
      {
        condition: (config) => config.server?.endpoint && config.server.endpoint.startsWith('https'),
        points: 4,
        description: 'HTTPS endpoint configured'
      }
    ]
  },

  // OAuth scoring rules
  oauth: {
    base: 25,
    rules: [
      {
        condition: (config) => config.oauth?.enabled === true,
        points: 8,
        description: 'OAuth enabled'
      },
      {
        condition: (config) => config.oauth?.clientId && config.oauth.clientId.length >= 10,
        points: 4,
        description: 'Valid client ID'
      },
      {
        condition: (config) => config.oauth?.issuer && config.oauth.issuer.startsWith('https'),
        points: 4,
        description: 'Valid issuer URL'
      },
      {
        condition: (config) => config.oauth?.audience,
        points: 3,
        description: 'Audience configured'
      },
      {
        condition: (config) => config.oauth?.tokenEndpoint,
        points: 4,
        description: 'Token endpoint configured'
      },
      {
        condition: (config) => config.oauth?.scopes && config.oauth.scopes.length > 0,
        points: 2,
        description: 'OAuth scopes defined'
      }
    ]
  },

  // Gateway scoring rules
  gateway: {
    base: 20,
    rules: [
      {
        condition: (config) => config.gateway?.subscribed === true,
        points: 10,
        description: 'Gateway subscription active'
      },
      {
        condition: (config) => ['professional', 'enterprise'].includes(config.gateway?.tier),
        points: 5,
        description: 'Premium tier subscription'
      },
      {
        condition: (config) => config.gateway?.rateLimits?.requestsPerMinute > 0,
        points: 3,
        description: 'Rate limits configured'
      },
      {
        condition: (config) => config.gateway?.rateLimits?.burstSize > 0,
        points: 2,
        description: 'Burst size configured'
      }
    ]
  },

  // Tools scoring rules
  tools: {
    base: 20,
    rules: [
      {
        condition: (config) => config.tools && config.tools.length > 0,
        points: 5,
        description: 'Tools configured'
      },
      {
        condition: (config) => config.tools?.every(t => t.registered === true),
        points: 6,
        description: 'All tools registered'
      },
      {
        condition: (config) => config.tools?.every(t => t.timeout && t.timeout <= 30000),
        points: 4,
        description: 'Optimal tool timeouts'
      },
      {
        condition: (config) => config.tools?.every(t => t.retryPolicy),
        points: 3,
        description: 'Retry policies configured'
      },
      {
        condition: (config) => config.tools?.every(t => 
          t.retryPolicy?.backoff === 'exponential'
        ),
        points: 2,
        description: 'Exponential backoff configured'
      }
    ]
  },

  // Monitoring scoring rules
  monitoring: {
    base: 15,
    rules: [
      {
        condition: (config) => config.monitoring?.enabled === true,
        points: 6,
        description: 'Monitoring enabled'
      },
      {
        condition: (config) => config.monitoring?.tracing === true,
        points: 4,
        description: 'Tracing enabled'
      },
      {
        condition: (config) => config.monitoring?.metrics === true,
        points: 3,
        description: 'Metrics collection enabled'
      },
      {
        condition: (config) => config.monitoring?.logging?.level,
        points: 1,
        description: 'Logging level configured'
      },
      {
        condition: (config) => ['cloudwatch', 'datadog', 'splunk'].includes(
          config.monitoring?.logging?.destination
        ),
        points: 1,
        description: 'Production logging destination'
      }
    ]
  },

  // Security scoring rules
  security: {
    base: 5,
    rules: [
      {
        condition: (config) => config.security?.tlsVersion === '1.3',
        points: 2,
        description: 'TLS 1.3 configured'
      },
      {
        condition: (config) => config.security?.certificateValidation === true,
        points: 2,
        description: 'Certificate validation enabled'
      },
      {
        condition: (config) => config.security?.ipWhitelist && 
          config.security.ipWhitelist.length > 0,
        points: 1,
        description: 'IP whitelist configured'
      }
    ]
  }
};

// Calculate score for a specific section
export const calculateSectionScore = (config, section) => {
  const rules = ScoringRules[section];
  if (!rules) return 0;

  let score = 0;
  const passedRules = [];
  const failedRules = [];

  rules.rules.forEach(rule => {
    try {
      if (rule.condition(config)) {
        score += rule.points;
        passedRules.push({
          description: rule.description,
          points: rule.points
        });
      } else {
        failedRules.push({
          description: rule.description,
          points: rule.points
        });
      }
    } catch (error) {
      // Rule evaluation failed, treat as not passed
      failedRules.push({
        description: rule.description,
        points: rule.points,
        error: error.message
      });
    }
  });

  return {
    score,
    maxScore: rules.base,
    percentage: Math.round((score / rules.base) * 100),
    passedRules,
    failedRules
  };
};

// Calculate overall readiness score
export const calculateReadinessScore = (config) => {
  const sectionScores = {};
  let totalScore = 0;
  let totalMaxScore = 0;

  Object.keys(ScoringRules).forEach(section => {
    const sectionResult = calculateSectionScore(config, section);
    sectionScores[section] = sectionResult;
    totalScore += sectionResult.score;
    totalMaxScore += sectionResult.maxScore;
  });

  // Apply bonus points for best practices
  const bonusPoints = calculateBonusPoints(config);
  totalScore += bonusPoints.total;

  // Apply penalties for critical issues
  const penalties = calculatePenalties(config);
  totalScore -= penalties.total;

  // Ensure score is between 0 and 100
  const finalScore = Math.max(0, Math.min(100, totalScore));

  return {
    score: finalScore,
    maxScore: 100,
    sectionScores,
    bonusPoints,
    penalties,
    breakdown: {
      baseScore: totalScore - bonusPoints.total + penalties.total,
      bonus: bonusPoints.total,
      penalties: penalties.total
    }
  };
};

// Calculate bonus points for best practices
const calculateBonusPoints = (config) => {
  const bonuses = [];
  let total = 0;

  // Full observability stack
  if (config.monitoring?.enabled && 
      config.monitoring?.tracing && 
      config.monitoring?.metrics) {
    bonuses.push({ reason: 'Full observability stack', points: 5 });
    total += 5;
  }

  // Complete security configuration
  if (config.security?.tlsVersion === '1.3' && 
      config.security?.certificateValidation && 
      config.security?.ipWhitelist?.length > 0) {
    bonuses.push({ reason: 'Complete security configuration', points: 3 });
    total += 3;
  }

  // All tools optimized
  if (config.tools?.length > 0 && 
      config.tools.every(t => 
        t.registered && 
        t.timeout <= 30000 && 
        t.retryPolicy?.backoff === 'exponential'
      )) {
    bonuses.push({ reason: 'All tools optimized', points: 4 });
    total += 4;
  }

  // Premium gateway tier
  if (config.gateway?.tier === 'enterprise') {
    bonuses.push({ reason: 'Enterprise gateway tier', points: 2 });
    total += 2;
  }

  return { bonuses, total };
};

// Calculate penalties for critical issues
const calculatePenalties = (config) => {
  const penalties = [];
  let total = 0;

  // OAuth enabled but incomplete
  if (config.oauth?.enabled && 
      (!config.oauth.clientId || !config.oauth.issuer || !config.oauth.audience)) {
    penalties.push({ reason: 'Incomplete OAuth configuration', points: 15 });
    total += 15;
  }

  // No monitoring in production
  if (!config.monitoring?.enabled) {
    penalties.push({ reason: 'Monitoring disabled', points: 10 });
    total += 10;
  }

  // Gateway not subscribed
  if (config.gateway && !config.gateway.subscribed) {
    penalties.push({ reason: 'Gateway not subscribed', points: 15 });
    total += 15;
  }

  // Tools not registered
  if (config.tools?.some(t => !t.registered)) {
    const unregisteredCount = config.tools.filter(t => !t.registered).length;
    penalties.push({ 
      reason: `${unregisteredCount} tool(s) not registered`, 
      points: unregisteredCount * 5 
    });
    total += unregisteredCount * 5;
  }

  // Insecure transport
  if (config.server?.transport === 'http') {
    penalties.push({ reason: 'Insecure HTTP transport', points: 8 });
    total += 8;
  }

  // High tool timeouts
  if (config.tools?.some(t => t.timeout > 60000)) {
    penalties.push({ reason: 'Excessive tool timeouts', points: 5 });
    total += 5;
  }

  return { penalties, total };
};

// Get score interpretation
export const getScoreInterpretation = (score) => {
  if (score >= 90) {
    return {
      level: 'excellent',
      label: 'Production Ready',
      color: 'success',
      description: 'Configuration meets all best practices and is ready for production deployment.',
      recommendation: 'Deploy with confidence. Continue monitoring and maintain current standards.'
    };
  } else if (score >= 75) {
    return {
      level: 'good',
      label: 'Good',
      color: 'success',
      description: 'Configuration is solid with minor improvements possible.',
      recommendation: 'Address remaining warnings before production deployment.'
    };
  } else if (score >= 60) {
    return {
      level: 'fair',
      label: 'Needs Improvement',
      color: 'warning',
      description: 'Configuration has several issues that should be addressed.',
      recommendation: 'Fix critical issues and implement recommended best practices.'
    };
  } else if (score >= 40) {
    return {
      level: 'poor',
      label: 'High Risk',
      color: 'danger',
      description: 'Configuration has significant issues that will likely cause production failures.',
      recommendation: 'Do not deploy. Address all critical issues immediately.'
    };
  } else {
    return {
      level: 'critical',
      label: 'Critical Issues',
      color: 'danger',
      description: 'Configuration is severely incomplete or misconfigured.',
      recommendation: 'Complete configuration review required. Not suitable for any environment.'
    };
  }
};

// Get detailed scoring report
export const getScoringReport = (config) => {
  const scoreResult = calculateReadinessScore(config);
  const interpretation = getScoreInterpretation(scoreResult.score);

  return {
    ...scoreResult,
    interpretation,
    timestamp: new Date().toISOString()
  };
};

// Made with Bob
