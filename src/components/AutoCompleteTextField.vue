<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import getInputSelection from "get-input-selection";

const inputRef = ref<HTMLInputElement | null>(null);
const inputValue = ref<string>("");

const enableSpaceRemovers = ref(false);

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
  caretEnd: number;
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
  caretEnd: 0
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
    type: [Array, Object], // array of string or obj
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
    type: [String, Array],
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
  const caretEnd = getInputSelection(inputRef.value).end;
  const { options, spaceRemovers, spacer } = props;
  if (!newInputValue.length) {
    state.helperVisible = false;
  }

  state.caretEnd = caretEnd;

  updateHelper(newInputValue, caretEnd, options);
});

// returns the matched value in the options if preceded with trigger
const getMatch = (newInputValue, caretEnd, providedOptions) => {
  const { trigger, matchAny, regex } = props;
  console.log(" get match", trigger, matchAny, regex);
  const re = new RegExp(regex);

  let triggers = trigger;
  if (!Array.isArray(triggers)) {
    triggers = new Array(trigger);
  }
  triggers.sort();

  const providedOptionsObject = {};
  if (Array.isArray(providedOptions)) {
    triggers.forEach((triggerStr: string): void => {
      providedOptionsObject[triggerStr] = providedOptions;
    });
  }

  const triggersMatch = arrayTriggerMatch(triggers, re);
  let slugData: object | null = null;

  for (
    let triggersIndex = 0;
    triggersIndex < triggersMatch.length;
    triggersIndex++
  ) {
    const { triggerStr, triggerMatch, triggerLength } =
      triggersMatch[triggersIndex];

    for (let i = caretEnd - 1; i >= 0; --i) {
      const substr = newInputValue.substring(i, caretEnd);
      const match = substr.match(re);
      let matchStart = -1;

      if (triggerLength > 0) {
        const triggerIdx = triggerMatch ? i : i - triggerLength + 1;

        if (triggerIdx < 0) {
          // out of input
          break;
        }

        if (isTrigger(triggerStr, newInputValue, triggerIdx)) {
          matchStart = triggerIdx + triggerLength;
        }

        if (!match && matchStart < 0) {
          break;
        }
      } else {
        if (match && i > 0) {
          // find first non-matching character or begin of input
          continue;
        }
        matchStart = i === 0 && match ? 0 : i + 1;

        if (caretEnd - matchStart === 0) {
          // matched slug is empty
          break;
        }
      }

      if (matchStart >= 0) {
        const triggerOptions = providedOptionsObject[triggerStr];
        if (triggerOptions == null) {
          continue;
        }

        const matchedSlug = newInputValue.substring(matchStart, caretEnd);

        const options = triggerOptions.filter((slug: any) => {
          const idx = slug.toLowerCase().indexOf(matchedSlug.toLowerCase());
          return idx !== -1 && (matchAny || idx === 0);
        });

        const currTrigger = triggerStr;
        const matchLength = matchedSlug.length;

        if (slugData === null) {
          slugData = {
            trigger: currTrigger,
            matchStart,
            matchLength,
            options
          };
        } else {
          slugData = {
            ...slugData,
            trigger: currTrigger,
            matchStart,
            matchLength,
            options
          };
        }
      }
    }
  }

  return slugData;
};

const arrayTriggerMatch = (triggers, re) => {
  const triggersMatch = triggers.map((trigger: string) => ({
    triggerStr: trigger,
    triggerMatch: trigger.match(re),
    triggerLength: trigger.length
  }));

  return triggersMatch;
};

const isTrigger = (trigger, str, i) => {
  if (!trigger || !trigger.length) {
    return true;
  }

  if (str.substr(i, trigger.length) === trigger) {
    return true;
  }

  return false;
};

const resetHelper = () => {
  state.helperVisible = false;
  state.selection = 0;
};

const updateHelper = (newInputValue, caretEnd, options) => {
  const slug = getMatch(newInputValue, caretEnd, options);
  if (slug) {
    // if match found with trigger
    // @apple // if exists in the options[] and trigger is @
    console.log(slug, "yes");
  } else {
    resetHelper();
  }
};
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
