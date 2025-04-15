const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const getTagsFromJobDescription = require('./ai-tagging');

const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../resources', 'public')));
app.use(express.json());

// Ensure tech-screens directory exists
const techScreensDir = path.join(__dirname, '../resources', 'repos', 'tech-screens');
fs.mkdir(techScreensDir, { recursive: true }).catch(console.error);

// Define path for repository files
const repoDir = path.join(__dirname, '../resources', 'repos');
// Define path for question repository file
const questionRepoPath = path.join(repoDir, 'question-repo.json');
// Define path for training screens
const trainingScreensDir = path.join(__dirname, '../..', 'test', 'resources', 'training-screens');

// Ensure repository directory exists
fs.mkdir(repoDir, { recursive: true }).catch(console.error);

// Initialize question repository if it doesn't exist
async function initializeQuestionRepo() {
    try {
        await fs.access(questionRepoPath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, create it with empty repository
            await fs.writeFile(questionRepoPath, JSON.stringify({
                technologies: {},
                updatedAt: new Date().toISOString()
            }, null, 2));
            console.log('Created new question repository file');
        } else {
            console.error('Error checking question repository:', error);
        }
    }
}

// Initialize the repository on server start
initializeQuestionRepo().catch(console.error);

// Get all tech screens
app.get('/api/tech-screens', async (req, res) => {
    try {
        const files = await fs.readdir(techScreensDir);
        const techScreens = await Promise.all(
            files
                .filter(file => file.endsWith('.json'))
                .map(async file => {
                    const content = await fs.readFile(path.join(techScreensDir, file), 'utf8');
                    return JSON.parse(content);
                })
        );
        res.json(techScreens);
    } catch (error) {
        console.error('Error reading tech screens:', error);
        res.status(500).json({ error: 'Failed to read tech screens' });
    }
});

// Get a single tech screen
app.get('/api/tech-screens/:id', async (req, res) => {
    try {
        const filePath = path.join(techScreensDir, `${req.params.id}.json`);
        const content = await fs.readFile(filePath, 'utf8');
        
        res.json(JSON.parse(content));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Tech screen not found' });
        } else {
            console.error('Error reading tech screen:', error);
            res.status(500).json({ error: 'Failed to read tech screen' });
        }
    }
});

// Create or update tech screen base info
app.post('/api/tech-screens', async (req, res) => {
    try {
        const techScreen = {
            id: req.body.id || crypto.randomUUID(),
            createdAt: req.body.createdAt || new Date().toISOString(),
            candidateName: req.body.candidateName,
            client: req.body.client,
            role: req.body.role,
            recruiterName: req.body.recruiterName,
            screenDate: req.body.screenDate,
            screenTime: req.body.screenTime,
            jobDescription: req.body.jobDescription,
            technologies: req.body.technologies || [],
            questions: req.body.questions || {}
        };

        // I always want to start with the tags for Agile, Git, and CI/CD
        if (!techScreen.technologies || techScreen.technologies.length === 0) {
            techScreen.technologies = ['Agile', 'Git', 'CI/CD'];
        }
        
        // Ensure questions object has entries for all technologies
        const updatedQuestions = {};
        for (const tech of techScreen.technologies) {
            updatedQuestions[tech] = techScreen.questions[tech] || [];
        }
        techScreen.questions = updatedQuestions;

        // Check for empty question arrays and populate from repository if available
        for (const [technology, questions] of Object.entries(techScreen.questions)) {
            if (Array.isArray(questions) && questions.length === 0) {
                try {
                    const repoContent = await fs.readFile(questionRepoPath, 'utf8');
                    const repoData = JSON.parse(repoContent);
                    if (repoData.technologies && Array.isArray(repoData.technologies[technology])) {
                        techScreen.questions[technology] = repoData.technologies[technology];
                    }
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.error(`Error loading repository questions for ${technology}:`, error);
                    }
                }
            }
        }

        const filePath = path.join(techScreensDir, `${techScreen.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(techScreen, null, 2));
        res.json(techScreen);
    } catch (error) {
        console.error('Error saving tech screen:', error);
        res.status(500).json({ error: 'Failed to save tech screen' });
    }
});

// Get questions for a specific technology from repository
app.get('/api/question-repo/:technology', async (req, res) => {
    try {
        const technology = req.params.technology;
        
        try {
            const content = await fs.readFile(questionRepoPath, 'utf8');
            const data = JSON.parse(content);
            
            // Return questions for the requested technology or empty array if not found
            res.json(data.technologies[technology] || []);
        } catch (error) {
            if (error.code === 'ENOENT') {
                res.json([]); // Return empty array if file doesn't exist
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error reading from question repository:', error);
        res.status(500).json({ error: 'Failed to read from question repository' });
    }
});

// Save questions for a specific technology to repository
app.post('/api/question-repo/:technology', async (req, res) => {
    try {
        const technology = req.params.technology;
        const questions = req.body.questions;

        if (!Array.isArray(questions)) {
            return res.status(400).json({ error: 'Questions must be an array' });
        }

        // Read the current repository
        let data;
        try {
            const content = await fs.readFile(questionRepoPath, 'utf8');
            data = JSON.parse(content);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Initialize with empty repository if file doesn't exist
                data = { technologies: {}, updatedAt: new Date().toISOString() };
            } else {
                throw error;
            }
        }

        // Update the technology's questions
        data.technologies[technology] = questions;
        data.updatedAt = new Date().toISOString();

        // Write back to the file
        await fs.writeFile(questionRepoPath, JSON.stringify(data, null, 2));
        
        res.json({ technology, questions });
    } catch (error) {
        console.error('Error saving to question repository:', error);
        res.status(500).json({ error: 'Failed to save to question repository' });
    }
});

// Get AI suggestions for technologies based on job description
app.post('/api/ai-suggestions/:techScreenId', async (req, res) => {
    try {
        // Get the tech screen
        const filePath = path.join(techScreensDir, `${req.params.techScreenId}.json`);
        const content = await fs.readFile(filePath, 'utf8');
        const techScreen = JSON.parse(content);

        // Get AI suggestions
        const suggestions = await getTagsFromJobDescription(techScreen.jobDescription);
        res.json(suggestions);
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        res.status(500).json({ error: 'Failed to get AI suggestions' });
    }
});

// Get all AI test screens
app.get('/api/ai-testing/screens', async (req, res) => {
    try {
        const files = await fs.readdir(trainingScreensDir);
        const testScreens = await Promise.all(
            files
                .filter(file => file.endsWith('.json'))
                .map(async file => {
                    const content = await fs.readFile(path.join(trainingScreensDir, file), 'utf8');
                    const data = JSON.parse(content);
                    return {
                        id: file.replace('.json', ''),
                        ...data
                    };
                })
        );
        
        // Sort by test ID in ascending order
        testScreens.sort((a, b) => {
            const idA = parseInt(a.id.split('_')[1]);
            const idB = parseInt(b.id.split('_')[1]);
            return idA - idB;
        });
        
        res.json(testScreens);
    } catch (error) {
        console.error('Error reading AI test screens:', error);
        res.status(500).json({ error: 'Failed to read AI test screens' });
    }
});

// Get a single AI test screen
app.get('/api/ai-testing/screens/:id', async (req, res) => {
    try {
        const filePath = path.join(trainingScreensDir, `${req.params.id}.json`);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Add the ID to the response
        const response = {
            id: req.params.id,
            ...data
        };
        
        res.json(response);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'AI test screen not found' });
        } else {
            console.error('Error reading AI test screen:', error);
            res.status(500).json({ error: 'Failed to read AI test screen' });
        }
    }
});

// Save changes to an AI test screen
app.post('/api/ai-testing/screens/:id', async (req, res) => {
    try {
        const testId = req.params.id;
        const filePath = path.join(trainingScreensDir, `${testId}.json`);
        
        // Read the existing file
        let testScreen;
        try {
            const content = await fs.readFile(filePath, 'utf8');
            testScreen = JSON.parse(content);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // If file doesn't exist, create a new one
                testScreen = {};
            } else {
                throw error;
            }
        }
        
        // Update with new data
        testScreen = {
            ...testScreen,
            jobDescription: req.body.jobDescription || testScreen.jobDescription,
            technologies: req.body.technologies || testScreen.technologies || [],
            updatedAt: new Date().toISOString()
        };
        
        // Write back to file
        await fs.writeFile(filePath, JSON.stringify(testScreen, null, 2));
        
        res.json({
            id: testId,
            ...testScreen
        });
    } catch (error) {
        console.error('Error saving AI test screen:', error);
        res.status(500).json({ error: 'Failed to save AI test screen' });
    }
});

// Get AI suggestions for a test screen job description
app.post('/api/ai-testing/ai-suggestions/:techScreenId', async (req, res) => {
    try {
        // Get the tech screen
        const filePath = path.join(trainingScreensDir, `${req.params.techScreenId}.json`);
        const content = await fs.readFile(filePath, 'utf8');
        const techScreen = JSON.parse(content);

        // Get AI suggestions
        const suggestions = await getTagsFromJobDescription(techScreen.jobDescription);
        res.json(suggestions);
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        res.status(500).json({ error: 'Failed to get AI suggestions' });
    }
});


// Basic route for the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../resources', 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`AI testing and training data features available at http://localhost:${port}/ai-testing`);
}); 