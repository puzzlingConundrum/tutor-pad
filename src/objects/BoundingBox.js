export class BoundingBox {
    constructor(shape) {
        this.shape = shape;
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

class AdjustingBox {
    constructor() {

    }
}