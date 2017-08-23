function GraphBufferGeometry(order, bounds, values) {
    this.order = order;
    
    this.values = values;
    
    var numTriangles = (order - 1) * (order - 1) * 2;
    var numVertices = numTriangles * 3;
    var numFloats = numVertices * 3;
    
    var vertices = new Float32Array(numFloats);
    var normals = new Float32Array(numFloats);
    
    var faceIndex = 0;
    var normalIndex = 0;
    
    function addVertex(V) {
        vertices[faceIndex++] = V.x;
        vertices[faceIndex++] = V.y;
        vertices[faceIndex++] = V.z;
    }
    
    function addNormal(N) {
        normals[normalIndex++] = N.x;
        normals[normalIndex++] = N.y;
        normals[normalIndex++] = N.z;
    }
    
    function getNormalVector(A, B, C) {
        var diff1 = B.clone().sub(A);
        var diff2 = C.clone().sub(A);
        var cross = diff1.cross(diff2);
        cross.normalize();
        return cross;
    }
    
    const xRange = bounds[1] - bounds[0];
    const zRange = bounds[5] - bounds[4];
    const xStep = xRange / (order - 1);
    const zStep = zRange / (order - 1);
    
    for (var i = 0; i < order - 1; ++i) {
        var x = bounds[0] + i * xStep;
        
        for (var j = 0; j < order - 1; ++j) {
            var z = bounds[4] + j * zStep;
            
            var value = values[i][j];
            var valuePlusX = values[i + 1][j];
            var valuePlusZ = values[i][j + 1];
            var valuePlusXZ = values[i + 1][j + 1];
            
            var A = new THREE.Vector3(x, valuePlusZ, z + zStep);
            var B = new THREE.Vector3(x + xStep, valuePlusX, z);
            var C = new THREE.Vector3(x, value, z);
            
            var normal = getNormalVector(A, B, C);
            
            addVertex(A); addNormal(normal);
            addVertex(B); addNormal(normal);
            addVertex(C); addNormal(normal);
            
            A = new THREE.Vector3(x + xStep, valuePlusX, z);
            B = new THREE.Vector3(x, valuePlusZ, z + zStep);
            C = new THREE.Vector3(x + xStep, valuePlusXZ, z + zStep);

            normal = getNormalVector(A, B, C);
            
            addVertex(A); addNormal(normal);
            addVertex(B); addNormal(normal);
            addVertex(C); addNormal(normal);
        }
    }
    
    function freeAttributeArray() { this.array = null; }
    
    this.addAttribute('position', new THREE.BufferAttribute(vertices, 3).onUpload(freeAttributeArray));
    this.computeVertexNormals();
}

GraphBufferGeometry.prototype = new THREE.BufferGeometry();

module.exports = GraphBufferGeometry;