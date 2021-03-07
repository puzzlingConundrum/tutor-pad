

/**
 * Class containing a map of eventArrays, called replays
 */
export default class ReplayManager {
    constructor () {
        this.replayMap = new Map();
    }

    /**
     * 
     * @param {Array} replay An eventArray obtained from EventRecorder
     */
    addReplay(replay) {
        this.replayMap.set(Date.now(), replay);
    }

    replayCount() {
        return this.replayMap.size;
    }

    getReplayKeys() {
        return this.replayMap.keys();
    }

    getLatestReplay() {
        return this.getReplayIndex(this.replayCount - 1);
    }

    /**
     * 
     * @param {int} i Index of replay to get
     * @returns 
     */
    getReplayIndex(i) {
        let index = 0;
        for (let replay of this.replayMap.values()) {
            if (i === index) {
                return replay;
            }
            index++;
        }


        throw "Index out of replay list range!"      
    }

    /**
     * 
     * @param {Date} key Datetime object of when the replay was stored. Can be obtained through getReplayKeys
     * @returns 
     */
    getReplay(key) {
        return this.replayMap.get(key);
    }
}