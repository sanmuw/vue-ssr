const Vue = require('vue');
const express = require('express');
const fs = require('fs');
const { createBundleRenderer } = require('vue-server-renderer');
const setupDevServer = require('./build/setup-dev-server');

const isProd = process.env.NODE_ENV === 'production';

// const renderer = require('vue-server-renderer').createRenderer({
//     template: fs.readFileSync('./index-template.html', 'utf-8')
// });

const server = express();

// 客户端请求js资源，处理dist下文件可访问
server.use('/dist', express.static('./dist'));

let renderer;
let onReady; // 用于保存开发模式renderer渲染器赋值状态
if (isProd) {
  // 服务端打包生成的文件
  const serverBundle = require('./dist/vue-ssr-server-bundle.json');
  // 客户端打包生成的文件
  const clientManifest = require('./dist/vue-ssr-client-manifest.json');
  // render时vue实例实例的嵌套模板
  const template = fs.readFileSync('./index-template.html', 'utf-8');
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
  });
} else {
  // 开发模式 =》 监视打包构建 =》 重新生成renderer渲染器
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest
    });
  });
}

// const app = new Vue({
//     template: `<div id="app">
//         <h1>{{ message }}</h1>
//     </div>`,
//     data: {
//         message: 'vue ssr'
//     }
// })

// render函数renderToString 中第一个参数填加请求路由req.url
const render = async (req, res) => {
  try {
    // renderer.renderToString(app, {title: 'vue ssr'}, (err, html) => {
    // renderToString 中第一个参数的url会在entry-server中通过context.url使用
    const html = await renderer.renderToString({ title: 'vue ssr', url: req.url })
    // 设置响应头避免乱码
    res.setHeader('Content-Type', 'text/html; charset=utf8')
    res.end(html);
  } catch (error) {
    res.status(500).end('Internal Server Error')
  }
}

// 服务端渲染不用对每一个路径都匹配路由，只需要通过*匹配所有路由，vuerouter中会对未匹配的路由返回404页面
server.get('*',
  isProd ? render : async (req, res) => {
    // 开发模式要在有了打包结果并且渲染器赋值完成才执行render
    console.log('等待 打包')
    await onReady;
    console.log('打包 done')
    render(req, res);
  }
)

server.listen(3001, () => {
  console.log('server running at 3001')
})