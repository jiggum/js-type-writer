import * as ts from 'typescript'
import { appendFileSync } from 'fs'
import { decodeNodeKind, inCoverage, isFunction, isSameType, randomType, traverse } from 'src/util'

function formatMutateLog(name: string, prevType: ts.TypeNode | undefined, newType: ts.TypeNode) {
  return `${name} ${decodeNodeKind(prevType?.kind ?? 0)} ${decodeNodeKind(newType.kind)}\n`
}

export const inMutationCoverage = (
  node: ts.Node,
  diagnostics: ts.Diagnostic[] | undefined,
  logging = false,
):
  | undefined
  | [
      string,
      (to: ts.Node) => void,
      ts.TypeNode | undefined,
      (node?: ts.TypeNode) => ts.TypeNode | undefined,
    ] => {
  const matchedDiagnostic = diagnostics?.find((d) => d.start === node.pos)
  if (!diagnostics || matchedDiagnostic) {
    const result = inCoverage(node)
    if (logging && result && matchedDiagnostic) {
      const [name] = result
      console.log(
        `${name} of type ${decodeNodeKind(result[2]?.kind ?? 0)} has ERROR: ${
          matchedDiagnostic?.messageText
        }`,
      )
    }
    return result
  }
  return undefined
}
export const mutateTransform = (root: ts.Node, p: number, diagnostics?: ts.Diagnostic[]) => {
  traverse(root, (node) => {
    const result = inMutationCoverage(node, diagnostics)
    if (result && Math.random() < p) {
      const [name, convert, prevType] = result
      const newType = randomType(false, true, isFunction(node))
      appendFileSync('mutate.transform.log', formatMutateLog(name, prevType, newType))
      convert(newType)
    }
  })
}

export const mutateUnion = (root: ts.Node, p: number, diagnostics?: ts.Diagnostic[]) => {
  traverse(root, (node) => {
    const result = inMutationCoverage(node, diagnostics)
    if (result && Math.random() < p) {
      const [name, convert, prevType] = result
      const prevTypes = (() => {
        if (ts.isUnionTypeNode(prevType!)) return prevType.types
        return [prevType!]
      })()
      for (let i = 0; i < 10; i = i + 1) {
        const type = randomType(false, false, isFunction(node))
        if (!prevTypes.some((e) => isSameType(e, type))) {
          const newType = ts.factory.createUnionTypeNode([...prevTypes, type])
          appendFileSync('mutate.transform.log', formatMutateLog(name, prevType, newType))
          convert(newType)
          break
        }
      }
    }
  })
}

export const mutateSharpen = (root: ts.Node, p: number, diagnostics?: ts.Diagnostic[]) => {
  traverse(root, (node) => {
    const result = inMutationCoverage(node, diagnostics)
    if (result && Math.random() < p) {
      const [name, convert, prevType] = result
      if (ts.isUnionTypeNode(prevType!)) {
        const nextTypes = [...prevType.types]
        nextTypes.splice(Math.floor(Math.random() * nextTypes.length), 1)
        const newType = ts.factory.createUnionTypeNode(nextTypes)
        for (const t of prevType.types) {
          appendFileSync('mutate.transform.log', formatMutateLog(name, t, newType))
        }
        convert(newType)
      }
      if (ts.isArrayTypeNode(prevType!)) {
        const newType = ts.factory.createArrayTypeNode(randomType(true, false, isFunction(node)))
        appendFileSync('mutate.transform.log', formatMutateLog(name, prevType, newType))
        convert(newType)
      }
    }
  })
}
