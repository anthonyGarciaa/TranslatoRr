

const input = document.querySelector(".input_textarea");
const inputSound = document.querySelector(".input_sound");
const outputSound = document.querySelector(".output_sound");
const output = document.querySelector(".output_textarea");
const translate = document.querySelector(".translate");
const invert = document.querySelector(".invert");

const inputLanguages = [
  document.getElementById("input_en"),
  document.getElementById("input_fr"),
  document.getElementById("input_es"),
];
const outputLanguages = [
  document.getElementById("output_en"),
  document.getElementById("output_fr"),
  document.getElementById("output_es"),
];

let inputText ='hola como estas';
let input_language ='es';

let outputText = 'hello, how are you';
let output_language='en';

input.value=inputText;
output.value=outputText;


inputLanguages.map((el) => {
  el.addEventListener("click", () => {
    inputLanguages.map((el) => el.removeAttribute("class"));
    el.setAttribute("class", "active");

    input_language = el.getAttribute("id").slice(6);
  });
});

outputLanguages.map((el) => {
  el.addEventListener("click", () => {
    outputLanguages.map((el) => el.removeAttribute("class"));
    el.setAttribute("class", "active");

    output_language = el.getAttribute("id").slice(7);
  });
});

function manejarInputSound() {
  if (input.value.length > 0) {
    inputSound.removeEventListener("click", manejarInputSound);
    outputSound.removeEventListener("click", manejarOutputSound);
    inputSound.classList.add("activate");

    getAudio(true);
  }
}
function manejarOutputSound() {
  if (output.value.length > 0) {
    outputSound.removeEventListener("click", manejarOutputSound);
    inputSound.removeEventListener("click", manejarInputSound);
    outputSound.classList.add("activate");

    getAudio();
  }
}
inputSound.addEventListener("click", manejarInputSound);
outputSound.addEventListener("click", manejarOutputSound);

input.addEventListener("keyup", () => (inputText = input.value));

function manejarTranslate() {
  translate.removeEventListener("click", manejarTranslate);
  getTraduction(
    input_language,
    output_language,
    false,
  );
}
translate.addEventListener("click", manejarTranslate);

invert.addEventListener("click", () => {
  input.value = output.value;

  inputLanguages.map((el) => el.removeAttribute("class"));
  outputLanguages.map((el) => el.removeAttribute("class"));

  getTraduction(
    input_language,
    output_language,
    true,
  );
});


const getTraduction = async (
  inputL,
  outputL,
  invertTrueOrFalse = false,
) => {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDliZDRlNDUtYjlhMy00N2I3LTg2ZjctMzZiMGFiMzc4Y2E3IiwidHlwZSI6ImFwaV90b2tlbiJ9.UQrYLmRYP1UueA0r0RxIC9I6VggWGN3nPBpreYhxkk8'
    },
    body: JSON.stringify({
      response_as_dict: true, 
      attributes_as_list: false,
      show_original_response: true,
      providers: "google",
      fallback_providers: "microsoft",
      text: inputText,
      source_language: !invertTrueOrFalse?inputL:outputL,
      target_language: !invertTrueOrFalse?outputL:inputL,
    }),
  };

  try {
    const peticion = await fetch(
      "https://api.edenai.run/v2/translation/automatic_translation",
      options
    );
    const response = await peticion.json();
    const json = await response;
    outputText = await json.google.text;
    output.value = await outputText;

    if (invertTrueOrFalse) {
      console.log('Pingaa')
      outputLanguages.map((el) => {
        if (el.getAttribute("id").slice(7) === inputL) {
          el.setAttribute("class", "active");
          output_language=el.getAttribute('id').slice(7)
        }
      });
      inputLanguages.map((el) => {
        if (el.getAttribute("id").slice(6) === outputL) {
          el.setAttribute("class", "active");
          input_language=el.getAttribute("id").slice(6);
        }
      });
    }
    translate.addEventListener("click", manejarTranslate);
  } catch (e) {
    translate.addEventListener("click", manejarTranslate);
  }
};

const getAudio = (isInput = false) => {
  if (isInput ? input.value.length > 0 : output.value.length > 0) {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDliZDRlNDUtYjlhMy00N2I3LTg2ZjctMzZiMGFiMzc4Y2E3IiwidHlwZSI6ImFwaV90b2tlbiJ9.UQrYLmRYP1UueA0r0RxIC9I6VggWGN3nPBpreYhxkk8'
      },
      body: JSON.stringify({
        response_as_dict: true,
        attributes_as_list: false,
        show_original_response: true,
        settings: '{"google" : "google_model", "ibm": "ibm_model"}',
        rate: 0,
        pitch: 0,
        volume: 0,
        sampling_rate: 0,
        providers: "google",
        fallback_providers: "openai",
        language: isInput ? input_language : output_language,
        text: isInput ? input.value : output.value,
        option: "MALE",
      }),
    };

    const afterResponseOrError = () => {
      isInput
        ? inputSound.classList.remove("activate")
        : outputSound.classList.remove("activate");
      inputSound.addEventListener("click", manejarInputSound);
      outputSound.addEventListener("click", manejarOutputSound);
    };

    fetch("https://api.edenai.run/v2/audio/text_to_speech", options)
      .then((response) => response.json())
      .then((response) => {
        document
          .querySelector("audio")
          .setAttribute("src", response.openai.audio_resource_url);
        document.querySelector("audio").setAttribute("autoplay", "");
        afterResponseOrError();
      })
      .catch((err) => {
        afterResponseOrError();
      });
  }
};
