export class Rectangle {
    constructor(initX, initY, finalX, finalY, color='#000000') {
        this.initX = initX;
        this.initY = initY;
        this.finalX = finalX;
        this.finalY = finalY;
        this.color = color;
    }

    draw(context) {
        context.beginPath();
        context.rect(this.initX, this.initY, this.finalX - this.initX, this.finalY - this.initY);
        context.closePath();
        context.stroke();
    }

    preview(context, initX, initY, finalX, finalY) {
        // context.clearRect(initX, initY, finalX - initX, finalY - initY);
        context.beginPath();
        context.rect(initX, initY, finalX - initX, finalY - initY);
        context.closePath();
        context.stroke();
    }
}
