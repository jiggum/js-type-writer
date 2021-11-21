import * as ts from 'typescript'
import * as fs from 'fs'
import { TDictionary } from '../type'
import { inCoverage, encodeType } from '../util'

function visit(node: ts.Node, dict: TDictionary) {
  const result = inCoverage(node)
  if (result) {
    const [target] = result
    dict[target.pos] = encodeType(target)
  } else {
    ts.forEachChild(node, (e) => visit(e, dict))
  }
}

function compile(fileName: string, options: ts.CompilerOptions): void {
  const dict = {}
  let program = ts.createProgram([fileName], options)
  const sourceFile = program.getSourceFile(fileName)!
  visit(sourceFile, dict)

  fs.writeFileSync(process.argv[3], JSON.stringify(dict), 'utf-8')
}

compile(process.argv[2], {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  allowJs: true,
})
