"use strict";

async function main() {
  try {
    const response = await fetch(
      "https://gist.githubusercontent.com/bertez/2528edb2ab7857dae29c39d1fb669d31/raw/4891dde8eac038aa5719512adee4b4243a8063fd/quiz.json"
    );
    if (!response.ok) {
      throw new Error("No se pudo cargar la información.");
    }
    const dataQuiz = await response.json();

    function shuffle(array) {
      let m = array.length,
        obj,
        rnd;

      while (m) {
        rnd = Math.floor(Math.random() * m--);

        obj = array[m];
        array[m] = array[rnd];
        array[rnd] = obj;
      }

      return array;
    }

    shuffle(dataQuiz);

    let answer1 = document.getElementById("ans1");
    let answer2 = document.getElementById("ans2");
    let answer3 = document.getElementById("ans3");
    let answer4 = document.getElementById("ans4");
    let quest = document.getElementById("questionContent");
    let questNum = document.getElementById("questionNumber");
    let answerElements = [answer1, answer2, answer3, answer4];
    let scores = 0;

    let boxScores = document.getElementById("scores");

    let indexCard = 0;

    //Funcion para mostrar cada tarjeta en pantalla
    function showCard(card) {
      boxScores.textContent = `Your score: ${scores} points`;
      quest.textContent = card.question;
      questNum.textContent = `Question: ${indexCard + 1}/50`;
      answerElements.forEach((element, index = 0) => {
        element.textContent = card.answers[index];
        index++;
      });
      answerElements.forEach((element) => {
        element.addEventListener("click", handleAnswerClick);
      });
    }

    showCard(dataQuiz[indexCard]);

    let audioMain = document.getElementById("mainAudio");
    let audioQuest = document.getElementById("audioQuest");
    let audioCount = document.getElementById("audioCount");
    let audioQuestIncorrect = document.getElementById("audioQuestIncorrect");
    const audio = [audioQuest, audioMain, audioCount, audioQuestIncorrect];
    audio[1].play();
    let btnMute = document.getElementById("mute");
    btnMute.addEventListener("click", function () {
      if (
        audio[0].muted ||
        audio[1].muted ||
        audio[2].muted ||
        audio[3].muted
      ) {
        audio[0].muted = false;
        audio[1].muted = false;
        audio[2].muted = false;
        audio[3].muted = false;
      } else {
        audio[0].muted = true;
        audio[1].muted = true;
        audio[2].muted = true;
        audio[3].muted = true;
      }
    });
    if (btnMute) {
      btnMute.addEventListener("click", () => {
        if (btnMute.src.endsWith("unMute.png")) {
          btnMute.src = "./img/mute.png";
        } else if (btnMute.src.endsWith("mute.png")) {
          btnMute.src = "./img/unMute.png";
        }
      });
    }

    let nIntervId;
    const boxCounter = document.getElementById("counter");
    function activeCounter() {
      let numcounter = 15;
      boxCounter.style.color = "white";
      // comprobar si ya se ha configurado un intervalo
      if (!nIntervId) {
        nIntervId = setInterval(() => {
          boxCounter.textContent = numcounter;
          numcounter--;
          if (numcounter <= 3) {
            audio[2].play();
            boxCounter.style.animation = "flickerCounter 3s";
            setTimeout(() => {
              boxCounter.style.color = "red";
              boxCounter.style.animation = "none";
            }, 500);
          }
          if (numcounter < 0) {
            clearInterval(nIntervId);
            boxCounter.textContent = "TIME OUT!";
            disable();
            setTimeout(() => {
              let paragraphSolution = document.getElementById("solution");
              indexCard++;
              stopCounter();
              activeCounter();
              if (indexCard === 50) {
                let card = document.querySelector("ul");
                boxCounter.remove();
                quest.remove();
                paragraphSolution.remove();
                boxScores.remove();
                card.remove();
                let finalScore = document.createElement("h3");
                finalScore.textContent = `Your final score is ${scores} points!`;
                document.getElementById("card").prepend(finalScore);
                audio[0].muted = true;
                audio[1].muted = true;
                audio[2].muted = true;
                audio[3].muted = true;
              } else {
                showCard(dataQuiz[indexCard]);
              }

              enable();
            }, 2000);
          }
        }, 1000);
      }
    }

    activeCounter();

    function stopCounter() {
      clearInterval(nIntervId);
      // liberar nuestro inervalId de la variable
      nIntervId = null;
    }

    function handleAnswerClick(event) {
      const { correct } = dataQuiz[indexCard];

      const answerElement = event.currentTarget;

      let paragraphSolution = document.getElementById("solution");
      disable();
      answerElement.style.backgroundColor = "orange";
      audio[1].pause();
      audio[2].pause();
      stopCounter();

      setTimeout(() => {
        if (answerElement.textContent === correct) {
          answerElement.style.backgroundColor = "green";
          paragraphSolution.textContent = "Correct! 👍";

          scores += 5;
          audio[0].play();
          setTimeout(() => {
            paragraphSolution.textContent = "";
          }, 2000);
          setTimeout(() => {
            audio[1].play();
          }, 2500);
        } else {
          answerElement.style.backgroundColor = "red";
          paragraphSolution.textContent = "Incorrect! 👎";
          answerElements.find((answerCorrect) => {
            if (answerCorrect.textContent === correct) {
              answerCorrect.style.animation = "flicker 3s";
              setTimeout(() => {
                answerCorrect.style.backgroundColor = "green";
                answerCorrect.style.animation = "none";
              }, 2000);
            }
            setTimeout(() => {
              paragraphSolution.textContent = "";
            }, 2000);
          });

          audio[3].play();

          setTimeout(() => {
            audio[1].play();
          }, 2500);
        }

        setTimeout(() => {
          indexCard++;
          if (indexCard === 50) {
            let card = document.querySelector("ul");
            boxCounter.remove();
            quest.remove();
            paragraphSolution.remove();
            boxScores.remove();
            card.remove();
            let finalScore = document.createElement("h3");
            finalScore.textContent = `Your final score is ${scores} points!`;
            document.getElementById("card").prepend(finalScore);
            audio[0].muted = true;
            audio[1].muted = true;
            audio[2].muted = true;
            audio[3].muted = true;
          } else {
            showCard(dataQuiz[indexCard]);
          }

          enable();
        }, 2000);
      }, 2000);
    }

    //Función para deshabilitar los botones una vez se ha seleccionado una respuesta
    function disable() {
      fifty.setAttribute("disabled", "true");
      for (let element of answerElements) {
        element.style.color = "grey";
        element.setAttribute("disabled", "true");
      }
    }

    //Función para habilitar los botones una vez se ha cambiado la tajeta
    function enable() {
      fifty.removeAttribute("disabled");
      for (let element of answerElements) {
        element.removeAttribute("style");
        element.removeAttribute("disabled");

        activeCounter();
      }
    }

    //Boton 50%
    //----------------------------------------------------------------------
    const fifty = document.getElementById("btn_50");

    fifty.addEventListener("click", () => {
      let incorrect = [];
      let random = Math.floor(Math.random() * 2);

      for (let item of answerElements) {
        if (item.textContent !== dataQuiz[indexCard].correct) {
          incorrect.push(item);
        }
      }

      incorrect.splice(random, 1); //Borramos una de las respuestas incorrectas

      for (let item of incorrect) {
        item.setAttribute("disabled", "true");
        // console.log(item);
      }

      fifty.setAttribute("disabled", "true");
      fifty.style.textDecoration = "line-through";
    });

    //------------------------------------------------------------------------

    //Final function main
  } catch (error) {
    console.error("Data could not be loaded. Please try again later.", error);
  }
}
main();
