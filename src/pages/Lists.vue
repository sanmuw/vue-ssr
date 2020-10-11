<template>
    <div class='posts'>
        <h1>lists</h1>
        <ul>
            <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
        </ul>
    </div>
</template>
<script>
import {mapState, mapActions} from 'vuex';

export default {
    name: 'lists',
    metaInfo: {
        title: '列表'
    },
    data() {
        return {};
    },
    computed: {
        ...mapState(['posts']),
    },
    methods: {
        ...mapActions(['getPosts']),
    },
    // vue ssr 为服务端提供的特殊的生命周期函数
    serverPrefetch() {
        // 发起action 返回Promise
        return this.getPosts();
    }
    
}
</script>