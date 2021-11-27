import * as dotenv from 'dotenv'
dotenv.config()
import { varEntry } from './types'

const typePool: Array<string> = ['number', 'string', 'boolean'] // 🐛 available types

const VAR = 0
const TYPE = 1

export default class Individual {
  public N: number // number of variables
  public fitness: number
  public arr: Array<varEntry> // representation; array of (variables, inferred type)

  // @args an array of [variable name, type] or an array of variable names
  // Extract variable names and initialize types (randomly)
  constructor(initArr: Array<varEntry> | Array<string>) {
    this.N = initArr.length
    this.fitness = 0 // 🐛 0? INF?
    this.arr = initArr.map((val, idx) => {
      if (typeof val == 'string') return [val, 'any']
      else return [val[0], 'any']
    }) // 'any' type

    // Initialize current variable entries with random types
    for (let i = 0; i < this.N; i++) {
      this.arr[i][TYPE] = typePool[Math.floor(Math.random() * typePool.length)] // 🐛 choose random types among 'typePool'
    }
  }

  // Fitness calculation method
  // Calculate fitness and update 'this.fitness'
  // @args None
  // @return None
  calFitness(): void {
    // 🐛 TODO
  }
}

// Crossover options
// Usage) let offspring = crossover.singlePoint(s1, s2);
const crossover = {
  // Choose a single mid-point to twist and mix
  singlePoint: function (ind1: Individual, ind2: Individual): Individual {
    // A new child
    const N: number = ind1.arr.length
    const offspring: Individual = new Individual(ind1.arr)

    // Single-point cross-over
    // ind1[0...idx-1] + ind2[idx...N]
    const idx = Math.floor(Math.random() * N) // cut point
    offspring.arr = Object.assign([], ind1.arr)
    offspring.arr.splice(idx, offspring.arr.length - idx, ...ind2.arr.slice(idx))
    return offspring
  },
  // At each point, choose to mix each gene or not
  uniform: function (ind1: Individual, ind2: Individual): Individual {
    const N: number = ind1.arr.length
    const offspring: Individual = new Individual(ind1.arr)

    for (let i = 0; i < N; i++) {
      if (Math.random() < 0.5) offspring.arr[i] = ind1.arr[i]
      else offspring.arr[i] = ind2.arr[i]
    }
    return offspring
  },
}

// Mutation options - randomFlip
const mutation = {
  // Change each note to a new random note if mutation rate permits
  randomFlip: function (ind: Individual): void {
    for (let i = 0; i < ind.arr.length; i++) {
      if (Math.random() <= parseFloat(process.env.MUTATION_RATE!)) {
        ind.arr[i][TYPE] = typePool[Math.floor(Math.random() * typePool.length)] // 🐛 Change to other random types
      }
    }
  },
}

export { crossover, mutation }
