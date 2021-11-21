import * as ts from 'typescript'
import * as fs from 'fs'
import { inCoverage, decodeType } from './util'

function visit(node: ts.Node, storage: [string, string][]) {
  const result = inCoverage(node)
  if (result) {
    const [, , convert] = result
    convert(decodeType(storage.shift()![1]))
  }
  ts.forEachChild(node, (e) => visit(e, storage))
}

export default function replace(
  storageFileName: string,
  inputFileName: string,
  outputFileName: string,
  options: ts.CompilerOptions,
): void {
  const dict = JSON.parse(fs.readFileSync(storageFileName, 'utf-8'))
  let program = ts.createProgram([inputFileName], options)
  const sourceFile = program.getSourceFile(inputFileName)!
  const resultFile = ts.createSourceFile(outputFileName, '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
  // @ts-ignore
  resultFile.statements = sourceFile.statements
  visit(resultFile, dict)
  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed})
  const text = printer.printNode(ts.EmitHint.Unspecified, resultFile, resultFile)
  fs.writeFileSync(outputFileName, text, 'utf8')
}
