import { randomSeed } from 'src/seed'
import { writeFile } from 'src/util'
import { readFileSync } from 'fs'
import { mutateSharpen, mutateTransform, mutateUnion } from 'src/mutation'

const code = readFileSync('input/quicksort.js').toString()
const ast = randomSeed(code)

writeFile('output/mutate.example.input.ts', ast)
mutateTransform(ast, 0.2)
mutateUnion(ast, 0.2)
mutateSharpen(ast, 0.5)
writeFile('output/mutate.example.output.ts', ast)
