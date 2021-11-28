import * as ts from 'typescript'
import * as fs from 'fs'

const DUMMY_FILE_PATH = '/tmp.ts'

export const inCoverage = (
  node: ts.Node,
): undefined | [string, (to: ts.Node) => void, ts.TypeNode] => {
  if (ts.isVariableDeclaration(node) && ts.isFunctionLike(node.initializer)) {
    return undefined
  }
  if (ts.isFunctionDeclaration(node)) {
    // @ts-ignore
    return [node.name?.escapedText ?? '', (to) => (node.type = to), node.type]
  }
  if (ts.isArrowFunction(node)) {
    // @ts-ignore
    return [node.name ?? '', (to) => (node.type = to), node.type]
  }
  if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
    if (ts.isIdentifier(node.name)) {
      // @ts-ignore
      return [node.name.escapedText ?? '', (to) => (node.type = to), node.type]
    } else {
      throw Error(`Unhandled Node kind: ${node.kind}`)
    }
  }
  return undefined
}

export const decodeType = (str: string): ts.TypeNode => {
  if (str === 'number') {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
  }
  if (str === 'string') {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
  }
  if (str === 'any') {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
  }
  // throw Error(`Unhandled type string: ${str}`)
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
}

const typeKinds = [
  ts.SyntaxKind.BooleanKeyword,
  ts.SyntaxKind.NumberKeyword,
  ts.SyntaxKind.StringKeyword,
  ts.SyntaxKind.SymbolKeyword,
  ts.SyntaxKind.UndefinedKeyword,
  ts.SyntaxKind.VoidKeyword,
  ts.SyntaxKind.UnknownKeyword,
  ts.SyntaxKind.ArrayType,
]

const keywordTypeKinds = [
  ts.SyntaxKind.BooleanKeyword,
  ts.SyntaxKind.NumberKeyword,
  ts.SyntaxKind.StringKeyword,
  ts.SyntaxKind.SymbolKeyword,
  ts.SyntaxKind.UndefinedKeyword,
  ts.SyntaxKind.VoidKeyword,
  ts.SyntaxKind.UnknownKeyword,
]

export const randomType = (onlyKeyword = false) => {
  const kinds = onlyKeyword ? keywordTypeKinds : typeKinds
  const kind = kinds[Math.floor(Math.random() * kinds.length)]
  if (
    kind === ts.SyntaxKind.BooleanKeyword ||
    kind === ts.SyntaxKind.NumberKeyword ||
    kind === ts.SyntaxKind.StringKeyword ||
    kind === ts.SyntaxKind.SymbolKeyword ||
    kind === ts.SyntaxKind.UndefinedKeyword ||
    kind === ts.SyntaxKind.VoidKeyword ||
    kind === ts.SyntaxKind.UnknownKeyword
  ) {
    return ts.factory.createKeywordTypeNode(kind)
  }
  if (kind === ts.SyntaxKind.ArrayType) {
    return ts.factory.createArrayTypeNode(
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
    )
  }
  throw `Unreachable Exception on randomType. Type kind:${kind}`
}

export const isSameType = (typeA: ts.TypeNode, typeB: ts.TypeNode): boolean => {
  const kind = typeA.kind
  if (
    kind === ts.SyntaxKind.BooleanKeyword ||
    kind === ts.SyntaxKind.NumberKeyword ||
    kind === ts.SyntaxKind.StringKeyword ||
    kind === ts.SyntaxKind.SymbolKeyword ||
    kind === ts.SyntaxKind.UndefinedKeyword ||
    kind === ts.SyntaxKind.VoidKeyword ||
    kind === ts.SyntaxKind.UnknownKeyword ||
    kind === ts.SyntaxKind.AnyKeyword
  ) {
    return typeA.kind == typeB.kind
  }
  if (kind === ts.SyntaxKind.ArrayType) {
    if (ts.isArrayTypeNode(typeA) && ts.isArrayTypeNode(typeB)) {
      return isSameType(typeA.elementType, typeB.elementType)
    } else {
      return false
    }
  }
  throw `Unreachable Exception on isSameType. Type kind:${kind}`
}

export const getCode = (ast: ts.Node) => {
  const dummyFile = ts.createSourceFile(
    DUMMY_FILE_PATH,
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  )
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  return printer.printNode(ts.EmitHint.Unspecified, ast, dummyFile)
}

export const writeFile = (fineName: string, ast: ts.Node) => {
  const text = getCode(ast)
  fs.writeFileSync(fineName, text, 'utf8')
}

export const clone = (ast: ts.Node) => {
  const text = getCode(ast)
  return ts.createSourceFile(DUMMY_FILE_PATH, text, ts.ScriptTarget.Latest)
}
