import * as ts from 'typescript'
import * as fs from 'fs'
import { inCoverage } from 'src/util'

function visit(node: ts.Node, storage: [string, string][], checker: ts.TypeChecker) {
  const result = inCoverage(node)
  if (result) {
    const [label] = result
    storage.push([label, checker.typeToString(checker.getTypeAtLocation(node))])
  }
  ts.forEachChild(node, (e) => visit(e, storage, checker))
}

function compile(
  inputFileName: string,
  storageFileName: string,
  options: ts.CompilerOptions,
): void {
  const storage: [string, string][] = []
  const program = ts.createProgram([inputFileName], options)
  const checker = program.getTypeChecker()
  const sourceFile = program.getSourceFile(inputFileName)!
  visit(sourceFile, storage, checker)

  fs.writeFileSync(storageFileName, JSON.stringify(storage), 'utf-8')
}

compile(
  process.argv[2],
  process.argv[3],
  {
    allowJs: true,
  },
)
