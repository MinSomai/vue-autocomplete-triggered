import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import OptionsList from "../OptionsList.vue";

describe("OptionsList", () => {
  it("renders properly", () => {
    const wrapper = mount(OptionsList);
    expect(wrapper.text()).toContain("");
  });
});
