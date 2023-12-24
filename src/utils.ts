import { Point } from "./point";

export function calculateDistance(pointA: Point, pointB: Point): number {
    return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
}