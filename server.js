const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Ensure tech-screens directory exists
const techScreensDir = path.join(__dirname, 'tech-screens');
fs.mkdir(techScreensDir, { recursive: true }).catch(console.error);

// Ensure question-repo directory exists
const questionRepoDir = path.join(__dirname, 'question-repo');
fs.mkdir(questionRepoDir, { recursive: true }).catch(console.error);

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
                    const repoPath = path.join(questionRepoDir, `${technology}.json`);
                    const repoContent = await fs.readFile(repoPath, 'utf8');
                    const repoData = JSON.parse(repoContent);
                    if (Array.isArray(repoData.questions)) {
                        techScreen.questions[technology] = repoData.questions;
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
        const filePath = path.join(questionRepoDir, `${technology}.json`);
        
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);
            res.json(data.questions || []);
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

        const filePath = path.join(questionRepoDir, `${technology}.json`);
        const data = {
            technology,
            updatedAt: new Date().toISOString(),
            questions: questions
        };

        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        res.json(data);
    } catch (error) {
        console.error('Error saving to question repository:', error);
        res.status(500).json({ error: 'Failed to save to question repository' });
    }
});

// Basic route for the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Basic route for the tech screen base info page
app.get('/tech-screen-base-info', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tech-screen-base-info.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 