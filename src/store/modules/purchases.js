import { firebaseAction } from "vuexfire";

export default {
  namespaced: true,
  state: {
    all: [],
    filesByPurchase: [],
    refs: {
      purchases: null,
      filesByPurchase: null
    },
    loading: {
      purchases: false,
      filesByPurchase: false
    },
    STATUS_SORT_VALS: {
      initial: 10,
      readyForProduction: 20,
      inProduction: 30,
      producerApproved: 40,
      authoring: 50,
      submittedForBurn: 70,
      burnComplete: 80,
      packaging: 90,
      packagingApproved: 100,
      shipping: 110,
      arrived: 120,
      complete: 130,
      archive: 990,
      test: 999
    }
  },
  getters: {
    isAuthoring(state) {
      return state.all.filter(purchase => {
        return purchase.status === "authoring";
      });
    },
    purchases(state) {
      return Object.values(state.all);
    }
  },
  mutations: {
    TOGGLE_LOADING_STATE(state, { key, value }) {
      state.loading[key] = value;
    },
    SET_PURCHASE_STATUS(state, { key, status }) {
      const thePurchaseRef = state.refs.purchases.child(key);
      thePurchaseRef.update({
        status: status,
        statusSort: state.STATUS_SORT_VALS[status]
      });
      // thePurchaseRef.once('value', (snapshot) => {
      // })
    },
    // DANGER WILL ROBINSON!!
    UPDATE_PURCHASE(state, purchase) {
      const thePurchaseRef = state.refs.purchases.child(purchase[`.key`]);
      const updated = Object.assign({}, purchase);
      delete updated[".key"];

      thePurchaseRef.update({
        ...updated
      });
    },
    SET_REF(state, { key, ref }) {
      state.refs[key] = ref;
    }
  },
  actions: {
    setPurchases: firebaseAction(({ bindFirebaseRef, commit }, { ref }) => {
      commit("TOGGLE_LOADING_STATE", { key: "purchases", value: true });
      bindFirebaseRef("all", ref);
      commit("SET_REF", { key: "purchases", ref });
      ref.on("value", () => {
        commit("TOGGLE_LOADING_STATE", { key: "purchases", value: false });
      });
    }),
    setFilesByPurchase: firebaseAction(
      ({ bindFirebaseRef, commit }, { ref }) => {
        commit("TOGGLE_LOADING_STATE", { key: "filesByPurchase", value: true });
        bindFirebaseRef("filesByPurchase", ref);
        commit("SET_REF", { key: "filesByPurchase", ref });
        ref.on("value", () => {
          commit("TOGGLE_LOADING_STATE", {
            key: "filesByPurchase",
            value: false
          });
        });
      }
    )
  }
};
