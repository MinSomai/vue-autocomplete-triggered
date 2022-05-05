<script setup lang="ts">
import AutoCompleteTextField from "./components/AutoCompleteTextField.vue"

const options = ["apple", "ball", "foo", "bar"]
</script>

<template>
  <main>
    <AutoCompleteTextField :options="options" />
  </main>
</template>

<style>
@import "./assets/base.css";
main {
  padding: 20px;
}
</style>
