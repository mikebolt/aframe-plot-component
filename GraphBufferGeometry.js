function GraphBufferGeometry(size, order, values) {
    this.order = order;
    this.size = size;
    var cellSize = size / order;
    
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
    
    for (var i = 0; i < order - 1; ++i) {
        for (var j = 0; j < order - 1; ++j) {
            var x = cellSize * (i - order / 2);
            var z = cellSize * (j - order / 2);
            
            var value = values[i][j];
            var valuePlusX = values[i + 1][j];
            var valuePlusZ = values[i][j + 1];
            var valuePlusXZ = values[i + 1][j + 1];
            
            var A = new THREE.Vector3(x, valuePlusZ, z + cellSize);
            var B = new THREE.Vector3(x + cellSize, valuePlusX, z);
            var C = new THREE.Vector3(x, value, z);
            
            var normal = getNormalVector(A, B, C);
            
            addVertex(A); addNormal(normal);
            addVertex(B); addNormal(normal);
            addVertex(C); addNormal(normal);
            
            A = new THREE.Vector3(x + cellSize, valuePlusX, z);
            B = new THREE.Vector3(x, valuePlusZ, z + cellSize);
            C = new THREE.Vector3(x + cellSize, valuePlusXZ, z + cellSize);

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