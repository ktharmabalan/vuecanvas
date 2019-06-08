<template>
  <div id="properties-container" :class="{ active: toggled }">
    <div class="content-container">
      <span>Properties</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Properties",
  props: {
    toggled: Boolean
  },
  data() {
    return {};
  },
  methods: {}
});
</script>

<style scoped lang="less">
#properties-container {
  height: 100vh;
  width: 400px;
  background-color: #fbfbfb;
  transform: translateX(400px);
  transition: linear 0.2s all;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
}
#properties-container.active {
  border-left: 1px solid #e8e8e8;
  transform: translateX(0px);
}
.content-container {
  padding: 20px;
  text-align: left;
  font-weight: 600;
  color: #949494;
}
.content-container > span {
  font-weight: 600;
}
</style>
