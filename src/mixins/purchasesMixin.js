import { mapState } from "vuex";
import { get } from "lodash";

export default {
  computed: {
    ...mapState({
      refs: state => state.refs,
      purchases: state => state.purchases.all,
      loadingPurchases: state => state.purchases.loading.purchases
    })
  },
  methods: {
    normalizePurchases(purchases) {
      const emptyUser = { id: "", name: "", email: "" };
      return purchases.concat().map(purchase => {
        purchase.key = purchase[".key"]; // NOTE: REMEMBER TO REMOVE THIS PROP BEFORE SENDING BACK TO FIREBASE!
        purchase.producer = get(purchase, "producer", emptyUser);
        purchase.author = get(purchase, "author", emptyUser);
        purchase.user = get(purchase, "user", emptyUser);
        return purchase;
      });
    }
  },
  created() {
    this.$store.dispatch("purchases/setPurchases", {
      ref: this.refs.PURCHASES,
      // limit: 1500 // in case we need to limit someday.
    });
    // this.$store.dispatch("purchases/setFilesByPurchase", {
    //   ref: this.refs.FILES_BY_PURCHASE
    // });
  }
};
