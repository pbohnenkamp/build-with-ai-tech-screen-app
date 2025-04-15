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
  const falsePositives = [...actualSet].filter(tech => !expectedSet.has(tech));
  const falseNegatives = [...expectedSet].filter(tech => !actualSet.has(tech));
  
  // Calculate precision, recall, and F1 score
  const precision = actual.length > 0 ? matches.length / actual.length : 0;
  const recall = expected.length > 0 ? matches.length / expected.length : 0;
  const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  
  return {
    matches,
    falsePositives,
    falseNegatives,
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
    
    // Call the AI tagging function
    const actualTechnologies = await getTagsFromJobDescription(jobDescription);
    
    // Compare the results
    const comparison = compareTechnologies(expectedTechnologies, actualTechnologies);
    
    return {
      id,
      expectedTechnologies,
      actualTechnologies,
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
    const validResults = results.filter(r => !r.error);
    const totalPrecision = validResults.reduce((sum, r) => sum + r.precision, 0);
    const totalRecall = validResults.reduce((sum, r) => sum + r.recall, 0);
    const totalF1Score = validResults.reduce((sum, r) => sum + r.f1Score, 0);
    
    const avgPrecision = validResults.length > 0 ? totalPrecision / validResults.length : 0;
    const avgRecall = validResults.length > 0 ? totalRecall / validResults.length : 0;
    const avgF1Score = validResults.length > 0 ? totalF1Score / validResults.length : 0;
    
    // Print summary
    console.log('\n=== BATCH TEST SUMMARY ===');
    console.log(`Total files processed: ${files.length}`);
    console.log(`Successful: ${validResults.length}`);
    console.log(`Failed: ${results.length - validResults.length}`);
    console.log(`Average Precision: ${avgPrecision.toFixed(4)}`);
    console.log(`Average Recall: ${avgRecall.toFixed(4)}`);
    console.log(`Average F1 Score: ${avgF1Score.toFixed(4)}`);
    
    // Print detailed results
    console.log('\n=== DETAILED RESULTS ===');
    results.forEach(result => {
      if (result.error) {
        console.log(`\n${result.id}: ERROR - ${result.error}`);
      } else {
        console.log(`\n${result.id}:`);
        console.log(`  Expected: ${result.expectedTechnologies.join(', ')}`);
        console.log(`  Actual: ${result.actualTechnologies.join(', ')}`);
        console.log(`  Matches: ${result.matches.length}`);
        console.log(`  False Positives: ${result.falsePositives.length}`);
        console.log(`  False Negatives: ${result.falseNegatives.length}`);
        console.log(`  Precision: ${result.precision.toFixed(4)}`);
        console.log(`  Recall: ${result.recall.toFixed(4)}`);
        console.log(`  F1 Score: ${result.f1Score.toFixed(4)}`);
      }
    });
    
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
