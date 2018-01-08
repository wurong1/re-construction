'use strict';

var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  devServer: {
    inline: true,
    https: true,
    port: 8888
  },
  entry: {
    app: [
      'webpack-hot-middleware/client?reload=true',
      path.join(__dirname, 'src/entry/index.js')
    ]
  },
  output: {
    path: path.join(__dirname, '/crm/dist/'),
    filename: '[name].js',
    publicPath: 'https://localhost:8888/crm/dist/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  module: {
    // preLoaders: [{
    //   test: /\.js?$/,
    //   exclude: /node_modules|lib/,
    //   loader: 'eslint'
    // }],
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, {
      test: /\.json?$/,
      loader: 'json'
    }, {
      test: /\.css$/,
      loader: 'style!css?modules&localIdentName=[name]---[local]---[hash:base64:5]'
    }, {
      test: /\.less$/,
      loader: 'style-loader!css-loader!less-loader'
    }, {
      test: /\.(woff(2)?|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader'
    }, {
      test: /\.(png|jpg|jpeg|gif)$/,
      loader: 'file-loader?name=i/[name].[ext]'
    }],
    noParse: /node_modules\/quill\/dist\/quill\.js/
  },
  eslint: {
    formatter: require('eslint-friendly-formatter')
  }
};
