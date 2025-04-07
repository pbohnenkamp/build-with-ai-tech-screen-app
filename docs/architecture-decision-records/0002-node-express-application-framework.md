# ADR 0002: Node.js and Express Application Framework

## Status
Accepted

## Context
The tech screen application needs a web server that can:
- Serve static HTML files for the frontend
- Handle API requests for managing tech screens
- Provide a simple, maintainable codebase
- Support rapid development and iteration
- Be easy to deploy and run locally

## Decision
We will use Node.js with Express.js as our application framework. Express will serve both:
1. Static HTML files for the frontend
2. REST API endpoints for the backend services

The application structure will follow this pattern:
```
/
├── public/           # Static files (HTML, CSS, JS)
├── tech-screens/    # JSON file storage for the tech screens
├── question-repo/    # JSON file storage for the question repository
└── server.js        # Application entry point and services business logic
```

Key technical decisions:
- Use Express.js for routing and middleware
- Serve static files from the `public` directory
- Implement RESTful API endpoints for tech screen operations
- Use native Node.js `fs` module for JSON file operations
- Hard code configuration for now

## Consequences
### Positive
- Simple and straightforward setup
- Large ecosystem of npm packages
- Excellent documentation and community support
- Single language (JavaScript) for both frontend and backend
- Easy to deploy locally

### Negative
- No built-in type system (though TypeScript could be added later)
