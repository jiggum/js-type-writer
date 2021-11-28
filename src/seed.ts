import * as ts from 'typescript'
import { inCoverage, randomType } from 'src/util'

const DUMMY_FILE_PATH = '/tmp.ts'

export const randomSeed = (text: string) => {
  const root = ts.createSourceFile(DUMMY_FILE_PATH, text, ts.ScriptTarget.Latest)
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
