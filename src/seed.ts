import * as ts from 'typescript'
import * as path from 'path'
import * as fs from 'fs'

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

const oldInputPath = path.join(__dirname, '../input/quicksort.js')
const inputPath = path.join(__dirname, '../input/quicksort.ts')

fs.copyFileSync(oldInputPath, inputPath)

const program = ts.createProgram({
  options: {
    allowJs: true,
    checkJs: true,
  },
  rootNames: [inputPath],
})

const checker = program.getTypeChecker()

function handler(node: ts.Node) {
  if (ts.isVariableDeclaration(node)) {
    console.log(
      checker.typeToString(checker.getApparentType(checker.getTypeAtLocation(node))).toLowerCase(),
    )
  }
}

traverse(program.getSourceFile(inputPath)!, handler)
