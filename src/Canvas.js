import React from 'react';

export class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawing: false,
            obj: [],
            initMousePos: [],
            finalMousePos: []
        };
        this.canvasRef = React.createRef();
    }

    mouseDown(e) {
        this.setState({ drawing: true, initMousePos: [e.pageX, e.pageY], finalMousePos: [] }, () => console.log(this.state));
    }

    move(e) {
        if (this.state.drawing) {
            this.setState({ finalMousePos: [e.pageX, e.pageY] });
        }
    }

    mouseUp(e) {
        this.setState({ drawing: false, obj: [...this.state.obj, [this.state.initMousePos[0], this.state.initMousePos[1], this.state.finalMousePos[0], this.state.finalMousePos[1]]]});
    }

    componentDidUpdate() {
        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');
        context.fillStyle = '#000000';
        // console.log(this.state.obj);
        for (let o of this.state.obj) {
            context.beginPath();
            context.rect(o[0], o[1], Math.abs(o[3] - o[0]), Math.abs(o[4] - o[1]));
            context.stroke();
            // console.log(o);
        }

        let initX = this.state.initMousePos[0];
        let initY = this.state.initMousePos[1];
        let finalX = this.state.finalMousePos[0];
        let finalY = this.state.finalMousePos[1];
        context.clearRect(initX, initY, Math.abs(finalX - initX), Math.abs(finalY - initY));
        context.beginPath();
        context.rect(initX, initY, Math.abs(finalX - initX), Math.abs(finalY - initY));
        context.closePath();
        context.stroke();
    }

    render() {
        return (
            <canvas
                ref={this.canvasRef}
                width={this.props.width}
                height={this.props.height}
                onMouseDown={e => this.mouseDown(e)}
                onMouseMove={e => this.move(e)}
                onMouseUp={e => this.mouseUp(e)}
            // onDragStart={e => this.drag(e)}
            >

            </canvas>
        );
    }
}