import { createSeeder } from 'src/seed'
import { writeFile } from 'src/util'
import { resolve } from 'path'
import { calcFitness } from 'src/fitness'
import { mutateSharpen, mutateTransform, mutateUnion } from 'src/mutation'

const randomSeed = createSeeder()
const filepath = resolve(__dirname, '../input/quicksort.js')
const ast = randomSeed(filepath)
mutateTransform(ast, 0.2)
mutateUnion(ast, 0.2)
mutateSharpen(ast, 0.5)
writeFile('output/fitness.example.input.ts', ast)
console.log(calcFitness(ast))
