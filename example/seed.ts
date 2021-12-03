import { createSeeder } from 'src/seed'
import { writeFile } from 'src/util'
import { resolve } from 'path'

const randomSeed = createSeeder()
const filepath = resolve(__dirname, '../input/quicksort.js')
const ast = randomSeed(filepath)
writeFile('output/seed.example.output.ts', ast)
