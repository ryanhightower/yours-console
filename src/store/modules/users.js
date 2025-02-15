import { firebaseAction } from "vuexfire";

export default {
  namespaced: true,
  state: {
    all: {}, // Use native firebase object instead of array
    // user: [],
    // // Might need?
    // movies: [],
    userAddresses: [],
    // streamables: [],
    // failedAssets: [],
    // dislikedMovies: [],
    // magicMovies: [],
    // purchases: [],
    stripeCustomers: {},
    // uploadAssets: [],
    refs: {
      users: null,
      stripeCustomers: null
      // moviesByUser: null,
      // user: null
    },
    index: {
      users: [], // use this later for garbage collection.
      // stripeCustomers: [] // use this later for garbage collection.
      userAddresses: []
    },
    loading: {
      users: false,
      // user: false,
      // moviesByUser: false
      userAddresses: false,
      // streamables: false,
      // failedAssets: false,
      // dislikedMovies: false,
      // magicMovies: false,
      // purchases: false,
      stripeCustomers: false
      // uploadAssets: false,
    },
    MAX_USERS_LENGTH: 10
  },
  getters: {
    userById: state => userId => {
      return state.all[userId] || null;
    }
  },
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
      // console.log("ADD_USER", { key, user });
      // Vue.set(state.all, key, user);
      const users = Object.assign({}, state.all);
      users[key] = user;
      if (!state.index.users.includes(key)) state.index.users.push(key);
      if (state.index.users.length > state.MAX_USERS_LENGTH) {
        // garbage collection
        const id = state.index.users.shift();
        // console.log("GARBAGE", { id });
        delete users[id];
      }
      state.all = users;
    },
    ADD_STRIPE_CUSTOMER(state, { key, user }) {
      // console.log("ADD_STRIPE_CUSTOMER", { key, user });
      // Vue.set(state.all, key, user);
      const users = Object.assign({}, state.stripeCustomers);
      users[key] = user;
      if (!state.index.users.includes(key)) state.index.users.push(key);
      if (state.index.users.length > state.MAX_USERS_LENGTH) {
        // garbage collection
        const id = state.index.users.shift();
        // console.log("GARBAGE", { id });
        delete users[id];
      }
      state.stripeCustomers = users;
    },
    ADD_USER_ADDRESSES(state, { key, addresses }) {
      // console.log("ADD_USER_ADDRESSES", { key, user });
      // Vue.set(state.all, key, user);
      const userAddresses = Object.assign({}, state.userAddresses);
      userAddresses[key] = addresses;
      if (!state.index.userAddresses.includes(key))
        state.index.userAddresses.push(key);
      if (state.index.userAddresses.length > state.MAX_USERS_LENGTH) {
        // garbage collection
        const id = state.index.userAddresses.shift();
        // console.log("GARBAGE", { id });
        delete userAddresses[id];
      }
      state.userAddresses = userAddresses;
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
    setUsersRef({ commit }, { ref }) {
      commit("SET_REF", { key: "users", ref });
    },
    setUser({ commit }, { ref, key }) {
      commit("TOGGLE_LOADING_STATE", { key: "users", value: true });
      commit("SET_REF", { key: "user", ref });
      ref.on("value", snap => {
        commit("ADD_USER", { key, user: snap.val() });
        commit("TOGGLE_LOADING_STATE", { key: "users", value: false });
      });
    },
    setStripeCustomer({ commit }, { ref, key }) {
      commit("TOGGLE_LOADING_STATE", { key: "stripeCustomers", value: true });
      commit("SET_REF", { key: "stripeCustomers", ref });
      ref.on("value", snap => {
        commit("ADD_STRIPE_CUSTOMER", { key, user: snap.val() });
        commit("TOGGLE_LOADING_STATE", {
          key: "stripeCustomers",
          value: false
        });
      });
    },
    setUserAddresses({ commit }, { ref, key }) {
      commit("TOGGLE_LOADING_STATE", { key: "addressesByUser", value: true });
      commit("SET_REF", { key: "addressesByUser", ref });
      ref.on("value", snap => {
        commit("ADD_USER_ADDRESSES", { key, addresses: snap.val() });
        commit("TOGGLE_LOADING_STATE", {
          key: "addressesByUser",
          value: false
        });
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
