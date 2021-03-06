import {Shape} from './Shape.js';

export class Circle extends Shape {
    constructor(initX, initY, finalX, finalY, color='#000000', z=0) {
        super(initX, initY, finalX, finalY, color, z);
    }

    draw(context) {
        this.preview(context, this.initX, this.initY, this.finalX, this.finalY);
    }

    preview(context, initX, initY, finalX, finalY) {
        let radiusX = Math.abs(finalX-initX);
        let radiusY = Math.abs(finalY-initY);
        context.beginPath();
        context.ellipse(initX+0.5*radiusX, initY+0.5*radiusY, 0.5*radiusX, 0.5*radiusY, 0, 0, 2*Math.PI);
        context.closePath();
        context.stroke();
    }

    getType() {
        return 'circle';
    }
}