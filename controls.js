const initControls = (worldContext) => {

  const viewButtons = [
    'near', 'far', '2dtop', '2dside', 'galactic'
  ]

  viewButtons.forEach(tag => {
    document.getElementById(`viewButton-${tag}`).addEventListener('click', event => {
      worldContext.camera = {
        ...worldContext.cameraDefaults[tag],
      }
    })
  })
  
  window.addEventListener('keydown', (event) => {
    event.preventDefault();

    let handled = false;
    if (event.key !== undefined) {
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
        case '.':
          worldContext.simulation.helioCentric = !worldContext.simulation.helioCentric;
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
  }, true)
}
