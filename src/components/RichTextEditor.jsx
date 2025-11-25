import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Image } from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { Link } from '@tiptap/extension-link';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

const RichTextEditor = ({ content, onChange, placeholder = "Mulai tulis konten Anda..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer', 
        }
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto object-contain',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 w-full text-left',
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
          class: 'border border-gray-300 px-4 py-2 align-top',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content focus:outline-none min-h-[300px] p-4', 
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.chain().setContent(content, false).run(); 
    }
  }, [content, editor]);

  const handleAddImage = useCallback(() => {
    const url = window.prompt('Masukkan URL gambar:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleSetLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Masukkan URL:', previousUrl);

    if (url === null) return; 
    
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const handleAddTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  // ✅ PERBAIKAN: Menambahkan type="button" di sini
  const ToolbarButton = ({ command, isActiveCheck, title, children, className = '' }) => (
    <button
      type="button" 
      onClick={() => editor.chain().focus()[command]().run()}
      disabled={!editor.can()[command]} 
      className={`p-2 rounded transition-all duration-200 text-sm ${
        isActiveCheck
          ? 'bg-indigo-600 text-white shadow-md'
          : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
      } ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      title={title}
    >
      {children}
    </button>
  );

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-gray-300 rounded-lg bg-gray-50">
        <div className="text-gray-500">Memuat editor...</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-300 rounded-lg">
      
      {/* 🛠️ TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        
        {/* TEXT FORMATTING */}
        <div className="flex items-center pr-2 mr-2 border-r border-gray-300">
          <ToolbarButton command="toggleBold" isActiveCheck={editor.isActive('bold')} title="Tebal (Ctrl+B)">
            <span className="font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton command="toggleItalic" isActiveCheck={editor.isActive('italic')} title="Miring (Ctrl+I)">
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton command="toggleStrike" isActiveCheck={editor.isActive('strike')} title="Coret">
            <span className="line-through">S</span>
          </ToolbarButton>
        </div>

        {/* HEADINGS & PARAGRAPH */}
        <div className="flex items-center pr-2 mr-2 border-r border-gray-300">
          <ToolbarButton 
            command="setParagraph" 
            isActiveCheck={editor.isActive('paragraph')} 
            title="Paragraf"
            className={editor.isActive('paragraph') ? 'bg-indigo-600' : ''}>
            P
          </ToolbarButton>
          
          {/* H1 (PERBAIKAN: Menambahkan type="button") */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            disabled={!editor.can().toggleHeading({ level: 1 })}
            className={`p-2 rounded transition-all duration-200 text-sm ${
              editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Heading 1"
          >
            <span className="font-bold">H1</span>
          </button>
          
          {/* H2 (PERBAIKAN: Menambahkan type="button") */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={!editor.can().toggleHeading({ level: 2 })}
            className={`p-2 rounded transition-all duration-200 text-sm ${
              editor.isActive('heading', { level: 2 }) ? 'bg-green-600 text-white shadow-md' : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Heading 2"
          >
            <span className="font-bold">H2</span>
          </button>
        </div>

        {/* LISTS & CODE BLOCKS */}
        <div className="flex items-center pr-2 mr-2 border-r border-gray-300">
          <ToolbarButton command="toggleBulletList" isActiveCheck={editor.isActive('bulletList')} title="Daftar Poin">
            • List
          </ToolbarButton>
          <ToolbarButton command="toggleOrderedList" isActiveCheck={editor.isActive('orderedList')} title="Daftar Nomor">
            1. List
          </ToolbarButton>
          <ToolbarButton command="toggleCode" isActiveCheck={editor.isActive('code')} title="Kode Inline">
            {'</>'}
          </ToolbarButton>
          <ToolbarButton 
            command="toggleCodeBlock" 
            isActiveCheck={editor.isActive('codeBlock')} 
            title="Blok Kode"
            className={editor.isActive('codeBlock') ? 'bg-yellow-600' : ''}>
            ⧼⧽
          </ToolbarButton>
        </div>

        {/* TABLE, MEDIA & LINKS */}
        <div className="flex items-center pr-2 mr-2 border-r border-gray-300">
          {/* PERBAIKAN: Menambahkan type="button" */}
          <button
            type="button"
            onClick={handleAddTable}
            className="p-2 text-gray-700 transition-all duration-200 rounded hover:bg-gray-200 hover:shadow-sm"
            title="Sisipkan Tabel">
            📊
          </button>
          
          {/* PERBAIKAN: Menambahkan type="button" */}
          <button
            type="button"
            onClick={() => {
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
                      <tr><td><code>+</code></td><td>Penjumlahan</td><td><code>5 + 3</code></td><td>8</td></tr>
                      <tr><td><code>-</code></td><td>Pengurangan</td><td><code>5 - 3</code></td><td>2</td></tr>
                      <tr><td><code>*</code></td><td>Perkalian</td><td><code>5 * 3</code></td><td>15</td></tr>
                      <tr><td><code>/</code></td><td>Pembagian</td><td><code>10 / 2</code></td><td>5</td></tr>
                      <tr><td><code>%</code></td><td>Sisa bagi</td><td><code>10 % 3</code></td><td>1</td></tr>
                    </tbody>
                  </table>
                `;
                editor.chain().focus().insertContent(tableHTML).run();
            }}
            className="p-2 text-green-700 transition-all duration-200 rounded hover:bg-green-200 hover:shadow-sm"
            title="Template Tabel Operator">
            ∑ Table
          </button>

          {/* PERBAIKAN: Menambahkan type="button" */}
          <button
            type="button"
            onClick={handleSetLink}
            className={`p-2 rounded transition-all duration-200 ${
              editor.isActive('link') ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-200 text-gray-700 hover:shadow-sm'
            }`}
            title="Tambahkan/Ubah Link">
            🔗
          </button>
          {/* PERBAIKAN: Menambahkan type="button" */}
          <button
            type="button"
            onClick={handleAddImage}
            className="p-2 text-gray-700 transition-all duration-200 rounded hover:bg-gray-200 hover:shadow-sm"
            title="Tambahkan Gambar">
            🖼️
          </button>
        </div>
        
        {/* TABLE CONTROLS (PERBAIKAN: Menambahkan type="button" pada setiap tombol) */}
        {editor.isActive('table') && (
          <div className="flex items-center pr-2 mr-2 border-r border-gray-300 rounded-md bg-yellow-50">
            <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="p-2 text-gray-700 hover:bg-yellow-200" title="Tambah Kolom Kiri">+Col←</button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-2 text-gray-700 hover:bg-yellow-200" title="Tambah Kolom Kanan">+Col→</button>
            <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className="p-2 text-gray-700 hover:bg-yellow-200" title="Tambah Baris Atas">+Row↑</button>
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="p-2 text-red-700 hover:bg-red-200" title="Hapus Tabel">🗑️</button>
          </div>
        )}

        {/* UNDO/REDO */}
        <div className="flex items-center">
          <ToolbarButton command="undo" isActiveCheck={false} title="Undo (Ctrl+Z)">↶</ToolbarButton>
          <ToolbarButton command="redo" isActiveCheck={false} title="Redo (Ctrl+Y)">↷</ToolbarButton>
        </div>
      </div>

      {/* ✍️ EDITOR AREA */}
      <div className="min-h-[400px] max-h-[600px] overflow-y-auto relative">
        <EditorContent 
          editor={editor}
          className="tiptap-editor"
        />
        
        {/* Placeholder Custom */}
        {!content || content === '<p></p>' || content === '<p><br></p>' ? (
          <div className="absolute text-center text-gray-400 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2">
            <div className="mb-2 text-lg">✏️</div>
            <div>{placeholder}</div>
            <div className="mt-2 text-xs">Mulai mengetik atau gunakan toolbar di atas</div>
          </div>
        ) : null}
      </div>

      {/* 📊 STATUS BAR */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div>
            Kata: <strong>{editor.getText().split(/\s+/).filter(word => word.length > 0).length}</strong>
          </div>
          <div>
            Karakter: <strong>{editor.getText().length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;