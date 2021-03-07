import Replay from './Replay';
import CanvasEvent from './CanvasEvent';

/**
 * Class containing a map of eventArrays, called replays
 */
export default class ReplayManager {
    constructor () {
        this.replayList = [];
    }

    /**
     * 
     * @param {Array} replay An eventArray obtained from EventRecorder
     */
    addReplay(replay) {
        this.replayList.push(new Replay('', Date.now(), replay));
    }

    // ======================== STRING CONVERSION =================
    eventArraytoString(eventArray) {
        let stringData = ""

        for (let event of eventArray) {

            let time = String(event.time);
            let stateObject = JSON.stringify(event.state)
            stringData += time + ":" + stateObject + "\n";
        }

        return stringData;
    }

    stringToEventArray(text) {
        let eventArray = [];

        let lines = text.split('\n');
        for (let line of lines) {
            let parts = line.split(':');
            let state = JSON.parse(parts[1]);
            eventArray.push(new CanvasEvent(parts[0], state));
        }
        
        return eventArray;
    }

    // ======================== DATA SAVING ========================

    /**
     * @param {int} i Index to get
     * @return Replay data as string
     */
    saveReplayAsString(i) {
        return this.eventArraytoString(this.getReplayByIndex(i).eventArray);
    }

    loadEventFromString(eventString) {
        let loadedReplay = new Replay('', Date.now(), this.stringToEventArray(eventString))
        this.replayList.push(loadedReplay);
        return loadedReplay;
    }

    // ======================== MAP CONTROL =======================
    replayCount() {
        return this.replayList.length;
    }

    getReplayKeys() {
        return this.replayMap.keys();
    }

    getLatestReplay() {
        return this.replayList[this.replayList.length - 1];
    }

    /**
     * 
     * @param {int} i Index of replay to get
     * @returns 
     */
    getReplayByIndex(i) {
        return this.replayList[i];  
    }
}