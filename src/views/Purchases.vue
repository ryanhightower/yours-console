<template>
  <div class="purchases container is-fluid">
    <h1 style="font-weight:bold; font-size:2em;">Purchases</h1>
    <hr />

    <b-collapse :open="true">

        <h4 class="title is-5" slot="trigger" slot-scope="props">
          <b-icon icon="caret-right" :class="{ 'fa-rotate-90': props.open }"></b-icon>
          Search
        </h4>
        <b-field label="">
          <b-input v-model="searchText"></b-input>
        </b-field>

        <b-collapse :open="false">
          <h4 class="title is-6" slot="trigger" slot-scope="props">
            <b-icon icon="caret-right" :class="{ 'fa-rotate-90': props.open }"></b-icon>
            Search using
          </h4>
          <span
            v-for="(field, idx) in Object.keys(filterBy)"
            :key="idx"
            style="margin-left: 10px;"
          >
            <b-checkbox v-model="filterBy[field]">{{ field }}</b-checkbox>
          </span>
        </b-collapse>

        <a @click.prevent="show.scanner = true" class="button is-primary">Open Scanner</a>
        <b-modal :active.sync="show.scanner">
          <scanner @decode="handleScan"></scanner>
        </b-modal>

    </b-collapse>



    <!-- </div> -->

    <hr>

    <div
      class="tabs"
      style="display:flex; justify-content: center; flex-wrap: wrap; padding: 1px;"
      >

      <span
        v-for="(button, idx) in [
          { label: `All`, searchText: `` },
          { label: `Uploading`, searchText: `initial` },
          { label: `Production`, searchText: `production` },
          { label: `Authoring`, searchText: `authoring|producerApproved` },
          { label: `Fulfillment`, searchText: `authored|submittedForburn` },
          { label: `Shipping`, searchText: `shipping` },
          { label: `Complete`, searchText: `arrived|complete` },
          { label: `Archive`, searchText: `archive` },
          // { label: `Stalled`, searchText: getStalledPurchasesSearchText() },
          { label: `All Current`, searchText: `initial|readyForProduction|inProduction|producerApproved|authoring|submittedForBurn` },
        ]"
        :key="idx"
      >
        <a
          class="button"
          :class="{ 'is-primary': searchText == button.searchText }"
          @click.prevent="setSearchText(button.searchText)"
          >{{ button.label }}</a
          >
      </span>

    </div>

    <h4 class="title is-5">count: {{ filteredPurchases.length }}</h4>
    <b-collapse :open="false">
      <h4 class="title is-6" slot="trigger" slot-scope="props">
        <b-icon icon="caret-right" :class="{ 'fa-rotate-90': props.open }"></b-icon>
        Show/Hide Columns
      </h4>
      <span
        v-for="(column, idx) in Object.keys(show.columns)"
        :key="idx"
        style="margin-left: 10px;"
      >
        <b-checkbox v-model="show.columns[column]">{{
          column
        }}</b-checkbox>
      </span>
    </b-collapse>
    <b-table
      :data="filteredPurchases"
      :striped="true"
      :narrowed="true"
      :hoverable="true"
      :loading="loadingPurchases"
      :mobile-cards="true"
      :default-sort="defaultSortBy"
      :default-sort-direction="defaultSortOrder"
      :paginated="isPaginated"
      :per-page="perPage"
      detailed
      :show-detail-icon="true"
      >

      <template slot-scope="props">
        <b-table-column
          field="statusSort"
          label="#"
          width="40"
          sortable
          numeric
          :visible="show.columns.statusSort"
        >
          {{ props.row.statusSort }}
        </b-table-column>

        <b-table-column
          field="coverThumbnailUrl"
          label="Thumb"
          :visible="show.columns.thumbnail"
        >
          <img :src="props.row.coverThumbnailUrl" width="45" height="45">
        </b-table-column>

        <b-table-column
          field="key"
          label="ID"
          sortable
          :visible="show.columns.id"
        >
          <router-link
            :to="{
              name: `purchase`,
              params: { purchaseId: props.row[`.key`] }
            }"
            >{{ props.row[".key"] }}
          </router-link>
          <a :href="`https://console.yours.co/purchase/${props.row[`.key`]}`" target="_blank" class="is-pulled-right">
            <b-icon size="is-small" icon="external-link-alt"></b-icon>
          </a>
        </b-table-column>

        <b-table-column
          field="needsAttention"
          label="!"
          :meta="{ icon:'exclamation-triangle', type:'is-danger' }"
          :visible="show.columns.todo"
        >
         <b-icon
              icon="exclamation-triangle"
              type="is-danger"
              size="is-small"
              v-show="props.row.needsAttention"
              :title="`NOTES: ${props.row.notes}`"
            ></b-icon>
        </b-table-column>

        <b-table-column
          field="status"
          label="Status"
          :visible="show.columns.status"
        >
          <div>
            <router-link
              :to="{
                name: `purchase`,
                params: { purchaseId: props.row[`.key`] }
              }"
            >
              {{ props.row.status }}
            </router-link>
          </div>
        </b-table-column>

        <b-table-column
          label="Icons"
          :visible="show.columns.icons"
        >
          <div>
            <span
              v-for="(icon, idx) in [
                { key: props.row.deviceMfr === `Apple` ? `apple` : `android`, type: `is-primary`, title: props.row.deviceModel, condition: props.row.deviceMfr, size: ``, pack: `fab` },
                { key: `times`, type: `is-danger`, title: `Was not billed`, condition: !props.row.billingComplete && !props.row.billingError },
                { key: `exclamation-triangle`, type: `is-warning`, title: `Error when billing`, condition: props.row.billingError },
                { key: `star`, type: `is-success`, title: `Used a credit`, condition: props.row.usedCredit },
                { key: `users`, type: `is-success`, title: `Used a promo code`, condition: props.row.usedPromo },
                { key: `infinity`, type: `is-success`, title: `Streaming only`, condition: props.row.discQuantity === 0 },
                { key: `compact-disc`, type: props.row.discQuantity > 1 ? `is-warning` : `is-success`, title: `Qty: ${props.row.discQuantity}`, condition: props.row.discQuantity, size: `` },
              ]"
              :key="idx"
              >
              <b-tooltip :label="icon.title">
                <b-icon
                  :icon="icon.key"
                  :type="icon.type"
                  :title="icon.title"
                  :size="get(icon, 'size', 'is-small')"
                  :pack="get(icon, 'pack', 'fas')"
                  v-if="icon.condition"
                  ></b-icon>
              </b-tooltip>
            </span>

          </div>
        </b-table-column>

        <b-table-column field="files" label="Files" :visible="show.columns.files">
          <div :class="{ 'file-count': true, loading: loadingFiles }">
            {{ getFilesRatioText(props.row[`.key`]) }}
            <b-loading
              :is-full-page="false"
              :active.sync="loadingFiles"
            ></b-loading>
          </div>
        </b-table-column>

        <b-table-column
          field="user.email"
          label="Customer"
          sortable
          :visible="show.columns.customer"
        >
          <router-link
            :to="{ name: `user`, params: { userId: props.row.user.id } }"
            >
            {{ props.row.user.name }}
          </router-link>

          <a :href="`https://console.yours.co/user/${props.row.user.id}`" target="_blank" class="is-pulled-right"><b-icon icon="external-link-alt" size="is-small"></b-icon></a>
          <br />
          <a @click="setSearchText(props.row.user.email)">
            {{ props.row.user.email }}
          </a>
        </b-table-column>

        <b-table-column
          field="dvd_cover_title"
          label="Cover Title"
          sortable
          :visible="show.columns.title"
        >
          <router-link
            :to="{
              name: `purchase`,
              params: { purchaseId: props.row[`.key`] }
            }"
          >
            {{ get(props.row, "dvd_cover_title", "") }}
          </router-link>
        </b-table-column>

        <b-table-column
          field="date_placed"
          label="Date"
          centered
          sortable
          numeric
          :visible="show.columns.date"
        >
          {{ new Date(props.row.date_placed * 1000).toLocaleDateString() }}
        </b-table-column>

        <b-table-column
          field="lastUpload"
          label="Last Upload"
          centered
          :visible="show.columns.lastUpload"
        >
          <span :class="{ 'is-danger tag': isStalled(props.row) }">
            {{
              props.row.lastUploadTimestamp
                ? new Date(
                    props.row.lastUploadTimestamp * 1000
                  ).toLocaleDateString()
                : "?"
            }}
          </span>
        </b-table-column>

        <b-table-column
          field="producer.name"
          label="Producer"
          sortable
          :visible="show.columns.producer"
        >
          <a class="button" @click.prevent="assign({ role: `producer`, purchase: props.row })"
            ><b-icon icon="user-plus"></b-icon
          ></a>
          {{ get(props.row, "producer.name", "") }}
        </b-table-column>

        <b-table-column
          field="author.name"
          label="Author"
          sortable
          :visible="show.columns.author"
        >
          <a class="button" @click.prevent="assign({ role: `author`, purchase: props.row })"
            ><b-icon icon="user-plus"></b-icon
          ></a>
          {{ get(props.row, "author.name", "") }}
        </b-table-column>

        <b-table-column
          label="Print"
          width="40"
          :visible="show.columns.author"
        >
          <a class="button" :href="props.row.dvdCoverUrl" :download="`cover-${props.row.key}.png`" target="_blank" v-show="props.row.dvdCoverUrl"
            ><b-icon icon="print"></b-icon
          ></a>
        </b-table-column>

        <b-table-column
          label="Burn"
          width="40"
          :visible="show.columns.author"
        >
          <a class="button" @click.prevent="sendToAru(props.row)" v-if="props.row.status === 'authored'"
            ><b-icon icon="fire"></b-icon
          ></a>
        </b-table-column>
      </template>

      <template slot="detail" slot-scope="props">



        <div class="details">
          <div class="quick-actions">

          <span>
            <h6 class="title is-6">Quick Actions</h6>
          </span>

              <a class="button" @click="sendToAuthor(props.row.key)" >
                <b-icon icon="robot"></b-icon>
                <span>Send to Authoring</span>
                <b-loading
                  :is-full-page="false"
                  :active.sync="loading.author"
                ></b-loading>
              </a>
              <a
                v-for="(button, idx) in [
                  { label: 'Arrived', status: 'arrived', type: 'is-success' },
                  { label: 'Complete', status: 'complete', type: 'is-success' },
                  { label: 'Testing', status: 'testing', type: 'is-warning' },
                  { label: 'Archive', status: 'archive', type: 'is-danger' },
                ]"
                :key="idx"
                :class="[`button`, button.type]"
                @click="setStatus({ key: props.row[`.key`], status: button.status })"
                >{{ button.label }}</a>
          </div>

          <b-field label="Status">
            <b-select placeholder="Select a status" v-model="props.row.status">
              <option
                v-for="(option, idx) in statuses"
                :value="option"
                :key="idx">
                {{ option }}
              </option>
            </b-select>
          </b-field>

          <b-field label="Disc Quantity">
            <b-input type="number" v-model="props.row.discQuantity"></b-input>
          </b-field>

          <b-field label="Notes">
            <b-input type="textarea" v-model="props.row.notes" placeholder="Ex. [2019-02-05] (Ryan) My note here..."></b-input>
          </b-field>

          <b-field>
          <a @click="savePurchase(props.row)" class="button is-primary"
              >Save Details</a>
          <b-checkbox v-model="props.row.needsAttention"
              type="is-danger">Needs Attention! </b-checkbox>
          </b-field>

          <b-collapse :open="false">
            <button class="button" slot="trigger">Debug</button>
            <pre>{{ props.row }}</pre>
          </b-collapse>

        </div>
      </template>

      <template slot="bottom-left">
        <p style="margin-right: 10px;">items per page:</p>
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
import { get, pick } from "lodash";
import { mapState, mapGetters } from "vuex";
import api from "../services/api";
import { auth } from "../firebase";
import purchasesMixin from "@/mixins/purchasesMixin";

export default {
  name: "Purchases",
  components: {
    Scanner: () => import("@/views/Scanner"),
  },
  // NOTE: If you don't know where something is, check the purchasesMixin
  mixins: [purchasesMixin],
  data() {
    return {
      sortBy: "status",
      searchText: "",
      filterBy: {
        id: true,
        statusSort: false,
        status: true,
        name: true,
        email: true,
        title: false,
        producer: false
      },
      show: {
        columns: {
          thumbnail: true,
          id: true,
          todo: true,
          statusSort: false,
          status: true,
          icons: true,
          files: true,
          customer: true,
          title: true,
          date: true,
          lastUpload: true,
          // updatedAt: false,
          producer: true,
          author: false
        },
        scanner: false
      },
      loading: {
        author: false
      },
      defaultSortBy: "date_placed",
      defaultSortOrder: "desc",
      isPaginated: true,
      perPage: 25
    };
  },
  computed: {
    ...mapState({
      files: state => state.purchases.filesByPurchase,
      loadingFiles: state => state.purchases.loading.filesByPurchase
    }),
    ...mapGetters({
      statuses: 'purchases/statuses',
    }),
    filteredPurchases() {
      if (!this.searchText || this.searchText === "")
        return this.normalizePurchases(this.purchases);

      const search = new RegExp(this.searchText, "i");
      return this.normalizePurchases(this.purchases).filter(purchase => {
        if (this.filterBy.id && get(purchase, ".key", "").match(search))
          return true;
        if (
          this.filterBy.statusSort &&
          get(purchase, "statusSort", "")
            .toString()
            .match(search)
        )
          return true;
        if (this.filterBy.status && get(purchase, "status", "").match(search))
          return true;
        if (this.filterBy.name && get(purchase, "user.name", "").match(search))
          return true;
        if (
          this.filterBy.email &&
          get(purchase, "user.email", "").match(search)
        )
          return true;
        if (
          this.filterBy.producer &&
          get(purchase, "producer.name", "").match(search)
        )
          return true;
        if (
          this.filterBy.title &&
          get(purchase, "dvd_cover_title", "").match(search)
        )
          return true;
        if (
          this.filterBy.lastUpload &&
          get(purchase, "lastUpload", "none").match(search)
        )
          return true;
        return false;
      });
    }
  },
  methods: {
    get, // lodash method
    pick, // lodash method
    assign({ role, purchase }) {
      const user = auth.currentUser;
      if(!['producer', 'author'].includes(role)) return;
      purchase[role] = {
        id: user.uid,
        name: user.displayName
      };
      this.savePurchase(purchase);
    },

    handleScan(value){
      console.log("scanned", { value });
      this.setSearchText(value);
      this.show.scanner = false;
    },

    scannerModal(){
      this.$modal.open({
        parent: this,
        component: () => import("@/views/Scanner"),
        hasModalCard: true
      })
    },



    sendToAuthor(purchaseId) {
      this.loading.author = true;
      const options = {
        bitRate: 4000,
        assetsOnly: false
      }; // TODO: implement auto-author options

      api.post(
          `/purchases/${purchaseId}/autoAuthor`,
          options
      )
        .then(() => {
          this.loading.author = false;
        })
        .catch( err => {
          this.loading.author = false;
        })
    },

    getStalledPurchasesSearchText() {
      this.searchText = ""; // clear filter first so it searches all purchases.
      return this.filteredPurchases
        .filter(purchase => this.isStalled(purchase))
        .map(purchase => purchase[`.key`])
        .join("|");
    sendToAru(purchase) {
      this.setStatus({ key: purchase[".key"], status: "submittedForBurn" });
      purchase.authored = true;
      this.savePurchase(purchase);
      this.$store.commit("SEND_TO_ARU", purchase);
    },
    setSearchText(text) {
      if (this.searchText === text) return (this.searchText = "");
      this.searchText = text;
    },
    setStatus({ key, status }) {
      // console.log(`setStatus ${status} to ${key}`);
      this.$store.commit("purchases/SET_PURCHASE_STATUS", { key, status });
    },
    savePurchase(purchase) {
      // console.log(`savePurchase ${JSON.stringify(purchase)}`);
      this.$store.commit("purchases/UPDATE_PURCHASE", purchase);
    },
    isStalled(purchase) {
      // stalled if still in uploading status
      // AND lastUpload was more than 2 days ago
      const date = new Date();
      const twoDaysAgo = date.setDate(date.getDate() - 2);
      return (
        purchase.status === "initial" &&
        purchase.lastUploadTimestamp * 1000 < twoDaysAgo
      );
    },
    getFilesForPurchase(purchaseId) {
      return this.files.filter(file => file[`.key`] === purchaseId)[0];
    },
    getFilesRatioText(purchaseId) {
      const files = this.getFilesForPurchase(purchaseId);
      const numUploaded = Object.keys(this.get(files, "uploaded", {})).length;
      const numSelected = Object.keys(this.get(files, "selected", {})).length;
      return `${numUploaded} / ${numSelected}`;
    }
  }
};
</script>

<style lang="scss">
.table-wrapper { overflow: scroll; }
.table th {
    vertical-align: bottom;
}
a.button {
  margin: 5px;
}
.tabs {
  padding: 30px;
}
.file-count {
  position: relative;
  white-space: nowrap;
  &.loading {
    font-size: 10px;
    padding: 1em;
  }
}
</style>
