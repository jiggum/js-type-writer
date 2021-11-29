import * as ts from 'typescript'
import * as fs from 'fs'
import { inCoverage, decodeType, writeFile, traverse } from 'src/util'

function compile(
  storageFileName: string,
  inputFileName: string,
  outputFileName: string,
  options: ts.CompilerOptions,
): void {
  const reversedStorage = JSON.parse(fs.readFileSync(storageFileName, 'utf-8')).reverse()
  const program = ts.createProgram([inputFileName], options)
  const sourceFile = program.getSourceFile(inputFileName)!

  traverse(sourceFile, (node) => {
    const result = inCoverage(node)
    if (result) {
      const [, convert] = result
      convert(decodeType(reversedStorage.pop()![1]))
    }
  })

  writeFile(outputFileName, sourceFile)
}

compile(process.argv[2], process.argv[3], process.argv[4], {
  allowJs: true,
})
