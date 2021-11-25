import { FunctionDeclarationPrediction } from './types'

export function crossover(
  f1: FunctionDeclarationPrediction,
  f2: FunctionDeclarationPrediction,
): FunctionDeclarationPrediction {
  console.log(f1, f2)
  throw 'NOT IMPLEMENTED'
}

export function mutate(f: FunctionDeclarationPrediction): FunctionDeclarationPrediction {
  console.log(f)
  throw 'NOT IMPLEMENTED'
}
