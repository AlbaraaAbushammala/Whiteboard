/**
 * @overview ccm component for a whiteboard
 * @author Albaraa abushammala <albaraa.abushammala@smail.inf.h-brs.de>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.whiteboard.js"] = {
    name: "whiteboard",
    ccm: "./libs/ccm-24.0.1.js",
    config: {
        title: "Whiteboard",
        currentTool: "pen",
        currentColor: "#000000",
        currentSize: 5,
        logo:"",
        html: ["ccm.load", {url:"./templates/template.js",type:"module"}], // mjs نكتب مودول اذا ما كان الملف امتداده  
        css: ["ccm.load", "./css/style.css"],
    },

    Instance: function () {
        const self = this;
        let $, canvas, ctx;
        const strokes = [];  
        const images = [];   
        const texts = []; 
        let selected = null; 
        let drawing = false; 
        let dragStart = null; 
        let updateSize; 

        this.init = async () => {
            $ = this.ccm.helper;
        };

        this.ready = async () => { };

        
        this.start = async () => {
            
            const whiteboard = $.html(this.html.main, {
                title: this.title,
                currentSize: this.currentSize,
                currentColor: this.currentColor,
                currentTool: this.currentTool,
                logo: this.logo,
                textTool: () => setTool("text"),  
                penTool: () => setTool("pen"),  
                markerTool: () => setTool("marker"),  
                highlighterTool: () => setTool("highlighter"),  
                eraserTool: () => setTool("eraser"),  
                selectTool: () => setTool("select"), 
                changeColor: (e) => { self.currentColor = e.target.value; setTool(self.currentTool); },  
                increaseSize: () => { if (self.currentSize < 50) { self.currentSize++; updateSize(); } },  
                decreaseSize: () => { if (self.currentSize > 1) { self.currentSize--; updateSize(); } },  
                importImage: (e) => loadImage(e.target.files[0]),  
                clear: () => { strokes.length = 0; images.length = 0; texts.length = 0; selected = null; redraw(); },  
                save: () => {
                    const link = document.createElement("a");
                    link.download = "whiteboard.png";  // Speichert das Whiteboard als PNG
                    link.href = canvas.toDataURL();
                    link.click();
                },
            });
            $.setContent(this.element, whiteboard); 

            canvas = this.element.querySelector("#whiteboard"); 
            ctx = canvas.getContext("2d"); 
            ctx.lineCap = ctx.lineJoin = "round"; 
            updateSize = () => { this.element.querySelector("#size-display").textContent = this.currentSize; ctx.lineWidth = this.currentSize; };
            setTool(this.currentTool); 

            
            canvas.addEventListener("mousedown", onDown);
            canvas.addEventListener("mousemove", onMove);
            canvas.addEventListener("mouseup", onUp);
            canvas.addEventListener("mouseout", onUp);
        };

        
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

        function setTool(tool) {
            self.currentTool = tool;
            ctx.globalCompositeOperation = "source-over"; 

            
            const buttons = self.element.querySelectorAll(".tool");
            buttons.forEach(btn => btn.classList.remove("active"));
            const activeBtn = self.element.querySelector(`#${tool}`);
            if (activeBtn) activeBtn.classList.add("active");
            canvas.style.cursor = "default";
            if (tool === "highlighter") { ctx.globalCompositeOperation = "multiply"; ctx.strokeStyle = `${self.currentColor}20`; ctx.lineWidth = self.currentSize; }
            else if (tool === "marker") { ctx.strokeStyle = self.currentColor; ctx.lineWidth = self.currentSize * 2; }
            else if (tool === "text") { canvas.style.cursor = "text"}
            else if (self.currentTool === "select") { canvas.style.cursor = "pointer"}
            else if (tool === "eraser") { ctx.globalCompositeOperation = "destination-out"; ctx.lineWidth = self.currentSize; }
            else { ctx.strokeStyle = self.currentColor; ctx.lineWidth = self.currentSize; }
            selected = null; redraw(); // Setzt die Auswahl zurück und zeichnet neu
        }

        function onDown(e) {
            const x = e.offsetX, y = e.offsetY;

            // if (self.currentTool === "eraser") { لمااحط حذف للعنصر كامل
            //     drawing = true;
            //     eraseAt(x, y);
            //     return;
            // }
            
            if (self.currentTool === "select") {
                selected = null;

                
                for (let i = images.length - 1; i >= 0; i--) {
                    const im = images[i];
                    if (x >= im.x && x <= im.x + im.w && y >= im.y && y <= im.y + im.h) {
                        selected = im;
                        break;
                    }
                }

                
                if (!selected) {
                    for (let i = strokes.length - 1; i >= 0; i--) {
                        const st = strokes[i];
                        if (ctx.isPointInStroke(st.path, x, y)) {
                            selected = st;
                            break;
                        }
                    }
                }

                if (selected) dragStart = { x, y };
                redraw();
                drawing = !!selected;
                return;
            }

            
            if (self.currentTool === "text") {
                const text = prompt("Gib deinen Text ein:");
                if (text) {
                    texts.push({
                        text,
                        x,
                        y,
                        color: self.currentColor,
                        size: self.currentSize
                    });
                    redraw();
                }
                return;
            }

            
            drawing = true;
            const path = new Path2D();
            path.moveTo(x, y);
            strokes.push({
                tool: self.currentTool,
                color: self.currentColor,
                size: self.currentSize,
                path,
                points: [{ x, y }]
            });
        }

        function onMove(e) {
            const x = e.offsetX, y = e.offsetY;
            if (!drawing) return;

            // if (self.currentTool === "eraser") { لما نحط حذف لكامل العنص
            //     eraseAt(x, y);
            //     return;
            // }

            if (self.currentTool === "select" && selected && dragStart) {
                const dx = x - dragStart.x, dy = y - dragStart.y;
                
                if (images.includes(selected)) {
                    selected.x += dx; selected.y += dy;
                } else {
                    selected.points.forEach(p => { p.x += dx; p.y += dy; });
                    selected.path = buildPathFromPoints(selected.points);
                }
                dragStart = { x, y }; redraw(); return;
            }
            const curr = strokes[strokes.length - 1]; curr.points.push({ x, y }); curr.path.lineTo(x, y); redraw(); 
        }

        function onUp() {
            drawing = false; // Stoppt das Zeichnen
            dragStart = null; // Setzt den Startpunkt des Ziehens zurück
        }

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
            texts.forEach(txt => {
                ctx.save();
                ctx.fillStyle = txt.color;
                ctx.font = `${txt.size * 4}px Arial`;
                ctx.fillText(txt.text, txt.x, txt.y);
                ctx.restore();
            });
        }

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

        function buildPathFromPoints(points) {
            const p = new Path2D();  // Erstellt ein neues Path2D-Objekt
            points.forEach((pt, i) =>
                i === 0 ? p.moveTo(pt.x, pt.y) : p.lineTo(pt.x, pt.y)  // Zeichnet eine Linie durch die Punkte
            );
            return p;  // Gibt den Path zurück
        }

        // function eraseAt(x, y) { 
        //     // Entfernt Strokes, die im aktuellen Pfad enthalten sind
        //     for (let i = strokes.length - 1; i >= 0; i--) {
        //         const st = strokes[i];
        //         if (ctx.isPointInStroke(st.path, x, y)) {
        //             strokes.splice(i, 1);
        //         }
        //     }
        //     redraw(); // neu zeichnen ohne gelöschte Elemente
        // }  لما احط حذف للعنصر كامل
    }

};


// التعديل علي عنصر واضافه نص عليه
// let mainTitle = this.element.querySelector("#title");
// mainTitle.textContent = this.title;



