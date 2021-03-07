export default class EventPlayer {
    constructor() {
        this.eventArray = []; // array of canvasEvents
        this.isReplaying = false;

        this.initMousePos = []
        this.finalMousePos = []
        this.type = ''
    }

    /**
     * 
     * @returns Replay time in milliseconds int
     */
    getLength() {
        if (this.eventArray.length > 0)
            return this.eventArray[this.eventArray.length-1].time;
        else 
            return 0;
    }

    replay(ms, context) {
        var currentArray = []
        
        if (this.eventArray.length > 0) {
            if (!this.isReplaying)
                this.isReplaying = true;

            while(this.eventArray[0].time < ms) {
                //console.log(this.eventArray[0].time);

                let state = this.eventArray[0].state;
                currentArray.push(state)

                this.eventArray.shift();
                
                if (this.eventArray.length <= 0) {
                    break;
                }
            } 
        } else {
            this.isReplaying = false;
        }

        return currentArray;
    }


}