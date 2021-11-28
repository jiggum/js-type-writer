import * as ts from 'typescript'
import { inCoverage, randomType } from 'src/util'

export const randomSeed = (root: ts.Node) => {
  const visit = (node: ts.Node) => {
    const result = inCoverage(node)
    if (result) {
      const [, convert] = result
      convert(randomType())
    }
    ts.forEachChild(node, (e) => visit(e))
  }
  visit(root)
  return root
}
