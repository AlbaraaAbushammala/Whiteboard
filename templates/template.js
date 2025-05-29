export const main = {
    tag: "div", id: "", inner: [
        { tag: "h1", id: "title", class: "title", inner: "%title%" },
        {
            tag: "div", id: "whiteboard-container", inner: [
                {
                    tag: "div", class: "tools-row", inner: [
                        {
                            tag: "div", class: "controls", inner: [
                                { tag: "button", class: "tool", id: "pen", onclick: "%penTool%", inner: "✏️" },
                                { tag: "button", class: "tool", id: "marker", onclick: "%markerTool%", inner: "🖊️" },
                                { tag: "button", class: "tool", id: "highlighter", onclick: "%highlighterTool%", inner: "🖍️" },
                                { tag: "button", class: "tool", id: "eraser", onclick: "%eraserTool%", inner: "🧽" },
                                { tag: "button", class: "tool", id: "text", onclick: "%textTool%", inner: "🅣" },
                                { tag: "button", class: "tool", id: "select", onclick: "%selectTool%", inner: "⛶" },
                                { tag: "input", type: "color", id: "color-picker", onchange: "%changeColor%", value: "%currentColor%" },
                                { tag: "button", class: "tool ", onclick: "%decreaseSize%", inner: "−" },
                                { tag: "p", class: "size-display", id: "size-display", inner: "%currentSize%" },
                                { tag: "button", class: "tool ", onclick: "%increaseSize%", inner: "+" },
                            ]
                        },
                        {
                            tag: "div", class: "controls", inner: [
                                { tag: "button", class: "tool danger", onclick: "%clear%", inner: "🗑️" },
                                { tag: "button", class: "save tool", onclick: "%save%", inner: "💾" },
                                { tag: "label", for: "image-input", class: "tool image-input", inner: "📤" },
                                { tag: "input", type: "file", id: "image-input", accept: "image/*", onchange: "%importImage%" },

                            ]
                        },
                    ]
                },

                { tag: "canvas", id: "whiteboard", width: "1650px", height: "500px" }
            ]
        }
    ]
};