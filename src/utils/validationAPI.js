// Validation API
// Provides a unified API for configuration validation, parsing, and scoring

import { validateConfig } from './validationSchema';
import { parseConfig, getConfigInsights } from './configParser';
import { getScoringReport } from './scoringRules';

export class ValidationAPI {
  constructor() {
    this.cache = new Map();
    this.validationHistory = [];
  }

  // Main validation method - combines all validation steps
  async validate(config, options = {}) {
    const {
      skipCache = false,
      includeInsights = true,
      includeScoring = true,
      includeRecommendations = true
    } = options;

    // Generate cache key
    const cacheKey = this.generateCacheKey(config);

    // Check cache
    if (!skipCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const startTime = Date.now();
    const result = {
      timestamp: new Date().toISOString(),
      configHash: cacheKey
    };

    try {
      // Step 1: Parse configuration
      const parseResult = parseConfig(config);
      if (!parseResult.success) {
        return {
          ...result,
          success: false,
          error: 'Configuration parsing failed',
          details: parseResult.error,
          processingTime: Date.now() - startTime
        };
      }
      result.parsed = parseResult;

      // Step 2: Validate structure and rules
      const validationResult = validateConfig(config);
      result.validation = validationResult;

      // Step 3: Get configuration insights
      if (includeInsights) {
        result.insights = getConfigInsights(config);
      }

      // Step 4: Calculate scoring
      if (includeScoring) {
        result.scoring = getScoringReport(config);
      }

      // Step 5: Generate recommendations
      if (includeRecommendations) {
        result.recommendations = this.generateRecommendations(
          validationResult,
          result.insights,
          result.scoring
        );
      }

      // Calculate overall status
      result.success = true;
      result.status = this.determineStatus(result);
      result.processingTime = Date.now() - startTime;

      // Cache result
      this.cache.set(cacheKey, result);

      // Add to history
      this.validationHistory.push({
        timestamp: result.timestamp,
        configHash: cacheKey,
        status: result.status,
        score: result.scoring?.score
      });

      return result;

    } catch (error) {
      return {
        ...result,
        success: false,
        error: 'Validation failed',
        details: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  // Quick validation - only structure and basic rules
  async quickValidate(config) {
    return this.validate(config, {
      includeInsights: false,
      includeScoring: false,
      includeRecommendations: false
    });
  }

  // Full validation - all checks and recommendations
  async fullValidate(config) {
    return this.validate(config, {
      includeInsights: true,
      includeScoring: true,
      includeRecommendations: true
    });
  }

  // Batch validation - validate multiple configurations
  async batchValidate(configs) {
    const results = [];
    for (const config of configs) {
      const result = await this.validate(config);
      results.push(result);
    }
    return {
      total: configs.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  // Generate recommendations based on validation results
  generateRecommendations(validation, insights, scoring) {
    const recommendations = [];

    // Critical recommendations from validation errors
    if (validation.errors && validation.errors.length > 0) {
      validation.errors.forEach(error => {
        recommendations.push({
          priority: 'critical',
          category: 'validation',
          title: `Fix ${error.type}`,
          description: error.message,
          path: error.path,
          impact: 'high'
        });
      });
    }

    // Recommendations from scoring
    if (scoring) {
      Object.entries(scoring.sectionScores).forEach(([section, score]) => {
        if (score.percentage < 70) {
          score.failedRules.forEach(rule => {
            recommendations.push({
              priority: score.percentage < 50 ? 'high' : 'medium',
              category: section,
              title: rule.description,
              description: `Implementing this will add ${rule.points} points to your ${section} score`,
              impact: 'medium',
              points: rule.points
            });
          });
        }
      });
    }

    // Recommendations from insights
    if (insights) {
      const stats = insights.statistics;
      
      if (!stats.hasOAuth) {
        recommendations.push({
          priority: 'high',
          category: 'security',
          title: 'Enable OAuth Authentication',
          description: 'OAuth is not configured. This is critical for production security.',
          impact: 'high'
        });
      }

      if (!stats.hasMonitoring) {
        recommendations.push({
          priority: 'high',
          category: 'observability',
          title: 'Enable Monitoring',
          description: 'Monitoring is disabled. This will make debugging production issues difficult.',
          impact: 'high'
        });
      }

      if (stats.toolCount > 0 && stats.registeredTools < stats.toolCount) {
        recommendations.push({
          priority: 'critical',
          category: 'tools',
          title: 'Register All Tools',
          description: `${stats.toolCount - stats.registeredTools} tool(s) are not registered and will fail in production.`,
          impact: 'critical'
        });
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return recommendations;
  }

  // Determine overall status
  determineStatus(result) {
    if (!result.validation.valid) {
      return 'invalid';
    }

    if (result.scoring) {
      const score = result.scoring.score;
      if (score >= 90) return 'excellent';
      if (score >= 75) return 'good';
      if (score >= 60) return 'fair';
      if (score >= 40) return 'poor';
      return 'critical';
    }

    return 'valid';
  }

  // Generate cache key from configuration
  generateCacheKey(config) {
    const str = JSON.stringify(config);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // Get validation statistics
  getStatistics() {
    return {
      totalValidations: this.validationHistory.length,
      cacheSize: this.cache.size,
      recentValidations: this.validationHistory.slice(-10),
      averageScore: this.validationHistory.length > 0
        ? this.validationHistory.reduce((sum, v) => sum + (v.score || 0), 0) / this.validationHistory.length
        : 0
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Clear history
  clearHistory() {
    this.validationHistory = [];
  }

  // Export validation report
  exportReport(result, format = 'json') {
    if (format === 'json') {
      return JSON.stringify(result, null, 2);
    }

    if (format === 'summary') {
      return this.generateSummaryReport(result);
    }

    throw new Error(`Unsupported format: ${format}`);
  }

  // Generate summary report
  generateSummaryReport(result) {
    const lines = [];
    lines.push('=== MCP Configuration Validation Report ===');
    lines.push(`Timestamp: ${result.timestamp}`);
    lines.push(`Status: ${result.status.toUpperCase()}`);
    lines.push('');

    if (result.scoring) {
      lines.push(`Readiness Score: ${result.scoring.score}/100`);
      lines.push(`Level: ${result.scoring.interpretation.label}`);
      lines.push('');
    }

    if (result.validation) {
      lines.push(`Validation Errors: ${result.validation.errors.length}`);
      lines.push(`Warnings: ${result.validation.warnings.length}`);
      lines.push('');
    }

    if (result.recommendations && result.recommendations.length > 0) {
      lines.push('Top Recommendations:');
      result.recommendations.slice(0, 5).forEach((rec, i) => {
        lines.push(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      });
    }

    return lines.join('\n');
  }
}

// Create singleton instance
export const validationAPI = new ValidationAPI();

// Export convenience functions
export const validateConfiguration = (config, options) => 
  validationAPI.validate(config, options);

export const quickValidateConfiguration = (config) => 
  validationAPI.quickValidate(config);

export const fullValidateConfiguration = (config) => 
  validationAPI.fullValidate(config);

export const batchValidateConfigurations = (configs) => 
  validationAPI.batchValidate(configs);

// Made with Bob
