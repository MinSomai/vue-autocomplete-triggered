<script setup lang="ts">
import { ref } from "vue";
import AutoCompleteTextField from "@/components/AutoCompleteTextField.vue";

const triggers = ["@", "@@", "#"];
// const triggers = "@";

const options = {
  "@": ["apple", "animation", "ball", "cat", "foo", "bar"],
  "@@": ["apple_use", "ball_many", "foo_bar", "bar"],
  "#": ["apple_hash", "ball_hash", "foo_hash", "bar_hash", "car_hash"],
};
// const options = ["apple", "ball", "car", "cat"];

const inputValue = ref("@ap");
</script>
<template>
  <main>
    <header>
      <h1>vue-autocomplete-triggered demo</h1>
      &nbsp; &nbsp; &nbsp;
      <h2>
        <a
          href="https://github.com/MinSomai/vue-autocomplete-triggered"
          target="_blank"
          >Github</a
        >
      </h2>
    </header>
    <p>AutoCompletion Demo</p>
    <p><small>Hint: input "@a" to see in action.</small></p>
    <AutoCompleteTextField
      :trigger="triggers"
      :options="options"
      v-model="inputValue"
      rows="6"
      cols="40"
    >
    </AutoCompleteTextField>
    <hr />
  </main>
</template>
<style scoped>
main {
  font: 14px/1.5 sans-serif;
}
main {
  max-width: 800px;
  margin: 0 auto;
}
main > header {
  display: flex;
  align-items: center;
}
</style>
