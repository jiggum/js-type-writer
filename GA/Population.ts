import * as dotenv from 'dotenv'
import Individual, { crossover, mutation } from './individual'
import { varEntry } from './types'

dotenv.config()
const POP_SIZE = parseInt(process.env.POP_SIZE!)

// comparator for sort function - order of increasing fitness
const compareFitnessInc = (s1: Individual, s2: Individual): number => {
  const a: number = s1.fitness
  const b: number = s2.fitness
  if (a < b) return -1
  else if (a == b) return 0
  else return 1
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
  private fitsum: number // sum of fitness for all individuals in this population

  constructor(initArr: Array<varEntry> | Array<string>) {
    this.parentPop = [] // Main population - invariant : always sorted, best indiv on the front
    this.matingPool = [] // Individuals chosen as parents are temporarily stored here
    this.childPop = [] // Child population for step 3 - 'produceOffspring'
    this.fitsum = 0

    // Init parentPop with new Math.random individuals
    for (let i = 0; i < POP_SIZE; i++) {
      this.parentPop[i] = new Individual(initArr)
    }
  }

  // Step 1. Calculate fitness of each individual in the population
  calPopulationFitness(): void {
    this.fitsum = 0
    for (let i = 0; i < this.parentPop.length; i++) {
      const indiv = this.parentPop[i]
      indiv.calFitness()
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
  produceOffspring(option = 0) {
    this.childPop = []

    for (let i = 0; i < this.parentPop.length; i++) {
      const parent1 = sampleRandom<Individual>(this.matingPool)
      const parent2 = sampleRandom<Individual>(this.matingPool)

      // 3-1. Cross-over
      let child: Individual = parent1
      switch (option) {
        case 0:
          child = crossover.singlePoint(parent1, parent2)
          break
        case 1:
          child = crossover.uniform(parent1, parent2)
      }

      // 3-2. Mutation
      mutation.randomFlip(child)

      child.calFitness()
      this.childPop[i] = child
    }
  }

  // Step 4. With parent and offspring population, get next generation population
  formNextGeneration = {
    // Gradual replacement
    // if replaceCnt == this.parentPop.length, whole parent population will be replaced with offspring population
    gradual_replacement: (replaceCnt: number = this.parentPop.length): void => {
      this.childPop.sort(compareFitnessInc)

      // Replace 'replaceCnt' individuals with lowest fitness from parent with same amount of best offsprings
      for (let i = 0; i < replaceCnt; i++) {
        this.parentPop[i] = this.childPop[i]
      }
    },

    // Elitism
    // Keep 'keepCnt' best individuals from the parent population
    elitism: (keepCnt: number): void => {
      const N = this.parentPop.length
      for (let i = keepCnt; i < N; i++) {
        this.parentPop[i] = sampleRandom<Individual>(this.childPop) // randomly select offspring for the rest of the population
      }
    },
  }

  // Find individual with best fitness
  findBest(): Individual {
    this.parentPop.sort(compareFitnessInc)
    return this.parentPop[0]
  }

  // Calculate average fitness of the whole population
  getAverageFitness(): number {
    return this.fitsum / POP_SIZE
  }
}
