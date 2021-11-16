/* Amber - v0.2.5 (Pre-release) */

// Use strict mode
"use strict";

// Warn user about this is a pre-release
// IMPORTANT REMINDER: Remove once v1.0.0 is released!
console.warn(
    "You are using Amber v0.2.5 (pre-release). Do not use in production."
);

// Begin time
console.time("Amber:Load");

// If $ object is already defined
if (window.$) {
    throw new Error(
        "Do not define your variables with '$', it is used in Amber"
    );
}

// Amber object
const $ = {
    // About Amber (remove in v0.3.0)
    WEBLET: {
        version: "0.2.5",
        isPreRelease: true
    },

    // About Amber
    _version: "0.2.5",
    _isPreRelease: true,

    // Classes
    Component: undefined,
    Template: undefined,

    // Objects
    doc: {},
    window: null,
    cookies: null,

    // On ready
    onready: undefined,

    // HTML variables
    vars: {}
};

// Main
(() => {

    // Function for checking the data type
    const checkDataType = (val, type) => {
        switch (type.toLowerCase()) {
            case "number":
                return typeof val === "number";
            case "string":
                return typeof val === "string";
            case "boolean":
                return typeof val === "boolean";
            case "array":
                return Array.isArray(val);
            case "object":
                return val && val.constructor == Object;
            case "function":
                return typeof val === "function";
            case "symbol":
                return typeof val === "symbol";
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
            throw new $[error](`'${sel}' is not a valid selector`);
        }
        return true;
    };

    // Custom error class
    // Symbol used so that error class cannot be used from outside
    const error = Symbol();
    $[error] = class extends Error {
        constructor(msg) {
            super(msg);
            this.name = "AmberError";
            this.message = msg;
        }
    };

    // Symbol for identifying if an object is $.doc element object
    const isDocElement = Symbol();
    
    // Function for getting component's inner HTML
    const replaceHolders = (cont, holdersObj) => {
        const holderRegex = /{{\s*([^\s]*)\s*}}/;
        let res = cont;
        while (holderRegex.test(res)) {
            res = res.replace(
                holderRegex,
                // (a, b): eval a, return b, syntax
                // a: test for content to get RegExp.$1,
                // b: IIFE, return value, throw error if could not find holder
                (holderRegex.test(res), (() => {
                    // Note: RegExp.$n is non-standard, but widely supported
                    const name = RegExp.$1;
                    const res = holdersObj[name];

                    // Throw error if could not find holder
                    if (typeof res === "undefined") {
                        throw new $[error](
                            `Could not find holder named '${name}'`
                        );
                    }

                    // Otherwise return value
                    return res.toString();
                })())
            );
        }
        return res;
    };

    // On ready
    $.onready = (handler) => {
        // Check handler data type
        if (!checkDataType(handler, "function")) {
            throw new $[error]("Argument must be a function");
        }

        // DOMContentLoaded
        window.addEventListener("DOMContentLoaded", handler);
    };

    // Component class
    $.Component = class {
        // Constructor
        constructor(info) {
            // Check data type
            if (!checkDataType(info, "object")) {
                throw new $[error]("$.Component constructor argument should be an object");
            }

            // Get the contents from the info object
            this.template = info.template;
            this.content = info.content;
            this.holders = info.holders;

            // Component element
            this.element = document.createElement("x-component");
            this.id = $.doc[nthComponent];
            this.element.setAttribute("nth", (this.id).toString(36));
            
            // Update id
            $.doc[nthComponent]++;
        }

        // Update
        update() {
            const comp = document.querySelector(`x-component[nth="${this.id}"]`);

            // If component has not been appended yet, use this.element
            // otherwise, use document.querySelector()
            if (!comp) {
                this.element.innerHTML = replaceHolders(this.content, this.holders);
            } else {
                comp.innerHTML = replaceHolders(this.content, this.holders);
            }
        }
    };
    
    // Template class
    $.Template = class {
        // Constructor
        constructor(info) {
            // Check data type
            if (!checkDataType(info, "object")) {
                throw new $[error]("$.Template constructor argument should be an object");
            }

            // Get the contents from info object
            this.structure = info.structure;
        }
    };

    // Amber element
    // For document query functions
    // Returns an object with methods and properties that
    // can read or change the element(s) selected
    const queryReturnObject = (domEl) => {
        // Check data types
        if (!(domEl instanceof Element) && !(domEl instanceof NodeList)) {
            throw new Error("`domEl` must be a DOM element or node list");
        }
        
        // Proxy handler
        const proxyHandler = (domEl) => {
            return {
                // Getting a property
                get(target, property) {
                    // Check property
                    switch (property) {
                        // Used for verifying an object is $.doc element
                        case isDocElement:
                            return true;
                        
                        // Give the actual DOM element
                        case "domElement":
                            return domEl;

                        // Give inner HTML
                        case "html":
                            return domEl.innerHTML;
                        
                        // Give inner text
                        case "text":
                            return domEl.innerText;
                        
                        // Get ID
                        case "id":
                            return domEl.id;
                        
                        // Get class name
                        case "class":
                            return domEl.className;
                        
                        // Get the tag name (read only)
                        case "name":
                            // To lower case added because it returns it in all uppercase
                            return domEl.tagName.toLowerCase();
                        
                        // Return parent element
                        case "parent":
                            return queryReturnObject(domEl.parentElement);
                        
                        // Return all the child elements in an array
                        case "children":
                            return queryReturnObject(domEl.querySelectorAll("*"));
                        
                        // Get the first child
                        case "firstChild":
                            return queryReturnObject(domEl.children[0]);
                        
                        // Get the last child
                        case "lastChlid":
                            return queryReturnObject(domEl.children[domEl.children.length - 1]);
                        
                        // Add event listener
                        case "on":
                            return (name, callback) => {
                                // Check data types
                                if (!checkDataType(name, "string")) {
                                    throw new $[error]("First argument must be a string");
                                }
                                if (!checkDataType(callback, "function")) {
                                    throw new $[error]("Second argument must be a callback function");
                                }

                                // Add event listener
                                // Try to use element.addEventListener
                                domEl.setAttribute("on" + name, `(${callback})()`);
                            };
                        
                        // Remove event listener
                        case "off":
                            return (name, callback) => {
                                // Check data types
                                if (!checkDataType(name, "string")) {
                                    throw new $[error]("First argument must be a string");
                                }
                                if (!checkDataType(callback, "function")) {
                                    throw new $[error]("Second argument must be a callback function");
                                }

                                // Remove event listener
                                // Try to use element.removeEventListener
                                domEl.setAttribute("on" + name, "0");
                            };
                        
                        // Append or prepend an element or component
                        case "append":
                        case "prepend":
                            return (obj) => {
                                // If object is instance of component,
                                // attach the component
                                if (obj instanceof $.Component) {
                                    // Set inner HTML
                                    obj.element.innerHTML =
                                        replaceHolders(obj.content, obj.holders);
                                    
                                    // Append component element
                                    domEl[property + "Child"](obj.element);
                                    obj.element = null;
                                    
                                    // Create setInterval if obj has loop
                                    const loopm = obj.loop;
                                    if (
                                        loopm && checkDataType(loopm, "function") &&
                                        checkDataType(loopm(), "object") &&
                                        checkDataType(loopm().handler, "function")
                                    ) {
                                        setInterval(() => {
                                            obj.loop().handler();
                                            obj.update();
                                        }, Number(obj.loop().time));
                                    }
                                }

                                // If object is instance of element,
                                // attach the element
                                if (obj.domElement.isDOMCE) {
                                    domEl[property + "Child"](obj.domElement);
                                }
                            };
                        
                        // Remove element
                        case "remove":
                            return () => {
                                domEl.remove();
                            };
                        
                        // Append to
                        // REMOVE in v0.3.0
                        case "appendTo":
                            if (!domEl.isDOMCE) {
                                throw new $[error]("'appendTo' is not a valid property name");
                            }
                            return (place) => {
                                if (checkIsValidSelector(place)) {
                                    const pls = document.querySelectorAll(place);
                                    for (const pl of pls) {
                                        pl.appendChild(domEl);
                                    }
                                }
                            };
                        
                        // Query this element
                        case "query": 
                            return (sel) => {
                                if (checkIsValidSelector(sel)) {
                                    return queryReturnObject(domEl.querySelector(sel));
                                }
                            };
                        
                        // Query all this element
                        case "queryAll":
                            return (sel) => {
                                if (checkIsValidSelector(sel)) {
                                    return queryReturnObject(domEl.querySelectorAll(sel));
                                }
                            };
                        
                        // Query this element by tag
                        case "queryByTag":
                            return (tag) => {
                                return queryReturnObject(domEl.getElementsByTagName(tag));
                            };
                        
                        // Query this element by id
                        case "queryById":
                            return (id) => {
                                return queryReturnObject(domEl.getElementById(id));
                            };
                        
                        // Query this element by class
                        case "queryByClass":
                            return (cls) => {
                                return queryReturnObject(domEl.getElementsByClassName(cls));
                            };
                        
                        // CSS
                        case "css":
                            return new Proxy({}, {
                                // Getting a CSS property's value
                                get(target, property) {
                                    // Note: RegExp.$1 is non-standard, but widely supported
                                    return domEl.style[
                                        property.replace(/-([A-z])/g, `${RegExp.$1.toUpperCase()}`)
                                    ];
                                },

                                // Setting a CSS property
                                set(target, property, value) {
                                    // Note: RegExp.$1 is non-standard, but widely supported
                                    domEl.style[
                                        property.replace(/-([A-z])/g, `${RegExp.$1.toUpperCase()}`)
                                    ] = value.toString();
                                }
                            });
                        
                        // Attributes
                        case "attr":
                            return new Proxy({}, {
                                // Getting an attribute
                                get(target, property) {
                                    return (() => {
                                        try {
                                            return domEl.getAttribute(property.toString());
                                        } catch (err) {
                                            throw new $[error]("Invalid attribute name");
                                        }
                                    })();
                                },

                                // Setting an attribute
                                set(target, property, value) {
                                    try {
                                        domEl.setAttribute(property.toString(), value);
                                    } catch (err) {
                                        throw new $[error]("Invalid attribute name");
                                    }
                                },

                                // Check if attribute exists (name in el.attr)
                                has(target, property) {
                                    try {
                                        if (domEl.hasAttribute(property.toString())) {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    } catch (err) {
                                        throw new $[error]("Invalid attribute name");
                                    }
                                },

                                // Delete an attribute (delete el.attr.name)
                                deleteProperty(target, property) {
                                    try {
                                        domEl.removeAttribute(property.toString());
                                    } catch (err) {
                                        throw new $[error]("Invalid attribute name");
                                    }
                                }
                            });
                        
                        // Invalid property name
                        default:
                            if (checkDataType(property, "symbol")) {
                                throw new $[error](`[symbol] is not a valid property name'`);
                            } else {
                                throw new $[error](`'${property}' is not a valid property name'`);
                            }
                    }
                },

                // Setting a property
                set(target, property, value) {
                    // Check property
                    switch (property) {
                        // Set inner HTML
                        case "html":
                            domEl.innerHTML = value;
                            break;
                        
                        // Set inner text
                        case "text":
                            domEl.innerText = value;
                            break;
                        
                        // Set ID
                        case "id":
                            domEl.id = value;
                            break;
                        
                        // Set class
                        // Use += " ..." to add a class
                        // Try to find fix so they don't have to
                        // put space to add class
                        case "class":
                            domEl.className = value;
                            return;
                    }
                }
            };
        };

        // Return the object for just one element
        if (domEl instanceof Element) {
            return new Proxy(domEl, proxyHandler(domEl));
        }

        // Return the object for multiple selected elements
        if (domEl instanceof NodeList) {
            const domElsReturnArray = [];

            // Add to return array
            for (let i = 0, l = domEl.length; i < l; i++) {
                domElsReturnArray.push(new Proxy(domEl[i], proxyHandler(domEl[i])));
            }

            // Return array
            return domElsReturnArray;
        }
    };

    // Nth component symbol
    const nthComponent = Symbol();

    // Document
    $.doc = {
        // Nth component
        [nthComponent]: 0,

        // Selecting important elements
        head: queryReturnObject(document.head),
        body: document.body, // Need help fixing! Use $.onready() for now
        title: document.title,

        // Character set
        charset: document.characterSet,

        // Selecting elements
        query: (sel) => {
            if (checkIsValidSelector(sel)) {
                return queryReturnObject(document.querySelector(sel));
            }
        },
        queryAll: (sel) => {
            if (checkIsValidSelector(sel)) {
                return queryReturnObject(document.querySelectorAll(sel));
            }
        },
        queryByTag: (tag) => {
            return queryReturnObject(document.getElementsByTagName(tag));
        },
        queryById: (id) => {
            return queryReturnObject(document.getElementById(id));
        },
        queryByClass: (cls) => {
            return queryReturnObject(document.getElementsByClassName(cls));
        },

        // Write to body element
        write: (txt) => {
            document.body.innerHTML += txt;
        },

        // Create an element
        Element: class {
            // Constructor
            // `el` should be a string
            constructor(el) {
                // Check data type
                if (!checkDataType(el, "string")) {
                    throw new $[error]("First argument should be a string");
                }

                // Trim and replace
                el = el.trim();
                el = el.replace(/([^A-z0-9-])/g);

                // DOM element
                this.domElement = document.createElement(el);
                this.domElement.isDOMCE = true;
                
                // Return
                return queryReturnObject(this.domElement);
            }
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
                throw new $[error]("First parameter of $.window.open should be a string");
            }
            if (!checkDataType(target, "string")) {
                throw new $[error]("Second parameter of $.window.open should be a string");
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
    // Note: this code should be executed as fast as possible
    // Avoid writing code that will slow it down
    window.addEventListener("DOMContentLoaded", () => {

        // Time
        console.time("Amber:HTMLActions");

        // Document object (for performance)
        const doc = document;

        // Replace [[ and ]] with <x-expr> tags
        doc.body.innerHTML =
            doc.body.innerHTML
                .replace(/\[\[/g, "<x-expr>")
                .replace(/\]\]/g, "</x-expr>");
        
        // Evaluate expressions
        // Note: there might be a faster to do this,
        // by finding with regex, then replace that with it's result with innerText,
        // instead of replacing, query, looping, then innerText
        // Edit: might be possible, look at line 199
        for (const xExpr of doc.querySelectorAll("x-expr")) {
            xExpr.innerText = ((it) => {
                // Throw an error if something is wrong with the expression
                try {
                    return eval(it);
                } catch (err) {
                    xExpr.innerHTML = "";
                    throw new $[error](`For [[ ${it} ]]\n` + err);
                }
            })(xExpr.innerText);
        }

        // Variables
        for (const xVar of doc.querySelectorAll("x-var")) {
            $.vars[xVar.getAttribute("name").trim()] = xVar.innerHTML;
            xVar.style.display = "none";
        }

        // Replace {{ and }} with <x-var-using>
        doc.body.innerHTML =
            doc.body.innerHTML
                .replace(/\@\{([^}]+)\}/g, "<x-var-using>$1</x-var-using>");
        
        // Hide all using variables, in case it throws an error
        for (const xVarUsing of doc.querySelectorAll("x-var-using")) {
            xVarUsing.style.display = "none";
        }

        // Show values of the variable
        for (const xVarUsing of doc.querySelectorAll("x-var-using")) {
            const varName = xVarUsing.innerHTML.trim();

            // If variable is declared, show it
            if (xVarUsing.innerHTML = $.vars[varName] !== undefined) {
                xVarUsing.innerHTML = $.vars[varName];
                xVarUsing.style.display = "inline";
            }
            
            // Otherwise, throw an error
            else {
                throw new $[error](`'${varName}' was not declared`);
            }
        }

        // If-then
        for (const xIf of doc.querySelectorAll("[x-if]")) {

            // Get attributes
            const ifAttr = xIf.getAttribute("x-if"),
                  thenCSSAttr = xIf.getAttribute("x-then-css"),
                  thenJSAttr = xIf.getAttribute("x-then-js");
            
            // If x-if attribute evaluates to true, run CSS and/or JS
            // IIFEs used to catch JS errors
            if ((() => {
                try {
                    return eval(ifAttr);
                } catch (err) {
                    throw new $[error](`For x-if="${ifAttr}"\n${err}`);
                }
            })()) {
                thenCSSAttr ? xIf.setAttribute("style", thenCSSAttr) : undefined;
                thenJSAttr ? (() => {
                    try {
                        eval(thenJSAttr);
                    } catch (err) {
                        throw new $[error](`For x-then-js="${thenJSAttr}"\n${err}`);
                    }
                })() : undefined;
            }

        }

        // Show or hide elements
        for (const xShow of doc.querySelectorAll("[x-show]")) {
            if ((() => {
                try {
                    return eval(xShow.getAttribute("x-show"));
                } catch (err) {
                    throw new $[error](`For x-show="${xShow.getAttribute("x-show")}"\n${err}`);
                }
            })()) {
                xShow.style.display = "unset";
            } else {
                xShow.style.display = "none";
            }
        }

        // Hide all templates
        for (const xTemplate of doc.querySelectorAll("x-temp")) {
            xTemplate.style.display = "none";
        }

        // Load all templates
        for (const xUsingTemp of doc.querySelectorAll("[x-temp-using]")) {

            // Get template name and template element
            const name = xUsingTemp.getAttribute("x-temp-using"),
                  temp = doc.querySelector(`x-temp[name="${name}"]`),
                  
                  // Parameter info
                  paramsNames = temp.getAttribute("params").split(";"),
                  paramEls = temp.querySelectorAll("[x-temp-param]"),
                  params = {};

            // Throw an error if template is not defined
            if (!temp) {
                throw new $[error](`'${name}' is not a defined template`);
            }

            // Object that will have prop name as param and value as arg
            // For loop written this way for performance
            for (let i = 0, l = paramsNames.length; i < l; i++) {
                params[paramsNames[i]] =
                    xUsingTemp.getAttribute("x-temp-args").split(";")[i];
            }

            // This will put the argument in where the param is used
            // For loop written this way for performance
            for (let i = 0, l = paramEls.length; i < l; i++) {
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
        console.timeEnd("Amber:HTMLActions");

        // Add body and form to $.doc
        $.doc.body = queryReturnObject(document.body);
        
    });

})();

// End time
console.timeEnd("Amber:Load");






