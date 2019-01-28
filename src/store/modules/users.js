import { firebaseAction } from "vuexfire";

export default {
  namespaced: true,
  state: {
    all: {}, // Use native firebase object instead of array
    allRef: "",
    movies: [],
    moviesRef: "",
    // // Might need?
    // addresses: [],
    // addressesRef: "",
    // streamables: [],
    // streamablesRef: "",
    // failedAssets: [],
    // failedAssetsRef: "",
    // dislikedMovies: [],
    // dislikedMoviesRef: "",
    // magicMovies: [],
    // magicMoviesRef: "",
    // purchases: [],
    // purchasesRef: "",
    // stripeCustomers: [],
    // stripeCustomersRef: "",
    // uploadAssets: [],
    // uploadAssetsRef: "",
    loading: {
      users: false,
      movies: false,
      // addresses: false,
      // streamables: false,
      // failedAssets: false,
      // dislikedMovies: false,
      // magicMovies: false,
      // purchases: false,
      // stripeCustomers: false,
      // uploadAssets: false,
    }
  },
  getters: {},
  mutations: {
    TOGGLE_LOADING_STATE(state, { key, value }) {
      state.loading[key] = value;
    },
    // DANGER WILL ROBINSON!!
    UPDATE_USER(state, user) {
      const theUserRef = state.allRef.child(user[`.key`]);
      const updated = Object.assign({}, user);
      delete updated[".key"];

      theUserRef.update({
        ...updated
      });
    },
    SET_USERS_ALL(state, obj) {
      state.all = obj;
    },
    SET_USERS_REF(state, ref) {
      state.allRef = ref;
    },
    SET_MOVIES_REF(state, ref) {
      state.filesRef = ref;
    }
  },
  actions: {
    setUsersRef: firebaseAction(({ bindFirebaseRef, commit }, { ref }) => {
      commit("TOGGLE_LOADING_STATE", { key: "users", value: true });
      // Don't use vuexfire binding. We want to use the native obj
      // instead of an array. This gives us much faster lookups.
      // bindFirebaseRef("all", ref);
      commit("SET_USERS_REF", ref);
      ref.on("value", snapshot => {
        commit("SET_USERS_ALL", snapshot.val());
        commit("TOGGLE_LOADING_STATE", { key: "users", value: false });
      });
    }),
    setUserRef: firebaseAction(({ bindFirebaseRef, commit }, { ref }) => {
      commit("TOGGLE_LOADING_STATE", { key: "user", value: true });
      bindFirebaseRef("user", ref);
      commit("SET_USER_REF", ref);
      ref.on("value", snapshot => {
        console.log( {value: snapshot.val()})
        commit("TOGGLE_LOADING_STATE", { key: "user", value: false });
      });
    }),
    setMoviesByUserRef: firebaseAction(
      ({ bindFirebaseRef, commit }, { ref }) => {
        commit("TOGGLE_LOADING_STATE", { key: "movies", value: true });
        bindFirebaseRef("files", ref);
        commit("SET_MOVIES_REF", ref);
        ref.on("value", () => {
          commit("TOGGLE_LOADING_STATE", { key: "movies", value: false });
        });
      }
    )
  }
};
