// Reference: https://www.youtube.com/channel/UCF6F8LdCSWlRwQm_hfA2bcQ
import {
  CircleElement,
  Point,
  SquareElement,
} from './element';

// take value within min-max range, and represent its position by a number between 0 and 1
const normalize = (value: number, min: number, max: number) => {
  return (value - min) / (max - min);
};

// lerp = linear interpolation
// convert normalized value into a value within a range
const lerp = (norm: number, min: number, max: number) => {
  return (max - min) * norm + min;
};

// map value in one range to a value on another
const map = (
  value: number,
  sourceMin: number,
  sourceMax: number,
  destMin: number,
  destMax: number,
) => {
  return lerp(normalize(value, sourceMin, sourceMax), destMin, destMax);
};

// Clamp value between min-max range
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
};

// Check if value is in range
const inRange = (value: number, min: number, max: number) => {
  return value >= Math.min(min, max) && value <= Math.max(min, max);
};

// caculate distance between two points
const pointDistance = (p1: Point, p2: Point) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// // caculate distance between two points
// const distance = (d1: {x: number, y: number}, d2: {x: number, y: number}) => {
//   const dx = d1.x - d2.x;
//   const dy = d1.y - d2.y;
//   return Math.sqrt(dx * dx + dy * dy);
// }

// caculate distance between two points
const circleDistance = (
  d1: CircleElement,
  d2: CircleElement,
): number => {
  const dx = d1.point1.x - d2.point1.x;
  const dy = d1.point1.y - d2.point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const rangeIntersect = (
  min1: number,
  min2: number,
  max1: number,
  max2: number,
): boolean => {
  return (
    Math.max(min1, max1) >=
    Math.min(min2, max2) &&
    Math.min(min1, max1) <=
    Math.max(min2, max2)
  );
};

const circleCollision = (
  c1: CircleElement,
  c2: CircleElement,
): boolean => {
  return circleDistance(c1, c2) <= c1.radius + c2.radius;
};

const circlePointCollision = (
  point: Point,
  circle: CircleElement,
): boolean => {
  return pointDistance(point, circle.point1) < circle.radius;
};

const squarePointCollision = (
  point: Point,
  square: SquareElement,
): boolean => {
  return (
    inRange(
      point.x,
      square.point1.x,
      square.point1.x + square.minWidth,
    ) &&
    inRange(
      point.y,
      square.point1.y,
      square.point1.y + square.minHeight,
    )
  );
};

const boundingPointCollision = (point: Point, square: Point[]): boolean => {
  return (
    inRange(
      point.x,
      square[0].x,
      square[1].x,
    ) &&
    inRange(
      point.y,
      square[0].y,
      square[1].y,
    )
  );
};

const squareSquareCollision = (
  square1: SquareElement,
  square2: SquareElement,
): boolean => {
  return (
    rangeIntersect(
      square1.point1.x,
      square1.point1.x + square1.minWidth,
      square2.point1.x,
      square2.point1.x + square2.minWidth,
    ) &&
    rangeIntersect(
      square1.point1.y,
      square1.point1.y + square1.minHeight,
      square2.point1.y,
      square2.point1.y + square2.minHeight,
    )
  );
};

export {
  clamp,
  pointDistance,
  circleCollision,
  circlePointCollision,
  squarePointCollision,
  boundingPointCollision,
};