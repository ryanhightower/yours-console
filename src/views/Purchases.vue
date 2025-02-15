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
          { label: `Uploading`, searchText: getSearchStatusesForGroup('uploading') },
          { label: `Production`, searchText: getSearchStatusesForGroup('production') },
          { label: `Authoring`, searchText: getSearchStatusesForGroup('authoring') },
          { label: `Fulfillment`, searchText: getSearchStatusesForGroup('fulfillment') },
          { label: `Shipping`, searchText: getSearchStatusesForGroup('shipping') },
          { label: `All Current`, searchText: getSearchStatusesForGroup('all current') },
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
          <!-- <router-link
            :to="{
              name: `purchase`,
              params: { purchaseId: props.row[`.key`] }
            }"
            @dblclick.prevent="copyToClipboard(props.row[`key`])"
            >{{ props.row[".key"] }}
          </router-link> -->
          <a
            @click.prevent="copyToClipboard(props.row[`key`])"
            >{{ props.row[".key"] }}
          </a>
          <a :href="`${consoleUrl}/purchase/${props.row[`.key`]}`" target="_blank" class="is-pulled-right">
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

        <b-table-column class="files-column" field="uploadProgressPercent" label="Files" :visible="show.columns.files">
          <b-tooltip
            class="is-info"
            :label="'' + props.row.uploadProgressPercent + '% of ' + prettySize(props.row.estimatedTotalFileSizeBytes)"
            v-if="props.row.status == 'initial'">
            <progress
              max="100"
              class="file-progress"
              :value="props.row.uploadProgressPercent"
              :title="'' + props.row.uploadProgressPercent + '% of ' + prettySize(props.row.estimatedTotalFileSizeBytes)">
            </progress>
          </b-tooltip>
          <div :class="{ 'file-count': true }">
            {{ props.row.uploadedFileCount }} / {{ props.row.fileCount }}
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

          <a :href="`${consoleUrl}/user/${props.row.user.id}`" target="_blank" class="is-pulled-right"><b-icon icon="external-link-alt" size="is-small"></b-icon></a>
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
          <a class="button" :href="props.row.dvdCoverUrl" target="_blank" v-show="props.row.dvdCoverUrl">
            <b-icon icon="print"></b-icon>
          </a>
        </b-table-column>

        <b-table-column
          label="Burn"
          width="40"
          :visible="show.columns.author"
        >
          <a class="button" @click.prevent="sendToAru(props.row)" v-if="props.row.status === 'authored' || props.row.status === 'burnError'"
            ><b-icon icon="fire"></b-icon
          ></a>
        </b-table-column>
      </template>


      <!-- DETAILS -->

      <template slot="detail" slot-scope="props">
        <div class="row-details">
          <section class="quick-actions"
            style="margin-bottom: 20px;"
            v-if="consoleRole == 'admin'">
            <span>
              <h6 class="title is-6">Quick Actions</h6>
            </span>
            <div class="buttons">
              <button
                v-if="props.row.status === 'initial' && props.row.uploadedFileCount >= 6"
                class="button"
                @click="giveUpOnUploading(props.row)"
              >
                <span>Fail Remaining Uploads</span>
                <b-loading
                  :is-full-page="false"
                  :active.sync="loading.giveup"
                ></b-loading>
              </button>

              <button class="button" @click="sendToAuthor(props.row.key)" :disabled="props.row.discQuantity <= 0">
                <b-icon icon="robot"></b-icon>
                <span>Send to Authoring</span>
                <b-loading
                  :is-full-page="false"
                  :active.sync="loading.author"
                ></b-loading>
              </button>
              <button
                v-for="(button, idx) in [
                  { label: 'Redo', status: 'redo', type: 'is-primary' },
                  { label: 'Arrived', status: 'arrived', type: 'is-success' },
                  { label: 'Testing', status: 'testing', type: 'is-warning' },
                ]"
                :key="idx"
                :class="[`button`, button.type]"
                @click="setStatus({ purchaseId: props.row[`.key`], status: button.status })"
                >{{ button.label }}
              </button>
              <button
                @click="archivePurchase(props.row[`.key`])"
                class="button is-danger"
                >!! Archive !!
              </button>
            </div>
          </section>

          <section class="purchase-details content">
            <h5>Purchase Details</h5>

            <!-- Admin section -->
            <div class="admin-only" v-if="consoleRole == 'admin'" style="margin-bottom: 12px;">
              <h6 class="is-marginless">Status</h6>
              <b-field>
                <b-select placeholder="Select a status" :value="props.row.status" :ref="`${props.row['.key']}-status-select`">
                  <option
                    v-for="(option, idx) in statuses"
                    :value="option"
                    :key="idx">
                    {{ option }}
                  </option>
                </b-select>
                <p class="control">
                  <button @click="setStatus({ purchaseId: props.row['.key'], status: $refs[`${props.row['.key']}-status-select`].$refs.select.value })" class="button is-primary">Save Status</button>
                </p>
              </b-field>

              <h5 v-if="props.row.trackingNumber">
                Tracking Number<br>
                <a :href="`https://tools.usps.com/go/TrackConfirmAction?tLabels=${props.row.trackingNumber}`" target="_blank">{{props.row.trackingNumber}}</a>
              </h5>

              <div v-if="props.row.shippedWithPurchaseId">
                <h6 class="is-marginless">Is Shipping with Purchase</h6>
                <router-link
                  :to="{
                    name: `purchase`,
                    params: { purchaseId: props.row.shippedWithPurchaseId }
                  }"
                  >{{ props.row.shippedWithPurchaseId }}
                </router-link>
                  &nbsp;&nbsp;
                <a :href="`${consoleUrl}/purchase/${props.row.shippedWithPurchaseId}`" target="_blank">
                  <b-icon size="is-small" icon="external-link-alt"></b-icon>
                </a>
              </div>

              <template v-if="isStatusInGroup(props.row.status, 'fulfillment') || isStatusInGroup(props.row.status, 'shipping')">
                <b-field label="Ship with">
                  <b-field>
                    <b-input :ref="`${props.row['.key']}-ships-with-input`" placeholder="Enter Other Purchase Id"></b-input>
                    <p class="control">
                      <button
                        @click="setShipsWithAnotherPurchase({ purchaseId: props.row['.key'], otherPurchaseId: $refs[`${props.row['.key']}-ships-with-input`].$refs.input.value })"
                        class="button is-primary">
                        Ship together
                      </button>
                    </p>
                  </b-field>
                </b-field>
                <!-- <br> -->
              </template>
            </div>
            <!-- End Admin section -->

            <b-field label="Title" custom-class="title is-6">
              <b-input v-model="props.row.dvd_cover_title"></b-input>
            </b-field>

            <b-field label="Disc Quantity">
              <b-input type="number" v-model="props.row.discQuantity"></b-input>
            </b-field>

            <b-field label="Notes">
              <b-input type="textarea" v-model="props.row.notes" placeholder="Ex. [2019-02-05] (Ryan) My note here..."></b-input>
            </b-field>

            <b-field>
              <a @click="savePurchase(props.row, ['notes', 'discQuantity', 'dvd_cover_title', 'needsAttention'])" class="button is-primary"
                >Save Details</a>
            <b-checkbox v-model="props.row.needsAttention"
                type="is-danger">Needs Attention! </b-checkbox>
            </b-field>
          </section>

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
import { get, pick, filter, sum, map } from "lodash";
import { mapState, mapGetters } from "vuex";
import api from "../services/api";
import { auth } from "../firebase";
import purchasesMixin from "@/mixins/purchasesMixin";
import roleMixin from "@/mixins/roleMixin";

export default {
  name: "Purchases",
  components: {
    Scanner: () => import("@/views/Scanner"),
  },
  // NOTE: If you don't know where something is, check the mixins
  mixins: [purchasesMixin, roleMixin],
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
        author: false,
        giveup: false
      },
      defaultSortBy: "date_placed",
      defaultSortOrder: "desc",
      isPaginated: true,
      perPage: 25
    };
  },
  computed: {
    ...mapState({
      consoleUrl: state => state.consoleUrl,
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
      this.savePurchase(purchase, [role]);
    },

    prettySize(sizeBytes) {
      const thresh = 1024;
      let bytes = sizeBytes;
      if (Math.abs(bytes) < thresh) {
        return `${bytes} B`;
      }
      const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      let u = -1;
      do {
        bytes /= thresh;
        u += 1;
      } while (Math.abs(bytes) >= thresh && u < units.length - 1);
      return `${bytes.toFixed(1)} ${units[u]}`;
    },

    handleScan(value){
      console.log("scanned", { value });
      this.setSearchText(value);
      this.show.scanner = false;
    },

    giveUpOnUploading(purchase) {
      this.$dialog.confirm({
        message: 'Mark all remaining upoads as failed, and move on to producing? (Normally only done on the customer\'s request)',
        onConfirm: () => {
          this.loading.giveup = true;
          api.get(`users/${purchase.user.id}/files/pending`).then(result => {
            const files = result.data.pendingUploads;
            const purchaseFiles = filter(files, `associations.${purchase.key}`);
            const sizeBytes = sum(map(purchaseFiles, f => parseInt(get(f, ["metadata", "estimatedFileSizeBytes"], "0"))));
            this.$dialog.confirm({
              message: `This will mark ${purchaseFiles.length} files failed (approximate size ${this.prettySize(sizeBytes)})`,
              onConfirm: () => {
                this.loading.giveup = true;
                const payload = {
                  assets: map(purchaseFiles, f => ({id: f.id, error: `initiated by admin: ${auth.currentUser.uid}`}))
                };
                api.put(`users/${purchase.user.id}/files/failures`, payload).then(() => {
                  this.loading.giveup = false;
                }).catch(err => {
                  this.$dialog.alert({ message: err.message });
                  this.loading.giveup = false;
                });
              }
            });
            this.loading.giveup = false;
          }).catch(err => {
            this.$dialog.alert({ message: err.message });
            this.loading.giveup = false;
          });
        }
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
          this.setStatus({ purchaseId, status: "authorQueued"})
        })
        .catch( err => {
          console.log({err});
          this.loading.author = false;
        })
    },

    sendToAru(purchase) {
      if( !purchase.authored ) purchase.authored = Date.now();
      // TODO: let the aru-server set the status
      purchase.status = "submittedForBurn";
      this.savePurchase(purchase, ["status", "authored"]);
      this.$store.commit("SEND_TO_ARU", purchase);
    },

    setSearchText(text) {
      if (this.searchText === text) return (this.searchText = "");
      this.searchText = text;
    },

    setStatus({ purchaseId, status }) {
      this.$store.dispatch("purchases/setPurchaseStatus", { purchaseId, status });
    },

    setShipsWithAnotherPurchase({ purchaseId, otherPurchaseId }) {
      const purchase = this.$store.getters['purchases/purchaseById'](purchaseId);
      const otherPurchase = this.$store.getters['purchases/purchaseById'](otherPurchaseId);
      if ((purchase.shippedWithPurchaseId || !purchase.trackingNumber) && otherPurchase && otherPurchase.trackingNumber) {
        purchase.trackingNumber = otherPurchase.trackingNumber;
        purchase.labelId = otherPurchase.labelId;
        purchase.labelUrl = otherPurchase.labelUrl;
        purchase.status = otherPurchase.status;
        purchase.shippedWithPurchaseId = otherPurchaseId;
        this.savePurchase(purchase, ["trackingNumber", "labelId", "labelUrl", "shippedWithPurchaseId", "status"]);
      } else {
        let message;
        if (purchase.trackingNumber) {
          message = "This purchase already has a tracking number!";
        } else if (!otherPurchase) {
          message = "purchase not found";
        } else {
          message = "purchase has no tracking info";
        }
        this.$snackbar.open({
          duration: 5000,
          message,
          type: "is-danger"
        });
      }
    },

    savePurchase(purchase, fieldsToUpdate) {
      // console.log(`savePurchase ${purchase['.key']}: ${JSON.stringify(updateFields)}`);
      this.$store.commit("purchases/UPDATE_PURCHASE", { purchase, fieldsToUpdate });
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

    archivePurchase(purchaseId) {
      this.$store.dispatch("purchases/archivePurchase", { purchaseId });
    },

    getSearchStatusesForGroup(groupName) {
      return map(this.getStatusesForGroup(groupName), status => `^${status}`).join("|");
    },

    isStatusInGroup(status, groupName) {
      return this.getStatusesForGroup(groupName).indexOf(status) >= 0;
    },

    getStatusesForGroup(groupName) {
      if (groupName === "uploading") {
        return ["initial"];
      }
      if (groupName === "production") {
        return ["inProduction", "readyForProduction", "redo"];
      }
      if (groupName === "authoring") {
        return ["authoring", "authorQueued", "producerApproved"];
      }
      if (groupName === "fulfillment") {
        return ["authored", "submittedForBurn", "burnComplete", "burnError", "burning", "copyingForBurn"];
      }
      if (groupName === "shipping") {
        return ["packaging", "packagingApproved", "shipping"];
      }
      if (groupName === "complete") {
        return ["arrived", "complete"];
      }
      if (groupName === "archive") {
        return ["archive"];
      }
      if (groupName === "all current") {
        return ["initial", "readyForProduction", "redo", "inProduction", "producerApproved", "authoring", "authored", "submittedForBurn", "burnComplete", "burnError", "burning", "copyingForBurn"];
      }
      return [];
    },
    copyToClipboard(str) {
      const el = document.createElement("textarea"); // Create a <textarea> element
      el.value = str; // Set its value to the string that you want copied
      el.setAttribute("readonly", ""); // Make it readonly to be tamper-proof
      el.style.position = "absolute";
      el.style.left = "-9999px"; // Move outside the screen to make it invisible
      document.body.appendChild(el); // Append the <textarea> element to the HTML document
      const selected =
        document.getSelection().rangeCount > 0 // Check if there is any content selected previously
          ? document.getSelection().getRangeAt(0) // Store selection if found
          : false; // Mark as false to know no selection existed before
      el.select(); // Select the <textarea> content
      document.execCommand("copy"); // Copy - only works as a result of a user action (e.g. click events)
      document.body.removeChild(el); // Remove the <textarea> element
      if (selected) {
        // If a selection existed before copying
        document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
        document.getSelection().addRange(selected); // Restore the original selection
      }
      const message = `${str} has been copied to the clipboard.`;
      this.$snackbar.open({
          duration: 2000,
          queue: false,
          message,
          type: "is-primary"
        });
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
progress.file-progress {
  width: 50px;
}
</style>
