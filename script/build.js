const webpack = require('webpack');
const path = require('path');

let compiler = webpack({
  mode: 'production',
  entry: path.join(__dirname, '../src/main.ts'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'IndexedDBP.js',
    library: 'IndexedDBP',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  },
  performance: {
    hints: false,
  },
})

compiler.run((err, stats) => {
  console.log(err, stats.toJson({}, true))
})