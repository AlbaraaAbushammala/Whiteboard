/**
 * @overview ccm component for a whiteboard
 * @author Albaraa abushammala <albaraa.abushammala@smail.inf.h-brs.de>, 2025
 * @license The MIT License (MIT)
 */


ccm.files["ccm.whiteboard.js"] = {
    name: "whiteboard",
    // ccm: "./libs/ccm-24.0.1.js",
    ccm: "./libs/ccm.js",
    config: {
        title: "Hallo",
        isDrawing: false,
        currentTool: "pen",
        currentColor: "#000000",
        currentSize: 5,
        lastX: 0,
        lastY: 0,
        html: {
            main: `
            <div>
                <h1 id="title" class="title">%title%</h1>
            </div>
            <div id="whiteboard-container">
                <div class="controls">
                    <button class="tool" id="pen" onclick="penTool()"> Pen </button>
                    <button class="tool" id="marker" onclick="markerTool()"> Marker </button>
                    <button class="tool" id="highlighter" onclick="highlighterTool()"> highligh. </button>
                    <button class="tool" id="eraser" onclick="eraserTool()"> Eraser </button>
                    <input type="color" id="color-picker" onchange="changeColor()">
                    <span>Pen</span>
                    <button class="tool size-minus" onclick="decreaseSize()"> - </button>
                    <h5 id="size-display" class="size-display"></h5>
                    <button class="tool size-plus" onclick="increaseSize()"> + </button>
                    <button class="clear" onclick="clear()"> Clear </button>
                    <button class="save tool" onclick="save()"> Save </button>
                </div>
                <canvas id="whiteboard" width="1650px" height="500px"></canvas>
            </div>`
        },

        css: ["ccm.load", "./css/style.css"],
    },

    Instance: function () {
        const self = this;
        let $;
        let canvas, ctx;

        this.init = async () => {
            $ = this.ccm.helper;
        };

        this.ready = async () => {
            // Any one-time setup after dependencies are loaded
        };

        this.start = async () => {
            this.element.appendChild(this.ccm.helper.html(this.html.main, {}))
            const whiteboard = $.html.main(this.html.main, {

            });

            $.setContent(this.element, whiteboard);

            canvas = this.element.querySelector("#whiteboard");
            ctx = canvas.getContext("2d"); // CanvasRenderingContext2D for "2d",
            // das ist Creates a CanvasRenderingContext2D object representing a two-dimensional rendering context.


        };

        
    },

};
