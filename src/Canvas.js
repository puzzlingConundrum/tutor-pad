import React from 'react';
import './App.css'
// Dependencies
import clonedeep from 'lodash.clonedeep'
// Shapes
import { Rectangle } from './objects/Rectangle.js';
import { Circle } from './objects/Circle.js';
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
const TOOL_TYPE = {
    SELECT: 'select',

    SHAPE: {   // Where size is drawn upon creation
        RECTANGLE: 'rectangle',
        CIRCLE: 'circle',
        LINE: 'line',
    },

    FREEFORM: 'freeform',

    OBJECT: {    // Where size is automatically generated
        TEXT: 'text',
        GRAPH: 'graph',
    },
}

// Controls mouseMove event
const MOUSE_ACTION = {
    NONE: 'none',
    DRAW: 'draw',
    RESIZE: 'resize',
}

export class Canvas extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isDrawing: false, // boolean of whether or not canvas is drawing something
            toolType: TOOL_TYPE.SELECT,
            mouseAction: MOUSE_ACTION.NONE,
            
            type: 'select',

            resizeX: false,
            resizeY: false,

            moving: null,   // current object being moved
            selected: null, // boolean

            obj: [],
            currentObj: [], // array of objects being interacted with, gets cleared every frame

            initMousePos: [], // 0: x, 1: y
            finalMousePos: [], // 0: x, 1: y
            textToShow: 'TextToShow',
            

            // Recording
            isRecording: false,
            isReplaying: false,
            freeFormPoints: [],

            editGraph: null

        };
        this.canvasRef = React.createRef();
        this.offset = 60;
        this.mouseDistance = [];
        this.mouseRange = 20;

        this.canvasRef = React.createRef();
        this.offset = 60;

        this.ms = 0;
        this.startTime = Date.now();

        this.eventRecorder = new EventRecorder();
        this.eventPlayer = new EventPlayer();
        this.replayManager = new ReplayManager();

        this.uuid = null;
    }

    //#region ======================== REPLAY FEATURE ====================================
    updateFrame() {
        if (this.state.isReplaying) {
            this.ms = Date.now() - this.startTime;


            let ctx = this.canvasRef.current.getContext('2d');


            let replayTime = this.eventPlayer.getLength();

            let stateArray = this.eventPlayer.replay(this.ms, ctx);
            /**
             * I don't think playing the entire array does anything, since it'll just replace what was already
             * there within the same frame right? correct me if I'm wrong
             */
            this.drawCanvas(stateArray[0]);


            // Auto-end on last frame 
            if (this.ms > replayTime) {
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

    setType(type) {
        this.setState({ type: { type } });
    }
    //#endregion

    //#region ======================== SHAPE MOUSE INTERACTION DETECTOR =======================
    isInside(x, y, shape) {
        return (x >= shape.initX - this.mouseRange && x <= shape.finalX + this.mouseRange && y - this.offset >= shape.initY - this.mouseRange && y - this.offset <= shape.finalY + this.mouseRange);
    }

    isOnLeftSide(x, y, shape) {
        return (x >= shape.initX - this.mouseRange && x <= shape.initX + this.mouseRange && y - this.offset >= shape.initY && y - this.offset <= shape.finalY);
    }

    isOnRightSide(x, y, shape) {
        return (x >= shape.finalX - this.mouseRange && x <= shape.finalX + this.mouseRange && y - this.offset >= shape.initY && y - this.offset <= shape.finalY);
    }

    isOnTopSide(x, y, shape) {
        return (x >= shape.initX && x <= shape.finalX && y - this.offset >= shape.initY - this.mouseRange && y - this.offset <= shape.initY + this.mouseRange);
    }

    isOnBottomSide(x, y, shape) {
        return (x >= shape.initX && x <= shape.finalX && y - this.offset >= shape.finalY - this.mouseRange && y - this.offset <= shape.finalY + this.mouseRange);
    }

    getComponentWithMaxZValue(mouseX, mouseY) {
        let max = 0;
        let maxShape;
        for (let o of this.state.obj) {
            if (o.getZ() >= max && this.isInside(mouseX, mouseY, o)) {
                max = o.getZ();
                maxShape = o;
            }
        }
        return maxShape;
    }
    //#endregion

    //#region ======================== MOUSE EVENTS ==============================
    mouseDown(e) {
        let context = this.canvasRef.current.getContext('2d');

        if (this.state.mouseAction = MOUSE)
    }

    move(e) {
        

        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');
        if (!this.state.isReplaying) {
            this.drawCanvas(context, this.state);
        }
    }

    mouseUp(e) {
        let [initX, initY] = this.state.initMousePos;
        let [finalX, finalY] = this.state.finalMousePos;
        let newObject;
        this.setState({ moving: null, resizeX: false, resizeY: false });

        // check currently selected type
        switch (this.state.type) {
            case 'square':
                newObject = new Rectangle(initX, initY, finalX, finalY)
                break;
            case 'circle':
                newObject = new Circle(initX, initY, finalX, finalY);
                break;
            case 'line':
                newObject = new Line(initX, initY, finalX, finalY);
                break;

            case 'text box':
                newObject = new TextBox(this.state.textToShow, initX, initY, initX + 50, initY - 20);
                break;

            case 'draw':
                newObject = new FreeForm(this.state.freeFormPoints);
                this.setState({ freeFormPoints: [] });
                break;

            default:
                newObject = null;
        }
        if (newObject) {
            this.setState({ drawing: false, obj: [...this.state.obj, newObject] });
        }
        this.setState({
            initMousePos: [],
            finalMousePos: []
        });
    }
    //#endregion

    //#region ======================== DRAW UPDATES =================
    componentDidUpdate() {
        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');

        if (!this.state.isReplaying) {
            this.drawCanvas(context, this.state);
            // clone state to remove dependencies
            this.eventRecorder.record(clonedeep(this.state));
        }
    }
    //#endregion

    //#region ======================================== DRAW CANVAS ====================================

    drawShapeObject(context, shape, initX, initY, finalX, finalY) {
        let type = shape._type;
        switch (type) {
            case 'rectangle':
                context.beginPath();
                context.rect(initX, initY, finalX - initX, finalY - initY);
                context.closePath();
                context.stroke();
                break;
            case 'circle':
                let radiusX = Math.abs(finalX - initX);
                let radiusY = Math.abs(finalY - initY);

                // Check if initial pos are greater than the final pos, if so swap them
                if (initX > finalX) {
                    let temp = initX;
                    initX = finalX;
                    finalX = temp;
                }
                if (initY > finalY) {
                    let temp = initY;
                    initY = finalY;
                    finalY = temp;
                }
                context.beginPath();
                context.ellipse(initX + 0.5 * radiusX, initY + 0.5 * radiusY, 0.5 * radiusX, 0.5 * radiusY, 0, 0, 2 * Math.PI);
                context.closePath();
                context.stroke();
                break;
            case 'line':
                context.beginPath();
                context.moveTo(initX, initY);
                context.lineTo(finalX, finalY);
                context.closePath();
                context.stroke();
                break;
            case 'bounding box':
                context.strokeStyle = '#0388fc';
                context.beginPath();
                context.rect(initX, initY, finalX - initX, finalY - initY);
                context.closePath();
                context.stroke();
                context.strokeStyle = '#000000';
                break;
            case 'text box':
                context.beginPath();
                context.fillText(shape.text, initX, initY);
                context.closePath();
                context.stroke();
                break;
            case 'draw':
                if (shape.points.length > 0) {
                    context.beginPath();
                    for (let point of shape.points) {
                        context.lineTo(point[0], point[1]);
                    }
                    context.stroke();
                }
                break;
            case 'graph':
                let graph = new Graph(initX, initY, shape.width, shape.height, shape.functionType, shape.z)
                graph.draw(context);
                break;
        }
    }
    

    /**
     * 
     * @param {Context} ctx 
     * @param {state} state Takes state as a variable so that recorded states can also be drawn
     */
    drawCanvas(ctx, state) {

        ctx.fillStyle = '#000000';
        ctx.clearRect(0, 0, this.props.width, this.props.height);


        for (let o of state.obj) {
            console.log(o);
            if (!o)
                continue;
            // when replaying, don't draw bounding boxes
            if (this.state.isReplaying &&
                !(o.type !== "bounding box" && (o !== state.moving || o !== state.selected))) {
                continue;
            }

            this.drawShapeObject(ctx, o, o.initX, o.initY, o.finalX, o.finalY);
        }

        let initX = state.initMousePos[0];
        let initY = state.initMousePos[1];
        let finalX = state.finalMousePos[0];
        let finalY = state.finalMousePos[1];

        switch (state.type) {

            case 'square':
                (new Rectangle(ctx, initX, initY, finalX, finalY)).preview(ctx, initX, initY, finalX, finalY);
                break;
            case 'circle':
                (new Circle(ctx, initX, initY, finalX, finalY)).preview(ctx, initX, initY, finalX, finalY);
                break;
            case 'line':
                (new Line(ctx, initX, initY, finalX, finalY)).preview(ctx, initX, initY, finalX, finalY);
                break;
            case 'draw':
                (new FreeForm(ctx, state.freeFormPoints)).preview(ctx, state.freeFormPoints);
                break;
            case 'text box':
                (new TextBox(ctx, initX, initY, finalX, finalY)).preview(ctx, state.textToShow, initX, initY, finalX, finalY);
                break;
            default:
                if (state.moving) {
                    if (state.moving.type === 'text box') {
                        this.drawShapeObject(ctx, state.moving, initX, initY, finalX, finalY)
                        //state.moving.preview(ctx, state.textToShow, initX, initY, finalX, finalY);
                    } else {
                        this.drawShapeObject(ctx, state.moving, initX, initY, finalX, finalY)
                        //state.moving.preview(ctx, initX, initY, finalX, finalY);
                    }
                }
                if (state.selected) {
                    if (state.selected.type === 'text box') {
                        this.drawShapeObject(ctx, state.selected, initX, initY, finalX, finalY)
                        //state.selected.preview(ctx, state.textToShow, initX, initY, finalX, finalY);
                    } else {
                        this.drawShapeObject(ctx, state.selected, initX, initY, finalX, finalY)
                        //state.selected.preview(ctx, initX, initY, finalX, finalY);
                    }
                }
                break;
        }
    }

    clearRect(ctx) {
        ctx.clearRect(0, 0, this.props.width, this.props.height);
    }

    //#endregion

    // ========================================= On Click Events ============================
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
        this.setDrawType(TOOL_TYPE.SHAPE.CIRCLE)
    }

    setLine() {
        this.setDrawType(TOOL_TYPE.SHAPE.LINE)
    }

    // Unused for now
    setTextBox() {
        this.setState({ type: 'text box', initMousePos: [], finalMousePos: [] });
    }


    setFreeForm() {
        this.setDrawType(TOOL_TYPE.FREEFORM)
    }

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
                                    {((this.state.type === 'select') && <BsCursorFill />) || <BsCursor />}
                                </ToggleButton>

                                <ToggleButton title="Draw sqaure" variant='link' type='radio' onClick={e => this.setRectangle()}>
                                    {((this.state.type === 'square') && <BsSquareFill />) || <BsSquare />}
                                </ToggleButton>

                                <ToggleButton title="Draw circle" variant='link' type='radio' onClick={e => this.setCircle()}>
                                    {((this.state.type === 'circle') && <BsCircleFill />) || <BsCircle />}
                                </ToggleButton>

                                <ToggleButton title="Draw line" variant='link' type='radio' onClick={e => this.setLine()}>
                                    {((this.state.type === 'line') && <BsSlashSquareFill />) || <BsSlash />}
                                </ToggleButton>

                                <ToggleButton title="Text tool" variant='link' type='radio' onClick={e => this.setTextBox()}>
                                    {<BsCursorText />}
                                </ToggleButton>

                                <ToggleButton title="Draw freeform" variant='link' type='radio' onClick={e => this.setFreeForm()}>
                                    {((this.state.type === 'draw') && <BsPencilSquare />) || <BsPencil />}
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
                            onMouseMove={e => this.move(e)}
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