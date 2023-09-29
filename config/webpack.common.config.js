const path = require('path');

module.exports = {
  resolve: {
    alias: {
      portal: path.resolve(__dirname, '../src/'),
      core: path.resolve(__dirname, '../src/core/'),
      context: path.resolve(__dirname, '../src/externals/module'),
    },
    extensions: ['.js'],
    fallback: { "url": require.resolve("url/") }
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
            loader: 'source-map-loader'
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
