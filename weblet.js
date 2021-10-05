/* Weblet - v1.0.0 */

// Use strict mode
"use strict";

// Begin time
console.time("Weblet");

// Weblet object
const $ = {
    // About Weblet object
    WEBLET: {
        version: [1, 0, 0]
    }
};

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

    // Element
    $.Element = class {
        // Constructor
        constructor(info) {
            this.element = document.createElement(info.name);
            this.element.id = info.id;
            this.element.className = info.class;
            this.element.innerHTML = info.content;
            this.element.style = info.style;
            this.appendPl = info.appendPl;
            for (const attrName in info.attrs) {
                this.element.setAttribute(attrName, info.attrs[attrName]);
            }
            for (const stylePropName in info.style) {
                this.element.style[stylePropName] = info.style[stylePropName];
            }
        }

        // Append element
        append(tos) {
            const appendTos = document.querySelectorAll(tos || this.appendPl);
            for (const appendTo of appendTos) {
                appendTo.appendChild(this.element);
            }
        }
    };

    // Document
    $.doc = {
        // Selecting important elements
        head: document.head,
        body: document.body,
        title: document.title,

        // Selecting elements
        query: (sel) => {
            document.querySelector(sel);
        },
        queryAll: (sel) => {
            document.querySelectorAll(sel);
        },
        queryByTag: (tag) => {
            document.getElementsByTagName(tag);
        },
        queryById: (id) => {
            document.getElementById(id);
        },
        queryByClass: (cls) => {
            document.getElementsByClassName(cls);
        },

        // Write to body element
        write: (txt) => {
            document.body.innerHTML += txt;
        }
    };

    // Window
    $.window = {
        // Web page width and height
        width: window.innerWidth,
        height: window.innerHeight,

        // Web page information
        url: location.href,
        domain: document.domain,
        hash: location.hash,

        // Pop-up boxes
        alert: (msg) => {
            window.alert(msg.toString());
        },
        prompt: (msg) => {
            window.prompt(msg.toString());
        },
        confirm: (msg) => {
            return window.confirm(msg.toString());
        },

        // Opening and closing windows
        open: (url, target="_self") => {
            // Check data type
            if (!checkDataType(url, "string")) {
                throw new $.Error("First parameter of $.window.open should be a string");
            }
            if (!checkDataType(target, "string")) {
                throw new $.Error("Second parameter of $.window.open should be a string");
            }
            
            // Open web page
            window.open(url, target);
        },
        close: () => {
            window.close();
        }
    };

    // Cookies
    const cookiesObjForProxy = {};
    $.cookies = new Proxy(cookiesObjForProxy, {
        // Getting a cookie's value
        get(target, property) {
            // Variables
            let name = encodeURIComponent(property) + "=",
                start = document.cookie.indexOf(name),
                value;
            
            // If it found the cookie
            if (start > -1) {
                // End of the cookie
                let end = document.cookie.indexOf(";", start);

                // If no semicolon found, the end must be at the end of the
                // `document.cookie` string
                if (end == -1) {
                    end = document.cookie.length;
                }

                // Get the value of the cookie
                value = decodeURIComponent(document.cookie.substring(start + name.length, end));
            }

            // Return the value of the cookie
            return value;
        },

        // Setting a cookie's value
        set(target, name, info) {
            // If is object
            if (checkDataType(info, "object")) {
                // Destruct `newValue` object
                const { value, expires, path, domain, secure } = info;

                // Final
                let final = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

                // Checks if it has expiration date, path, domain, and secure
                if (expires instanceof Date) {
                    final += `; expires=${expires.toGMTString()}`;
                }
                if (path) {
                    final += `; path=${path}`;
                }
                if (domain) {
                    final += `; domain=${domain}`;
                }
                if (secure) {
                    final += `; secure`;
                }

                // Set the cookie
                document.cookie += final;
            }

            // If something else
            else {
                document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(info.toString())}`;
            }

            // If this is a success or not
            return Reflect.set(...arguments);
        }
    });

    // Do things when DOM finished loading
    window.addEventListener("DOMContentLoaded", () => {
        // Do things for HTML templates
        const xTemplates = document.querySelectorAll("x-template[name]");
        for (const xTemplate of xTemplates) {
            xTemplate.style.display = "none";
        }

        // Load all elements using a template
        const xUsingTemps = document.querySelectorAll("x-using-template[name]");
        for (const xUsingTemp of xUsingTemps) {
            xUsingTemp.innerHTML =
                document.querySelector(`x-template[name="${xUsingTemp.getAttribute("name")}"]`).innerHTML;
        }
    });

})();

// End time
console.timeEnd("Weblet");






