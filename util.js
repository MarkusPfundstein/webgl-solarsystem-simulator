const makeUtil = () => {
  const makeGLArrayBuffer = (gl, data) => {
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    return buf
  }

  const makeGLElementArrayBuffer = (gl, data) => {
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW)
    return buf 
  }

  return {
    makeGLArrayBuffer,
    makeGLElementArrayBuffer,
  }
}

const util = makeUtil()

