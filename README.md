# Weblet

## About

Weblet is a tool used for web development.

## Basic Usage

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
        <x-temp name="list" params="heading;li1;li2;li3">
            <h2 x-temp-param="heading"></h2>
            <ul>
                <li x-temp-param="li1"></li>
                <li x-temp-param="li2"></li>
                <li x-temp-param="li3"></li>
            </ul>
        </x-temp>
        <div x-temp-using="list"
             x-temp-args="'Fruits';'Apple';'Orange';'Watermelon'"></div>
    </body>
</html>
```





