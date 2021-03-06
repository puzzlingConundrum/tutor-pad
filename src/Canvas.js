import React from 'react';
import { Rectangle } from './objects/Rectangle.js';
import { Circle } from './objects/Circle.js';
import { Line } from './objects/Line.js';
import { Form, Navbar, Nav, ButtonGroup, ToggleButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsSquare, BsCircle, BsSlash } from 'react-icons/bs';

export class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawing: false,
            obj: [],
            initMousePos: [],
            finalMousePos: [],
            type: 'none'
        };
        this.canvasRef = React.createRef();
        this.offset = 60;
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
        this.setState({ drawing: true, initMousePos: [e.pageX, e.pageY - this.offset], finalMousePos: [] }, () => console.log(this.state));
        console.log(this.state.type);
    }

    move(e) {
        if (this.state.drawing) {
            this.setState({ finalMousePos: [e.pageX, e.pageY - this.offset] });
        }
    }

    mouseUp(e) {
        let initX, initY = this.state.initMousePos;
        let finalX, finalY = this.state.finalMousePos;
        let newObject;
        switch (this.state.type) {
            case 'square':
                newObject = new Rectangle(initX, initY, finalX, finalY)
                break;
            case 'circle':
                newObject = new Circle();
                break;
            case 'line':
                newObject = new Line();
                break;
            default:
                newObject = null;
        }
        if (newObject) {
            this.setState({ drawing: false, obj: [...this.state.obj, newObject] });
        }
    }

    setSquare() {
        this.setState({type: 'square', initMousePos: [], finalMousePos: []});
    }

    setCircle() {
        this.setState({type: 'circle', initMousePos: [], finalMousePos: []});
    }

    setLine() {
        this.setState({type: 'line', initMousePos: [], finalMousePos: []});
    }

    componentDidUpdate() {
        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');
        context.fillStyle = '#000000';
        context.clearRect(0,0,this.props.width, this.props.height);

        for (let o of this.state.obj) {
            o.draw(context);
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

        for (let o of this.state.obj) {
            o.draw(context);
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