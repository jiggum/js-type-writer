import * as ts from 'typescript'
import * as dotenv from 'dotenv'

import { clone } from 'src/util'
import { randomSeed } from 'src/seed'
import { crossover, getCrossoverTargetNodeCount } from 'src/crossover'
import { mutateSharpen, mutateTransform, mutateUnion } from 'src/mutation'
import { calcFitness } from 'src/fitness'

type AST = ts.SourceFile
export interface Individual {
  ast: AST
  fitness: number
}

dotenv.config()
const POP_SIZE = parseInt(process.env.POP_SIZE!) // Must be an even number
// assert(POP_SIZE % 2 == 0)
const TRANSFORM_RATE = parseInt(process.env.MUTATION_TRANSFORM_RATE!)
const UNION_RATE = parseInt(process.env.MUTATION_UNION_RATE!)
const SHARPEN_RATE = parseInt(process.env.MUTATION_SHARPEN_RATE!)

// comparator for sort function - order of increasing fitness
const compareFitnessInc = (s1: Individual, s2: Individual): number => {
  const a: number = s1.fitness
  const b: number = s2.fitness
  if (a < b) return -1
  else if (a == b) return 0
  else return 1
}

/**
 * Calculate fitness for given ast
 * @param {ts.SourceFile} ast - representation (Abstract Syntax Tree)
 * @returnType {number} fitness
 */
const customFitness = (ast: ts.SourceFile): number => {
  // 🐛 TODO
  return calcFitness(ast)
}

/**
 * Sample one element randomly from the array
 * @param {Array<T>} arr - Array of generic type T
 * @returnType {T} randomly chosen element of arr
 */
function sampleRandom<T>(arr: Array<T>) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default class Population {
  public parentPop: Array<Individual>
  public matingPool: Array<Individual>
  public childPop: Array<Individual>
  private fitsum: number // sum of fitness for all Individuals in this population

  constructor(code: string) {
    this.parentPop = [] // Main population - invariant : always sorted, best indiv on the front
    this.matingPool = [] // Individuals chosen as parents are temporarily stored here
    this.childPop = [] // Child population for step 3 - 'produceOffspring'
    this.fitsum = 0

    // Init parentPop with new Math.random Individuals
    for (let i = 0; i < POP_SIZE; i++) {
      const ast = randomSeed(code)
      this.parentPop[i] = { ast, fitness: customFitness(ast) }
    }
  }

  // Step 1. Calculate fitness of each Individual in the population
  calPopulationFitness(): void {
    this.fitsum = 0
    for (let i = 0; i < this.parentPop.length; i++) {
      const indiv = this.parentPop[i]
      indiv.fitness = customFitness(indiv.ast)
      this.fitsum += indiv.fitness
    }

    // parentPop Invariant
    this.parentPop.sort(compareFitnessInc)
  }

  // Step 2. Select parents to form mating pool
  selectParents = {
    // Implemented the algorithm given in the lecture note.
    roulette: (): void => {
      // Roulette + FPS
      const cumProb = [] // cumulative probability, proportional to fitness
      let p = this.parentPop[0].fitness / this.fitsum
      cumProb[0] = p
      for (let i = 1; i < POP_SIZE; i++) {
        p = this.parentPop[i].fitness / this.fitsum
        cumProb[i] = cumProb[i - 1] + p
      }

      this.matingPool = []
      for (let i = 0; i < POP_SIZE; i++) {
        const rand = Math.random()
        let j = 0
        while (cumProb[j] < rand) {
          j++
        }
        this.matingPool[i] = this.parentPop[j]
      }
    },
    tournament: (K: number): void => {
      // tournament - select best among Math.randomly chosen K
      for (let i = 0; i < POP_SIZE; i++) {
        const tmp = []
        for (let j = 0; j < K; j++) {
          tmp.push(sampleRandom<Individual>(this.parentPop))
        }

        this.matingPool[i] = tmp.reduce((prev: Individual, cur: Individual) => {
          return prev.fitness < cur.fitness ? prev : cur // choose one with lower fitness
        })
      }
    },
  }

  // Step 3. Produce offspring population - crossover and mutation
  produceOffspring() {
    this.childPop = []

    for (let i = 1; i < this.parentPop.length; i += 2) {
      const parent1 = sampleRandom<Individual>(this.matingPool)
      const parent2 = sampleRandom<Individual>(this.matingPool)

      // 3-1. Cross-over
      // let child: Individual = parent1
      const count = getCrossoverTargetNodeCount(parent1.ast)
      const astA = clone(parent1.ast)
      const astB = clone(parent2.ast)
      const child1: Individual = { ast: astA, fitness: customFitness(astA) }
      const child2: Individual = { ast: astB, fitness: customFitness(astB) }
      crossover(child1.ast, child2.ast, count, (depth) => Math.max(10 / (depth * depth), 1))

      // 3-2. Mutation
      mutateTransform(child1.ast, TRANSFORM_RATE)
      mutateUnion(child1.ast, UNION_RATE)
      mutateSharpen(child1.ast, SHARPEN_RATE)

      mutateTransform(child2.ast, TRANSFORM_RATE)
      mutateUnion(child2.ast, UNION_RATE)
      mutateSharpen(child2.ast, SHARPEN_RATE)

      child1.fitness = customFitness(child1.ast)
      child2.fitness = customFitness(child2.ast)
      this.childPop[i - 1] = child1
      this.childPop[i] = child2
    }
  }

  // Step 4. With parent and offspring population, get next generation population
  formNextGeneration = {
    // Gradual replacement
    // if replaceCnt == this.parentPop.length, whole parent population will be replaced with offspring population
    gradual_replacement: (replaceCnt: number = this.parentPop.length): void => {
      this.childPop.sort(compareFitnessInc)

      // Replace 'replaceCnt' Individuals with lowest fitness from parent with same amount of best offsprings
      for (let i = 0; i < replaceCnt; i++) {
        this.parentPop[i] = this.childPop[i]
      }
    },

    // Elitism
    // Keep 'keepCnt' best Individuals from the parent population
    elitism: (keepCnt: number): void => {
      const N = this.parentPop.length
      for (let i = keepCnt; i < N; i++) {
        this.parentPop[i] = sampleRandom<Individual>(this.childPop) // randomly select offspring for the rest of the population
      }
    },
  }

  // Find Individual with best fitness
  findBest(): Individual {
    this.parentPop.sort(compareFitnessInc)
    return this.parentPop[0]
  }

  // Calculate average fitness of the whole population
  getAverageFitness(): number {
    return this.fitsum / POP_SIZE
  }
}
