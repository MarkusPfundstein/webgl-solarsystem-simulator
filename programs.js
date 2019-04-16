const loadPrograms = () => {

  const loadShader = (gl, type, source) => {
    const shader = gl.createShader(type)
    
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`An error occured compiling the shaders: ${gl.getShaderInfoLog(shader)}`)
    }

    return shader
  }

  const initShaderProgram = (gl, vsSource, fsSource) => {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(`Unable to initialize the shader program ${gl.getProgramInfoLog(shaderProgram)}`)
    }

    return shaderProgram
  }

  const vsLine = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform vec4 aTranslation;

    varying highp vec4 vColor;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * (aVertexPosition + aTranslation);
      vColor = aVertexColor;
    }
  `

  const fsLine = `

    varying highp vec4 vColor;

    void main() {
      gl_FragColor = vec4(vColor.rgb * 0.5, vColor.a); 
    }
  `

  const vsPlanet = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aVertexNormal;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;
    uniform vec4 aTranslation;
    uniform vec3 uLightWorldPosition;

    varying highp vec4 vColor;
    varying highp float vLightning;
    varying vec3 vNormal;

    void main() {
      // positioning of vertex
      mat4 worldViewProjection = uProjectionMatrix * uModelViewMatrix;
      gl_Position = worldViewProjection * (aVertexPosition + aTranslation);

      // color/texture stuff
      vColor = aVertexColor;

      // no idea why this doesnt work at all
      vec3 transposedNormal = vec3(
          //uNormalMatrix *  
          (vec4(aVertexNormal, 1.0) 
            /*+ aTranslation*/
          )
      );

      vNormal = transposedNormal;

      vec3 lightVector = normalize(uLightWorldPosition - gl_Position.xyz);
      vLightning = dot(transposedNormal, lightVector);
    }
  `;

  const fsPlanet = `
    precision highp float;

    varying highp vec4 vColor;
    varying highp float vLightning;
    varying vec3 vNormal;

    void main() {
      // no light
      gl_FragColor = vec4(vColor.rgb, vColor.a);
      
      // fraction light
      //gl_FragColor = vec4(vColor.rgb * 1.0/(1.0-vLightning), vColor.a);

      //gl_FragColor = vec4(vColor.rgb * vLightning, vColor.a);

//       normal debug
  //    gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1);
    }
  `;

  const loadPlanetProgramInfo = (gl) => {
    const shaderProgram = initShaderProgram(gl, vsPlanet, fsPlanet)

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal')
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix;'),
        lightWorldPosition: gl.getUniformLocation(shaderProgram, 'uLightWorldPosition'),
        translation: gl.getUniformLocation(shaderProgram, 'aTranslation'),
      },
    }

    return programInfo
  }

  const loadLineProgramInfo = (gl) => {
    const shaderProgram = initShaderProgram(gl, vsLine, fsLine)

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        translation: gl.getUniformLocation(shaderProgram, 'aTranslation'),
      },
    }

    return programInfo
  }

  return {
    loadPlanetProgramInfo,
    loadLineProgramInfo,
  }
}

const programs = loadPrograms()
