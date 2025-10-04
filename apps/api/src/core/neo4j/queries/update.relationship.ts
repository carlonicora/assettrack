export const updateRelationshipQuery = (params: {
  node: string;
  relationshipName: string;
  relationshipToNode: boolean;
  label: string;
  param: string;
  values: string[];
}): string => {
  return `
    WITH ${params.node}
    OPTIONAL MATCH (${params.node})${params.relationshipToNode ? "-" : "<-"}[rel:${params.relationshipName}]${params.relationshipToNode ? "->" : "-"}(existing:${params.label})
    WHERE NOT existing.id IN $${params.param}
    DELETE rel
    
    ${
      params.values && params.values.length > 0
        ? `
        WITH ${params.node}, $${params.param} AS ${params.param}
        UNWIND ${params.param} AS id
        MATCH (new:${params.label} {id: id})
        MERGE (${params.node})${params.relationshipToNode ? "-" : "<-"}[:${params.relationshipName}]${params.relationshipToNode ? "->" : "-"}(new)
        `
        : `
        `
    }
    `;
};
