// src/components/ContentRenderer.jsx - SIMPLE HTML RENDERER
import React from 'react';

const ContentRenderer = ({ contentBlocks }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-100 rounded-lg">
        <p className="text-gray-600">No content available yet.</p>
      </div>
    );
  }

  // Extract HTML content dari blocks
  const getHTMLContent = () => {
    // Cari block yang ada HTML-nya (dari RichTextEditor)
    const htmlBlock = contentBlocks.find(block => 
      block.content?.html || 
      (typeof block.content === 'string' && block.content.includes('<'))
    );

    if (htmlBlock?.content?.html) {
      return htmlBlock.content.html;
    } else if (htmlBlock?.content && typeof htmlBlock.content === 'string') {
      return htmlBlock.content;
    }
    
    // Fallback: gabungkan semua content
    return contentBlocks.map(block => {
      if (block.content?.text) return block.content.text;
      if (block.text_content) return block.text_content;
      if (typeof block.content === 'string') return block.content;
      return '';
    }).join('\n\n');
  };

  const htmlContent = getHTMLContent();

  if (!htmlContent) {
    return (
      <div className="p-6 text-center bg-gray-100 rounded-lg">
        <p className="text-gray-600">No content available yet.</p>
      </div>
    );
  }

  // Process HTML untuk styling yang bagus
  const processedHTML = htmlContent
    // Headings
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4 border-b-2 border-blue-500 pb-2">')
    .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-gray-900 mt-6 mb-3 border-l-4 border-blue-400 pl-3">')
    .replace(/<h3>/g, '<h3 class="text-xl font-bold text-blue-700 mt-5 mb-2">')
    .replace(/<h4>/g, '<h4 class="text-lg font-bold text-gray-800 mt-4 mb-2">')
    
    // Paragraphs & Text
    .replace(/<p>/g, '<p class="mb-4 leading-relaxed text-gray-700">')
    .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4 bg-blue-50 py-2">')
    
    // Lists
    .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 text-gray-700 space-y-1">')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 text-gray-700 space-y-1">')
    .replace(/<li>/g, '<li class="mb-1">')
    
    // Code blocks (dari Tiptap/Lowlight)
    .replace(/<pre>/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700">')
    .replace(/<code class="language-/g, '<code class="text-sm ')
    .replace(/<code>/g, '<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm">')
    
    // Tables
    .replace(/<table>/g, '<table class="border-collapse border border-gray-300 w-full mb-4">')
    .replace(/<thead>/g, '<thead class="bg-gray-100">')
    .replace(/<th>/g, '<th class="border border-gray-300 px-4 py-2 font-semibold text-left">')
    .replace(/<td>/g, '<td class="border border-gray-300 px-4 py-2">')
    
    // Images
    .replace(/<img/g, '<img class="rounded-lg max-w-full h-auto my-4 shadow-md"');

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: processedHTML }}
      />
    </div>
  );
};

export default ContentRenderer;