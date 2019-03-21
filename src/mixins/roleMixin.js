import { mapState } from "vuex";
import { get } from "lodash";

import { auth } from "../firebase";

export default {
  computed: {
    ...mapState({
      refs: state => state.refs,
      users: state => state.users.all
    }),
    consoleRole() {
      const user = this.$store.getters["users/userById"](
        get(auth, ["currentUser", "uid"])
      );
      return get(user, "consoleRole");
    }
  },
  created() {
    this.$store.dispatch("users/setUsers", {
      ref: this.refs.USERS
      // limit: 1500 // in case we need to limit someday.
    });
  }
};
