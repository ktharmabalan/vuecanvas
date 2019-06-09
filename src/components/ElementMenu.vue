<template>
  <div id="element-menu-container">
    <span
      v-for="(element, eId) in elements"
      :key="eId"
      :class="{ active: selected === element }"
      @click="$emit('select-element', element)"
    >{{ element.substring(0, 1).toUpperCase() }}</span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ElementMenu",
  props: {
    selected: String
  },
  data() {
    return {
      elements: ["square", "circle", "polygon", "line"]
    };
  }
});
</script>

<style scoped lang="less">
#element-menu-container {
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  border: 1px solid;
  width: 50px;
  height: min-content;
  margin: auto 0;
  background: #fbfbfb;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}
#element-menu-container > span {
  padding: 10px;
  padding: 15px 10px;
  font-weight: 600;
}
#element-menu-container > span:hover,
#element-menu-container > span.active {
  cursor: pointer;
  background-color: #e6e6e6;
}
</style>
