# Weblet

## About

Weblet is a tool used for web development.

## Basic Usage

A simple counter example:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Weblet Counter Example</title>
        <script src="weblet.js"></script>
    </head>
    <body>
        <!-- This is where the counter will go -->
        <p><pr-eval name="counter"></pr-eval>&nbsp;seconds</p>
        <script>
            // Use the $.Eval class
            const counter = new $.Eval({
                // Get all <pr-eval> elements with a name of "counter"
                name: "counter",

                // Initial value is 0
                value: 0,

                // This will be updating
                update: {
                    // Update counter every 1000 milliseconds
                    time: 1000,

                    // The action
                    action: (currentValue) => {
                        // The new value will be current value plus one
                        return Number(currentValue) + 1;
                    }
                }
            })

            // Use the counter
            counter.use();
        </script>
    </body>
</html>
```

Creating a list example:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Weblet List Example</title>
        <script src="weblet.js"></script>
    </head>
    <body>
        <script>
            // Create the template
            const listTemplate = new $.Template({
                // This should be a function that returns a string
                structure: (list) => {
                    // Return value
                    return `<ul>${(() => {
                        // Here, it will loop through the list array
                        let content = "";
                        for (const listItem of list) {
                            content += `<li>${listItem}</li>`;
                        }
                        return content;
                    })()}</ul>`;
                }
            });

            // Create component
            const fruits = new $.Component({
                // Using the list template we've created
                template: listTemplate,

                // Since we're using a template, we can set content to a function
                // The function should have a parameter so that we can call
                // The structure function we defined above
                content: (template) => {
                    return template(["apple", "orange", "watermelon", "grapes"]);
                }
            });

            // Put the component in the body element
            fruits.use("body");
        </script>
    </body>
</html>
```





