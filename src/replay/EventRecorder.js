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
        
        this.sendTextToServer();
    }

    toString() {
        let stringData = ""

        for (let event of this.eventArray) {

            let time = String(event.time);
            let stateObject = JSON.stringify(event.state)
            stringData += time + ":" + stateObject + "\n";
        }

        console.log(stringData)

        return stringData;
    }

    sendTextToServer() {
        // create a new XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // get a callback when the server responds
        xhr.addEventListener('load', () => {
            //server respondes
            // ---> xhr.responseText
        })

        // open the request with the verb and the url
        xhr.open('POST', '/api/v1/say-something');

        var data = new FormData();
        data.append("data", this.toString());

        // send the request
        xhr.send(data);
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