import * as ts from 'typescript'
import replace from '../replace'

replace(
  process.argv[2],
  process.argv[3],
  process.argv[4],
  {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    allowJs: true,
  },
)
