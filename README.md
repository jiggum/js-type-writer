## Installation
```bash
$ yarn install
```

## Usage
#### Compile TS file to JS
```bash
$ yarn compile {input file path}
```
Example: `$ yarn compile input/quicksort.ts`

#### Generate type dictionary from JS file
```bash
$ yarn dict {input file path} {output file path}
```
Example
- `$ yarn dict input/quicksort.js output/data.json`
- `$ yarn dict input/quicksort.ts output/data.json`

