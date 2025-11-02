export const developmentPrompts = [
  {
    title: "Code Review Assistant",
    promptText: "Review the following code for best practices, security issues, performance improvements, and code quality. Provide specific suggestions for improvement.",
    category: "Development",
    tags: "code-review, quality, security",
    expectedOutput: "Detailed code review with specific issues and suggestions",
    notes: "Use for PR reviews and code quality checks"
  },
  {
    title: "Bug Fix Helper",
    promptText: "I have a bug in my code. The error is: [ERROR MESSAGE]. The code is: [CODE]. Help me identify the root cause and provide a fix.",
    category: "Development",
    tags: "debugging, troubleshooting, fix",
    expectedOutput: "Root cause analysis and working code fix",
    notes: "Paste error message and code for quick debugging"
  },
  {
    title: "Algorithm Explainer",
    promptText: "Explain how this algorithm works and its time/space complexity: [ALGORITHM]. Provide examples of when to use it.",
    category: "Development",
    tags: "algorithms, optimization, learning",
    expectedOutput: "Clear explanation with complexity analysis and use cases",
    notes: "Great for learning and algorithm selection"
  },
  {
    title: "SQL Query Optimizer",
    promptText: "Optimize this SQL query for performance: [QUERY]. Explain the improvements and their impact.",
    category: "Development",
    tags: "sql, database, performance",
    expectedOutput: "Optimized query with performance analysis",
    notes: "Improves database query performance"
  },
  {
    title: "API Documentation Generator",
    promptText: "Generate clear and comprehensive API documentation for this endpoint: [ENDPOINT CODE]. Include parameters, responses, and examples.",
    category: "Development",
    tags: "api, documentation, rest",
    expectedOutput: "Complete API documentation in OpenAPI/Swagger format",
    notes: "Automate API docs creation from code"
  },
  {
    title: "Git Commit Message Helper",
    promptText: "Help me write a clear git commit message for these changes: [CHANGES]. Use conventional commit format.",
    category: "Development",
    tags: "git, version-control, documentation",
    expectedOutput: "Clear commit message following conventional commits",
    notes: "Improves code history and team communication"
  }
];
