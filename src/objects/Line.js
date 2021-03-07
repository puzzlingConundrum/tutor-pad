import {Shape} from './Shape.js';
import {Link} from './Link.js';

export class Line extends Shape {
    constructor(initX, initY, finalX, finalY, color='#000000', z=0) {
        super(initX, initY, finalX, finalY, color, z);
        this.link = null;
    }

    draw(context) {
        this.preview(context, this.initX, this.initY, this.finalX, this.finalY);
    }

    preview(context, initX, initY, finalX, finalY) {
        context.beginPath();
        context.moveTo(initX, initY);
        context.lineTo(finalX, finalY);
        context.closePath();
        context.stroke();
    }

    getType() {
        return 'line';
    }
}