import * as ts from 'typescript'

type TDictionary = { [pos: number]: ts.SyntaxKind }

function visit(node: ts.Node, dict: TDictionary) {
  if (ts.isVariableDeclaration(node)) {
    if (ts.isIdentifier(node.name)) {
      if (node.type?.kind === ts.SyntaxKind.NumberKeyword) {
        console.log(node.name.text, node.type?.kind)
        // @ts-ignore
        node.type = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
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

  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed})
  const result = printer.printNode(ts.EmitHint.Unspecified, sourceFile, sourceFile)
  console.log(result)
}

compile(process.argv[2], {
  noEmitOnError: true,
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  allowJs: true,
  outDir: 'output'
})
