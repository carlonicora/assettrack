"use client";

import { Button } from "@/components/ui/button";
import { BlockNoteEditorFomattingToolbar } from "@/features/common/components/editor/BlockNoteEditorFormattingToolbar";
import { errorToast } from "@/features/common/components/errors/errorToast";
import { BlockNoteDiffUtil } from "@/features/common/utils/blocknote-diff.util";
import { BlockNoteWordDiffRendererUtil } from "@/features/common/utils/blocknote-word-diff-renderer.util";
import { S3Interface } from "@/features/foundations/s3/data/S3Interface";
import { S3Service } from "@/features/foundations/s3/data/S3Service";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { cn } from "@/lib/utils";
import { BlockNoteSchema, defaultInlineContentSpecs, PartialBlock } from "@blocknote/core";
import { createReactInlineContentSpec, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { CheckIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type BlockNoteEditorProps = {
  id: string;
  type: string;
  initialContent?: PartialBlock[];
  onChange?: (content: any, isEmpty: boolean, hasUnresolvedDiff: boolean) => void;
  size?: "sm" | "md";
  className?: string;
  markdownContent?: string;
  diffContent?: PartialBlock[];
  placeholder?: string;
  bordered?: boolean;
};

const createDiffActionsInlineContentSpec = (
  handleAcceptChange: (diffId: string) => void,
  handleRejectChange: (diffId: string) => void,
) => {
  return createReactInlineContentSpec(
    {
      type: "diffActions",
      propSchema: {
        diffIds: {
          default: "",
        },
      },
      content: "none",
    },
    {
      render: (props) => {
        const diffIds = props.inlineContent.props.diffIds;

        return (
          <span className="diff-actions-container mx-2 inline-flex items-center gap-1 align-middle">
            <Button
              title="Accept change"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                diffIds.split(",").forEach((id: string) => handleAcceptChange(id.trim()));
              }}
            >
              <CheckIcon className="h-3 w-3 text-green-600" />
            </Button>
            <Button
              title="Reject change"
              className="mx-2 p-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                diffIds.split(",").forEach((id: string) => handleRejectChange(id.trim()));
              }}
            >
              <XIcon className="h-3 w-3 text-red-600" />
            </Button>
          </span>
        );
      },
    },
  );
};

export default function BlockNoteEditor({
  id,
  type,
  initialContent,
  onChange,
  size,
  className,
  markdownContent,
  diffContent,
  placeholder,
  bordered,
}: BlockNoteEditorProps): React.JSX.Element {
  // DEBUG START
  // A random instance id to correlate logs across re-renders.
  const instanceIdRef = useRef<string>(Math.random().toString(36).slice(2));
  const iid = instanceIdRef.current;
  // DEBUG END

  const t = useTranslations();
  const { company } = useCurrentUserContext();

  const [acceptedChanges, setAcceptedChanges] = useState<Set<string>>(new Set());
  const [rejectedChanges, setRejectedChanges] = useState<Set<string>>(new Set());

  const editorRef = useRef<HTMLDivElement>(null);

  const handleAcceptChange = useCallback((diffId: string) => {
    setAcceptedChanges((prev) => new Set([...prev, diffId]));
    setRejectedChanges((prev) => {
      const newSet = new Set(prev);
      newSet.delete(diffId);
      return newSet;
    });
  }, []);

  const handleRejectChange = useCallback((diffId: string) => {
    setRejectedChanges((prev) => new Set([...prev, diffId]));
    setAcceptedChanges((prev) => {
      const newSet = new Set(prev);
      newSet.delete(diffId);
      return newSet;
    });
  }, []);

  const DiffActionsInlineContent = useMemo(
    () => createDiffActionsInlineContentSpec(handleAcceptChange, handleRejectChange),
    [handleAcceptChange, handleRejectChange],
  );

  const schema = useMemo(
    () =>
      BlockNoteSchema.create({
        inlineContentSpecs: {
          ...defaultInlineContentSpecs,
          diffActions: DiffActionsInlineContent,
        },
      } as any),
    [DiffActionsInlineContent],
  );

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      if (!company) {
        errorToast({
          title: t(`generic.errors.upload`),
          error: t(`generic.errors.upload_description`),
        });
        throw new Error(t(`generic.errors.upload`));
      }

      const fileType = file.type;
      const key = `companies/${company.id}/${type}/${id}/${file.name}`;

      const s3: S3Interface = await S3Service.getPreSignedUrl({
        key: key,
        contentType: fileType,
        isPublic: true,
      });

      await fetch(s3.url, {
        method: "PUT",
        headers: s3.headers,
        body: file,
      });

      const signedImage: S3Interface = await S3Service.getSignedUrl({
        key: key,
        isPublic: true,
      });

      return signedImage.url;
    },
    [company, id, t],
  );

  const processedContent = useMemo(() => {
    if (diffContent && initialContent) {
      try {
        const diffResult = BlockNoteDiffUtil.diff(initialContent, diffContent);
        const renderedDiff = BlockNoteWordDiffRendererUtil.renderWordDiffs(
          diffResult.blocks,
          handleAcceptChange,
          handleRejectChange,
          acceptedChanges,
          rejectedChanges,
        );
        return renderedDiff;
      } catch (error) {
        return initialContent && Array.isArray(initialContent) && initialContent.length > 0 ? initialContent : [];
      }
    }

    if (!initialContent) {
      return [];
    }

    if (!Array.isArray(initialContent)) {
      return [];
    }

    return initialContent.length > 0 ? initialContent : [];
  }, [initialContent, diffContent, handleAcceptChange, handleRejectChange, acceptedChanges, rejectedChanges]);

  const validatedInitialContent = useMemo(() => {
    if (processedContent && Array.isArray(processedContent) && processedContent.length > 0) {
      const validatedContent = processedContent.filter((block) => {
        if (!block || typeof block !== "object") return false;
        if (!(block as any).type) return false;
        return true;
      });
      return validatedContent.length > 0 ? (validatedContent as PartialBlock[]) : undefined;
    }
    return undefined;
  }, [processedContent]);

  const editor = useCreateBlockNote(
    useMemo(
      () => ({
        placeholders: {
          emptyDocument: placeholder || t(`generic.blocknote.placeholder`),
        },
        schema,
        initialContent: validatedInitialContent,
        uploadFile: uploadImage,
      }),
      [placeholder, t, schema, validatedInitialContent, uploadImage],
    ),
  );

  const handleChange = useCallback(async () => {
    if (!onChange) return;
    const newBlocks = editor.document;

    const markdownFromBlocks = (await editor.blocksToMarkdownLossy(editor.document)).trim();

    function hasUnresolvedDiffsRecursive(block: any): boolean {
      if (!block || typeof block !== "object") return false;
      let diffId = undefined;
      if (block.props && block.props.diffId) diffId = block.props.diffId;
      if (!diffId && block.attrs && block.attrs.diffId) diffId = block.attrs.diffId;
      if (diffId && !acceptedChanges.has(diffId) && !rejectedChanges.has(diffId)) {
        return true;
      }

      if (block.content) {
        const contentArr = Array.isArray(block.content) ? block.content : [block.content];
        for (const inline of contentArr) {
          if (inline && typeof inline === "object") {
            if (inline.type === "diffActions" && inline.props && inline.props.diffIds) {
              const ids =
                typeof inline.props.diffIds === "string" ? inline.props.diffIds.split(",") : inline.props.diffIds;
              for (const id of ids) {
                const trimmed = (id || "").toString().trim();
                if (trimmed && !acceptedChanges.has(trimmed) && !rejectedChanges.has(trimmed)) {
                  return true;
                }
              }
            }
            if (inline.props && inline.props.diffId) {
              const diffIdInline = inline.props.diffId;
              if (diffIdInline && !acceptedChanges.has(diffIdInline) && !rejectedChanges.has(diffIdInline)) {
                return true;
              }
            }
            if (inline.children && Array.isArray(inline.children)) {
              for (const child of inline.children) {
                if (hasUnresolvedDiffsRecursive(child)) return true;
              }
            }
          }
        }
      }
      if (Array.isArray(block.children)) {
        for (const child of block.children) {
          if (hasUnresolvedDiffsRecursive(child)) return true;
        }
      }
      return false;
    }

    let hasUnresolvedDiff = false;
    if (Array.isArray(newBlocks)) {
      hasUnresolvedDiff = newBlocks.some((block: any) => hasUnresolvedDiffsRecursive(block));
    }

    onChange(newBlocks, !markdownFromBlocks.length, hasUnresolvedDiff);
  }, [editor, onChange, id, acceptedChanges, rejectedChanges]);

  // Utility: deep equality for arrays of blocks
  const areBlocksEqual = (a: any[], b: any[]): boolean => {
    return JSON.stringify(a) === JSON.stringify(b);
  };

  // Only initialize from markdownContent once per value, and only if different
  const hasInitializedFromMarkdown = useRef<string | null>(null);
  useEffect(() => {
    const updateContent = async (markdown: string) => {
      const blocks = await editor.tryParseMarkdownToBlocks(markdown);
      if (!areBlocksEqual(blocks, editor.document)) {
        editor.replaceBlocks(editor.document, blocks);
      }
    };

    if (markdownContent && hasInitializedFromMarkdown.current !== markdownContent) {
      hasInitializedFromMarkdown.current = markdownContent;
      updateContent(markdownContent).then(() => handleChange());
    }
  }, [markdownContent, editor]);

  // Update editor content when diff content changes, but only if different
  // Prevent unnecessary replaceBlocks calls that reset scroll/cursor.
  const previousContentHashRef = useRef<string | null>(null);
  useEffect(() => {
    if (!processedContent || !editor) return;
    const hash = JSON.stringify(processedContent);
    if (previousContentHashRef.current === hash) return; // no changes
    const currentHash = JSON.stringify(editor.document);
    if (currentHash === hash) {
      previousContentHashRef.current = hash;
      return; // already in sync
    }
    editor.replaceBlocks(editor.document, processedContent as PartialBlock[]);
    previousContentHashRef.current = hash;
  }, [processedContent, editor]);

  // Handle audio received from whisper transcription
  const handleAudioReceived = useCallback(
    (message: string) => {
      try {
        // Ensure the editor has focus
        const editorElement = editorRef.current?.querySelector('[contenteditable="true"]') as HTMLElement;
        if (editorElement && document.activeElement !== editorElement) {
          editorElement.focus();
        }

        // Insert the transcribed text at the current cursor position
        editor.insertInlineContent(message);
      } catch (error) {
        console.error("Error inserting transcribed text:", error);
        // Fallback: try to insert at the end of the document
        try {
          const blocks = editor.document;
          if (blocks.length > 0) {
            const lastBlock = blocks[blocks.length - 1];
            editor.setTextCursorPosition(lastBlock.id, "end");
            editor.insertInlineContent(message);
          }
        } catch (fallbackError) {
          console.error("Fallback insertion also failed:", fallbackError);
        }
      }
    },
    [editor],
  );

  return (
    <div ref={editorRef} className={cn(bordered ? "rounded-md border" : "", "w-full")}>
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        editable={onChange !== undefined}
        formattingToolbar={false}
        theme="light"
        className={cn(`BlockNoteView ${onChange ? "min-h-96 p-4" : ""}`, className, size === "sm" && "small")}
      >
        <BlockNoteEditorFomattingToolbar />
      </BlockNoteView>
    </div>
  );
}
