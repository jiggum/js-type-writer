import * as ts from 'typescript'
import * as fs from 'fs'
import { inCoverage, encodeType } from '../util'

function visit(node: ts.Node, storage: [string, string][]) {
  const result = inCoverage(node)
  if (result) {
    const [label, target] = result
    storage.push([label, encodeType(target)])
  }
  ts.forEachChild(node, (e) => visit(e, storage))
}

function compile(fileName: string, options: ts.CompilerOptions): void {
  const storage: [string, string][] = []
  let program = ts.createProgram([fileName], options)
  const sourceFile = program.getSourceFile(fileName)!
  visit(sourceFile, storage)

  fs.writeFileSync(process.argv[3], JSON.stringify(storage), 'utf-8')
}

compile(process.argv[2], {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  allowJs: true,
})
