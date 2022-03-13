const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');

module.exports = (env, argv) => {
  const isDev = argv.mode !== 'production';

  return {
    mode: argv.mode,
    devtool: isDev && 'eval',
    entry: {
      app: path.resolve(__dirname, './src/index.tsx'),
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            { loader: 'babel-loader' },
            {
              loader: 'ts-loader',
              options: {
                getCustomTransformers: () => (isDev ? { before: [ReactRefreshTypeScript()] } : void 0),
                compilerOptions: { jsx: 'react-jsx' + (isDev ? 'dev' : '') },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /node_modules/,
            name: 'vendor',
            chunks: 'initial',
            enforce: true,
          },
        },
      },
    },
    output: {
      path: path.resolve(__dirname, './build/'),
      filename: isDev ? 'static/[id].js' : 'static/[contenthash].js',
      publicPath: '/',
      clean: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './src/template.html'),
      }),
      new MonacoEditorWebpackPlugin(),
      isDev && new ReactRefreshWebpackPlugin(),
    ].filter(v => !!v),
    devServer: {
      proxy: {
        '/api': {
          target: 'http://' + (process.env.API_HOST ?? 'localhost:3000'),
          ws: true,
        },
      },
      static: {
        directory: path.resolve(__dirname, './build/static'),
      },
      historyApiFallback: true,
      port: process.env.PORT ?? 8080,
    },
  };
};
