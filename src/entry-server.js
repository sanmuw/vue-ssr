import { createApp } from './app';
export default async context => {
  const { app, router, store } = createApp();

  // 拿到混入的meta内容
  const meta = app.$meta();

  router.push(context.url);

  // 注入到context上下文中，这样在页面模板中就可以取到meta的内容了
  context.meta = meta;

  await new Promise(router.onReady.bind(router));

  context.rendered = () => {
    // renderer 会把 content.state中的数据内联到页面模板中
    // 最终发送给客户端的页面中会包含一段脚本：window.__INITIAL_STATE__ = context.state;
    // 客户端就要把页面中的window.__INITIAL_STATE__ 取出来填充到客户端store中去
    context.state = store.state;
  }

  return app;
}