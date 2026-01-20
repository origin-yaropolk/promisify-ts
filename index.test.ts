import { assert, Equals } from 'tsafe';

import { Promisify } from './index';

function getFakeInstance<I>(): I {
    return undefined as unknown as I;
}

describe('Promisify tests', () => {
    describe('Basic interface test', () => {
        interface TestObject {
            id: number;
            getId(): number;
        }

        interface BasicInterface {
            getString(_: number): string;
            getPromise(_: string): Promise<number>;
            getDoublePromise(): Promise<Promise<Promise<TestObject>>>
        }

        type PromisifiedBasicInterface = Promisify<BasicInterface>;
        const instance = getFakeInstance<PromisifiedBasicInterface>();

        it('should transform base type to promise', () => {
            type Got = typeof instance.getString;
            type Expected = (_: number) => Promise<string>;

            assert<Equals<Got, Expected>>();
        })
    
        it('should left single promise untouched', () => {
            type Got = typeof instance.getPromise;
            type Expected = (_: string) => Promise<number>;

            assert<Equals<Got, Expected>>();
        })

        it('should decay nested promises', () => {
            type Got = typeof instance.getDoublePromise;
            type Expected = () => Promise<TestObject>;

            assert<Equals<Got, Expected>>();
        })
    })

    describe('Decay of properties test', () => {
        interface InterfaceWithProperties {
            id: number;
            getString(_: number): string;
        }

        it('should remove non methods by default', () => {
            type PromisifiedInterfaceWithoutProperties = Promisify<InterfaceWithProperties>;
            const instance = getFakeInstance<PromisifiedInterfaceWithoutProperties>();

            type Got = typeof instance.id;
            type Expected = never;

            assert<Equals<Got, Expected>>();
        })

        it('should left non methods when seconds parameter is "false"', () => {
            type PromisifiedInterfaceWithProperties = Promisify<InterfaceWithProperties, false>;
            const instance = getFakeInstance<PromisifiedInterfaceWithProperties>();

            type Got = typeof instance.id;
            type Expected = number;

            assert<Equals<Got, Expected>>();
        })
    })

    describe('Generic methods test', () => {
        interface GenericInterface<T> {
            as<R>(): R;
            asT(_: string): T;
            fromT(_: T): string;
        }

        type PromisifiedGenericInterface = Promisify<GenericInterface<number>>;
        const instance = getFakeInstance<PromisifiedGenericInterface>();

        it('should transform with free generic return type', () => {
            type Got = ReturnType<typeof instance.as<string>>;
            type Expected = Promise<string>;

            assert<Equals<Got, Expected>>();
        })

        it('should transform with generic return type', () => {
            type Got = typeof instance.asT;
            type Expected = (_: string) => Promise<number>;

            assert<Equals<Got, Expected>>();
        })

        it('should transform with generic parameter', () => {
            type Got = typeof instance.fromT;
            type Expected = (_: number) => Promise<string>;

            assert<Equals<Got, Expected>>();
        })
    })

    describe('Returted functions test', () => {
        interface InterfaceWithCallbacks {
            getCallback(): (_: number) => string;
            getAsyncCallback(): (_: string) => Promise<Promise<number>>;
        }

        type PromisifiedInterfaceWithCallbacks = Promisify<InterfaceWithCallbacks>;
        const instance = getFakeInstance<PromisifiedInterfaceWithCallbacks>();

        it('should transform common callback', () => {
            type Got = typeof instance.getCallback;
            type Expected = () => Promise<(_: number) => Promise<string>>

            assert<Equals<Got, Expected>>();
        })

        it('should transform async callback', () => {
            type Got = typeof instance.getAsyncCallback;
            type Expected = () => Promise<(_: string) => Promise<number>>

            assert<Equals<Got, Expected>>();
        })
    })
})
