var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var env = process.env.WEBPACK_ENV;
//var WebpackDevServer = require('webpack-dev-server');
var path = require('path');
//require('file?name=[name].[ext]!../index.html');

var appName = 'CardifCIMAServer';
var host = '0.0.0.0';
var port = '9000';

var plugins = [], outputFile;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  outputFile = appName + '.min.js';
} else {
  outputFile = appName + '.js';
}

var config = {
  entry: './public_src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/public/lib',
    filename: outputFile,
    publicPath: __dirname + '/public'
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loaders:[ 
            'babel?presets[]=react,presets[]=es2015',
//            'jsx-loader?insertPragma=React.DOM&harmony'
            'jsx-loader?harmony'
        ],
        exclude: /(node_modules|bower_components)///,
//        query: {
//          presets: ['react', 'es2015']
//        }
      }
    ]
  },
  resolve: {
    root: path.resolve('./public_src'),
    extensions: ['', '.js', '.jsx']
  },
  plugins: plugins
};

{/*
if (env === 'dev') {
  new WebpackDevServer(webpack(config), {
    contentBase: './example',
    hot: true,
    debug: true
  }).listen(port, host, function (err, result) {
    if (err) {
      console.log(err);
    }
  });
  console.log('-------------------------');
  console.log('Local web server runs at http://' + host + ':' + port);
  console.log('-------------------------');
}
*/}

module.exports = config;
