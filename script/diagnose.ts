import * as ts from 'typescript'
import * as fs from 'fs'
import { decodeType, inCoverage } from 'src/util'

const DUMMY_FILE_PATH = '/tmp.ts'

function visit(node: ts.Node, reversedStorage: [string, string][]) {
  const result = inCoverage(node)
  if (result) {
    const [, convert] = result
    const [, type] = reversedStorage.pop() ?? []
    if (type) convert(decodeType(type))
  }
  ts.forEachChild(node, (e) => visit(e, reversedStorage))
}

function compile(
  inputfileName: string,
  storageFileName: string,
  options: ts.CompilerOptions,
): void {
  const reversedStorage = JSON.parse(fs.readFileSync(storageFileName, 'utf-8')).reverse()
  const text = fs.readFileSync(inputfileName, 'utf-8')
  const ast = ts.createSourceFile(DUMMY_FILE_PATH, text, ts.ScriptTarget.Latest)
  visit(ast, reversedStorage)

  const realHost = ts.createCompilerHost(options, true)

  const host: ts.CompilerHost = {
    fileExists: (filePath) => filePath === DUMMY_FILE_PATH || realHost.fileExists(filePath),
    directoryExists: realHost.directoryExists && realHost.directoryExists.bind(realHost),
    getCurrentDirectory: realHost.getCurrentDirectory.bind(realHost),
    getDirectories: realHost.getDirectories?.bind(realHost),
    getCanonicalFileName: (fileName) => realHost.getCanonicalFileName(fileName),
    getNewLine: realHost.getNewLine.bind(realHost),
    getDefaultLibFileName: realHost.getDefaultLibFileName.bind(realHost),
    getSourceFile:
      (fileName, languageVersion, onError, shouldCreateNewSourceFile) =>
        (fileName === DUMMY_FILE_PATH
          ? ast
          : realHost.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile)),
    readFile: (filePath) => (filePath === DUMMY_FILE_PATH
      ? text
      : realHost.readFile(filePath)),
    useCaseSensitiveFileNames: () => realHost.useCaseSensitiveFileNames(),
    writeFile: () => {
    },
  }

  const program = ts.createProgram({
    options,
    rootNames: [DUMMY_FILE_PATH],
    host,
  })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  // eslint-disable-next-line no-console
  console.log(`Total Diagnostics Count: ${diagnostics.length}`)
}

compile(
  process.argv[2],
  process.argv[3],
  {
    allowJs: true,
  },
)
