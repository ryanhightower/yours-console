<template>
  <div class="purchases container is-fluid">
    <h1 style="font-weight:bold; font-size:2em;">Purchases</h1>
    <hr />
    <a class="button" @click="show.controls = !show.controls"
      >{{ show.controls ? "Hide" : "Show" }} Controls
    </a>
    <div class="controls" v-show="show.controls">
      <div class="search" style="padding: 0 30px;">
        <b-field label="Search">
          <b-input v-model="searchText"></b-input>
        </b-field>
        <div class="field">
          <b-field label="Search using: ">
            <span
              v-for="(field, idx) in Object.keys(filterBy)"
              :key="idx"
              style="margin-left: 10px;"
            >
              <b-checkbox v-model="filterBy[field]">{{ field }}</b-checkbox>
            </span>
          </b-field>
        </div>
        <div class="field">
          <b-field label="Columns: ">
            <span
              v-for="(column, idx) in Object.keys(show.columns)"
              :key="idx"
              style="margin-left: 10px;"
            >
              <b-checkbox v-model="show.columns[column]">{{
                column
              }}</b-checkbox>
            </span>
          </b-field>
        </div>
      </div>
    </div>

    <div
      class="tabs"
      style="display:flex; justify-content: center; flex-wrap: wrap; padding: 1px;"
      >
      <a
        class="button"
        :class="{ 'is-primary': searchText == '' }"
        @click.prevent="setSearchText('')"
        >All</a
      >
      <a
        class="button"
        :class="{ 'is-primary': searchText == 'initial' }"
        @click.prevent="setSearchText('initial')"
        >Uploading</a
      >
      <a
        class="button"
        :class="{ 'is-primary': searchText == 'production' }"
        @click.prevent="setSearchText('production')"
        >Production</a
      >
      <a
        class="button"
        :class="{ 'is-primary': searchText == 'authoring|producerApproved' }"
        @click.prevent="setSearchText('authoring|producerApproved')"
        >Authoring</a
      >
      <a
        class="button"
        :class="{ 'is-primary': searchText == 'authoring|producerApproved|submittedForburn' }"
        @click.prevent="setSearchText('authoring|producerApproved|submittedForburn')"
        >Fulfillment</a
      >
      <a
        class="button"
        :class="{ 'is-primary': searchText == 'shipping' }"
        @click.prevent="setSearchText('shipping')"
        >Shipping</a
      >
      <a
        class="button"
        :class="{ 'is-primary': searchText == 'arrived|complete' }"
        @click.prevent="setSearchText('arrived|complete')"
        >Complete</a
      >
      <a
        class="button"
        :class="{ 'is-primary': searchText == 'archive' }"
        @click.prevent="setSearchText('archive')"
        >Archive</a
      >
      <a
        class="button"
        :class="{ 'is-primary': false }"
        @click.prevent="setSearchText(getStalledPurchasesSearchText())"
        >Stalled</a
      >
      <a
        class="button"
        :class="{
          'is-primary':
            searchText ==
            'initial|readyForProduction|inProduction|producerApproved|authoring|submittedForBurn'
        }"
        @click.prevent="
          setSearchText(
            'initial|readyForProduction|inProduction|producerApproved|authoring|submittedForBurn'
          )
        "
        >All Current</a
      >
    </div>

    <h4>count: {{ filteredPurchases.length }}</h4>
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
          field="billedStatus"
          label="Icons"
          :visible="show.columns.icons"
        >
          <div>
            <!-- <b-icon
              icon="dollar-sign"
              type="is-success"
              size="is-small"
              v-show="props.row.chargeId != undefined"
              title="Billed successfully"
            ></b-icon> -->
            <b-icon
              icon="exclamation-triangle"
              type="is-warning"
              size="is-small"
              v-show="props.row.billingError"
              title="Error when billing"
            ></b-icon>
            <!-- NOTE: I don't know if we set "usedSubscription" any more -->
            <b-icon
              icon="infinity"
              type="is-success"
              size="is-small"
              v-show="props.row.usedSubscription"
              title="Used subscription"
            ></b-icon>
            <b-icon
              icon="infinity"
              type="is-success"
              size="is-small"
              v-show="props.row.discQuantity === 0"
              title="Streaming only"
            ></b-icon>
            <b-icon
              icon="star"
              type="is-success"
              size="is-small"
              v-show="props.row.usedCredit"
              title="Used a credit"
            ></b-icon>
            <b-icon
              icon="users"
              type="is-success"
              size="is-small"
              v-show="props.row.usedPromo"
              title="Used a promo code"
            ></b-icon>
            <b-icon
              icon="times"
              type="is-danger"
              v-show="!props.row.billingComplete && !props.row.billingError"
              title="Was not billed"
            ></b-icon>
            <b-tooltip :label="`Qty: ${props.row.discQuantity}`">
            <b-icon
              icon="compact-disc"
                :type="props.row.discQuantity > 1 ? 'is-warning' : 'is-success'"
              v-show="props.row.discQuantity"
              :title="`Qty: ${props.row.discQuantity}`"
            ></b-icon>
            </b-tooltip>
          </div>
        </b-table-column>

        <b-table-column field="files" label="Files" :visible="true">
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
      </template>

      <template slot="detail" slot-scope="props">
        <h1>Set Status</h1>
        <a
          class="button is-success"
          @click="setStatus({ key: props.row[`.key`], status: `arrived` })"
          >Arrived</a
        >
        <a
          class="button is-success"
          @click="setStatus({ key: props.row[`.key`], status: `complete` })"
          >Complete</a
        >
        <a
          class="button is-warning"
          @click="setStatus({ key: props.row[`.key`], status: `test` })"
          >Testing</a
        >
        <a
          class="button is-danger"
          @click="setStatus({ key: props.row[`.key`], status: `archive` })"
          >Archive</a
        >

        <pre v-show="props.row.trackingNumber">Shipping:
tracking: <a :href="`https://tools.usps.com/go/TrackConfirmAction?tLabels=${props.row.trackingNumber}`" target="_blank">{{ props.row.trackingNumber }}</a>
status: {{ pick(props.row,['shippingStatus']) }}</pre>

        <div class="notes">
          <b-field label="Disc Quantity">
            <b-input type="number" v-model="props.row.discQuantity"></b-input>
          </b-field>
          <textarea
            name="notes"
            cols="100"
            rows="10"
            v-model="props.row.notes"
          ></textarea
          ><br />

          <b-field>
            <b-checkbox v-model="props.row.needsAttention"
              type="is-danger">Needs Attention! </b-checkbox>
          <a @click="savePurchase(props.row)" class="button is-primary"
              >Save Details</a>
          </b-field>

          <b-collapse :open="false">
            <button class="button is-primary" slot="trigger">Debug</button>
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
import { mapState } from "vuex";
import { auth } from "../firebase";
import purchasesMixin from "@/mixins/purchasesMixin";

export default {
  components: {},
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
        controls: false,
        columns: {
          thumbnail: true,
          id: true,
          todo: true,
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
      defaultSortBy: "date_placed",
      defaultSortOrder: "desc",
      isPaginated: true,
      perPage: 50
    };
  },
  computed: {
    ...mapState({
      files: state => state.purchases.filesByPurchase,
      loadingFiles: state => state.purchases.loading.filesByPurchase
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

    getStalledPurchasesSearchText() {
      this.searchText = ""; // clear filter first so it searches all purchases.
      return this.filteredPurchases
        .filter(purchase => this.isStalled(purchase))
        .map(purchase => purchase[`.key`])
        .join("|");
    },

    searchAllCurrent() {
      Object.keys(this.filterBy).map(key => {
        if (key === "status") return (this.filterBy[key] = true);
        return (this.filterBy[key] = false);
      });
      this.setSearchText("[^arrived|complete|archive|test]");
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
