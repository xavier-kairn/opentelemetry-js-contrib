import { InstrumentationBase, InstrumentationConfig, InstrumentationNodeModuleDefinition } from '@opentelemetry/instrumentation';
import type * as graphqlTypes from 'graphql';
import { GraphQLInstrumentationConfig } from './types';
export declare class GraphQLInstrumentation extends InstrumentationBase {
    constructor(config?: GraphQLInstrumentationConfig & InstrumentationConfig);
    private _getConfig;
    setConfig(config?: GraphQLInstrumentationConfig & InstrumentationConfig): void;
    protected init(): InstrumentationNodeModuleDefinition<typeof graphqlTypes>;
    private _addPatchingExecute;
    private _addPatchingParser;
    private _addPatchingValidate;
    private _patchExecute;
    private _patchParse;
    private _patchValidate;
    private _parse;
    private _validate;
    private _createExecuteSpan;
    private _wrapExecuteArgs;
}
//# sourceMappingURL=graphql.d.ts.map