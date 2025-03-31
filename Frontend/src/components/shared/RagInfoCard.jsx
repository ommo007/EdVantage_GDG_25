import { Database, BookOpen, Search, Lightbulb } from 'lucide-react';

const RagInfoCard = ({ expanded = false }) => {
  return (
    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
      <div className="flex items-start">
        <div className="p-2 bg-indigo-100 rounded-md mr-3">
          <Database className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h4 className="font-medium text-indigo-900 mb-1">What is RAG?</h4>
          <p className="text-indigo-700 text-sm">
            Retrieval Augmented Generation (RAG) combines the power of large language models with 
            document retrieval to provide accurate, contextually relevant answers based on your specific course materials.
          </p>
          
          {expanded && (
            <div className="mt-4 space-y-3">
              <div className="flex">
                <div className="p-1 bg-indigo-100 rounded-full mr-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="text-xs text-indigo-700">
                  <span className="font-medium">Material Indexing:</span> Your course documents are processed, indexed, and stored for fast retrieval.
                </p>
              </div>
              
              <div className="flex">
                <div className="p-1 bg-indigo-100 rounded-full mr-2">
                  <Search className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="text-xs text-indigo-700">
                  <span className="font-medium">Smart Retrieval:</span> When a question is asked, the system finds the most relevant passages from your materials.
                </p>
              </div>
              
              <div className="flex">
                <div className="p-1 bg-indigo-100 rounded-full mr-2">
                  <Lightbulb className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="text-xs text-indigo-700">
                  <span className="font-medium">AI-Powered Answers:</span> Gemini 2.5 Pro generates answers based on the retrieved information, ensuring accuracy and relevance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RagInfoCard;
