import Vue from "vue";
import Vuex from "vuex";
import { firebaseMutations } from "vuexfire";

import purchases from "./modules/purchases";

Vue.use(Vuex);

export default new Vuex.Store({
  // strict: process.env.NODE_ENV !== "production",
  modules: {
    purchases
  },
  mutations: {
    ...firebaseMutations
  }
});
