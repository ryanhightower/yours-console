
<template>
  <div class="center">
    <h1>QR Scanner</h1>
    <qrcode-stream @decode="processCode" :paused="paused" :track="repaint" @init="logErrors"></qrcode-stream>
    <!-- <video id="scanner"></video> -->
    <router-link :to="{ name: 'purchase', params: { purchaseId }}" class="button" v-if="purchaseId">Go to {{ purchaseId }}</router-link>
  </div>
</template>

<script>
import { QrcodeStream } from "vue-qrcode-reader";

export default {
  components: { QrcodeStream },
  data() {
    return {
      purchaseId: "",
      paused: false
    };
  },
  methods: {
    processCode(data) {
      const { purchaseId } = JSON.parse(data);
      console.log(`purchaseId: ${purchaseId}`);
      this.purchaseId = purchaseId;
      // this.$router.push({ name: 'purchase', params: { purchaseId } });
    },
    repaint (location, ctx) {
      if (location !== null) {
        const {
          topLeftFinderPattern,
          topRightFinderPattern,
          bottomLeftFinderPattern
        } = location

        const pointArray = [
          topLeftFinderPattern,
          topRightFinderPattern,
          bottomLeftFinderPattern
        ]

        ctx.fillStyle = '#007bff'

        pointArray.forEach(({ x, y }) => {
          ctx.fillRect(x - 5, y - 5, 10, 10)
        })
      }
    },

    logErrors (promise) {
      promise.catch(console.error)
    }
  },

  destroyed() {},

  mounted() {},

  beforeRouteLeave (to, from, next) {
    this.paused = false;
    next();
  }
};
</script>

<style scoped>
.center {
  margin-left: auto;
  margin-right: auto;
  display: block;
  text-align: center;
}
</style>
