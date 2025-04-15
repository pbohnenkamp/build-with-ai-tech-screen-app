const fs = require('fs');
const path = require('path');

/**
 * Returns a list of all technologies from the question repository
 * @returns {string[]} Array of technology names
 */
function getAllTechnologies() {
  try {
    // Read the JSON file
    const filePath = path.join(__dirname, '../../../repos/question-repo.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Extract and return the technology names
    return Object.keys(data.technologies);
  } catch (error) {
    console.error('Error reading question repository:', error);
    return [];
  }
}

module.exports = {
  getAllTechnologies
}; 
