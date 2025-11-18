// src/components/RichTextEditor.jsx - IMPROVED INTERACTIVE VERSION
import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your content..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 px-4 py-2 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      // ✅ FORCE RE-RENDER SAAT SELECTION BERUBAH
      console.log('Selection updated:', editor.state.selection);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
    // ✅ TAMBAHIN INI UNTUK BETTER PERFORMANCE
    immediatelyRender: false,
  });

  // ✅ FORCE CONTENT UPDATE SAAT PROP BERUBAH
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const insertOperatorTable = useCallback(() => {
    const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Operator</th>
            <th>Fungsi</th>
            <th>Contoh</th>
            <th>Hasil</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>+</code></td>
            <td>Penjumlahan</td>
            <td><code>5 + 3</code></td>
            <td>8</td>
          </tr>
          <tr>
            <td><code>-</code></td>
            <td>Pengurangan</td>
            <td><code>5 - 3</code></td>
            <td>2</td>
          </tr>
          <tr>
            <td><code>*</code></td>
            <td>Perkalian</td>
            <td><code>5 * 3</code></td>
            <td>15</td>
          </tr>
          <tr>
            <td><code>/</code></td>
            <td>Pembagian</td>
            <td><code>10 / 2</code></td>
            <td>5</td>
          </tr>
          <tr>
            <td><code>%</code></td>
            <td>Sisa bagi</td>
            <td><code>10 % 3</code></td>
            <td>1</td>
          </tr>
        </tbody>
      </table>
    `;
    
    editor.chain().focus().insertContent(tableHTML).run();
  }, [editor]);

  // ✅ DEBUG FUNCTION - CEK STATE EDITOR
  const debugEditor = useCallback(() => {
    if (!editor) return;
    console.log('=== EDITOR DEBUG ===');
    console.log('Content:', editor.getHTML());
    console.log('Selection:', editor.state.selection);
    console.log('Active marks:', {
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      strike: editor.isActive('strike'),
    });
    console.log('Active nodes:', {
      heading1: editor.isActive('heading', { level: 1 }),
      heading2: editor.isActive('heading', { level: 2 }),
      heading3: editor.isActive('heading', { level: 3 }),
      codeBlock: editor.isActive('codeBlock'),
    });
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-gray-300 rounded-lg bg-gray-50">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-300 rounded-lg">
      {/* TOOLBAR - DENGAN BETTER FEEDBACK */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        
        {/* TEXT FORMATTING - IMPROVED VISUAL FEEDBACK */}
        <div className="flex items-center pr-2 mr-2 border-r border-gray-300">
          <button
            onClick={() => {
              editor.chain().focus().toggleBold().run();
              debugEditor(); // ✅ DEBUG
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('bold') 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Bold (Ctrl+B)"
          >
            <span className={`text-sm font-bold ${editor.isActive('bold') ? 'text-white' : ''}`}>B</span>
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleItalic().run();
              debugEditor();
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('italic') 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Italic (Ctrl+I)"
          >
            <span className={`text-sm italic ${editor.isActive('italic') ? 'text-white' : ''}`}>I</span>
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleStrike().run();
              debugEditor();
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('strike') 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Strikethrough"
          >
            <span className={`text-sm line-through ${editor.isActive('strike') ? 'text-white' : ''}`}>S</span>
          </button>
        </div>

        {/* HEADINGS - IMPROVED VISUAL FEEDBACK */}
        <div className="flex items-center pr-2 mr-2 border-r border-gray-300">
          <button
            onClick={() => {
              editor.chain().focus().setParagraph().run();
              debugEditor();
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('paragraph') 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Paragraph"
          >
            <span className={`text-sm ${editor.isActive('paragraph') ? 'text-white' : ''}`}>P</span>
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
              debugEditor();
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('heading', { level: 1 }) 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Heading 1"
          >
            <span className={`text-sm font-bold ${editor.isActive('heading', { level: 1 }) ? 'text-white' : ''}`}>H1</span>
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              debugEditor();
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('heading', { level: 2 }) 
                ? 'bg-green-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Heading 2"
          >
            <span className={`text-sm font-bold ${editor.isActive('heading', { level: 2 }) ? 'text-white' : ''}`}>H2</span>
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
              debugEditor();
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('heading', { level: 3 }) 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Heading 3"
          >
            <span className={`text-sm font-bold ${editor.isActive('heading', { level: 3 }) ? 'text-white' : ''}`}>H3</span>
          </button>
        </div>

        {/* LISTS & ALIGNMENT */}
        <div className="flex items-center pr-2 mr-2 border-r border-gray-300">
          <button
            onClick={() => {
              editor.chain().focus().toggleBulletList().run();
              debugEditor();
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('bulletList') 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Bullet List"
          >
            <span className={`text-sm ${editor.isActive('bulletList') ? 'text-white' : ''}`}>• List</span>
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run();
              debugEditor();
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('orderedList') 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Numbered List"
          >
            <span className={`text-sm ${editor.isActive('orderedList') ? 'text-white' : ''}`}>1. List</span>
          </button>
        </div>

        {/* CODE & BLOCKS */}
        <div className="flex items-center pr-2 mr-2 border-r border-gray-300">
          <button
            onClick={() => {
              editor.chain().focus().toggleCode().run();
              debugEditor();
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('code') 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Inline Code"
          >
            <span className={`text-sm ${editor.isActive('code') ? 'text-white' : ''}`}>{'</>'}</span>
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleCodeBlock().run();
              debugEditor();
            }}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('codeBlock') 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Code Block"
          >
            <span className={`text-sm ${editor.isActive('codeBlock') ? 'text-white' : ''}`}>⧼⧽</span>
          </button>
        </div>

        {/* TABLE */}
        <div className="flex items-center pr-2 mr-2 border-r border-gray-300">
          <button
            onClick={addTable}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('table') 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Insert Table"
          >
            <span className={`text-sm ${editor.isActive('table') ? 'text-white' : ''}`}>📊</span>
          </button>
          
          <button
            onClick={insertOperatorTable}
            className="p-2 text-green-700 transition-all duration-200 rounded hover:bg-green-200 hover:shadow-sm"
            title="Insert Operator Table Template"
          >
            <span className="text-sm">∑ Table</span>
          </button>

          {editor.isActive('table') && (
            <>
              <button
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="p-2 text-gray-700 transition-all duration-200 rounded hover:bg-gray-200 hover:shadow-sm"
                title="Add Column Before"
              >
                <span className="text-sm">+Col←</span>
              </button>
              <button
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="p-2 text-gray-700 transition-all duration-200 rounded hover:bg-gray-200 hover:shadow-sm"
                title="Add Column After"
              >
                <span className="text-sm">+Col→</span>
              </button>
              <button
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="p-2 text-gray-700 transition-all duration-200 rounded hover:bg-gray-200 hover:shadow-sm"
                title="Add Row Before"
              >
                <span className="text-sm">+Row↑</span>
              </button>
              <button
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="p-2 text-gray-700 transition-all duration-200 rounded hover:bg-gray-200 hover:shadow-sm"
                title="Add Row After"
              >
                <span className="text-sm">+Row↓</span>
              </button>
              <button
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="p-2 text-red-700 transition-all duration-200 rounded hover:bg-red-200 hover:shadow-sm"
                title="Delete Table"
              >
                <span className="text-sm">🗑️</span>
              </button>
            </>
          )}
        </div>

        {/* MEDIA & LINKS */}
        <div className="flex items-center pr-2 mr-2 border-r border-gray-300">
          <button
            onClick={setLink}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('link') 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Add Link"
          >
            <span className={`text-sm ${editor.isActive('link') ? 'text-white' : ''}`}>🔗</span>
          </button>
          <button
            onClick={addImage}
            className="p-2 text-gray-700 transition-all duration-200 rounded hover:bg-gray-200 hover:shadow-sm"
            title="Add Image"
          >
            <span className="text-sm">🖼️</span>
          </button>
        </div>

        {/* UNDO/REDO & DEBUG */}
        <div className="flex items-center">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 text-gray-700 transition-all duration-200 rounded hover:bg-gray-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <span className="text-sm">↶</span>
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 text-gray-700 transition-all duration-200 rounded hover:bg-gray-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <span className="text-sm">↷</span>
          </button>
          
          {/* DEBUG BUTTON */}
          <button
            onClick={debugEditor}
            className="p-2 text-orange-600 transition-all duration-200 rounded hover:bg-orange-200 hover:shadow-sm"
            title="Debug Editor State"
          >
            <span className="text-sm">🐛</span>
          </button>
        </div>
      </div>

      {/* EDITOR AREA */}
      <div className="min-h-[400px] max-h-[600px] overflow-y-auto relative">
        <EditorContent 
          editor={editor}
          className="tiptap-editor"
        />
        
        {!content || content === '<p></p>' || content === '<p><br></p>' ? (
          <div className="absolute text-center text-gray-400 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2">
            <div className="mb-2 text-lg">✏️</div>
            <div>{placeholder}</div>
            <div className="mt-2 text-xs">Start typing or use the toolbar above</div>
          </div>
        ) : null}
      </div>

      {/* STATUS BAR - IMPROVED WITH REAL-TIME FEEDBACK */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div>
            Words: <strong>{editor.getText().split(/\s+/).filter(word => word.length > 0).length}</strong>
          </div>
          <div>
            Characters: <strong>{editor.getText().length}</strong>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* REAL-TIME ACTIVE FORMAT INDICATORS */}
          {editor.isActive('heading', { level: 1 }) && (
            <span className="px-2 py-1 text-white bg-blue-600 rounded shadow-sm">H1</span>
          )}
          {editor.isActive('heading', { level: 2 }) && (
            <span className="px-2 py-1 text-white bg-green-600 rounded shadow-sm">H2</span>
          )}
          {editor.isActive('heading', { level: 3 }) && (
            <span className="px-2 py-1 text-white bg-purple-600 rounded shadow-sm">H3</span>
          )}
          {editor.isActive('paragraph') && !editor.isActive('heading') && (
            <span className="px-2 py-1 text-gray-700 bg-gray-200 rounded shadow-sm">Paragraph</span>
          )}
          {editor.isActive('codeBlock') && (
            <span className="px-2 py-1 text-white bg-yellow-600 rounded shadow-sm">Code Block</span>
          )}
          {editor.isActive('table') && (
            <span className="px-2 py-1 text-white bg-indigo-600 rounded shadow-sm">Table</span>
          )}
          {editor.isActive('bold') && (
            <span className="px-2 py-1 text-white bg-red-600 rounded shadow-sm">Bold</span>
          )}
          {editor.isActive('italic') && (
            <span className="px-2 py-1 text-white bg-pink-600 rounded shadow-sm">Italic</span>
          )}
          {editor.isActive('strike') && (
            <span className="px-2 py-1 text-white bg-gray-600 rounded shadow-sm">Strike</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;