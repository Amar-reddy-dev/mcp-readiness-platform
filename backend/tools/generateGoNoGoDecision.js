/**
 * Go/No-Go Decision Generation Tool
 * Generates comprehensive deployment decisions using validation rules and LLM analysis
 * 
 * Integrates:
 * - Validation rules from existing utilities
 * - Risk detection
 * - Scoring analysis
 * - IBM watsonx Orchestrate LLM for enhanced decision making
 */

import { validateConfig } from '../../frontend/src/utils/validationSchema.js';
import { getScoringReport } from '../../frontend/src/utils/scoringRules.js';
import { generateRiskReport } from '../../frontend/src/utils/riskDetection.js';
import { validateWithLLM } from '../integrations/ibmWatsonxOrchestrate.js';

/**
 * Generate go/no-go deployment decision
 * @param {Object} args - Tool arguments
 * @returns {Object} Decision results
 */
export async function generateGoNoGoDecision(args) {
  const { 
    config, 
    environment = 'production',
    useLLM = true 
  } = args;

  const results = {
    tool: 'generate_go_no_go_decision',
    timestamp: new Date().toISOString(),
    environment,
    decision: null,
    confidence: null,
    analysis: {
      validation: null,
      scoring: null,
      risks: null,
      llm_analysis: null
    },
    criteria: {
      passed: [],
      failed: [],
      warnings: []
    },
    recommendations: [],
    deployment_checklist: []
  };

  try {
    // Step 1: Validate Configuration
    console.error('Step 1: Validating configuration...');
    const validation = validateConfig(config);
    results.analysis.validation = {
      valid: validation.valid,
      error_count: validation.errors.length,
      warning_count: validation.warnings.length,
      errors: validation.errors,
      warnings: validation.warnings
    };

    // Step 2: Calculate Readiness Score
    console.error('Step 2: Calculating readiness score...');
    const scoring = getScoringReport(config);
    results.analysis.scoring = {
      score: scoring.score,
      level: scoring.interpretation.level,
      label: scoring.interpretation.label,
      section_scores: scoring.sectionScores
    };

    // Step 3: Detect Risks
    console.error('Step 3: Detecting risks...');
    const riskReport = generateRiskReport(config);
    results.analysis.risks = {
      total_risks: riskReport.risks.length,
      critical: riskReport.summary.critical,
      high: riskReport.summary.high,
      medium: riskReport.summary.medium,
      low: riskReport.summary.low,
      risk_score: riskReport.riskScore,
      risk_level: riskReport.riskLevel,
      top_risks: riskReport.risks.slice(0, 5)
    };

    // Step 4: Apply Environment-Specific Criteria
    console.error('Step 4: Applying environment-specific criteria...');
    const environmentCriteria = getEnvironmentCriteria(environment);
    evaluateCriteria(results, validation, scoring, riskReport, environmentCriteria);

    // Step 5: LLM-Enhanced Analysis (if enabled)
    if (useLLM) {
      console.error('Step 5: Running LLM-enhanced analysis...');
      try {
        const llmAnalysis = await validateWithLLM(config, {
          validation,
          scoring,
          riskReport,
          environment
        });
        results.analysis.llm_analysis = llmAnalysis;
      } catch (error) {
        console.error('LLM analysis failed:', error.message);
        results.analysis.llm_analysis = {
          error: 'LLM analysis unavailable',
          message: error.message
        };
      }
    }

    // Step 6: Make Final Decision
    console.error('Step 6: Making final decision...');
    makeDecision(results, environment);

    // Step 7: Generate Recommendations
    console.error('Step 7: Generating recommendations...');
    generateRecommendations(results, validation, scoring, riskReport);

    // Step 8: Create Deployment Checklist
    console.error('Step 8: Creating deployment checklist...');
    createDeploymentChecklist(results, environment);

  } catch (error) {
    results.decision = 'NO_GO';
    results.confidence = 'high';
    results.error = error.message;
    results.criteria.failed.push({
      criterion: 'Analysis Execution',
      reason: `Failed to complete analysis: ${error.message}`,
      severity: 'critical'
    });
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(results, null, 2)
      }
    ]
  };
}

/**
 * Get environment-specific criteria
 */
function getEnvironmentCriteria(environment) {
  const criteria = {
    development: {
      min_score: 40,
      max_critical_risks: 5,
      max_high_risks: 10,
      require_oauth: false,
      require_monitoring: false,
      require_gateway: false
    },
    staging: {
      min_score: 60,
      max_critical_risks: 2,
      max_high_risks: 5,
      require_oauth: true,
      require_monitoring: true,
      require_gateway: true
    },
    production: {
      min_score: 75,
      max_critical_risks: 0,
      max_high_risks: 2,
      require_oauth: true,
      require_monitoring: true,
      require_gateway: true
    }
  };

  return criteria[environment] || criteria.production;
}

/**
 * Evaluate criteria against configuration
 */
function evaluateCriteria(results, validation, scoring, riskReport, criteria) {
  // Criterion 1: Validation Errors
  if (validation.errors.length === 0) {
    results.criteria.passed.push({
      criterion: 'Configuration Validation',
      status: 'passed',
      details: 'No validation errors found'
    });
  } else {
    results.criteria.failed.push({
      criterion: 'Configuration Validation',
      reason: `${validation.errors.length} validation error(s) found`,
      severity: 'critical',
      errors: validation.errors
    });
  }

  // Criterion 2: Readiness Score
  if (scoring.score >= criteria.min_score) {
    results.criteria.passed.push({
      criterion: 'Readiness Score',
      status: 'passed',
      details: `Score ${scoring.score} meets minimum ${criteria.min_score}`
    });
  } else {
    results.criteria.failed.push({
      criterion: 'Readiness Score',
      reason: `Score ${scoring.score} below minimum ${criteria.min_score}`,
      severity: 'high'
    });
  }

  // Criterion 3: Critical Risks
  if (riskReport.summary.critical <= criteria.max_critical_risks) {
    results.criteria.passed.push({
      criterion: 'Critical Risks',
      status: 'passed',
      details: `${riskReport.summary.critical} critical risk(s), max allowed: ${criteria.max_critical_risks}`
    });
  } else {
    results.criteria.failed.push({
      criterion: 'Critical Risks',
      reason: `${riskReport.summary.critical} critical risk(s) exceed maximum ${criteria.max_critical_risks}`,
      severity: 'critical',
      risks: riskReport.risks.filter(r => r.severity === 'critical')
    });
  }

  // Criterion 4: High Risks
  if (riskReport.summary.high <= criteria.max_high_risks) {
    results.criteria.passed.push({
      criterion: 'High Risks',
      status: 'passed',
      details: `${riskReport.summary.high} high risk(s), max allowed: ${criteria.max_high_risks}`
    });
  } else {
    results.criteria.failed.push({
      criterion: 'High Risks',
      reason: `${riskReport.summary.high} high risk(s) exceed maximum ${criteria.max_high_risks}`,
      severity: 'high'
    });
  }

  // Criterion 5: OAuth (if required)
  if (criteria.require_oauth) {
    const hasOAuth = validation.errors.every(e => !e.path.startsWith('oauth'));
    if (hasOAuth) {
      results.criteria.passed.push({
        criterion: 'OAuth Configuration',
        status: 'passed',
        details: 'OAuth is properly configured'
      });
    } else {
      results.criteria.failed.push({
        criterion: 'OAuth Configuration',
        reason: 'OAuth configuration is missing or invalid',
        severity: 'critical'
      });
    }
  }

  // Criterion 6: Monitoring (if required)
  if (criteria.require_monitoring) {
    const monitoringRisk = riskReport.risks.find(r => r.id === 'obs-001');
    if (!monitoringRisk) {
      results.criteria.passed.push({
        criterion: 'Monitoring Configuration',
        status: 'passed',
        details: 'Monitoring is properly configured'
      });
    } else {
      results.criteria.failed.push({
        criterion: 'Monitoring Configuration',
        reason: 'Monitoring is not enabled',
        severity: 'high'
      });
    }
  }

  // Criterion 7: Gateway (if required)
  if (criteria.require_gateway) {
    const gatewayRisk = riskReport.risks.find(r => r.id === 'net-001');
    if (!gatewayRisk) {
      results.criteria.passed.push({
        criterion: 'Gateway Subscription',
        status: 'passed',
        details: 'Gateway is subscribed and configured'
      });
    } else {
      results.criteria.failed.push({
        criterion: 'Gateway Subscription',
        reason: 'Gateway is not subscribed',
        severity: 'critical'
      });
    }
  }

  // Add warnings
  if (validation.warnings.length > 0) {
    results.criteria.warnings.push({
      criterion: 'Configuration Warnings',
      count: validation.warnings.length,
      warnings: validation.warnings
    });
  }
}

/**
 * Make final go/no-go decision
 */
function makeDecision(results, environment) {
  const failedCount = results.criteria.failed.length;
  const criticalFailures = results.criteria.failed.filter(f => f.severity === 'critical').length;
  const highFailures = results.criteria.failed.filter(f => f.severity === 'high').length;

  if (criticalFailures > 0) {
    results.decision = 'NO_GO';
    results.confidence = 'high';
    results.decision_reason = `${criticalFailures} critical failure(s) detected. Deployment would likely fail.`;
  } else if (failedCount === 0) {
    results.decision = 'GO';
    results.confidence = 'high';
    results.decision_reason = 'All criteria passed. Configuration is ready for deployment.';
  } else if (highFailures > 0 && environment === 'production') {
    results.decision = 'NO_GO';
    results.confidence = 'high';
    results.decision_reason = `${highFailures} high-severity failure(s) detected. Not suitable for production.`;
  } else if (failedCount <= 2 && environment !== 'production') {
    results.decision = 'GO_WITH_CAUTION';
    results.confidence = 'medium';
    results.decision_reason = `${failedCount} non-critical failure(s) detected. Acceptable for ${environment}.`;
  } else {
    results.decision = 'NO_GO';
    results.confidence = 'medium';
    results.decision_reason = `${failedCount} failure(s) detected. Address issues before deployment.`;
  }

  // Factor in LLM analysis if available
  if (results.analysis.llm_analysis && results.analysis.llm_analysis.recommendation) {
    results.llm_recommendation = results.analysis.llm_analysis.recommendation;
  }
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(results, validation, scoring, riskReport) {
  // Add recommendations from failed criteria
  results.criteria.failed.forEach(failure => {
    results.recommendations.push({
      priority: failure.severity,
      action: `Fix: ${failure.criterion}`,
      reason: failure.reason,
      category: 'critical_fix'
    });
  });

  // Add recommendations from risk report
  riskReport.risks.slice(0, 5).forEach(risk => {
    results.recommendations.push({
      priority: risk.severity,
      action: risk.title,
      reason: risk.mitigation,
      category: 'risk_mitigation'
    });
  });

  // Add recommendations from scoring
  Object.entries(scoring.sectionScores).forEach(([section, score]) => {
    if (score.percentage < 70) {
      score.failedRules.slice(0, 2).forEach(rule => {
        results.recommendations.push({
          priority: 'medium',
          action: rule.description,
          reason: `Improve ${section} score by ${rule.points} points`,
          category: 'optimization'
        });
      });
    }
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  results.recommendations.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

/**
 * Create deployment checklist
 */
function createDeploymentChecklist(results, environment) {
  results.deployment_checklist = [
    {
      item: 'Configuration Validation',
      status: results.criteria.failed.some(f => f.criterion === 'Configuration Validation') ? 'failed' : 'passed',
      required: true
    },
    {
      item: 'OAuth Authentication',
      status: results.criteria.failed.some(f => f.criterion === 'OAuth Configuration') ? 'failed' : 'passed',
      required: environment !== 'development'
    },
    {
      item: 'Gateway Subscription',
      status: results.criteria.failed.some(f => f.criterion === 'Gateway Subscription') ? 'failed' : 'passed',
      required: environment !== 'development'
    },
    {
      item: 'Monitoring Setup',
      status: results.criteria.failed.some(f => f.criterion === 'Monitoring Configuration') ? 'failed' : 'passed',
      required: environment === 'production'
    },
    {
      item: 'Risk Assessment',
      status: results.criteria.failed.some(f => f.criterion.includes('Risk')) ? 'failed' : 'passed',
      required: true
    },
    {
      item: 'Readiness Score',
      status: results.criteria.failed.some(f => f.criterion === 'Readiness Score') ? 'failed' : 'passed',
      required: true
    }
  ];
}

// Made with Bob
