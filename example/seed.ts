import { randomSeed } from 'src/seed'
import { writeFile } from 'src/util'
import { readFileSync } from 'fs'

const code = readFileSync('input/quicksort.js').toString()
const ast = randomSeed(code)
writeFile('output/seed.example.ts', ast)
