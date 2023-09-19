<script setup lang="ts">
import { ref, watch } from "vue";
import dayPicker from "../packages/day-picker";
const time = ref({});

watch(time, (newVal) => {
  console.log(newVal);
})
</script>
<template>
  <div>
    <day-picker style="width: 300px" v-model="time" format="object" />
  </div>
</template>
<style scoped></style>
