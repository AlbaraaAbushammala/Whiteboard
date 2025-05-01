/**
 * @overview ccm component for a whiteboard
 * @author Albaraa abushammala <albaraa.abushammala@smail.inf.h-brs.de>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.whiteboard.js"] = {
    name: "whiteboard",
    ccm: "./libs/ccm-24.0.1.js",
    config: {
        currentTool: "pen",
        currentColor: "#000000",
        currentSize: 5,
        html: {
            main: {
                tag: "div", id: "", inner: [
                    { tag: "h1", id: "title", class: "title", inner: "%title%" },
                    {
                        tag: "div", id: "whiteboard-container", inner: [
                            {
                                tag: "div", class: "controls", inner: [
                                    { tag: "button", class: "tool", id: "pen", onclick: "%penTool%", inner: "✏️" },
                                    { tag: "button", class: "tool", id: "marker", onclick: "%markerTool%", inner: "🖊️" },
                                    { tag: "button", class: "tool", id: "highlighter", onclick: "%highlighterTool%", inner: "🖍️" },
                                    { tag: "button", class: "tool", id: "eraser", onclick: "%eraserTool%", inner: "🧽" },
                                    { tag: "button", class: "tool", id: "select", onclick: "%selectTool%", inner: "⛶" },
                                    { tag: "input", type: "color", id: "color-picker", onchange: "%changeColor%" },
                                    { tag: "button", class: "tool size-minus", onclick: "%decreaseSize%", inner: "−" },
                                    { tag: "p", class: "size-display", id: "size-display", inner: "5" },
                                    { tag: "button", class: "tool size-plus", onclick: "%increaseSize%", inner: "+" },
                                    { tag: "button", class: "clear", onclick: "%clear%", inner: "Clear" },
                                    { tag: "button", class: "save tool", onclick: "%save%", inner: "💾" },
                                    { tag: "input", type: "file", id: "image-input", accept: "image/*", onchange: "%importImage%" },
                                ]
                            },
                            { tag: "canvas", id: "whiteboard", width: "1650px", height: "500px" }
                        ]
                    }
                ]
            }
        },
        css: ["ccm.load", "./css/style.css"],
    },

    Instance: function () {
        const self = this;
        let $, canvas, ctx;
        const strokes = [];  // Array für gezeichnete Linien
        const images = [];   // Array für importierte Bilder
        let selected = null; // Das aktuell ausgewählte Objekt (Bild oder Linie)
        let drawing = false; // Flag, um zu überprüfen, ob gerade gezeichnet wird
        let dragStart = null; // Startpunkt für das Ziehen von Objekten
        let updateSize; // Funktion zur Aktualisierung der Pinselgröße

        // Initialisierung der ccm-Helper-Funktionen
        this.init = async () => {
            $ = this.ccm.helper;
        };

        this.ready = async () => { };

        // Die Startfunktion wird aufgerufen, wenn das Whiteboard geladen wird
        this.start = async () => {
            // Erstellen des Whiteboard-HTMLs und Binden der Ereignisse
            const whiteboard = $.html(this.html.main, {
                title: this.title,
                penTool: () => setTool("pen"),  // Setzt das Werkzeug auf „Pen“ (Stift)
                markerTool: () => setTool("marker"),  // Setzt das Werkzeug auf „Marker“
                highlighterTool: () => setTool("highlighter"),  // Setzt das Werkzeug auf „Highlighter“
                eraserTool: () => setTool("eraser"),  // Setzt das Werkzeug auf „Radiergummi“
                selectTool: () => setTool("select"),  // Setzt das Werkzeug auf „Auswahl“
                changeColor: (e) => { self.currentColor = e.target.value; setTool(self.currentTool); },  // Setzt die Farbe
                increaseSize: () => { if (self.currentSize < 50) { self.currentSize++; updateSize(); } },  // Erhöht die Pinselgröße
                decreaseSize: () => { if (self.currentSize > 1) { self.currentSize--; updateSize(); } },  // Verringert die Pinselgröße
                importImage: (e) => loadImage(e.target.files[0]),  // Importiert ein Bild
                clear: () => { strokes.length = 0; images.length = 0; selected = null; redraw(); },  // Löscht das Whiteboard
                save: () => {
                    const link = document.createElement("a");
                    link.download = "whiteboard.png";  // Speichert das Whiteboard als PNG
                    link.href = canvas.toDataURL();
                    link.click();
                },
            });
            $.setContent(this.element, whiteboard); // Setzt das HTML-Inhalt auf das Whiteboard

            canvas = this.element.querySelector("#whiteboard"); // Das Canvas-Element
            ctx = canvas.getContext("2d"); // 2D-Kontext für Zeichnen
            ctx.lineCap = ctx.lineJoin = "round"; // Rundung der Linienenden und -verbindungen
            updateSize = () => { this.element.querySelector("#size-display").textContent = this.currentSize; ctx.lineWidth = this.currentSize; };
            setTool("pen"); // Setzt das Standardwerkzeug auf den Stift

            // Ereignislistener für Zeichnen und Auswahl
            canvas.addEventListener("mousedown", onDown);
            canvas.addEventListener("mousemove", onMove);
            canvas.addEventListener("mouseup", onUp);
            canvas.addEventListener("mouseout", onUp);
        };

        // Funktion zum Laden von Bildern
        function loadImage(file) {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => {
                    images.push({ img, x: 0, y: 0, w: canvas.width, h: canvas.height });
                    redraw();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        // Funktion zum Setzen des aktiven Werkzeugs
        function setTool(tool) {
            self.currentTool = tool;
            ctx.globalCompositeOperation = "source-over"; // Standardmäßiger Modus

            // color for active tool    // Farben und Eigenschaften des aktiven Werkzeugs einstellen
            const buttons = self.element.querySelectorAll(".tool");
            buttons.forEach(btn => btn.classList.remove("active"));
            const activeBtn = self.element.querySelector(`#${tool}`);
            if (activeBtn) activeBtn.classList.add("active");

            if (tool === "highlighter") { ctx.globalCompositeOperation = "multiply"; ctx.strokeStyle = `${self.currentColor}20`; ctx.lineWidth = self.currentSize; }
            else if (tool === "marker") { ctx.strokeStyle = self.currentColor; ctx.lineWidth = self.currentSize * 2; }
            else if (tool === "eraser") { ctx.globalCompositeOperation = "destination-out"; ctx.strokeStyle = "rgba(0,0,0,1)"; ctx.lineWidth = self.currentSize; }
            else { ctx.strokeStyle = self.currentColor; ctx.lineWidth = self.currentSize; }
            selected = null; redraw(); // Setzt die Auswahl zurück und zeichnet neu
        }

        // Funktion, die ausgeführt wird, wenn der Mausbutton gedrückt wird
        function onDown(e) {
            const x = e.offsetX, y = e.offsetY;
            if (self.currentTool === "select") {
                selected = null;
                // Überprüfen, ob ein Bild ausgewählt wurde
                for (let i = images.length - 1; i >= 0; i--) {
                    const im = images[i];
                    if (x >= im.x && x <= im.x + im.w && y >= im.y && y <= im.y + im.h) { selected = im; break; }
                }
                // Überprüfen, ob eine Linie ausgewählt wurde
                if (!selected) {
                    for (let i = strokes.length - 1; i >= 0; i--) {
                        const st = strokes[i];
                        if (ctx.isPointInStroke(st.path, x, y)) {
                            selected = st;
                            break;
                        }
                    }
                }
                if (selected) dragStart = { x, y }; // Startpunkt für das Ziehen
                redraw(); drawing = !!selected; return;
            }
            drawing = true;
            const path = new Path2D(); path.moveTo(x, y);  // Startpunkt einer Linie
            strokes.push({ tool: self.currentTool, color: self.currentColor, size: self.currentSize, path, points: [{ x, y }] });
        }

        // Funktion, die ausgeführt wird, wenn die Maus bewegt wird
        function onMove(e) {
            const x = e.offsetX, y = e.offsetY;
            if (!drawing) return;
            if (self.currentTool === "select" && selected && dragStart) {
                const dx = x - dragStart.x, dy = y - dragStart.y;
                // Verschieben des ausgewählten Objekts (Bild oder Linie)
                if (images.includes(selected)) {
                    selected.x += dx; selected.y += dy;
                } else {
                    selected.points.forEach(p => { p.x += dx; p.y += dy; });
                    selected.path = buildPathFromPoints(selected.points);
                }
                dragStart = { x, y }; redraw(); return;
            }
            const curr = strokes[strokes.length - 1]; curr.points.push({ x, y }); curr.path.lineTo(x, y); redraw(); // Zeichnet die Linie weiter
        }

        // Funktion, die ausgeführt wird, wenn die Maus losgelassen wird
        function onUp() {
            drawing = false; // Stoppt das Zeichnen
            dragStart = null; // Setzt den Startpunkt des Ziehens zurück
        }

        // Funktion zum Neuzeichnen des Whiteboards
        function redraw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Löscht das Canvas

            // Zeichnet jedes importierte Bild
            images.forEach(im => ctx.drawImage(im.img, im.x, im.y, im.w, im.h));

            // Zeichnet jede gezeichnete Linie
            strokes.forEach(st => {
                ctx.save(); // Speichert den aktuellen Zustand des Canvas
                ctx.globalCompositeOperation = st.tool === "eraser"
                    ? "destination-out" // Für den Radiergummi-Modus
                    : st.tool === "highlighter"
                        ? "multiply" // Für den Highlighter-Modus 
                        : "source-over"; // Standardmodus für andere Werkzeuge
                ctx.strokeStyle = st.tool === "highlighter"
                    ? `${st.color}20` // Für den Highlighter wird die Farbe transparent gemacht 
                    : st.color; // Für andere Werkzeuge die normale Farbe
                ctx.lineWidth = st.tool === "marker"
                    ? st.size * 2  // Marker hat eine doppelte Strichbreite
                    : st.size; // Andere Werkzeuge haben die normale Strichbreite
                ctx.stroke(st.path); // Zeichnet die Linie
                ctx.restore(); // Stellt den vorherigen Zustand des Canvas wieder her
            });
            // Wenn ein Objekt ausgewählt wurde, wird es hervorgehoben
            if (selected) {
                ctx.save();
                ctx.setLineDash([5, 5]); // Setzt gestrichelte Linien
                ctx.strokeStyle = "blue"; // Blau für die Hervorhebung
                ctx.lineWidth = 2; // Strichbreite für die Hervorhebung
                if (images.includes(selected)) {
                    // Wenn es sich um ein Bild handelt, wird ein Rechteck um das Bild gezeichnet
                    ctx.strokeRect(selected.x, selected.y, selected.w, selected.h);
                } else {
                    // Andernfalls wird die Begrenzung der gezeichneten Linie hervorgehoben
                    const b = getBounds(selected);
                    ctx.strokeRect(b.x, b.y, b.w, b.h); // Zeichnet ein Rechteck um die Linie
                }
                ctx.restore();  // Stellt den vorherigen Zustand des Canvas wieder her
            }
        }

        // Funktion zur Berechnung der Begrenzungsbox für eine Linie oder ein Bild
        function getBounds(st) {
            const xs = st.points.map(p => p.x);  // Extrahiert alle X-Koordinaten der Punkte
            const ys = st.points.map(p => p.y);  // Extrahiert alle Y-Koordinaten der Punkte
            // Gibt die kleinste X- und Y-Koordinate und die größte zurück, um ein Rechteck zu berechnen
            return {
                x: Math.min(...xs) - 5,  // X-Koordinate der linken oberen Ecke
                y: Math.min(...ys) - 5,  // Y-Koordinate der linken oberen Ecke
                w: Math.max(...xs) - Math.min(...xs) + 10,  // Breite des Rechtecks
                h: Math.max(...ys) - Math.min(...ys) + 10   // Höhe des Rechtecks
            };
        }

        // Funktion, um aus den Punkten eine Path2D-Kurve zu erstellen
        function buildPathFromPoints(points) {
            const p = new Path2D();  // Erstellt ein neues Path2D-Objekt
            points.forEach((pt, i) =>
                i === 0 ? p.moveTo(pt.x, pt.y) : p.lineTo(pt.x, pt.y)  // Zeichnet eine Linie durch die Punkte
            );
            return p;  // Gibt den Path zurück
        }
    }

};


// التعديل علي عنصر واضافه نص عليه
// let mainTitle = this.element.querySelector("#title");
// mainTitle.textContent = this.title;



// الاصلي
// Instance: function () {
//     const self = this;
//     let $;
//     let canvas, ctx;

//     this.init = async () => {
//         $ = this.ccm.helper;
//     };

//     this.ready = async () => {
//         // Any one-time setup after dependencies are loaded
//     };

//     this.start = async () => {
//         const whiteboard = $.html(this.html.main, {
//             title: this.title,
//             penTool: () => {
//                 this.currentTool = "pen";
//                 ctx.globalCompositeOperation = "source-over";
//                 ctx.lineWidth = this.currentSize;
//             },
//             markerTool: () => {
//                 this.currentTool = "marker";
//                 ctx.globalCompositeOperation = "source-over"; // شرح Dies ist die Standardeinstellung und zeichnet neue Formen über den bestehenden Canvas-Inhalt
//                 ctx.lineWidth = this.currentSize * 2; // Marker ist dicker
//                 ctx.strokeStyle = this.currentColor;
//             },
//             highlighterTool: () => {
//                 this.currentTool = "highlighter";
//                 ctx.globalCompositeOperation = "multiply";
//                 ctx.lineWidth = this.currentSize;
//                 ctx.strokeStyle = `${this.currentColor}20`; // Transparenz für Highlighter
//             },
//             eraserTool: () => {
//                 this.currentTool = "eraser";
//                 ctx.globalCompositeOperation = "destination-out";
//             },
//             changeColor: (event) => {
//                 this.currentColor = event.target.value;
//                 ctx.strokeStyle = this.currentColor;
//             },
//             increaseSize: () => {
//                 if (this.currentSize < 50) {
//                     this.currentSize++;
//                     updateSizeDisplay();
//                 }
//             },
//             decreaseSize: () => {
//                 if (this.currentSize > 1) {
//                     this.currentSize--;
//                     updateSizeDisplay();
//                 }
//             },
//             clear: () => {
//                 ctx.clearRect(0, 0, canvas.width, canvas.height);
//             },
//             save: () => {
//                 const link = document.createElement("a");
//                 link.download = "whiteboard.png";
//                 link.href = canvas.toDataURL();
//                 link.click();
//             },
//         });

//         $.setContent(this.element, whiteboard); // لوضع محتوى في الاتش ام ال setContent

//         canvas = this.element.querySelector("#whiteboard");
//         ctx = canvas.getContext("2d"); // CanvasRenderingContext2D for "2d",
//         // das ist Creates a CanvasRenderingContext2D object representing a two-dimensional rendering context.

//         ctx.strokeStyle = this.currentColor;
//         ctx.lineWidth = this.currentSize;
//         ctx.lineCap = "round";
//         ctx.lineJoin = "round";

//         const updateSizeDisplay = () => {
//             const sizeDisplay = this.element.querySelector("#size-display");
//             sizeDisplay.textContent = `${this.currentSize}`;
//             ctx.lineWidth = this.currentSize;
//         };

//         canvas.addEventListener("mousedown", startDrawing);
//         canvas.addEventListener("mousemove", draw);
//         canvas.addEventListener("mouseup", stopDrawing);
//         canvas.addEventListener("mouseout", stopDrawing);
//     };

//     const startDrawing = (e) => {
//         this.isDrawing = true;
//         [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
//     };

//     const draw = (e) => {
//         if (!this.isDrawing) return;

//         ctx.beginPath();
//         ctx.moveTo(this.lastX, this.lastY);
//         ctx.lineTo(e.offsetX, e.offsetY);
//         ctx.stroke();

//         [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
//     };

//     const stopDrawing = () => {
//         this.isDrawing = false;
//     };
// },


