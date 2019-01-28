<template>
  <div class="purchase container is-fluid">
    <h1 style="font-weight:bold; font-size:2em;">User: {{ get(this.user, "name", "") }}</h1>
    <hr>
    <pre>{{ user }}</pre>
    <pre>{{ purchasesByUser }}</pre>
    <b-loading :is-full-page="true" :active.sync="loadingUsers"></b-loading>
  </div>
</template>

<script>
import { get, pick } from 'lodash';
import { mapState } from 'vuex';
import purchaseMixin from '@/mixins/purchaseMixin';

export default {
  components: {},
  mixins: [purchaseMixin],
  data() {
    return {};
  },
  computed: {
    ...mapState({
      users: state => state.users.all,
      loadingUsers: state => state.users.loading.users,
      refs: state => state.refs,
    }),
    user(){
      return this.users[this.userId]
    },
    purchasesByUser(){
      return this.normalizePurchases(this.purchases).filter(purchase => purchase.user.id === this.userId)
    },
    userId(){ return this.$route.params.userId; }
  },
  methods: {
    get,
    pick,
    setStatus(args){
      console.log(`setStatus ${args.status} to ${args.key}`);
      this.$store.commit("purchases/SET_PURCHASE_STATUS", args);
    }
  },
  created() {
    this.$store.dispatch("users/setUsersRef", { ref: db.ref("users") });
    // this.$store.dispatch("users/setMoviesByUserRef", { ref: db.ref("moviesByUser") });
    this.$store.dispatch("purchases/setPurchasesRef", { ref: db.ref("purchases") });
    this.$store.dispatch("purchases/setFilesByPurchaseRef", { ref: db.ref("filesByPurchase") });
  },
};
</script>

<style lang="scss">
a.button { margin: 0 5px; }
.tabs{
  padding: 30px;

}
</style>
