import * as ts from 'typescript'
import replace from '../replace'

const TMP_FILE_PATH = './tmp/diagnose.ts'

function compile(
  storageFileName: string,
  fileName: string,
  options: ts.CompilerOptions,
): void {
  replace(storageFileName, fileName, TMP_FILE_PATH, options)
  const program = ts.createProgram([TMP_FILE_PATH], options)
  const emitResult = program.emit()
  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
  console.log(`Total Diagnostics Count: ${allDiagnostics.length}`)
}

compile(
  process.argv[2],
  process.argv[3],
  {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    allowJs: true,
    noEmit: true,
  },
)
