const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, 'index.web.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
    extensions: [
      '.web.tsx',
      '.web.js',
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.json',
      '.mjs',
      '.cjs',
    ],
  },
  module: {
    rules: [
      {
        // test: /\.(js|jsx|mjs)$/,
        test: /\.[jt]sx?$/,
        exclude:
          /node_modules\/(?!(react-native|react-native-gesture-handler|react-native-reanimated|@react-native|@shopify)\/).*/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    static: './dist',
    hot: true,
  },
};
