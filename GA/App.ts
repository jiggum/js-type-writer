import * as dotenv from 'dotenv'
import Population, { Individual } from './Population'

import { writeFile } from 'src/util'
import { resolve } from 'path'

dotenv.config()
const POP_SIZE = parseInt(process.env.POP_SIZE!)
const parentSelectionChoice = 0 // ⚡️ hyperparameter
const generationSelectionChoice = 0 // ⚡️ hyperparameter

// Main program loop - Evolutionary cycle
function runCycle(population: Population) {
  // Step 1. Calculate each individual's fitness
  population.calPopulationFitness()

  // Step 2. Select parents
  switch (parentSelectionChoice) {
    case 0 as number:
      // select by roulette
      population.selectParents.roulette.call(population)
      break
    case 1 as number:
      // select by tournament (slower)
      population.selectParents.tournament.call(population, POP_SIZE / 2) // ⚡️ hyperparameter (select tournament size)
  }

  // Step 3. cross-over, mutation
  population.produceOffspring()

  // Step 4. Select next generation from current parent+offspring population pool
  switch (generationSelectionChoice) {
    case 0 as number:
      // total replacement
      population.formNextGeneration.gradual_replacement.call(population, POP_SIZE)
      break
    case 1 as number:
      // gradual replacement (control replace size here)
      population.formNextGeneration.gradual_replacement.call(population, Math.floor(POP_SIZE / 2)) // ⚡️ hyperparameter (select replacement size)
      break
    case 2 as number:
      // elitism (control preserve size here)
      population.formNextGeneration.elitism.call(population, Math.floor(POP_SIZE / 20)) // ⚡️ hyperparameter (select elitism size)
  }
}

// Main program
console.log('Program start')
const filepath = resolve(__dirname, '../input/quicksort.js')

let generation = 0
const population: Population = new Population(filepath)
let stoppingCondition = false
while (!stoppingCondition) {
  generation++
  console.log(`--Generation ${generation} start--`)
  runCycle(population)

  // Show individual with best fitness
  const bestIndiv: Individual = population.findBest()
  console.log(`--Generation ${generation} end / current best fitness ${bestIndiv.fitness}--`)

  // 🐛 Stopping condition - target song is found
  if (bestIndiv.fitness < 10) {
    console.log(
      `Stopping condition reached - Generation ${generation} / Fitness ${bestIndiv.fitness}`,
    )
    stoppingCondition = true
    writeFile('output/GA.output.ts', bestIndiv.ast)
  }
}
