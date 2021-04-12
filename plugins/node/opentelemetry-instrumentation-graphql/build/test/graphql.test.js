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
const tracing_1 = require("@opentelemetry/tracing");
const assert = require("assert");
const src_1 = require("../src");
const enum_1 = require("../src/enum");
const helper_1 = require("./helper");
const defaultConfig = {};
const graphQLInstrumentation = new src_1.GraphQLInstrumentation(defaultConfig);
graphQLInstrumentation.enable();
graphQLInstrumentation.disable();
// now graphql can be required
const schema_1 = require("./schema");
const graphql_1 = require("graphql");
// Construct a schema, using GraphQL schema language
const schema = schema_1.buildSchema();
const sourceList1 = `
  query {
    books {
      name
    }
  }
`;
const sourceBookById = `
  query {
    book(id: 0) {
      name
    }
  }
`;
const sourceAddBook = `
  mutation {
    addBook(
      name: "Fifth Book"
      authorIds: "0,2"
    ) {
      id
    }
  }
`;
const sourceFindUsingVariable = `
  query Query1 ($id: Int!) {
    book(id: $id) {
      name
    }
  }
`;
const badQuery = `
  query foo bar
`;
const queryInvalid = `
  query {
    book(id: "a") {
      name
    }
  }
`;
const exporter = new tracing_1.InMemorySpanExporter();
const provider = new tracing_1.BasicTracerProvider();
provider.addSpanProcessor(new tracing_1.SimpleSpanProcessor(exporter));
graphQLInstrumentation.setTracerProvider(provider);
describe('graphql', () => {
    function create(config = {}) {
        graphQLInstrumentation.setConfig(config);
        graphQLInstrumentation.enable();
    }
    describe('when depth is not set', () => {
        describe('AND source is query to get a list of books', () => {
            let spans;
            beforeEach(async () => {
                create({});
                await graphql_1.graphql(schema, sourceList1);
                spans = exporter.getFinishedSpans();
            });
            afterEach(() => {
                exporter.reset();
                graphQLInstrumentation.disable();
                spans = [];
            });
            it('should have 7 spans', () => {
                assert.deepStrictEqual(spans.length, 7);
            });
            it('should instrument parse', () => {
                const parseSpan = spans[0];
                assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query {\n' +
                    '    books {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
            });
            it('should instrument validate', () => {
                const validateSpan = spans[1];
                assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
                assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
            });
            it('should instrument execute', () => {
                const executeSpan = spans[2];
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query {\n' +
                    '    books {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.OPERATION], 'query');
                assert.deepStrictEqual(executeSpan.name, enum_1.SpanNames.EXECUTE);
                assert.deepStrictEqual(executeSpan.parentSpanId, undefined);
            });
            it('should instrument resolvers', () => {
                const executeSpan = spans[2];
                const resolveParentSpan = spans[3];
                const span1 = spans[4];
                const span2 = spans[5];
                const span3 = spans[6];
                helper_1.assertResolveSpan(resolveParentSpan, 'books', 'books', '[Book]', 'books {\n' + '      name\n' + '    }', executeSpan.spanContext.spanId);
                const parentId = resolveParentSpan.spanContext.spanId;
                helper_1.assertResolveSpan(span1, 'name', 'books.0.name', 'String', 'name', parentId);
                helper_1.assertResolveSpan(span2, 'name', 'books.1.name', 'String', 'name', parentId);
                helper_1.assertResolveSpan(span3, 'name', 'books.2.name', 'String', 'name', parentId);
            });
        });
        describe('AND source is query with param', () => {
            let spans;
            beforeEach(async () => {
                create({});
                await graphql_1.graphql(schema, sourceBookById);
                spans = exporter.getFinishedSpans();
            });
            afterEach(() => {
                exporter.reset();
                graphQLInstrumentation.disable();
                spans = [];
            });
            it('should have 5 spans', () => {
                assert.deepStrictEqual(spans.length, 5);
            });
            it('should instrument parse', () => {
                const parseSpan = spans[0];
                assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query {\n' +
                    '    book(id: *) {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
            });
            it('should instrument validate', () => {
                const validateSpan = spans[1];
                assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
                assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
            });
            it('should instrument execute', () => {
                const executeSpan = spans[2];
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query {\n' +
                    '    book(id: *) {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.OPERATION], 'query');
                assert.deepStrictEqual(executeSpan.name, enum_1.SpanNames.EXECUTE);
                assert.deepStrictEqual(executeSpan.parentSpanId, undefined);
            });
            it('should instrument resolvers', () => {
                const executeSpan = spans[2];
                const resolveParentSpan = spans[3];
                const span1 = spans[4];
                helper_1.assertResolveSpan(resolveParentSpan, 'book', 'book', 'Book', 'book(id: *) {\n' + '      name\n' + '    }', executeSpan.spanContext.spanId);
                const parentId = resolveParentSpan.spanContext.spanId;
                helper_1.assertResolveSpan(span1, 'name', 'book.name', 'String', 'name', parentId);
            });
        });
        describe('AND source is query with param and variables', () => {
            let spans;
            beforeEach(async () => {
                create({});
                await graphql_1.graphql(schema, sourceFindUsingVariable, null, null, {
                    id: 2,
                });
                spans = exporter.getFinishedSpans();
            });
            afterEach(() => {
                exporter.reset();
                graphQLInstrumentation.disable();
                spans = [];
            });
            it('should have 5 spans', () => {
                assert.deepStrictEqual(spans.length, 5);
            });
            it('should instrument parse', () => {
                const parseSpan = spans[0];
                assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query Query1 ($id: Int!) {\n' +
                    '    book(id: $id) {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
            });
            it('should instrument validate', () => {
                const validateSpan = spans[1];
                assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
                assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
            });
            it('should instrument execute', () => {
                const executeSpan = spans[2];
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query Query1 ($id: Int!) {\n' +
                    '    book(id: $id) {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.OPERATION], 'query');
                assert.deepStrictEqual(executeSpan.attributes[`${enum_1.SpanAttributes.VARIABLES}id`], undefined);
                assert.deepStrictEqual(executeSpan.name, enum_1.SpanNames.EXECUTE);
                assert.deepStrictEqual(executeSpan.parentSpanId, undefined);
            });
            it('should instrument resolvers', () => {
                const executeSpan = spans[2];
                const resolveParentSpan = spans[3];
                const span1 = spans[4];
                helper_1.assertResolveSpan(resolveParentSpan, 'book', 'book', 'Book', 'book(id: $id) {\n' + '      name\n' + '    }', executeSpan.spanContext.spanId);
                const parentId = resolveParentSpan.spanContext.spanId;
                helper_1.assertResolveSpan(span1, 'name', 'book.name', 'String', 'name', parentId);
            });
        });
    });
    describe('when depth is set to 0', () => {
        describe('AND source is query to get a list of books', () => {
            let spans;
            beforeEach(async () => {
                create({
                    depth: 0,
                });
                await graphql_1.graphql(schema, sourceList1);
                spans = exporter.getFinishedSpans();
            });
            afterEach(() => {
                exporter.reset();
                graphQLInstrumentation.disable();
                spans = [];
            });
            it('should have 3 spans', () => {
                assert.deepStrictEqual(spans.length, 3);
            });
            it('should instrument parse', () => {
                const parseSpan = spans[0];
                assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query {\n' +
                    '    books {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
            });
            it('should instrument validate', () => {
                const validateSpan = spans[1];
                assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
                assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
            });
            it('should instrument execute', () => {
                const executeSpan = spans[2];
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query {\n' +
                    '    books {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.OPERATION], 'query');
                assert.deepStrictEqual(executeSpan.name, enum_1.SpanNames.EXECUTE);
                assert.deepStrictEqual(executeSpan.parentSpanId, undefined);
            });
        });
    });
    describe('when mergeItems is set to true', () => {
        describe('AND source is query to get a list of books', () => {
            let spans;
            beforeEach(async () => {
                create({
                    mergeItems: true,
                });
                await graphql_1.graphql(schema, sourceList1);
                spans = exporter.getFinishedSpans();
            });
            afterEach(() => {
                exporter.reset();
                graphQLInstrumentation.disable();
                spans = [];
            });
            it('should have 5 spans', () => {
                assert.deepStrictEqual(spans.length, 5);
            });
            it('should instrument parse', () => {
                const parseSpan = spans[0];
                assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query {\n' +
                    '    books {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
            });
            it('should instrument validate', () => {
                const validateSpan = spans[1];
                assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
                assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
            });
            it('should instrument execute', () => {
                const executeSpan = spans[2];
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query {\n' +
                    '    books {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.OPERATION], 'query');
                assert.deepStrictEqual(executeSpan.name, enum_1.SpanNames.EXECUTE);
                assert.deepStrictEqual(executeSpan.parentSpanId, undefined);
            });
        });
        describe('AND depth is set to 0', () => {
            let spans;
            beforeEach(async () => {
                create({
                    mergeItems: true,
                    depth: 0,
                });
                await graphql_1.graphql(schema, sourceList1);
                spans = exporter.getFinishedSpans();
            });
            afterEach(() => {
                exporter.reset();
                graphQLInstrumentation.disable();
                spans = [];
            });
            it('should have 3 spans', () => {
                assert.deepStrictEqual(spans.length, 3);
            });
        });
    });
    describe('when allowValues is set to true', () => {
        describe('AND source is query with param', () => {
            let spans;
            beforeEach(async () => {
                create({
                    allowValues: true,
                });
                await graphql_1.graphql(schema, sourceBookById);
                spans = exporter.getFinishedSpans();
            });
            afterEach(() => {
                exporter.reset();
                graphQLInstrumentation.disable();
                spans = [];
            });
            it('should have 5 spans', () => {
                assert.deepStrictEqual(spans.length, 5);
            });
            it('should instrument parse', () => {
                const parseSpan = spans[0];
                assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query {\n' +
                    '    book(id: 0) {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
            });
            it('should instrument validate', () => {
                const validateSpan = spans[1];
                assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
                assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
            });
            it('should instrument execute', () => {
                const executeSpan = spans[2];
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query {\n' +
                    '    book(id: 0) {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.OPERATION], 'query');
                assert.deepStrictEqual(executeSpan.name, enum_1.SpanNames.EXECUTE);
                assert.deepStrictEqual(executeSpan.parentSpanId, undefined);
            });
            it('should instrument resolvers', () => {
                const executeSpan = spans[2];
                const resolveParentSpan = spans[3];
                const span1 = spans[4];
                helper_1.assertResolveSpan(resolveParentSpan, 'book', 'book', 'Book', 'book(id: 0) {\n' + '      name\n' + '    }', executeSpan.spanContext.spanId);
                const parentId = resolveParentSpan.spanContext.spanId;
                helper_1.assertResolveSpan(span1, 'name', 'book.name', 'String', 'name', parentId);
            });
        });
        describe('AND mutation is called', () => {
            let spans;
            beforeEach(async () => {
                create({
                    allowValues: true,
                });
                await graphql_1.graphql(schema, sourceAddBook);
                spans = exporter.getFinishedSpans();
            });
            afterEach(() => {
                exporter.reset();
                graphQLInstrumentation.disable();
                spans = [];
            });
            it('should have 5 spans', () => {
                assert.deepStrictEqual(spans.length, 5);
            });
            it('should instrument parse', () => {
                const parseSpan = spans[0];
                assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  mutation {\n' +
                    '    addBook(\n' +
                    '      name: "Fifth Book"\n' +
                    '      authorIds: "0,2"\n' +
                    '    ) {\n' +
                    '      id\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
            });
            it('should instrument validate', () => {
                const validateSpan = spans[1];
                assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
                assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
            });
            it('should instrument execute', () => {
                const executeSpan = spans[2];
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  mutation {\n' +
                    '    addBook(\n' +
                    '      name: "Fifth Book"\n' +
                    '      authorIds: "0,2"\n' +
                    '    ) {\n' +
                    '      id\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.OPERATION], 'mutation');
                assert.deepStrictEqual(executeSpan.name, enum_1.SpanNames.EXECUTE);
                assert.deepStrictEqual(executeSpan.parentSpanId, undefined);
            });
            it('should instrument resolvers', () => {
                const executeSpan = spans[2];
                const resolveParentSpan = spans[3];
                const span1 = spans[4];
                helper_1.assertResolveSpan(resolveParentSpan, 'addBook', 'addBook', 'Book', 'addBook(\n' +
                    '      name: "Fifth Book"\n' +
                    '      authorIds: "0,2"\n' +
                    '    ) {\n' +
                    '      id\n' +
                    '    }', executeSpan.spanContext.spanId);
                const parentId = resolveParentSpan.spanContext.spanId;
                helper_1.assertResolveSpan(span1, 'id', 'addBook.id', 'Int', 'id', parentId);
            });
        });
        describe('AND source is query with param and variables', () => {
            let spans;
            beforeEach(async () => {
                create({
                    allowValues: true,
                });
                await graphql_1.graphql(schema, sourceFindUsingVariable, null, null, {
                    id: 2,
                });
                spans = exporter.getFinishedSpans();
            });
            afterEach(() => {
                exporter.reset();
                graphQLInstrumentation.disable();
                spans = [];
            });
            it('should have 5 spans', () => {
                assert.deepStrictEqual(spans.length, 5);
            });
            it('should instrument parse', () => {
                const parseSpan = spans[0];
                assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query Query1 ($id: Int!) {\n' +
                    '    book(id: $id) {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
            });
            it('should instrument validate', () => {
                const validateSpan = spans[1];
                assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
                assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
            });
            it('should instrument execute', () => {
                const executeSpan = spans[2];
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                    '  query Query1 ($id: Int!) {\n' +
                    '    book(id: $id) {\n' +
                    '      name\n' +
                    '    }\n' +
                    '  }\n');
                assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.OPERATION], 'query');
                assert.deepStrictEqual(executeSpan.attributes[`${enum_1.SpanAttributes.VARIABLES}id`], 2);
                assert.deepStrictEqual(executeSpan.name, enum_1.SpanNames.EXECUTE);
                assert.deepStrictEqual(executeSpan.parentSpanId, undefined);
            });
            it('should instrument resolvers', () => {
                const executeSpan = spans[2];
                const resolveParentSpan = spans[3];
                const span1 = spans[4];
                helper_1.assertResolveSpan(resolveParentSpan, 'book', 'book', 'Book', 'book(id: $id) {\n' + '      name\n' + '    }', executeSpan.spanContext.spanId);
                const parentId = resolveParentSpan.spanContext.spanId;
                helper_1.assertResolveSpan(span1, 'name', 'book.name', 'String', 'name', parentId);
            });
        });
    });
    describe('when mutation is called', () => {
        let spans;
        beforeEach(async () => {
            create({
            // allowValues: true
            });
            await graphql_1.graphql(schema, sourceAddBook);
            spans = exporter.getFinishedSpans();
        });
        afterEach(() => {
            exporter.reset();
            graphQLInstrumentation.disable();
            spans = [];
        });
        it('should have 5 spans', () => {
            assert.deepStrictEqual(spans.length, 5);
        });
        it('should instrument parse', () => {
            const parseSpan = spans[0];
            assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                '  mutation {\n' +
                '    addBook(\n' +
                '      name: "*"\n' +
                '      authorIds: "*"\n' +
                '    ) {\n' +
                '      id\n' +
                '    }\n' +
                '  }\n');
            assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
        });
        it('should instrument validate', () => {
            const validateSpan = spans[1];
            assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
            assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
        });
        it('should instrument execute', () => {
            const executeSpan = spans[2];
            assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                '  mutation {\n' +
                '    addBook(\n' +
                '      name: "*"\n' +
                '      authorIds: "*"\n' +
                '    ) {\n' +
                '      id\n' +
                '    }\n' +
                '  }\n');
            assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.OPERATION], 'mutation');
            assert.deepStrictEqual(executeSpan.name, enum_1.SpanNames.EXECUTE);
            assert.deepStrictEqual(executeSpan.parentSpanId, undefined);
        });
        it('should instrument resolvers', () => {
            const executeSpan = spans[2];
            const resolveParentSpan = spans[3];
            const span1 = spans[4];
            helper_1.assertResolveSpan(resolveParentSpan, 'addBook', 'addBook', 'Book', 'addBook(\n' +
                '      name: "*"\n' +
                '      authorIds: "*"\n' +
                '    ) {\n' +
                '      id\n' +
                '    }', executeSpan.spanContext.spanId);
            const parentId = resolveParentSpan.spanContext.spanId;
            helper_1.assertResolveSpan(span1, 'id', 'addBook.id', 'Int', 'id', parentId);
        });
    });
    describe('when query is not correct', () => {
        let spans;
        beforeEach(async () => {
            create({});
            await graphql_1.graphql(schema, badQuery);
            spans = exporter.getFinishedSpans();
        });
        afterEach(() => {
            exporter.reset();
            graphQLInstrumentation.disable();
            spans = [];
        });
        it('should have 1 span', () => {
            assert.deepStrictEqual(spans.length, 1);
        });
        it('should instrument parse with error', () => {
            const parseSpan = spans[0];
            const event = parseSpan.events[0];
            assert.ok(event);
            assert.deepStrictEqual(event.attributes['exception.type'], 'GraphQLError');
            assert.ok(event.attributes['exception.message']);
            assert.ok(event.attributes['exception.stacktrace']);
            assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
        });
    });
    describe('when query is correct but cannot be validated', () => {
        let spans;
        beforeEach(async () => {
            create({});
            await graphql_1.graphql(schema, queryInvalid);
            spans = exporter.getFinishedSpans();
        });
        afterEach(() => {
            exporter.reset();
            graphQLInstrumentation.disable();
            spans = [];
        });
        it('should have 2 spans', () => {
            assert.deepStrictEqual(spans.length, 2);
        });
        it('should instrument parse with error', () => {
            const parseSpan = spans[0];
            assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                '  query {\n' +
                '    book(id: "*") {\n' +
                '      name\n' +
                '    }\n' +
                '  }\n');
            assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
        });
        it('should instrument validate', () => {
            const validateSpan = spans[1];
            assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
            assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
            const event = validateSpan.events[0];
            assert.deepStrictEqual(event.name, 'exception');
            assert.deepStrictEqual(event.attributes['exception.type'], enum_1.SpanAttributes.ERROR_VALIDATION_NAME);
            assert.ok(event.attributes['exception.message']);
        });
    });
    describe('when query operation is not supported', () => {
        let spans;
        beforeEach(async () => {
            create({});
            await graphql_1.graphql({
                schema,
                source: sourceBookById,
                operationName: 'foo',
            });
            spans = exporter.getFinishedSpans();
        });
        afterEach(() => {
            exporter.reset();
            graphQLInstrumentation.disable();
            spans = [];
        });
        it('should have 3 spans', () => {
            assert.deepStrictEqual(spans.length, 3);
        });
        it('should instrument parse with error', () => {
            const parseSpan = spans[0];
            assert.deepStrictEqual(parseSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                '  query {\n' +
                '    book(id: *) {\n' +
                '      name\n' +
                '    }\n' +
                '  }\n');
            assert.deepStrictEqual(parseSpan.name, enum_1.SpanNames.PARSE);
        });
        it('should instrument validate', () => {
            const validateSpan = spans[1];
            assert.deepStrictEqual(validateSpan.name, enum_1.SpanNames.VALIDATE);
            assert.deepStrictEqual(validateSpan.parentSpanId, undefined);
            const event = validateSpan.events[0];
            assert.ok(!event);
        });
        it('should instrument execute', () => {
            const executeSpan = spans[2];
            assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.SOURCE], '\n' +
                '  query {\n' +
                '    book(id: *) {\n' +
                '      name\n' +
                '    }\n' +
                '  }\n');
            assert.deepStrictEqual(executeSpan.attributes[enum_1.SpanAttributes.OPERATION], 'Operation "foo" not supported');
            assert.deepStrictEqual(executeSpan.name, enum_1.SpanNames.EXECUTE);
            assert.deepStrictEqual(executeSpan.parentSpanId, undefined);
        });
    });
});
//# sourceMappingURL=graphql.test.js.map