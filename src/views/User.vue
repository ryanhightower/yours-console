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
    // this.$store.dispatch("users/setUsers", { ref: this.refs.USERS });
    // this.$store.dispatch("users/setMoviesByUser", { ref: this.refs.MOVIES_BY_USER });
    // this.$store.dispatch("purchases/setFilesByPurchase", { ref: this.refs.FILES_BY_PURCHASE });
  },
  watch:{
    '$route': {
      immediate: true,
      handler(to, from) {
        // Fetch user
        if(to.name === "user" && !this.users[to.params.userId])
          this.$store.dispatch("users/setUser", { ref: this.refs.USERS.child(to.params.userId), key: to.params.userId });
      }
    }
  }
};
</script>

<style lang="scss">
a.button { margin: 0 5px; }
.tabs{
  padding: 30px;

}
</style>
