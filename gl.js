const webGLProgram = (scaleStuff) => {

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
      worldContext.camera.pitch * Math.PI / 180,
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
    if (worldContext.displayData.drawXYZLines) {
      for (const o of Object.values(lineObjects)) {
        o.draw(projectionMatrix, modelViewMatrix)
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
      ].map(coord => coord*(scaleStuff ? 100 : 5))//coord * 25)
    }

    const colFromRGB = (r, g, b) => ([r/256, g/256, b/256, 1.0])

    const base = scaleStuff ? 3 : 1
    const sun = objects.makeCube(gl, scaleStuff ? base*10 : 1, [1.0, 1.0, 0.0, 1.0], planetUpdateFn)
    const mercury = objects.makeCube(gl, scaleStuff ? base*0.33 : 1, colFromRGB(186, 186, 186), planetUpdateFn)
    const venus = objects.makeCube(gl, scaleStuff ? base : 1, colFromRGB(238, 193, 116), planetUpdateFn)
    const earth = objects.makeCube(gl, scaleStuff ? base : 1, [0.0, 1.0, 0.0, 1.0], planetUpdateFn)
    const mars = objects.makeCube(gl, scaleStuff ? base*1/2 : 1, colFromRGB(236, 138, 106), planetUpdateFn)
    const jupiter = objects.makeCube(gl, scaleStuff ? base*2 : 1, colFromRGB(233, 233, 240), planetUpdateFn)
    const saturn = objects.makeCube(gl, scaleStuff ? base*2 :1, colFromRGB(225, 187, 103), planetUpdateFn)
    const uranus = objects.makeCube(gl, scaleStuff ? base*2 :1, colFromRGB(208, 238, 241), planetUpdateFn)
    const neptune = objects.makeCube(gl, scaleStuff ? base*1.5 :1, colFromRGB(77, 113, 246), planetUpdateFn)
    const pluto = objects.makeCube(gl, scaleStuff ? base : 1, colFromRGB(68, 30, 21), planetUpdateFn)
    const ceres = objects.makeCube(gl, scaleStuff ? base :1, colFromRGB(255, 0, 0), planetUpdateFn)

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
        z: -750,
        yaw: -50,
        roll: 150,
        pitch: -50,
      },
      displayData: {
        currentDay: null,
        drawXYZLines: true,
      },
      simulation: {
        paused: false,
      }
    }

    const xLine = objects.makeLine(gl, [1.0, 0.0, 0.0, 1], [-10000, 0, 0], [10000, 0, 0]) 
    const yLine = objects.makeLine(gl, [0.0, 1.0, 0.0, 1], [0, -10000, 0], [0, 10000, 0]) 
    const zLine = objects.makeLine(gl, [0.0, 0.0, 1.0, 1], [0, 0, -10000], [0, 0, 10000]) 

    const lineObjects = {
      xLine,
      yLine,
      zLine,
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
          const bodyLocation = body.EclipticCartesianCoordinates(astroDay)

          /*
          if (bodyName === 'Earth') {
            console.log(
              Math.sqrt(
                Math.pow(bodyLocation.x, 2) +
                Math.pow(bodyLocation.y, 2) +
                Math.pow(bodyLocation.z, 2)
              )
            )
          }
          */

          drawObjects[bodyName].setState({
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

      drawScene(gl, textCtx, drawObjects, lineObjects, worldContext, deltaTime)
      requestAnimationFrame(render)
    }
    requestAnimationFrame(render)

    window.addEventListener('keydown', (event) => {
      if (event.defaultPrevented) {
        return; // Should do nothing if the default action has been cancelled
      }

      let handled = false;
      if (event.key !== undefined) {
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
            // pitch -> x axis
          case 'r':
            worldContext.camera.pitch += 25;
            break;
          case 'f':
            worldContext.camera.pitch += 25;
            break;
          // jaw: z Axis
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
          case 'l':
            worldContext.displayData.drawXYZLines = !worldContext.displayData.drawXYZLines
            break;
          case ' ':
            if (event.code === 'Space') {
              worldContext.simulation.paused = !worldContext.simulation.paused
            }
        }
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

webGLProgram(true)
