import React from 'react';
import './App.css'
// Dependencies
import clonedeep from 'lodash.clonedeep'
// Shapes
import { Shape, drawShape } from './objects/Shape'
import { Line } from './objects/Line.js';
import { BoundingBox } from './objects/BoundingBox.js';
import { TextBox } from './objects/TextBox.js';
import { FreeForm } from './objects/FreeForm.js';
import { Graph } from './objects/Graph.js';
// Replay
import EventRecorder from './replay/EventRecorder'
import EventPlayer from './replay/EventPlayer'
import ReplayManager from './replay/ReplayManager'
// Components/Icons
import { Form, Navbar, Nav, ButtonGroup, ToggleButton, Dropdown, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    BsSquare,
    BsCircle,
    BsSlash,
    BsCursor,
    BsSquareFill,
    BsCircleFill,
    BsSlashSquareFill,
    BsCursorFill,
    BsCursorText,
    BsPencil,
    BsPencilSquare,
    BsGraphUp
} from 'react-icons/bs';
import { BiEraser, BiKey, BiPause, BiPlay, BiUpload, BiUpvote, BiVideoRecording } from 'react-icons/bi'

import ReplayButton from './components/ReplayButton';


// Controls mouseDown event
export const TOOL_TYPE = {
    SELECT: 'select',

    SHAPE: {   // Where size is drawn upon creation
        RECTANGLE: 'rectangle',
        ELLIPSE: 'ellipse',
        LINE: 'line',
    },

    FREEFORM: 'freeform',

    OBJECT: {    // Where size is automatically generated
        TEXT: 'text',
        GRAPH: {
            LINEAR: 'linear',
            QUADRATIC: 'quadratic',
            CUBIC: 'cubic',
            CUSTOM: 'custom',
        },
    },
}

// Controls mouseMove event
const MOUSE_ACTION = {
    NONE: 'none',
    DRAW: 'draw',
    RESIZE: 'resize',
}

const X_OFFSET = 5;
const Y_OFFSET = -60;
const mouseRange = 20;

export class Canvas extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            toolType: TOOL_TYPE.SELECT,
            mouseAction: MOUSE_ACTION.NONE,

            selectionBox: null,

            obj: [],
            currentObj: null, // array of objects being interacted with, gets cleared every frame
            selectedObj: [],

            freeFormPoints: [],
            
            textToShow: 'TextToShow',
            
            // Recording
            isRecording: false,
            isReplaying: false,
        };
        this.canvasRef = React.createRef();

        this.mouseDistance = [];

        this.currentObj = null;


        this.canvasRef = React.createRef();

        this.startTime = Date.now();

        this.eventRecorder = new EventRecorder();
        this.eventPlayer = new EventPlayer();
        this.replayManager = new ReplayManager();

        this.uuid = null;
    }

    //#region ======================== REPLAY FEATURE ====================================
    updateFrame() {
        if (this.state.isReplaying) {
            let ms = Date.now() - this.startTime;


            let ctx = this.canvasRef.current.getContext('2d');


            let replayTime = this.eventPlayer.getLength();

            let stateArray = this.eventPlayer.replay(ms);
            /**
             * I don't think playing the entire array does anything, since it'll just replace what was already
             * there within the same frame right? correct me if I'm wrong
             */
            if (stateArray[0])
                this.drawCanvas(stateArray[0]);


            // Auto-end on last frame 
            if (ms > replayTime) {
                this.setState({ isReplaying: this.eventPlayer.isReplaying })
            }

        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.updateFrame(), 1);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidUpdate() {
        if (this.props.ref) {
            this.canvasRef = this.props.ref;
        }


    }

    //#endregion

    //#region ======================== SHAPE MOUSE INTERACTION DETECTOR =======================
    isInside(x, y, shape) {
        return (x >= shape.initX - mouseRange && x <= shape.finalX + mouseRange && y - Y_OFFSET >= shape.initY - mouseRange && y - Y_OFFSET <= shape.finalY + mouseRange);
    }

    isOnLeftSide(x, y, shape) {
        return (x >= shape.initX - mouseRange && x <= shape.initX + mouseRange && y - Y_OFFSET >= shape.initY && y - Y_OFFSET <= shape.finalY);
    }

    isOnRightSide(x, y, shape) {
        return (x >= shape.finalX - mouseRange && x <= shape.finalX + mouseRange && y - Y_OFFSET >= shape.initY && y - Y_OFFSET <= shape.finalY);
    }

    isOnTopSide(x, y, shape) {
        return (x >= shape.initX && x <= shape.finalX && y - Y_OFFSET >= shape.initY - mouseRange && y - Y_OFFSET <= shape.initY + mouseRange);
    }

    isOnBottomSide(x, y, shape) {
        return (x >= shape.initX && x <= shape.finalX && y - Y_OFFSET >= shape.finalY - mouseRange && y - Y_OFFSET <= shape.finalY + mouseRange);
    }

    getComponentWithMaxZValue(mouseX, mouseY) {
        let max_i = 0;
        let max = 0;
        let maxShape;
        for (let i = 0; i < this.state.obj.length; i++) {
            if (this.state.obj[i].z >= max && this.isInside(mouseX, mouseY, this.state.obj[i].z)) {
                max = this.state.obj[i].z;
                max_i = i;
            }
        }

        maxShape = this.obj.splice(max_i, 1)
        return maxShape;
    }
    //#endregion

    //#region ======================== MOUSE EVENTS ==============================

    // const [mouseX, mouseY] = getMouseCoords(e)
    getMouseCoords(e) {
        return [e.pageX+X_OFFSET, e.pageY+Y_OFFSET]
    }

    mouseDown(e) {
        let context = this.getCanvasContext();

        const [mouseX, mouseY] = this.getMouseCoords(e);
        let object = null;

        switch (this.state.toolType) {
            case TOOL_TYPE.SELECT:
                //object = this.getComponentWithMaxZValue(mouseX, mouseY)
                
                break;
            // Drawing tools
            case TOOL_TYPE.SHAPE.RECTANGLE:
            case TOOL_TYPE.SHAPE.ELLIPSE:
            case TOOL_TYPE.SHAPE.LINE:
                object = new Shape(mouseX, mouseY, mouseX, mouseY, this.state.toolType)
                break;
            default:
                break;
        }

        this.currentObj = object;
        this.setState({
            obj: [...this.state.obj, this.currentObj],
        });
    }

    mouseMove(e) {
        const [mouseX, mouseY] = this.getMouseCoords(e)


        if (this.currentObj) {
                
            let updateObject = this.currentObj;
            updateObject.finalX = mouseX;
            updateObject.finalY = mouseY;

            this.setState({})
        }
    }

    
    mouseUp(e) {

        this.currentObj = null;
        this.setState({})
    }
    //#endregion

    //#region ======================================== DRAW CANVAS ====================================
    componentDidUpdate() {
        let canvas = this.canvasRef.current;

        if (!this.state.isReplaying) {
            this.drawCanvas(this.state);

            // clone state to remove dependencies
            console.log(clonedeep(this.state))
            this.eventRecorder.record(clonedeep(this.state));
        }
    }

    getCanvasContext() {
        return this.canvasRef.current.getContext('2d');
    }


    /**
     * 
     * @param {Context} ctx 
     * @param {state} state Takes state as a variable so that recorded states can also be drawn
     */
    drawCanvas(state) {
        const ctx = this.getCanvasContext();
        ctx.fillStyle = '#000000';
        ctx.clearRect(0, 0, this.props.width, this.props.height);


        for (const object of state.obj) {
            drawShape(ctx, object, object.type)
        }

        if (state.currentObj) {
            console.log(state.currentObj)
            drawShape(ctx, this.state.currentObj, state.currentObj.type)
        }
    }

    clearRect(ctx) {
        ctx.clearRect(0, 0, this.props.width, this.props.height);
    }

    //#endregion

    //#region ======================== On Click Events ============================
    // Helper function
    setDrawType(toolType) {
        console.log(toolType);
        this.setState({toolType: toolType});
    }

    setCursor() {
        this.setDrawType(TOOL_TYPE.SELECT)
    }

    setRectangle() {
        this.setDrawType(TOOL_TYPE.SHAPE.RECTANGLE)
    }

    setCircle() {
        this.setDrawType(TOOL_TYPE.SHAPE.ELLIPSE)
    }

    setLine() {
        this.setDrawType(TOOL_TYPE.SHAPE.LINE)
    }

    setFreeForm() {
        this.setDrawType(TOOL_TYPE.FREEFORM)
    }

    // Unused for now
    setTextBox() {
        this.setState({ type: 'text box', initMousePos: [], finalMousePos: [] });
    }

    //#endregion

    //#region ======================== Button functions =================

    clearCanvas() {
        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');

        context.clearRect(0, 0, this.props.width, this.props.height);
        this.setState({
            obj: [],
            moving: null,
            selected: null,
            initMousePos: [],
            finalMousePos: []
        });
    }

    setRecording() {
        if (!this.state.isRecording) {
            // Start recording
            this.setState({ isRecording: true });
            this.eventRecorder = new EventRecorder();
            this.eventRecorder.start();
        } else {
            // stop recording
            this.setState({ isRecording: false });
            this.eventRecorder.stop();
            this.replayManager.addReplay(this.eventRecorder.eventArray);
            this.replayIndex = this.replayManager.replayCount() - 1;
        }
    }

    setReplaying() {
        this.setState({ isReplaying: true });
        this.eventPlayer = new EventPlayer();
        this.eventPlayer.eventArray = [...this.replayManager.getReplayByIndex(this.replayIndex).eventArray];

        this.startTime = Date.now();
        /*
        if (!this.state.isReplaying) {
            // Start recording
            this.setState({ isReplaying: true });
            this.eventPlayer = new EventPlayer();
            this.eventPlayer.eventArray = [...this.replayManager.getReplayByIndex(this.replayIndex).eventArray];

            this.startTime = Date.now();
        } else {
            // stop recording
            this.setState({ isReplaying: false });
        }
        */

    }

    showReplays() {
        let listItemArray = []
        let i = 1;

        for (let replay of this.replayManager.replayList) {

            listItemArray.push(
                <li>
                    <ReplayButton
                        replaySelect={this.selectReplay.bind(this)}
                        saveSelect={this.selectSave.bind(this)}
                        downloadSelect={this.selectDownload.bind(this)}
                        removeSelect={this.selectRemove.bind(this)}
                        date={new Date(replay.date).toLocaleTimeString() + ", " + new Date(replay.date).toLocaleDateString()}
                        num={i}>
                    </ReplayButton>
                </li>)
            i++;
        }

        return listItemArray;
    }

    selectRemove(i) {
        this.replayManager.remove(i);
        this.setState({});
    }

    selectReplay(i) {
        this.replayIndex = i;
        console.log(i)
        // Auto play 
        this.setReplaying();
    }

    selectSave(i) {
        console.log(i + " save")
        let text = this.replayManager.saveReplayAsString(i);

        navigator.clipboard.writeText(text);
    }

    getSaveDataFromServer(saveFileUniqueID) {
        this.replayManager.loadEventFromString(saveFileUniqueID)


        this.setState({})

        //console.log(saveFileUniqueID)
        // create a new XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // get a callback when the server responds
        xhr.addEventListener('load', () => {
            // update the state of the component with the result here
            var savedatastring = xhr.responseText;
            //use this to ask the server to retrieve data
            this.replayManager.loadEventFromString(savedatastring);

            this.setState({});
            console.log(savedatastring);
        })

        // open the request with the verb and the url
        xhr.open('POST', '/api/v1/querydata');

        //construct data object
        var data = new FormData();
        data.append("data", saveFileUniqueID);

        // send the request
        xhr.send(data);
    }

    selectDownload(i) {
        console.log(i + "download")

        //PLACEHOLDER DOWNLOAD TEXT
        var downloadText = "Mio best girl pog ****************************"
        //PLACEHOLDER DOWNLOAD TEXT

        const blob = new Blob([downloadText]);
        const fileDownloadUrl = URL.createObjectURL(blob);

        const hyperlink = document.createElement('a');
        hyperlink.href = fileDownloadUrl;
        hyperlink.download = "sav.txt"

        document.body.appendChild(hyperlink);
        hyperlink.click();
        document.body.removeChild(hyperlink);
    }

    createGraph(type) {
        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');
        context.fillStyle = '#000000';
        context.clearRect(0, 0, this.props.width, this.props.height);
        let graph = new Graph(50, 50, 200, 200, type);
        graph.draw(context);
        this.setState({ obj: [...this.state.obj, graph] });


    }
    //#endregion

    render() {
        return (
            <>
                <Form.Row>
                    <Navbar bg="dark" variant="dark" style={{ width: '100%', height: '60px' }}>
                        <Navbar.Brand>TutorPad</Navbar.Brand>
                        <Nav>
                            <ButtonGroup toggle>
                                <ToggleButton title="Selection tool" variant='link' type='radio' onClick={e => this.setCursor()}>
                                    {((this.state.toolType === TOOL_TYPE.SELECT) && <BsCursorFill />) || <BsCursor />}
                                </ToggleButton>

                                <ToggleButton title="Draw sqaure" variant='link' type='radio' onClick={e => this.setRectangle()}>
                                    {((this.state.toolType === TOOL_TYPE.SHAPE.RECTANGLE) && <BsSquareFill />) || <BsSquare />}
                                </ToggleButton>

                                <ToggleButton title="Draw circle" variant='link' type='radio' onClick={e => this.setCircle()}>
                                    {((this.state.toolType === TOOL_TYPE.SHAPE.ELLIPSE) && <BsCircleFill />) || <BsCircle />}
                                </ToggleButton>

                                <ToggleButton title="Draw line" variant='link' type='radio' onClick={e => this.setLine()}>
                                    {((this.state.toolType === TOOL_TYPE.SHAPE.LINE) && <BsSlashSquareFill />) || <BsSlash />}
                                </ToggleButton>

                                <ToggleButton title="Text tool" variant='link' type='radio' onClick={e => this.setTextBox()}>
                                    {<BsCursorText />}
                                </ToggleButton>
                                <ToggleButton title="Draw freeform" variant='link' type='radio' onClick={e => this.setFreeForm()}>
                                    {((this.state.toolType === TOOL_TYPE.FREEFORM) && <BsPencilSquare />) || <BsPencil />}
                                </ToggleButton>

                                <Dropdown>
                                    <Dropdown.Toggle title="Graphs" variant='link'>{<BsGraphUp />}</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={e => this.createGraph('linear')}>Linear</Dropdown.Item>
                                        <Dropdown.Item onClick={e => this.createGraph('quadratic')}>Quadratic</Dropdown.Item>
                                        <Dropdown.Item onClick={e => this.createGraph('cubic')}>Cubic</Dropdown.Item>
                                        <Dropdown.Item onClick={e => this.createGraph('custom')}>Custom</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <ToggleButton title="Clear canvas" variant='link' type='radio' onClick={e => this.clearCanvas()}>{<BiEraser />}</ToggleButton>
                                <ToggleButton title="Record canvas" variant='link' type='radio' onChange={e => this.setRecording()}>{this.state.isRecording ? <BiVideoRecording color="red" /> : <BiVideoRecording />}</ToggleButton>
                                {/* <ToggleButton title="Play recording" variant='link' type='radio' onChange={e => this.setReplaying()}>{this.state.isReplaying ? <BiPause color="red" /> : <BiPlay />}</ToggleButton> */}

                            </ButtonGroup>

                            {this.state.editGraph &&
                                (
                                    <Form.Row>
                                        <Col xs={3}>
                                            <Form.Control type='number' defaultValue={this.state.editGraph.coefficients[0]} onChange={e => this.state.editGraph.coefficients[0] = e.target.value} style={{ width: '75px' }}></Form.Control>
                                        </Col>
                                        <Col xs={3}>
                                            <Form.Control type='number' defaultValue={this.state.editGraph.coefficients[1]} onChange={e => this.state.editGraph.coefficients[1] = e.target.value} style={{ width: '75px' }}></Form.Control>
                                        </Col>
                                        <Col xs={3}>
                                            <Form.Control type='number' defaultValue={this.state.editGraph.coefficients[2]} onChange={e => this.state.editGraph.coefficients[2] = e.target.value} style={{ width: '75px' }}></Form.Control>
                                        </Col>
                                        <Col xs={3}>
                                            <Form.Control type='number' defaultValue={this.state.editGraph.coefficients[3]} onChange={e => this.state.editGraph.coefficients[3] = e.target.value} style={{ width: '75px' }}></Form.Control>
                                        </Col>
                                    </Form.Row>
                                )
                            }

                            {
                                this.state.type === 'text box' &&
                                (
                                    <div>
                                        <Form.Control
                                            type="text"
                                            value={this.state.textToShow}
                                            //onKeyDown={this.keyPressed}

                                            onChange={(e) => {
                                                // this.keyPressed(e);
                                                //console.log(e.target.value);
                                                this.setState({ textToShow: e.target.value });

                                            }}
                                        />
                                    </div>
                                )
                            }
                        </Nav>

                        <Nav className="ml-auto">
                            <form>
                                <label>
                                    <input type="text" name="name" onChange={(e) => { this.uuid = e.target.value }} />
                                </label>
                            </form>

                            <ButtonGroup toggle className="">
                                <ToggleButton className={"tab-buttons"} title="Load uuid" variant='link' type='radio' onChange={() => this.getSaveDataFromServer(this.uuid)}>
                                    {<BiKey size={30} />}
                                </ToggleButton>
                                {/*}
                                <ToggleButton className={"tab-buttons"} title="Upload file" variant='link' type='radio' onChange={""}>
                                    {<BiUpload size={30} />}
                                </ToggleButton>
                                */}

                            </ButtonGroup>
                        </Nav>
                    </Navbar>
                </Form.Row>



                <Form.Row>
                    <Col xs={8}>
                        <canvas
                            ref={this.canvasRef}
                            width={this.props.width}
                            height={this.props.height}
                            onMouseDown={e => this.mouseDown(e)}
                            onMouseMove={e => this.mouseMove(e)}
                            onMouseUp={e => this.mouseUp(e)}
                        // onKeyDown={this.keyPressed}


                        ></canvas>
                    </Col>

                    <Col>
                        <div className="sidebar" style={{ width: '448px' }}>
                            <p>
                                <ul class="replay-list">
                                    {this.showReplays()}
                                </ul>
                            </p>
                        </div>
                    </Col>
                </Form.Row>

                {/* <div onKeyDown={this.keyPressed}></div> */}
            </>
        );
    }


}