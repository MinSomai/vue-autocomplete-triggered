<script setup lang="ts">
import AutoCompleteTextField from "./components/AutoCompleteTextField.vue";

const triggerSingle = "@";
const optionsSingle = ["apple", "ball", "foo", "bar"];

const triggerMultiple = ["@", "@@"];
const optionsMultiple = {
  "@": ["apple1", "ball1", "foo1", "bar1"],
  "@@": ["apple2", "ball2", "foo2", "bar2"],
};
</script>

<template>
  <main>
    <AutoCompleteTextField :trigger="triggerSingle" :options="optionsSingle" />
    <AutoCompleteTextField
      :trigger="triggerMultiple"
      :options="optionsMultiple"
    />
  </main>
</template>

<style>
@import "./assets/base.css";
main {
  padding: 20px;
}
</style>
