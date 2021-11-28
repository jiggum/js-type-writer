import { randomSeed } from 'src/seed'
import { writeFile, clone } from 'src/util'
import { crossover, getCrossoverTargetNodeCount } from 'src/crossover'
import { readFileSync } from 'fs'

const code = readFileSync('input/quicksort.js').toString()
const astA = randomSeed(code)
const astB = randomSeed(code)
writeFile('output/crossover.example.input.astA.ts', astA)
writeFile('output/crossover.example.input.astB.ts', astB)

const count = getCrossoverTargetNodeCount(astA)
const astA_ = clone(astA)
const astB_ = clone(astB)
crossover(astA_, astB_, count, (depth) => Math.max(10 / (depth * depth), 1))
writeFile('output/crossover.example.output.astA.ts', astA_)
writeFile('output/crossover.example.output.astB.ts', astB_)
