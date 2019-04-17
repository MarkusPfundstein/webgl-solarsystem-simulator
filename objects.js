const makeObjects = () => {

  const makeSphere = (gl, scale, color, texture, updateFn) => {
    const latitudeBands = 50;
    const longitudeBands = 50;
    const radius = 2;
    const vertexPositionData = [];
    const normalData = [];
    const textureCoordData = [];
    const indexData = [];
    const colorData = []
    // Calculate sphere vertex positions, normals, and texture coordinates.
    for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
      const theta = latNumber * Math.PI / latitudeBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
        const phi = longNumber * 2 * Math.PI / longitudeBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const x = cosPhi * sinTheta * scale/2;
        const y = cosTheta * scale/2;
        const z = sinPhi * sinTheta * scale/2;
        const u = 1 - (longNumber / longitudeBands);
        const v = 1 - (latNumber / latitudeBands);
        vertexPositionData.push(radius * x);
        vertexPositionData.push(radius * y);
        vertexPositionData.push(radius * z);
        normalData.push(x);
        normalData.push(y);
        normalData.push(z);
        textureCoordData.push(u);
        textureCoordData.push(v);
        for (let c of color) {
          colorData.push(c)
        }
      }
    }
    // Calculate sphere indices.
    for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
      for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
        const first = (latNumber * (longitudeBands + 1)) + longNumber;
        const second = first + longitudeBands + 1;
        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);
        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }
    const nVertices = indexData.length

    const drawInfo = {
      positions: vertexPositionData,
      textureCoords: textureCoordData,
      normals: normalData,
      indices: indexData,
      colors: colorData,
      texture,
    }

    const programInfo = programs.loadPlanetProgramInfo(gl)

    const sphere = new DrawObject(gl, drawInfo, programInfo)

    sphere.setState({
      pos: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
      }
    })

    sphere.setUpdateFn(updateFn)
    
    return sphere
  }

  const makeLine = (gl, color, from, to) => {
    const positions = [
      ...from,
      ...to
    ]

    const colors = [
      ...color,
      ...color,
    ]


    const programInfo = programs.loadLineProgramInfo(gl)

    const nVertices = 2

    const drawInfo = {
      positions,
      nVertices,
      nComponents: 3,
      colors,
    }

    const line = new LineObject(gl, drawInfo, programInfo)
    
    return line;
  }

  const makeCube = (gl, scale, monoColor, updateFn) => {
    const positions = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      
      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,
      
      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,
      
      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,
      
      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,
      
      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,
    ].map(x=>x*scale/2)///2*scale)//x*scale/8)

    const normals = [
      // Front
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,

      // Back
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,

      // Top
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,

      // Bottom
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,

      // Right
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,

      // Left
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0
    ];

    const indices = [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23,   // left
    ];

    // front face, back face, top face, bottom face, right face, left face
    const faceColors = [
      monoColor,  
      monoColor,
      monoColor,
      monoColor,
      monoColor,
      monoColor,
    ]
    let colors = [];

    for (let c of faceColors) {
      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(c, c, c, c);
    }
    
    const drawInfo = {
      positions,
      normals,
      indices,
      nComponents: 3,
      colors,
    }


    const programInfo = programs.loadPlanetProgramInfo(gl)
    const cube = new DrawObject(gl, drawInfo, programInfo)

    cube.setState({
      pos: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
      }
    })

    cube.setUpdateFn(updateFn)
    
    return cube
  }

  return {
    makeCube,
    makeLine,
    makeSphere,
  }
}

const objects = makeObjects()
