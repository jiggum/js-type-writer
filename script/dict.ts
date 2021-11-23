import * as ts from 'typescript'
import * as fs from 'fs'
import { inCoverage, encodeType } from 'src/util'

function visit(node: ts.Node, storage: [string, string][]) {
  const result = inCoverage(node)
  if (result) {
    const [label, target] = result
    storage.push([label, encodeType(target)])
  }
  ts.forEachChild(node, (e) => visit(e, storage))
}

function compile(
  inputFileName: string,
  storageFileName: string,
  options: ts.CompilerOptions,
): void {
  const storage: [string, string][] = []
  let program = ts.createProgram([inputFileName], options)
  const sourceFile = program.getSourceFile(inputFileName)!
  visit(sourceFile, storage)

  fs.writeFileSync(storageFileName, JSON.stringify(storage), 'utf-8')
}

compile(
  process.argv[2],
  process.argv[3],
  {
    allowJs: true,
  },
)
