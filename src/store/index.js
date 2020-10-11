import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      posts: []
    }),

    mutations: {
      setPosts(state, data) {
        state.posts = data;
      }
    },

    actions: {
      // 在服务端渲染期间务必让action返回一个Promise，服务端渲染时会等待数据返回
      async getPosts(context) {
        const { commit } = context;
        try {
          const { data } = await axios.get('http://localhost:8090/api/list'); // 临时的接口地址，我会以错误的数据做处理
          commit('setPosts', data.data)
        } catch (error) {
          const data = [
            {
              id: 1,
              title: 'hello world'
            }, {
              id: 2,
              title: '三木'
            }, {
              id: 3,
              title: '我爱挑战'
            }
          ]
          commit('setPosts', data)
        }
      }
    }
  })
}