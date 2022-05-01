<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import getInputSelection from "get-input-selection";

const inputRef = ref<HTMLInputElement | null>(null);
const inputValue = ref<string>("");

interface State {
  helperVisible: boolean;
  left: number;
  trigger: string | null;
  matchLength: number;
  matchStart: number;
  options: Array<object>;
  selection: number;
  top: number;
  value: string | null;
  caret: object;
}

const state: State = reactive({
  helperVisible: false,
  left: 0,
  trigger: null,
  matchLength: 0,
  matchStart: 0,
  options: [],
  selection: 0,
  top: 0,
  value: null,
  caret: {
    start: 0,
    end: 0
  }
});

let props = defineProps({
  component: {
    type: String,
    default: "textarea"
  },
  defaultValue: {
    type: String,
    default: ""
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxOptions: {
    type: Number,
    default: 6
  },
  onBlur: { type: Function },
  onChange: { type: Function },
  onKeyDown: { type: Function, default: () => ({}) },
  onRequestOptions: { type: Function },
  onSelect: { type: Function },
  changeOnSelect: {
    type: Function,
    default: (trigger: string | Array<string>, slug: string) => trigger + slug
  },
  options: {
    type: Array || Object, // array of string or obj
    default: () => []
  },
  regex: {
    type: String,
    default: "^[A-Za-z0-9\\-_]+$"
  },
  matchAny: {
    type: Boolean,
    default: false
  },
  minChars: {
    type: Number,
    default: 0
  },
  requestOnlyIfNoOptions: {
    type: Boolean,
    default: true
  },
  spaceRemovers: {
    type: Array,
    default: () => [",", ".", "!", "?"]
  },
  spacer: {
    type: String,
    default: " "
  },
  trigger: {
    type: String || Array,
    default: "@"
  },
  offsetX: {
    type: Number,
    default: 0
  },
  offsetY: {
    type: Number,
    default: 0
  },
  value: {
    type: String,
    default: null
  },
  passThroughEnter: {
    type: Boolean,
    default: false
  }
});

watch(inputValue, (newInputValue, oldInputValue) => {
  const caret = getInputSelection(inputRef.value);
  const { options } = props;
  if (!newInputValue.length) {
    state.helperVisible = false;
  }

  state.caret = caret;

  console.log(state, options);
});
</script>
<template>
  <div>
    <textarea
      name="my-textarea"
      id="myTextarea"
      cols="30"
      rows="10"
      ref="inputRef"
      v-model="inputValue"
    ></textarea>
  </div>
</template>
