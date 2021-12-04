import * as ts from 'typescript'
import { inCoverage, isSameType, randomType, traverse } from 'src/util'

export const mutateTransform = (root: ts.Node, p: number) => {
  traverse(root, (node) => {
    const result = inCoverage(node)
    if (result && Math.random() < p) {
      const [, convert] = result
      convert(randomType())
    }
  })
}

export const mutateUnion = (root: ts.Node, p: number) => {
  traverse(root, (node) => {
    const result = inCoverage(node)
    if (result && Math.random() < p) {
      const [, convert, prevType] = result
      const prevTypes = (() => {
        if (ts.isUnionTypeNode(prevType!)) return prevType.types
        return [prevType!]
      })()
      for (let i = 0; i < 10; i = i + 1) {
        const type = randomType(false, false)
        if (!prevTypes.some((e) => isSameType(e, type))) {
          convert(ts.factory.createUnionTypeNode([...prevTypes, type]))
          break
        }
      }
    }
  })
}

export const mutateSharpen = (root: ts.Node, p: number) => {
  traverse(root, (node) => {
    const result = inCoverage(node)
    if (result && Math.random() < p) {
      const [, convert, prevType] = result
      if (ts.isUnionTypeNode(prevType!)) {
        const nextTypes = [...prevType.types]
        nextTypes.splice(Math.floor(Math.random() * nextTypes.length), 1)
        convert(ts.factory.createUnionTypeNode(nextTypes))
      }
      if (ts.isArrayTypeNode(prevType!)) {
        convert(ts.factory.createArrayTypeNode(randomType(true, false)))
      }
    }
  })
}
