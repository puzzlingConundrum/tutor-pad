import {Shape} from './Shape.js';

export class Rectangle extends Shape {
    constructor(initX, initY, finalX, finalY, color='#000000', z=0) {
        super(initX, initY, finalX, finalY, color, z);
    }

    draw(context) {
        context.beginPath();
        context.rect(this.initX, this.initY, this.finalX - this.initX, this.finalY - this.initY);
        context.closePath();
        context.stroke();
    }

    preview(context, initX, initY, finalX, finalY) {
        context.beginPath();
        context.rect(initX, initY, finalX - initX, finalY - initY);
        context.closePath();
        context.stroke();
    }
}