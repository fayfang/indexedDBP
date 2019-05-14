const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

let compiler = webpack({
  mode: 'development',
  entry: path.join(__dirname, '../demo/index.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'demo.js'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: 'babel-loader',
        exclude: [path.join(__dirname, '../dist'), path.join(__dirname, '../node_modules')]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../index.html')
    })
  ],
  performance: {
    hints: false,
  },
})

let dev = new webpackDevServer(compiler);
dev.listen(8888, '0.0.0.0', () => {
})