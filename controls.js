const initControls = (worldContext) => {

  const toggleShowNames = () => {
    worldContext.displayData.drawNamesOfBodies = !worldContext.displayData.drawNamesOfBodies
  }

  const toggleShowOthers = () => {
    worldContext.simulation.onlyMainPlanets = !worldContext.simulation.onlyMainPlanets
  }

  const toggleHelio = () => {
    worldContext.simulation.helioCentric = !worldContext.simulation.helioCentric
  }

  const incSpeed = () => {
    worldContext.simulation.speed -= 3
    if (worldContext.simulation.speed < 1) {
      worldContext.simulation.speed = 1
    }
  }
  const decSpeed = () => {
    worldContext.simulation.speed += 3
    if (worldContext.simulation.speed > 150) {
      worldContext.simulation.speed = 150
    }
  }

  const viewButtons = Object.keys(worldContext.cameraDefaults)

  viewButtons.forEach(tag => {
    document.getElementById(`viewButton-${tag}`).addEventListener('click', event => {
      worldContext.camera = {
        ...worldContext.cameraDefaults[tag],
      }
      event.preventDefault()
    })
  })

  document.getElementById('control-incSpeed').addEventListener('click', e => {
    incSpeed()
    e.preventDefault()
  })

  document.getElementById('control-decSpeed').addEventListener('click', e => {
    decSpeed()
    e.preventDefault()
  })

  document.getElementById('control-showNames').addEventListener('click', e => {
    toggleShowNames()
    e.preventDefault()
  })

  document.getElementById('control-showOthers').addEventListener('click', e => {
    toggleShowOthers()
    e.preventDefault()
  })

  document.getElementById('control-toggleHelio').addEventListener('click', e => {
    toggleHelio()
    e.preventDefault()
  })

  document.getElementById('simuDayButton').addEventListener('click', event => {
    const from = document.getElementById('simuFromField').value
    const to = document.getElementById('simuToField').value

    let fromDate
    let toDate
    if (from) {
      fromDate = parseInt(from, 10)
    }
    if (to != '') {
      toDate = parseInt(to, 10)
    }
    if (fromDate) {
      const simulationDays = util.getDates(
        new Date(fromDate, 1, 1),
        toDate ? new Date(toDate, 1, 1) : new Date()
      )
      worldContext.simulation.simulationDays = simulationDays
      worldContext.simulation.currentSimulationDayIndex = 0
    }
  })
  
  window.addEventListener('keydown', (event) => {

    let handled = false;
    if (event.key !== undefined) {
      switch (event.key) {
        case 'w':
          worldContext.camera.rotX += 25
          break;
        case 's':
          worldContext.camera.rotX -= 25
          break;
        case 'a':
          worldContext.camera.rotY += 25
          break;
        case 'd':
          worldContext.camera.rotY -= 25
          break;
        case 'q':
          worldContext.camera.rotZ -= 25
          break;
        case 'e':
          worldContext.camera.rotZ += 25
          break;
        case 'r':
          worldContext.camera.dist -= 25
          break;
        case 'f':
          worldContext.camera.dist += 25
          break;
        case '+':
        case '=':
          incSpeed()
          break;
        case '-':
          decSpeed()
          break;
        case '.':
          toggleHelio()
          break;
        case 'n':
          toggleShowNames()
          break
        case 'b':
          worldContext.displayData.showSkyBox = !worldContext.displayData.showSkyBox
        case 'm':
          toggleShowOthers()
          break;
        case 'l':
          worldContext.displayData.drawXYZLines = !worldContext.displayData.drawXYZLines
          break;
        case 'p':
          worldContext.simulation.paused = !worldContext.simulation.paused
          break;
      }
    }
  }, true)
}
