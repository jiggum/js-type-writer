import * as ts from 'typescript'

function compile(fileName: string, options: ts.CompilerOptions): void {
  let program = ts.createProgram([fileName], options)
  program.emit();
}

compile(process.argv[2], {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  allowJs: true,
  outDir: 'output',
})
