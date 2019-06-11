// https://stackoverflow.com/questions/33925012/how-to-pan-the-canvas
class Zoom {
  x: number = 0;
  y: number = 0;
  ox: number = 0;
  oy: number = 0;
  scale: number = 0;
  dx: number = 0;
  dy: number = 0;
  dox: number = 0;
  doy: number = 0;
  dscale: number = 0;
  step: number = 0.5;
  speed: number = 0.5;
  mX: number = 0;
  mY: number = 0;
  xScale: number = 0;
  yScale: number = 0;

  constructor() {}

  update(
    context: CanvasRenderingContext2D,
    mouseX: number,
    mouseY: number,
    oMouseX: number,
    oMouseY: number
  ) {
    this.dx += (this.x - this.step) * this.speed;
    this.dy += (this.y - this.step) * this.speed;
    this.dox += (this.ox - this.step) * this.speed;
    this.doy += (this.oy - this.step) * this.speed;
    this.dscale += (this.scale - this.step) * this.speed;

    this.xScale = this.step;
    this.yScale = this.step;

    let det = this.xScale * this.yScale;

    let mx = 0;
    let my = 0;

    return { x: mx, y: my };
  }
}

export { Zoom };
