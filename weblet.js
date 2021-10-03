/* Weblet - v1.0.0 */

// Use strict mode
"use strict";

// Begin time
console.time("Weblet");

// Weblet object
const $ = {};

// Main
(() => {

    // Function for checking the data type
    const checkDataType = (val, type) => {
        switch (type.toLowerCase()) {
            case "number":
                return typeof val == "number";
            case "string":
                return typeof val == "string";
            case "boolean":
                return typeof val == "boolean";
            case "array":
                return Array.isArray(val);
            case "object":
                return val.constructor == Object;
            case "function":
                return typeof val == "function";
            default:
                break;
        }
    };

    // Eval function template
    const evalTemp = (str) => {
        return `
            (() => {
                try {
                    return ${str};
                } catch (err) {
                    throw new $.Error("Using <x-eval>\\n" + err);
                }
            })()
        `;
    };

    // Custom Weblet error
    $.Error = class extends Error {
        constructor(msg) {
            super(msg);
            this.name = "WebletError";
            this.message = msg;
        }
    };

    // Component class
    $.Component = class {
        // Constructor
        constructor(info) {
            // Get the contents from the info object
            this.template = info.template;
            this.content = info.content;
            this.place = info.place;
            this.events = info.events;
        }

        // Attach component
        use(place) {
            // Get the element(s)
            const els = document.querySelectorAll(place ? place : this.place);

            // Put component into the selected element(s)
            for (const el of els) {
                if (checkDataType(this.content, "function")) {
                    el.innerHTML += this.content(this.template.structure);
                }
                if (checkDataType(this.content, "string")) {
                    el.innerHTML += this.content;
                }
            }
        }
    };
        
    // Template class
    $.Template = class {
        // Constructor
        constructor(info) {
            // Get the contents from info object
            this.structure = info.structure;
        }
    };

    // Eval class
    $.Eval = class {
        // Constructor
        constructor(info) {
            this.name = info.name;
            this.update = info.update;
            this.value = info.value;
        }

        // Use
        use() {
            // Get <x-eval>'s
            const xEvals = document.querySelectorAll(`x-eval[name=${this.name}]`);

            // Loop through all elements
            for (const xEval of xEvals) {
                // Set value
                xEval.innerHTML = eval(evalTemp(this.value));

                // If update
                if (this.update) {
                    xEval.setAttribute("update", "update");
                    window.setInterval(() => {
                        xEval.innerHTML = eval(evalTemp(this.update.action(xEval.innerHTML)));
                    }, this.update.time);
                }
            }
        }

        // Eval all
        static all(name) {
            // Get <x-eval>'s
            const xEvals =
                !name ? document.querySelectorAll("x-eval")
                      : document.querySelectorAll(`x-eval[name="${name}"]`);
            
            // Set value
            for (const xEval of xEvals) {
                xEval.innerHTML = eval(evalTemp(xEval.getAttribute("value")));
            }
        }
    };

    // Document
    $.doc = {
        head: document.head,
        body: document.body,
        title: document.title,
        select: (sel) => document.querySelector(sel),
        selectAll: (sel) => document.querySelectorAll(sel),
        selecByTag: (tag) => document.getElementsByTagName(tag),
        selectById: (id) => document.getElementById(id),
        selectByClass: (cls) => document.getElementsByClassName(cls)
    };

    document.head.innerHTML += `<style>
        x-template { display: none }
    </style>`;

})();

// End time
console.timeEnd("Weblet");






