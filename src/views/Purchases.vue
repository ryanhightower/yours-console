<template>
  <div class="purchases container is-fluid">
    <h1>{{ msg }}</h1>
    <a class="button" @click="show.controls = !show.controls">{{ show.controls ? "Hide":"Show" }} Controls </a>
    <div class="controls" v-show="show.controls">
      <div class="search" style="padding: 0 30px;">
        <b-field label="Search">
          <b-input v-model="searchText"></b-input>
        </b-field>
        <div class="field">
          <b-field label="Search using: ">
          <span v-for="(field, idx) in Object.keys(filterBy)" :key="idx" style="margin-left: 10px;">
            <b-checkbox v-model="filterBy[field]">{{ field }}</b-checkbox>
          </span>
          </b-field>
        </div>
        <div class="field">
          <b-field label="Columns: ">

          <span v-for="(column, idx) in Object.keys(show.columns)" :key="idx" style="margin-left: 10px;">
            <b-checkbox v-model="show.columns[column]">{{ column }}</b-checkbox>
          </span>
          </b-field>
        </div>
      </div>
    </div>

    <div class="tabs" style="display:flex; justify-content: center; padding: 1px;">
      <a class="button" @click.prevent="setSearchText('')">All</a>
      <a class="button" @click.prevent="setSearchText('initial')">Uploading</a>
      <a class="button" @click.prevent="setSearchText('production')">Production</a>
      <a class="button" @click.prevent="setSearchText('author')">Authoring</a>
      <a class="button" @click.prevent="setSearchText('authoring|submittedForburn')">Fulfillment</a>
      <a class="button" @click.prevent="setSearchText('shipping')">Shipping</a>
      <a class="button" @click.prevent="setSearchText('arrived|complete')">Complete</a>
      <a class="button" @click.prevent="setSearchText('archive')">Archive</a>
      <a class="button" @click.prevent="setSearchText(getStalledPurchasesSearchText())">Stalled</a>
      <a class="button" @click.prevent="setSearchText('initial|readyForProduction|inProduction|producerApproved|authoring|submittedForBurn')">All Current</a>
    </div>

    <h4>
      count: {{ filteredPurchases.length }}
    </h4>
    <b-table
      :data="filteredPurchases"
      :striped="true"
      :narrowed="true"
      :hoverable="true"
      :loading="loading"
      :mobile-cards="true"
      default-sort="statusSort"
      :default-sort-direction="defaultSortOrder"
      :paginated="isPaginated"
      :per-page="perPage"
      detailed
      :show-detail-icon="true"
      >

      <template slot-scope="props">
        <b-table-column field="statusSort" label="#" width="40" sortable numeric :visible="show.columns.statusSort">
            {{ props.row.statusSort }}
        </b-table-column>

        <b-table-column field=".key" label="ID"  sortable :visible="show.columns.id">
            <router-link :to="{ name: `purchase`, params: { purchaseId: props.row[`.key`] } }">{{ props.row[".key"] }}</router-link>
        </b-table-column>

        <b-table-column field="status" label="Status" :visible="show.columns.status">
          <div>
            <router-link :to="{ name: `purchase`, params: { purchaseId: props.row[`.key`] } }">
              {{ props.row.status }}
            </router-link>
          </div>
        </b-table-column>

        <b-table-column field="chargeId" label="Icons" :visible="show.columns.icons">
          <div>
            <b-icon icon="dollar-sign" type="is-success" size="is-small" v-show="props.row.chargeId != undefined" title="Billed successfully"></b-icon>
            <b-icon icon="exclamation-triangle" type="is-warning" size="is-small" v-show="props.row.billingError" title="Error when billing"></b-icon>
            <b-icon icon="infinity" type="is-success" size="is-small" v-show="props.row.usedSubscription" title="Used subscription"></b-icon>
            <b-icon icon="star" type="is-success" size="is-small" v-show="props.row.usedCredit" title="Used a credit"></b-icon>
            <b-icon icon="users" type="is-success" size="is-small" v-show="props.row.usedPromo" title="Used a promo code"></b-icon>
            <b-icon icon="times" type="is-danger" v-show="!props.row.billingComplete && !props.row.billingError" title="Was not billed"></b-icon>
          </div>
        </b-table-column>

        <b-table-column field="files" label="Files" :visible="true">
          <div :class="{ 'file-count': true, loading: loadingFiles }">
            {{ getFilesRatioText(props.row[`.key`]) }}
            <b-loading :is-full-page="false" :active.sync="loadingFiles"></b-loading>
          </div>
        </b-table-column>

        <b-table-column field="user.email" label="Customer" sortable :visible="show.columns.customer">
          <!-- <router-link :to="{ name: `user`, params: { userId: props.row.user.id } }"> -->
            {{ props.row.user.name }} <br>
            {{ props.row.user.email }}
          <!-- </router-link> -->
        </b-table-column>

        <b-table-column field="dvd_cover_title" label="Cover Title" sortable :visible="show.columns.title">
            <router-link :to="{ name: `purchase`, params: { purchaseId: props.row[`.key`] } }">
              {{ get(props.row, "dvd_cover_title", "") }}
            </router-link>
        </b-table-column>

        <b-table-column field="date_placed" label="Date" centered sortable numeric :visible="show.columns.date">
                {{ new Date(props.row.date_placed * 1000).toLocaleDateString() }}
        </b-table-column>

        <b-table-column field="upload" label="Last Upload" centered :visible="show.columns.lastUpload">
            <span :class="{'is-danger tag': isStalled(props.row) }">
                {{ props.row.lastUploadTimestamp ?
                  new Date(props.row.lastUploadTimestamp * 1000).toLocaleDateString()
                  : "?" }}
            </span>
        </b-table-column>

        <b-table-column field="producer.name" label="Producer" sortable :visible="show.columns.producer">
            <a class="button" @click.prevent="assignProducer(props.row)"><b-icon icon="user-plus" pack="fas"></b-icon></a>
            {{ get(props.row, 'producer.name', '') }}
        </b-table-column>

        <b-table-column field="author.name" label="Author" sortable :visible="show.columns.author">
            <b-icon icon="person_add"></b-icon>
            {{ get(props.row, 'author.name', '') }}
        </b-table-column>
      </template>

      <template slot="detail" slot-scope="props">
        <h1>Set Status</h1>
        <a class="button is-success" @click="setStatus({ key: props.row[`.key`], status: `arrived`})">Arrived</a>
        <a class="button is-success" @click="setStatus({ key: props.row[`.key`], status: `complete`})">Complete</a>
        <a class="button is-warning" @click="setStatus({ key: props.row[`.key`], status: `test`})">Testing</a>
        <a class="button is-danger" @click="setStatus({ key: props.row[`.key`], status: `archive`})">Archive</a>

        <!-- <pre v-show="props.row.labelId">Label ID: {{ props.row.labelId }}</pre> -->
        <pre>tracking: <a :href="`https://tools.usps.com/go/TrackConfirmAction?tLabels=${props.row.trackingNumber}`" target="_blank">{{ props.row.trackingNumber }}</a>
{{ pick(props.row,['discQuantity', 'shippingStatus', 'billingComplete', 'chargeId']) }}</pre>

        <div class="notes">
          <p>isStalled: {{ isStalled(props.row) }}</p>
          <!-- <b-field label="Date">
            <b-input type="number" v-model="props.row.date_placed"></b-input>
          </b-field> -->
          <b-field label="Disc Quantity">
            <b-input type="number" v-model="props.row.discQuantity"></b-input>
          </b-field>
          <textarea name="notes" cols="100" rows="10" v-model="props.row.notes"></textarea><br>
          <a @click="savePurchase(props.row)" class="button is-primary">Save Details</a>
        </div>
      </template>

      <template slot="bottom-left">
        <p style="margin-right: 10px;">items per page: </p>
        <b-select placeholder="Select a character" v-model="perPage">
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </b-select>
      </template>

    </b-table>
  </div>
</template>

<script>
import { get, pick } from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { db, auth } from '../firebase';
import purchaseHelperMixin from '@/mixins/purchaseHelperMixin';

export default {
  components: {},
  mixins: [purchaseHelperMixin],
  data() {
    return {
      msg: 'Welcome to the Purchases Page',
      sortBy: "status",
      searchText: "",
      filterBy: {
        id: true,
        statusSort: false,
        status: true,
        name: true,
        email: true,
        title: false,
        producer: false,
      },
      show: {
        controls: false,
        columns: {
          id: true,
          statusSort: false,
          status: true,
          icons: true,
          customer: true,
          title: true,
          date: true,
          lastUpload: true,
          // updatedAt: false,
          producer: true,
          author: false
        }
      },
      defaultSortBy: "statusSort",
      defaultSortOrder: "asc",
      isPaginated: true,
      perPage: 50,
    };
  },
  computed: {
    ...mapState({
      purchases: state => state.purchases.all,
      files: state => state.purchases.files,
      loading: state => state.purchases.loading.purchases,
      loadingFiles: state => state.purchases.loading.files
    }),
    ...mapGetters({
      isAuthoring: "purchases/isAuthoring",
    }),
    sortedPurchases(){
       const compare1 = (a, b) => {
        if (a[this.sortBy] > b[this.sortBy]) {
          return 1;
        }
        if (a[this.sortBy] < b[this.sortBy]) {
          return -1;
        }
        return 0;
      };
       const compare2 = (a, b) => a.statusSort > b.statusSort ? 1 : a.statusSort < b.statusSort ? -1 : 0;
      if( this.sortBy === "authoring") return this.isAuthoring;
      return this.purchases.concat().sort(compare2);
    },
    showColumns(){
      return Object.keys(this.show.columns);
    },
    filteredPurchases(){
      if(!this.searchText || this.searchText === "") return this.normalizePurchases(this.purchases);

      const search = new RegExp(this.searchText, "i");
      return this.normalizePurchases(this.purchases).filter(purchase => {
        if( this.filterBy.id && get(purchase, ".key", "").match(search) ) return true;
        if( this.filterBy.statusSort && get(purchase, "statusSort", "").toString().match(search) ) return true;
        if( this.filterBy.status && get(purchase, "status", "").match(search) ) return true;
        if( this.filterBy.name && get(purchase, "user.name", "").match(search) ) return true;
        if( this.filterBy.email && get(purchase, "user.email", "").match(search) ) return true;
        if( this.filterBy.producer && get(purchase, "producer.name", "").match(search) ) return true;
        if( this.filterBy.title && get(purchase, "dvd_cover_title", "").match(search) ) return true;
        return false;
      })
    }
  },
  methods: {
    get, // lodash method
    pick, // lodash method
    assignProducer(purchase){
      const user = auth.currentUser;
      purchase.producer = {
        id: user.uid,
        name: user.displayName
      }
      this.savePurchase(purchase);
    },

    getStalledPurchasesSearchText(){
      this.searchText = ""; // clear filter first so it searches all purchases.
      return this.filteredPurchases
        .filter( purchase => this.isStalled(purchase) )
        .map( purchase => purchase[`.key`])
        .join("|")
    },

    searchAllCurrent(){
      Object.keys(this.filterBy).map(key => {
        if(key === "status") return this.filterBy[key] = true;
        return this.filterBy[key] = false;
      });
      this.setSearchText('[^arrived|complete|archive|test]')
    },
    setSearchText(text){
        this.searchText = text
    },
    setStatus({key, status}){
      console.log(`setStatus ${status} to ${key}`);
      this.$store.commit("purchases/SET_PURCHASE_STATUS", { key, status });
    },
    savePurchase(purchase){
      // console.log(`savePurchase ${JSON.stringify(purchase)}`);
      this.$store.commit("purchases/UPDATE_PURCHASE", purchase)
    },
    isStalled(purchase){
      // stalled if still in uploading status
      // AND lastUpload was more than 2 days ago
      const date = new Date();
      const twoDaysAgo = date.setDate(date.getDate() - 2);
      return purchase.status === "initial" && purchase.lastUploadTimestamp * 1000 < twoDaysAgo;
    },
    getFilesForPurchase(purchaseId){
      return this.files.filter(file => file[`.key`] === purchaseId)[0];
    },
    getFilesRatioText(purchaseId){
      const files = this.getFilesForPurchase(purchaseId);
      const numUploaded = Object.keys(this.get(files, 'uploaded',{})).length;
      const numSelected = Object.keys(this.get(files, 'selected',{})).length;
      return `${numUploaded} / ${numSelected}`
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
.tabs{ padding: 30px; }
.file-count {
  position: relative;
  white-space: nowrap;
  &.loading { font-size:10px; padding: 1em; }
}
</style>
