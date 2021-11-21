# JS Type Writer
Heuristic type inference for JS

## Install
```bash
$ yarn install
```

## Usage
### Compile TS file to JS
`yarn compile {input .ts file path}`
```bash
$ yarn compile input/quicksort.ts
```

### Generate type storage from JS/TS file
`yarn dict {input .js/.ts file path} {output .json storage path}`
```bash
$ yarn dict input/quicksort.js output/data.json
```

### Replace types
`yarn replace {input .json storage path} {input .js/.ts file path} {output .ts file path}`
```bash
$ yarn replace output/data.json input/quicksort.js output/quicksort.ts
```

### Check type
`yarn diagnose {input .js/.ts file path} {input .json storage path}`
```bash
$ yarn diagnose input/quicksort.js output/data.json
```
