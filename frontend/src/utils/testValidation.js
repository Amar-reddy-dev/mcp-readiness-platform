// Test validation with sample configurations
import { sampleConfigs } from '../data/sampleConfigs';
import { validateConfig } from './validationSchema';
import { parseConfig } from './configParser';
import { getScoringReport } from './scoringRules';
import { generateRiskReport } from './riskDetection';
import { generateRecommendations } from './recommendationMapping';

export const testSampleConfigs = () => {
  const results = {};

  Object.keys(sampleConfigs).forEach(key => {
    const sample = sampleConfigs[key];
    const config = sample.config;

    console.log(`\n=== Testing ${sample.name} ===`);

    try {
      // Test parsing
      const parseResult = parseConfig(config);
      console.log('✓ Parsing:', parseResult.success ? 'SUCCESS' : 'FAILED');

      // Test validation
      const validationResult = validateConfig(config);
      console.log('✓ Validation:', validationResult.valid ? 'VALID' : 'INVALID');
      console.log('  - Errors:', validationResult.errors.length);
      console.log('  - Warnings:', validationResult.warnings.length);

      // Test scoring
      const scoringResult = getScoringReport(config);
      console.log('✓ Scoring:', scoringResult.score, '/100');
      console.log('  - Level:', scoringResult.interpretation.label);

      // Test risk detection
      const riskResult = generateRiskReport(config);
      console.log('✓ Risk Detection:', riskResult.risks.length, 'risks found');
      console.log('  - Critical:', riskResult.summary.critical);
      console.log('  - High:', riskResult.summary.high);
      console.log('  - Medium:', riskResult.summary.medium);
      console.log('  - Low:', riskResult.summary.low);

      // Test recommendations
      const recommendations = generateRecommendations(
        validationResult,
        riskResult.risks,
        scoringResult
      );
      console.log('✓ Recommendations:', recommendations.length, 'generated');

      results[key] = {
        success: true,
        validation: validationResult,
        scoring: scoringResult,
        risks: riskResult,
        recommendations: recommendations
      };

    } catch (error) {
      console.error('✗ Error:', error.message);
      results[key] = {
        success: false,
        error: error.message
      };
    }
  });

  return results;
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  window.testValidation = testSampleConfigs;
}

export default testSampleConfigs;

// Made with Bob
