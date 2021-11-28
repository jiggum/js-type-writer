import { randomSeed } from 'src/seed'
import { writeFile } from 'src/util'
import { readFileSync } from 'fs'
import { calcFitness } from 'src/fitness'
import { mutateSharpen, mutateTransform, mutateUnion } from 'src/mutation'

const code = readFileSync('input/quicksort.js').toString()
const ast = randomSeed(code)
mutateTransform(ast, 0.2)
mutateUnion(ast, 0.2)
mutateSharpen(ast, 0.5)
writeFile('output/fitness.example.input.ts', ast)
console.log(calcFitness(ast))
