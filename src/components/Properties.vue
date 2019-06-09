<template>
  <div id="properties-container" :class="{ active: toggled }">
    <div class="content-container">
      <span>Properties</span>
      <div v-if="screenData" class="properties-content">
        <div v-for="(child, cIdx) in screenData.children" :key="cIdx" class="line-item">
          <div>{{ elementTypes[child.type] }}</div>
          <div>{{ child.boundingBox[0] }}</div>
          <div>{{ child.boundingBox[1] }}</div>
          <!-- <pre>{{ child }}</pre> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { CanvasScreen, ElementType } from "@/libs/element";

export default Vue.extend({
  name: "Properties",
  props: {
    screenData: CanvasScreen,
    toggled: Boolean
  },
  data() {
    return {};
  },
  methods: {},
  computed: {
    elementTypes() {
      const types = [];
      const typeCount = Object.values(ElementType);
      for (let index = 0; index < typeCount.length / 2; index++) {
        types.push(typeCount[index]);
      }
      return types;
    }
  }
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: calc(100% - 40px);
  padding: 20px;
  text-align: left;
  font-weight: 600;
  color: #949494;
}
.content-container > span {
  font-weight: 600;
  flex-shrink: 0;
  margin-bottom: 10px;
}
.properties-content {
  flex-grow: 1;
  height: 100%;
  overflow-y: auto;
}
.line-item {
  margin-bottom: 10px;
}
</style>
