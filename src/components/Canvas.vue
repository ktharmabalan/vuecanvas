<template>
  <div id="canvas-container" ref="canvasContainer">
    <!-- :style="{ width: screenWidth+'px', height: screenHeight+'px'}" -->
    <canvas id="canvas" ref="canvas" @mousedown="mouseDown" @mouseup="mouseUp" @mouseleave="mouseLeave"></canvas>
    <!-- :style="{ width: screenWidth+'px', height: screenHeight+'px'}" -->
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { CanvasElement, CanvasScreen, CanvasPolygonElement, Point, ElementType } from "@/libs/element";

export default Vue.extend({
  name: "Canvas",
  data() {
    return {
      canvasContainer: null as HTMLDivElement | null,
      canvas: null as HTMLCanvasElement | null,
      screen: null as CanvasScreen | null,
      context: null as CanvasRenderingContext2D | null,
      colliding: [] as CanvasElement[],
      selecting: [] as CanvasElement[],
      screenWidth: 0,
      screenHeight: 0,
    };
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      window.addEventListener('resize', this.elResize);
      const { innerWidth, innerHeight }: Window = window as Window;
      this.screenWidth = innerWidth;
      this.screenHeight = innerHeight;
      
      this.canvasContainer = <HTMLDivElement>document.getElementById('canvas-container');
      this.canvas = <HTMLCanvasElement>document.getElementById('canvas')

      if (this.canvas) {
        this.canvasContainer.style.width = `${innerWidth}px`;
        this.canvasContainer.style.height = `${innerHeight}px`;
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
        this.context = <CanvasRenderingContext2D> this.canvas.getContext('2d');
      }
      this.colliding = [];
      this.selecting = [];

      this.screen = new CanvasScreen(ElementType.Square, new Point(0, 0), this.screenWidth, this.screenHeight);
      
      // Polygon
      this.screen.addChild(new CanvasPolygonElement(ElementType.Polygon, new Point(this.screen.point1.x + 500, this.screen.point1.x + 500), 3));
      this.screen.addChild(new CanvasPolygonElement(ElementType.Polygon, new Point(500, 500), 3));
      // console.log(this.screen.children[1]);
      this.render();
    },
    mouseDown() {
      console.log('mousedown');
    },
    mouseUp() {
      console.log('mouseup');
    },
    mouseLeave() {
      console.log('mouseleave');
    },
    render() {
      if (this.screen && this.context) {
        this.screen.render(this.context, this.colliding, this.selecting);
        // this.context.lineWidth = 1;
        // this.context.strokeStyle = 'black';
        // this.context.beginPath();
        // this.context.arc(
        //   50,
        //   50,
        //   10,
        //   0,
        //   Math.PI * 2,
        //   false,
        // );
        // this.context.closePath();
        // this.context.stroke();
      }

      requestAnimationFrame(() => {
        this.render();
      });
    },
    elResize(event: Event) {
      const { innerWidth, innerHeight }: Window = event.target as Window;
      this.screenWidth = innerWidth;
      this.screenHeight = innerHeight;

      if (this.canvasContainer && this.canvas) {
        this.canvasContainer.style.width = `${innerWidth}px`;
        this.canvasContainer.style.height = `${innerHeight}px`;
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.elResize);
  }
});
</script>

<style scoped lang="less">
#canvas-container {
  height: 100vh;
  width: 100%;
  flex: 1;
  background-color: #efefef;
}
#canvas {
  width: 100%;
  height: 100%;
}
</style>
