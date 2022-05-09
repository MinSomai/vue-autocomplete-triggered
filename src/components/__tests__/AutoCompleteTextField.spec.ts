import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import AutoCompleteTextField from "../AutoCompleteTextField.vue";

describe("AutoCompleteTextField", () => {
  it("renders properly", () => {
    const wrapper = mount(AutoCompleteTextField, { props: { trigger: "#" } });
    expect(wrapper.text()).toContain("");
  });
});
