import * as ts from 'typescript'

const defaultWeightByDepth = () => 1

const nodeKeys = new Set([
  'pos',
  'end',
  'kind',
  'flags',
  'decorators',
  'modifiers',
  'parent',
  'modifierFlagsCache',
  'transformFlags',
])

/**
 * Usage
 * ----------
 * const totalNodeCount = getTotalNodeCount(astA)
 * crossover(astA, astB, totalNodeCount)
 */
export const crossover = (
  astA: ts.Node,
  astB: ts.Node,
  totalNodeCount: number,
  weightByDepth: (deapth: number) => number = defaultWeightByDepth,
) => {
  let slicePoint: number
  let parentA: ts.Node
  let childA: ts.Node

  const processA = () => {
    let slicePointCounter = 0
    let terminated = false

    const visit = (parent: ts.Node, node: ts.Node, depth: number) => {
      if (terminated) return

      slicePointCounter = slicePointCounter + 1
      const weight = weightByDepth(depth)
      // When each node's weight is 1
      // 1st Node's p = 1/n
      // 2nd Node's p = (n-1/n)*(1/n-1) = 1/n
      // 3nd Node's p = (n-1/n)*(n-2/n-1)(1/n-2) = 1/n
      // p of all nodes is equal to 1/n
      const p = weight / (totalNodeCount - slicePointCounter)
      if (Math.random() < p) {
        slicePoint = slicePointCounter
        parentA = parent
        childA = node
        terminated = true
        return
      }
      ts.forEachChild(node, (e) => visit(node, e, depth + 1))
    }
    ts.forEachChild(astA, (e) => visit(astA, e, 1))
  }

  const processB = () => {
    let slicePointCounter = 0
    let terminated = false

    const visit = (parentB: ts.Node, node: ts.Node) => {
      if (terminated) return

      slicePointCounter = slicePointCounter + 1
      if (slicePointCounter == slicePoint) {
        const keys = Object.keys(parentA).filter((key) => !nodeKeys.has(key))
        console.log(Object.keys(parentA), keys)
        keys.forEach((key) => {
          // @ts-ignore
          const targetA = parentA[key]
          if (targetA === childA) {
            // @ts-ignore
            parentA[key] = node
            // @ts-ignore
            parentB[key] = childA
          }
          if (Array.isArray(targetA)) {
            const targetIndex = targetA.indexOf(childA)
            // @ts-ignore
            targetA[targetIndex] = node
            // @ts-ignore
            parentB[key][targetIndex] = childA
          }
        })
        terminated = true
      }
      ts.forEachChild(node, (e) => visit(node, e))
    }
    ts.forEachChild(astB, (e) => visit(astB, e))
  }

  processA()
  processB()
}
