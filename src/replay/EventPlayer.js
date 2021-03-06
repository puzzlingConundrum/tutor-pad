import { Rectangle } from '../objects/Rectangle'
import { Circle } from '../objects/Circle.js';
import { Line } from '../objects/Line.js';

export default class EventPlayer {
    constructor() {
        this.eventArray = [];
        this.isReplaying = false;

        this.initMousePos = []
        this.finalMousePos = []
        this.type = ''
    }


    replay(ms, context) {
        

        if (this.eventArray.length > 0) {
            if (!this.isReplaying)
                this.isReplaying = true;

            while(this.eventArray[0].time < ms) {
                //console.log(this.eventArray[0].time);

                let state = this.eventArray[0].state;

                //console.log(state.drawing);
                context.clearRect(0, 0, 2000, 2000);

                for (let o of state.obj) {
                    o.draw(context);
                    //console.log(o);
                }

                if (state.drawing) {
                    

                        
                    let initX = state.initMousePos[0];
                    let initY = state.initMousePos[1];
                    let finalX = state.finalMousePos[0];
                    let finalY = state.finalMousePos[1];
                    
                    switch (state.type) {
                        case 'square':
                            (new Rectangle(context, initX, initY, finalX, finalY)).preview(context, initX, initY, finalX, finalY);
                            break;
                        case 'circle':
                            (new Circle(context, initX, initY, finalX, finalY)).preview(context, initX, initY, finalX, finalY);
                            break;
                        case 'line':
                            (new Line(context, initX, initY, finalX, finalY)).preview(context, initX, initY, finalX, finalY);
                            break;
                        default:
                            

                    }
                    
                }

                this.eventArray.shift();
                
                if (this.eventArray.length <= 0) {
                    break;
                }
            } 
        } else {
            this.isReplaying = false;
        }
        
    }
}