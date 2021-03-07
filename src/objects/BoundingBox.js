import {Shape} from './Shape.js';

export class BoundingBox extends Shape {
    constructor(shape) {
        super(0);
        this.shape = shape;
        this.type = 'bounding box';
    }

    draw(context) {
        if (this.shape) {
            context.strokeStyle = '#0388fc';
            context.beginPath();
            context.rect(this.shape.initX, this.shape.initY, this.shape.finalX - this.shape.initX, this.shape.finalY - this.shape.initY);
            context.closePath();
            context.stroke();
            context.strokeStyle = '#000000';
        }
    }

}