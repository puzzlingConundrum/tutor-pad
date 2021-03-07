export class Shape {
    constructor(initX=0, initY=0, finalX=0, finalY=0, color='#000000', z=0, focus=false) {
        this.initX = initX;
        this.initY = initY;
        this.finalX = finalX;
        this.finalY = finalY;
        this.color = color;
        this.z = z;
        this.focus = focus;
    }

    getZ() {
        return this.z;
    }
}