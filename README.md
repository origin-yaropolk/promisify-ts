# promisify-ts
Compile-time functional type for convert common interfaces to it's promisified variant

> [!NOTE]
> This package transforms types in compile-time only, runtime logic and `tsc` output not affected

## when is this useful?
It is good tool for converting your sync API interfaces that is shared through async transport like Electron IPC

## install
`npm install promisify-ts`

## possibilities

### promisify methods
```ts
import { Promisify } from "promisify-ts";

interface MyInterface {
    transformToString(value: number): string;
    getPromise(): Promise<string>;
    getDoublePromise(): Promise<Promise<string>>
}

type PromisifiedInterface = Promisify<MyInterface>
```

`PromisifiedInterface` will be transformed as

```ts
type PromisifiedInterface = {
    transformToString(value: number): Promise<string>; // (number) => string -> (number) => Promise<string>
    getPromise(): Promise<string>;                     // () => Promise<string> -> () => Promise<string>
    getDoublePromise(): Promise<string>                // () => Promise<Promise<string>> -> () => Promise<string>
}
```

### optional decay properties
By default, everything except methods is removed, so

```ts
import { Promisify } from "promisify-ts";

interface MyInterface {
    readonly id: number;
    transformToString(value: number): string;
}

type PromisifiedInterface = Promisify<MyInterface>
```

will be transformed as

```ts
type PromisifiedInterface = {
    readonly id: never;                                // number -> never
    transformToString(value: number): Promise<string>; // (number) => string -> (number) => Promise<string>
}
```

but `Promisify` has second optional boolean parameter `RemoveProperties`, `true` by default that tells function remove or not properties

```ts
type PromisifiedInterface = Promisify<MyInterface, false>
```

makes

```ts
type PromisifiedInterface = {
    readonly id: number;                               // number -> number
    transformToString(value: number): Promise<string>; // (number) => string -> (number) => Promise<string>
}
```

This may be useful if further conversions of the interface type are expected.

### works good with generic methods
```ts
import { Promisify } from "promisify-ts";

interface MyInterface<U> {
    as<R>(): R;
    transformStringToU(value: string): U;
    transformUToString(value: U): string;
}

type PromisifiedInterface = Promisify<MyInterface<number>>
```

will tranform into

```ts
type PromisifiedInterface = {
    as<R>(): R;                                         // <R>() => R -> <R>() => Promise<R>
    transformStringToU(value: string): Promise<number>; // (string) => number -> (string) => Promise<number>
    transformUToString(value: number): Promise<string>; // (number) => string -> (number) => Promise<string>
}
```

### also promisifies returned functions
```ts
import { Promisify } from "promisify-ts";

interface MyInterface {
    getCallback(): () => string;
}

type PromisifiedInterface = Promisify<MyInterface>
```

makes

```ts
type PromisifiedInterface = {
    getCallback(): Promise<() => Promise<string>>; // () => () => string -> () => Promise<() => Promise<string>>
}
```

## thanks
Special thanks for [@Nipheris](https://github.com/Nipheris) and [@HardParadox](https://github.com/HardParadox) who once helped in this brainstorming
