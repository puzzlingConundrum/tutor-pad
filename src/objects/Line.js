export class Line {
    constructor(initX, initY, finalX, finalY, color='#000000') {
        this.initX = initX;
        this.initY = initY;
        this.finalX = finalX;
        this.finalY = finalY;
        this.color = color;
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