/* Weblet - v0.2.2 (Pre-release) */

// Use strict mode
"use strict";

// Warn user about this is a pre-release
// IMPORTANT REMINDER: Remove once v1.0.0 is released!
console.warn(
    "You are using Weblet v0.2.2 (pre-release). Do not use in production."
);

// Begin time
console.time("Weblet:Load");

// If $ object is already defined
if (window.$) {
    throw new Error(
        "Do not define your variables with '$', it is used in Weblet"
    );
}

// Weblet object
const $ = {
    // About Weblet object
    WEBLET: {
        version: "0.2.2",
        isPreRelease: true
    },

    // Classes
    Component: undefined,
    Template: undefined,

    // Objects
    doc: {},
    window: null,
    cookies: null
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

    // Custom Weblet error class
    // Symbol used so that error class cannot be used from outside
    const error = Symbol();
    $[error] = class extends Error {
        constructor(msg) {
            super(msg);
            this.name = "WebletError";
            this.message = msg;
        }
    };

    // Symbol for identifying if an object is $.doc element object
    const isDocElement = Symbol();

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
            this.place = info.place;
            this.holders = info.holders;
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

    // Weblet element
    // For document query functions
    // Returns an object with methods and properties that
    // can read or change the element(s) selected
    const queryReturnObject = (domEl) => {
        // Check data types
        if (!(domEl instanceof Element) && !(domEl instanceof NodeList)) {
            throw new Error("`domEl` must be a DOM element or node list");
        }
        
        // Proxy handler
        const proxyHandler = {
            // Getting a property
            get(target, property) {
                // Check property
                switch (property) {
                    // Used for verifying an object is $.doc element
                    case isDocElement:
                        return true;

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
                    
                    // Add event listener
                    case "on":
                        return (name, callback) => {
                            // Check data types
                            if (!checkDataType(name, "string")) {
                                throw new $[error]("First argument must be a string");
                            }
                            if (!checkDataType(name, "function")) {
                                throw new $[error]("Second argument must be a callback function");
                            }

                            // Add event listener
                            domEl.addEventListener(name, callback);
                        };
                    
                    // Remove event listener
                    case "off":
                        return (name, callback) => {
                            // Check data types
                            if (!checkDataType(name, "string")) {
                                throw new $[error]("First argument must be a string");
                            }
                            if (!checkDataType(name, "function")) {
                                throw new $[error]("Second argument must be a callback function");
                            }

                            // Add event listener
                            domEl.removeEventListener(name, callback);
                        };
                    
                    // Append element or component
                    case "append":
                        return (obj) => {
                            // If object is instance of component,
                            // attach the component
                            if (obj instanceof $.Component) {
                                // Regex for searching '{{ ... }}'
                                const holderRegex = /{{\s*([^\s]*)\s*}}/g;

                                // Component element
                                const compEl = document.createElement("x-component");
                                compEl.setAttribute("nth", ($.doc[nthComponent]++).toString(36));
                                
                                // Function for getting component's inner HTML
                                const getCompElInnerHTML = () => {
                                    return obj.content.replace(
                                        holderRegex,
                                        // (a, b): eval a, return b, syntax
                                        // a: test for content to get RegExp.$1,
                                        // b: IIFE, return value, throw error if could not find holder
                                        (holderRegex.test(obj.content), (() => {
                                            // Note: RegExp.$n is non-standard, but widely supported
                                            const name = RegExp.$1;
                                            const res = obj.holders[name];

                                            // Throw error if could not find holder
                                            if (!res) {
                                                throw new $[error](
                                                    `Could not find holder named '${name}'`
                                                );
                                            }

                                            // Otherwise return value
                                            return res.toString();
                                        })())
                                        
                                    );
                                };

                                // Set inner HTML
                                compEl.innerHTML = getCompElInnerHTML();
                                
                                // Append component element
                                domEl.appendChild(compEl);
                                
                                // Create setInterval if obj has loop
                                const loopm = obj.loop;
                                if (
                                    loopm && checkDataType(loopm, "function") &&
                                    checkDataType(loopm(), "object") &&
                                    checkDataType(loopm().handler, "function")
                                ) {
                                    setInterval(() => {
                                        obj.loop().handler();
                                        domEl
                                            .querySelector(`x-component[nth="${$.doc[nthComponent]-1}"]`)
                                            .innerHTML = getCompElInnerHTML();
                                    }, Number(obj.loop().time));
                                }
                            }
                        };
                    
                    // Remove element
                    case "remove":
                        return () => {
                            domEl.remove();
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

        // Return the object for just one element
        if (domEl instanceof Element) {
            return new Proxy(domEl, proxyHandler);
        }

        // Return the object for multiple selected elements
        if (domEl instanceof NodeList) {
            const domElsReturnArray = [];

            // Add to return array
            for (let i = 0, l = domEl.length; i < l; i++) {
                domElsReturnArray.push(new Proxy(domEl, proxyHandler));
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
        body: null, // Defined later when DOMContentLoaded
        form: null, // Defined later when DOMContentLoaded
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
                    throw new $[error]("Argument should be a string");
                }

                // Trim
                el = el.trim();
                
                // Check first character
                if (el[0] !== "<" || el[el.length - 1] !== ">") {
                    throw new $[error](`'${el}' is not valid HTML syntax`);
                }

                // Regex
                // Note: at least one bug in here
                const regexBeginTag = /<([A-z]|-)+(\s|>)/gi,
                         regexAttrs = /([A-z]|-|:)+((="([^"]*)")|(='([^']*)'))/gi,
                        regexEndTag = /(((?<!")(<\/([A-z]|-)>)))?/gi;

                // Check if it is valid syntax
                if (
                    !el.match(regexBeginTag) ||
                    !el.match(regexAttrs) ||
                    !el.match(regexEndTag)
                ) {
                    throw new $[error](`'${el}' is not valid HTML syntax`);
                }

                // Properties
                this.elStr = el;
                this.element =
                    document.createElement(el.substr(1, el.search(/(\s|>)/) - 1));
            }

            // Append to
            appendTo(place) {
                if (checkIsValidSelector(place)) {
                    const pls = document.querySelectorAll(place);
                    for (const pl of pls) {
                        pl.appendChild(this.element);
                    }
                }
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
        console.time("Weblet:HTMLActions");

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
        console.timeEnd("Weblet:HTMLActions");

        // Add body and form to $.doc
        /*
        $.doc.body = queryReturnObject(document.body);
        console.log(1);
        $.doc.form = 
            document.forms[0]
                ? queryReturnObject(document.forms[0])
                : null; */
        
    });

})();

// End time
console.timeEnd("Weblet:Load");






