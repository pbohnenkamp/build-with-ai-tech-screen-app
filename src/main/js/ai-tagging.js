/**
 * Get technologies from job description using an AI Prompt
 * @param {string} jobDescription - The job description to get technologies from
 * @param {object} [augmentationInput={}] - Object to hold any additional input for dynamically augmenting the prompt
 * @param {object} [promptOptions={}] - Object to hold any options to control the behavior prompt, e.g. caching enabled, etc.
 * @returns {Promise<string[]>} - The technologies found in the job description
 */
const getTagsFromJobDescription = async (
  jobDescription,
  augmentationInput = {},
  promptOptions = {}
) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return [];
};

module.exports = getTagsFromJobDescription;
