const fs = require('fs');
const path = require('path');
const getTagsFromJobDescription = require('../../main/js/ai-tagging');

// Path to the training screens directory
const TRAINING_SCREENS_DIR = path.join(__dirname, '../resources/training-screens');

// Parse command line arguments
const args = process.argv.slice(2);
const startTestIndex = parseInt(args[0]) || 0;
const runCount = parseInt(args[1]) || 0;

/**
 * Compare two arrays of strings and return statistics
 * @param {string[]} expected - The expected technologies
 * @param {string[]} actual - The actual technologies returned by the AI
 * @returns {Object} - Statistics about the comparison
 */
function compareTechnologies(expected, actual) {
  // Convert arrays to sets for easier comparison
  const expectedSet = new Set(expected.map(tech => tech.toLowerCase()));
  const actualSet = new Set(actual.map(tech => tech.toLowerCase()));
  
  // Find matches, false positives, and false negatives
  const matches = [...actualSet].filter(tech => expectedSet.has(tech));
  const extraTags = [...actualSet].filter(tech => !expectedSet.has(tech));
  const missingTags = [...expectedSet].filter(tech => !actualSet.has(tech));
  
  // Calculate precision, recall, and F1 score
  const precision = actual.length > 0 ? matches.length / actual.length : 0;
  const recall = expected.length > 0 ? matches.length / expected.length : 0;
  const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  
  return {
    testPassed: missingTags.length === 0 && extraTags.length < 5,
    matches,
    extraTags,
    missingTags,
    precision,
    recall,
    f1Score
  };
}

/**
 * Process a single training screen file
 * @param {string} filePath - Path to the training screen file
 * @returns {Promise<Object>} - Results of processing the file
 */
async function processTrainingScreen(filePath) {
  try {
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const screenData = JSON.parse(fileContent);
    
    // Extract job description and expected technologies
    const { id, jobDescription, technologies: expectedTechnologies } = screenData;
    
    // Call the AI tagging function and measure execution time
    const startTime = Date.now();
    const actualTechnologies = await getTagsFromJobDescription(jobDescription);
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;
    
    // Compare the results
    const comparison = compareTechnologies(expectedTechnologies, actualTechnologies);
    
    console.log(`\n${id}:`);
    console.log(comparison.testPassed ? "  ✅ PASSED" : "  ❌ FAILED");
    console.log(`  Missing Tags: ${comparison.missingTags.join(', ')}`);
    console.log(`  Extra Tags: ${comparison.extraTags.join(', ')}`);
    console.log(`  Expected: ${expectedTechnologies.join(', ')}`);
    console.log(`  Actual: ${actualTechnologies.join(', ')}`);
    console.log(`  Matches: ${comparison.matches.length}`);
    console.log(`  Precision: ${comparison.precision.toFixed(4)}`);
    console.log(`  Recall: ${comparison.recall.toFixed(4)}`);
    console.log(`  F1 Score: ${comparison.f1Score.toFixed(4)}`);
    console.log(`  Execution Time: ${executionTimeMs.toFixed(2)}ms`);

    return {
      id,
      expectedTechnologies,
      actualTechnologies,
      executionTimeMs,
      ...comparison
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return {
      id: path.basename(filePath, '.json'),
      error: error.message
    };
  }
}

/**
 * Main function to run the batch test
 */
async function runBatchTest() {
  try {
    // Get all JSON files in the training screens directory
    const allFiles = fs.readdirSync(TRAINING_SCREENS_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(TRAINING_SCREENS_DIR, file));
    
    // Sort files by name to ensure consistent ordering
    allFiles.sort();
    
    // Apply startTestIndex and runCount filters
    let files = allFiles;
    if (startTestIndex > 0) {
      files = files.slice(startTestIndex);
    }
    if (runCount > 0) {
      files = files.slice(0, runCount);
    }
    
    console.log(`Found ${allFiles.length} total training screen files.`);
    console.log(`Processing ${files.length} files (starting at index ${startTestIndex}${runCount > 0 ? `, running ${runCount} files` : ''}).`);
    
    // Process each file
    const results = [];
    for (const file of files) {
      console.log(`Processing ${path.basename(file)}...`);
      const result = await processTrainingScreen(file);
      results.push(result);
    }
    
    // Calculate aggregate statistics
    const nonErroredResults = results.filter(r => !r.error);
    const passingResults = nonErroredResults.filter(r => r.testPassed);
    const totalPrecision = nonErroredResults.reduce((sum, r) => sum + r.precision, 0);
    const totalRecall = nonErroredResults.reduce((sum, r) => sum + r.recall, 0);
    const totalF1Score = nonErroredResults.reduce((sum, r) => sum + r.f1Score, 0);
    const totalExecutionTime = nonErroredResults.reduce((sum, r) => sum + r.executionTimeMs, 0);
    
    const avgPrecision = nonErroredResults.length > 0 ? totalPrecision / nonErroredResults.length : 0;
    const avgRecall = nonErroredResults.length > 0 ? totalRecall / nonErroredResults.length : 0;
    const avgF1Score = nonErroredResults.length > 0 ? totalF1Score / nonErroredResults.length : 0;
    const avgExecutionTime = nonErroredResults.length > 0 ? totalExecutionTime / nonErroredResults.length : 0;
    
    // Print summary
    console.log('\n=== BATCH TEST SUMMARY ===');
    console.log(passingResults.length === results.length ? "  ✅ PASSED" : "  ❌ FAILED");
    console.log(`Total files processed: ${files.length}`);
    console.log(`Passing Test Count: ${passingResults.length}`);
    console.log(`Failing Test Count: ${nonErroredResults.length - passingResults.length}`);
    console.log(`Error Count: ${results.length - nonErroredResults.length}`);
    console.log(`Average Precision: ${avgPrecision.toFixed(4)}`);
    console.log(`Average Recall: ${avgRecall.toFixed(4)}`);
    console.log(`Average F1 Score: ${avgF1Score.toFixed(4)}`);
    console.log(`Average Execution Time: ${avgExecutionTime.toFixed(2)}ms`);
        
  } catch (error) {
    console.error('Error running batch test:', error);
  }
}

// Print usage information
function printUsage() {
  console.log('Usage: node ai-tagging-batch-test-runner.js [startTestIndex] [runCount]');
  console.log('  startTestIndex: The index of the first test file to process (default: 0)');
  console.log('  runCount: The number of test files to process (default: all files)');
  console.log('Example: node ai-tagging-batch-test-runner.js 10 5  # Process 5 files starting at index 10');
}

// Check if help is requested
if (args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

// Run the batch test
runBatchTest();
