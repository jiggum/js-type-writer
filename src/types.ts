import * as j from 'jscodeshift'

export type AST = ReturnType<typeof j>

export interface ParsedFile {
  fileName: string
  ast: AST
}

export type TypeVoca = 'boolean' | 'number' | 'string' | 'null' | 'undefined' | 'unknown' | 'void'

export interface TypeSlot {
  path: j.ASTPath
}

export interface VariablePrediction extends TypeSlot {
  type: TypeVoca
}

export interface FunctionDeclarationPrediction extends TypeSlot {
  paramTypes: TypeVoca[]
  returnType: TypeVoca
}

export interface MainPrediction {
  functions: FunctionDeclarationPrediction[]
}
