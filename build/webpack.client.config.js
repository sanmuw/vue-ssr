const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

module.exports = merge(baseConfig, {
    entry: {
        // 相对路径取决于执行打包命令的路径
        app: './src/entry-client.js' 
    },
    module: {
        rules: [
            // ES6 转 ES5，客户端单独处理，node端支持es6
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        cacheDirectory: true,
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }
            }
        ]
    },


    // 将webpack运行时分离到一个引导chunk中
    // 以便可以在之后正确注入异步chunk
    optimization: {
        splitChunks: {
            name: "manifest",
            minChunks: Infinity,
        }
    },

    plugins: [
        // 在输出目录中生成 vue-ssr-client-manifest.json
        new VueSSRClientPlugin()
    ]
})