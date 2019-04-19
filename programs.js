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

  const vsSkyBox = `
    attribute vec4 aVertexPosition;
    
    varying vec4 vVertexPosition;

    void main() {
      vVertexPosition = aVertexPosition;
      gl_Position = aVertexPosition;
      gl_Position.z = 1.0;
    }
  `

  const fsSkyBox = `
    precision highp float;

    uniform samplerCube uSkyBox;
    uniform mat4 uViewDirectionProjectionInverse;

    varying vec4 vVertexPosition;

    void main() {
      vec4 t = uViewDirectionProjectionInverse * vVertexPosition;
      gl_FragColor = textureCube(uSkyBox, normalize(t.xyz / t.w));
    }
  `

  const vsLine = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec4 vColor;

    void main() {
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
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
    attribute vec2 aTextureUV;
    
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform vec4 uLightWorldPosition;

    varying highp vec4 vColor;
    varying highp vec3 vNormal;
    varying highp vec3 vVertex;
    varying highp vec3 vLightPos;
    varying highp vec2 vTextureUV;

    void main() {
      // positioning of vertex
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;

      // color/texture stuff
      vColor = aVertexColor;

      mat4 matrix = uModelMatrix;
      mat4 matrixIT;
      matrixIT[0] = matrix[0] / dot(matrix[0],matrix[0]);
      matrixIT[1] = matrix[1] / dot(matrix[1],matrix[1]);
      matrixIT[2] = matrix[2] / dot(matrix[2],matrix[2]);
      matrixIT[3] = matrix[3] / dot(matrix[3],matrix[3]);

      // not sure if viewMatrix is needed
      vVertex = vec3( uViewMatrix * uModelMatrix * aVertexPosition );
      vNormal = vec3( uViewMatrix * matrixIT * vec4( aVertexNormal, 0.0 ) );
      vLightPos = vec3( uViewMatrix * uLightWorldPosition );

      vTextureUV = aTextureUV;
    }
  `;

  const fsPlanet = `
    precision highp float;

    uniform bool uApplyLight;
    uniform bool uUseTexture;
    uniform sampler2D uTexture;

    varying highp vec4 vColor;
    varying highp vec3 vNormal;
    varying highp vec3 vVertex;
    varying highp vec3 vLightPos;
    varying highp vec2 vTextureUV;

    void main() {
      vec4 fragColor;
      if (uUseTexture) {
        fragColor = texture2D(uTexture, vTextureUV);
      } else {
        fragColor = vColor;
      }
      if (uApplyLight) {
        vec3 to_light;
        vec3 vertex_normal; 
        vec3 ambient_color = fragColor.rgb * 0.8;
        float cos_angle; 

        to_light = vLightPos - vVertex;
        to_light = normalize(to_light);

        vertex_normal = normalize(vNormal);

        cos_angle = dot(vertex_normal, to_light);
        cos_angle = clamp(cos_angle, 0.0, 1.0);
        cos_angle = pow(cos_angle, 2.0);

        vec3 diffuse_color = fragColor.rgb * cos_angle;

        vec3 final_color = ambient_color + diffuse_color;
        gl_FragColor = vec4 (final_color, fragColor.a);
      }
      else {
        gl_FragColor = fragColor;
      }
      
      
      //gl_FragColor = vec4(vNormal* 0.5 + 0.5, 1.0);
      //gl_FragColor = vec4(normalize(vNormal), 1.0);
    }
  `;

  const loadSkyBoxProgramInfo = (gl) => {
    const shaderProgram = initShaderProgram(gl, vsSkyBox, fsSkyBox)

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        skyBox: gl.getUniformLocation(shaderProgram, 'uSkyBox'),
        viewDirectionProjectionInverse: gl.getUniformLocation(shaderProgram, 'uViewDirectionProjectionInverse')
      },
    }

    return programInfo
  }

  const loadPlanetProgramInfo = (gl) => {
    const shaderProgram = initShaderProgram(gl, vsPlanet, fsPlanet)

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        textureUV: gl.getAttribLocation(shaderProgram, 'aTextureUV')
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
        viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
        lightWorldPosition: gl.getUniformLocation(shaderProgram, 'uLightWorldPosition'),
        applyLight: gl.getUniformLocation(shaderProgram, 'uApplyLight'),
        useTexture: gl.getUniformLocation(shaderProgram, 'uUseTexture'),
        texture: gl.getUniformLocation(shaderProgram, 'uTexture')
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
        modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
        viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
      },
    }

    return programInfo
  }

  return {
    loadPlanetProgramInfo,
    loadLineProgramInfo,
    loadSkyBoxProgramInfo,
  }
}

const programs = loadPrograms()
