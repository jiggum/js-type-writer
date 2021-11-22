import * as ts from 'typescript'

function compile(fileName: string, options: ts.CompilerOptions): void {
  let program = ts.createProgram([fileName], options)
  program.emit();
}

compile(process.argv[2], {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ES2020,
  allowJs: true,
  outDir: 'output',
})
