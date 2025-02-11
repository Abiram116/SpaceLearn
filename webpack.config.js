const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@ui-kitten/components']
    }
  }, argv);

  // Basic webpack configuration
  config.mode = 'development';
  config.devtool = 'eval-source-map';

  // Configure dev server
  config.devServer = {
    ...config.devServer,
    hot: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
      progress: true,
      logging: 'info',
    },
    static: {
      directory: './web',
    }
  };

  // Configure node polyfills and fallbacks
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve?.fallback,
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false,
      "http2": false,
      "dns": false,
      "dgram": false
    },
    extensions: ['.web.js', '.js', '.jsx', '.json', '.tsx', '.ts']
  };

  // Add error logging plugin
  config.plugins = [
    ...config.plugins,
    {
      apply: (compiler) => {
        compiler.hooks.done.tap('ErrorLoggingPlugin', (stats) => {
          if (stats.hasErrors()) {
            console.error('\nWebpack build errors:\n', stats.toString('errors-only'));
          }
        });
      },
    },
  ];

  return config;
}; 