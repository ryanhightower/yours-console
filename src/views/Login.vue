<template lang="html">
  <div id="firebaseui-auth-container"></div>
</template>

<script>
import firebaseui from "firebaseui";
import firebase from "../firebase";

let ui;
export default {
  name: "auth",
  mounted() {
    if (ui) {
      ui.reset();
    } else {
      ui = new firebaseui.auth.AuthUI(firebase.auth());
    }
    const uiConfig = {
      signInFlow: "popup",
      signInSuccessUrl: "/",
      signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID]
    };
    ui.start("#firebaseui-auth-container", uiConfig);
  }
};
</script>
