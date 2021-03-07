import React from 'react';
import './App.css'
// Dependencies
import clonedeep from 'lodash.clonedeep'

// Shapes
import { Rectangle } from './objects/Rectangle.js';
import { Circle } from './objects/Circle.js';
import { Line } from './objects/Line.js';
import { BoundingBox } from './objects/BoundingBox.js';
import { FreeForm } from './objects/FreeForm.js';
import { Graph } from './objects/Graph.js';
// Replay
import EventRecorder from './replay/EventRecorder'
import EventPlayer from './replay/EventPlayer'
import ReplayManager from './replay/ReplayManager'
// Components/Icons
import { Form, Navbar, Nav, ButtonGroup, ToggleButton, Dropdown } from 'react-bootstrap';
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
import { BiEraser, BiPause, BiPlay, BiVideoRecording } from 'react-icons/bi'

import ReplayButton from './components/ReplayButton';


export class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawing: false, // boolean of whether or not canvas is drawing something
            resizeX: false,
            resizeY: false,
            moving: null,   // current object being moved
            selected: null, // boolean

            obj: [],
            currentObj: [], // array of objects being interacted with, gets cleared every frame

            initMousePos: [], // 0: x, 1: y
            finalMousePos: [], // 0: x, 1: y
            type: 'select',

            // Recording
            isRecording: false,
            isReplaying: false,
        };
        this.canvasRef = React.createRef();
        this.offset = 60;
        this.mouseDistance = [];
        this.mouseRange = 20;
        this.freeFormPoints = [];
        this.canvasRef = React.createRef();
        this.offset = 60;

        this.ms = 0;
        this.startTime = Date.now();

        this.eventRecorder = new EventRecorder();
        this.eventPlayer = new EventPlayer();
        this.replayManager = new ReplayManager();

    }

    // ======================== REPLAY FEATURE ====================================
    updateFrame() {
        if (this.state.isReplaying) {
            this.ms = Date.now() - this.startTime;


            let ctx = this.canvasRef.current.getContext('2d');


            let replayTime = this.eventPlayer.getLength();

            let stateArray = this.eventPlayer.replay(this.ms, ctx);
            for (let state of stateArray)
                this.drawCanvas(ctx, state);

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

    // ================================================ SHAPE MOUSE INTERACTION DETECTOR ============================================
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

    // ========================================== MOUSE EVENTS ==============================

    mouseDown(e) {
        let context = this.canvasRef.current.getContext('2d');

        // If selecting tool on
        if (this.state.type === 'select') {
            // Select shape with greatest Z value
            var selectedShape = this.getComponentWithMaxZValue(e.pageX, e.pageY);

            // If selected shape exists
            if (selectedShape) {
                this.setState({ moving: selectedShape, selected: selectedShape });
                this.mouseDistance = [e.pageX - selectedShape.initX, e.pageY - selectedShape.initY];
            }

            if (selectedShape && !selectedShape.focus) {
                for (let o = 0; o < this.state.obj.length; o++) {
                    if (this.state.obj[o].type === 'bounding box') {
                        this.state.obj[o] = null;
                    } else {
                        this.state.obj[o].focus = false;
                    }
                    this.state.obj = this.state.obj.filter(s => s);
                }

                selectedShape.focus = true;
                this.setState({ initMousePos: [e.pageX, e.pageY], moving: selectedShape });
                this.setState({ obj: [...this.state.obj, new BoundingBox(selectedShape)] });
                ((new BoundingBox(selectedShape)).draw(context))
            } else if (!selectedShape) {
                for (let o = 0; o < this.state.obj.length; o++) {
                    if (this.state.obj[o].type === 'bounding box') {
                        this.state.obj[o] = null;
                    } else {
                        this.state.obj[o].focus = false;
                    }
                    this.state.obj = this.state.obj.filter(s => s);
                }
                this.setState({ selected: null, resizeX: false, resizeY: false });

            }

            // Detect which side is selected and resize accordingly
            if (this.state.selected) {
                if (this.isOnLeftSide(e.pageX, e.pageY, this.state.selected)) {
                    this.setState({ resizeX: true, resizeY: false });
                } else if (this.isOnRightSide(e.pageX, e.pageY, this.state.selected)) {
                    this.setState({ resizeX: true, resizeY: false });
                } else if (this.isOnTopSide(e.pageX, e.pageY, this.state.selected)) {
                    this.setState({ resizeX: false, resizeY: true });
                } else if (this.isOnBottomSide(e.pageX, e.pageY, this.state.selected)) {
                    this.setState({ resizeX: false, resizeY: true });
                }
            }
        } else {
            this.setState({ drawing: true, initMousePos: [e.pageX, e.pageY - this.offset], finalMousePos: [], selected: null });
        }

        if (!this.state.isReplaying) {
            this.drawCanvas(context, this.state)
        }
    }

    move(e) {
        document.body.style.cursor = 'default';
        if (this.state.selected) {
            if (this.isOnLeftSide(e.pageX, e.pageY, this.state.selected)) {
                document.body.style.cursor = 'ew-resize';
            } else if (this.isOnRightSide(e.pageX, e.pageY, this.state.selected)) {
                document.body.style.cursor = 'ew-resize';
            } else if (this.isOnTopSide(e.pageX, e.pageY, this.state.selected)) {
                document.body.style.cursor = 'ns-resize';
            } else if (this.isOnBottomSide(e.pageX, e.pageY, this.state.selected)) {
                document.body.style.cursor = 'ns-resize';
            } else {
                document.body.style.cursor = 'default';
            }
        } else {
            document.body.style.cursor = 'default';
        }

        if (this.state.drawing) {
            this.setState({ finalMousePos: [e.pageX, e.pageY - this.offset] });
            if (this.state.type === 'draw') {
                this.freeFormPoints.push([e.pageX, e.pageY - this.offset]);
            }
        }
        let temp;
        if (this.state.resizeX && this.state.selected) {
            temp = this.state.selected;
            if (this.isOnLeftSide(e.pageX, e.pageY, this.state.selected)) {
                temp.initX = e.pageX;
            } else if (this.isOnRightSide(e.pageX, e.pageY, this.state.selected)) {
                temp.finalX = e.pageX;
            }
            this.setState({
                initMousePos: [temp.initX, temp.initY], 
                finalMousePos: [temp.finalX, temp.finalY]
            });
        } else if (this.state.resizeY && this.state.selected) {
            // so is selected a boolean or a shape?
            temp = this.state.selected;
            if (this.isOnTopSide(e.pageX, e.pageY, this.state.selected)) {
                temp.initY = e.pageY - this.offset;
            } else if (this.isOnBottomSide(e.pageX, e.pageY, this.state.selected)) {
                temp.finalY = e.pageY - this.offset;
            }
            this.setState({
                initMousePos: [temp.initX, temp.initY], 
                finalMousePos: [temp.finalX, temp.finalY]
            });
        } else if (this.state.moving) {
            temp = this.state.moving;
            let distX = this.state.moving.finalX - this.state.moving.initX;
            let distY = this.state.moving.finalY - this.state.moving.initY;
            temp.initX = e.pageX - this.mouseDistance[0];
            temp.initY = e.pageY - this.mouseDistance[1];
            temp.finalX = temp.initX + distX;
            temp.finalY = temp.initY + distY;
            this.setState({
                initMousePos: [temp.initX, temp.initY],
                finalMousePos: [temp.finalX, temp.finalY]
            });
        }
        this.setState({
            moving: temp,
            // selected: temp
        });

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
            case 'draw':
                newObject = new FreeForm(this.freeFormPoints);
                this.freeFormPoints = [];
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

    componentDidUpdate() {
        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');

        if (!this.state.isReplaying) {
            this.drawCanvas(context, this.state);
            this.eventRecorder.record(clonedeep(this.state));
        }
    }

    // ======================================== DRAW CANVAS ====================================

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
            if ( this.state.isReplaying &&
                !(o.type !== "bounding box" && (o !== state.moving || o !== state.selected))) {
                continue;
            }
   
            o.draw(ctx);
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
                (new FreeForm(ctx, this.freeFormPoints)).preview(ctx, this.freeFormPoints);
                break;
            default:
                if (state.moving) {
                    state.moving.preview(ctx, initX, initY, finalX, finalY);
                } 
                if (state.selected) {
                    state.selected.preview(ctx, initX, initY, finalX, finalY);
                }
                break;
        }
    }

    clearRect(ctx) {
        ctx.clearRect(0, 0, this.props.width, this.props.height);
    }

    // ============ Helper functions=======================
    /**
     * 
     * @param {Object} object Object to clone
     * @returns A deep cloned object with no references to the original
     */
    copy(aObject) {
        if (!aObject) {
            return aObject;
        }

        let v;
        let bObject = Array.isArray(aObject) ? [] : {};
        for (const k in aObject) {
            v = aObject[k];
            bObject[k] = (typeof v === "object") ? this.copy(v) : v;
        }

        return bObject;
    }

    // ========================================= On Click Events ============================
    setCursor() {
        this.setState({ type: 'select', initMousePos: [], finalMousePos: [] });
    }

    setSquare() {
        this.setState({ type: 'square', initMousePos: [], finalMousePos: [] });
    }

    setCircle() {
        this.setState({ type: 'circle', initMousePos: [], finalMousePos: [] });
    }

    setLine() {
        this.setState({ type: 'line', initMousePos: [], finalMousePos: [] });
    }

    doClear() {
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
            this.replayManager.addReplay(this.eventRecorder.eventArraytoString());
            //console.log(this.replayManager.replayMap)
        }
    }

    setReplaying() {
        if (!this.state.isReplaying) {
            // Start recording
            this.setState({ isReplaying: true });
            this.eventPlayer = new EventPlayer();
            this.eventPlayer.eventArray = [...this.eventRecorder.eventArray];
            this.startTime = Date.now();

        } else {
            // stop recording
            this.setState({ isReplaying: false });
        }


    }

    onReload() {

    }

    showReplays() {
        let listItemArray = []
        let i = 1;

        for (let replayKey of this.replayManager.getReplayKeys()) {
            
            listItemArray.push(
            <li><ReplayButton 
                replaySelect={() => this.selectReplay(i)}
                saveSelect={() => this.selectSave(i)}
                downloadSelect={() => this.selectDownload(i)}
                num={"Replay #" + i}>
                    </ReplayButton>
                    </li>)
            i++;
        }

        return listItemArray;
    }

    selectReplay(i) {
        alert("Test");
    }

    selectSave(i) {
        console.log(i+" save")
    }

    selectDownload(i) {
        console.log(i+"download")

        //PLACEHOLDER DOWNLOAD TEXT
        var downloadText = "Mio best girl pog ****************************"
        //PLACEHOLDER DOWNLOAD TEXT

        const blob = new Blob([downloadText]);
        const fileDownloadUrl = URL.createObjectURL(blob);

        const hyperlink = document.createElement('a');
        hyperlink.href = fileDownloadUrl;
        hyperlink.download="sav.txt"

        document.body.appendChild(hyperlink);
        hyperlink.click();
        document.body.removeChild(hyperlink);
    }


    setFreeForm() {
        this.setState({ type: 'draw', initMousePos: [], finalMousePos: [] });
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

    render() {
        return (
            <>
                <Form.Row>
                    <Navbar bg="dark" variant="dark" style={{ width: '100%', height: '60px' }}>
                        <Navbar.Brand>TutorPad</Navbar.Brand>
                        <Nav>
                            <ButtonGroup toggle>

                                <ToggleButton variant='link' type='radio' onClick={e => this.setCursor()}>
                                    {((this.state.type === 'select') && <BsCursorFill />) || <BsCursor />}
                                </ToggleButton>

                                <ToggleButton variant='link' type='radio' onClick={e => this.setSquare()}>
                                    {((this.state.type === 'square') && <BsSquareFill />) || <BsSquare />}
                                </ToggleButton>

                                <ToggleButton variant='link' type='radio' onClick={e => this.setCircle()}>
                                    {((this.state.type === 'circle') && <BsCircleFill />) || <BsCircle />}
                                </ToggleButton>

                                <ToggleButton variant='link' type='radio' onClick={e => this.setLine()}>
                                    {((this.state.type === 'line') && <BsSlashSquareFill />) || <BsSlash />}
                                </ToggleButton>

                                <ToggleButton variant='link' type='radio' onClick={e => this.setLine()}>
                                    {<BsCursorText />}
                                </ToggleButton>


                                <ToggleButton variant='link' type='radio' onClick={e => this.setFreeForm()}>
                                    {((this.state.type === 'draw') && <BsPencilSquare />) || <BsPencil />}
                                </ToggleButton>

                                <Dropdown>
                                    <Dropdown.Toggle variant='link'>{<BsGraphUp />}</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={e => this.createGraph('linear')}>Linear</Dropdown.Item>
                                        <Dropdown.Item onClick={e => this.createGraph('quadratic')}>Quadratic</Dropdown.Item>
                                        <Dropdown.Item onClick={e => this.createGraph('cubic')}>Cubic</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <ToggleButton variant='link' type='radio' onClick={e => this.doClear()}>{<BiEraser />}</ToggleButton>
                                <ToggleButton variant='link' type='radio' onChange={e => this.setRecording()}>{this.state.isRecording ? <BiVideoRecording color="red" /> : <BiVideoRecording />}</ToggleButton>
                                <ToggleButton variant='link' type='radio' onChange={e => this.setReplaying()}>{this.state.isReplaying ? <BiPause color="red" /> : <BiPlay />}</ToggleButton>

                                <ToggleButton variant='link' type='radio' onChange={e => this.onReload()}>
                                    Reload
                                </ToggleButton>

                            </ButtonGroup>
                        </Nav>
                    </Navbar>
                </Form.Row>

                <div className="sidebar">
                    <p>
                        <ul class="replay-list">
                            {this.showReplays()}
                        </ul>
                    </p>
                </div>

                <Form.Row>
                    <div>
                        <canvas
                            ref={this.canvasRef}
                            width={this.props.width}
                            height={this.props.height}
                            onMouseDown={e => this.mouseDown(e)}
                            onMouseMove={e => this.move(e)}
                            onMouseUp={e => this.mouseUp(e)}
                        ></canvas>
                    </div>
                </Form.Row>
            </>
        );
    }
}