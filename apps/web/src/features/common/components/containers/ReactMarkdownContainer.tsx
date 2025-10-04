"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ReactMarkdownContainer({ content, className }: { content: string; className?: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => <table className="w-full table-auto border-collapse border">{children}</table>,
        th: ({ children }) => <th className="border px-4 py-2 text-left">{children}</th>,
        td: ({ children }) => <td className="border px-4 py-2">{children}</td>,
        tr: ({ children }) => <tr className="even:bg-gray-50">{children}</tr>,
        ul: ({ children }) => <ul className="list-disc pl-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4">{children}</ol>,
        h1: ({ children }) => <h1 className="my-2 mt-4 text-3xl font-semibold">{children}</h1>,
        h2: ({ children }) => <h2 className="my-2 mt-4 text-2xl font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="my-2 mt-4 text-xl font-semibold">{children}</h3>,
        h4: ({ children }) => <h4 className="my-2 mt-4 text-lg font-semibold">{children}</h4>,
        p: ({ children }) => <p className={cn(``, className)}>{children}</p>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
