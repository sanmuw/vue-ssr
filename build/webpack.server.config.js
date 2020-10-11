const {merge} = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const baseConfig = require('./webpack.base.config');

const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

module.exports = merge(baseConfig, {
    entry: './src/entry-server.js',
    // 允许webpack 以Node适用方式处理模块加载
    // 并且还会在编译Vue组件时，
    // 告知vue-loader ,输出面向服务器的代码（server-oriented code）
    target: 'node',
    output: {
        filename: 'server-bundle.js',
        // 配置server bundle 用Node风格(module.exports)导出模块（Node-style exports）
        libraryTarget: 'commonjs2'
    },
    // 不打包node_modules第三方包，保留require方式加载
    // 因为nodejs中一些node第三方包本身就是适用commonjs规范导入导出，在node环境不需要打包
    externals: [nodeExternals({
        // 白名单中资源蒸尝大包，第三方包中的css资源依然需要打包
        allowlist: [/\.css$/]
    })],

    plugins: [
        // 生成默认名称为vue-ssr-server-bundle.json的文件
        new VueSSRServerPlugin()
    ]
})