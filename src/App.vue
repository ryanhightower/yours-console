<template>
  <div id="app">
    <div id="nav" class="navbar">
      <div class="navbar-brand">
        <img
          width="40"
          height="35"
          style="width:40px; height:40px;"
          src="data:image/png;base64,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"
          alt=""
        />
      </div>
      <div class="container is-fluid">
        <!-- <router-link class="navbar-item" to="/">Home</router-link> -->
        <router-link class="navbar-item" to="/purchases">Purchases</router-link>
        <router-link class="navbar-item" to="/login">Login</router-link>
      </div>
    </div>
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<style lang="scss">
// Import Bulma's core
@import "~bulma/sass/utilities/_all";
$teal: #1dc6cc;
$purple: #8c67ef;

// Set your colors
$primary: $teal;
$primary-invert: findColorInvert($primary);

// Links
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

$colors: (
  "white": (
    $white,
    $black
  ),
  "black": (
    $black,
    $white
  ),
  "light": (
    $light,
    $light-invert
  ),
  "dark": (
    $dark,
    $dark-invert
  ),
  "primary": (
    $primary,
    $primary-invert
  ),
  "info": (
    $info,
    $info-invert
  ),
  "success": (
    $success,
    $success-invert
  ),
  "warning": (
    $warning,
    $warning-invert
  ),
  "danger": (
    $danger,
    $danger-invert
  )
);

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: $teal;
    }
  }
}
</style>
