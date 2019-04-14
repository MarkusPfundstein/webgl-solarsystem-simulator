const webGLProgram = () => {

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
    ].map(x=>x)//x*scale/8)

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

  const drawScene = (gl, textContext, drawObjects, worldContext, deltaTime) => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    textContext.clearRect(0, 0, textContext.canvas.width, textContext.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const fieldOfView = 45 * Math.PI / 180
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.1
    const zFar = 5500.0
    const projectionMatrix = mat4.create()

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

    const modelViewMatrix = mat4.create()

    mat4.identity(modelViewMatrix)
    mat4.translate(
      modelViewMatrix, 
      modelViewMatrix, 
      [worldContext.camera.x, worldContext.camera.y, worldContext.camera.z]
    )
    mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      worldContext.camera.yaw * Math.PI / 180, 
      [0, 0, 1]
    )
    mat4.rotate(
      modelViewMatrix,
      modelViewMatrix, 
      -50 * Math.PI / 180,
      [1, 0, 0]
    )
    mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      worldContext.camera.roll * Math.PI / 180, 
      [0, 1, 0]
    )

    for (const o of Object.values(drawObjects)) {
      o.draw(projectionMatrix, modelViewMatrix)
    }

    textContext.save()

    for (const [name, o] of Object.entries(drawObjects)) {
      /*
      textContext.translate(o.translation[0], o.translation[1])
      textContext.fillStyle = '#FF0000'
      textContext.font = '10px serif'
      textContext.fillText('TEST', 0, 0)*/
    }


    textContext.translate(0, 0)
    textContext.fillStyle = '#FF0000'
    textContext.font = '28px serif'
  
    const currentSimDay = worldContext.displayData.currentDay

    textContext.fillText(`${currentSimDay.getMonth()+1}/${currentSimDay.getFullYear()}`, 20, 34)
  }

  const run = () => {
    const canvas = document.querySelector('#glCanvas')

    const gl = canvas.getContext('webgl')

    if (!gl) {
      throw new Error('webgl not supported')
    }

    const textCanvas = document.querySelector('#textCanvas')
    const textCtx = textCanvas.getContext('2d')

    const getDates = (startDate, endDate) => {
      const dates = []
      const addDays = (currentDate, days) => {
        const date = new Date(currentDate.valueOf())
        date.setDate(date.getDate() + days)
        return date
      };

      let currentDate = startDate
      while (currentDate <= endDate) {
        dates.push(currentDate)
        currentDate = addDays(currentDate, 1)
      }
      return dates
    };

    const simulationDays = getDates(new Date(1800, 1, 1), new Date())

    const planetUpdateFn = (self, worldContext, deltaTime) => {
      self.translation = [
        self.state.pos.x,
        self.state.pos.y,
        self.state.pos.z,
        0.0
      ].map(coord => coord*10)//coord * 25)
    }

    const colFromRGB = (r, g, b) => ([r/256, g/256, b/256, 1.0])

    const sun = makeCube(gl, 100, [1.0, 1.0, 0.0, 1.0], planetUpdateFn)
    const mercury = makeCube(gl, 0.33, colFromRGB(106, 106, 106), planetUpdateFn)
    const venus = makeCube(gl, 1, colFromRGB(238, 193, 116), planetUpdateFn)
    const earth = makeCube(gl, 1, [0.0, 1.0, 0.0, 1.0], planetUpdateFn)
    const mars = makeCube(gl, 1/2, colFromRGB(236, 138, 106), planetUpdateFn)
    const jupiter = makeCube(gl, 11, colFromRGB(233, 233, 240), planetUpdateFn)
    const saturn = makeCube(gl, 9.5, colFromRGB(225, 187, 103), planetUpdateFn)
    const uranus = makeCube(gl, 14.5, colFromRGB(208, 238, 241), planetUpdateFn)
    const neptune = makeCube(gl, 4, colFromRGB(77, 113, 246), planetUpdateFn)
    const pluto = makeCube(gl, 20/2, colFromRGB(68, 30, 21), planetUpdateFn)
    const ceres = makeCube(gl, 1, colFromRGB(255, 0, 0), planetUpdateFn)

    const drawObjects = {
      Sun: sun,
      Mercury: mercury,
      Venus: venus,
      Earth: earth,
      Mars: mars,
      Jupiter: jupiter,
      Saturn: saturn,
      Uranus: uranus,
      Neptune: neptune,
      Pluto: pluto,
      Ceres: ceres,
    }

    const worldContext = { 
      camera: {
        x: 0,
        y: 0,
        z: -225.0,
        yaw: -50,
        roll: 150,
      },
      displayData: {
        currentDay: null,
      }
    }

    let currentSimulationDayIndex = 0
    const calcNewPositions = () => {
      const simDay = simulationDays[currentSimulationDayIndex]

      worldContext.displayData.currentDay = simDay
      const astroDay = Astronomy.DayValue(simDay)
      for (const body of Astronomy.Body) {
        if (drawObjects[body.Name]) {
          const bodyLocation = body.EclipticCartesianCoordinates(astroDay)
          drawObjects[body.Name].setState({
            pos: {
              ...bodyLocation,
            }
          })
        } else {
          //console.log(`skip ${body.Name}`)
        }
      }
      ++currentSimulationDayIndex
      if (currentSimulationDayIndex >= simulationDays.length) {
        currentSimulationDayIndex = 0
      }
    }

    setInterval(calcNewPositions, 25)
    calcNewPositions()

    let then = 0
    const render = (now) => {
      now *= 0.001
      const deltaTime = now - then
      then = now

      for (let o of Object.values(drawObjects)) {
        o.update(worldContext, deltaTime)
      }

      drawScene(gl, textCtx, drawObjects, worldContext, deltaTime)
      requestAnimationFrame(render)
    }
    requestAnimationFrame(render)

    window.addEventListener('keydown', (event) => {
      if (event.defaultPrevented) {
        return; // Should do nothing if the default action has been cancelled
      }

      let handled = false;
      if (event.key !== undefined) {
        console.log(event)
        switch (event.key) {
          case 'w':
            worldContext.camera.z += 25;
            break;
          case 's':
            worldContext.camera.z -= 25;
            break;
          case 'a':
            worldContext.camera.x += 25;
            break;
          case 'd':
            worldContext.camera.x -= 25;
            break;
          case 'q':
            worldContext.camera.yaw += 25;
            break;
          case 'e':
            worldContext.camera.yaw -= 25;
            break;
          case 'z':
            worldContext.camera.roll += 25;
            break;
          case 'x':
            worldContext.camera.roll -= 25;
            break;
        }
      } else if (event.keyIdentifier !== undefined) {
      } else if (event.keyCode !== undefined) {
      }

      if (handled) {
      // Suppress "double action" if event handled
      event.preventDefault();
      }
    }, true)
  }

  try {
    run()
  } catch (e) {
    alert(e)
    throw e
  }
}

webGLProgram()
