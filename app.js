let configurations = {
  subdivisions: 1,
  colour_solid: {
    face_1: 0,
    face_2: 0,
    face_3: 0,
    face_4: 0,
  },
  colour_gradient: {
    face_1: [],
    face_2: [],
    face_3: [],
    face_4: [],
  },
  background_colour: 0,
  iterations: 1,
  speed: "normal",
  rotation_axis: "x",
  rotation_angle: {
    x: 0,
    y: 0,
    z: 0,
  },
  translation_axis: "x",
  translation_magnitude: {
    x: 0,
    y: 0,
    z: 0,
  },
  scaling_axis: "x",
  scaling_factor: {
    x: 1,
    y: 1,
    z: 1,
  },
};

let animation = false;
let animationData = {};

const handleSubdivisionsInput = () => {
  let subdivisionsInput = document.getElementById("subdivisions");
  let subdivisionsValue = document.getElementById("subdivisions-value");

  subdivisionsInput.value = configurations.subdivisions;
  subdivisionsValue.innerHTML = subdivisionsInput.value;

  subdivisionsInput.addEventListener("input", () => {
    configurations.subdivisions = Number.parseInt(subdivisionsInput.value);
    subdivisionsValue.innerHTML = subdivisionsInput.value;
  });
};

const handleIterationsInput = () => {
  let iterationsInput = document.getElementById("iterations");
  let iterationsValue = document.getElementById("iterations-value");

  iterationsInput.value = configurations.iterations;
  iterationsValue.innerHTML = iterationsInput.value;

  iterationsInput.addEventListener("input", () => {
    configurations.iterations = Number.parseInt(iterationsInput.value);
    iterationsValue.innerHTML = iterationsInput.value;
  });
};

const handleSpeedInput = () => {
  let speedInput = document.getElementById("speed");

  speedInput.value = configurations.speed;

  speedInput.addEventListener("input", () => {
    configurations.speed = speedInput.value;
  });
};

const handleAxisRangeInput = (opts) => {
  let input = document.getElementById(opts.inputId);
  let valueDisplay = document.getElementById(opts.valueId);
  let axisInput = document.getElementsByName(opts.axisInputName);

  let axis = configurations[opts.axisKey];
  let value = configurations[opts.valueKey];

  for (let axisOption of axisInput) {
    if (axisOption.value == axis) {
      axisOption.checked = true;
    }

    axisOption.addEventListener("input", () => {
      if (axisOption.checked) {
        configurations[opts.axisKey] = axisOption.value;
        // Must update the local variable to reflect the latest value
        axis = configurations[opts.axisKey];
      }

      input.value = value[axis];
      valueDisplay.innerHTML = input.value;
    });
  }

  input.value = value[axis];
  valueDisplay.innerHTML = input.value;

  input.addEventListener("input", () => {
    value[axis] = Number.parseFloat(input.value);
    valueDisplay.innerHTML = input.value;
  });
};

function animate() {
  console.log("animate");
  animation = true;
  animationData = JSON.parse(JSON.stringify(configurations));

  let completeness = {
    rotation: false,
    scaling: false,
    translation: false,
  };

  const { rotation_angle: theta } = animationData;

  let minTheta = {
    x: -Math.abs(theta.x),
    y: -Math.abs(theta.y),
    z: -Math.abs(theta.z),
  };

  let maxTheta = {
    x: Math.abs(theta.x),
    y: Math.abs(theta.y),
    z: Math.abs(theta.z),
  };

  let rotateDirection = {
    x: Math.sign(theta.x),
    y: Math.sign(theta.y),
    z: Math.sign(theta.z),
  };

  let rotationCheckpoint = {
    x: 0,
    y: 0,
    z: 0,
  };

  theta.x = 0;
  theta.y = 0;
  theta.z = 0;

  let rotationInterval = setInterval(() => {
    if (completeness.rotation) {
      clearInterval(rotationInterval);
      return;
    }

    // Change the theta value if the rotation is incomplete
    if (rotationCheckpoint.x < 4) {
      theta.x += rotateDirection.x * 1;
    }

    if (rotationCheckpoint.y < 4) {
      theta.y += rotateDirection.y * 1;
    }

    if (rotationCheckpoint.z < 4) {
      theta.z += rotateDirection.z * 1;
    }

    // A complete rotation should hit the origin twice
    if (theta.x == 0) {
      rotationCheckpoint.x += 1;
    }

    if (theta.y == 0) {
      rotationCheckpoint.y += 1;
    }

    if (theta.z == 0) {
      rotationCheckpoint.z += 1;
    }

    if (theta.x == minTheta.x || theta.x == maxTheta.x) {
      rotateDirection.x *= -1;
      rotationCheckpoint.x += 1;
    }

    if (theta.y == minTheta.y || theta.y == maxTheta.y) {
      rotateDirection.y *= -1;
      rotationCheckpoint.y += 1;
    }

    if (theta.z == minTheta.z || theta.z == maxTheta.z) {
      rotateDirection.z *= -1;
      rotationCheckpoint.z += 1;
    }

    // A complete rotation needs to reach minimum theta, origin, maximum theta,
    // and back to the origin
    if (
      rotationCheckpoint.x >= 4 &&
      rotationCheckpoint.y >= 4 &&
      rotationCheckpoint.z >= 4
    ) {
      completeness.rotation = true;
    }
  }, 10);

  const { scaling_factor: factor } = animationData;

  const initialFactor = 1;

  // prettier-ignore
  let minFactor = {
    x: factor.x < initialFactor ? factor.x : initialFactor - (factor.x - initialFactor),
    y: factor.y < initialFactor ? factor.y : initialFactor - (factor.y - initialFactor),
    z: factor.z < initialFactor ? factor.z : initialFactor - (factor.z - initialFactor),
  }

  // prettier-ignore
  let maxFactor = {
    x: factor.x > initialFactor ? factor.x : initialFactor + (initialFactor - factor.x),
    y: factor.y > initialFactor ? factor.y : initialFactor + (initialFactor - factor.y),
    z: factor.z > initialFactor ? factor.z : initialFactor + (initialFactor - factor.z),
  };

  let scaleDirection = {
    x: factor.x < initialFactor ? -1 : 1,
    y: factor.y < initialFactor ? -1 : 1,
    z: factor.z < initialFactor ? -1 : 1,
  };

  let scaleCheckpoint = {
    x: 0,
    y: 0,
    z: 0,
  };

  factor.x = initialFactor;
  factor.y = initialFactor;
  factor.z = initialFactor;

  let scalingInterval = setInterval(() => {
    if (!completeness.rotation) {
      return;
    }

    if (completeness.scaling) {
      clearInterval(scalingInterval);
      return;
    }

    if (scaleCheckpoint.x < 4) {
      factor.x += scaleDirection.x * 0.01;
    }

    if (scaleCheckpoint.y < 4) {
      factor.y += scaleDirection.y * 0.01;
    }

    if (scaleCheckpoint.z < 4) {
      factor.z += scaleDirection.z * 0.01;
    }

    if (Math.abs(factor.x - initialFactor) < 0.01) {
      scaleCheckpoint.x += 1;
    }

    if (Math.abs(factor.y - initialFactor) < 0.01) {
      scaleCheckpoint.y += 1;
    }

    if (Math.abs(factor.z - initialFactor) < 0.01) {
      scaleCheckpoint.z += 1;
    }

    if (factor.x - minFactor.x < 0.01 || maxFactor.x - factor.x < 0.01) {
      scaleDirection.x *= -1;
      scaleCheckpoint.x += 1;
    }

    if (factor.y - minFactor.y < 0.01 || maxFactor.y - factor.y < 0.01) {
      scaleDirection.y *= -1;
      scaleCheckpoint.y += 1;
    }

    if (factor.z - minFactor.z < 0.001 || maxFactor.z - factor.z < 0.001) {
      scaleDirection.z *= -1;
      scaleCheckpoint.z += 1;
    }

    if (
      scaleCheckpoint.x >= 4 &&
      scaleCheckpoint.y >= 4 &&
      scaleCheckpoint.z >= 4
    ) {
      completeness.scaling = true;
    }
  }, 10);
}

window.addEventListener("load", () => {
  let savedConfigurations = localStorage.getItem("configurations");

  if (savedConfigurations) {
    configurations = JSON.parse(savedConfigurations);
  }

  handleSubdivisionsInput();
  handleIterationsInput();
  handleSpeedInput();

  let opts = [
    {
      inputId: "rotation",
      valueId: "rotation-value",
      axisInputName: "rotation-axis",
      axisKey: "rotation_axis",
      valueKey: "rotation_angle",
    },
    {
      inputId: "translation",
      valueId: "translation-value",
      axisInputName: "translation-axis",
      axisKey: "translation_axis",
      valueKey: "translation_magnitude",
    },
    {
      inputId: "scaling",
      valueId: "scaling-value",
      axisInputName: "scaling-axis",
      axisKey: "scaling_axis",
      valueKey: "scaling_factor",
    },
  ];

  for (let opt of opts) {
    handleAxisRangeInput(opt);
  }

  let animateButton = document.getElementById("animate");
  animateButton.addEventListener("click", () => {
    animate();
  });

  // Initialize WebGL canvas after all configurations are populated
  init();
});

setInterval(() => {
  localStorage.setItem("configurations", JSON.stringify(configurations));
}, 500);
