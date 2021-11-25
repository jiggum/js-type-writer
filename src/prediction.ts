import { readFileSync } from 'fs'
import * as j from 'jscodeshift'
import { FunctionDeclarationPrediction, MainPrediction, TypeVoca } from './types'

function isFunctionDeclaration(path: j.ASTPath): path is j.ASTPath<j.FunctionDeclaration> {
  return path.node.type === 'FunctionDeclaration'
}

export function updateFunctionDeclarationPrediction(
  prediction: FunctionDeclarationPrediction,
  params: TypeVoca[],
  returnType: TypeVoca,
) {
  return {
    ...prediction,
    params,
    returnType,
  }
}

export function updateMainPrediction(
  prediction: MainPrediction,
  functions: Omit<FunctionDeclarationPrediction, 'path'>[],
) {
  return {
    ...prediction,
    functions: prediction.functions.map((p, i) =>
      updateFunctionDeclarationPrediction(p, functions[i].paramTypes, functions[i].returnType),
    ),
  }
}

export function createPrediction(filename: string) {
  const sourceCode = readFileSync(filename, { encoding: 'utf-8' })
  const prediction: MainPrediction = {
    functions: [],
  }
  const astPaths = j(sourceCode).getAST()
  for (const path of astPaths) {
    if (isFunctionDeclaration(path)) {
      prediction.functions.push({
        path,
        paramTypes: path.node.params.map(() => 'unknown'),
        returnType: 'unknown',
      })
    }
  }

  return prediction
}
