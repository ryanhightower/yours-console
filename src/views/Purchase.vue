<template>
  <div class="purchase container is-fluid">
    <h1>Purchase: {{ $route.params.purchaseId }}</h1>
    <pre>{{ purchase }}</pre>
  </div>
</template>

<script>
import { get, pick } from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { db } from '../firebase';
import purchasesMixin from '@/mixins/purchasesMixin';

export default {
  components: {},
  mixins: [purchasesMixin],
  data() {
    return {

    };
  },
  computed: {
    ...mapState({
      purchases: state => state.purchases.all,
      files: state => state.purchases.files,
      loading: state => state.purchases.loading.purchases,
      loadingFiles: state => state.purchases.loading.files
    }),
    purchase(){
      return this.purchases.filter(purchase => purchase[".key"] === this.$route.params.purchaseId)[0]
    },
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
