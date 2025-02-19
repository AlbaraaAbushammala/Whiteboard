/**
 * @overview ccm component for a collaborative whiteboard
 * @author Albaraa abushammala <albaraa.abushammala@smail.inf.h-brs.de>, 2025
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 */

ccm.files["ccm.whiteboard.js"] = {
    name: "whiteboard",
    ccm: "https://ccmjs.github.io/ccm/versions/ccm-24.0.1.js", //oder lockal "./js/ccm-24.0.1.js"
    config: {
        title: "Whiteboard",
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
                        inner: "Whiteboard",
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
                                    // {
                                    //     tag: "button",
                                    //     class: "upload tool",
                                    //     onclick: "%uploadImage%",
                                    //     inner: "Upload Image",
                                    // },
                                    // {
                                    //     tag: "input",
                                    //     type: "file",
                                    //     id: "image-upload",
                                    //     accept: "image/*",
                                    //     style: "display:none",
                                    //     onchange: "%handleImageUpload%",
                                    // },
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

        // هذي طريقه مختلفه لتعريف المتغيرات 
        // let isDrawing = false;
        // let currentTool = "pen";
        // let currentColor = "#000000";
        // let currentSize = 5;
        // let lastX = 0;
        // let lastY = 0;

        this.init = async () => {
            $ = this.ccm.helper;

        };

        this.ready = async () => {
            // Any one-time setup after dependencies are loaded
        };

        this.start = async () => {

            const whiteboard = $.html(this.html.main, {
                penTool: () => {
                    this.currentTool = "pen";
                    ctx.globalCompositeOperation = "source-over";
                    ctx.lineWidth = this.currentSize;
                },
                markerTool: () => {
                    this.currentTool = "marker";
                    ctx.globalCompositeOperation = "source-over";
                    ctx.lineWidth = this.currentSize * 2; // Marker ist dicker
                    ctx.strokeStyle = this.currentColor;
                },
                highlighterTool: () => {
                    this.currentTool = "highlighter";
                    ctx.globalCompositeOperation = "multiply";
                    ctx.lineWidth = this.currentSize;
                    ctx.strokeStyle = `${this.currentColor}80`; // Transparenz für Highlighter
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

                // uploadImage: () => {
                //     const fileInput = this.element.querySelector("#image-upload");
                //     fileInput.click(); // Öffnet den Dateiauswahl-Dialog
                // },
                // handleImageUpload: (event) => {
                //     const file = event.target.files[0]; // Ausgewählte Datei
                //     if (file) {
                //         const reader = new FileReader();
                //         // Datei wird gelesen
                //         reader.onload = (e) => {
                //             const img = new Image();
                //             img.onload = () => {
                //                 // Das Bild wird auf das Canvas gezeichnet
                //                 ctx.clearRect(0, 0, canvas.width, canvas.height); // Optional: Canvas vorher löschen
                //                 ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                //             };
                //             img.src = e.target.result; // Daten-URL des Bildes
                //         };
                //         reader.readAsDataURL(file); // Datei als Base64 lesen
                //     }
                // },

            });

            $.setContent(this.element, whiteboard);

            canvas = this.element.querySelector("#whiteboard");
            ctx = canvas.getContext("2d");

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

