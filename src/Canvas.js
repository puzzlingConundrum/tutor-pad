import React from 'react';
import { Rectangle } from './objects/Rectangle.js';
import { Circle } from './objects/Circle.js';
import { Line } from './objects/Line.js';
import { BoundingBox } from './objects/BoundingBox.js';
import { Form, Navbar, Nav, ButtonGroup, ToggleButton } from 'react-bootstrap';
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
    BsCursorText 
} from 'react-icons/bs';

export class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawing: false,
            obj: [],
            initMousePos: [], // 0: x, 1: y
            finalMousePos: [], // 0: x, 1: y
            type: 'select'
        };
        this.canvasRef = React.createRef();
        this.offset = 60;
    }

    setType(type) {
        this.setState({ type: { type } });
    }

    isInside(x, y, shape) {
        return (x >= shape.initX && x <= shape.finalX && y >= shape.initY && y < shape.finalY);
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

    mouseDown(e) {
        if (this.state.type === 'select') {
            console.log('selected');
            let selectedShape = this.getComponentWithMaxZValue(e.pageX, e.pageY);
            if (selectedShape && !selectedShape.focus) {
                for (let o of this.state.obj) {
                    o.focus = false;
                }
                let context = this.canvasRef.current.getContext('2d');
                selectedShape.focus = true;
                ((new BoundingBox(selectedShape)).draw(context))
            } else if (!selectedShape) {
                for (let o of this.state.obj) {
                    o.focus = false;
                }
            }
        } else {
            this.setState({ drawing: true, initMousePos: [e.pageX, e.pageY - this.offset], finalMousePos: [] });
        }
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
            default:
                break;
        }
    }

    // Button onClick
    setCursor() {
        this.setState({type: 'select', initMousePos: [], finalMousePos: []});
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
                                    {<BsCursorText/>}
                                </ToggleButton>
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