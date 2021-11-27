import * as dotenv from 'dotenv'
import Population from './Population'
import Individual from './Individual'
import { varEntry } from './types'

dotenv.config()
const POP_SIZE = parseInt(process.env.POP_SIZE!)
const parentSelectionChoice = 0
const crossoverChoice = 0 // 0 - single-point, 1 - uniform
const generationSelectionChoice = 0

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
      population.selectParents.tournament.call(population, POP_SIZE / 2)
  }

  // Step 3. cross-over, mutation
  population.produceOffspring(crossoverChoice)

  // Step 4. Select next generation from current parent+offspring population pool
  switch (generationSelectionChoice) {
    case 0 as number:
      // total replacement
      population.formNextGeneration.gradual_replacement.call(population, POP_SIZE)
      break
    case 1 as number:
      // gradual replacement (control replace size here)
      population.formNextGeneration.gradual_replacement.call(population, Math.floor(POP_SIZE / 2))
      break
    case 2 as number:
      // elitism (control preserve size here)
      population.formNextGeneration.elitism.call(population, Math.floor(POP_SIZE / 20))
  }
}

// Main program

// 🐛 Fetch from AST
const initArr: Array<varEntry> = [
  ['quickSort', 'any'],
  ['pivot', 'any'],
  ['partitionIndex', 'any'],
  ['partition', 'any'],
  ['pivotValue', 'any'],
  ['partitionIndex', 'any'],
  ['i', 'any'],
  ['swap', 'any'],
  ['temp', 'any'],
]

let generation = 0
const population: Population = new Population(initArr)
let stoppingCondition = false
while (!stoppingCondition) {
  generation++

  runCycle(population)

  // Show individual with best fitness
  const bestIndiv: Individual = population.findBest()

  // 🐛 Stopping condition - target song is found
  if (bestIndiv.fitness < 10) {
    console.log(
      `Stopping condition reached - Generation ${generation} / Fitness ${bestIndiv.fitness}`,
    )
    stoppingCondition = true
  }
}
