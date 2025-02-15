import { firebaseAction } from "vuexfire";
import _ from "lodash";

import { auth } from "../../firebase";
import api from "../../services/api";

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
      redo: 43,
      authorQueued: 45,
      authoring: 50,
      authored: 60, // TODO: Add to Firebase function
      submittedForBurn: 70,
      burning: 75,
      burnComplete: 80,
      packaging: 90,
      packagingApproved: 100,
      shipping: 110,
      arrived: 120,
      complete: 130,
      archive: 990, // DON'T USE!
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
    },
    statuses(state) {
      return Object.keys(state.STATUS_SORT_VALS);
    },
    purchaseById: state => purchaseId => {
      return state.all.find(purchase => purchase[".key"] === purchaseId);
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
    UPDATE_PURCHASE(state, { purchase, fieldsToUpdate }) {
      const thePurchaseRef = state.refs.purchases.child(purchase[`.key`]);
      const updates = _.pick(purchase, fieldsToUpdate);
      thePurchaseRef.update({
        ...updates
      });
    },
    SET_REF(state, { key, ref }) {
      state.refs[key] = ref;
    }
  },
  actions: {
    setPurchaseStatus({ commit, getters }, { purchaseId, status, user }) {
      if (!status || !purchaseId) return;
      user = user || auth.currentUser;
      const purchase = getters.purchaseById(purchaseId);

      const d = new Date();
      const year = d.getFullYear();
      const month = ("0" + (d.getMonth()+1)).slice(-2); // Add +1 to month becuase it is zero indexed.
      const day = ("0" + d.getDate()).slice(-2);
      const dateStr = `${year}-${month}-${day}`;

      const newNote = `${
        purchase.notes ? purchase.notes + "\n" : ""
      }[${dateStr}](${user.displayName}) set status from ${
        purchase.status
      } to ${status}`;

      purchase.notes = newNote;
      purchase.status = status;
      commit("UPDATE_PURCHASE", { purchase, fieldsToUpdate: ["notes", "status"] });
    },

    setPurchases: firebaseAction(
      ({ bindFirebaseRef, commit }, { ref, limit = 9999999 }) => {
        commit("TOGGLE_LOADING_STATE", { key: "purchases", value: true });
        bindFirebaseRef(
          "all",
          ref.orderByChild("date_created").limitToLast(limit)
        );
        commit("SET_REF", { key: "purchases", ref });
        ref.on("value", () => {
          commit("TOGGLE_LOADING_STATE", { key: "purchases", value: false });
        });
      }
    ),

    setFilesByPurchase: firebaseAction(
      ({ bindFirebaseRef, commit }, { ref }) => {
        commit("TOGGLE_LOADING_STATE", { key: "filesByPurchase", value: true });
        bindFirebaseRef("filesByPurchase", ref);
        commit("SET_REF", { key: "filesByPurchase", ref });
        ref.once("value", () => {
          commit("TOGGLE_LOADING_STATE", {
            key: "filesByPurchase",
            value: false
          });
        });
      }
    ),

    archivePurchase({ state }, { purchaseId }) {
      api.del(`/purchases/${purchaseId}`);
    }
  }
};
