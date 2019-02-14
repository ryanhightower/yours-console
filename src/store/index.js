import Vue from "vue";
import Vuex from "vuex";
import { firebaseMutations } from "vuexfire";
import { db } from "../firebase";
// Modules
import purchases from "./modules/purchases";
import users from "./modules/users";

Vue.use(Vuex);

export default new Vuex.Store({
  // strict: process.env.NODE_ENV !== "production",
  modules: {
    purchases,
    users
  },
  state: {
    refs: {
      ADDRESSES_BY_USER: db.ref("addressesByUser"),
      ARCHIVED_PURCHASES: db.ref("archivedPurchases"),
      ARCHIVED_TRACKING_BY_PURCHASE: db.ref("archivedTrackingByPurchase"),
      ARUS: db.ref('arus'),
      CONSTANTS: db.ref("constants"),
      DISLIKED_MOVIES_BY_USER: db.ref("dislikedMoviesByUser"),
      EVENTS: db.ref("events"),
      FAILED_ASSETS_BY_USER: db.ref("failedAssetsByUser"),
      FILES: db.ref("files"),
      FILES_BY_PURCHASE: db.ref("filesByPurchase"),
      GROUPS_BY_PURCHASE: db.ref("groupsByPurchase"),
      INTERNAL: db.ref("internal"),
      JOBS: db.ref("jobs"),
      KICKSTARTER_BACKERS: db.ref("kickstarterBackers"),
      MAGIC_MOVIES_BY_USER: db.ref("magicMoviesByUser"),
      MOVIES_BY_USER: db.ref("moviesByUser"),
      OTT: db.ref("ott"),
      PLANS: db.ref("plans"),
      PRODUCTS: db.ref("products"),
      PROMO_CODES: db.ref("promoCodes"),
      PROMO_REDEMPTIONS: db.ref("promoRedemptions"),
      PROMOS: db.ref("promos"),
      PURCHASES: db.ref("purchases"),
      PURCHASES_BY_USER: db.ref("purchasesByUser"),
      STREAMABLES: db.ref("streamables"),
      STREAMABLES_BY_USER: db.ref("streamablesByUser"),
      STRIPE_CUSTOMERS: db.ref("stripeCustomers"),
      TRACKING_BY_PURCHASE: db.ref("trackingByPurchase"),
      UNGROUPED_FILES_BY_PURCHASE: db.ref("ungroupedFilesByPurchase"),
      UPLOAD_ASSETS_BY_USER: db.ref("uploadAssetsByUser"),
      USERS: db.ref("users")
    }
  },
  mutations: {
    ...firebaseMutations,
    SEND_TO_ARU(state, purchase) {
      state.refs.ARUs.child(`MAL/jobs/${purchase[".key"]}`).set({
        status: "initial",
        quantity: purchase.discQuantity
      })
    }
  }
});
