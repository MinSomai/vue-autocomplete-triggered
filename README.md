# vue-autocomplete-triggered

Autocomplete input field with trigger symbols eg. @, #, {{ etc. for vue 3.

[![npm version](https://badge.fury.io/js/vue-autocomplete-triggered.svg)](https://badge.fury.io/js/vue-autocomplete-triggered)

![Screenshot](screenshot.png)

## Install

```bash
npm install vue-autocomplete-triggered
```

## Usage

#### Component registration
```js
// main.js
import AutoCompleteTextField from "vue-autocomplete-triggered";
import "vue-autocomplete-triggered/styles.css";

app.use(AutoCompleteTextField);
```

#### Usage in component
```js
// yourComponent.js
<script setup lang="ts">
const triggers = ["@", "@@", "#"];

const options = {
  "@": ["apple", "animation", "ball", "cat", "foo", "bar"],
  "@@": ["apple_use", "ball_many", "foo_bar", "bar"],
  "#": ["apple_hash", "ball_hash", "foo_hash", "bar_hash", "car_hash"],
};

const inputValue = ref("@ap");
</script>
<template>
  <AutoCompleteTextField
    :trigger="triggers"
    :options="options"
    v-model="inputValue"
    rows="6"
    cols="40"
  >
  </AutoCompleteTextField>
</template>
```
