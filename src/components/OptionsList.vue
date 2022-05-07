<script lang="ts" setup>
import { computed, toRefs } from "vue";
import type { PropType } from "vue";

let props = defineProps({
  helperVisible: {
    type: Boolean,
    default: false,
  },
  left: {
    type: Number,
    default: 0,
  },
  top: {
    type: Number,
    default: 0,
  },
  matchStart: {
    type: Number,
  },
  matchLength: {
    type: Number,
  },
  maxOptions: {
    type: Number,
    default: 6,
  },
  options: {
    type: [Array, Object] as PropType<
      Array<string> | { [key: string]: string[] }
    >, // array of string or obj
    default: () => [],
  },
  selection: {
    type: Number,
  },
  offsetX: {
    type: Number,
    default: 0,
  },
  offsetY: {
    type: Number,
    default: 0,
  },
  modelValue: {
    type: String,
    default: null,
  },
});

defineEmits(["handle-selection", "set-selection"]);

const { maxOptions, options, matchStart, matchLength, modelValue } =
  toRefs(props);

const optionsNumber =
  maxOptions.value === 0 ? options.value.length : maxOptions.value;

const highlightStart = (val: string): number => {
  if (!modelValue.value) return 0;
  return val
    .toLowerCase()
    .indexOf(modelValue.value.substr(matchStart.value, matchLength.value));
};

const computedItems = computed((): string[] => {
  if (Array.isArray(options.value)) {
    return options.value.slice(0, optionsNumber as number);
  }
  return [];
});
</script>
<template>
  <template v-if="helperVisible && options.length > 0">
    <ul
      class="vue-autocomplete-input"
      :style="`left: ${left + offsetX}; top: ${top + offsetY}px`"
    >
      <li
        v-for="(item, index) in computedItems"
        :key="index"
        :class="{ active: index == selection }"
        @click="$emit('handle-selection', index)"
        @mouseenter="$emit('set-selection', index)"
      >
        {{ item.slice(0, highlightStart(item)) }}
        <strong> {{ item.substr(highlightStart(item), matchLength) }} </strong>
        {{ item.slice(highlightStart(item) + matchLength) }}
      </li>
    </ul>
  </template>
</template>
