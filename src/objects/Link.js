export class Link {
    constructor(shape, vertex) {
        this.shape = shape;
        this.vertex = vertex;
    }

    getCoordinates() {
        let x;
        let y;
        let width = this.shape.finalX - this.shape.initX;
        let height = this.shape.finalY - this.shape.initY;
        x = this.shape.initX + width/2 + this.vertex[0]*width/2;
        y = this.shape.initY + height/2 + this.vertex[1]*height/2;
        return [x,y];
    }

    setVertex(x=0, y=0) {
        this.vertex = [x,y];
    }
}