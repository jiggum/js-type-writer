import * as ts from 'typescript'

export const inCoverage = (node: ts.Node): undefined | [string, ts.TypeNode | undefined, ((to: ts.Node) => void)] => {
  if (ts.isVariableDeclaration(node)) {
    if (ts.isIdentifier(node.name)) {
      // @ts-ignore
      return [node.name.escapedText, node.type, (to) => node.type = to]
    } else {
      throw Error(`Unhandled Node kind: ${node.kind}`)
    }
  }
  return undefined
}

export const encodeType = (node?: ts.TypeNode): string => {
  if (node?.kind === ts.SyntaxKind.NumberKeyword) {
    return 'number'
  }
  if (node?.kind === ts.SyntaxKind.StringKeyword) {
    return 'string'
  }
  return 'any'
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
  throw Error(`Unhandled type string: ${str}`)
}
