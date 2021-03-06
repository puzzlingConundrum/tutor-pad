import {Shape} from './Shape.js';

export class Line extends Shape {
    constructor(initX, initY, finalX, finalY, color='#000000', z=0) {
        super(initX, initY, finalX, finalY, color, z);
    }

    draw(context) {
        context.beginPath();
        context.moveTo(this.initX, this.initY);
        context.lineTo(this.finalX, this.finalY);
        context.closePath();
        context.stroke();
    }

    preview(context, initX, initY, finalX, finalY) {
        context.beginPath();
        context.moveTo(initX, initY);
        context.lineTo(finalX, finalY);
        context.closePath();
        context.stroke();
    }
}