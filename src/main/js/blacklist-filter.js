// Array to hold blacklisted technologies
const blacklistedTechnologies = [
    'Github',
    'Web APIs',
    'Web API',
    'Cloud Services',
    'AI',
    'HTML',
    'Git',
    'Agile',
    'CI/CD',
    'CICD',
    'APIs',
    'SDLC',
    'Web Development',
    'full stack development',
    'Jira',
    'RDBMS',
    '.NET Core'
];

/**
 * Filters an array of technologies against the blacklist
 * @param {string[]} technologies - Array of technology names to filter
 * @param {string[]} [blacklist=blacklistedTechnologies] - Array of technology names to filter out
 * @returns {string[]} - Filtered array of technologies
 */
export function filterTechnologies(technologies, blacklist = blacklistedTechnologies) {
    // If blacklist is empty, return original array
    if (!blacklist || blacklist.length === 0) {
        return technologies;
    }
    
    // Convert blacklist to lowercase for case-insensitive comparison
    const lowercaseBlacklist = blacklist.map(item => item.toLowerCase());
    
    // Filter out any technologies that are in the blacklist (case-insensitive)
    return technologies.filter(tech => !lowercaseBlacklist.includes(tech.toLowerCase()));
}
