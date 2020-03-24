const path = require('path');
const merge = require('webpack-merge');
const loaders = require('./webpack.common.config.js');

glob = require('glob');
const entryArray = glob.sync('test/**/test.js');
const entryTestsObject = entryArray.reduce((acc, item) => {
  let name = item.replace('/test.js', '');
  acc[name] = path.resolve(__dirname, '../', item);
  return acc;
}, {});

module.exports = merge(loaders, {
  resolve: {
    alias: {
      test: path.resolve(__dirname, '../test/'),
      'jquery.mockjax': path.resolve(__dirname, '../node_modules/jquery-mockjax/dist/jquery.mockjax')
    },
  },
  mode: 'development',
  devtool: 'inline-source-map',
  entry:  entryTestsObject,
  output: {
    path: path.resolve(__dirname, '../'),
    filename: '[name]/test.bundle.js'
  },
  devServer: {
    contentBase: path.join(__dirname, '../'),
    hot: true,
  },
});
