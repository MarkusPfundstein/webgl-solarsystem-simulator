class DrawObject {
  constructor(gl, drawInfo, programInfo) {

    this.gl = gl
    this.buffer = util.makeGLArrayBuffer(gl, drawInfo.positions)
    this.indexBuffer = util.makeGLElementArrayBuffer(gl, drawInfo.indices)
    this.normalBuffer = drawInfo.normals && util.makeGLArrayBuffer(gl, drawInfo.normals)
    this.colorBuffer = drawInfo.colors && util.makeGLArrayBuffer(gl, drawInfo.colors)
    this.drawInfo = {
      nIndices: drawInfo.indices.length,
    }
    this.programInfo = programInfo
    this.translation = [0.0, 0.0, 0.0, 0.0]
    this.updateFn = () => {}
    this.state = {}
  }

  setColors(colors) {
    this.colorBuffer = util.makeGLArrayBuffer(this.gl, colors)
  }

  setUpdateFn(fn) {
    this.updateFn = fn
  }

  setState(newState = {}) {
    this.state = {
      ...this.state,
      ...newState
    }
  }

  update(worldContext, deltaTime) {
    this.updateFn(this, worldContext, deltaTime)
  }

  draw(projectionMatrix, modelViewMatrix) {

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
    this.gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    )
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition)
  
    if (this.normalBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer)
      this.gl.vertexAttribPointer(
        this.programInfo.attribLocations.vertexNormal,
        3,
        this.gl.FLOAT,
        false,
        0,
        0
      )
      this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexNormal)
    }

    if (this.colorBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer)
      this.gl.vertexAttribPointer(
        this.programInfo.attribLocations.vertexColor,
        4,
        this.gl.FLOAT,
        false,
        0,
        0
      )
      this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor)
    }

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    this.gl.useProgram(this.programInfo.program)

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    )
    
    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    )

    this.gl.uniform4fv(
      this.programInfo.uniformLocations.translation, 
      this.translation
    )

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix
    )

    this.gl.uniform3fv(
      this.programInfo.uniformLocations.uLightWorldPosition,
      [0.0, 0.0, 0.0]
    )

    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.drawInfo.nIndices,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }
}
