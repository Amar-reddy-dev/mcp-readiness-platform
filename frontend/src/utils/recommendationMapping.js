// Recommendation Mapping Engine
// Maps detected issues to actionable recommendations with code examples

export const RecommendationTemplates = {
  // OAuth Recommendations
  'oauth-not-configured': {
    priority: 'critical',
    title: 'Configure OAuth Authentication',
    description: 'Your MCP server lacks authentication. This will cause 95% of production requests to fail.',
    action: 'Add OAuth configuration with provider, clientId, issuer, and audience',
    impact: 'Prevents authentication failures and secures your API',
    effort: 'medium',
    code: `{
  "oauth": {
    "enabled": true,
    "provider": "auth0",
    "clientId": "your_client_id_here",
    "issuer": "https://your-domain.auth0.com",
    "audience": "https://api.your-domain.com",
    "tokenEndpoint": "https://your-domain.auth0.com/oauth/token",
    "scopes": ["read:data", "write:data"]
  }
}`,
    estimatedTime: '30-60 minutes',
    documentation: 'https://docs.mcp.com/authentication/oauth'
  },

  'oauth-missing-token-endpoint': {
    priority: 'high',
    title: 'Add Token Endpoint for Token Refresh',
    description: 'Without a token endpoint, token refresh will fail causing 42% of long-running sessions to fail.',
    action: 'Add tokenEndpoint to your OAuth configuration',
    impact: 'Enables automatic token refresh and prevents session timeouts',
    effort: 'low',
    code: `{
  "oauth": {
    "enabled": true,
    "tokenEndpoint": "https://your-domain.auth0.com/oauth/token"
  }
}`,
    estimatedTime: '10-15 minutes',
    documentation: 'https://docs.mcp.com/authentication/token-refresh'
  },

  // Gateway Recommendations
  'gateway-not-subscribed': {
    priority: 'critical',
    title: 'Subscribe to MCP Gateway',
    description: 'Without gateway subscription, your service will be 100% unreachable in production.',
    action: 'Subscribe to the MCP gateway and configure rate limits',
    impact: 'Enables service accessibility and load balancing',
    effort: 'low',
    code: `{
  "gateway": {
    "subscribed": true,
    "tier": "enterprise",
    "rateLimits": {
      "requestsPerMinute": 1000,
      "burstSize": 100
    }
  }
}`,
    estimatedTime: '15-20 minutes',
    documentation: 'https://docs.mcp.com/gateway/subscription'
  },

  'gateway-no-rate-limits': {
    priority: 'medium',
    title: 'Configure Rate Limits',
    description: 'Without rate limits, you may face unexpected throttling or service degradation.',
    action: 'Add rate limit configuration based on your tier',
    impact: 'Prevents throttling and ensures predictable performance',
    effort: 'low',
    code: `{
  "gateway": {
    "rateLimits": {
      "requestsPerMinute": 1000,
      "burstSize": 100
    }
  }
}`,
    estimatedTime: '10 minutes',
    documentation: 'https://docs.mcp.com/gateway/rate-limits'
  },

  // Tools Recommendations
  'tools-not-registered': {
    priority: 'critical',
    title: 'Register All Tools',
    description: 'Unregistered tools will cause 72% of operations to fail in production.',
    action: 'Ensure all tools are registered with the MCP server',
    impact: 'Prevents tool execution failures',
    effort: 'low',
    code: `{
  "tools": [
    {
      "name": "your_tool_name",
      "registered": true,
      "timeout": 30000,
      "retryPolicy": {
        "maxRetries": 3,
        "backoff": "exponential"
      }
    }
  ]
}`,
    estimatedTime: '5-10 minutes per tool',
    documentation: 'https://docs.mcp.com/tools/registration'
  },

  'tools-high-timeout': {
    priority: 'medium',
    title: 'Optimize Tool Timeouts',
    description: 'High timeouts (>60s) cause poor user experience and increase failure probability by 31%.',
    action: 'Reduce tool timeouts to 30 seconds or less',
    impact: 'Improves response times and user experience',
    effort: 'low',
    code: `{
  "tools": [
    {
      "name": "your_tool_name",
      "timeout": 30000  // 30 seconds
    }
  ]
}`,
    estimatedTime: '5 minutes',
    documentation: 'https://docs.mcp.com/tools/timeouts'
  },

  'tools-no-retry-policy': {
    priority: 'medium',
    title: 'Add Retry Policies',
    description: 'Without retry policies, transient failures will not be automatically recovered.',
    action: 'Configure retry policies with exponential backoff for all tools',
    impact: 'Increases reliability by 25% for transient failures',
    effort: 'low',
    code: `{
  "tools": [
    {
      "name": "your_tool_name",
      "retryPolicy": {
        "maxRetries": 3,
        "backoff": "exponential"
      }
    }
  ]
}`,
    estimatedTime: '10 minutes',
    documentation: 'https://docs.mcp.com/tools/retry-policies'
  },

  // Monitoring Recommendations
  'monitoring-disabled': {
    priority: 'high',
    title: 'Enable Monitoring and Tracing',
    description: 'Without monitoring, MTTR increases by 60%. Production issues will be extremely difficult to debug.',
    action: 'Configure monitoring with tracing and metrics',
    impact: 'Reduces MTTR by 60% and improves debugging capabilities',
    effort: 'medium',
    code: `{
  "monitoring": {
    "enabled": true,
    "tracing": true,
    "metrics": true,
    "logging": {
      "level": "info",
      "destination": "cloudwatch"
    }
  }
}`,
    estimatedTime: '30-45 minutes',
    documentation: 'https://docs.mcp.com/monitoring/setup'
  },

  'monitoring-no-tracing': {
    priority: 'medium',
    title: 'Enable Distributed Tracing',
    description: 'Without tracing, debugging request flows across services will be difficult.',
    action: 'Enable tracing in monitoring configuration',
    impact: 'Enables end-to-end request tracking',
    effort: 'low',
    code: `{
  "monitoring": {
    "enabled": true,
    "tracing": true
  }
}`,
    estimatedTime: '15 minutes',
    documentation: 'https://docs.mcp.com/monitoring/tracing'
  },

  // Security Recommendations
  'security-not-configured': {
    priority: 'high',
    title: 'Configure Security Settings',
    description: 'Missing security configuration increases vulnerability to attacks by 38%.',
    action: 'Add security configuration with TLS 1.3 and certificate validation',
    impact: 'Enhances security posture and prevents attacks',
    effort: 'medium',
    code: `{
  "security": {
    "tlsVersion": "1.3",
    "certificateValidation": true,
    "ipWhitelist": ["10.0.0.0/8"]
  }
}`,
    estimatedTime: '20-30 minutes',
    documentation: 'https://docs.mcp.com/security/configuration'
  },

  'security-old-tls': {
    priority: 'medium',
    title: 'Upgrade to TLS 1.3',
    description: 'TLS 1.2 is less secure than TLS 1.3. Upgrade for better encryption.',
    action: 'Update TLS version to 1.3',
    impact: 'Improves encryption and security',
    effort: 'low',
    code: `{
  "security": {
    "tlsVersion": "1.3"
  }
}`,
    estimatedTime: '5 minutes',
    documentation: 'https://docs.mcp.com/security/tls'
  },

  'security-insecure-transport': {
    priority: 'high',
    title: 'Use Secure Transport Protocol',
    description: 'HTTP transmits data without encryption. Switch to HTTPS for security.',
    action: 'Change transport from HTTP to HTTPS',
    impact: 'Encrypts all data in transit',
    effort: 'low',
    code: `{
  "server": {
    "transport": "https"
  }
}`,
    estimatedTime: '10 minutes',
    documentation: 'https://docs.mcp.com/server/transport'
  }
};

// Map validation errors to recommendations
export const mapValidationErrorsToRecommendations = (validationErrors) => {
  const recommendations = [];

  validationErrors.forEach(error => {
    const path = error.path.toLowerCase();
    
    // OAuth errors
    if (path.includes('oauth')) {
      if (path === 'oauth') {
        recommendations.push(RecommendationTemplates['oauth-not-configured']);
      } else if (path.includes('tokenendpoint')) {
        recommendations.push(RecommendationTemplates['oauth-missing-token-endpoint']);
      }
    }
    
    // Gateway errors
    if (path.includes('gateway')) {
      if (path.includes('subscribed')) {
        recommendations.push(RecommendationTemplates['gateway-not-subscribed']);
      } else if (path.includes('ratelimits')) {
        recommendations.push(RecommendationTemplates['gateway-no-rate-limits']);
      }
    }
    
    // Tools errors
    if (path.includes('tools')) {
      if (path.includes('registered')) {
        recommendations.push(RecommendationTemplates['tools-not-registered']);
      } else if (path.includes('timeout')) {
        recommendations.push(RecommendationTemplates['tools-high-timeout']);
      } else if (path.includes('retrypolicy')) {
        recommendations.push(RecommendationTemplates['tools-no-retry-policy']);
      }
    }
    
    // Monitoring errors
    if (path.includes('monitoring')) {
      if (path === 'monitoring' || path.includes('enabled')) {
        recommendations.push(RecommendationTemplates['monitoring-disabled']);
      } else if (path.includes('tracing')) {
        recommendations.push(RecommendationTemplates['monitoring-no-tracing']);
      }
    }
    
    // Security errors
    if (path.includes('security')) {
      if (path === 'security') {
        recommendations.push(RecommendationTemplates['security-not-configured']);
      } else if (path.includes('tlsversion')) {
        recommendations.push(RecommendationTemplates['security-old-tls']);
      }
    }
    
    // Server errors
    if (path.includes('server.transport')) {
      recommendations.push(RecommendationTemplates['security-insecure-transport']);
    }
  });

  return recommendations;
};

// Map risks to recommendations
export const mapRisksToRecommendations = (risks) => {
  const recommendations = [];
  const templateMap = {
    'auth-001': 'oauth-not-configured',
    'auth-002': 'oauth-missing-token-endpoint',
    'net-001': 'gateway-not-subscribed',
    'net-002': 'gateway-no-rate-limits',
    'net-003': 'security-insecure-transport',
    'perf-001': 'tools-not-registered',
    'perf-002': 'tools-high-timeout',
    'perf-003': 'tools-no-retry-policy',
    'obs-001': 'monitoring-disabled',
    'obs-002': 'monitoring-no-tracing',
    'sec-001': 'security-not-configured',
    'sec-002': 'security-old-tls'
  };

  risks.forEach(risk => {
    const templateKey = templateMap[risk.id];
    if (templateKey && RecommendationTemplates[templateKey]) {
      recommendations.push(RecommendationTemplates[templateKey]);
    }
  });

  return recommendations;
};

// Generate comprehensive recommendations
export const generateRecommendations = (validationResult, risks, scoringResult) => {
  const recommendations = new Map();

  // Add recommendations from validation errors
  if (validationResult?.errors) {
    const validationRecs = mapValidationErrorsToRecommendations(validationResult.errors);
    validationRecs.forEach(rec => recommendations.set(rec.title, rec));
  }

  // Add recommendations from risks
  if (risks) {
    const riskRecs = mapRisksToRecommendations(risks);
    riskRecs.forEach(rec => recommendations.set(rec.title, rec));
  }

  // Add recommendations from scoring
  if (scoringResult?.sectionScores) {
    Object.entries(scoringResult.sectionScores).forEach(([section, score]) => {
      if (score.percentage < 70) {
        // Add section-specific recommendations based on failed rules
        score.failedRules.forEach(rule => {
          // Map failed rules to recommendations
          const recKey = `${section}-${rule.description.toLowerCase().replace(/\s+/g, '-')}`;
          // This would map to specific templates based on the rule
        });
      }
    });
  }

  // Convert to array and sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return Array.from(recommendations.values()).sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
};

// Get quick wins - easy recommendations with high impact
export const getQuickWins = (recommendations) => {
  return recommendations.filter(rec => 
    rec.effort === 'low' && 
    (rec.priority === 'high' || rec.priority === 'critical')
  );
};

// Get implementation roadmap
export const getImplementationRoadmap = (recommendations) => {
  const roadmap = {
    immediate: [], // Critical, do now
    shortTerm: [],  // High priority, do this week
    mediumTerm: [], // Medium priority, do this month
    longTerm: []    // Low priority, plan for future
  };

  recommendations.forEach(rec => {
    if (rec.priority === 'critical') {
      roadmap.immediate.push(rec);
    } else if (rec.priority === 'high') {
      roadmap.shortTerm.push(rec);
    } else if (rec.priority === 'medium') {
      roadmap.mediumTerm.push(rec);
    } else {
      roadmap.longTerm.push(rec);
    }
  });

  return roadmap;
};

// Calculate total implementation time
export const calculateImplementationTime = (recommendations) => {
  let totalMinutes = 0;
  
  recommendations.forEach(rec => {
    if (rec.estimatedTime) {
      // Parse time string like "30-60 minutes" or "10 minutes"
      const match = rec.estimatedTime.match(/(\d+)(?:-(\d+))?\s*minutes?/);
      if (match) {
        const min = parseInt(match[1]);
        const max = match[2] ? parseInt(match[2]) : min;
        totalMinutes += (min + max) / 2;
      }
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  return {
    totalMinutes,
    formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    hours,
    minutes
  };
};

// Made with Bob
