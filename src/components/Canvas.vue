<template>
  <div id="canvas-container">
    <!-- :style="{ width: screenWidth+'px', height: screenHeight+'px'}" -->
    <canvas
      id="canvas"
      @mousedown="elMouseDown"
      @mouseup="elMouseUp"
      @mousemove="elMouseMove"
      @mouseleave="elMouseLeave"
      @mousewheel="elMouseWheel"
      @contextmenu="elContextMenu"
    ></canvas>
    <!-- :style="{ width: screenWidth+'px', height: screenHeight+'px'}" -->
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapGetters, mapMutations } from "vuex";

import {
  CanvasElement,
  CanvasScreen,
  PolygonElement,
  Point,
  ElementType,
  SelectSquareElement,
  collisionOnlyCheck,
  MoveType,
  collisionCheck,
  SquareElement,
  drawBoundingBox,
  CircleElement,
  LineElement
} from "@/libs/element";

export default Vue.extend({
  name: "Canvas",
  props: {
    insertElement: String
  },
  data() {
    return {
      canvas: null as HTMLCanvasElement | null,
      canvasContainer: null as HTMLDivElement | null,
      colliding: [] as CanvasElement[],
      collidedElement: null as CanvasElement | null,
      collisionResult: null as [CanvasElement, number, number] | null,
      context: null as CanvasRenderingContext2D | null,
      dragging: false,
      dragSelect: [] as CanvasElement[],
      drawingRect: null as SelectSquareElement | null,
      drawPoint: null as Point | null,
      keyMap: {
        shift: 16
      },
      keyPressed: [] as number[],
      keyToListen: [] as number[],
      moveCoords: null as { x: number; y: number } | null,
      mouseDown: false,
      mouseDownPoint: null as Point | null,
      mouseX: 0,
      mouseY: 0,
      newZoom: 0,
      originCoords: { x: 0, y: 0 } as { x: number; y: number },
      offset: { x: 0, y: 0 } as { x: number; y: number },
      panPoint: { x: 0, y: 0 } as { x: number; y: number },
      pointSelected: null as {
        element: CanvasElement;
        x: number;
        y: number;
      } | null,
      rectWidth: 100,
      // screen: null as CanvasScreen | null,
      screenWidth: 0,
      screenHeight: 0,
      selecting: [] as CanvasElement[],
      selectRect: null as SelectSquareElement | null,
      temp: null as Point | null,
      translateX: 0,
      translateY: 0,
      zoom: 0,
      zoomRange: { min: 1, max: 4 }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    ...mapMutations(["setScreen"]),
    init() {
      this.keyToListen = Object.values(this.keyMap);

      window.addEventListener("resize", this.elResize);
      window.addEventListener("keydown", this.elKeyDown);
      window.addEventListener("keyup", this.elKeyUp);
      window.addEventListener("mouseup", this.elWindowMouseUp);

      const { innerWidth, innerHeight }: Window = window as Window;
      this.screenWidth = innerWidth;
      this.screenHeight = innerHeight;

      this.canvasContainer = <HTMLDivElement>(
        document.getElementById("canvas-container")
      );
      this.canvas = <HTMLCanvasElement>document.getElementById("canvas");

      if (this.canvas) {
        this.canvasContainer.style.width = `${innerWidth}px`;
        this.canvasContainer.style.height = `${innerHeight}px`;
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
        this.context = <CanvasRenderingContext2D>this.canvas.getContext("2d");
        // this.context.translate(0, 0);
        // this.context.scale(2, 2);
        // this.context.translate(-innerWidth / 4, -innerHeight / 4);
        // this.context.translate(0, 0);
      }
      this.colliding = [];
      this.selecting = [];

      // this.screen = new CanvasScreen(
      //   ElementType.Screen,
      //   new Point(0, 0),
      //   this.screenWidth,
      //   this.screenHeight
      // );

      this.setScreen(
        new CanvasScreen(
          ElementType.Screen,
          new Point(0, 0),
          this.screenWidth,
          this.screenHeight
        )
      );

      // console.log(this.screen);

      // Polygon
      this.screen.addChild(
        new PolygonElement(
          ElementType.Polygon,
          new Point(this.screen.point1.x + 500, this.screen.point1.x + 500),
          20
        )
      );

      this.screen.addChild(
        new SquareElement(ElementType.Square, new Point(700, 400), 200, 200)
      );

      this.screen.addChild(
        new CircleElement(ElementType.Circle, new Point(300, 400), 100)
      );

      this.render();
    },
    elMouseDown(event: MouseEvent) {
      let { offsetX: x, offsetY: y } = event;
      if (!x || !y) {
        x = event.clientX;
        y = event.clientY;
      }
      this.temp = new Point(x, y);

      this.panPoint = { x, y };

      this.mouseDown = true;
      this.mouseX = x;
      this.mouseY = y;
      this.moveCoords = { x, y };

      // this.context!.translate(x, y);

      this.selectRect = null;

      if (!this.keyPressed.includes(this.keyMap.shift) && !(this.selecting.length === 1 && this.selecting[0].type === ElementType.Line)) {
        this.selecting = [];
      } else {
        this.drawPoint = new Point(x, y);
      }
    },
    elMouseUp(event: MouseEvent) {
      event.stopPropagation();
      this.mouseUp(event);
    },
    elWindowMouseUp() {
      this.mouseUp();
    },
    mouseUp(event: MouseEvent | null = null) {
      // console.log("mouseup");
      this.mouseDown = false;
      this.mouseDownPoint = null;
      if (this.temp !== null && !this.dragging) {
        this.mouseDownPoint = this.temp;
        this.temp = null;
      }
      this.moveCoords = null;
      this.mouseX = this.screenWidth * 10;
      this.mouseY = this.screenHeight * 10;

      // if (drawPoint !== null && event !== null) {
      //   // selectRect = new CanvasSelectSquareElement(ElementType.Square, 0, 0, drawPoint, new Point(event.offsetX, event.offsetY));
      //   // console.log(selectRect);
      // }

      this.selectRect = null;
      this.drawPoint = null;
      this.collidedElement = null;
      this.collisionResult = null;
      this.dragging = false;
      if (this.dragSelect.length) {
        this.selecting = this.selecting.concat(this.dragSelect);
      }

      // if (selecting.length) {
      //   drawingRect = drawBoundingBox();
      // }
      // new CanvasSelectSquareElement(ElementType.Square, 0, 0, drawPoint, new Point(event.offsetX, event.offsetY))
      // const drawingBox = drawBoundingBox();
    },
    elMouseLeave() {
      // console.log("mouseleave");
      this.mouseX = this.screenWidth * 10;
      this.mouseY = this.screenHeight * 10;
    },
    elMouseMove(event: MouseEvent) {
      let { offsetX: x, offsetY: y } = event;
      if (!x || !y) {
        x = event.clientX;
        y = event.clientY;
      }
      // const { movementX, movementY } = event;
      // console.log(movementX, movementY);
      if (this.mouseDown) {
        this.dragging = true;
        // console.log(event);
      }

      if (this.moveCoords !== null) {
        this.moveCoords = { x, y };
      }

      if (this.dragging) {
        // distance the mouse move since previous
        const dx = x - this.panPoint.x;
        const dy = y - this.panPoint.y;
        // set x and y for next move
        this.panPoint = { x, y };

        // // update offset
        // this.offset.x += dx;
        // this.offset.y += dy;
      }

      this.mouseX = x;
      this.mouseY = y;
      // this.mouseX = clamp(x, screen.point1.x + 20, screen.point2.x - 20 + 50 * ratio);
      // this.mouseY = clamp(y, screen.point1.y + 20, screen.point2.y - 20 + 50);

      if (this.drawPoint !== null && event !== null) {
        let minWidth = x - this.drawPoint.x;
        let minHeight = y - this.drawPoint.y;

        // if (minWidth < 0) minWidth *= 1;
        // if (minHeight < 0) minHeight *= 1;
        // console.log(this.drawPoint, { x: x, y: y });
        if (this.selectRect === null) {
          this.selectRect = new SelectSquareElement(
            ElementType.Select,
            this.drawPoint,
            minWidth,
            minHeight
          );
        } else {
          this.selectRect.updateSize({ width: minWidth, height: minHeight });
        }
        // let minX: Number | null = null;
        // let maxX: Number | null = null;
        // let minY: Number | null = null;
        // let maxY: Number | null = null;

        // let width = 0;
        // let height = 0;

        //   const [point1, point2] = child.boundingBox;
        //   if (minX === null || point1.x.valueOf() < minX) minX = point1.x;
        //   if (minX === null || point2.x.valueOf() < minX) minX = point2.x;
        //   if (maxX === null || point1.x.valueOf() > maxX) maxX = point1.x;
        //   if (maxX === null || point2.x.valueOf() > maxX) maxX = point2.x;

        //   if (minY === null || point1.y.valueOf() < minY) minY = point1.y;
        //   if (minY === null || point2.y.valueOf() < minY) minY = point2.y;
        //   if (maxY === null || point1.y.valueOf() > maxY) maxY = point1.y;
        //   if (maxY === null || point2.y.valueOf() > maxY) maxY = point2.y;
        //   if (minX !== null && maxX !== null && minY !== null && maxY !== null) {
        //     width = maxX.valueOf() - minX.valueOf();
        //     height = maxY.valueOf() - minY.valueOf();
        //   }

        // return new CanvasSelectSquareElement(ElementType.Square, new Point(minX!, minY!), width, height);
        // selectRect = new CanvasSelectSquareElement(ElementType.Square, drawPoint, event.clientX - drawPoint.x.valueOf(),  event.clientY - drawPoint.y.valueOf());
        // console.log(selectRect);
      }
    },
    elMouseWheel(event: MouseWheelEvent) {
      const { deltaY } = event;
      // console.log(event);
      if (deltaY < 0) {
        // zoomin
        if (this.zoom < this.zoomRange.max) {
          this.newZoom += 1;
        }
      } else {
        // zoom in
        if (this.zoom > this.zoomRange.min) {
          this.newZoom -= 1;
        }
      }
    },
    elContextMenu(event: MouseEvent) {
      event.stopPropagation();
      event.preventDefault();
    },
    elKeyDown(event: KeyboardEvent) {
      const keyCode = event.keyCode;
      if (
        this.keyToListen.includes(keyCode) &&
        !this.keyPressed.includes(keyCode)
      ) {
        this.keyPressed.push(keyCode);
      }
    },
    elKeyUp(event: KeyboardEvent) {
      const keyCode = event.keyCode;
      const idx = this.keyPressed.indexOf(keyCode);
      if (this.keyToListen.includes(keyCode) && idx !== -1) {
        this.keyPressed.splice(idx, 1);
      }
      // // console.log(keyCode);
      // if (this.context) {
      //   if (keyCode === 37) { // left
      //     this.context.translate(-10, 0);
      //   } else if (keyCode === 39) {
      //     this.context.translate(10, 0); // right
      //   }
      // }
    },
    render() {
      if (this.screen && this.context) {
        // this.context.setTransform(1, 0, 0, 1, 0, 0);
        // if (this.zoom !== this.newZoom) {
        //   const zoom = Math.max(1, this.newZoom);
        //   this.zoom = zoom;
        //   this.newZoom = zoom;
        //   // this.translateX
        //   this.context.setTransform(zoom, 0, 0, zoom, 0, 0);

        //   // this.context.scale(
        //   //   2,
        //   //   2
        //   //   // Math.max(1, zoom),
        //   //   // Math.max(1, zoom)
        //   //   // this.zoom,
        //   //   // this.zoom
        //   //   // 1 + this.zoom / this.zoomRange.max,
        //   //   // 1 + this.zoom / this.zoomRange.max
        //   // );
        //   // this.context.translate(
        //   //   this.screenWidth / 4,
        //   //   this.screenHeight / 4
        //   //   // this.screenWidth / zoom,
        //   //   // this.screenHeight / zoom
        //   // );
        // }

        const point = new Point(this.mouseX, this.mouseY);
        // if (mouseDownPoint !== null) {
        //   point = mouseDownPoint;
        // }

        // Dragging
        if (
          this.dragging &&
          this.temp &&
          this.moveCoords &&
          !this.keyPressed.includes(this.keyMap.shift)
        ) {
          // if (!this.collidedElement) {
          if (!this.collisionResult) {
            // this.collisionResult = collisionOnlyCheck(screen, this.temp);

            this.collisionResult = collisionOnlyCheck(
              this.screen,
              new Point(this.moveCoords.x, this.moveCoords.y)
            );

            // console.log(this.collisionResult);
            // [this.collidedElement,] = this.collisionResult!;
          }

          if (this.collisionResult) {
            let movement = MoveType.None;
            let dx: number = 0;
            let dy: number = 0;

            let [, x, y] = this.collisionResult;
            if (this.collidedElement === null) {
              [this.collidedElement, x, y] = this.collisionResult;
            }
            dx = this.moveCoords.x - (this.collidedElement!.point1.x + x);
            dy = this.moveCoords.y - (this.collidedElement!.point1.y + y);

            let xOffset = 1;
            let yOffset = 1;

            if (dx > 0 && dy > 0) {
              movement = MoveType.DownLeft;
              yOffset *= -1;
            } else if (dx < 0 && dy > 0) {
              movement = MoveType.DownRight;
              yOffset *= -1;
              xOffset *= -1;
            } else if (dx === 0 && dy > 0) {
              movement = MoveType.Down;
              yOffset *= -1;
            } else if (dx === 0 && dy < 0) {
              movement = MoveType.Up;
            } else if (dx > 0 && dy < 0) {
              movement = MoveType.UpLeft;
            } else if (dx < 0 && dy < 0) {
              movement = MoveType.UpRight;
              xOffset *= -1;
            } else if (dx < 0 && dy === 0) {
              movement = MoveType.Left;
            } else if (dx > 0 && dy === 0) {
              movement = MoveType.Right;
              xOffset *= -1;
            }
            // console.log(collidedElement === screen);
            // console.log(dx, dy);
            // console.log(dx * xOffset, dy * yOffset);

            this.collidedElement.updatePoint(dx, dy);
            // collidedElement.updateOffset(dx * xOffset, dy * yOffset);
            // // console.log(moveMap[movement], xOffset * dx, yOffset * dy);
          } else {
            // let x: number = 0;
            // let y: number = 0;
            // if (this.offset) {
            //   x = this.moveCoords.x - this.offset.x;
            //   y = this.moveCoords.y - this.offset.y;
            //   if (this.offset.x !== x || this.offset.y !== y) {
            //     console.log(x, y);
            //     // console.log("pan", x, y);
            //     this.context.translate(x, y);
            //     this.offset = { x, y };
            //   }
            // }
            // if (this.temp.x < this.moveCoords.x) {
            //   x = this.moveCoords.x - this.temp.x;
            // } else {
            //   x = this.temp.x - this.moveCoords.x;
            // }
            // if (this.temp.y < this.moveCoords.y) {
            //   y = this.moveCoords.y - this.temp.y;
            // } else {
            //   y = this.temp.y - this.moveCoords.y;
            // }
            // // console.log(keyCode);
            // if (this.context) {
            //   if (keyCode === 37) {
            //     this.context.translate(-10, 0);
            //   } else if (keyCode === 39) {
            //     this.context.translate(10, 0);
            //   }
            // }
          }
          // console.log('dragging', temp, selecting.length);

          // console.log(collided);
          // const collidedElement = new CanvasSelectSquareElement(ElementType.Square, 0, 0, collided.boundingBox[0], collided.boundingBox[1]);
          // collidedElement.render(context, colliding, selecting.concat(dragSelect));
        }

        // Check point collision with children of screen
        // const colliding: CanvasElement[] = [];
        const [colliding, selecting] = collisionCheck(
          this.screen,
          point,
          this.mouseDown,
          false,
          true,
          null,
          this.mouseDownPoint,
          this.selecting
        );

        this.selecting = selecting;
        // , selecting
        // if (this.selecting.length) {
        //   this.selecting = this.selecting.concat(this.selecting);
        // }

        this.dragSelect = [];

        if (this.selectRect !== null) {
          let minX = this.selectRect!.point1.x;
          let minY = this.selectRect!.point1.y;
          let maxX = minX + this.selectRect!.minWidth;
          let maxY = minY + this.selectRect!.minHeight;

          if (this.selectRect!.minWidth < 0) {
            minX = this.selectRect!.minWidth + minX;
            maxX = this.selectRect!.point1.x;
          }

          if (this.selectRect!.minHeight < 0) {
            minY = this.selectRect!.minHeight + minY;
            maxY = this.selectRect!.point1.y;
          }

          this.screen.children.forEach((child: CanvasElement) => {
            if (child.boundingBox.length) {
              let cMinX = child!.boundingBox[0].x;
              let cMinY = child!.boundingBox[0].y;
              let cMaxX = child!.boundingBox[1].y;
              let cMaxY = child!.boundingBox[1].y;

              // const child = <SquareElement>_child;
              // let cMinX = child!.point1.x;
              // let cMinY = child!.point1.y;
              // let cMaxX = cMinX + child!.minWidth;
              // let cMaxY = cMinY + child!.minHeight;

              // if (child!.minWidth < 0) {
              //   cMinX = child!.minWidth + cMinX;
              //   cMaxX = child!.point1.x;
              // }

              // if (child!.minHeight < 0) {
              //   cMinY = child!.minHeight + cMinY;
              //   cMaxY = child!.point1.y;
              // }

              if (
                minX <= cMinX &&
                minY <= cMinY &&
                maxX >= cMaxX &&
                maxY >= cMaxY
              ) {
                if (!this.selecting.includes(child)) {
                  if (!this.dragSelect.includes(child)) {
                    this.dragSelect.push(child);
                  } else {
                    this.selecting.splice(this.selecting.indexOf(child), 1);
                  }
                }
              }
            }
          });
        }

        const allSelected = this.selecting.concat(this.dragSelect);
        // && !allSelected.length

        // insert element
        if (this.insertElement && this.mouseDownPoint) {
          this.insertElementToScreen();
        }

        if (this.selecting.length === 1 && this.selecting[0].type === ElementType.Line && this.drawPoint) {
          (this.selecting[0] as LineElement).addPoint(this.drawPoint);
        }

        // if (maxDepth !== 0) {
        //   console.log(maxDepth, point);
        // }
        // rotate in circle
        // x = Math.cos(angle) * baseRadius;
        // y = Math.sin(angle) * baseRadius;
        // circle.updatePoint(new Point(x + centerX, y + centerY));

        // Update point
        // x = Math.cos(angle) * offset;
        // y = Math.sin(angle) * offset;

        // const point = new Point(x, y);
        // reticle.updatePoint(point);

        // Scale
        // radius = Math.sin(angle) * offset * 30 + baseRadius;
        // circle.updateRadius(radius);

        // Mouse move circle
        // mouseCircle.updatePoint(point);

        // Test collision
        // if (circlePointCollision(circle.point1, mouseCircle)) {
        //   mouseCircle.updateAlpha(1);
        // } else {
        //   mouseCircle.updateAlpha(0);
        // }
        // circle.updateAlpha(baseAlpha + Math.sin(angle) * offset);

        this.context.clearRect(0, 0, this.screenWidth, this.screenHeight);
        // Render element
        this.screen.render(this.context, this.offset, colliding, allSelected);

        // Render highlight box
        if (this.selectRect) {
          this.selectRect.render(
            this.context,
            this.offset,
            colliding,
            allSelected
          );
        }

        // Render box for containing selected elements
        if (this.selecting.length) {
          this.drawingRect = drawBoundingBox(this.selecting);
          if (this.drawingRect) {
            this.drawingRect.render(
              this.context,
              this.offset,
              colliding,
              allSelected
            );
          }
        }

        this.mouseDownPoint = null;
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
    },
    insertElementToScreen() {
      if (this.screen && this.mouseDownPoint) {
        this.$emit("element-inserted");
        // console.log(this.insertElement);
        if (this.insertElement === "square") {
          this.screen.addChild(
            new SquareElement(
              ElementType.Square,
              new Point(this.mouseDownPoint.x, this.mouseDownPoint.y),
              this.rectWidth,
              this.rectWidth
            )
          );
        } else if (this.insertElement === "circle") {
          this.screen.addChild(
            new CircleElement(
              ElementType.Circle,
              new Point(this.mouseDownPoint.x, this.mouseDownPoint.y),
              this.rectWidth / 2
            )
          );
        } else if (this.insertElement === "polygon") {
          this.screen.addChild(
            new PolygonElement(
              ElementType.Polygon,
              new Point(this.mouseDownPoint.x, this.mouseDownPoint.y),
              5
            )
          );
        } else if (this.insertElement === "line") {
          const line = new LineElement(
            ElementType.Line,
            new Point(this.mouseDownPoint.x, this.mouseDownPoint.y)
          );
          this.screen.addChild(line);
          // line.addPoint(
          //   new Point(this.mouseDownPoint.x + 100, this.mouseDownPoint.y)
          // );
          // line.addPoint(
          //   new Point(this.mouseDownPoint.x + 200, this.mouseDownPoint.y + 100)
          // );
          // this.selecting.push(line);
        }
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.elResize);
    window.removeEventListener("keydown", this.elKeyDown);
    window.removeEventListener("keyup", this.elKeyUp);
    window.removeEventListener("mouseup", this.elWindowMouseUp);
  },
  computed: {
    ...mapGetters(["screen"])
  }
  // watch: {
  //   screen: {
  //     handler() {
  //       this.$emit("update-screen-data", this.screen);
  //     },
  //     deep: true,
  //     immediate: true
  //   }
  // }
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
