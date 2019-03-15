import Vue from 'vue';
import Router from 'vue-router';
import Editor from './views/Editor.vue';
import About from './views/About.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'editor',
      component: Editor,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
