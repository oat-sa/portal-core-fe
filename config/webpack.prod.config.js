const path = require('path');
const merge = require('webpack-merge');
const loaders = require('./webpack.common.config.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const glob = require('glob');

const rootPath = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootPath, 'src');

const entryArray = glob.sync(path.join(srcDir, '**', '*.js'));
const entryObject = entryArray.reduce((acc, item) => {
  const name = path.relative(srcDir, item);
  acc[name] = item;
  return acc;
}, {});

/**
 * Define all modules as external, so rollup won't bundle them together.
 */
const externals = {
  lodash: true,
  jquery: true,
  handlebars: true,
  i18n: true,
  module: true,
  context: path.resolve(__dirname, '../dist/externals/module'),
  'idb-wrapper': 'idb-wrapper',
  'lib/uuid': 'uuid'
};
entryArray.forEach( file =>
  externals[`portal/${path
          .relative(srcDir, file)
          .replace(/\\/g, '/')
          .replace(/\.js$/, '')}`] = true
);

module.exports = merge(loaders,  {
  mode: 'production',
  entry:  entryObject,
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: path.resolve(__dirname, '../dist'),
    filename: '[name]',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  externals,
  plugins: [
    new CleanWebpackPlugin(),
  ],
});
