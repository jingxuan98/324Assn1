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
  iterations: 10,
  speed: "normal",
  rotation_axis: "x",
  rotation_angle: {
    x: 0,
    y: 0,
    z: -180,
  },
  translation_axis: "x",
  translation_magnitude: {
    x: -3.5,
    y: -3.5,
    z: 0,
  },
  scaling_axis: "x",
  scaling_factor: {
    x: 2,
    y: 2,
    z: 1,
  },
};

let animation = false;
let animationIterations = 0;
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
  animation = true;
  animationData = JSON.parse(JSON.stringify(configurations));

  let completeness = {
    rotation: false,
    scaling: false,
    translation: false,
  };

  const speed = {
    very_fast: 1,
    fast: 5,
    normal: 10,
    slow: 15,
    very_slow: 20,
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
  }, speed[animationData.speed]);

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
      factor.x += scaleDirection.x * 0.02;
    }

    if (scaleCheckpoint.y < 4) {
      factor.y += scaleDirection.y * 0.02;
    }

    if (scaleCheckpoint.z < 4) {
      factor.z += scaleDirection.z * 0.02;
    }

    if (Math.abs(factor.x - initialFactor) < 0.001) {
      scaleCheckpoint.x += 1;
    }

    if (Math.abs(factor.y - initialFactor) < 0.001) {
      scaleCheckpoint.y += 1;
    }

    if (Math.abs(factor.z - initialFactor) < 0.001) {
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

    if (factor.z - minFactor.z < 0.01 || maxFactor.z - factor.z < 0.01) {
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
  }, speed[animationData.speed]);

  const { translation_magnitude: translation } = animationData;

  let minTranslation = {
    x: -Math.abs(translation.x),
    y: -Math.abs(translation.y),
    z: -Math.abs(translation.z),
  };

  let maxTranslation = {
    x: Math.abs(translation.x),
    y: Math.abs(translation.y),
    z: Math.abs(translation.z),
  };

  let translateDirection = {
    x: Math.sign(translation.x),
    y: Math.sign(translation.y),
    z: Math.sign(translation.z),
  };

  let translationCheckpoint = {
    x: 0,
    y: 0,
    z: 0,
  };

  translation.x = 0;
  translation.y = 0;
  translation.z = 0;

  let translationInterval = setInterval(() => {
    if (!completeness.rotation || !completeness.scaling) {
      return;
    }

    if (completeness.translation) {
      clearInterval(translationInterval);
      return;
    }

    if (translationCheckpoint.x < 4) {
      translation.x += translateDirection.x * 0.02;
    }

    if (translationCheckpoint.y < 4) {
      translation.y += translateDirection.y * 0.02;
    }

    if (translationCheckpoint.z < 4) {
      translation.z += translateDirection.z * 0.02;
    }

    if (Math.abs(translation.x) < 0.001) {
      translationCheckpoint.x += 1;
    }

    if (Math.abs(translation.y) < 0.001) {
      translationCheckpoint.y += 1;
    }

    if (Math.abs(translation.z) < 0.001) {
      translationCheckpoint.z += 1;
    }

    if (
      translation.x - minTranslation.x < 0.01 ||
      maxTranslation.x - translation.x < 0.01
    ) {
      translateDirection.x *= -1;
      translationCheckpoint.x += 1;
    }

    if (
      translation.y - minTranslation.y < 0.01 ||
      maxTranslation.y - translation.y < 0.01
    ) {
      translateDirection.y *= -1;
      translationCheckpoint.y += 1;
    }

    if (
      translation.z - minTranslation.z < 0.01 ||
      maxTranslation.z - translation.z < 0.01
    ) {
      translateDirection.z *= -1;
      translationCheckpoint.z += 1;
    }

    if (
      translationCheckpoint.x >= 4 &&
      translationCheckpoint.y >= 4 &&
      translationCheckpoint.z >= 4
    ) {
      completeness.translation = true;
    }
  }, speed[animationData.speed]);

  let animationInterval = setInterval(() => {
    if (!animation) {
      clearInterval(rotationInterval);
      clearInterval(scalingInterval);
      clearInterval(translationInterval);
      clearInterval(animationInterval);
    }

    if (
      completeness.rotation &&
      completeness.scaling &&
      completeness.translation
    ) {
      animationIterations++;
      animation = false;
      clearInterval(animationInterval);

      if (animationIterations < animationData.iterations) {
        animate();
      }
    }
  }, 500);
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
  animateButton.addEventListener("click", (e) => {
    if (animation) {
      animation = false;
      e.target.innerHTML = "Start";
      return;
    }

    animationIterations = 0;
    animate();
    e.target.innerHTML = "Stop";
  });

  let content = document.getElementById("content");
  let canvas = document.getElementById("gl-canvas");
  canvas.width = content.offsetHeight - 32;
  canvas.height = canvas.width;

  // Initialize WebGL canvas after all configurations are populated
  init();
});

setInterval(() => {
  localStorage.setItem("configurations", JSON.stringify(configurations));
}, 500);
