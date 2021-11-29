import * as ts from 'typescript'
import * as fs from 'fs'
import { inCoverage, traverse } from 'src/util'

function compile(
  inputFileName: string,
  storageFileName: string,
  options: ts.CompilerOptions,
): void {
  const storage: [string, string][] = []
  const program = ts.createProgram([inputFileName], options)
  const checker = program.getTypeChecker()
  const sourceFile = program.getSourceFile(inputFileName)!

  traverse(sourceFile, (node) => {
    const result = inCoverage(node)
    if (result) {
      const [label] = result
      storage.push([label, checker.typeToString(checker.getTypeAtLocation(node))])
    }
  })

  fs.writeFileSync(storageFileName, JSON.stringify(storage), 'utf-8')
}

compile(process.argv[2], process.argv[3], {
  allowJs: true,
})
