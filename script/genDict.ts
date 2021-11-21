import * as ts from 'typescript'
import * as fs from 'fs'

type TDictionary = { [pos: number]: ts.SyntaxKind }

function visit(node: ts.Node, dict: TDictionary) {
  if (ts.isVariableDeclaration(node)) {
    if (ts.isIdentifier(node.name)) {
      if (node.type?.kind === ts.SyntaxKind.NumberKeyword) {
        dict[node.type.pos] = node.type.kind
      }
    } else {
      throw Error(`Unhandled Node kind: ${node.kind}`)
    }
  }
  ts.forEachChild(node, (e) => visit(e, dict))
}

function compile(fileName: string, options: ts.CompilerOptions): void {
  const dict = {}
  let program = ts.createProgram([fileName], options)
  const sourceFile = program.getSourceFile(fileName)!
  visit(sourceFile, dict)

  fs.writeFileSync(process.argv[3], JSON.stringify(dict), 'utf-8')
}

compile(process.argv[2], {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  allowJs: true,
})
