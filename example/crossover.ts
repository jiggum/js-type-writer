import { randomSeed } from 'src/seed'
import { getTotalNodeCount, writeFile } from 'src/util'
import { crossover } from 'src/crossover'
import { readFileSync } from 'fs'

const code = readFileSync('input/quicksort.js').toString()
const astA = randomSeed(code)
const astB = randomSeed(code)
writeFile('output/crossover.example.input.astA.ts', astA)
writeFile('output/crossover.example.input.astB.ts', astB)

const totalNodeCount = getTotalNodeCount(astA)
crossover(astA, astB, totalNodeCount, (depth) => Math.max(4 / depth, 1))
writeFile('output/crossover.example.output.astA.ts', astA)
writeFile('output/crossover.example.output.astB.ts', astB)
