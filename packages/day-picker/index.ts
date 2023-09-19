import dayPicker from "./src/index.vue";
dayPicker.name = "day-picker";
dayPicker.install = function (Vue: any) {
  Vue.component("day-picker", dayPicker);
};
export default dayPicker;
