# OpenTelemetry Plugins Node Core and Contrib

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![Apache License][license-image]][license-image]

This package depends on all node plugins maintained by OpenTelemetry authors.
Installing it will also install all plugins.

## Plugins

In addition to all [node core plugins][otel-plugins-node-core], the following plugins will be installed by this package:

- [@opentelemetry/plugin-express][otel-plugin-express]
- [@opentelemetry/plugin-ioredis][otel-plugin-ioredis]
- [@opentelemetry/plugin-mongodb][otel-plugin-mongodb]
- [@opentelemetry/plugin-mysql][otel-plugin-mysql]
- [@opentelemetry/plugin-pg-pool][otel-plugin-pg-pool]
- [@opentelemetry/plugin-pg][otel-plugin-pg]
- [@opentelemetry/plugin-redis][otel-plugin-redis]

Note: [@opentelemetry/plugin-dns][otel-plugin-dns] is excluded by default because it requires some manual configuration to prevent infinite loops with exporters.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=metapackages/plugins-node-core
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetryplugins-node-core
[npm-url]: https://www.npmjs.com/package/@opentelemetry/plugins-node-core-and-contrib
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fplugins-node-core-and-contrib.svg

[otel-plugins-node-core]: https://www.npmjs.com/package/@opentelemetry/plugins-node-core

[otel-plugin-dns]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-plugin-dns
[otel-plugin-express]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-plugin-express
[otel-plugin-ioredis]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-plugin-ioredis
[otel-plugin-mongodb]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-plugin-mongodb
[otel-plugin-mysql]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-plugin-mysql
[otel-plugin-pg-pool]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-plugin-pg-pool
[otel-plugin-pg]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-plugin-pg
[otel-plugin-redis]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-plugin-redis
