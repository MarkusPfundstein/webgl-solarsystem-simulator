class DrawObject {
  constructor(gl, drawInfo, programInfo) {

    this.gl = gl
    this.buffer = util.makeGLArrayBuffer(gl, drawInfo.positions)
    this.indexBuffer = drawInfo.indices && util.makeGLElementArrayBuffer(gl, drawInfo.indices)
    this.normalBuffer = drawInfo.normals && util.makeGLArrayBuffer(gl, drawInfo.normals)
    this.colorBuffer = drawInfo.colors && util.makeGLArrayBuffer(gl, drawInfo.colors)
    this.drawInfo = {
      nIndices: drawInfo.indices ? drawInfo.indices.length : drawInfo.nVertices,
      applyLight: drawInfo.applyLight || true,
    }
    this.programInfo = programInfo
    this.translation = [0.0, 0.0, 0.0, 0.0]
    this.updateFn = () => {}
    this.state = {}
  }

  setApplyLight(apply) {
    this.drawInfo.applyLight = apply;
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

  draw(projectionMatrix, viewMatrix) {

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

    this.gl.useProgram(this.programInfo.program)

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    )

    const modelMatrix = mat4.create()
    mat4.translate(
      modelMatrix,
      modelMatrix,
      this.translation
    )

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelMatrix,
      false,
      modelMatrix
    )

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.viewMatrix,
      false,
      viewMatrix
    )

    this.gl.uniform1i(
      this.programInfo.uniformLocations.applyLight,
      this.drawInfo.applyLight
    )

    this.gl.uniform4fv(
      this.programInfo.uniformLocations.lightWorldPosition,
      [0.0, 0.0, 0.0, 1.0]
    )

    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.drawInfo.nIndices,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }
}

class LineObject extends DrawObject {
  constructor(gl, drawInfo, programInfo) {
    super(gl, drawInfo, programInfo)
  }

  draw(projectionMatrix, viewMatrix) {
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

    this.gl.useProgram(this.programInfo.program)

    const modelMatrix = mat4.create()
    mat4.translate(
      modelMatrix,
      modelMatrix,
      this.translation
    )

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    )

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelMatrix,
      false,
      modelMatrix
    )

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.viewMatrix,
      false,
      viewMatrix
    )
    
    this.gl.drawElements(
      this.gl.LINES,
      this.drawInfo.nIndices,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }
}
