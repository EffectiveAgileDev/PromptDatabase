import { usePromptStore } from '@/store/promptStore';

interface SamplePrompt {
  title: string;
  promptText: string;
  category: string;
  tags: string;
  expectedOutput: string;
  notes: string;
}

const samplePrompts: SamplePrompt[] = [
  {
    title: "Code Review Assistant",
    promptText: "Please review the following code for best practices, potential bugs, and improvements. Focus on readability, performance, and maintainability:\n\n[PASTE CODE HERE]",
    category: "Development",
    tags: "code-review, development, quality",
    expectedOutput: "Detailed analysis with specific suggestions for improvement, highlighting both positive aspects and areas for enhancement.",
    notes: "Great for reviewing pull requests and ensuring code quality standards."
  },
  {
    title: "Email Improvement Helper",
    promptText: "Please improve the following email for clarity, professionalism, and effectiveness. Make it more concise while maintaining the key message:\n\n[PASTE EMAIL HERE]",
    category: "Writing",
    tags: "email, communication, professional",
    expectedOutput: "Revised email text with explanations of changes made and tips for future communication.",
    notes: "Useful for important business communications and client correspondence."
  },
  {
    title: "Document Summarizer",
    promptText: "Please create a comprehensive summary of the following document, highlighting key points, main arguments, and actionable insights:\n\n[PASTE DOCUMENT HERE]",
    category: "Analysis",
    tags: "summary, analysis, research",
    expectedOutput: "Structured summary with bullet points, key takeaways, and relevant action items.",
    notes: "Perfect for processing research papers, reports, and lengthy documents."
  }
];

interface WelcomeProps {
  onCreateFirst: () => void;
  onSkipTour: () => void;
}

export function Welcome({ onCreateFirst, onSkipTour }: WelcomeProps) {
  const { addPrompt } = usePromptStore();

  const handleUseTemplate = (template: SamplePrompt) => {
    addPrompt({
      title: template.title,
      promptText: template.promptText,
      category: template.category,
      tags: template.tags,
      expectedOutput: template.expectedOutput,
      notes: template.notes
    });
    onCreateFirst();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Prompt Database
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Your personal AI prompt management system. Organize, search, and reuse your prompts efficiently 
            to supercharge your AI-assisted workflows.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onCreateFirst}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Your First Prompt
            </button>
            
            <button
              onClick={onSkipTour}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Skip Tour
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Search</h3>
            <p className="text-gray-600">
              Find your prompts instantly with powerful search across titles, content, categories, and custom fields.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Fields</h3>
            <p className="text-gray-600">
              Extend your database with custom fields to track any information that matters to your workflow.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v6a2 2 0 002 2h2m2-4h.01M20 8v6a2 2 0 01-2 2h-2M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Copy</h3>
            <p className="text-gray-600">
              Copy prompts to your clipboard with one click, complete with usage tracking and formatting options.
            </p>
          </div>
        </div>

        {/* Sample Templates */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Start with a Template
          </h2>
          
          <p className="text-gray-600 text-center mb-8">
            Get started quickly with these proven prompt templates, or create your own from scratch.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {samplePrompts.map((prompt, index) => (
              <div key={index} className="border rounded-lg p-6 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{prompt.title}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {prompt.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {prompt.promptText.slice(0, 120)}...
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {prompt.tags.split(', ').map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleUseTemplate(prompt)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Use This Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Pro Tips for Getting Started</h3>
              <ul className="text-amber-700 space-y-1 text-sm">
                <li>• Use descriptive titles to make prompts easy to find later</li>
                <li>• Add tags for quick categorization and filtering</li>
                <li>• Include expected output to remember what results you're looking for</li>
                <li>• Use notes to document when and how to use each prompt effectively</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}