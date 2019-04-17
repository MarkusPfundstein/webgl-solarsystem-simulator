const webGLProgram = (scaleStuff) => {

  const COORD_SCALE = 100

  const cameraDefaults = {
    veryFar: {
      dist: 5775,
      rotX: 50,
      rotY: 50,
      rotZ: 625
    },
    far: {
      dist: 1800,
      rotY: 50,
      rotX: 50,
      rotZ: 625,
    },
    near: {
      dist: 500,
      rotY: 50,
      rotX: 50,
      rotZ: 625,
    },
    '2dtop': {
      dist: 675,
      rotX: 190, // 175-190
      rotY: 0,
      rotZ: 0 
    },
    '2dside': {
      dist: 675,
      rotX: -600,
      rotY: 355,
      rotZ: 0,
    },
    'galactic': {
      dist: 925,
      rotX: -90,
      rotY: -375,
      rotZ: -25
    },
  }

  const drawScene = (gl, textContext, drawObjects, lineObjects, worldContext, deltaTime) => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    textContext.clearRect(0, 0, textContext.canvas.width, textContext.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const fieldOfView = 45 * Math.PI / 180
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.1
    const zFar = 105500.0
    const projectionMatrix = mat4.create()

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

    const eye = [0,0,1];
    // where you are looking at
    const center = [0, 0, 0];
    const up = [0, 1, 0];

    const cameraMatrix =  mat4.create()
    mat4.lookAt(cameraMatrix, eye, center, up)
    mat4.rotateZ(
      cameraMatrix,
      cameraMatrix,
      worldContext.camera.rotZ)
    mat4.rotateX(
      cameraMatrix,
      cameraMatrix,
      worldContext.camera.rotX)
    mat4.rotateY(
      cameraMatrix,
      cameraMatrix,
      worldContext.camera.rotY)
        
    mat4.translate(cameraMatrix, cameraMatrix, [0,0,worldContext.camera.dist])
       
    const viewMatrix = mat4.create()
    mat4.invert(viewMatrix, cameraMatrix)

    const lightPos = Object.values(drawObjects['Sun'].state.pos).map(x => x*COORD_SCALE)

    for (const o of Object.values(drawObjects)) {
      o.draw(projectionMatrix, viewMatrix, { lightPos })
    }
    if (worldContext.displayData.drawXYZLines) {
      for (const o of Object.values(lineObjects)) {
        o.draw(projectionMatrix, viewMatrix, { })
      }
    }

    textContext.save()
    textContext.translate(0, 0)
    textContext.fillStyle = '#FF0000'
    textContext.font = '18px serif'
  
    const currentSimDay = worldContext.displayData.currentDay

    textContext.fillText(`Month: ${currentSimDay.getMonth()+1}, Year: ${currentSimDay.getFullYear()}`, 20, 34)
    textContext.fillText(`${worldContext.simulation.helioCentric ? 'Heliocentric' : 'Geocentric'}`, 20, 55)
  }

  const calcNewPositions = (worldContext, drawObjects, simulationDays, currentSimulationDayIndex) => {
      if (worldContext.simulation.paused !== true) {
        const simDay = simulationDays[currentSimulationDayIndex]

        worldContext.displayData.currentDay = simDay
        const astroDay = Astronomy.DayValue(simDay)
        for (const body of Astronomy.Body) {
          const bodyName = body.Name
          if (drawObjects[bodyName]) {
            let bodyLocation;
            if (worldContext.simulation.helioCentric) {
              bodyLocation = body.EclipticCartesianCoordinates(astroDay)
            } else {
              bodyLocation = body.GeocentricCoordinates(astroDay)
            }

            drawObjects[bodyName].setState({
              // make y axis to correspond to z. nicer for rendering
              pos: { x: bodyLocation.x, y: bodyLocation.z, z: bodyLocation.y }
            })
          }
        }
        ++currentSimulationDayIndex
        if (currentSimulationDayIndex >= simulationDays.length) {
          currentSimulationDayIndex = 0
        }
      }
      setTimeout(
        () => calcNewPositions(worldContext, drawObjects, simulationDays, currentSimulationDayIndex),
        worldContext.simulation.speed
      )
    }

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

  const planetUpdateFn = (self, worldContext, deltaTime, context) => {
    self.translation = [
      self.state.pos.x,
      self.state.pos.y,
      self.state.pos.z,
      0.0
    ].map(coord => coord*(scaleStuff ? COORD_SCALE : 25))//coord * 25)
  }

  const planetUpdateFnWithRotationSpeed = (rotSpeed) => (self, worldContext, deltaTime, context) => {
    planetUpdateFn(self, worldContext, deltaTime, context)
    console.log(worldContext.simulation.speed)
    if (!worldContext.simulation.paused) {
      // counter clockwise if speedRelSun pos
      self.rotY -= (151-worldContext.simulation.speed)/150 * rotSpeed * deltaTime
    }
  }

  const loadAllTextures = (gl) => {
    const texs = {
      Sun: './tex/sun.jpg',
      Mercury: './tex/mercury.jpg',
      Venus: './tex/venus.jpg',
      Earth: './tex/earth.jpg',
      Mars: './tex/mars.jpg',
      Jupiter: './tex/jupiter.jpg',
      Saturn: './tex/saturn.jpg',
      Uranus: './tex/uranus.jpg',
      Neptune: './tex/neptune.jpg',
      Pluto: './tex/pluto.jpg'
    }
    const loadedPs = Object.entries(texs).map(([key, value]) => {
      return util.loadTexture(gl, key, value)
    })
    return Promise.all(loadedPs).then(allTexs => {
      const texMap = {}
      for (let [key, value] of allTexs) {
        texMap[key] = value
      }
      return texMap
    })
  }

  const run = async () => {
    const canvas = document.querySelector('#glCanvas')

    const gl = canvas.getContext('webgl')

    if (!gl) {
      throw new Error('webgl not supported')
    }

    let textures = null
    try {
      textures = await loadAllTextures(gl)
    } catch (e) {
      alert(`Error loading texture for ${e[0]}`)
    }

    const textCanvas = document.querySelector('#textCanvas')
    const textCtx = textCanvas.getContext('2d')

    const simulationDays = getDates(new Date(1564, 2, 15), new Date())

    const colFromRGB = (r, g, b) => ([r/256, g/256, b/256, 1.0])

    const earthSpin = 1.0
    const sunSpin = earthSpin/24

    const base = scaleStuff ? 3 : 1
    const sun = objects.makeSphere(
      gl, 
      scaleStuff ? base*8 : 1, [1.0, 1.0, 0.0, 1.0], 
      textures['Sun'], 
      planetUpdateFnWithRotationSpeed(sunSpin))
    sun.setApplyLight(false)
    const mercury = objects.makeSphere(
      gl,
      scaleStuff ? base*2/3 : 1,
      colFromRGB(186, 186, 186),
      textures['Mercury'],
      planetUpdateFnWithRotationSpeed(1))
    const venus = objects.makeSphere(
      gl,
      scaleStuff ? base : 1,
      colFromRGB(238, 193, 116),
      textures['Venus'],
      planetUpdateFnWithRotationSpeed(-3))
    const earth = objects.makeSphere(
      gl,
      scaleStuff ? base: 1,
      [0.0, 1.0, 0.0, 1.0],
      textures['Earth'],
      planetUpdateFnWithRotationSpeed(earthSpin))
    const mars = objects.makeSphere(
      gl,
      scaleStuff ? base*2/3 : 1,
      colFromRGB(236, 138, 106),
      textures['Mars'], 
      planetUpdateFnWithRotationSpeed(1))
    const jupiter = objects.makeSphere(
      gl,
      scaleStuff ? base*2 : 1,
      colFromRGB(233, 233, 240),
      textures['Jupiter'],
      planetUpdateFnWithRotationSpeed(1))
    const saturn = objects.makeSphere(
      gl,
      scaleStuff ? base*2 :1,
      colFromRGB(225, 187, 103),
      textures['Saturn'],
      planetUpdateFnWithRotationSpeed(1))
    const uranus = objects.makeSphere(
      gl,
      scaleStuff ? base*2 :1,
      colFromRGB(208, 238, 241),
      textures['Uranus'],
      planetUpdateFnWithRotationSpeed(-1))
    const neptune = objects.makeSphere(
      gl,
      scaleStuff ? base*3 :1,
      colFromRGB(77, 113, 246),
      textures['Neptune'],
      planetUpdateFnWithRotationSpeed(1))
    const pluto = objects.makeSphere(
      gl,
      scaleStuff ? base*4 : 1,
      colFromRGB(68, 30, 21),
      textures['Pluto'],
      planetUpdateFnWithRotationSpeed(1))
    const ceres = objects.makeSphere(
      gl, 
      scaleStuff ? base*0.5 : 1,
      colFromRGB(238, 0, 0),
      null,
      planetUpdateFnWithRotationSpeed(1))
    // for some reason, the last element to draw before other stuff must be a cube :P
    const bugFixer= objects.makeCube(gl, scaleStuff ? base : 1, colFromRGB(0, 0, 0), (self) => {self.translation = [-1000000,-1000000,-1000000]})

    const drawObjects = {
      Sun: sun,
      Mercury: mercury,
      Venus: venus,
      Earth: earth,
      //Moon: moon,
      Mars: mars,
      Jupiter: jupiter,
      Saturn: saturn,
      Uranus: uranus,
      Neptune: neptune,
      Pluto: pluto,
      Ceres: ceres,
      __BUGFIXER: bugFixer,
    }

    const worldContext = { 
      camera: {
        ...cameraDefaults.near
      },
      displayData: {
        currentDay: null,
        drawXYZLines: true,
      },
      simulation: {
        paused: false,
        helioCentric: true,
        speed: 15//25,
      },
      cameraDefaults,
    }

    const xLine = objects.makeLine(gl, [1.0, 0.0, 0.0, 1], [0, 0, 0], [10000, 0, 0]) 
    const xLineNeg = objects.makeLine(gl, [0.5, 0.0, 0.0, 1], [0, 0, 0], [-10000, 0, 0]) 
    const yLine = objects.makeLine(gl, [0.0, 1.0, 0.0, 1], [0, 0, 0], [0, 10000, 0]) 
    const yLineNeg = objects.makeLine(gl, [0.0, 0.5, 0.0, 1], [0, 0, 0], [0, -10000, 0]) 
    const zLine = objects.makeLine(gl, [0.0, 0.0, 1.0, 1], [0, 0, 0], [0, 0, 10000]) 
    const zLineNeg = objects.makeLine(gl, [0.0, 0.0, 0.5, 1], [0, 0, 0], [0, 0, -10000]) 

    const lineObjects = {
      xLine,
      xLineNeg,
      yLine,
      yLineNeg,
      zLine,
      zLineNeg,
    }

    // will continously update itself
    calcNewPositions(worldContext, drawObjects, simulationDays, 0)

    let then = 0
    const render = (now) => {
      now *= 0.001
      const deltaTime = now - then
      then = now

      for (let o of Object.values(drawObjects)) {
        o.update(worldContext, deltaTime, {drawObjects})
      }

      drawScene(gl, textCtx, drawObjects, lineObjects, worldContext, deltaTime)
      requestAnimationFrame(render)
    }
    initControls(worldContext)

    requestAnimationFrame(render)
  }

  try {
    run()
  } catch (e) {
    alert(e)
    throw e
  }
}

webGLProgram(true)
