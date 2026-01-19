// @ts-nocheck
type Method<P extends unknown[], R extends unknown = unknown> = (...args: P) => R;
type PromisifyedMethod<P extends unknown[], R extends unknown = unknown> = Method<P, Promise<R>>;

type DecayPromiseAndMethod<R> =
	R extends Promise<infer T> ? DecayPromiseAndMethod<T> :
	R extends Method<infer P>  ? PromisifyMethod<R> :
	R;

type PromisifyMethod<M> =
	M extends <R>(...args: infer P) => Promise<R> ? <R>(...args: P) => Promise<DecayPromiseAndMethod<R>> :
	M extends <R>(...args: infer P) => R          ? <R>(...args: P) => Promise<DecayPromiseAndMethod<R>> :
	M extends Method<infer P, infer R>            ? PromisifyedMethod<P, DecayPromiseAndMethod<R>> :
	never;

export type Promisify<T, RemoveProperties = true> = {
	[K in keyof T]:
		T[K] extends Method<infer P> ? PromisifyMethod<T[K]> :
		RemoveProperties extends false ? T[K] : never;
};
