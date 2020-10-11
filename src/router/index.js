import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/pages/Home';
import Page404 from '@/pages/404';

Vue.use(VueRouter);

// 类似于 createApp，我们也需要给每个请求一个新的 router 实例，所以文件导出一个 createRouter 函数
// 防止数据污染
export const createRouter = () => {
  const router = new VueRouter({
    mode: 'history', // 服务端不支持hash模式
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/sanmu',
        name: 'sanmu',
        component: () => import('@/pages/Sanmu')
      },
      {
        path: '/lists',
        name: 'lists',
        component: () => import('@/pages/Lists')
      },
      {
        path: '*', // 上面的路由未匹配到时，可以通过*匹配到404页面
        name: 'page404',
        component: Page404
      }
    ]
  })
  return router;
}