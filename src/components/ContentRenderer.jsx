import React from 'react';

const ContentRenderer = ({ contentBlocks }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-100 rounded-lg">
        <p className="text-gray-600">No content available yet.</p>
      </div>
    );
  }

  const renderContentBlock = (block, index) => {
    // ✅ FIX: HANDLE OBJECT CONTENT
    let content = '';
    
    if (typeof block.content === 'string') {
      content = block.content;
    } else if (typeof block.content === 'object') {
      // Jika content adalah object, extract text atau html
      content = block.content.text || block.content.html || JSON.stringify(block.content);
    } else if (block.text_content) {
      content = block.text_content;
    }

    switch (block.type) {
      case 'heading':
        const level = block.metadata?.level || 1;
        const HeadingTag = `h${level}`;
        return React.createElement(
          HeadingTag,
          {
            key: block.id || index,
            className: `font-bold text-gray-900 mt-6 mb-4 ${
              level === 1 ? 'text-3xl' :
              level === 2 ? 'text-2xl' :
              level === 3 ? 'text-xl' :
              'text-lg'
            }`
          },
          content // ✅ NOW IT'S A STRING, NOT OBJECT
        );

      case 'paragraph':
        return (
          <p key={block.id || index} className="mb-4 text-gray-700 leading-relaxed">
            {content} {/* ✅ NOW IT'S A STRING */}
          </p>
        );

      case 'code':
      case 'code_block':
        return (
          <div key={block.id || index} className="mb-4">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg">
              <span className="text-sm text-gray-300">
                {block.language || 'code'}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(content)}
                className="px-2 py-1 text-xs text-gray-300 bg-gray-700 rounded hover:bg-gray-600"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto bg-gray-900 rounded-b-lg">
              <code className={`text-sm text-green-400 language-${block.language}`}>
                {content}
              </code>
            </pre>
          </div>
        );

      case 'exercise':
        return (
          <div key={block.id || index} className="p-4 my-6 border-l-4 border-indigo-500 bg-indigo-50">
            <h4 className="font-semibold text-indigo-800">Exercise</h4>
            <p className="text-indigo-700">Exercise ID: {block.content?.exercise_id || 'N/A'}</p>
          </div>
        );

      case 'image':
        return (
          <div key={block.id || index} className="my-6 text-center">
            <img 
              src={content} 
              alt={block.metadata?.alt || 'Image'} 
              className="max-w-full mx-auto rounded-lg shadow-md"
            />
            {block.metadata?.caption && (
              <p className="mt-2 text-sm text-gray-600">{block.metadata.caption}</p>
            )}
          </div>
        );

        default:
        return (
          <div key={block.id || index} className="p-4 my-4 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-yellow-800">Unsupported content type: {block.type}</p>
            <pre className="text-xs">{JSON.stringify(block, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="prose max-w-none">
        {contentBlocks.map((block, index) => renderContentBlock(block, index))}
      </div>
    </div>
  );
};

export default ContentRenderer;