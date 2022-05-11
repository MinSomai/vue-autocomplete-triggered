<template>
  <div>
    <textarea
      name="my-textarea"
      id="myTextarea"
      rows="2"
      ref="inputRef"
      v-model="inputValue"
      @keydown="handleKeyDown"
      v-bind="$attrs"
    ></textarea>

    <OptionsList
      :helper-visible="state.helperVisible"
      :left="state.left"
      :top="state.top"
      :match-start="state.matchStart"
      :match-length="state.matchLength"
      :max-options="maxOptions"
      :options="state.options"
      :selection="state.selection"
      :offset-x="offsetX"
      :offset-y="offsetY"
      v-model="inputValue"
      @handle-selection="handleSelection"
      @set-selection="(hoveredIndex) => (state.selection = hoveredIndex)"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, watch, toRefs, nextTick } from "vue";
import getInputSelection, { setCaretPosition } from "get-input-selection";
import getCaretCoordinates from "textarea-caret";

import type { OptionsI, TriggerI } from "@/interface";

import OptionsList from "./OptionsList.vue";

// can't import interface, limitation AFAIK
// refer:
// https://github.com/vuejs/core/issues/4294
export interface PropTypesI {
  component?: string;
  defaultValue?: string;
  disabled?: boolean;
  maxOptions?: number;
  onBlur?: () => void;
  onChange?: (newInputValue: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onSelect?: (inputValue: string) => void;
  onRequestOptions?: (newInputValue: string) => void;
  changeOnSelect?: (trigger: string, slug: string) => string;
  options?: OptionsI;
  trigger?: TriggerI;
  regex?: string;
  matchAny?: boolean;
  minChars?: number;
  requestOnlyIfNoOptions?: boolean;
  spaceRemovers?: string[];
  spacer?: string;
  offsetX?: number;
  offsetY?: number;
  modelValue?: string | null;
  passThroughEnter?: boolean;
}

// props default value
let props = withDefaults(defineProps<PropTypesI>(), {
  component: "textarea",
  defaultValue: "",
  disabled: false,
  maxOptions: 6,
  /* eslint-disable @typescript-eslint/no-empty-function */
  onBlur: () => {},
  onChange: () => {},
  onKeyDown: () => {},
  onSelect: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
  onRequestOptions: (newInputValue: string) => {
    return newInputValue;
  },
  changeOnSelect: (trigger: string, slug: string) => {
    return trigger + slug;
  },
  options: () => ["apple", "ball"],
  trigger: "@",
  regex: "^[A-Za-z0-9\\-_]+$",
  matchAny: false,
  minChars: 0,
  requestOnlyIfNoOptions: true,
  spaceRemovers: () => [",", ".", "!", "?"],
  spacer: " ",
  offsetX: 0,
  offsetY: 20,
  modelValue: null,
  passThroughEnter: false,
});

const emit = defineEmits(["update:modelValue"]);

interface TriggerMatchesI {
  triggerLength: number;
  triggerMatch: RegExpMatchArray | null;
  triggerStr: string;
}

interface StateI {
  helperVisible: boolean;
  left: number;
  trigger?: TriggerI;
  matchLength: number;
  matchStart: number;
  options: Array<string>;
  selection: number;
  top: number;
  caretEnd: number;
}

// current matched options data from the input value
interface MatchedOptionI {
  matchLength: number;
  matchStart: number;
  options: OptionsI;
  trigger: TriggerI;
}

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_RETURN = 13;
const KEY_ENTER = 14;
const KEY_ESCAPE = 27;
const KEY_TAB = 9;
const OPTION_LIST_Y_OFFSET = 10;
const OPTION_LIST_MIN_WIDTH = 100;

const inputRef = ref<HTMLInputElement | null>(null);
const inputValue = ref<string>("");

// const inputValue: WritableComputedRef<string> = computed({
//   get(): string {
//     console.log(modelValue.value);
//     if (modelValue.value) return modelValue.value;
//     return "";
//   },
//   set(newValue: string): void {
//     emit("update:modelValue", newValue);
//   },
// });

const enableSpaceRemovers = ref<boolean>(false);
// preserve the inputValue length when it was selected
const enableSpaceRemoversPrevLength = ref<number>(0);

const state: StateI = reactive({
  helperVisible: false,
  left: 0,
  trigger: "",
  matchLength: 0,
  matchStart: 0,
  options: [],
  selection: 0,
  top: 0,
  caretEnd: 0,
});

watch(inputValue, (newInputValue, oldInputValue) => {
  const { onChange, options } = props;

  const caretEnd = getInputSelection(inputRef.value).end;

  if (!newInputValue.length) {
    state.helperVisible = false;
  }

  state.caretEnd = caretEnd;

  if (!newInputValue.length || !caretEnd) {
    return onChange(newInputValue);
  }

  // applicable after options selection
  removeSpacer(newInputValue, oldInputValue, caretEnd);

  updateHelper(newInputValue, caretEnd, options);

  if (!inputValue.value) {
    inputValue.value = newInputValue;
  }

  emit("update:modelValue", newInputValue);
  return onChange(newInputValue);
});

const resetHelper = async () => {
  await nextTick();
  state.helperVisible = false;
  state.selection = 0;
};

const updateHelper = (
  newInputValue: string,
  caretEnd: number,
  options: OptionsI
): void => {
  const slug = getMatch(newInputValue, caretEnd, options);

  if (slug == null) {
    resetHelper();
    return;
  }
  // if match found with trigger
  // i.e if input is @apple
  // if it exists in the options[] list and the trigger is @
  const caretPos = getCaretCoordinates(inputRef.value, caretEnd);
  const rect: DOMRect | undefined = inputRef.value?.getBoundingClientRect();
  const top: number = caretPos.top + inputRef.value?.offsetTop;

  if (!rect) return;
  if (!inputRef.value) return;

  const left = Math.min(
    caretPos.left + inputRef.value?.offsetLeft - OPTION_LIST_Y_OFFSET,
    inputRef.value?.offsetLeft + rect.width - OPTION_LIST_MIN_WIDTH
  );

  const { minChars, onRequestOptions, requestOnlyIfNoOptions } = toRefs(props);

  if (Array.isArray(slug.options)) {
    let shouldUpdateState =
      slug.matchLength >= minChars.value &&
      (slug.options.length > 1 ||
        (slug.options.length === 1 &&
          slug.options[0].length !== slug.matchLength));

    if (shouldUpdateState) {
      state.helperVisible = true;
      state.top = top;
      state.left = left;
      Object.assign(state, slug);
    } else {
      if (!requestOnlyIfNoOptions.value || !slug.options.length) {
        onRequestOptions.value(
          newInputValue.substr(slug.matchStart, slug.matchLength)
        );
      }

      resetHelper();
    }
  }
};

// returns the matched value in the options if preceded with trigger
const getMatch = (
  newInputValue: string,
  caretEnd: number,
  providedOptions: OptionsI
): MatchedOptionI | null => {
  const { trigger, matchAny, regex } = props;
  const re = new RegExp(regex);

  // if not array, make it
  // eg:
  // if trigger is "@"
  // make it ["@"]
  let triggers: string[] = Array.isArray(trigger)
    ? trigger
    : new Array(trigger);

  triggers.sort();

  let providedOptionsObject: { [key: string]: string[] } = {};
  if (Array.isArray(providedOptions)) {
    // convert the array options to object where key is its trigger value
    // eg: {
    //    "@": ["aple", "ball"]
    //  }
    triggers.forEach((triggerStr: string): void => {
      providedOptionsObject[triggerStr] = providedOptions;
    });
  } else {
    providedOptionsObject = providedOptions;
  }

  // all the triggers list in TriggerMatchesI form
  // even the single eg. "@" is converted to this form
  const triggersMatch: TriggerMatchesI[] = arrayTriggerMatch(triggers, re);

  let slugData: MatchedOptionI | null = null;
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

        const options = triggerOptions.filter((slug: string) => {
          const idx = slug.toLowerCase().indexOf(matchedSlug.toLowerCase());
          return idx !== -1 && (matchAny || idx === 0);
        });

        const currTrigger = triggerStr;
        const matchLength = matchedSlug.length;

        slugData = {
          trigger: currTrigger,
          matchStart,
          matchLength,
          options,
        };
      }
    }
  }

  return slugData;
};

// give each trigger extra info
const arrayTriggerMatch = (
  triggers: string[],
  re: RegExp
): TriggerMatchesI[] => {
  const triggersMatch: TriggerMatchesI[] = triggers.map(
    (trigger: string): TriggerMatchesI => ({
      triggerStr: trigger,
      triggerMatch: trigger.match(re),
      triggerLength: trigger.length,
    })
  );

  return triggersMatch;
};

const isTrigger = (trigger: string, newInputValue: string, i: number) => {
  if (!trigger || !trigger.length) {
    return true;
  }
  if (newInputValue.substr(i, trigger.length) === trigger) {
    return true;
  }
  return false;
};

// '@wonderjenny ,|' -> '@wonderjenny, |'
const removeSpacer = (
  newInputValue: string,
  oldInputValue: string,
  caretEnd: number
) => {
  const { onChange, options, spaceRemovers, spacer } = props;
  if (
    !(
      enableSpaceRemovers.value &&
      spaceRemovers.length &&
      newInputValue.length > 2 &&
      spacer.length
    )
  )
    return; // don't continue

  for (
    let i = 0;
    i < Math.max(oldInputValue.length, newInputValue.length);
    ++i
  ) {
    if (oldInputValue[i] !== newInputValue[i]) {
      if (
        i >= 2 &&
        newInputValue[i - 1] === spacer &&
        spaceRemovers.indexOf(newInputValue[i - 2]) === -1 &&
        spaceRemovers.indexOf(newInputValue[i]) !== -1 &&
        getMatch(newInputValue.substring(0, i - 2), caretEnd - 3, options)
      ) {
        const newValue = `${newInputValue.slice(0, i - 1)}${newInputValue.slice(
          i,
          i + 1
        )}${newInputValue.slice(i - 1, i)}${newInputValue.slice(i + 1)}`;

        inputValue.value = newValue;

        updateCaretPosition(i + 1);
        enableSpaceRemovers.value = false;
        return onChange(newValue);
      }
      break;
    }
  }

  if (newInputValue.length > enableSpaceRemoversPrevLength.value) {
    // waits for one extra character
    enableSpaceRemovers.value = false;
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  const { helperVisible, options, selection } = state;
  const { onKeyDown, passThroughEnter } = props;

  if (helperVisible == false) {
    onKeyDown(event);
    return; // don't continue
  }

  switch (event.keyCode) {
    case KEY_ESCAPE:
      event.preventDefault();
      resetHelper();
      break;
    case KEY_UP:
      event.preventDefault();
      if (Array.isArray(options)) {
        state.selection =
          ((options.length as number) + selection - 1) % options.length;
      }
      break;
    case KEY_DOWN:
      event.preventDefault();
      if (Array.isArray(state.options)) {
        state.selection = (selection + 1) % state.options.length;
      }
      break;
    case KEY_ENTER:
    case KEY_RETURN:
      if (!passThroughEnter) {
        event.preventDefault();
      }
      handleSelection(selection);
      break;
    case KEY_TAB:
      handleSelection(selection);
      break;
    default:
      onKeyDown(event);
      break;
  }
};

const handleSelection = (idx: number) => {
  const { spacer, onSelect, changeOnSelect } = props;
  const { matchStart, matchLength, options, trigger } = state;

  if (!Array.isArray(options)) return;
  if (!(typeof trigger == "string")) return;

  const slug = options[idx];
  const part1 =
    trigger.length === 0
      ? ""
      : inputValue.value.substring(0, matchStart - trigger.length);

  const part2 = inputValue.value.substring(matchStart + matchLength);

  const changedStr = changeOnSelect(trigger, slug);

  inputValue.value = `${part1}${changedStr}${spacer}${part2}`;
  onSelect(inputValue.value);
  resetHelper();

  updateCaretPosition(part1.length + changedStr.length + 1);
  enableSpaceRemovers.value = true;
  enableSpaceRemoversPrevLength.value = inputValue.value.length; // currently selected input length
};

const updateCaretPosition = (caretEnd: number) => {
  state.caretEnd = caretEnd;
  setCaretPosition(inputRef.value, caretEnd);
};
</script>
