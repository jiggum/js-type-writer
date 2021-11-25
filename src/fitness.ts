import * as ts from 'typescript'
import { writeFileSync, rmSync } from 'fs'

import { AST, MainPrediction, ParsedFile } from './types'
import { compilerOptions } from '../tsconfig.json'

export function transform(ast: AST, prediction: MainPrediction): AST {
  console.log(ast, prediction)
  // traverse prediction
  // if type prediction, find and replace out of ast by astPath and typeAnnotation
  throw 'NOT IMPLEMENTED'
}

export function fitness({ fileName, ast }: ParsedFile): number {
  const sourceCode = ast.toSource()
  const tsFilename = fileName.replace('.js', '.ts')
  writeFileSync(tsFilename, sourceCode)

  const createdFiles: Record<string, string> = {}
  const host = ts.createCompilerHost(compilerOptions)
  host.writeFile = (fileName: string, contents: string) => (createdFiles[fileName] = contents)
  const program = ts.createProgram([tsFilename], compilerOptions, host)
  const errors = ts.getPreEmitDiagnostics(program).length
  rmSync(tsFilename)
  return errors
}
