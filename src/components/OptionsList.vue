<template>
  <ul
    class="vue-autocomplete-input"
    :style="`left: ${left + offsetX}; top: ${top + offsetY}px`"
    v-if="helperVisible && options.length > 0"
  >
    <li
      v-for="(item, index) in computedItems"
      :key="index"
      :class="{ active: index == selection }"
      @click="$emit('handle-selection', index)"
      @mouseenter="$emit('set-selection', index)"
    >
      <span> {{ item.slice(0, highlightStart(item)) }} </span>
      <strong> {{ item.substr(highlightStart(item), matchLength) }} </strong>
      <span> {{ item.slice(highlightStart(item) + matchLength) }} </span>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { computed, toRefs, watch } from "vue";
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
    default: 0,
  },
  matchLength: {
    type: Number,
    default: 0,
  },
  maxOptions: {
    type: Number,
    default: 6,
  },
  options: {
    type: Array as PropType<Array<string>>, // array of string or obj
    default: () => [],
  },
  selection: {
    type: Number,
    default: 0,
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

const emit = defineEmits(["handle-selection", "set-selection"]);

const { maxOptions, selection, options, matchStart, matchLength, modelValue } =
  toRefs(props);

// edge case: sometimes 'undefined' is emitted
watch(selection, (newSelectionValue) => {
  if (newSelectionValue >= options.value.length) {
    emit("set-selection", 0);
  }
});

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
<style>
.vue-autocomplete-input {
  background-clip: padding-box;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  bottom: auto;
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.175);
  display: block;
  font-size: 14px;
  list-style: none;
  position: absolute;
  padding: 0px;
  margin-left: 3px;
  text-align: left;
  z-index: 20000;
  border-radius: 3px;
  overflow: hidden;
}

.vue-autocomplete-input > li {
  cursor: pointer;
  padding: 10px;
  min-width: 100px;
  transition: all 0.2s ease-in;
}

.vue-autocomplete-input > li.active {
  background-color: #e0f7ff;
  color: #168bc5;
}
</style>
