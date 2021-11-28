import * as ts from 'typescript'
import * as fs from 'fs'
import { inCoverage, decodeType, writeFile } from 'src/util'

function visit(node: ts.Node, reversedStorage: [string, string][]) {
  const result = inCoverage(node)
  if (result) {
    const [, convert] = result
    convert(decodeType(reversedStorage.pop()![1]))
  }
  ts.forEachChild(node, (e) => visit(e, reversedStorage))
}

function compile(
  storageFileName: string,
  inputFileName: string,
  outputFileName: string,
  options: ts.CompilerOptions,
): void {
  const reversedStorage = JSON.parse(fs.readFileSync(storageFileName, 'utf-8')).reverse()
  const program = ts.createProgram([inputFileName], options)
  const sourceFile = program.getSourceFile(inputFileName)!
  visit(sourceFile, reversedStorage)
  writeFile(outputFileName, sourceFile)
}

compile(process.argv[2], process.argv[3], process.argv[4], {
  allowJs: true,
})
