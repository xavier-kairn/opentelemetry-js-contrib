import { InstrumentationConfig } from '@opentelemetry/instrumentation';
import type * as graphqlTypes from 'graphql';
import type * as api from '@opentelemetry/api';
import type { PromiseOrValue } from 'graphql/jsutils/PromiseOrValue';
import { DocumentNode } from 'graphql/language/ast';
import { GraphQLFieldResolver, GraphQLTypeResolver } from 'graphql/type/definition';
import { GraphQLSchema } from 'graphql/type/schema';
import { OTEL_GRAPHQL_DATA_SYMBOL, OTEL_PATCHED_SYMBOL } from './symbols';
export declare const OPERATION_NOT_SUPPORTED: string;
export interface GraphQLInstrumentationConfig extends InstrumentationConfig {
    /**
     * When set to true it will not remove attributes values from schema source.
     * By default all values that can be sensitive are removed and replaced
     * with "*"
     *
     * @default false
     */
    allowValues?: boolean;
    /**
     * The maximum depth of fields/resolvers to instrument.
     * When set to 0 it will not instrument fields and resolvers
     *
     * @default undefined
     */
    depth?: number;
    /**
     * Whether to merge list items into a single element.
     *
     * @example `users.*.name` instead of `users.0.name`, `users.1.name`
     *
     * @default false
     */
    mergeItems?: boolean;
}
/**
 * Merged and parsed config of default instrumentation config and GraphQL
 */
export declare type GraphQLInstrumentationParsedConfig = Required<GraphQLInstrumentationConfig> & InstrumentationConfig;
export declare type executeFunctionWithObj = (args: graphqlTypes.ExecutionArgs) => PromiseOrValue<graphqlTypes.ExecutionResult>;
export declare type executeArgumentsArray = [
    graphqlTypes.GraphQLSchema,
    graphqlTypes.DocumentNode,
    any,
    any,
    Maybe<{
        [key: string]: any;
    }>,
    Maybe<string>,
    Maybe<graphqlTypes.GraphQLFieldResolver<any, any>>,
    Maybe<graphqlTypes.GraphQLTypeResolver<any, any>>
];
export declare type executeFunctionWithArgs = (schema: graphqlTypes.GraphQLSchema, document: graphqlTypes.DocumentNode, rootValue?: any, contextValue?: any, variableValues?: Maybe<{
    [key: string]: any;
}>, operationName?: Maybe<string>, fieldResolver?: Maybe<graphqlTypes.GraphQLFieldResolver<any, any>>, typeResolver?: Maybe<graphqlTypes.GraphQLTypeResolver<any, any>>) => PromiseOrValue<graphqlTypes.ExecutionResult>;
export interface OtelExecutionArgs {
    schema: GraphQLSchema;
    document: DocumentNode & ObjectWithGraphQLData;
    rootValue?: any;
    contextValue?: any & ObjectWithGraphQLData;
    variableValues?: Maybe<{
        [key: string]: any;
    }>;
    operationName?: Maybe<string>;
    fieldResolver?: Maybe<GraphQLFieldResolver<any, any> & OtelPatched>;
    typeResolver?: Maybe<GraphQLTypeResolver<any, any>>;
}
export declare type executeType = executeFunctionWithObj | executeFunctionWithArgs;
export declare type parseType = (source: string | graphqlTypes.Source, options?: graphqlTypes.ParseOptions) => graphqlTypes.DocumentNode;
export declare type validateType = (schema: graphqlTypes.GraphQLSchema, documentAST: graphqlTypes.DocumentNode, rules?: ReadonlyArray<graphqlTypes.ValidationRule>, typeInfo?: graphqlTypes.TypeInfo, options?: {
    maxErrors?: number;
}) => ReadonlyArray<graphqlTypes.GraphQLError>;
export interface GraphQLField {
    parent: api.Span;
    span: api.Span;
    error: Error | null;
}
interface OtelGraphQLData {
    source?: any;
    span: api.Span;
    fields: {
        [key: string]: GraphQLField;
    };
}
export interface ObjectWithGraphQLData {
    [OTEL_GRAPHQL_DATA_SYMBOL]?: OtelGraphQLData;
}
export interface OtelPatched {
    [OTEL_PATCHED_SYMBOL]?: boolean;
}
export interface GraphQLPath {
    prev: GraphQLPath | undefined;
    key: string | number;
    /**
     * optional as it didn't exist yet in ver 14
     */
    typename?: string | undefined;
}
/**
 * Moving this type from ver 15 of graphql as it is nto available in ver. 14s
 * this way it can compile against ver 14.
 */
export declare type Maybe<T> = null | undefined | T;
export {};
//# sourceMappingURL=types.d.ts.map