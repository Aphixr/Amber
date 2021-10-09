/* Weblet - v0.1.0.1 (Pre-release) */

// Use strict mode
"use strict";

// Begin time
console.time("Weblet");

// Weblet object
const $ = {
    // About Weblet object
    WEBLET: {
        version: "0.1.0.1",
        isPreRelease: true
    },

    // Custom error class
    Error: class extends Error {
        constructor(msg) {
            super(msg);
            this.name = "WebletError";
            this.message = msg;
        }
    },

    // Other classes
    Component: undefined,
    Template: undefined,
    Element: undefined,

    // Other objects
    doc: null,
    window: null,
    cookies: null
};

// Check if this is a pre-release
if ($.WEBLET.isPreRelease) {
    console.warn(
        `The version of Weblet you are using (${$.WEBLET.version}) ` +
        `is a pre-release.`
    );
}

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
                return val && val.constructor == Object;
            case "function":
                return typeof val == "function";
            case "symbol":
                return typeof val == "symbol";
            default:
                throw new Error(`'${type}' is not a valid type`);
        }
    };

    // Check if a string is a valid selector
    const checkIsValidSelector = (sel) => {
        try {
            if (!sel) {
                throw void 0;
            }
            document.createDocumentFragment().querySelector(sel);
        } catch (err) {
            throw new $.Error(`'${sel}' is not a valid selector`);
        }
        return true;
    };

    // Component class
    $.Component = class {
        // Constructor
        constructor(info) {
            // Check data type
            if (!checkDataType(info, "object")) {
                throw new $.Error("$.Component constructor argument should be an object");
            }

            // Get the contents from the info object
            this.template = info.template;
            this.content = info.content;
            this.place = info.place;
            this.events = info.events;
        }

        // Attach component
        append(place) {
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
            // Check data type
            if (!checkDataType(info, "object")) {
                throw new $.Error("$.Component constructor argument should be an object");
            }

            // Get the contents from info object
            this.structure = info.structure;
        }
    };

    // Element
    $.Element = class {
        // Constructor
        constructor(info) {
            // Check data type
            if (!checkDataType(info, "object")) {
                throw new $.Error("$.Component constructor argument should be an object");
            }

            // Create the element
            this.element = document.createElement(info.name);
            if (info.id) this.element.id = info.id;
            if (info.class) this.element.className = info.class;
            if (info.content) this.element.innerHTML = info.content;
            if (info.style && checkDataType(info.style, "object")) {
                this.element.style = info.style;
            }
            this.appendPl = info.append;
            for (const attrName in info.attrs) {
                this.element.setAttribute(attrName, info.attrs[attrName]);
            }
            for (const stylePropName in info.style) {
                this.element.style[stylePropName] = info.style[stylePropName];
            }
            for (const evtName in info.events) {
                this.element.setAttribute("on" + evtName, `(${info.events[evtName]})()`);
            }
        }

        // Append element
        append(tos) {
            const appendTos = document.querySelectorAll(tos || this.append);
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
            if (checkIsValidSelector(sel)) {
                return document.querySelector(sel);
            }
        },
        queryAll: (sel) => {
            if (checkIsValidSelector(sel)) {
                return document.querySelectorAll(sel);
            }
        },
        queryByTag: (tag) => {
            return document.getElementsByTagName(tag);
        },
        queryById: (id) => {
            return document.getElementById(id);
        },
        queryByClass: (cls) => {
            return document.getElementsByClassName(cls);
        },

        // Write to body element
        write: (txt) => {
            document.body.innerHTML += txt;
        }
    };

    // Window
    $.window = {
        // Web page width and height
        width: innerWidth,
        height: innerHeight,

        // Web page information
        url: location.href,
        domain: document.domain,
        hash: location.hash,

        // Pop-up boxes
        alert: (msg) => {
            alert(msg);
        },
        prompt: (msg) => {
            prompt(msg);
        },
        confirm: (msg) => {
            return confirm(msg);
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
            open(url, target);
        },
        close: () => {
            close();
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
        // Time
        console.time("Weblet.HTMLActions");

        // Document object (for performance)
        const doc = document;

        // Replace [[ and ]]
        doc.body.innerHTML =
            doc.body.innerHTML
                .replace(/\[\[/g, "<x-expr>")
                .replace(/\]\]/g, "</x-expr>");
        
        // Hide <x-expr>'s
        const xExprs = doc.querySelectorAll("x-expr");
        for (const xExpr of xExprs) {
            xExpr.innerText = (() => {
                try {
                    return eval(xExpr.innerText);
                } catch (err) {
                    const it = xExpr.innerText;
                    xExpr.innerHTML = "";
                    throw new $.Error(`For [[ ${it} ]]\n` + err);
                }
            })();
        }

        // Do things for HTML templates
        const xTemplates = doc.querySelectorAll("x-temp");
        for (const xTemplate of xTemplates) {
            xTemplate.style.display = "none";
        }

        // Load all elements using a template
        const xUsingTemps = doc.querySelectorAll("[x-temp-using]");
        for (const xUsingTemp of xUsingTemps) {
            // Get template name and template element
            const name = xUsingTemp.getAttribute("x-temp-using"),
                  temp = doc.querySelector(`x-temp[name="${name}"]`),
                  
                  // Parameter info
                  paramsNames = temp.getAttribute("params").split(";"),
                  paramEls = temp.querySelectorAll("[x-temp-param]"),
                  argsValues = xUsingTemp.getAttribute("x-temp-args").split(";"),
                  params = {};
            
            // For loops
            let i = 0;

            // Throw an error if template is not defined
            if (!temp) {
                throw new $.Error(`'${name}' is not a defined template`);
            }

            // Object that will have prop name as param and value as arg
            for (; i < paramsNames.length; i++) {
                params[paramsNames[i]] = argsValues[i];
            }

            // Loop through all param elements
            for (i = 0; i < paramEls.length; i++) {
                // Loop through params object
                const pn = paramEls[i].getAttribute("x-temp-param");
                for (const j in params) {
                    if (pn === j) {
                        paramEls[i].innerText = eval(params[j]);
                    }
                }
            }

            // Use the template
            xUsingTemp.innerHTML = temp.innerHTML;
        }

        // Time end
        console.timeEnd("Weblet.HTMLActions");
    });

})();

// End time
console.timeEnd("Weblet");






