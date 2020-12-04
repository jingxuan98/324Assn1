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
});

setInterval(() => {
  localStorage.setItem("configurations", JSON.stringify(configurations));
}, 500);
