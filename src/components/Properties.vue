<template>
  <div id="properties-container" :class="{ active: toggled }">
    <div class="content-container">
      <span>Properties</span>
      <div v-if="screen" class="properties-content">
        <div
          v-for="(child, cIdx) in screen.children"
          :key="cIdx"
          class="line-item"
          @click="childClicked(child)"
        >
          <div>{{ elementTypes[child.type] }}</div>
          <div v-show="elementTypes[child.type] === 'Polygon'">
            <input type="number" v-model="child.numPoints">
          </div>
          <!-- <div>
            <p>Bounding box</p>
            <div>
              <p>top left</p>
              <input type="number" v-model="child.boundingBox[0].x">
              <input type="number" v-model="child.boundingBox[0].y">
            </div>
            <div>
              <p>bottom right</p>
              <input type="number" v-model="child.boundingBox[1].x">
              <input type="number" v-model="child.boundingBox[1].y">
            </div>
          </div>-->
          <div>
            x:
            <input type="number" v-model="child.point1.x">
          </div>
          <div>
            y:
            <input type="number" v-model="child.point1.y">
          </div>
          <!-- <pre>{{ child }}</pre> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapGetters, mapMutations } from "vuex";
import { CanvasElement, ElementType } from "@/libs/element";

export default Vue.extend({
  name: "Properties",
  props: {
    toggled: Boolean
  },
  data() {
    return {};
  },
  methods: {
    childClicked(child: CanvasElement) {
      // child.point1.x = 0;
      // console.log(child);
    }
  },
  computed: {
    ...mapGetters(["screen"]),
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
