import * as ts from 'typescript'

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
