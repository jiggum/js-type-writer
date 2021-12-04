import * as ts from 'typescript'
import { resolve } from 'path'

import {
  clone,
  getInferredTypeNode,
  inCoverage,
  isAnyTypeNode,
  randomType,
  traverse,
} from 'src/util'

export const createSeeder = () => {
  const cache: Record<string, ts.SourceFile> = {}

  const getInferredSourceFile = (filepath: string) => {
    const absolutePath = resolve(filepath)

    if (cache[absolutePath] == null) {
      const program = ts.createProgram([absolutePath], {
        checkJs: true,
        allowJs: true,
      })
      const checker = program.getTypeChecker()

      const root = program.getSourceFile(absolutePath)

      if (root == null) {
        throw '지정된 경로에 파일이 존재하지 않습니다'
      }

      traverse(root, (node) => {
        const result = inCoverage(node)
        if (result) {
          const inferredTypeNode = getInferredTypeNode(node, checker)
          const [, convert] = result

          if (inferredTypeNode != null) {
            convert(inferredTypeNode)
          }
        }
      })

      cache[absolutePath] = root
    }

    return clone(cache[absolutePath])
  }

  const randomSeed = (filepath: string) => {
    const root = getInferredSourceFile(filepath)

    traverse(root, (node) => {
      const result = inCoverage(node)
      if (result) {
        const [, convert, typeNode] = result

        if (typeNode == null || isAnyTypeNode(typeNode)) {
          convert(randomType())
        }
      }
    })

    return root
  }

  return randomSeed
}
