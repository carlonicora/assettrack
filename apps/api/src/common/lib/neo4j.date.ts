export const formatNeo4jDate = (neo4jDate: any): string | undefined => {
  if (!neo4jDate) return undefined;

  const year = neo4jDate.year?.low || neo4jDate.year;
  const month = String(neo4jDate.month?.low || neo4jDate.month).padStart(2, "0");
  const day = String(neo4jDate.day?.low || neo4jDate.day).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
