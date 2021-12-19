import * as ts from 'typescript'
import * as fs from 'fs'

const DUMMY_FILE_PATH = '/tmp.ts'

export const isFunction = (node: ts.Node) => {
  return ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)
}

export const inCoverage = (
  node: ts.Node,
):
  | undefined
  | [
      string,
      (to: ts.Node) => void,
      ts.TypeNode | undefined,
      (node?: ts.TypeNode) => ts.TypeNode | undefined,
    ] => {
  if (ts.isVariableDeclaration(node) && ts.isFunctionLike(node.initializer)) {
    return undefined
  }
  if (ts.isFunctionDeclaration(node)) {
    return [
      node.name?.escapedText ?? '',
      // @ts-ignore
      (to) => (node.type = to),
      node.type,
      (node) => (node as ts.FunctionTypeNode).type,
    ]
  }
  if (ts.isArrowFunction(node)) {
    return [
      node.name ?? '',
      // @ts-ignore
      (to) => (node.type = to),
      node.type,
      (node) => (node as ts.FunctionTypeNode).type,
    ]
  }
  if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
    if (ts.isIdentifier(node.name)) {
      return [
        node.name.escapedText ?? '',
        // @ts-ignore
        (to) => (node.type = to),
        node.type,
        (node) => node,
      ]
    } else {
      throw Error(`Unhandled Node kind: ${node.kind}`)
    }
  }
  return undefined
}

export const decodeType = (str: string): ts.TypeNode => {
  if (str === 'number') {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
  }
  if (str === 'string') {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
  }
  if (str === 'any') {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
  }
  // throw Error(`Unhandled type string: ${str}`)
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
}

export const getInferredType = (node: ts.Node, checker: ts.TypeChecker) => {
  return checker.getApparentType(checker.getTypeAtLocation(node))
}

export const getInferredTypeNode = (node: ts.Node, checker: ts.TypeChecker) => {
  const t = checker.getTypeAtLocation(node)
  return checker.typeToTypeNode(t, node.parent, undefined)
}

const supportedKnownKeywordTypeKinds = [
  ts.SyntaxKind.BooleanKeyword,
  ts.SyntaxKind.NumberKeyword,
  ts.SyntaxKind.StringKeyword,
  ts.SyntaxKind.NullKeyword,
  ts.SyntaxKind.UndefinedKeyword,
]
const supportedKeywordTypeKinds = [
  ...supportedKnownKeywordTypeKinds,
  ts.SyntaxKind.UnknownKeyword,
  ts.SyntaxKind.VoidKeyword,
]
const supportedKeywordTypeKindsSet = new Set(supportedKeywordTypeKinds)

const isSupportedKeywordType = (kind: ts.SyntaxKind): kind is ts.KeywordTypeSyntaxKind =>
  supportedKeywordTypeKindsSet.has(kind)

export const randomType = (onlyKeyword = false, withUnknown = true, withVoid = false) => {
  let kinds = supportedKnownKeywordTypeKinds
  if (withUnknown) {
    kinds = [...kinds, ts.SyntaxKind.UnknownKeyword]
  }
  if (!onlyKeyword) {
    kinds = [...kinds, ts.SyntaxKind.ArrayType]
  }
  if (withVoid) {
    kinds = [...kinds, ts.SyntaxKind.VoidKeyword]
  }
  const kind = kinds[Math.floor(Math.random() * kinds.length)]
  if (isSupportedKeywordType(kind)) {
    return ts.factory.createKeywordTypeNode(kind)
  }
  if (kind === ts.SyntaxKind.ArrayType) {
    return ts.factory.createArrayTypeNode(
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
    )
  }
  throw `Unreachable Exception on randomType. Type kind:${kind}`
}

export const isSameType = (typeA: ts.TypeNode, typeB: ts.TypeNode): boolean => {
  const kind = typeA.kind
  if (typeA.kind === ts.SyntaxKind.AnyKeyword || isSupportedKeywordType(typeA.kind)) {
    return typeA.kind == typeB.kind
  }
  if (kind === ts.SyntaxKind.ArrayType) {
    if (ts.isArrayTypeNode(typeA) && ts.isArrayTypeNode(typeB)) {
      return isSameType(typeA.elementType, typeB.elementType)
    } else {
      return false
    }
  }
  if (kind === ts.SyntaxKind.UnionType) {
    if (ts.isUnionTypeNode(typeA) && ts.isUnionTypeNode(typeB)) {
      return (
        typeA.types.length === typeB.types.length &&
        typeA.types.every((e, i) => isSameType(e, typeB.types[i]))
      )
    } else {
      return false
    }
  }
  throw `Unreachable Exception on isSameType. Type kind:${kind}`
}

export const isAnyTypeNode = (typeNode: ts.TypeNode) => {
  return typeNode.kind === ts.SyntaxKind.AnyKeyword
}

export const getCode = (ast: ts.Node) => {
  const dummyFile = ts.createSourceFile(
    DUMMY_FILE_PATH,
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  )
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  return printer.printNode(ts.EmitHint.Unspecified, ast, dummyFile)
}

export const writeFile = (fineName: string, ast: ts.Node) => {
  const text = getCode(ast)
  fs.writeFileSync(fineName, text, 'utf8')
}

export const clone = (ast: ts.Node) => {
  const text = getCode(ast)
  return ts.createSourceFile(DUMMY_FILE_PATH, text, ts.ScriptTarget.Latest)
}

export const traverse = (
  root: ts.Node,
  handler: (node: ts.Node, parent: ts.Node | undefined, depth: number) => boolean | void,
) => {
  const visit = (node: ts.Node, parent: ts.Node | undefined, depth: number) => {
    const stop = handler(node, parent, depth)
    if (!stop) {
      ts.forEachChild(node, (e) => visit(e, node, depth + 1))
    }
  }
  visit(root, undefined, 0)
}

const KIND_TO_STRING: Record<string, string> = {
  '0': 'Unknown',
  '1': 'EndOfFileToken',
  '10': 'StringLiteral',
  '100': 'ImportKeyword',
  '101': 'InKeyword',
  '102': 'InstanceOfKeyword',
  '103': 'NewKeyword',
  '104': 'NullKeyword',
  '105': 'ReturnKeyword',
  '106': 'SuperKeyword',
  '107': 'SwitchKeyword',
  '108': 'ThisKeyword',
  '109': 'ThrowKeyword',
  '11': 'JsxText',
  '110': 'TrueKeyword',
  '111': 'TryKeyword',
  '112': 'TypeOfKeyword',
  '113': 'VarKeyword',
  '114': 'VoidKeyword',
  '115': 'WhileKeyword',
  '116': 'LastReservedWord',
  '117': 'FirstFutureReservedWord',
  '118': 'InterfaceKeyword',
  '119': 'LetKeyword',
  '12': 'JsxTextAllWhiteSpaces',
  '120': 'PackageKeyword',
  '121': 'PrivateKeyword',
  '122': 'ProtectedKeyword',
  '123': 'PublicKeyword',
  '124': 'StaticKeyword',
  '125': 'LastFutureReservedWord',
  '126': 'AbstractKeyword',
  '127': 'AsKeyword',
  '128': 'AssertsKeyword',
  '129': 'AssertKeyword',
  '13': 'RegularExpressionLiteral',
  '130': 'AnyKeyword',
  '131': 'AsyncKeyword',
  '132': 'AwaitKeyword',
  '133': 'BooleanKeyword',
  '134': 'ConstructorKeyword',
  '135': 'DeclareKeyword',
  '136': 'GetKeyword',
  '137': 'InferKeyword',
  '138': 'IntrinsicKeyword',
  '139': 'IsKeyword',
  '14': 'FirstTemplateToken',
  '140': 'KeyOfKeyword',
  '141': 'ModuleKeyword',
  '142': 'NamespaceKeyword',
  '143': 'NeverKeyword',
  '144': 'ReadonlyKeyword',
  '145': 'RequireKeyword',
  '146': 'NumberKeyword',
  '147': 'ObjectKeyword',
  '148': 'SetKeyword',
  '149': 'StringKeyword',
  '15': 'TemplateHead',
  '150': 'SymbolKeyword',
  '151': 'TypeKeyword',
  '152': 'UndefinedKeyword',
  '153': 'UniqueKeyword',
  '154': 'UnknownKeyword',
  '155': 'FromKeyword',
  '156': 'GlobalKeyword',
  '157': 'BigIntKeyword',
  '158': 'OverrideKeyword',
  '159': 'LastKeyword',
  '16': 'TemplateMiddle',
  '160': 'QualifiedName',
  '161': 'ComputedPropertyName',
  '162': 'TypeParameter',
  '163': 'Parameter',
  '164': 'Decorator',
  '165': 'PropertySignature',
  '166': 'PropertyDeclaration',
  '167': 'MethodSignature',
  '168': 'MethodDeclaration',
  '169': 'ClassStaticBlockDeclaration',
  '17': 'LastTemplateToken',
  '170': 'Constructor',
  '171': 'GetAccessor',
  '172': 'SetAccessor',
  '173': 'CallSignature',
  '174': 'ConstructSignature',
  '175': 'IndexSignature',
  '176': 'FirstTypeNode',
  '177': 'TypeReference',
  '178': 'FunctionType',
  '179': 'ConstructorType',
  '18': 'FirstPunctuation',
  '180': 'TypeQuery',
  '181': 'TypeLiteral',
  '182': 'ArrayType',
  '183': 'TupleType',
  '184': 'OptionalType',
  '185': 'RestType',
  '186': 'UnionType',
  '187': 'IntersectionType',
  '188': 'ConditionalType',
  '189': 'InferType',
  '19': 'CloseBraceToken',
  '190': 'ParenthesizedType',
  '191': 'ThisType',
  '192': 'TypeOperator',
  '193': 'IndexedAccessType',
  '194': 'MappedType',
  '195': 'LiteralType',
  '196': 'NamedTupleMember',
  '197': 'TemplateLiteralType',
  '198': 'TemplateLiteralTypeSpan',
  '199': 'ImportType',
  '2': 'FirstTriviaToken',
  '20': 'OpenParenToken',
  '200': 'ObjectBindingPattern',
  '201': 'ArrayBindingPattern',
  '202': 'BindingElement',
  '203': 'ArrayLiteralExpression',
  '204': 'ObjectLiteralExpression',
  '205': 'PropertyAccessExpression',
  '206': 'ElementAccessExpression',
  '207': 'CallExpression',
  '208': 'NewExpression',
  '209': 'TaggedTemplateExpression',
  '21': 'CloseParenToken',
  '210': 'TypeAssertionExpression',
  '211': 'ParenthesizedExpression',
  '212': 'FunctionExpression',
  '213': 'ArrowFunction',
  '214': 'DeleteExpression',
  '215': 'TypeOfExpression',
  '216': 'VoidExpression',
  '217': 'AwaitExpression',
  '218': 'PrefixUnaryExpression',
  '219': 'PostfixUnaryExpression',
  '22': 'OpenBracketToken',
  '220': 'BinaryExpression',
  '221': 'ConditionalExpression',
  '222': 'TemplateExpression',
  '223': 'YieldExpression',
  '224': 'SpreadElement',
  '225': 'ClassExpression',
  '226': 'OmittedExpression',
  '227': 'ExpressionWithTypeArguments',
  '228': 'AsExpression',
  '229': 'NonNullExpression',
  '23': 'CloseBracketToken',
  '230': 'MetaProperty',
  '231': 'SyntheticExpression',
  '232': 'TemplateSpan',
  '233': 'SemicolonClassElement',
  '234': 'Block',
  '235': 'EmptyStatement',
  '236': 'FirstStatement',
  '237': 'ExpressionStatement',
  '238': 'IfStatement',
  '239': 'DoStatement',
  '24': 'DotToken',
  '240': 'WhileStatement',
  '241': 'ForStatement',
  '242': 'ForInStatement',
  '243': 'ForOfStatement',
  '244': 'ContinueStatement',
  '245': 'BreakStatement',
  '246': 'ReturnStatement',
  '247': 'WithStatement',
  '248': 'SwitchStatement',
  '249': 'LabeledStatement',
  '25': 'DotDotDotToken',
  '250': 'ThrowStatement',
  '251': 'TryStatement',
  '252': 'DebuggerStatement',
  '253': 'VariableDeclaration',
  '254': 'VariableDeclarationList',
  '255': 'FunctionDeclaration',
  '256': 'ClassDeclaration',
  '257': 'InterfaceDeclaration',
  '258': 'TypeAliasDeclaration',
  '259': 'EnumDeclaration',
  '26': 'SemicolonToken',
  '260': 'ModuleDeclaration',
  '261': 'ModuleBlock',
  '262': 'CaseBlock',
  '263': 'NamespaceExportDeclaration',
  '264': 'ImportEqualsDeclaration',
  '265': 'ImportDeclaration',
  '266': 'ImportClause',
  '267': 'NamespaceImport',
  '268': 'NamedImports',
  '269': 'ImportSpecifier',
  '27': 'CommaToken',
  '270': 'ExportAssignment',
  '271': 'ExportDeclaration',
  '272': 'NamedExports',
  '273': 'NamespaceExport',
  '274': 'ExportSpecifier',
  '275': 'MissingDeclaration',
  '276': 'ExternalModuleReference',
  '277': 'JsxElement',
  '278': 'JsxSelfClosingElement',
  '279': 'JsxOpeningElement',
  '28': 'QuestionDotToken',
  '280': 'JsxClosingElement',
  '281': 'JsxFragment',
  '282': 'JsxOpeningFragment',
  '283': 'JsxClosingFragment',
  '284': 'JsxAttribute',
  '285': 'JsxAttributes',
  '286': 'JsxSpreadAttribute',
  '287': 'JsxExpression',
  '288': 'CaseClause',
  '289': 'DefaultClause',
  '29': 'FirstBinaryOperator',
  '290': 'HeritageClause',
  '291': 'CatchClause',
  '292': 'AssertClause',
  '293': 'AssertEntry',
  '294': 'PropertyAssignment',
  '295': 'ShorthandPropertyAssignment',
  '296': 'SpreadAssignment',
  '297': 'EnumMember',
  '298': 'UnparsedPrologue',
  '299': 'UnparsedPrepend',
  '3': 'MultiLineCommentTrivia',
  '30': 'LessThanSlashToken',
  '300': 'UnparsedText',
  '301': 'UnparsedInternalText',
  '302': 'UnparsedSyntheticReference',
  '303': 'SourceFile',
  '304': 'Bundle',
  '305': 'UnparsedSource',
  '306': 'InputFiles',
  '307': 'FirstJSDocNode',
  '308': 'JSDocNameReference',
  '309': 'JSDocMemberName',
  '31': 'GreaterThanToken',
  '310': 'JSDocAllType',
  '311': 'JSDocUnknownType',
  '312': 'JSDocNullableType',
  '313': 'JSDocNonNullableType',
  '314': 'JSDocOptionalType',
  '315': 'JSDocFunctionType',
  '316': 'JSDocVariadicType',
  '317': 'JSDocNamepathType',
  '318': 'JSDocComment',
  '319': 'JSDocText',
  '32': 'LessThanEqualsToken',
  '320': 'JSDocTypeLiteral',
  '321': 'JSDocSignature',
  '322': 'JSDocLink',
  '323': 'JSDocLinkCode',
  '324': 'JSDocLinkPlain',
  '325': 'FirstJSDocTagNode',
  '326': 'JSDocAugmentsTag',
  '327': 'JSDocImplementsTag',
  '328': 'JSDocAuthorTag',
  '329': 'JSDocDeprecatedTag',
  '33': 'GreaterThanEqualsToken',
  '330': 'JSDocClassTag',
  '331': 'JSDocPublicTag',
  '332': 'JSDocPrivateTag',
  '333': 'JSDocProtectedTag',
  '334': 'JSDocReadonlyTag',
  '335': 'JSDocOverrideTag',
  '336': 'JSDocCallbackTag',
  '337': 'JSDocEnumTag',
  '338': 'JSDocParameterTag',
  '339': 'JSDocReturnTag',
  '34': 'EqualsEqualsToken',
  '340': 'JSDocThisTag',
  '341': 'JSDocTypeTag',
  '342': 'JSDocTemplateTag',
  '343': 'JSDocTypedefTag',
  '344': 'JSDocSeeTag',
  '345': 'JSDocPropertyTag',
  '346': 'SyntaxList',
  '347': 'NotEmittedStatement',
  '348': 'PartiallyEmittedExpression',
  '349': 'CommaListExpression',
  '35': 'ExclamationEqualsToken',
  '350': 'MergeDeclarationMarker',
  '351': 'EndOfDeclarationMarker',
  '352': 'SyntheticReferenceExpression',
  '353': 'Count',
  '36': 'EqualsEqualsEqualsToken',
  '37': 'ExclamationEqualsEqualsToken',
  '38': 'EqualsGreaterThanToken',
  '39': 'PlusToken',
  '4': 'NewLineTrivia',
  '40': 'MinusToken',
  '41': 'AsteriskToken',
  '42': 'AsteriskAsteriskToken',
  '43': 'SlashToken',
  '44': 'PercentToken',
  '45': 'PlusPlusToken',
  '46': 'MinusMinusToken',
  '47': 'LessThanLessThanToken',
  '48': 'GreaterThanGreaterThanToken',
  '49': 'GreaterThanGreaterThanGreaterThanToken',
  '5': 'WhitespaceTrivia',
  '50': 'AmpersandToken',
  '51': 'BarToken',
  '52': 'CaretToken',
  '53': 'ExclamationToken',
  '54': 'TildeToken',
  '55': 'AmpersandAmpersandToken',
  '56': 'BarBarToken',
  '57': 'QuestionToken',
  '58': 'ColonToken',
  '59': 'AtToken',
  '6': 'ShebangTrivia',
  '60': 'QuestionQuestionToken',
  '61': 'BacktickToken',
  '62': 'HashToken',
  '63': 'EqualsToken',
  '64': 'FirstCompoundAssignment',
  '65': 'MinusEqualsToken',
  '66': 'AsteriskEqualsToken',
  '67': 'AsteriskAsteriskEqualsToken',
  '68': 'SlashEqualsToken',
  '69': 'PercentEqualsToken',
  '7': 'ConflictMarkerTrivia',
  '70': 'LessThanLessThanEqualsToken',
  '71': 'GreaterThanGreaterThanEqualsToken',
  '72': 'GreaterThanGreaterThanGreaterThanEqualsToken',
  '73': 'AmpersandEqualsToken',
  '74': 'BarEqualsToken',
  '75': 'BarBarEqualsToken',
  '76': 'AmpersandAmpersandEqualsToken',
  '77': 'QuestionQuestionEqualsToken',
  '78': 'CaretEqualsToken',
  '79': 'Identifier',
  '8': 'FirstLiteralToken',
  '80': 'PrivateIdentifier',
  '81': 'BreakKeyword',
  '82': 'CaseKeyword',
  '83': 'CatchKeyword',
  '84': 'ClassKeyword',
  '85': 'ConstKeyword',
  '86': 'ContinueKeyword',
  '87': 'DebuggerKeyword',
  '88': 'DefaultKeyword',
  '89': 'DeleteKeyword',
  '9': 'BigIntLiteral',
  '90': 'DoKeyword',
  '91': 'ElseKeyword',
  '92': 'EnumKeyword',
  '93': 'ExportKeyword',
  '94': 'ExtendsKeyword',
  '95': 'FalseKeyword',
  '96': 'FinallyKeyword',
  '97': 'ForKeyword',
  '98': 'FunctionKeyword',
  '99': 'IfKeyword',
}

export const decodeNodeKind = (kind: ts.SyntaxKind) => {
  return KIND_TO_STRING[kind.toString()]
}
