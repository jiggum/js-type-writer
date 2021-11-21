## Installation
```bash
$ yarn install
```

## Usage
#### Compile TS file to JS
```bash
$ yarn toJS {input file path}
```
Example: `$ yarn toJS input/quicksort.ts`

#### Generate type dictionary from JS file
```bash
$ yarn genDict {input file path} {output file path}
```
Example: `$ yarn genDict input/quicksort.ts output/data.json`

