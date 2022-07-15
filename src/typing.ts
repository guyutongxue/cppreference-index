export interface Marks {
  since?: string;
  deprecated?: string;
  removed?: string;
}
export interface PreprocessorToken {
  token: string;
  type:
    | "directiveName"
    | "operator"
    | "replacement"
    | "operatorOutsideDirective";
  since?: string;
  link: string;
}

interface IndexBase<Type extends string> {
  type: Type;
  name: string;
  link: string;
  marks: Marks;
}

export interface SymbolIndex extends IndexBase<"symbol"> {
  symbolType:
    | "macro"
    | "functionLikeMacro"
    | "function"
    | "template"
    | "functionTemplate"
    | "namespace"
    | "other";
  note?: string;
}
export interface HeaderIndex extends IndexBase<"header"> {
  description: string;
}
export interface KeywordIndex extends IndexBase<"keyword"> {
  canBeUsedAsIdentifier: boolean;
}
export interface AttributeIndex extends IndexBase<"attribute"> {
  namespace: string;
}
export interface PreprocessorTokenIndex extends IndexBase<"preprocessorToken"> {
  tokenType: PreprocessorToken["type"];
}

export type DetailedSymbolType =
  | "concept"
  | "class"
  | "classTemplate"
  | "classTemplateSpecialization"
  | "typeAlias"
  | "typeAliasTemplate"
  | "function"
  | "functionTemplate"
  | "enumeration"
  | "enumerator"
  | "macro"
  | "functionLikeMacro"
  | "constant"
  | "niebloid"
  | "object"
  | "variableTemplate"
  | "namespace"
  | "other";
export interface DetailedSymbolIndex extends IndexBase<"symbol"> {
  symbolType: DetailedSymbolType;
  note?: string;
  description?: string;
}

export type Index<Detailed extends boolean = false> =
  | (Detailed extends true ? DetailedSymbolIndex : SymbolIndex)
  | HeaderIndex
  | KeywordIndex
  | AttributeIndex
  | PreprocessorTokenIndex;
