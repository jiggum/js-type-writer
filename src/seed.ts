import * as ts from 'typescript'

import { clone, getInferredType, inCoverage, randomType, traverse } from 'src/util'

export const createSeeder = () => {
  const cache: Record<string, ts.SourceFile> = {}

  const getInferredSourceFile = (filepath: string) => {
    if (cache[filepath] == null) {
      const program = ts.createProgram([filepath], {
        checkJs: true,
        allowJs: true,
      })
      const checker = program.getTypeChecker()

      const root = program.getSourceFile(filepath)

      if (root == null) {
        throw '지정된 경로에 파일이 존재하지 않습니다'
      }

      traverse(root, (node) => {
        const result = inCoverage(node)
        if (result) {
          const inferredType = getInferredType(node, checker)
          const [, convert] = result

          if (checker.typeToString(inferredType) !== 'any') {
            const typeNode = randomType()
            // TODO: convert inferredType to TypeNode
            convert(typeNode)
          }
        }
      })

      cache[filepath] = root
    }

    return clone(cache[filepath])
  }

  const randomSeed = (filepath: string) => {
    const root = getInferredSourceFile(filepath)

    traverse(root, (node) => {
      const result = inCoverage(node)
      if (result) {
        const [, convert] = result

        if (node.type == null) {
          // TODO: fix type error with some type guard?
          convert(randomType())
        }
      }
    })

    return root
  }

  return randomSeed
}
