## aframe-plot-component

[![Version](http://img.shields.io/npm/v/aframe-plot-component.svg?style=flat-square)](https://npmjs.org/package/aframe-plot-component)
[![License](http://img.shields.io/npm/l/aframe-plot-component.svg?style=flat-square)](https://npmjs.org/package/aframe-plot-component)

Renders 3D plots of functions and data

For [A-Frame](https://aframe.io).

### API

| Property           | Description                                                                       | Default Value    |
| ------------------ | --------------------------------------------------------------------------------- | ---------------- |
| function           | [string] A mathematical function to plot. Ignored if the 'data' property is set.  | 0                |
| order              | [integer] The number of plot segments along each dimension. A higher number makes
                        the plotted curve appear smoother, but may decrease performance.                 | 32               |
| label_text         | [string] A label for the plot. If this property is undefined or an empty string
                        then no label will be shown.                                                     | ''               |
| show_function      | [boolean] The plot's function will be displayed iff this property is true.        | false            |
| show_axes          | [boolean] Coordinate axes will be displayed iff this property is true.            | true             |
| bounds             | [string] A string representation of the function's bounds (the domain and range).
                       The format is "-x +x -y +y -z +z" where e.g. "-z" is the lower z bound and "+x"
                       is the upper x bound. Values must be numeric, and there is no error checking yet. | '-1 1 -1 1 -1 1' |
| show_zero_planes   | [boolean] Show reference planes on each of the three zero-planes that extend to
                       the function's bounds.                                                            | false            |
| show_bounding_box  | [boolean] Show a box around the plot representing the function's bounds.          | false            |

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.6.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-plot-component/dist/aframe-plot-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity plot="foo: bar"></a-entity>
  </a-scene>
</body>
```

<!-- If component is accepted to the Registry, uncomment this. -->
<!--
Or with [angle](https://npmjs.com/package/angle/), you can install the proper
version of the component straight into your HTML file, respective to your
version of A-Frame:

```sh
angle install aframe-plot-component
```
-->

#### npm

Install via npm:

```bash
npm install aframe-plot-component
```

Then require and use.

```js
require('aframe');
require('aframe-plot-component');
```
