import * as ts from 'typescript'
import * as fs from 'fs'
import { inCoverage, decodeType } from '../util'

function visit(node: ts.Node, storage: [string, string][]) {
  const result = inCoverage(node)
  if (result) {
    const [, , convert] = result
    convert(decodeType(storage.shift()![1]))
  }
  ts.forEachChild(node, (e) => visit(e, storage))
}

function compile(fileName: string, options: ts.CompilerOptions): void {
  const dict = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'))
  let program = ts.createProgram([fileName], options)
  const sourceFile = program.getSourceFile(fileName)!
  const resultFile = ts.createSourceFile(process.argv[4], '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
  // @ts-ignore
  resultFile.statements = sourceFile.statements
  visit(resultFile, dict)
  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed})
  const text = printer.printNode(ts.EmitHint.Unspecified, resultFile, resultFile)
  fs.writeFileSync(process.argv[4], text, 'utf8')
}

compile(process.argv[3], {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  allowJs: true,
})
