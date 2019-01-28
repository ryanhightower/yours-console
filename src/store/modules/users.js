import { firebaseAction } from "vuexfire";

export default {
  namespaced: true,
  state: {
    all: {}, // Use native firebase object instead of array
    user: [],
    movies: [],
    // // Might need?
    // addresses: [],
    // streamables: [],
    // failedAssets: [],
    // dislikedMovies: [],
    // magicMovies: [],
    // purchases: [],
    // stripeCustomers: [],
    // uploadAssets: [],
    refs: {
      users: "",
      moviesByUser: ""
    },
    index: {
      users: [] // use this later for garbage collection.
    },
    loading: {
      users: false,
      user: false,
      moviesByUser: false
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
    UPDATE_USER(state, { key, user }) {
      const theUserRef = state.refs.users.child(key);
      const updated = Object.assign({}, user);
      delete updated[".key"];

      theUserRef.update({
        ...updated
      });
    },
    ADD_USER(state, { key, user }) {
      console.log("ADD_USER", { key, user});
      // Vue.set(state.all, key, user);
      const users = Object.assign({}, state.all);
      users[key] = user;
      state.index.users.push(key);
      if (state.index.users.length > 3) {
        // garbage collection
        const id = state.index.users.shift();
        console.log("GARBAGE", {id})
        delete users[id];
      }
      state.all = users;
    },
    SET_USERS_ALL(state, obj) {
      state.all = obj;
    },
    SET_REF(state, { key, ref }) {
      state.refs[key] = ref;
    }
  },
  actions: {
    setUsers: firebaseAction(({ commit }, { ref }) => {
      commit("TOGGLE_LOADING_STATE", { key: "users", value: true });
      commit("SET_REF", { key: "users", ref });
      // Don't use vuexfire binding. We want to use the native obj
      // instead of an array. This gives us much faster lookups.
      // bindFirebaseRef("all", ref);
      ref.on("value", snapshot => {
        commit("SET_USERS_ALL", snapshot.val());
        commit("TOGGLE_LOADING_STATE", { key: "users", value: false });
      });
    }),
    setUser({ commit }, { ref, key }) {
      commit("TOGGLE_LOADING_STATE", { key: "users", value: true });
      commit("SET_REF", { key: "user", ref });
      ref.on("value", snap => {
        commit("ADD_USER", { key, user: snap.val() });
        commit("TOGGLE_LOADING_STATE", { key: "users", value: false });
      });
    },
    setMoviesByUser: firebaseAction(({ bindFirebaseRef, commit }, { ref }) => {
      commit("TOGGLE_LOADING_STATE", { key: "movies", value: true });
      bindFirebaseRef("files", ref);
      commit("SET_REF", { key: "moviesByUser", ref });
      ref.on("value", () => {
        commit("TOGGLE_LOADING_STATE", { key: "movies", value: false });
      });
    })
  }
};
