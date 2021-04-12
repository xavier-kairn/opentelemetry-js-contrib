import type * as graphqlTypes from 'graphql';
import * as api from '@opentelemetry/api';
import { GraphQLObjectType } from 'graphql/type/definition';
import { GraphQLInstrumentationConfig, GraphQLInstrumentationParsedConfig, OtelPatched, Maybe } from './types';
import { PromiseOrValue } from 'graphql/jsutils/PromiseOrValue';
export declare function addSpanSource(span: api.Span, loc: graphqlTypes.Location, allowValues?: boolean, start?: number, end?: number): void;
export declare function endSpan(span: api.Span, error?: Error): void;
export declare function getOperation(document: graphqlTypes.DocumentNode, operationName?: Maybe<string>): graphqlTypes.DefinitionNode | undefined;
export declare function getSourceFromLocation(loc: graphqlTypes.Location, allowValues?: boolean, start?: number, end?: number): string;
export declare function wrapFields(type: Maybe<GraphQLObjectType & OtelPatched>, tracer: api.Tracer, getConfig: () => GraphQLInstrumentationParsedConfig): void;
export declare function wrapFieldResolver<TSource = any, TContext = any, TArgs = any>(tracer: api.Tracer, getConfig: () => Required<GraphQLInstrumentationConfig>, fieldResolver: Maybe<graphqlTypes.GraphQLFieldResolver<TSource, TContext, TArgs> & OtelPatched>): graphqlTypes.GraphQLFieldResolver<TSource, TContext, TArgs> & OtelPatched;
/**
 * Async version of safeExecuteInTheMiddle from instrumentation package
 * can be removed once this will be added to instrumentation package
 * @param execute
 * @param onFinish
 * @param preventThrowingError
 */
export declare function safeExecuteInTheMiddleAsync<T>(execute: () => PromiseOrValue<T>, onFinish: (e: Error | undefined, result: T | undefined) => void, preventThrowingError?: boolean): PromiseOrValue<T>;
//# sourceMappingURL=utils.d.ts.map