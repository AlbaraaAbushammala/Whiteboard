/**
 * @overview ccm component for a whiteboard
 * @author Albaraa abushammala <albaraa.abushammala@smail.inf.h-brs.de>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.whiteboard.js"] = {
    name: "whiteboard",
    ccm: "./libs/ccm-24.0.1.js",
    config: {
        title: "Test",
        isDrawing: false,
        currentTool: "pen",
        currentColor: "#000000",
        currentSize: 5,
        lastX: 0,
        lastY: 0,
        html: {
            main:
            {
                tag: "div",
                id: "",
                inner: [
                    {
                        tag: "h1",
                        id: "title",
                        class: "title",
                        inner: "%title%",
                    },
                    {
                        tag: "div",
                        id: "whiteboard-container",
                        inner: [
                            {
                                tag: "div",
                                class: "controls",
                                inner: [
                                    {
                                        tag: "button",
                                        class: "tool",
                                        id: "pen",
                                        onclick: "%penTool%",
                                        inner: "Pen",
                                    },
                                    {
                                        tag: "button",
                                        class: "tool",
                                        id: "marker",
                                        onclick: "%markerTool%",
                                        inner: "Marker",
                                    },
                                    {
                                        tag: "button",
                                        class: "tool",
                                        id: "highlighter",
                                        onclick: "%highlighterTool%",
                                        inner: "highligh.",
                                    },
                                    {
                                        tag: "button",
                                        class: "tool",
                                        id: "eraser",
                                        onclick: "%eraserTool%",
                                        inner: "Eraser",
                                    },
                                    {
                                        tag: "input",
                                        type: "color",
                                        id: "color-picker",
                                        onchange: "%changeColor%",
                                    },
                                    {
                                        tag: "button",
                                        class: "tool size-minus",
                                        onclick: "%decreaseSize%",
                                        inner: "−",
                                    },
                                    {
                                        tag: "h5",
                                        class: "size-display",
                                        id: "size-display",
                                        inner: "5",
                                    },
                                    {
                                        tag: "button",
                                        class: "tool size-plus",
                                        onclick: "%increaseSize%",
                                        inner: "+",
                                    },
                                    {
                                        tag: "button",
                                        class: "clear",
                                        onclick: "%clear%",
                                        inner: "Clear",
                                    },
                                    {
                                        tag: "button",
                                        class: "save tool",
                                        onclick: "%save%",
                                        inner: "Save",
                                    },
                                ],
                            },
                            {
                                tag: "canvas",
                                id: "whiteboard",
                                width: "1650px",
                                height: "500px"
                            },
                        ]
                    },

                ],
            }
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
            const whiteboard = $.html(this.html.main, {
                title: "Whiteboard",
                penTool: () => {
                    this.currentTool = "pen";
                    ctx.globalCompositeOperation = "source-over";
                    ctx.lineWidth = this.currentSize;
                },
                markerTool: () => {
                    this.currentTool = "marker";
                    ctx.globalCompositeOperation = "source-over"; // شرح Dies ist die Standardeinstellung und zeichnet neue Formen über den bestehenden Canvas-Inhalt
                    ctx.lineWidth = this.currentSize * 2; // Marker ist dicker
                    ctx.strokeStyle = this.currentColor;
                },
                highlighterTool: () => {
                    this.currentTool = "highlighter";
                    ctx.globalCompositeOperation = "multiply";
                    ctx.lineWidth = this.currentSize;
                    ctx.strokeStyle = `${this.currentColor}20`; // Transparenz für Highlighter
                },
                eraserTool: () => {
                    this.currentTool = "eraser";
                    ctx.globalCompositeOperation = "destination-out";
                },
                changeColor: (event) => {
                    this.currentColor = event.target.value;
                    ctx.strokeStyle = this.currentColor;
                },
                increaseSize: () => {
                    if (this.currentSize < 50) {
                        this.currentSize++;
                        updateSizeDisplay();
                    }
                },
                decreaseSize: () => {
                    if (this.currentSize > 1) {
                        this.currentSize--;
                        updateSizeDisplay();
                    }
                },
                clear: () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                },
                save: () => {
                    const link = document.createElement("a");
                    link.download = "whiteboard.png";
                    link.href = canvas.toDataURL();
                    link.click();
                },
            });

            $.setContent(this.element, whiteboard); // لوضع محتوى في الاتش ام ال setContent 

            canvas = this.element.querySelector("#whiteboard");
            ctx = canvas.getContext("2d"); // CanvasRenderingContext2D for "2d",
            // das ist Creates a CanvasRenderingContext2D object representing a two-dimensional rendering context.

            ctx.strokeStyle = this.currentColor;
            ctx.lineWidth = this.currentSize;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            const updateSizeDisplay = () => {
                const sizeDisplay = this.element.querySelector("#size-display");
                sizeDisplay.textContent = `${this.currentSize}`;
                ctx.lineWidth = this.currentSize;
            };

            canvas.addEventListener("mousedown", startDrawing);
            canvas.addEventListener("mousemove", draw);
            canvas.addEventListener("mouseup", stopDrawing);
            canvas.addEventListener("mouseout", stopDrawing);
        };

        const startDrawing = (e) => {
            this.isDrawing = true;
            [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
        };

        const draw = (e) => {
            if (!this.isDrawing) return;

            ctx.beginPath();
            ctx.moveTo(this.lastX, this.lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();

            [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
        };

        const stopDrawing = () => {
            this.isDrawing = false;
        };
    },
};



// التعديل علي عنصر واضافه نص عليه
// let mainTitle = this.element.querySelector("#title");
// mainTitle.textContent = this.title;

