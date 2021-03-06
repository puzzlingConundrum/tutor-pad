
export default class CanvasEvent {
    constructor(startTime, state) {
        this.time = Date.now() - startTime;
        this.state = state;
        //console.log(this.time);
    }

    set time(value) {
        this._time = value;
    }

    get time() {
        return this._time;
    }

    set state(value) {
        this._state = value;
    }

    get state() {
        return this._state;
    }
}