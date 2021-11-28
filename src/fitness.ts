import * as ts from 'typescript'
import { clone, getCode } from 'src/util'

const DUMMY_FILE_PATH = '/tmp.ts'

const compileOptions = {
  allowJs: true,
}
const realHost = ts.createCompilerHost(compileOptions, true)

export const calcFitness = (root: ts.SourceFile) => {
  const target = clone(root)
  const host: ts.CompilerHost = {
    fileExists: (filePath) => filePath === DUMMY_FILE_PATH || realHost.fileExists(filePath),
    directoryExists: realHost.directoryExists && realHost.directoryExists.bind(realHost),
    getCurrentDirectory: realHost.getCurrentDirectory.bind(realHost),
    getDirectories: realHost.getDirectories?.bind(realHost),
    getCanonicalFileName: (fileName) => realHost.getCanonicalFileName(fileName),
    getNewLine: realHost.getNewLine.bind(realHost),
    getDefaultLibFileName: realHost.getDefaultLibFileName.bind(realHost),
    getSourceFile: (fileName, languageVersion, onError, shouldCreateNewSourceFile) =>
      fileName === DUMMY_FILE_PATH
        ? target
        : realHost.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile),
    readFile: (filePath) => (filePath === DUMMY_FILE_PATH ? '' : realHost.readFile(filePath)),
    useCaseSensitiveFileNames: () => realHost.useCaseSensitiveFileNames(),
    writeFile: () => {},
  }

  const program = ts.createProgram({
    options: compileOptions,
    rootNames: [DUMMY_FILE_PATH],
    host,
  })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  return diagnostics.length
}
