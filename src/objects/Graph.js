import {Shape} from './Shape.js';

export class Graph extends Shape {
    constructor(initX, initY, width=500, height=500, type='linear', z=0) {
        super(z);
        this.initX = initX;
        this.initY = initY;
        this.width = width;
        this.height = height;
        this.finalX = this.initX+this.width;
        this.finalY = this.initY+this.height;
        this.type = type;
    }

    draw(context) {
        this.width = this.finalX - this.initX;
        this.height = this.finalY - this.initY;
        context.fillStyle = '#FFFFFF';
        context.beginPath();
        context.fillRect(this.initX, this.initY, this.width, this.height);
        context.closePath();

        context.strokeStyle = '#575757';
        for (let i = 0; i < 11; i++) {
            if (i === 5) {
                context.strokeStyle = '#000000';
            } else {
                context.strokeStyle = '#575757';
            }
            context.beginPath();
            context.lineTo(this.initX, this.initY+i*this.height/10);
            context.lineTo(this.initX+this.width, this.initY+i*this.height/10);
            context.closePath();
            context.stroke();

            context.beginPath();
            context.lineTo(this.initX+i*this.width/10, this.initY);
            context.lineTo(this.initX+i*this.width/10, this.initY+this.height);
            context.closePath();
            context.stroke();
        }
        context.fillStyle = '#000000';

        if (this.type === 'linear') {
            context.lineWidth = 3;
            context.strokeStyle = '#fc9403';
            context.beginPath();
            context.lineTo(this.initX+this.width/20, this.initY+this.height-this.height/20);
            context.lineTo(this.initX+this.width-this.width/20, this.initY+this.height/20);
            context.closePath();
            context.stroke();
        } else if (this.type === 'quadratic') {
            context.lineWidth = 3;
            context.strokeStyle = '#fc9403';
            context.beginPath();
            for (let i = 0; i <= 100; i++) {
                context.lineTo(this.initX+this.width/2+(i-50)/5, this.initY+this.height/2+Math.pow((i-50)/5, 2));
                console.log((i-50)/5);
            }
            context.stroke();
        } else if (this.type === 'cubic') {
            context.lineWidth = 3;
            context.strokeStyle = '#fc9403';
            context.beginPath();
            for (let i = 0; i < 100; i++) {
                context.lineTo(this.initX+this.width/2+(i-50)/5, this.initY+this.height/2+0.1*Math.pow((i-50)/5, 3));
                console.log((i-50)/5);
            }
            context.stroke();
        }
        context.strokeStyle = '#000000'
        context.lineWidth = 1;
    }

    preview(context, initX, initY, finalX, finalY) {
        this.draw(context);
    }

}