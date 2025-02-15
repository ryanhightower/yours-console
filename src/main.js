import Vue from "vue";
import VueFire from "vuefire";
import Buefy from "buefy";

import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.use(VueFire);
Vue.use(Buefy, {
  defaultIconPack: "fas"
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
