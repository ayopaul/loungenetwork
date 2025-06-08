// components/admin/ImageUpload.tsx
"use client";

import { useState, useRef, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedImage {
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadType: 'cover' | 'content';
}

interface ImageUploadProps {
  stationId: string;
  postId?: string;
  onImageUploaded?: (image: UploadedImage) => void;
  onCoverImageSet?: (url: string) => void;
  type?: 'cover' | 'content';
  currentCoverImage?: string;
  className?: string;
}

export default function ImageUpload({
  stationId,
  postId,
  onImageUploaded,
  onCoverImageSet,
  type = 'content',
  currentCoverImage,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('stationId', stationId);
      formData.append('type', type);
      if (postId) {
        formData.append('postId', postId);
      }

      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload/blog', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result: UploadedImage = await response.json();
      
      setUploadedImages(prev => [...prev, result]);
      
      if (type === 'cover' && onCoverImageSet) {
        onCoverImageSet(result.url);
      }
      
      onImageUploaded?.(result);
      
      toast.success('Image uploaded successfully');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyMarkdown = (image: UploadedImage) => {
    const markdown = `![${image.filename}](${image.url})`;
    navigator.clipboard.writeText(markdown);
    toast.success('Markdown copied to clipboard');
  };

  const deleteImage = async (image: UploadedImage) => {
    try {
      const params = new URLSearchParams({
        stationId,
        filename: image.filename,
      });
      if (postId) params.append('postId', postId);

      const response = await fetch(`/api/upload/blog?${params}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUploadedImages(prev => prev.filter(img => img.filename !== image.filename));
        toast.success('Image deleted');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-sm font-medium">
          {type === 'cover' ? 'Cover Image' : 'Upload Images'}
        </Label>
        
        <div
          className={`
            mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-2">
            {uploading ? (
              <>
                <Upload className="h-8 w-8 text-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs" />
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop an image here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current Cover Image Preview */}
      {type === 'cover' && currentCoverImage && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Cover Image</Label>
          <div className="relative inline-block">
            <img 
              src={currentCoverImage}
              alt="Cover"
              className="w-32 h-32 object-cover rounded border"
            />
          </div>
        </div>
      )}

      {/* Uploaded Images Gallery */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Uploaded Images ({uploadedImages.length})
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group border rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-24 object-cover"
                />
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyMarkdown(image)}
                    className="h-8 w-8 p-0"
                    title="Copy Markdown"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteImage(image)}
                    className="h-8 w-8 p-0"
                    title="Delete Image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-1 truncate">
                  {image.filename}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}