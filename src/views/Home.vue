<template>
  <div id="main-container">
    <Canvas
      :insert-element="insertElement"
      @element-inserted="elementInserted"
      @update-screen-data="updatedCavanasScreen"
    />

    <div class="action-container" :class="{ active: toggled }">
      <span class="toggler" @click="toggle()">T</span>
    </div>

    <Properties :toggled="toggled" @toggle="toggle" :screen-data="screenData" />
    <ElementMenu @select-element="selectElement" :selected="insertElement" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Properties from "@/components/Properties.vue";
import Canvas from "@/components/Canvas.vue";
import ElementMenu from "@/components/ElementMenu.vue";
import { CanvasScreen } from "@/libs/element";

export default Vue.extend({
  name: "home",
  data() {
    return {
      toggled: false,
      insertElement: "",
      screenData: null as CanvasScreen | null
    };
  },
  methods: {
    toggle() {
      this.toggled = !this.toggled;
    },
    selectElement(element: string) {
      this.insertElement = element;
    },
    elementInserted() {
      this.insertElement = "";
    },
    updatedCavanasScreen(screen: CanvasScreen | null) {
      this.screenData = screen;
    }
  },
  components: {
    Properties,
    Canvas,
    ElementMenu
  }
});
</script>

<style scoped lang="less">
#main-container {
  height: 100vh;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
}
.action-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: absolute;
  right: 10px;
  top: 10px;
  transition: linear 0.2s all;
  transform: translateX(0);
  border-radius: 5px;
  background: #fbfbfb;
  border: 1px solid #e8e8e8;
}
.action-container.active {
  transform: translateX(-400px);
}
.action-container > span {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
}
.action-container > span:hover {
  cursor: pointer;
  background-color: #e6e6e6;
}
.toggler {
  // padding: 15px 10px;
  width: 48px;
  height: 48px;
  border-radius: 5px;
  cursor: pointer;
  transition: linear 0.2s all;
}
</style>
