import * as ts from 'typescript'
import { inCoverage, randomType, traverse } from 'src/util'

const DUMMY_FILE_PATH = '/tmp.ts'

export const randomSeed = (text: string) => {
  const root = ts.createSourceFile(DUMMY_FILE_PATH, text, ts.ScriptTarget.Latest)

  traverse(root, (node) => {
    const result = inCoverage(node)
    if (result) {
      const [, convert] = result
      convert(randomType())
    }
  })

  return root
}
