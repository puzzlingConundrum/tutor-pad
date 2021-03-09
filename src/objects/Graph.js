import { Shape } from './Shape.js';

export class Graph extends Shape {
    constructor(initX, initY, width = 500, height = 500, functionType = 'linear', z = 0) {
        super(z);
        this.initX = initX;
        this.initY = initY;
        this.width = width;
        this.height = height;
        this.finalX = this.initX + this.width;
        this.finalY = this.initY + this.height;
        this.functionType = functionType
        ;
        this.coefficients = [0, 0, 0, 0];
        if (this.functionType === 'linear') {
            this.coefficients[1] = 1;
        } else if (this.functionType === 'quadratic') {
            this.coefficients[2] = 1;
        } else if (this.functionType === 'cubic') {
            this.coefficients[3] = 1;
        }
        this.type = 'graph'
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
            context.lineTo(this.initX, this.initY + i * this.height / 10);
            context.lineTo(this.initX + this.width, this.initY + i * this.height / 10);
            context.closePath();
            context.stroke();

            context.beginPath();
            context.lineTo(this.initX + i * this.width / 10, this.initY);
            context.lineTo(this.initX + i * this.width / 10, this.initY + this.height);
            context.closePath();
            context.stroke();
        }
        context.fillStyle = '#000000';
        this.graph(context, this.coefficients);
        context.strokeStyle = '#000000'
        context.lineWidth = 1;
    }

    preview(context, initX, initY, finalX, finalY) {
        this.draw(context);
    }

    graph(context, coefficients) {
        // coefficients are in the form a0 + a1*x + a2*x^2 + a3*x^3 + ... + an*x^n
        context.lineWidth = 3;
        context.strokeStyle = '#fc9403';
        context.beginPath();
        for (let i = 0; i <= 1000; i++) {
            let x = (i-500)/2;
            let val = this.evaluate(coefficients, x);
            if (Math.abs(val) <= this.height/2 && Math.abs(x) <= this.width/2) {
                context.lineTo(this.initX + this.width / 2 + x, this.initY + this.height / 2 - val);
            }
        }
        context.stroke();
    }

    evaluate(coefficients, x) {
        // coefficients are in the form a0 + a1*x + a2*x^2 + a3*x^3 + ... + an*x^n
        let value = 0;
        for (let i = 0; i < coefficients.length; i++) {
            value += coefficients[i] * Math.pow(x,i);
        }
        return value;
    }

}