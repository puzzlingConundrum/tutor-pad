export default class EventPlayer {
    constructor() {
        this.eventArray = []; // array of canvasEvents
        this.isReplaying = false;

        this.length = 0;
        this.index = 0;
    }

    /**
     * Setting the event array also functions as the resetter for the player 
     * @param {array} eventArray Array of CanvasEvents
     */
    set eventArray(eventArray) {
        this.index = 0;
        this.length = eventArray.length;
        this._eventArray = eventArray;
    }

    get eventArray() {
        return this._eventArray;
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
        
        if (this.index < this.length) {
            if (!this.isReplaying)
                this.isReplaying = true;

            while(this.eventArray[this.index].time < ms) {
                //console.log(this.eventArray[0].time);

                // TODO: We might be able to optimize the frame rate by returning one event per tick (updateFrame)
                //  since I'm not sure if returning an array of all event per frame does anything
                let state = this.eventArray[this.index].state;
                this.index++;
                currentArray.push(state)

                if (this.index >= this.length)
                    break;
            } 
        } else {
            this.isReplaying = false;
            this.index = 0;
        }

        return currentArray;
    }


}