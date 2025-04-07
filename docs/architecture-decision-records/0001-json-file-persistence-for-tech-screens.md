# ADR 0001: JSON File Persistence for Tech Screens

## Status
Accepted

## Context
The application needs to persist tech screen information, including:
- Candidate information
- Client information
- Job descriptions
- Tagged technologies
- Questions and their ordering
- Interview forms

The initial version of the application requires a simple, file-based persistence solution that can be easily versioned and backed up.

## Decision
We will persist tech screen information using JSON files stored in a `tech-screens` directory at the root of the project. Each tech screen will be stored in its own JSON file with a unique identifier as the filename.

The JSON structure will follow this general format:
```json
{
  "id": "unique-identifier",
  "createdAt": "ISO datetime string",
  "candidateName": "string",
  "client": "string",
  "role": "string",
  "screenDate": "date string format: 2025-04-04",
  "screenTime": "time string format: 12:30",
  "jobDescription": "string",
  "technologies": ["string array of technology tags"],
  "questions": [
    {
      "<technology tag key>": ["string array of questions"]
    }
  ]
}
```

## Consequences
### Positive
- Simple to implement and maintain
- Easy to version control
- Human-readable format
- No database setup required
- Easy to backup and restore
- Can be easily migrated to a different storage solution in the future

### Negative
- Not suitable for concurrent access
- No built-in query capabilities
- May have performance issues with large numbers of tech screens
- No built-in data validation
- No built-in relationships between entities

## Notes
This is a temporary solution for the initial version of the application. As the application grows, we may need to consider migrating to a proper database solution, especially if we need to support concurrent access or require more complex querying capabilities. 