import CanvasEvent from "./CanvasEvent";

export default class EventRecorder {
    constructor() {
        this.eventArray = [] // list of CanvasEvents
        this.startTime = 0;
        this.isRecording = false;
        this.isReplaying = false;
    }

    start() {
        this.startTime = Date.now();
        this.isRecording = true;
    }

    stop() {
        this.isRecording = false;
    }



    /**
     * 
     * @param {CanvasEvent} canvasEvent Canvas event type object to add to eventArray list
     */
    record(state) {
        if (this.isRecording) {
            this.eventArray.push(new CanvasEvent(this.startTime, state));
        }
    }

}