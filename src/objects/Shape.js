import {TOOL_TYPE} from '../Canvas'

export class Shape {
    constructor(initX=0, initY=0, finalX=0, finalY=0, type, color='#000000', z=0, focus=false) {
        this.initX = initX;
        this.initY = initY;
        this.finalX = finalX;
        this.finalY = finalY;

        this.type = type;

        this.color = color;
        this.z = z;
    }
}

export function drawShape(ctx, shape, toolType) {

    switch (toolType) {
        case TOOL_TYPE.SHAPE.RECTANGLE:
            drawRectangle(ctx, shape);
            break;
    }
}

// const {initX, initY, finalX, finalY} = extractCoords(shape)
function extractCoords(shape) {
    return [shape.initX, shape.initY, shape.finalX, shape.finalY];
}

function drawRectangle(ctx, shape) {
    const [initX, initY, finalX, finalY] = extractCoords(shape)

    ctx.beginPath();
    ctx.rect(initX, initY, finalX - initX, finalY - initY);
    ctx.closePath();
    ctx.stroke();
}

function drawEllipse(ctx, shape) {
    const {initX, initY, finalX, finalY} = extractCoords(shape)
      
    let radiusX = Math.abs(finalX-initX);
    let radiusY = Math.abs(finalY-initY);

    // Check if initial pos are greater than the final pos, if so swap them
    if (initX > finalX) {
        let temp = initX;
        initX = finalX;
        finalX = temp;
    }
    if (initY > finalY) {
        let temp = initY;
        initY = finalY;
        finalY = temp;
    }
    ctx.beginPath();
    ctx.ellipse(initX+0.5*radiusX, initY+0.5*radiusY, 0.5*radiusX, 0.5*radiusY, 0, 0, 2*Math.PI);
    ctx.closePath();
    ctx.stroke();
}