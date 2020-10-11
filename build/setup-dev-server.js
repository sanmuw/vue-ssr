const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');

const resolve = file => path.resolve(__dirname, file);

module.exports = (server, callback) => {
  let ready; // 用于保存promise中的resolve函数
  const onReady = new Promise(r => ready = r);

  // 监视构建过程 -> 更新 Renderer
  let template;
  let serverBundle;
  let clientManifest;

  const update = () => {
    if (template && serverBundle && clientManifest) {
      ready();
      callback(serverBundle, template, clientManifest)
    }
  }

  // 监视构建 template -> 调用update -> 更新renderer渲染器
  const tempaltePath = path.resolve(__dirname, '../index.template.html');
  template = fs.readFileSync(tempaltePath, 'utf-8');
  chokidar.watch(tempaltePath).on('change', () => {
    // 当文件变化时
    template = fs.readFileSync(tempaltePath, 'utf-8');
    console.log('模板加载读取完成')
    update();
  })


  // 监视构建 serverBundle -> 调用update -> 更新renderer渲染器
  const serverConfig = require('./webpack.server.config');
  const serverCompiler = webpack(serverConfig);

  // webapck的编译器自带文件监视api,但是在开发环境使用会导致频繁的文件打包，文件读写，所以需要借助webpack-dev-middleware实现文件打包内容缓存在内存中
  // serverCompiler.watch({}, (err, status) => {
  //     if (err) throw err;
  //     if (status.hasErrors()) return;
  //     serverBundle = JSON.parse(
  //         fs.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')
  //     );
  //     console.log(serverBundle);
  //     update();
  // })
  const serverDevMiddleware = devMiddleware(serverCompiler, {
    logLevel: 'silent' // 关闭日志输出，有friendlyErrorsWebpackPlugin 处理
  })
  // serverCompiler.hooks.done.tap添加打包后的回调函数，从而调用update函数，第一个参数'server'是我们定义的事件名字，没有固定意义
  serverCompiler.hooks.done.tap('server', () => {
    serverBundle = JSON.parse(
      // serverDevMiddleware.fileSystem 与 fs 类似，只不过是操作内存中的文件
      serverDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')
    );
    // console.log(serverBundle);
    console.log('服务端打包完成')
    update();
  })


  // 监视构建 clientManifest -> 调用update -> 更新renderer渲染器
  const clientConfig = require('./webpack.client.config');

  // 配置热更新
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  clientConfig.entry.app = [
    'webpack-hot-middleware/client?quiet=true&reload=true', // 和服务端交互处理热更新的客户端脚本， 不会刷新页面
    // ? 之后可附带参数，quiet 指热更新时控制台禁止输出热更新日志，（[HMR] bundle rebuilding[HMR] bundle rebuilt in 33ms这种）
    // reload 代表在热更新卡住时刷新界面
    // 更多使用参照 https://github.com/webpack-contrib/webpack-hot-middleware
    clientConfig.entry.app, // webpack中配置的原本的打包入口
  ];
  clientConfig.output.filename = '[name].js'; // 热更新模式下，确保文件名一致，如果在配置文件中配置了[chunkhash]等导致输出的文件名不一致，热更新编译时会报错Cannot use [chunkhash] or [contenthash] for chunk in '[name].[chunkhash].js' (use [hash] instead)


  const clientCompiler = webpack(clientConfig);
  const clientDevMiddleware = devMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    logLevel: 'silent' // 关闭日志输出，有friendlyErrorsWebpackPlugin 处理
  })
  // clientCompiler.hooks.done.tap添加打包后的回调函数，从而调用update函数，第一个参数'client'是我们定义的事件名字，没有固定意义
  clientCompiler.hooks.done.tap('client', () => {
    clientManifest = JSON.parse(
      // clientDevMiddleware.fileSystem 与 fs 类似，只不过是操作内存中的文件
      clientDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-client-manifest.json'), 'utf-8')
    );
    // console.log(clientManifest);
    console.log('客户端打包完成')
    update();
  })

  // 配置热更新
  server.use(hotMiddleware(clientCompiler, {
    log: false, // 关闭本身的日志输出
  }));

  // 在server.js我们使用user static 处理dist下的文件为静态资源,但是开发环境中打包文件在内存中，没有实际的静态资源，所以回到值客户端不能激活
  // clientDevMiddleware 中间件提供了对内存中数据的访问，当客户端访问 /dist/下某个js文件时，会尝试返回内存中的文件数据
  server.use(clientDevMiddleware)

  return onReady;
}