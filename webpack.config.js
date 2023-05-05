const path = require('path');
const glob = require('glob');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const entryArray = glob.sync('./src/endpoints/**/*.mjs');

const entryObject = entryArray.reduce((acc, item) => {
  let pathName = item.replace('./src/endpoints/', '');

  let name =
    path.dirname(pathName).replaceAll('/', '.') +
    '.' +
    path.basename(pathName, '.mjs');
  acc[name] = item;
  return acc;
}, {});

const ZipPlugins = Object.keys(entryObject).map((name) => {
  return new ZipPlugin({
    path: path.resolve(__dirname, 'build/artifacts/'),
    filename: name,
    include: [name],
  });
});

module.exports = {
  entry: entryObject,
  devtool: 'source-map',
  target: 'node',
  plugins: [new ProgressBarPlugin(), ...ZipPlugins, new CleanWebpackPlugin()],
  resolve: {
    extensions: ['.js', '.mjs'],
  },
  output: {
    filename: '[name]/index.mjs',
    path: path.resolve(__dirname, 'build'),
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    libraryTarget: 'commonjs2',
  },
};
