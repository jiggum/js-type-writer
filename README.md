## Installation
```bash
$ yarn install
```

## Usage
#### Compile TS file to JS
```bash
$ yarn compile {input .ts file path}
```
Example: `$ yarn compile input/quicksort.ts`

#### Generate type storage from JS/TS file
```bash
$ yarn dict {input .js/.ts file path} {output .json storage path}
```
Example
- `$ yarn dict input/quicksort.js output/data.json`

#### Replace types
```bash
$ yarn replace {input .json storage path} {input .js/.ts file path} {output .ts file path}
```
Example
- `$ yarn replace output/data.json input/quicksort.js output/quicksort.ts`

