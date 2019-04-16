const webGLProgram = (scaleStuff) => {

  const cameraDefaults = {
    far: {
      dist: 1800,
      rotY: 50,
      rotX: 50,
      rotZ: 0,
    },
    near: {
      dist: 500,
      rotY: 50,
      rotX: 50,
      rotZ: 0,
    },
    '2dtop': {
      dist: 675,
      rotX: -190, // 175-190
      rotY: 0,
      rotZ: 0 
    },
    '2dside': {
      dist: 675,
      rotX: 0,
      rotY: 180,
      rotZ: 0 
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

    for (const o of Object.values(drawObjects)) {
      o.draw(projectionMatrix, viewMatrix)
    }
    if (worldContext.displayData.drawXYZLines) {
      for (const o of Object.values(lineObjects)) {
        o.draw(projectionMatrix, viewMatrix)
      }
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

    const simulationDays = getDates(new Date(1822, 1, 1), new Date())

    const planetUpdateFn = (self, worldContext, deltaTime) => {
      self.translation = [
        self.state.pos.x,
        self.state.pos.y,
        self.state.pos.z,
        0.0
      ].map(coord => coord*(scaleStuff ? 100 : 25))//coord * 25)
    }

    const colFromRGB = (r, g, b) => ([r/256, g/256, b/256, 1.0])

    const base = scaleStuff ? 3 : 1
    const sun = objects.makeSphere(gl, scaleStuff ? base*8 : 1, [1.0, 1.0, 0.0, 1.0], planetUpdateFn)
    sun.setApplyLight(false)
    const mercury = objects.makeSphere(gl, scaleStuff ? base*2/3 : 1, colFromRGB(186, 186, 186), planetUpdateFn)
    const venus = objects.makeSphere(gl, scaleStuff ? base : 1, colFromRGB(238, 193, 116), planetUpdateFn)
    const earth = objects.makeSphere(gl, scaleStuff ? base : 1, [0.0, 1.0, 0.0, 1.0], planetUpdateFn)
    const mars = objects.makeSphere(gl, scaleStuff ? base*2/3 : 1, colFromRGB(236, 138, 106), planetUpdateFn)
    const jupiter = objects.makeSphere(gl, scaleStuff ? base*2 : 1, colFromRGB(233, 233, 240), planetUpdateFn)
    const saturn = objects.makeSphere(gl, scaleStuff ? base*2 :1, colFromRGB(225, 187, 103), planetUpdateFn)
    const uranus = objects.makeSphere(gl, scaleStuff ? base*2 :1, colFromRGB(208, 238, 241), planetUpdateFn)
    const neptune = objects.makeSphere(gl, scaleStuff ? base*1.5 :1, colFromRGB(77, 113, 246), planetUpdateFn)
    const pluto = objects.makeSphere(gl, scaleStuff ? base*1.5 : 1, colFromRGB(68, 30, 21), planetUpdateFn)
    const ceres = objects.makeSphere(gl, scaleStuff ? base*0.5 : 1, colFromRGB(238, 0, 0), planetUpdateFn)
    // for some reason, the last element to draw before other stuff must be a cube :P
    const bugFixer= objects.makeCube(gl, scaleStuff ? base : 1, colFromRGB(0, 0, 0), (self) => {self.translation = [-1000000,-1000000,-1000000]})

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

    let currentSimulationDayIndex = 0
    const calcNewPositions = () => {
      if (worldContext.simulation.paused === true) {
        return
      }
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
            // openGL transform
            pos: {
              x: bodyLocation.x,
              y: bodyLocation.z,
              z: bodyLocation.y
            }
          })
          /*
          if (bodyName === 'Sun') {
            drawObjects[bodyName].setState({
              // openGL transform
              pos: {
                x: 1,
                y: 1,
                z: 1,
              }
            })
          }
          */
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
