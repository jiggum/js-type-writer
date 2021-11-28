import * as ts from 'typescript'
import * as fs from 'fs'
import { decodeType, inCoverage } from 'src/util'
import { calcFitness } from 'src/fitness'

const DUMMY_FILE_PATH = '/tmp.ts'

function visit(node: ts.Node, reversedStorage: [string, string][]) {
  const result = inCoverage(node)
  if (result) {
    const [, convert] = result
    const [, type] = reversedStorage.pop() ?? []
    if (type) convert(decodeType(type))
  }
  ts.forEachChild(node, (e) => visit(e, reversedStorage))
}

function compile(inputfileName: string, storageFileName: string): void {
  const reversedStorage = JSON.parse(fs.readFileSync(storageFileName, 'utf-8')).reverse()
  const text = fs.readFileSync(inputfileName, 'utf-8')
  const ast = ts.createSourceFile(DUMMY_FILE_PATH, text, ts.ScriptTarget.Latest)
  visit(ast, reversedStorage)

  console.log(`Total Diagnostics Count: ${calcFitness(ast)}`)
}

compile(process.argv[2], process.argv[3])
