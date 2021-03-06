"use strict";
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLInstrumentation = void 0;
const api_1 = require("@opentelemetry/api");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const enum_1 = require("./enum");
const symbols_1 = require("./symbols");
const types_1 = require("./types");
const utils_1 = require("./utils");
const version_1 = require("./version");
const DEFAULT_CONFIG = {
    mergeItems: false,
    depth: -1,
    allowValues: false,
};
const supportedVersions = ['>=14'];
class GraphQLInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
        super('@opentelemetry/instrumentation-graphql', version_1.VERSION, Object.assign({}, DEFAULT_CONFIG, config));
    }
    _getConfig() {
        return this._config;
    }
    setConfig(config = {}) {
        this._config = Object.assign({}, DEFAULT_CONFIG, config);
    }
    init() {
        const module = new instrumentation_1.InstrumentationNodeModuleDefinition('graphql', supportedVersions);
        module.files.push(this._addPatchingExecute());
        module.files.push(this._addPatchingParser());
        module.files.push(this._addPatchingValidate());
        return module;
    }
    _addPatchingExecute() {
        return new instrumentation_1.InstrumentationNodeModuleFile('graphql/execution/execute.js', supportedVersions, 
        // cannot make it work with appropriate type as execute function has 2
        //types and/cannot import function but only types
        (moduleExports) => {
            if (instrumentation_1.isWrapped(moduleExports.execute)) {
                this._unwrap(moduleExports, 'execute');
            }
            this._wrap(moduleExports, 'execute', this._patchExecute(moduleExports.defaultFieldResolver));
            return moduleExports;
        }, moduleExports => {
            if (moduleExports) {
                this._unwrap(moduleExports, 'execute');
            }
        });
    }
    _addPatchingParser() {
        return new instrumentation_1.InstrumentationNodeModuleFile('graphql/language/parser.js', supportedVersions, moduleExports => {
            if (instrumentation_1.isWrapped(moduleExports.execute)) {
                this._unwrap(moduleExports, 'parse');
            }
            this._wrap(moduleExports, 'parse', this._patchParse());
            return moduleExports;
        }, moduleExports => {
            if (moduleExports) {
                this._unwrap(moduleExports, 'parse');
            }
        });
    }
    _addPatchingValidate() {
        return new instrumentation_1.InstrumentationNodeModuleFile('graphql/validation/validate.js', supportedVersions, moduleExports => {
            if (instrumentation_1.isWrapped(moduleExports.execute)) {
                this._unwrap(moduleExports, 'validate');
            }
            this._wrap(moduleExports, 'validate', this._patchValidate());
            return moduleExports;
        }, moduleExports => {
            if (moduleExports) {
                this._unwrap(moduleExports, 'validate');
            }
        });
    }
    _patchExecute(defaultFieldResolved) {
        const instrumentation = this;
        return function execute(original) {
            return function patchExecute() {
                let processedArgs;
                // case when apollo server is used for example
                if (arguments.length >= 2) {
                    const args = arguments;
                    processedArgs = instrumentation._wrapExecuteArgs(args[0], args[1], args[2], args[3], args[4], args[5], args[6] || defaultFieldResolved, args[7]);
                }
                else {
                    const args = arguments[0];
                    processedArgs = instrumentation._wrapExecuteArgs(args.schema, args.document, args.rootValue, args.contextValue, args.variableValues, args.operationName, args.fieldResolver || defaultFieldResolved, args.typeResolver);
                }
                const operation = utils_1.getOperation(processedArgs.document, processedArgs.operationName);
                const span = instrumentation._createExecuteSpan(operation, processedArgs);
                processedArgs.contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] = {
                    source: processedArgs.document
                        ? processedArgs.document ||
                            processedArgs.document[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL]
                        : undefined,
                    span,
                    fields: {},
                };
                return api_1.context.with(api_1.setSpan(api_1.context.active(), span), () => {
                    return utils_1.safeExecuteInTheMiddleAsync(() => {
                        return original.apply(this, [
                            processedArgs,
                        ]);
                    }, err => {
                        utils_1.endSpan(span, err);
                    });
                });
            };
        };
    }
    _patchParse() {
        const instrumentation = this;
        return function parse(original) {
            return function patchParse(source, options) {
                return instrumentation._parse(this, original, source, options);
            };
        };
    }
    _patchValidate() {
        const instrumentation = this;
        return function validate(original) {
            return function patchValidate(schema, documentAST, rules, typeInfo, options) {
                return instrumentation._validate(this, original, schema, documentAST, rules, typeInfo, options);
            };
        };
    }
    _parse(obj, original, source, options) {
        const config = this._getConfig();
        const span = this.tracer.startSpan(enum_1.SpanNames.PARSE);
        return api_1.context.with(api_1.setSpan(api_1.context.active(), span), () => {
            return instrumentation_1.safeExecuteInTheMiddle(() => {
                return original.call(obj, source, options);
            }, (err, result) => {
                if (result) {
                    const operation = utils_1.getOperation(result);
                    if (!operation) {
                        span.updateName(enum_1.SpanNames.SCHEMA_PARSE);
                    }
                    else if (result.loc) {
                        utils_1.addSpanSource(span, result.loc, config.allowValues);
                    }
                }
                utils_1.endSpan(span, err);
            });
        });
    }
    _validate(obj, original, schema, documentAST, rules, typeInfo, options) {
        const span = this.tracer.startSpan(enum_1.SpanNames.VALIDATE, {});
        return api_1.context.with(api_1.setSpan(api_1.context.active(), span), () => {
            return instrumentation_1.safeExecuteInTheMiddle(() => {
                return original.call(obj, schema, documentAST, rules, typeInfo, options);
            }, (err, errors) => {
                if (!documentAST.loc) {
                    span.updateName(enum_1.SpanNames.SCHEMA_VALIDATE);
                }
                if (errors && errors.length) {
                    span.recordException({
                        name: enum_1.SpanAttributes.ERROR_VALIDATION_NAME,
                        message: JSON.stringify(errors),
                    });
                }
                utils_1.endSpan(span, err);
            });
        });
    }
    _createExecuteSpan(operation, processedArgs) {
        var _a;
        const config = this._getConfig();
        const span = this.tracer.startSpan(enum_1.SpanNames.EXECUTE, {});
        if (operation) {
            const name = operation
                .operation;
            if (name) {
                span.setAttribute(enum_1.SpanAttributes.OPERATION, name);
            }
        }
        else {
            let operationName = ' ';
            if (processedArgs.operationName) {
                operationName = ` "${processedArgs.operationName}" `;
            }
            operationName = types_1.OPERATION_NOT_SUPPORTED.replace('$operationName$', operationName);
            span.setAttribute(enum_1.SpanAttributes.OPERATION, operationName);
        }
        if ((_a = processedArgs.document) === null || _a === void 0 ? void 0 : _a.loc) {
            utils_1.addSpanSource(span, processedArgs.document.loc, config.allowValues);
        }
        if (processedArgs.variableValues && config.allowValues) {
            Object.entries(processedArgs.variableValues).forEach(([key, value]) => {
                span.setAttribute(`${enum_1.SpanAttributes.VARIABLES}${String(key)}`, value);
            });
        }
        return span;
    }
    _wrapExecuteArgs(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver) {
        if (!contextValue) {
            contextValue = {};
        }
        if (contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL]) {
            return {
                schema,
                document,
                rootValue,
                contextValue,
                variableValues,
                operationName,
                fieldResolver,
                typeResolver,
            };
        }
        fieldResolver = utils_1.wrapFieldResolver(this.tracer, this._getConfig.bind(this), fieldResolver);
        if (schema) {
            utils_1.wrapFields(schema.getQueryType(), this.tracer, this._getConfig.bind(this));
            utils_1.wrapFields(schema.getMutationType(), this.tracer, this._getConfig.bind(this));
        }
        return {
            schema,
            document,
            rootValue,
            contextValue,
            variableValues,
            operationName,
            fieldResolver,
            typeResolver,
        };
    }
}
exports.GraphQLInstrumentation = GraphQLInstrumentation;
//# sourceMappingURL=graphql.js.map