// components/admin/EnhancedMarkdownEditor.tsx
"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bold, Italic, Code, Heading, Link, List, ListOrdered, 
  Quote, Image as ImageIcon, Youtube, Eye, Edit3 
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import YouTube from '@/components/blog/YouTube';
import ImageUpload from './ImageUpload';

interface EnhancedMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  stationId: string;
  postId?: string;
  className?: string;
}

export default function EnhancedMarkdownEditor({
  value,
  onChange,
  stationId,
  postId,
  className = ''
}: EnhancedMarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const newText = text.slice(0, start) + before + text.slice(start, end) + after + text.slice(end);
    onChange(newText);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (end - start));
    }, 0);
  }, [onChange]);

  const insertNewLine = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const textValue = textarea.value;
    
    // Add newlines before and after if needed
    const beforeText = textValue.slice(0, start);
    const afterText = textValue.slice(start);
    
    const needsNewlineBefore = beforeText.length > 0 && !beforeText.endsWith('\n');
    const needsNewlineAfter = afterText.length > 0 && !afterText.startsWith('\n');
    
    const fullText = (needsNewlineBefore ? '\n' : '') + text + (needsNewlineAfter ? '\n' : '');
    
    const newText = beforeText + fullText + afterText;
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + fullText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  }, [onChange]);

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertAtCursor('**', '**'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertAtCursor('_', '_'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: Code,
      label: 'Inline Code',
      action: () => insertAtCursor('`', '`'),
      shortcut: 'Ctrl+`'
    },
    {
      icon: Heading,
      label: 'Heading',
      action: () => insertNewLine('## Heading'),
      shortcut: 'Ctrl+H'
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertAtCursor('[Link Text](https://example.com)'),
      shortcut: 'Ctrl+L'
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertNewLine('- List item'),
      shortcut: 'Ctrl+U'
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertNewLine('1. List item'),
      shortcut: 'Ctrl+O'
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertNewLine('> Quote text'),
      shortcut: 'Ctrl+Q'
    },
    {
      icon: ImageIcon,
      label: 'Image Upload',
      action: () => setShowImageUpload(!showImageUpload),
      shortcut: 'Ctrl+M'
    },
    {
      icon: Youtube,
      label: 'YouTube',
      action: () => insertAtCursor('<YouTube id="VIDEO_ID" />'),
      shortcut: 'Ctrl+Y'
    }
  ];

  const handleImageUploaded = (image: any) => {
    const markdown = `![${image.filename}](${image.url})`;
    insertNewLine(markdown);
    setShowImageUpload(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertAtCursor('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertAtCursor('_', '_');
          break;
        case '`':
          e.preventDefault();
          insertAtCursor('`', '`');
          break;
        case 'h':
          e.preventDefault();
          insertNewLine('## Heading');
          break;
        case 'l':
          e.preventDefault();
          insertAtCursor('[Link Text](https://example.com)');
          break;
        case 'u':
          e.preventDefault();
          insertNewLine('- List item');
          break;
        case 'o':
          e.preventDefault();
          insertNewLine('1. List item');
          break;
        case 'q':
          e.preventDefault();
          insertNewLine('> Quote text');
          break;
        case 'm':
          e.preventDefault();
          setShowImageUpload(!showImageUpload);
          break;
        case 'y':
          e.preventDefault();
          insertAtCursor('<YouTube id="VIDEO_ID" />');
          break;
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'write' | 'preview')}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <div className="text-xs text-muted-foreground">
            {value.length} characters
          </div>
        </div>

        <TabsContent value="write" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-lg border">
            {toolbarButtons.map((button, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="sm"
                onClick={button.action}
                title={`${button.label} (${button.shortcut})`}
                className="h-8 w-8 p-0 hover:bg-background"
              >
                <button.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* Image Upload Panel */}
          {showImageUpload && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <ImageUpload
                stationId={stationId}
                postId={postId}
                type="content"
                onImageUploaded={handleImageUploaded}
                className="mb-0"
              />
            </div>
          )}

          {/* Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your content in Markdown..."
              className="min-h-[400px] font-mono text-sm resize-none"
              style={{ 
                lineHeight: '1.5',
                tabSize: 2 
              }}
            />
            
            {/* Character count overlay */}
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              Lines: {value.split('\n').length}
            </div>
          </div>

          {/* Quick Help */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Quick Tips:</strong></p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <span>**bold** or __bold__</span>
              <span>*italic* or _italic_</span>
              <span>`inline code`</span>
              <span># Heading 1</span>
              <span>## Heading 2</span>
              <span>[link](url)</span>
              <span>![image](url)</span>
              <span>- bullet list</span>
              <span>1. numbered list</span>
              <span>&gt; blockquote</span>
              <span>```code block```</span>
              <span>&lt;YouTube id="..." /&gt;</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="min-h-[400px] prose dark:prose-invert max-w-none bg-background border rounded-lg p-6">
            {value.trim() ? (
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  YouTube: (props: any) => <YouTube id={props.id} />,
                } as any}
              >
                {value}
              </Markdown>
            ) : (
              <div className="text-muted-foreground italic">
                Nothing to preview. Start writing in the Write tab.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}