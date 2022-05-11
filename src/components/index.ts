import type { App } from "vue";
import AutoCompleteTextField from "./AutoCompleteTextField.vue";

export default {
  install: (app: App) => {
    app.component("AutoCompleteTextField", AutoCompleteTextField);
  },
};

export { AutoCompleteTextField };
