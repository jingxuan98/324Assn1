"use strict";

var canvas;
var gl;

var points = [];
var colors = [];
var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var thetaLoc;
var check = true;
var NumTimesToSubdivide = 3;

let modelViewMatrixLoc;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  //
  //  Initialize our data for the Sierpinski Gasket
  //

  // First, initialize the vertices of our 3D gasket
  // Four vertices on unit circle
  // Intial tetrahedron with equal length sides

  var vertices = [
    vec3(0.0, 0.0, -1.0),
    vec3(0.0, 0.9428, 0.3333),
    vec3(-0.8165, -0.4714, 0.3333),
    vec3(0.8165, -0.4714, 0.3333)
  ];

  divideTetra(
    vertices[0],
    vertices[1],
    vertices[2],
    vertices[3],
    NumTimesToSubdivide
  );

  //
  //  Configure WebGL
  //
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // enable hidden-surface removal

  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Create a buffer object, initialize it, and associate it with the
  //  associated attribute variable in our vertex shader

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

  render();
};

function triangle(a, b, c, color) {
  // add colors and vertices for one triangle

  var baseColors = [
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 0.0, 1.0),
    vec3(0.0, 0.0, 0.0)
  ];

  colors.push(baseColors[color]);
  points.push(a);
  colors.push(baseColors[color]);
  points.push(b);
  colors.push(baseColors[color]);
  points.push(c);
}

function tetra(a, b, c, d) {
  // tetrahedron with each side using
  // a different color

  triangle(a, c, b, 0);
  triangle(a, c, d, 1);
  triangle(a, b, d, 2);
  triangle(b, c, d, 3);
}

function divideTetra(a, b, c, d, count) {
  // check for end of recursion

  if (count === 0) {
    tetra(a, b, c, d);
  }

  // find midpoints of sides
  // divide four smaller tetrahedra
  else {
    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var ad = mix(a, d, 0.5);
    var bc = mix(b, c, 0.5);
    var bd = mix(b, d, 0.5);
    var cd = mix(c, d, 0.5);

    --count;

    divideTetra(a, ab, ac, ad, count);
    divideTetra(ab, b, bc, bd, count);
    divideTetra(ac, bc, c, cd, count);
    divideTetra(ad, bd, cd, d, count);
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let scaleFactor = mat4(
    scaleX, 0, 0, 0,
    0, scaleY, 0, 0,
    0, 0, scaleZ, 0,
    0, 0, 0, scaleW
  );

  let modelViewMatrix = rotate(theta, ...rotationAxis);
  modelViewMatrix = mult(modelViewMatrix, scaleFactor);
  modelViewMatrix = mult(modelViewMatrix, translate(translateX, translateY, translateZ));

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  // theta[yAxis] += 2.0;
  // gl.uniform3fv(thetaLoc, theta);

  // theta[axis] += 2.0;
  // ctm = rotateX(theta[xAxis]);
  // ctm = mult(ctm, rotateY(theta[yAxis]));
  // ctm = mult(ctm, rotatez(theta[zAxis]));
  // gl.uniform4fv(modelViewMatrix, false, flatten(ctm));

  gl.drawArrays(gl.TRIANGLES, 0, points.length);
  requestAnimFrame(render);
}

let translateX = 0;
let translateY = 0;
let translateZ = 0;

let theta = 0;
let rotationAxis = [0, 0, 1];
let rotationInterval = 10;
let rotationIntervalId;

let scaleX = 1;
let scaleY = 1;
let scaleZ = 1;
let scaleW = 1;

window.addEventListener("load", () => {
  let rotations = [
    {
      id: "rotate-x",
      axis: 0
    }, {
      id: "rotate-y",
      axis: 1
    }, {
      id: "rotate-z",
      axis: 2
    }
  ];

  for (let rotation of rotations) {
    let element = document.getElementById(rotation.id);
    element.addEventListener("click", () => {
      clearInterval(rotationIntervalId);

      rotationIntervalId = setInterval(() => {
        rotationAxis = [0, 0, 0];
        rotationAxis[rotation.axis] = 1;

        theta += 1;
      }, rotationInterval);
    });
  }

  let element = document.getElementById("scale");
  element.addEventListener("click", () => {
    let minFactor = 0.5;
    let maxFactor = 1.5;

    let scaleDirection = 1;

    setInterval(() => {
      scaleX = scaleX + (scaleDirection * 0.01);
      scaleY = scaleY + (scaleDirection * 0.01);

      if (
        Math.abs(scaleX - minFactor) < 0.01 ||
        Math.abs(scaleX - maxFactor) < 0.01
      ) {
        scaleDirection *= -1;
      }
    }, 10)
  })
});
