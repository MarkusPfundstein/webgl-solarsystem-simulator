class DrawObject {
  constructor(gl, drawInfo, programInfo) {

    this.gl = gl
    this.buffer = util.makeGLArrayBuffer(gl, drawInfo.positions)
    this.indexBuffer = drawInfo.indices && util.makeGLElementArrayBuffer(gl, drawInfo.indices)
    this.normalBuffer = drawInfo.normals && util.makeGLArrayBuffer(gl, drawInfo.normals)
    this.colorBuffer = drawInfo.colors && util.makeGLArrayBuffer(gl, drawInfo.colors)
    this.textureBuffer = drawInfo.textureCoords && util.makeGLArrayBuffer(gl, drawInfo.textureCoords)
    this.drawInfo = {
      nIndices: drawInfo.indices ? drawInfo.indices.length : drawInfo.nVertices,
      applyLight: drawInfo.applyLight || true,
    }
    this.programInfo = programInfo
    this.translation = [0.0, 0.0, 0.0, 0.0]
    this.rotX = 0.0;
    this.rotY = 0.0;
    this.rotZ = 0.0;
    this.updateFn = () => {}
    this.state = {}
    this.texture = drawInfo.texture || null
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

  update(worldContext, deltaTime, context) {
    this.updateFn(this, worldContext, deltaTime, context)
  }

  draw(projectionMatrix, viewMatrix, context) {

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

    if (this.textureBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer)
      
      this.gl.vertexAttribPointer(
        this.programInfo.attribLocations.textureUV,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      )
      this.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureUV)
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
    mat4.rotateY(
      modelMatrix,
      modelMatrix,
      this.rotY * Math.PI/180
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

    this.gl.uniform1i(
      this.programInfo.uniformLocations.useTexture,
      this.texture != null 
    )

    if (this.texture) {
      this.gl.activeTexture(this.gl.TEXTURE0)
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
      this.gl.uniform1i(
        this.programInfo.uniformLocations.texture,
        0
      )
    }

    this.gl.uniform4fv(
      this.programInfo.uniformLocations.lightWorldPosition,
      [...context.lightPos, 1]
    )

    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.drawInfo.nIndices,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }
}

class SkyBoxObject extends DrawObject {
  draw(projectionMatrix, viewMatrix, context) {
    const vp = mat4.create()
    const vm2 = mat4.create()
    mat4.copy(vm2, viewMatrix)
    vm2[12] = 0
    vm2[13] = 0
    vm2[14] = 0
    mat4.multiply(vp, projectionMatrix, vm2);
    const vpi = mat4.create()
    mat4.invert(vpi, vp);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
    this.gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    )
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition)
  
    this.gl.useProgram(this.programInfo.program)

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture)
    this.gl.uniform1i(
      this.programInfo.uniformLocations.skyBox,
      0
    )
    
    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.viewDirectionProjectionInverse,
      false, 
      vpi
    )
    
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.drawInfo.nIndices);
  }
}

class LineObject extends DrawObject {
  constructor(gl, drawInfo, programInfo) {
    super(gl, drawInfo, programInfo)
  }

  draw(projectionMatrix, viewMatrix, context) {
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
