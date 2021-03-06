import React from 'react';
import { Rectangle } from './objects/Rectangle.js';
import { Circle } from './objects/Circle.js';
import { Line } from './objects/Line.js';
import { Form, Navbar, Nav, ButtonGroup, ToggleButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsSquare, BsCircle, BsSlash } from 'react-icons/bs';
import { BiEraser, BiPlay, BiVideoRecording } from 'react-icons/bi'
import EventRecorder from './replay/EventRecorder'
import EventPlayer from './replay/EventPlayer'

export class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawing: false,
            obj: [],
            initMousePos: [], // 0: x, 1: y
            finalMousePos: [], // 0: x, 1: y
            type: 'none',
            isRecording: false,
            isReplaying: false
        };
        this.canvasRef = React.createRef();
        this.offset = 60;
        this.ms = 0;

        this.eventRecorder = new EventRecorder();
        this.EventPlayer = new EventPlayer();
    }

    tick() {
        this.ms += 5;
        //console.log(this.ms)


        if (this.state.isReplaying) {
            this.EventPlayer.replay(this.ms, this.canvasRef.current.getContext('2d'));
        }
    }

    componentDidMount() {
        //if (this.state.isReplaying)
        this.interval = setInterval(() => this.tick(), 1);
        
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

    mouseDown(e) {
        this.setState({ drawing: true, initMousePos: [e.pageX, e.pageY - this.offset], finalMousePos: [] } /*, () => console.log(this.state)*/);
        //console.log(this.state.type);
    }

    move(e) {
        if (this.state.drawing) {
            this.setState({ finalMousePos: [e.pageX, e.pageY - this.offset] });
        }
    }

    mouseUp(e) {
        let [initX, initY] = this.state.initMousePos;
        let [finalX, finalY] = this.state.finalMousePos;
        let newObject;

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
            default:
                newObject = null;
        }
        if (newObject) {
            this.setState({ drawing: false, obj: [...this.state.obj, newObject] });
        }
    }

    componentDidUpdate() {
        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');
        context.fillStyle = '#000000';
        context.clearRect(0, 0, this.props.width, this.props.height);

        for (let o of this.state.obj) {
            o.draw(context);
            //console.log(o);
        }

        let initX = this.state.initMousePos[0];
        let initY = this.state.initMousePos[1];
        let finalX = this.state.finalMousePos[0];
        let finalY = this.state.finalMousePos[1];
        switch (this.state.type) {
            case 'square':
                (new Rectangle(context, initX, initY, finalX, finalY)).preview(context, initX, initY, finalX, finalY);
                break;
            case 'circle':
                (new Circle(context, initX, initY, finalX, finalY)).preview(context, initX, initY, finalX, finalY);
                break;
            case 'line':
                (new Line(context, initX, initY, finalX, finalY)).preview(context, initX, initY, finalX, finalY);
                break;
        }

        this.eventRecorder.record(this.state);
    }

    // Button onClick
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
        this.state.obj = [];
        this.state.initMousePos = [];
        this.state.finalMousePos = [];
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
        }
    }

    setReplaying() {
        if (!this.state.isReplaying) {
            // Start recording
            this.setState({ isReplaying: true });
            this.eventPlayer = new EventPlayer();
            this.EventPlayer.eventArray = this.eventRecorder.eventArray;
            this.ms = 0;

        } else {
            // stop recording
            this.setState({ isReplaying: false });
        }
    
    }

    render() {
        return (
            <>
                <Form.Row>
                    <Navbar bg="dark" variant="dark" style={{ width: '100%', height: '60px' }}>
                        <Navbar.Brand>TutorPad</Navbar.Brand>
                        <Nav>
                            <ButtonGroup toggle>
                                <ToggleButton variant='link' type='radio' onClick={e => this.setSquare()}>{<BsSquare />}</ToggleButton>
                                <ToggleButton variant='link' type='radio' onClick={e => this.setCircle()}>{<BsCircle />}</ToggleButton>
                                <ToggleButton variant='link' type='radio' onClick={e => this.setLine()}>{<BsSlash />}</ToggleButton>
                                <ToggleButton variant='link' type='radio' onClick={e => this.doClear()}>{<BiEraser/>}</ToggleButton>
                                <ToggleButton variant='link' type='radio' onChange={e => this.setRecording()}>
                                    {this.state.isRecording ? <BiVideoRecording color="red" /> : <BiVideoRecording />}
                                    </ToggleButton>
                                <ToggleButton variant='link' type='radio' onChange={e => this.setReplaying()}>{this.state.isReplaying ? <BiPlay color="red" /> : <BiPlay />}</ToggleButton>
                            </ButtonGroup>
                        </Nav>
                    </Navbar>
                </Form.Row>

                <Form.Row>
                    <div>
                        <canvas
                            ref={this.canvasRef}
                            width={this.props.width}
                            height={this.props.height}
                            onMouseDown={e => this.mouseDown(e)}
                            onMouseMove={e => this.move(e)}
                            onMouseUp={e => this.mouseUp(e)}
                        // onDragStart={e => this.drag(e)}
                        ></canvas>
                    </div>
                </Form.Row>
            </>
        );
    }
}