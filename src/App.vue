<script setup lang="ts">
import { ref } from "vue";
import AutoCompleteTextField from "./components/AutoCompleteTextField.vue";

const triggerMultiple = ["@", "@@", "#"];
const optionsMultiple = {
  "@": ["apple1", "ball1", "foo1", "bar1"],
  "@@": ["apple2", "ball2", "foo2", "bar2"],
  "#": ["apple3", "ball3", "foo3", "bar3", "car3"],
};

const inputValue = ref("@ap");
</script>
<template>
  <main>
    <AutoCompleteTextField
      :trigger="triggerMultiple"
      :options="optionsMultiple"
      v-model="inputValue"
      rows="5"
      cols="25"
    >
    </AutoCompleteTextField>
  </main>
</template>

<style>
@import "./assets/base.css";
main {
  padding: 20px;
}
</style>
