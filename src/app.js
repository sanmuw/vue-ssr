import Vue from 'vue';
import App from './App.vue';
import VueMeta from 'vue-meta';
import { createRouter } from './router';
import { createStore } from './store';

Vue.use(VueMeta);

Vue.mixin({
  metaInfo: {
    titleTemplate: '%s - Vue SSR', // title 的模板，%s 会替换为标题
  }
})

export function createApp() {
  const router = createRouter();
  const store = createStore();
  const app = new Vue({
    router,
    store, // 注册store
    render: h => h(App)
  })
  return { app, router, store }
}