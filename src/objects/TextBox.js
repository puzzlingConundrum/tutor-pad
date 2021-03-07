import {Shape} from './Shape.js';

export class TextBox extends Shape {
    constructor(text, initX, initY, finalX, finalY, color='#000000', z=0) {
        super(initX, initY, finalX, finalY, color, z);
        this.text = text;
        this.type = 'text box'
    }

    draw(context) {
        this.preview(context, this.text, this.initX, this.initY, this.finalX, this.finalY);
    }

    preview(context, text, initX, initY, finalX, finalY) {
         context.beginPath();
         context.fillText(text, initX, initY);
         context.closePath();
         context.stroke();
    }

}