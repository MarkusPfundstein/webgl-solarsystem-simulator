const initControls = (worldContext) => {

  const viewButtons = Object.keys(worldContext.cameraDefaults)

  viewButtons.forEach(tag => {
    document.getElementById(`viewButton-${tag}`).addEventListener('click', event => {
      worldContext.camera = {
        ...worldContext.cameraDefaults[tag],
      }
    })
  })
  
  window.addEventListener('keydown', (event) => {

    let handled = false;
    if (event.key !== undefined) {
      console.log(event)
      switch (event.key) {
        case 'w':
          worldContext.camera.rotX += 25;
          break;
        case 's':
          worldContext.camera.rotX -= 25;
          break;
        case 'a':
          worldContext.camera.rotY += 25;
          break;
        case 'd':
          worldContext.camera.rotY -= 25;
          break;
        case 'q':
          worldContext.camera.rotZ -= 25;
          break;
        case 'e':
          worldContext.camera.rotZ += 25;
          break;
        case 'r':
          worldContext.camera.dist -= 25;
          break;
        case 'f':
          worldContext.camera.dist += 25;
          break;
        case '=':
          worldContext.simulation.speed -= 3;
          if (worldContext.simulation.speed < 1) {
            worldContext.simulation.speed = 1
          }
          break;
        case '-':
          worldContext.simulation.speed += 3;
          if (worldContext.simulation.speed > 150) {
            worldContext.simulation.speed = 150
          }
          break;
        case '.':
          worldContext.simulation.helioCentric = !worldContext.simulation.helioCentric;
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
