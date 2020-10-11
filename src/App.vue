<template>
  <div id="app">
    <ul>
      <li><router-link to="/">home</router-link></li>
      <li><router-link to="/sanmu">sanmu</router-link></li>
      <li><router-link to="/lists">lists</router-link></li>
    </ul>
    <!-- 路由出口 -->
    <router-view />
  </div>
</template>
<script>
export default {
  name: "App",
  components: {},
  data() {
    return {
      message: "vue ssr",
    };
  },
  methods: {
    click: () => {
      console.log("点击");
    },
  },
};
</script>