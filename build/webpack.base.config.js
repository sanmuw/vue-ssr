const VueLoaderPlugin = require('vue-loader/lib/plugin');

const path = require('path');

const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const resolve = file => path.resolve(__dirname, file);

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    mode: isProd ? 'production' : 'development',
    output: {
        path: resolve('../dist/'),
        publicPath: '/dist/',
        filename: '[name].[chunkhash].js',
    },
    resolve: {
        // 路径别名
        alias: {
            // @ 指向 src
            '@': resolve('../src/')
        },
        // 可以省略的扩展名
        // 当省略扩展名时。从前往后依次解析
        extensions: ['.js', '.vue', '.json'],
    },
    devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map',
    module: {
      rules: [
            // 处理图片资源
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8129,
                        }
                    }
                ]
            },
            // 处理字体资源
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            },

            // 处理.vue 资源
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },

            // 处理css
            // .css 文件，以及.vue中的<style>
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                ]
            },

            // 处理less
            {
                test: /\.less$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'less-loader',
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new FriendlyErrorsWebpackPlugin(),
    ]
}