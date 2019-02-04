import Vue from "vue";
import Router from "vue-router";
// import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      redirect: { name: "purchases" }
    },
    {
      path: "/login",
      name: "login",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "login" */ "./views/Login.vue")
    },
    {
      path: "/purchases",
      name: "purchases",
      component: () =>
        import(/* webpackChunkName: "purchases" */ "./views/Purchases.vue")
    },
    {
      path: "/purchases/:purchaseId",
      name: "purchase",
      component: () =>
        import(/* webpackChunkName: "purchase" */ "./views/Purchase.vue")
    },
    {
      path: "/users/:userId",
      name: "user",
      component: () =>
        import(/* webpackChunkName: "user" */ "./views/User.vue")
    },
    {
      path: "/scanner",
      name: "scanner",
      component: () =>
        import(/* webpackChunkName: "scanner" */ "./views/Scanner.vue")
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  }
});
