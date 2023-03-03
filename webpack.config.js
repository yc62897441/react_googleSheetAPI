const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
    mode: 'production', //mode: 'production' npm run build之後js空格會被壓縮掉
    entry: ['./src/index.js'],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.js',
        //加hash是為了快取問題，版本更新使用者會抓到最新的檔案

        // 不要加 publicPath，配合 nginx 設定 root 根目錄路徑即為專案資料夾，靜態檔案都放在專案資料夾，在 index.html 引入 js、css 的路徑為「/main.js」、不要「/homepage/main.js」。
        // publicPath: '/homepage/',

        // "/signSystem/" :同網域 , "/":localhost
        //允許您為應用程序中的所有資產指定基本路徑。
    },
    // devServer: {
    //     contentBase: path.join(__dirname, 'signSystem'),
    //     historyApiFallback: true,
    //     //將 404s 重定向到/index.html.
    //     compress: true,
    //     port: 9000,
    // },
    //loader是幫助瀏覽器閱讀非js的檔案
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.js|.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-transform-react-jsx', '@babel/plugin-transform-react-jsx-compat'],
                    },
                },
            },
            {
                test: /\.(jpg|jpe?g|png|gif|svg|pdf)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.json$/,
                use: ['json-loader'],
                type: 'javascript/auto',
            },
        ],
    },
    //plugins插件
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public/index.html'), //html模板
            filename: 'index.html',
        }),
        new MiniCssExtractPlugin({
            filename: 'main.css',
        }), //讓dist新增獨立的css檔
        new webpack.ProvidePlugin({
            React: 'react',
            'react-dom': 'ReactDOM',
            'react-router-dom': 'ReactRouterDOM',
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
        new NodePolyfillPlugin(),
    ],
    // resolve: {
    //   fallback: { "path": false }
    // }
    resolve: {
        fallback: {
            path: require.resolve('path-browserify'),
        },
        extensions: ['.jsx', '.js', '.tsx', '.ts'],
    },
}
