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
        'show_bounding_box': {'type': 'boolean', 'default': false}
    },
    
    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,
    
    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function() {
        var code = math.compile(this.data.function);
        var F = function(i, j) {
            var scope = {'x': i, 'y': j};
            return code.eval(scope);
        };
        
        var root = new THREE.Object3D();
        
        // TODO: make this more robust with format checking
        // [-x, +x, -y, +y, -z, +z]
        var bounds = this.data.bounds.split(' ').map(function(x) {
            return parseFloat(x);
        });
        
        // TODO: make custom axes that extend to the bounds
        if (this.data.axes_enabled === true) {
            var axes = makeAxes();
            root.add(axes);
        }
        
        if (this.data.show_zero_planes === true) {
            var zeroPlanes = makeZeroPlanes(bounds);
            root.add(zeroPlanes);
        }
        
        if (this.data.show_bounding_box === true) {
            var boundingBox = makeBoundingBox(bounds);
            root.add(boundingBox);
        }
        
        var graphObject = createGraphObject(F, this.data.order, bounds);
        root.add(graphObject);
        
        this.el.setObject3D('mesh', root);
    }

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */
    //update: function (oldData) { },

    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    //remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

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

function createGraphObject(valueFunction, order, bounds) {
    
    var values = [];
    
    for (var i = 0; i < order; ++i) {
        var valueRow = [];
        for (var j = 0; j < order; ++j) {
            var value = valueFunction(i / (order - 1.0) - 0.5, j / (order - 1.0) - 0.5);
            valueRow.push(value);
        }
        values.push(valueRow);
    }
    
    var geometry = new GraphBufferGeometry(1.0, order, values);
    var material = new THREE.MeshLambertMaterial("0xFFFFFF");
    material.side = THREE.DoubleSide;
    var result = new THREE.Mesh(geometry, material);
    return result;
    
    // TODO: BOUNDS
}
