export class Circle {
    constructor(initX, initY, finalX, finalY, color='#000000') {
        this.initX = initX;
        this.initY = initY;
        this.finalX = finalX;
        this.finalY = finalY;
        this.color = color;
    }

    draw(context) {
        context.beginPath();
        context.ellipse(this.initX, this.initY, Math.abs(this.finalX - this.initX), Math.abs(this.finalY - this.initY), 0, 0, 2*Math.PI);
        context.closePath();
        context.stroke();
    }

    preview(context, initX, initY, finalX, finalY) {
        context.beginPath();
        context.ellipse(initX, initY, Math.abs(finalX - initX), Math.abs(finalY - initY), 0, 0, 2*Math.PI);
        context.closePath();
        context.stroke();
    }
}