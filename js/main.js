/* global tmi */

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

const COMMAND = "!move";
const IMAGE_WIDTH = 375;
const IMAGE_HEIGHT = 531;
let ELEMENT_IMAGE_PERSON;
let ELEMENT_IMAGE_TARGET;
const MOVE_COUNT_TO_WIN = getRandomNumber(60, 80);
const MAX_PIXEL_MOVED_PERSON_AMOUNT = 1080;
const MOVE_PIXEL_AMOUNT = MAX_PIXEL_MOVED_PERSON_AMOUNT / MOVE_COUNT_TO_WIN;

const STATE = {
  person: {
    imageFrame: 0,
    moveCount: 0
  },
  game: {
    ended: false,
    winTimeout: null
  }
};

function preloadImage(filePath) {
  const image = new Image(IMAGE_WIDTH, IMAGE_HEIGHT);
  image.src = filePath;
  return image.src;
}

const GLITCH_DOMAIN =
  "https://cdn.glitch.com/069ba6f8-5fb3-400c-83bb-f77799551169%2F";
const IMAGES = {
  person: [
    preloadImage(`${GLITCH_DOMAIN}twitch-move-person-1.png?v=1621452557856`),
    preloadImage(`${GLITCH_DOMAIN}twitch-move-person-2.png?v=1621452557930`),
    preloadImage(`${GLITCH_DOMAIN}twitch-move-person-3.png?v=1621452558013`),
    preloadImage(`${GLITCH_DOMAIN}twitch-move-person-2.png?v=1621452557930`)
  ],
  target: {
    outline: preloadImage(
      `${GLITCH_DOMAIN}twitch-move-target-outline.png?v=1621452558183`
    ),
    complete: preloadImage(
      `${GLITCH_DOMAIN}twitch-move-target-complete.png?v=1621452557979`
    )
  }
};

function getURLParamChannel() {
  const params = new URLSearchParams(document.location.search.substring(1));
  return params.get("channel");
}

function connectBotToChannel(channel) {
  const twitchClient = new tmi.Client({
    connection: { reconnect: true },
    channels: [channel]
  });
  twitchClient.connect();
  return twitchClient;
}

async function wait(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

function getCurrentPersonPositionStyle() {
  const movedAmount = STATE.person.moveCount * MOVE_PIXEL_AMOUNT;
  const pixelAmount = MAX_PIXEL_MOVED_PERSON_AMOUNT - movedAmount;
  return `transform: translateX(${pixelAmount}px);`;
}

async function showPersonAndTarget() {
  document.body.innerHTML = `
    <main>
      <img
        alt=""
        src="${IMAGES.target.outline}"
        class="target"
        />
      <img
        alt=""
        src="${IMAGES.person[0]}"
        class="person"
        style="${getCurrentPersonPositionStyle()}"
        />
    </main>
  `;
  ELEMENT_IMAGE_PERSON = document.querySelector(".person");
  ELEMENT_IMAGE_TARGET = document.querySelector(".target");

  await wait(500);
}

function endTheGame({ twitchClient, countdownTimeout }) {
  STATE.game.ended = true;
  if (countdownTimeout) clearTimeout(countdownTimeout);
  twitchClient.disconnect();
}

function animatePerson({ isPersonMovingForward }) {
  if (isPersonMovingForward) {
    STATE.person.imageFrame += 1;
  } else {
    STATE.person.imageFrame -= 1;
  }

  // loop back to the first frame when needed
  if (STATE.person.imageFrame === IMAGES.person.length) {
    STATE.person.imageFrame = 0;
  } else if (STATE.person.imageFrame === -1) {
    // loop to end if gone into negatives
    STATE.person.imageFrame = IMAGES.person.length - 1;
  }
  ELEMENT_IMAGE_PERSON.src = IMAGES.person[STATE.person.imageFrame];
}

function movePerson({ isPersonMovingForward }) {
  if (isPersonMovingForward) {
    STATE.person.moveCount += 1;
  } else {
    STATE.person.moveCount -= 1;
  }

  ELEMENT_IMAGE_PERSON.style = getCurrentPersonPositionStyle();
}

function handleWin(callback) {
  if (STATE.person.moveCount === MOVE_COUNT_TO_WIN) {
    // win
    ELEMENT_IMAGE_TARGET.classList.add("target--complete");

    STATE.game.winTimeout = setTimeout(callback, 1000);
  } else {
    clearTimeout(STATE.game.winTimeout);
    ELEMENT_IMAGE_TARGET.classList.remove("target--complete");
  }
}

function main() {
  const channel = getURLParamChannel();

  // if there's no channel just stop
  if (!channel || channel.length === 0) {
    return;
  }

  const twitchClient = connectBotToChannel(channel);

  twitchClient.on("connected", async () => {
    console.log("connected");

    await showPersonAndTarget();
    document.body.className = "loaded";

    // if they run out of time end the game
    const countdownTimeout = setTimeout(() => {
      console.log("lose");
      endTheGame({ twitchClient });
    }, 35 * 1000); // 30 seconds is the current music, add a few seconds

    twitchClient.on("message", (channel, tags, message) => {
      /*
        if message doesnt start with !move
        or game has ended dont do anything
      */
      if (!message.startsWith(COMMAND) || STATE.game.ended) {
        return;
      }

      console.log("!move");

      // 10% chance of going backward
      const isPersonMovingForward = getRandomNumber(0, 100) < 90;

      movePerson({ isPersonMovingForward });
      animatePerson({ isPersonMovingForward });

      handleWin(() => {
        console.log("win");
        endTheGame({ twitchClient, countdownTimeout });
      });
    });
  });
}

main();
