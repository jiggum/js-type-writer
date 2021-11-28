import * as ts from 'typescript'
import { randomSeed } from 'src/seed'
import { writeFile } from 'src/util'

const inputFileName = 'input/quicksort.js'
const program = ts.createProgram([inputFileName], {
  allowJs: true,
})
const ast = randomSeed(program.getSourceFile(inputFileName)!)
writeFile('output/randomSeed.example.ts', ast)
