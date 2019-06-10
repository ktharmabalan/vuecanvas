// https://github.com/webtunings/canvas-examples
import {
  squarePointCollision,
  circlePointCollision,
  pointDistance,
  boundingPointCollision,
} from './utils';

enum ElementType {
  Square,
  Circle,
  Polygon,
  Line,
  Reticle,
  Screen,
  Select,
}

enum MoveType {
  None,
  Up,
  UpRight,
  Right,
  DownRight,
  Down,
  DownLeft,
  Left,
  UpLeft,
}

const points = [3, 4, 5, 6, 7, 8, 9, 10, 11];
const angles = [30, 45, 198, 30, 13, 22, 30, 36, 41];

const drawMini = true;
const drawBoundSquare = true;
const smallBoxSize = 10;
const boundType = ElementType.Circle; // 'square';

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const drawBoundItem = (context: CanvasRenderingContext2D, points: { x: number, y: number }[], offset: { x: number, y: number }) => {
  if (boundType === ElementType.Circle) {
    context.strokeStyle = "#a9a9a9";
    points.forEach(({ x, y }) => {
      context.beginPath();
      context.arc(x + offset.x, y + offset.y, smallBoxSize / 2, 0, Math.PI * 2, false);
      context.stroke();
      context.fillStyle = '#FFF';
      // context.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      context.fill();
    })
    // context.closePath();
  } else if (boundType === ElementType.Square) {
    points.forEach(({ x, y }) => {
      context.strokeRect(
        (x + offset.x) - smallBoxSize / 2,
        (y + offset.y) - smallBoxSize / 2,
        smallBoxSize,
        smallBoxSize,
      );
    });
  }
}

interface CanvasInterface {
  type: ElementType;
  children: CanvasElement[];
  isColliding: Boolean;
  isSelected: Boolean;
  boundingBox: Point[];
  point1: Point;
  render: (
    context: CanvasRenderingContext2D,
    offset: { x: number, y: number },
    colliding: CanvasElement[],
    selecting: CanvasElement[],
  ) => void;
  addChild: (child: CanvasElement) => void;
  removeChild: (child: CanvasElement) => void;
  checkCollision: (point: Point) => Boolean;
  select: (selected: Boolean) => void;
  updatePoint: (x: number, y: number) => void;
}

class CanvasElement implements CanvasInterface {
  isSelected: Boolean;
  type: ElementType;
  boundingBox: Point[];
  point1: Point;
  children: CanvasElement[];
  isColliding: Boolean;
  minWidth: number;
  minHeight: number;

  constructor(type: ElementType, point: Point) {
    this.point1 = point;
    this.type = type;
    this.children = [];
    this.isColliding = false;
    this.boundingBox = [];
    this.minWidth = 0;
    this.minHeight = 0;
    this.isSelected = false;
  }

  render(
    context: CanvasRenderingContext2D,
    offset: { x: number, y: number },
    colliding: CanvasElement[],
    selecting: CanvasElement[],
  ): void {
    // console.log(`Called from ${ElementType[this.type]}`)
    this.children.forEach((child) => {
      child.render(context, offset, colliding, selecting);
    });
  }

  addChild(child: CanvasElement): void {
    this.children.push(child);
  }

  removeChild(child: CanvasElement): void {
    const idx = this.children.indexOf(child);
    this.children.splice(idx);
  }

  select(selected: Boolean): void {
    this.isSelected = selected;
  }

  checkCollision(target: Point | CanvasElement): Boolean {
    let colliding = false;
    if (target instanceof Point) {
      colliding = boundingPointCollision(target, this.boundingBox);
      // if (this instanceof BaseSquareElement) {
      //   colliding = squarePointCollision(target, this);
      // } else if (this instanceof CircleElement) {
      //   colliding = circlePointCollision(target, this);
      // } else if (this instanceof PolygonElement) {
      //   colliding = boundingPointCollision(target, this.boundingBox);
      //   // } else if (this instanceof LineElement) {
      //   //   colliding = boundingPointCollision(target, this.boundingBox);
      // }
    }
    return colliding;
  }

  updatePoint(x: number, y: number) { }

  drawBounding(context: CanvasRenderingContext2D, offset: { x: number, y: number }) {
    const topLeft = { x: this.boundingBox[0].x, y: this.boundingBox[0].y };
    const topRight = { x: this.boundingBox[1].x, y: this.boundingBox[0].y };
    const bottomLeft = { x: this.boundingBox[0].x, y: this.boundingBox[1].y };
    const bottomRight = {
      x: this.boundingBox[1].x,
      y: this.boundingBox[1].y,
    };

    if (drawMini || drawBoundSquare) {
      context.strokeStyle = '#2f7cff';
      context.lineWidth = 1;

      if (drawBoundSquare) {
        context.strokeRect(
          topLeft.x + offset.x,
          topLeft.y + offset.y,
          bottomRight.x - topLeft.x,
          bottomRight.y - topLeft.y,
        );
      }

      if (drawMini) {
        const middleLeft = {
          x: this.boundingBox[0].x,
          y: (this.boundingBox[0].y + this.boundingBox[1].y) / 2,
        };
        const middleRight = {
          x: this.boundingBox[1].x,
          y: (this.boundingBox[0].y + this.boundingBox[1].y) / 2,
        };
        const topCenter = {
          x: (this.boundingBox[0].x + this.boundingBox[1].x) / 2,
          y: this.boundingBox[0].y,
        };
        const bottomCenter = {
          x: (this.boundingBox[0].x + this.boundingBox[1].x) / 2,
          y: this.boundingBox[1].y,
        };

        drawBoundItem(context, [
          { x: topLeft.x, y: topLeft.y },
          { x: topRight.x, y: topRight.y },
          { x: bottomLeft.x, y: bottomLeft.y },
          { x: bottomRight.x, y: bottomRight.y },
          { x: middleLeft.x, y: middleLeft.y },
          { x: middleRight.x, y: middleRight.y },
          { x: topCenter.x, y: topCenter.y },
          { x: bottomCenter.x, y: bottomCenter.y },
        ], offset);
      }
    }
  }
}

class PolygonElement extends CanvasElement {
  numPoints: number;
  pointsList: Point[];
  width: number;

  constructor(type: ElementType, point: Point, numPoint: number) {
    super(type, point);
    const width = 100;
    this.width = width;
    this.numPoints = numPoint;
    // let numPoints = 5;
    // if (numPoints < 3) numPoints = 3;
    // else if (numPoints > 360) numPoints = 360;

    // let numPoints = 3;
    const polygonAngle = angles[points.indexOf(numPoint)] || 0; // 0-90
    this.pointsList = [];

    let minWidth = 0;
    let minHeight = 0;
    let minX: number | null = null;
    let minY: number | null = null;
    let maxX: number | null = null;
    let maxY: number | null = null;
    let x = 0;
    let y = 0;
    let angle = polygonAngle * (Math.PI / 180);
    for (let index = 0; index < numPoint; index++) {
      x = width * Math.cos(angle);
      y = width * Math.sin(angle);
      const coord: Point = new Point(x, y);
      this.pointsList.push(coord);
      angle += (2 * Math.PI) / numPoint;

      if (minX === null || x < minX) minX = x;
      if (minX === null || x < minX) minX = x;
      if (maxX === null || x > maxX) maxX = x;
      if (maxX === null || x > maxX) maxX = x;

      if (minY === null || y < minY) minY = y;
      if (minY === null || y < minY) minY = y;
      if (maxY === null || y > maxY) maxY = y;
      if (maxY === null || y > maxY) maxY = y;

      if (minX !== null && maxX !== null && minY !== null && maxY !== null) {
        minWidth = maxX - minX;
        minHeight = maxY - minY;
      }
    }

    if (minX && minY && maxX && maxY) {
      this.boundingBox = [
        new Point(point.x + minX, point.y + minY),
        new Point(point.x + maxX, point.y + maxY),
      ];
    }
  }

  render(
    context: CanvasRenderingContext2D,
    offset: { x: number, y: number },
    colliding: CanvasElement[],
    selecting: CanvasElement[],
  ): void {
    const pointsList = this.pointsList;
    const size = pointsList.length;

    context.lineWidth = 3;
    context.strokeStyle = '#1a1a1a';

    context.beginPath();
    // Draw center
    context.arc(this.point1.x + offset.x, this.point1.y + offset.y, 1, 0, Math.PI * 2, false);

    // Move to first coordinate
    context.moveTo(
      this.point1.x + pointsList[0].x + offset.x,
      this.point1.y + pointsList[0].y + offset.y,
    );

    for (let index = 1; index < size; index++) {
      context.lineTo(
        this.point1.x + pointsList[index].x + offset.x,
        this.point1.y + pointsList[index].y + offset.y,
      );
    }

    // context.lineTo(this.point1.x + pointsList[0].x, this.point1.y + pointsList[0].y);

    context.closePath();
    context.stroke();

    if (selecting.length === 1 && selecting.includes(this)) {
      super.drawBounding(context, offset);
    }
    super.render(context, offset, colliding, selecting);
  }

  updatePoint(x: number, y: number): void {
    this.point1.x += x;
    this.point1.y += y;
    const numPoint = this.numPoints;
    const width = this.width;
    const polygonAngle = angles[points.indexOf(numPoint)] || 0; // 0-90
    this.pointsList = [];
    let minX: number | null = null;
    let minY: number | null = null;
    let maxX: number | null = null;
    let maxY: number | null = null;

    let _x = 0;
    let _y = 0;
    let angle = polygonAngle * (Math.PI / 180);

    for (let index = 0; index < numPoint; index++) {
      _x = width * Math.cos(angle);
      _y = width * Math.sin(angle);
      const coord: Point = new Point(_x, _y);
      this.pointsList.push(coord);
      angle += (2 * Math.PI) / numPoint;

      if (minX === null || _x < minX) minX = _x;
      if (minX === null || _x < minX) minX = _x;
      if (maxX === null || _x > maxX) maxX = _x;
      if (maxX === null || _x > maxX) maxX = _x;

      if (minY === null || _y < minY) minY = _y;
      if (minY === null || _y < minY) minY = _y;
      if (maxY === null || _y > maxY) maxY = _y;
      if (maxY === null || _y > maxY) maxY = _y;
    }

    if (minX && minY && maxX && maxY) {
      this.boundingBox = [
        new Point(this.point1.x + minX, this.point1.y + minY),
        new Point(this.point1.x + maxX, this.point1.y + maxY),
      ];
    }
  }

  // checkCollision(target: Point | CanvasElement): Boolean {
  //   let collided = super.checkCollision(target);
  //   // console.log(target, this);
  //   if (collided) {
  //     const topLeft = { x: this.boundingBox[0].x, y: this.boundingBox[0].y };
  //     const topRight = { x: this.boundingBox[1].x, y: this.boundingBox[0].y };
  //     const bottomLeft = { x: this.boundingBox[0].x, y: this.boundingBox[1].y };
  //     const bottomRight = {
  //       x: this.boundingBox[1].x,
  //       y: this.boundingBox[1].y,
  //     };

  //     const middleLeft = {
  //       x: this.boundingBox[0].x,
  //       y: (this.boundingBox[0].y + this.boundingBox[1].y) / 2,
  //     };
  //     const middleRight = {
  //       x: this.boundingBox[1].x,
  //       y: (this.boundingBox[0].y + this.boundingBox[1].y) / 2,
  //     };
  //     const topCenter = {
  //       x: (this.boundingBox[0].x + this.boundingBox[1].x) / 2,
  //       y: this.boundingBox[0].y,
  //     };
  //     const bottomCenter = {
  //       x: (this.boundingBox[0].x + this.boundingBox[1].x) / 2,
  //       y: this.boundingBox[1].y,
  //     };

  //     const points = [{ x: topLeft.x, y: topLeft.y },
  //     { x: topRight.x, y: topRight.y },
  //     { x: bottomLeft.x, y: bottomLeft.y },
  //     { x: bottomRight.x, y: bottomRight.y },
  //     { x: middleLeft.x, y: middleLeft.y },
  //     { x: middleRight.x, y: middleRight.y },
  //     { x: topCenter.x, y: topCenter.y },
  //     { x: bottomCenter.x, y: bottomCenter.y }]

  //     let childCollided = false;
  //     for (let index = 0; index < points.length; index++) {
  //       let point = points[index];
  //       childCollided = pointDistance(target as Point, point) < (smallBoxSize / 2);
  //       if (childCollided) {
  //         console.log('collided with', index);
  //         // context.strokeStyle = "#a9a9a9";
  //         // context.beginPath();
  //         // context.arc(x + offset.x, y + offset.y, smallBoxSize / 2, 0, Math.PI * 2, false);
  //         // context.stroke();
  //         // context.fillStyle = '#FFF';
  //         // // context.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
  //         // context.fill();
  //         break;
  //       }
  //     }


  //     // let collided = false;
  //     // let point = this.point1;
  //     // collided = pointDistance(target as Point, point) < (smallBoxSize / 2);
  //     // if (!collided) {
  //     //   for (let index = 0; index < this.points.length; index++) {
  //     //     point = this.points[index];
  //     //     collided = pointDistance(target as Point, point) < (smallBoxSize / 2);
  //     //     if (collided) {
  //     //       break;
  //     //     }
  //     //   }
  //     // }
  //   }
  //   return collided;
  // }
}

class BaseSquareElement extends CanvasElement {
  minWidth: number;
  minHeight: number;

  constructor(
    type: ElementType,
    point: Point,
    minWidth: number,
    minHeight: number,
  ) {
    super(type, point);
    this.minWidth = minWidth;
    this.minHeight = minHeight;

    // if (point1 && point2) {
    //   this.point1 = point1;
    //   this.point2 = point2;
    // } else if (point1 && !point2) {
    //   this.point1 = point1;
    //   this.point2 = new Point(this.point1.x + minWidth, this.point1.y + minHeight);
    // } else {
    //   this.point1 = new Point(0, 0);
    //   this.point2 = new Point(this.point1.x + minWidth, this.point1.y + minHeight);
    // }

    // prev
    // const minX: number = Math.min(this.point1.x, this.point1.x + minWidth);
    // const maxX: number = Math.max(this.point1.x, this.point1.x + minWidth);
    // const minY: number = Math.min(this.point1.y, this.point1.y + minHeight);
    // const maxY: number = Math.max(this.point1.y, this.point1.y + minHeight);

    // this.point1 = new Point(minX, minY);
    // this.boundingBox = [this.point1, new Point(maxX, maxY)];

    this.boundingBox = [
      this.point1,
      new Point(this.point1.x + minWidth, this.point1.y + minHeight),
    ];
  }

  updateSize(size: { width?: number; height?: number }) {
    if (size.width) {
      this.minWidth = size.width;
    }
    if (size.height) {
      this.minHeight = size.height;
    }

    this.boundingBox = [
      this.point1,
      new Point(this.point1.x + this.minWidth, this.point1.y + this.minHeight),
    ];
  }

  updatePoint(x: number, y: number) {
    let _x = this.point1.x + x;
    let _y = this.point1.y + y;
    this.point1.x = _x;
    this.point1.y = _y;
    // this.minWidth = _x + this.minWidth;
    // this.minHeight = _y + this.minHeight;
    this.boundingBox = [
      this.point1,
      new Point(_x + this.minWidth, _y + this.minHeight),
    ];
  }

  render(
    context: CanvasRenderingContext2D,
    offset: { x: number, y: number },
    colliding: CanvasElement[],
    selecting: CanvasElement[],
  ): void {
    super.render(context, offset, colliding, selecting);
  }
}

class SquareElement extends BaseSquareElement {
  render(
    context: CanvasRenderingContext2D,
    offset: { x: number, y: number },
    colliding: CanvasElement[],
    selecting: CanvasElement[],
  ): void {
    context.lineWidth = 3;
    context.strokeStyle = '#1a1a1a';
    context.fillStyle = 'rgba(255, 255, 255, 0)';

    context.strokeRect(
      this.point1.x + offset.x,
      this.point1.y + offset.y,
      this.minWidth,
      this.minHeight,
    );

    // context.fillRect(
    //   this.point1.x + offset.x,
    //   this.point1.y + offset.y,
    //   // this.point1.x + offset.x,
    //   // this.point1.y + offset.y,
    //   this.minWidth,
    //   this.minHeight,
    // );

    if (selecting.length === 1 && selecting.includes(this)) {
      super.drawBounding(context, offset);
    }

    super.render(context, offset, colliding, selecting);
  }
}

class SelectSquareElement extends BaseSquareElement {
  render(
    context: CanvasRenderingContext2D,
    offset: { x: number, y: number },
    colliding: CanvasElement[],
    selecting: CanvasElement[],
  ): void {
    context.lineWidth = 1;
    // context.strokeStyle = 'white';
    // context.strokeStyle = 'rgba(121, 169, 250, 1)';
    context.strokeStyle = 'rgba(21, 69, 250, 1)';
    // context.fillStyle = 'rgba(255, 255, 255, .2)';
    // context.fillStyle = 'rgba(202, 218, 245, .5)';
    // context.fillStyle = 'rgba(163, 194, 247, .5)';
    context.fillStyle = 'rgba(121, 169, 250, .5)';

    context.fillRect(
      this.point1.x,
      this.point1.y,
      this.minWidth,
      this.minHeight,
    );
    context.strokeRect(
      this.point1.x,
      this.point1.y,
      this.minWidth,
      this.minHeight,
    );

    super.render(context, offset, colliding, selecting);
  }
}

class CanvasScreen extends BaseSquareElement {
  render(
    context: CanvasRenderingContext2D,
    offset: { x: number, y: number },
    colliding: CanvasElement[],
    selecting: CanvasElement[],
  ): void {
    // context.lineWidth = 1;
    // context.strokeStyle = 'black';
    context.fillStyle = 'rgba(242, 242, 242, 1)';
    context.fillRect(
      this.point1.x,
      this.point1.y,
      this.minWidth,
      this.minHeight,
    );

    // if (this.isColliding) {
    // if (colliding.includes(this)) {
    //   context.lineWidth = 4;
    //   context.strokeStyle = 'green';
    //   context.strokeRect(this.point1.x, this.point1.y, this.point2.x, this.point2.y);
    //   context.stroke();
    // }
    super.render(context, offset, colliding, selecting);
  }
}

class LineElement extends CanvasElement {
  points: Point[];

  constructor(type: ElementType, point1: Point) {
    super(type, point1);
    this.points = [];
  }

  drawBounding(context: CanvasRenderingContext2D, offset: { x: number, y: number }) {
    if (drawMini) {
      const bounds: ({ x: number, y: number })[] = [];
      bounds.push({ x: this.point1.x, y: this.point1.y });
      this.points.forEach((point) => bounds.push({ x: point.x, y: point.y }));
      drawBoundItem(context, bounds, offset);
    }
  }

  render(
    context: CanvasRenderingContext2D,
    offset: { x: number, y: number },
    colliding: CanvasElement[],
    selecting: CanvasElement[],
  ): void {
    context.strokeStyle = '#1a1a1a';
    context.lineWidth = 3;
    // if (colliding.includes(this)) {
    //   context.strokeStyle = 'white';
    //   context.lineWidth = 2;
    // }

    context.beginPath();
    context.moveTo(this.point1.x, this.point1.y);
    this.points.forEach((point) => {
      context.lineTo(point.x, point.y);
    });
    context.stroke();

    this.drawBounding(context, offset);

    if (colliding.includes(this)) {
      // console.log('collided');
    }
    super.render(context, offset, colliding, selecting);
  }

  addPoint(point: Point) {
    this.points.push(point);
  }

  checkCollision(target: Point | CanvasElement): Boolean {
    // console.log(target, this);
    let collided = false;
    let point = this.point1;
    collided = pointDistance(target as Point, point) < (smallBoxSize / 2);
    if (!collided) {
      for (let index = 0; index < this.points.length; index++) {
        point = this.points[index];
        collided = pointDistance(target as Point, point) < (smallBoxSize / 2);
        if (collided) {
          break;
        }
      }
    }
    return collided;
  }
  // updatePoint(x: number, y: number): void {
  //   this.point1.x = this.point1.x + x;
  //   this.point1.y = this.point1.y + y;
  //   this.point2.x = this.point2.x + x;
  //   this.point2.y = this.point2.y + y;
  // }
}

class CircleElement extends CanvasElement {
  radius: number;
  alpha: number;

  constructor(type: ElementType, point: Point, radius: number) {
    super(type, point);
    this.alpha = 1;
    this.radius = radius;

    this.boundingBox = [
      new Point(this.point1.x - radius, this.point1.y - radius),
      new Point(this.point1.x + radius, this.point1.y + radius),
    ];
  }

  updatePoint(x: number, y: number): void {
    let _x = this.point1.x + x;
    let _y = this.point1.y + y;
    this.point1.x = _x;
    this.point1.y = _y;

    this.boundingBox = [
      new Point(_x - this.radius, _y - this.radius),
      new Point(_x + this.radius, _y + this.radius),
    ];
  }

  updateRadius(radius: number): void {
    this.radius = radius;
  }

  updateAlpha(alpha: number): void {
    this.alpha = alpha;
  }

  render(
    context: CanvasRenderingContext2D,
    offset: { x: number, y: number },
    colliding: CanvasElement[],
    selecting: CanvasElement[],
  ): void {
    context.lineWidth = 3;
    context.strokeStyle = '#1a1a1a';

    context.beginPath();
    context.arc(
      this.point1.x + offset.x,
      this.point1.y + offset.y,
      this.radius,
      0,
      Math.PI * 2,
      false,
    );
    context.closePath()
    context.stroke();

    // context.fillStyle = 'white';
    // context.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    // context.fill();

    if (selecting.length === 1 && selecting.includes(this)) {
      super.drawBounding(context, offset);
    }
    super.render(context, offset, colliding, selecting);
  }
}

class ReticleElement extends CanvasElement {
  constructor(type: ElementType, point: Point) {
    super(type, point);
  }

  updatePoint(x: number, y: number): void {
    this.children.forEach((child) => {
      (<LineElement>child).updatePoint(x, y);
    });
  }

  render(
    context: CanvasRenderingContext2D,
    offset: { x: number, y: number },
    colliding: CanvasElement[],
    selecting: CanvasElement[],
  ): void {
    context.strokeStyle = 'white';
    super.render(context, offset, colliding, selecting);
  }
}

const collisionCheck = (
  element: CanvasElement,
  movePoint: Point,
  mouseDown: Boolean,
  nested: Boolean,
  selectTop: Boolean = false,
  top: CanvasElement | null,
  clickPoint: Point | null,
  selecting: CanvasElement[]
): [CanvasElement[], CanvasElement[]] => {
  const children = element.children;
  const childrenCount = children.length;

  let colliding: CanvasElement[] = [];
  // let selecting: CanvasElement[] = [];

  if (selectTop) {
    for (let index = childrenCount - 1; index >= 0; index--) {
      const child = children[index];

      if (
        child.checkCollision(movePoint) &&
        !colliding.length &&
        !colliding.includes(child)
      ) {
        colliding.push(child);
      }

      if (clickPoint !== null && child.checkCollision(clickPoint)) {
        if (!mouseDown) {
          const idx = selecting.indexOf(child);
          // child.select(!child.isSelected);
          if (idx === -1) {
            selecting.push(child);
          } else {
            selecting.splice(idx, 1);
          }
          break;
        }
      }
    }
  } else {
    for (let index = 0; index < childrenCount; index++) {
      const child = children[index];
      const [colliding1, selecting1] = collisionCheck(
        child,
        movePoint,
        mouseDown,
        nested,
        selectTop,
        top,
        clickPoint,
        selecting,
      );
      colliding = colliding.concat(colliding1);
      selecting = selecting.concat(selecting1);

      if (child.checkCollision(movePoint) && !colliding.includes(child)) {
        colliding.push(child);
      }

      if (
        !mouseDown &&
        clickPoint !== null &&
        child.checkCollision(clickPoint) &&
        !selecting.includes(child)
      ) {
        // child.select(!child.isSelected);
        selecting.push(child);
      }
    }
  }

  return [colliding, selecting];
};

const collisionOnlyCheck = (
  element: CanvasElement,
  clickPoint: Point,
): [CanvasElement, number, number] | null => {
  const children = element.children;
  const childrenCount = children.length;

  let x = 0;
  let y = 0;
  let colliding: [CanvasElement, number, number] | null = null;

  for (let index = childrenCount - 1; index >= 0; index--) {
    const child = children[index];
    // if ([ElementType.Square, ElementType.Circle].includes(element.type)) {
    // if (child.checkCollision(clickPoint) && colliding === null && child.type === ElementType.Square && child !== screen) {
    if (
      child.checkCollision(clickPoint) &&
      colliding === null &&
      ![ElementType.Screen, ElementType.Select].includes(child.type)
    ) {
      const cElement: CanvasElement = child;
      x = clickPoint.x - cElement.point1.x;
      y = clickPoint.y - cElement.point1.y;
      colliding = [cElement, x, y];
      // console.log(x, y);
      break;
    }
  }

  return colliding;
};

const drawBoundingBox = (selecting: CanvasElement[]): SelectSquareElement | null => {
  if (selecting.length) {
    // console.log('inside');
    let minX: number | null = null;
    let maxX: number | null = null;
    let minY: number | null = null;
    let maxY: number | null = null;

    let width = 0;
    let height = 0;

    selecting.forEach((element) => {
      if (![ElementType.Screen, ElementType.Select].includes(element.type)) {
        const child = element;
        const [point1, point2] = child.boundingBox;
        if (minX === null || point1.x < minX) minX = point1.x;
        if (minX === null || point2.x < minX) minX = point2.x;
        if (maxX === null || point1.x > maxX) maxX = point1.x;
        if (maxX === null || point2.x > maxX) maxX = point2.x;

        if (minY === null || point1.y < minY) minY = point1.y;
        if (minY === null || point2.y < minY) minY = point2.y;
        if (maxY === null || point1.y > maxY) maxY = point1.y;
        if (maxY === null || point2.y > maxY) maxY = point2.y;

        if (minX !== null && maxX !== null && minY !== null && maxY !== null) {
          width = maxX - minX;
          height = maxY - minY;
        }
      }
    });

    return new SelectSquareElement(
      ElementType.Square,
      new Point(minX!, minY!),
      width,
      height,
    );
  }
  return null;
};

export {
  MoveType,
  CanvasElement,
  ElementType,
  Point,
  CanvasScreen,
  LineElement,
  SquareElement,
  SelectSquareElement,
  CircleElement,
  ReticleElement,
  PolygonElement,
  collisionCheck,
  collisionOnlyCheck,
  drawBoundingBox
};
