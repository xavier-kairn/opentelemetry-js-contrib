export declare enum AllowedOperationTypes {
    QUERY = "query",
    MUTATION = "mutation",
    SUBSCRIPTION = "subscription"
}
export declare enum TokenKind {
    SOF = "<SOF>",
    EOF = "<EOF>",
    BANG = "!",
    DOLLAR = "$",
    AMP = "&",
    PAREN_L = "(",
    PAREN_R = ")",
    SPREAD = "...",
    COLON = ":",
    EQUALS = "=",
    AT = "@",
    BRACKET_L = "[",
    BRACKET_R = "]",
    BRACE_L = "{",
    PIPE = "|",
    BRACE_R = "}",
    NAME = "Name",
    INT = "Int",
    FLOAT = "Float",
    STRING = "String",
    BLOCK_STRING = "BlockString",
    COMMENT = "Comment"
}
export declare enum SpanAttributes {
    COMPONENT = "graphql",
    SOURCE = "graphql.source",
    FIELD_NAME = "graphql.field.name",
    FIELD_PATH = "graphql.field.path",
    FIELD_TYPE = "graphql.field.type",
    OPERATION = "graphql.operation.name",
    VARIABLES = "graphql.variables.",
    ERROR_VALIDATION_NAME = "graphql.validation.error"
}
export declare enum SpanNames {
    EXECUTE = "graphql.execute",
    PARSE = "graphql.parse",
    RESOLVE = "graphql.resolve",
    VALIDATE = "graphql.validate",
    SCHEMA_VALIDATE = "graphql.validateSchema",
    SCHEMA_PARSE = "graphql.parseSchema"
}
//# sourceMappingURL=enum.d.ts.map