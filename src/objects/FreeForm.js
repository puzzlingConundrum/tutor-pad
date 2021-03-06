import {Shape} from './Shape.js';

export class FreeForm extends Shape {
    constructor(points=[], z=0) {
        super(z)
        this.points = points;
        this.type = 'draw';
    }

    draw(context) {
        this.preview(context, this.points);
    }

    preview(context, points) {
        context.lineWidth = 3;
        if (points.length > 0) {
            context.beginPath();
            for (let point of points) {
                context.lineTo(point[0], point[1]);
            }
            context.stroke();
        }
        context.lineWidth = 1;
    }


}