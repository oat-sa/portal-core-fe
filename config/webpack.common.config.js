const path = require('path');

module.exports = {
  resolve: {
    alias: {
      portal: path.resolve(__dirname, '../src/'),
      core: path.resolve(__dirname, '../src/core/')
    },
    extensions: ['.js']
  },
    externals: {
        fs: 'fs-extra',
        async: 'async',
        module: 'module',
        lodash: 'lodash',
        context: path.resolve(__dirname, '../dist/externals/module'),
        i18n: path.resolve(__dirname, '../dist/externals/i18n'),
        'idb-wrapper': 'idb-wrapper',
        'lib/uuid': 'uuid'
    },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    forceAllTransforms: true
                  }
                ]
              ]
            },
          },
          {
            loader: 'source-map-loader',
            options: {
              enforce: 'pre'
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ],
      },
      {
        test: /\.tpl/,
        loader: 'handlebars-loader',
      },
      {
        test: /\.json/,
        loader: 'json-loader',
      }
    ],
  },
};
