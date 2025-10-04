export type BlockNoteHeader = {
  id: string;
  title: string;
  level: number;
};

export const breadcrumbHeadersExtractor = (params: { nodes: any[] }): BlockNoteHeader[] => {
  const response: BlockNoteHeader[] = [];
  params.nodes.map((node) => searchForHeaders({ response: response, node: node, indentLevel: 0 }));
  return response;
};

function searchForHeaders(params: { response: BlockNoteHeader[]; node: any; indentLevel: number }): void {
  if (params.node.type === "heading") processHeading(params);
}

function processHeading(params: { response: BlockNoteHeader[]; node: any; indentLevel: number }): void {
  const newHeader: BlockNoteHeader = {
    id: params.node.id,
    title: params.node.content[0].text,
    level: params.node.props.level || 1,
  };
  params.response.push(newHeader);
}
