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

  const isPowerOf2 = value => (value & (value - 1)) == 0

  const loadTexture = (gl, name, texturePath) => {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]))

    let pRes
    let pRej
    const promise = new Promise((res, rej) => {
      pRes = res
      pRej = rej
    })
    const image = new Image()
    image.crossOrigin = '';
    image.src = texturePath
    image.addEventListener('load', () => {
      try {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
           gl.generateMipmap(gl.TEXTURE_2D)
        } else {
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        }
        pRes([name, texture])
      } catch (e) {
        pRej([name, e])
      }
    })
    image.addEventListener('error', err => pRej([name, err]))
    return promise
  }

  return {
    makeGLArrayBuffer,
    makeGLElementArrayBuffer,
    loadTexture,
  }
}

const util = makeUtil()

