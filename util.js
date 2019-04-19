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

  const loadTextureCube = (gl, name, texturePaths, width, height) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    const allPs = texturePaths.map(({target, url}) => {

      // Upload the canvas to the cubemap face.
      const level = 0
      const internalFormat = gl.RGBA
      const format = gl.RGBA
      const type = gl.UNSIGNED_BYTE

      gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null)
      let pRes
      let pRej
      const promise = new Promise((res, rej) => {
        pRes = res
        pRej = rej
      })

      // Asynchronously load an image
      const image = new Image();
      image.src = url;
      image.addEventListener('load', () => {
        try {
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
          gl.texImage2D(target, level, internalFormat, format, type, image)

          if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
          }
          else {
           gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
           gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
           gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
          }

          pRes([name, texture])
        } catch (e) {
          pRej([name, e])
        }
      });
      image.addEventListener('error', e => {
        console.error(e)
        pRej([name, e])
      })

      return promise;
    })
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    return Promise.all(allPs)
      .then(_ => ([name, texture]))
      .catch(e => ([name, e]))
  }

  const loadTexture = (gl, name, texturePath, w, h) => {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      w,
      h,
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
  }

  return {
    makeGLArrayBuffer,
    makeGLElementArrayBuffer,
    loadTexture,
    loadTextureCube,
    getDates,
  }
}

const util = makeUtil()

