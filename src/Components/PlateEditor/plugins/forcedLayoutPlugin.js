import { ELEMENT_TITLE } from "../constants";

export const forcedLayoutPlugin = {
  options: {
    rules: [{ path: [0], strictType: ELEMENT_TITLE }],
  },
};
