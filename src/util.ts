import * as ts from 'typescript'
import * as fs from 'fs'

const DUMMY_FILE_PATH = '/tmp.ts'

export const inCoverage = (node: ts.Node): undefined | [string, (to: ts.Node) => void] => {
  if (ts.isVariableDeclaration(node) && ts.isFunctionLike(node.initializer)) {
    return undefined
  }
  if (ts.isArrowFunction(node)) {
    // @ts-ignore
    return [node.name ?? '', (to) => (node.type = to)]
  }
  if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
    if (ts.isIdentifier(node.name)) {
      // @ts-ignore
      return [node.name.escapedText ?? '', (to) => (node.type = to)]
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

export const randomType = () => {
  const kind = typeKinds[Math.floor(Math.random() * typeKinds.length)]
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
  throw 'Unreachable Exception'
}

export const writeFile = (fineName: string, ast: ts.Node) => {
  const dummyFile = ts.createSourceFile(
    DUMMY_FILE_PATH,
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  )
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true })
  const text = printer.printNode(ts.EmitHint.Unspecified, ast, dummyFile)
  fs.writeFileSync(fineName, text, 'utf8')
}

export const clone = (ast: ts.Node) => {
  const dummyFile = ts.createSourceFile(
    DUMMY_FILE_PATH,
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  )
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  const text = printer.printNode(ts.EmitHint.Unspecified, ast, dummyFile)
  return ts.createSourceFile(DUMMY_FILE_PATH, text, ts.ScriptTarget.Latest)
}
