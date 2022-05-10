import AutoCompleteTextField from "./components/AutoCompleteTextField.vue";

export default install = (app) => {
  app.component("auto-complete-text-field", AutoCompleteTextField);
};

export { AutoCompleteTextField };
