"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import FileHandler from "@tiptap/extension-file-handler";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  QuoteIcon,
  CodeIcon,
  UndoIcon,
  RedoIcon,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { convertImageToJpeg } from "@/lib/image-conversion";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  outputFormat?: "markdown" | "html";
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload - convert HEIC, compress, upload to /api/upload
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Convert and compress image using existing utility
      const processedFile = await convertImageToJpeg(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 1920,
        quality: 0.8,
      });

      // Upload to /api/upload
      const formData = new FormData();
      formData.append("files", processedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      if (data.uploaded && data.uploaded.length > 0) {
        return data.uploaded[0].url;
      }

      return null;
    } catch (error) {
      console.error("Image upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage);
      return null;
    }
  };

  // Handle multiple files (for drop/paste)
  const handleFiles = async (
    files: File[],
    editor: ReturnType<typeof useEditor>,
    position?: number,
  ) => {
    const imageFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type === "image/heic" ||
        file.type === "image/heif",
    );

    if (imageFiles.length === 0) {
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading(
      `Uploading ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}...`,
    );

    for (const file of imageFiles) {
      const url = await uploadImage(file);

      if (url && editor) {
        // Insert image at position (if dropped) or at cursor
        if (position !== undefined) {
          editor
            .chain()
            .focus()
            .insertContentAt(position, {
              type: "image",
              attrs: { src: url },
            })
            .run();
        } else {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
    }

    toast.dismiss(loadingToast);
    toast.success(
      `Uploaded ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}`,
    );
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
        },
      }),
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
          "image/avif",
          "image/heic",
          "image/heif",
        ],
        onDrop: (currentEditor, files, pos) => {
          handleFiles(files, currentEditor, pos);
        },
        onPaste: (currentEditor, files) => {
          handleFiles(files, currentEditor);
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      // For now, always output HTML
      // TODO: Add markdown support with @tiptap/extension-markdown
      const newContent = editor.getHTML();
      onChange(newContent);
    },
  });

  // Update content if it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2 rounded hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
        active && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </button>
  );

  return (
    <div className={cn("border rounded-lg bg-background", className)}>
      {/* Toolbar */}
      <div className="border-b p-2 flex items-center gap-1 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <BoldIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <ItalicIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
        >
          <CodeIcon className="size-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
        >
          <Heading1Icon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2Icon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3Icon className="size-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <ListIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrderedIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          <QuoteIcon className="size-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          <ImageIcon className="size-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <UndoIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <RedoIcon className="size-4" />
        </ToolbarButton>
      </div>

      {/* Hidden file input for toolbar button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0 && editor) {
            handleFiles(files, editor);
          }
          // Reset input so same file can be uploaded again
          e.target.value = "";
        }}
      />

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
