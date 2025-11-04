const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": false,
        "stream": false,
        "assert": false,
        "http": false,
        "https": false,
        "os": false,
        "url": false,
        "zlib": false,
        "util": false,
        "process": require.resolve("process/browser"),
        "buffer": require.resolve("buffer/")
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer']
        })
      );

      // Allow importing without full extension
      webpackConfig.resolve.fullySpecified = false;

      webpackConfig.ignoreWarnings = [/Failed to parse source map/];

      return webpackConfig;
    }
  }
};
