import * as ts from 'typescript'
import * as fs from 'fs'
import { decodeType, inCoverage } from 'src/util'

const DUMMY_FILE_PATH = '/tmp.ts'

function visit(node: ts.Node, reversedStorage: [string, string][]) {
  const result = inCoverage(node)
  if (result) {
    const [, , convert] = result
    convert(decodeType(reversedStorage.pop()![1]))
  }
  ts.forEachChild(node, (e) => visit(e, reversedStorage))
}

function compile(
  fileName: string,
  storageFileName: string,
  options: ts.CompilerOptions,
): void {
  const reversedStorage = JSON.parse(fs.readFileSync(storageFileName, 'utf-8')).reverse()
  const text = fs.readFileSync(fileName, 'utf-8')
  const ast = ts.createSourceFile(DUMMY_FILE_PATH, text, ts.ScriptTarget.Latest);
  visit(ast, reversedStorage)

  const realHost = ts.createCompilerHost(options, true);

  const host: ts.CompilerHost = {
    fileExists: filePath => filePath === DUMMY_FILE_PATH || realHost.fileExists(filePath),
    directoryExists: realHost.directoryExists && realHost.directoryExists.bind(realHost),
    getCurrentDirectory: realHost.getCurrentDirectory.bind(realHost),
    getDirectories: realHost.getDirectories!.bind(realHost),
    getCanonicalFileName: fileName => realHost.getCanonicalFileName(fileName),
    getNewLine: realHost.getNewLine.bind(realHost),
    getDefaultLibFileName: realHost.getDefaultLibFileName.bind(realHost),
    getSourceFile: (fileName, languageVersion, onError, shouldCreateNewSourceFile) => fileName === DUMMY_FILE_PATH
      ? ast
      : realHost.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile),
    readFile: filePath => filePath === DUMMY_FILE_PATH
      ? text
      : realHost.readFile(filePath),
    useCaseSensitiveFileNames: () => realHost.useCaseSensitiveFileNames(),
    writeFile: () => {},
  };

  const program = ts.createProgram({
    options,
    rootNames: [DUMMY_FILE_PATH],
    host
  });
  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed})
  const res = printer.printNode(ts.EmitHint.Unspecified, ast, ast)
  const diagnostics = ts.getPreEmitDiagnostics(program)
  console.log(`Total Diagnostics Count: ${diagnostics.length}`)
}

compile(
  process.argv[2],
  process.argv[3],
  {
    allowJs: true,
  },
)
