import * as ts from 'typescript'

export const inCoverage = (node: ts.Node): undefined | [string, (to: ts.Node) => void] => {
  if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
    if (ts.isIdentifier(node.name)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

// Get total Nodes' count except the root node
export const getTotalNodeCount = (root: ts.Node) => {
  let count = -1

  const visit = (node: ts.Node) => {
    count = count + 1
    ts.forEachChild(node, visit)
  }

  visit(root)

  return count
}
