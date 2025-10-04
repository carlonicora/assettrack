"use client";

import { BlockNoteEditorProps } from "@/features/common/components/editor/BlockNoteEditor";
import dynamic from "next/dynamic";
import React from "react";

const BlockNoteEditor = dynamic(() => import("@/features/common/components/editor/BlockNoteEditor"), {
  ssr: false,
});

const BlockNoteEditorContainer = React.memo(function EditorContainer(props: BlockNoteEditorProps) {
  return <BlockNoteEditor {...props} />;
});

export default BlockNoteEditorContainer;
