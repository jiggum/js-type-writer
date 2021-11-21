import * as ts from 'typescript'
import * as fs from 'fs'
import { inCoverage, decodeType } from '../util'

const DUMMY_FILE_PATH = '/tmp.ts'

function visit(node: ts.Node, storage: [string, string][]) {
  const result = inCoverage(node)
  if (result) {
    const [, , convert] = result
    convert(decodeType(storage.shift()![1]))
  }
  ts.forEachChild(node, (e) => visit(e, storage))
}

function compile(
  storageFileName: string,
  inputFileName: string,
  outputFileName: string,
  options: ts.CompilerOptions,
): void {
  const dict = JSON.parse(fs.readFileSync(storageFileName, 'utf-8'))
  let program = ts.createProgram([inputFileName], options)
  const sourceFile = program.getSourceFile(inputFileName)!
  const dummyFile = ts.createSourceFile(DUMMY_FILE_PATH, '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
  visit(sourceFile, dict)
  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed})
  const text = printer.printNode(ts.EmitHint.Unspecified, sourceFile, dummyFile)
  fs.writeFileSync(outputFileName, text, 'utf8')
}

compile(
  process.argv[2],
  process.argv[3],
  process.argv[4],
  {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    allowJs: true,
  },
)
