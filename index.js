const math = require('./math.js');
const GraphBufferGeometry = require('./GraphBufferGeometry.js');

/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('"Plot" component attempted to register before AFRAME was available.');
}

/**
 * Plot component for A-Frame.
 */
AFRAME.registerComponent('plot', {
    
    schema: {
        'function': {'type': 'string', 'default': '0'},
        'order': {'type': 'number', 'default': 32},
        'label_text': {'type': 'string', 'default': ''},
        'show_formula': {'type': 'boolean', 'default': false},
        'show_axes': {'type': 'boolean', 'default': true},
        'bounds': {'type': 'string', 'default': '-1 1 -1 1 -1 1'},
        'show_zero_planes': {'type': 'boolean', 'default': false},
        'show_bounding_box': {'type': 'boolean', 'default': false},
        'show_grid': {'type': 'boolean', 'default': true}, // TODO
        'grix_x_scale': {'type': 'number', 'default': 0.1}, // TODO
        'grid_z_scale': {'type': 'number', 'default': 0.1}, // TODO
        'color': {'type': 'string', 'default': '#AAA'},
        'animate': {'type': 'boolean', 'default': false}
    },
    
    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,
    
    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function() {
        
    },
    
    createPlot: function() {
        if (this.graphObject !== null) {
            this.root.remove(this.graphObject);
        }
        
        this.graphObject = createGraphObject(this.F, this.data.order, this.bounds,
                this.data.color, this.data.grid_x_scale, this.data.grid_y_scale,
                this.data.show_grid);
        this.root.add(this.graphObject);
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */
    update: function (oldData) {
        var code = math.compile(this.data.function);
        var scope = {t: 0.0};
        this.scope = scope;
        this.F = function(i, j) {
            scope.x = i;
            scope.y = j;
            return code.eval(scope);
        };
        
        console.log(this.data);
        
        var root = new THREE.Object3D();
        this.root = root;
        
        // TODO: make this more robust with format checking
        // [-x, +x, -y, +y, -z, +z]
        this.bounds = this.data.bounds.split(' ').map(function(x) {
            return parseFloat(x);
        });
        
        // TODO: make custom axes that extend to the bounds
        if (this.data.axes_enabled === true) {
            var axes = makeAxes();
            root.add(axes);
        }
        
        if (this.data.show_zero_planes === true) {
            var zeroPlanes = makeZeroPlanes(this.bounds);
            root.add(zeroPlanes);
        }
        
        if (this.data.show_bounding_box === true) {
            var boundingBox = makeBoundingBox(this.bounds);
            root.add(boundingBox);
        }
        
        this.graphObject = null;
        this.createPlot();
        this.el.setObject3D('mesh', root);
        
        console.log(root);
    },

    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    //remove: function () { },

    /**
    * Called on each scene tick.
    */
    tick: function (t) {
        if (this.data.animate) {
            this.scope.t = (t % 1000) / 1000;
            this.createPlot();
        }
    },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    //pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    //play: function () { }
});

function makeAxes(bounds) {
    var axes = new THREE.AxisHelper();
    return axes;
}

function makeZeroPlanes(bounds) {
    var zeroPlaneMaterial = new THREE.MeshLambertMaterial();
    zeroPlaneMaterial.side = THREE.DoubleSide;
    zeroPlaneMaterial.transparent = true;
    zeroPlaneMaterial.opacity = 1 / 8;
    zeroPlaneMaterial.color = new THREE.Color(0x2244BB);
    
    var zeroPlanes = new THREE.Object3D();
    
    var xRange = bounds[1] - bounds[0];
    var yRange = bounds[3] - bounds[2];
    var zRange = bounds[5] - bounds[4];
    
    var zeroZGeometry = new THREE.PlaneGeometry(xRange, yRange);
    var zeroZ = new THREE.Mesh(zeroZGeometry, zeroPlaneMaterial);
    zeroZ.position.set(bounds[0] + xRange / 2, bounds[2] + yRange / 2, 0.0);
    zeroPlanes.add(zeroZ);
    
    var zeroYGeometry = new THREE.PlaneGeometry(xRange, zRange);
    var zeroY = new THREE.Mesh(zeroYGeometry, zeroPlaneMaterial);
    zeroY.position.set(bounds[0] + xRange / 2, 0.0, bounds[4] + zRange / 2);
    zeroY.rotation.set(Math.PI / 2, 0.0, 0.0);
    zeroPlanes.add(zeroY);
    
    var zeroXGeometry = new THREE.PlaneGeometry(zRange, yRange);
    var zeroX = new THREE.Mesh(zeroXGeometry, zeroPlaneMaterial);
    zeroX.position.set(0.0, bounds[2] + yRange / 2, bounds[4] + zRange / 2);
    zeroX.rotation.set(0.0, Math.PI / 2, 0.0);
    zeroPlanes.add(zeroX);
    
    return zeroPlanes;
}

function makeBoundingBox(bounds) {
    var xRange = bounds[1] - bounds[0];
    var yRange = bounds[3] - bounds[2];
    var zRange = bounds[5] - bounds[4];
    
    var xGeometry = new THREE.PlaneGeometry(zRange, yRange);
    var yGeometry = new THREE.PlaneGeometry(xRange, zRange);
    var zGeometry = new THREE.PlaneGeometry(xRange, yRange);
    
    var boundingMaterial = new THREE.MeshLambertMaterial();
    boundingMaterial.side = THREE.DoubleSide;
    boundingMaterial.color = new THREE.Color(0xDDDDDD);
    boundingMaterial.transparent = true;
    boundingMaterial.opacity = 1 / 8;
    
    var lowX = new THREE.Mesh(xGeometry, boundingMaterial);
    lowX.position.set(bounds[0], bounds[2] + yRange / 2, bounds[4] + zRange / 2);
    lowX.rotation.set(0.0, Math.PI / 2, 0.0);
    var highX = new THREE.Mesh(xGeometry, boundingMaterial);
    highX.position.set(bounds[1], bounds[2] + yRange / 2, bounds[4] + zRange / 2);
    highX.rotation.set(0.0, Math.PI / 2, 0.0);
    
    var lowY = new THREE.Mesh(yGeometry, boundingMaterial);
    lowY.position.set(bounds[0] + xRange / 2, bounds[2], bounds[4] + zRange / 2);
    lowY.rotation.set(Math.PI / 2, 0.0, 0.0);
    var highY = new THREE.Mesh(yGeometry, boundingMaterial);
    highY.position.set(bounds[0] + xRange / 2, bounds[3], bounds[4] + zRange / 2);
    highY.rotation.set(Math.PI / 2, 0.0, 0.0);
    
    var lowZ = new THREE.Mesh(zGeometry, boundingMaterial);
    lowZ.position.set(bounds[0] + xRange / 2, bounds[2] + yRange / 2, bounds[4]);
    var highZ = new THREE.Mesh(zGeometry, boundingMaterial);
    highZ.position.set(bounds[0] + xRange / 2, bounds[2] + yRange / 2, bounds[5]);
    
    var boundingBox = new THREE.Object3D();
    boundingBox.add(lowX, highX, lowY, highY, lowZ, highZ);
    
    return boundingBox;
}

function createGraphObject(valueFunction, order, bounds, color, gridXScale, gridZScale, showGrid) {
    
    var values = [];
    
    const iRange = bounds[1] - bounds[0];
    const jRange = bounds[5] - bounds[4];
    
    for (var i = 0; i < order; ++i) {
        var iCoordinate = bounds[0] + i * iRange / (order - 1);
        var valueRow = [];
        for (var j = 0; j < order; ++j) {
            var jCoordinate = bounds[4] + j * jRange / (order - 1);
            var value = valueFunction(iCoordinate, jCoordinate);
            valueRow.push(value);
        }
        values.push(valueRow);
    }
    
    var geometry = new GraphBufferGeometry(order, bounds, values, gridXScale, gridZScale);
    
    const materialProperties = {color: new THREE.Color(color)};
    //if (showGrid) {
    //    materialProperties.map = plotTexture;
    //}
    var material = new THREE.MeshPhongMaterial(materialProperties);
    material.side = THREE.DoubleSide;
    var result = new THREE.Mesh(geometry, material);
    return result;

}
