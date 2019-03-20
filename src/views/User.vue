<template>
  <div class="purchase container is-fluid">
    <h1 class="title is-2">User: {{ get(user, "name", "") }}</h1>
    <hr />
    <div class="card" style="max-width: 600px;">
      <!-- <div class="card-image">
        <figure class="image is-4by3">
          <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
        </figure>
      </div> -->
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <p class="title is-4">{{ get(user, "name", "") }}</p>
            <p class="subtitle is-6">{{ get(user, "email", "") }}</p>
          </div>
        </div>

        <div class="content">
          <dl>
            <dt>Account Balance<br />(for subscriptions)</dt>
            <dd>{{ "none" }}</dd>
            <dt>Subscribed to</dt>
            <dd>{{ get(subscription, "plan.name", "none") }}</dd>
            <dt>Active</dt>
            <dd>{{ !get(subscription, "cancel_at_period_end", "none") }}</dd>
            <dt>Free trial ends</dt>
            <dd>
              {{
                new Date(
                  get(subscription, "trial_end", Date.now() / 1000) * 1000
                ).toLocaleDateString()
              }}
            </dd>
            <dt>First purchased on</dt>
            <dd>{{ firstPurchaseDate }}</dd>
          </dl>
          <b-field label="DVD Credits">
            <b-input
              type="number"
              v-model.number="user.purchaseCredits"
            ></b-input>
          </b-field>
          <a class="button is-primary" @click="updateUser(user)">Save</a>
        </div>
      </div>
    </div>

    <hr />
    <h2 class="title is-4">Purchases</h2>
    <div
      class="card"
      style="max-width: 600px;"
      v-for="purchase in purchasesByUser"
      :key="purchase['.key']"
    >
      <!-- <div class="card-image">
        <figure class="image is-square">
          <img :src="purchase.coverThumbnailUrl" :alt="purchase.dvd_cover_title">
        </figure>
      </div> -->
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <figure class="image is-128x128">
              <img
                :src="purchase.coverThumbnailUrl"
                :alt="purchase.dvd_cover_title"
              />
            </figure>
          </div>
          <div class="media-content">
            <div class="is-pulled-right">
              <b-icon
                icon="dollar-sign"
                type="is-success"
                size="is-large"
                v-show="purchase.chargeId != undefined"
                title="Billed successfully"
              ></b-icon>
              <b-icon
                icon="exclamation-triangle"
                type="is-warning"
                size="is-large"
                v-show="purchase.billingError"
                title="Error when billing"
              ></b-icon>
              <b-icon
                icon="infinity"
                type="is-success"
                size="is-large"
                v-show="purchase.usedSubscription"
                title="Used subscription"
              ></b-icon>
              <b-icon
                icon="star"
                type="is-success"
                size="is-large"
                v-show="purchase.usedCredit"
                title="Used a credit"
              ></b-icon>
              <b-icon
                icon="users"
                type="is-success"
                size="is-large"
                v-show="purchase.usedPromo"
                title="Used a promo code"
              ></b-icon>
              <b-icon
                icon="times"
                type="is-danger"
                size="is-large"
                v-show="!purchase.billingComplete && !props.row.billingError"
                title="Was not billed"
              ></b-icon>
            </div>
            <p class="title is-5">
              <router-link
                :to="{
                  name: 'purchase',
                  params: { purchaseId: purchase['.key'] }
                }"
                >{{ purchase.dvd_cover_title }}</router-link
              >
              <a :href="`${consoleUrl}/purchase/${ purchase[`.key`]}`" target="_blank" class="is-pulled-right">
                <b-icon size="is-small" icon="external-link-alt"></b-icon>
              </a>
            </p>
            <p class="subtitle is-6"><b>Status:</b> {{ purchase.status }}</p>
            <p><b>Discs:</b> {{ purchase.discQuantity }}</p>
            <p><b>Producer:</b> {{ purchase.producer.name }}</p>
            <p>
              <b>Date:</b>
              {{ new Date(purchase.date_placed * 1000).toLocaleDateString() }}
            </p>
          </div>
        </div>

        <!-- <div class="content"></div> -->
      </div>
    </div>

    <b-loading :is-full-page="true" :active.sync="loadingUsers"></b-loading>

    <hr />

    <h4 class="title is-4">Debug</h4>
    <pre>USER: {{ user }}</pre>
    <pre>ADDRESSES: {{ addresses }}</pre>
    <pre>STRIPE_CUSTOMER: {{ stripeCustomer }}</pre>
    <pre>PURCHASES_BY_USER: {{ purchasesByUser }}</pre>
  </div>
</template>

<script>
import { get, pick } from "lodash";
import { mapState } from "vuex";
import purchasesMixin from "@/mixins/purchasesMixin";

export default {
  components: {},
  mixins: [purchasesMixin],
  data() {
    return {};
  },
  computed: {
    ...mapState({
      consoleUrl: state => state.consoleUrl,
      users: state => state.users.all,
      stripeCustomers: state => state.users.stripeCustomers,
      userAddresses: state => state.users.userAddresses,
      loadingUsers: state =>
        state.users.loading.users || state.users.loading.stripeCustomers,
      refs: state => state.refs
    }),
    userId() {
      return this.$route.params.userId;
    },
    user() {
      return this.users[this.userId] || this.emptyUser();
    },
    stripeCustomer() {
      return this.stripeCustomers[this.userId] || null;
    },
    addresses() {
      return this.userAddresses[this.userId] || null;
    },
    subscription() {
      return get(
        this.stripeCustomer,
        `subscriptions.${this.user.subscriptionId}`,
        {}
      );
    },
    purchasesByUser() {
      return this.normalizePurchases(this.purchases).filter(
        purchase => purchase.user.id === this.userId
      );
    },
    firstPurchaseDate() {
      const now = Date.now();
      const pDate = new Date(
        get(this.firstPurchase, "date_placed", now / 1000) * 1000
      );
      return pDate !== now ? pDate.toLocaleDateString() : "";
    },
    firstPurchase() {
      if (!this.purchasesByUser) return;
      return this.purchasesByUser.concat().sort((a, b) => {
        return a.date_placed > b.date_placed
          ? 1
          : a.date_placed < b.date_placed
          ? -1
          : 0;
      })[0];
    }
  },
  methods: {
    get,
    pick,
    emptyUser() {
      return {
        purchaseCredits: 0
      };
    },
    updateUser(user) {
      this.$store.commit("users/UPDATE_USER", { key: this.userId, user });
    }
  },
  created() {
    this.$store.dispatch("users/setUsersRef", { ref: this.refs.USERS });

    // this.$store.dispatch("users/setMoviesByUser", { ref: this.refs.MOVIES_BY_USER });
    // this.$store.dispatch("purchases/setFilesByPurchase", { ref: this.refs.FILES_BY_PURCHASE });
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        // Fetch user
        if (to.name === "user" && !this.users[to.params.userId]) {
          this.$store.dispatch("users/setUser", {
            ref: this.refs.USERS.child(to.params.userId),
            key: to.params.userId
          });
          this.$store.dispatch("users/setStripeCustomer", {
            ref: this.refs.STRIPE_CUSTOMERS.child(this.userId),
            key: this.userId
          });
          this.$store.dispatch("users/setUserAddresses", {
            ref: this.refs.ADDRESSES_BY_USER.child(this.userId),
            key: this.userId
          });
        }
      }
    }
  }
};
</script>

<style lang="scss">
a.button {
  margin: 0 5px;
}
dt {
  float: left;
  clear: right;
  font-weight: bold;
  width: 180px;
  padding: 5px 0;
}
dd {
  padding: 5px 0;
}
dd::after {
  content: " ";
  display: block;
  clear: left;
}
</style>
