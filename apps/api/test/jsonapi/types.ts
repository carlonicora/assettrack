export interface JsonApiAttributes {
  [key: string]: any;
}

export interface JsonApiMeta {
  [key: string]: any;
}

export interface JsonApiLinks {
  self?: string;
  related?: string;
  [key: string]: any;
}

export interface JsonApiRelationshipData {
  type: string;
  id: string;
}

export interface JsonApiRelationship {
  data?: JsonApiRelationshipData | JsonApiRelationshipData[];
  links?: {
    related?: string;
    self?: string;
  };
}

export interface JsonApiData {
  type: string;
  id: string;
  attributes: JsonApiAttributes;
  meta?: JsonApiMeta;
  links?: JsonApiLinks;
  relationships?: {
    [key: string]: JsonApiRelationship;
  };
}

export interface JsonApiResponse {
  data: JsonApiData;
  included?: JsonApiData[];
  links?: JsonApiLinks;
  meta?: JsonApiMeta;
}
