import {Shape} from './Shape.js';

export class Rectangle extends Shape {
    constructor(initX, initY, finalX, finalY, color='#000000', z=0) {
        super(initX, initY, finalX, finalY, color, z);
    }

    draw(context) {
        this.preview(context, this.initX, this.initY, this.finalX, this.finalY);
    }

    preview(context, initX, initY, finalX, finalY) {
        context.beginPath();
        context.rect(initX, initY, finalX - initX, finalY - initY);
        context.closePath();
        context.stroke();
    }


    getType() {
        return 'rectangle';
    }
}

