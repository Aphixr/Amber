# Amber

## About

Amber is a tool used for web development.

## Basic Usage

### List Example

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Amber List Example</title>
        <script src="amber.js"></script>
    </head>
    <body>
        <!-- Template -->
        <x-temp name="list" params="heading;li1;li2;li3">
            <h2 x-temp-param="heading"></h2>
            <ul>
                <li x-temp-param="li1"></li>
                <li x-temp-param="li2"></li>
                <li x-temp-param="li3"></li>
            </ul>
        </x-temp>

        <!-- Use the template in this div -->
        <div x-temp-using="list"
             x-temp-args="'Fruits';'Apple';'Orange';'Watermelon'"></div>
    </body>
</html>
```

### Items for Sale Example

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Amber Items for Sale Example</title>
        <script src="amber.js"></script>
    </head>
    <body>
        <h2>Items for Sale</h2>
        <table id="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                <!-- Items for sale goes here -->
            </tbody>
        </table>
        <script>
            // Get the tbody element
            const tbody = $.doc.query("#items-table tbody");

            // List of all the items
            const items = [
                ["Milk", 2.99],
                ["Watermelon", 3.49],
                ["Cereal", 3.99],
                ["Eggs", 4.24]
            ];

            // Item class
            class Item extends $.Component {
                constructor(name, price) {
                    super({
                        content: `
                            <tr>
                                <td>{{ name }}</td>
                                <td>{{ price }}</td>
                            <tr>`,
                        holders: {
                            name: name,
                            price: price
                        }
                    });
                }
            }

            // Loop through items array
            for (const item of items) {
                // Append component to tbody
                tbody.append(new Item(items[0], items[1]));
            }
        </script>
    </body>
</html>
```





