# OxMySQL exports wrapper for FiveM

Types are fully supported and you will get intellisense on the `oxmysql` object when using it.

## Installation

```yaml
# With pnpm
pnpm add @overextended/oxmysql

# With Yarn
yarn add @overextended/oxmysql

# With npm
npm install @overextended/oxmysql
```

## Usage

Import as module:

```js
import { oxmysql } from '@overextended/oxmysql';
```

Import with require:

```js
const { oxmysql } = require('@overextended/oxmysql');
```

## Documentation

[View documentation](https://overextended.github.io/docs/oxmysql)

```js
oxmysql.scalar('SELECT username FROM users', (result) => {
    console.log(result)
}).catch(console.error)

oxmysql.scalar('SELECT username FROM users').then((result) => {
    console.log(result)
}).catch(console.error)

const result = await oxmysql.scalar('SELECT username FROM users').catch(console.error)
console.log(result)
```

## License

LGPL-3.0
