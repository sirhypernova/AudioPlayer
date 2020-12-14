/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import AudioPlayer from "../AudioAPI";
import PVObject from "../PersistentData";

const config = new PVObject("AudioPlayer", {
  position: {
    x: 0,
    y: 0,
  },
});

let started = false;

let lastScreenWidth = Renderer.screen.getWidth();
let lastScreenHeight = Renderer.screen.getHeight();

const maxWidth = 170;
const maxHeight = 15;

let posX = Renderer.screen.getWidth() / 2 - maxWidth / 2;
let posY = Renderer.screen.getHeight() / 2 - maxHeight / 2;

let posXOffset = config.position.x;
let posYOffset = config.position.y;

const GL11 = Java.type("org.lwjgl.opengl.GL11");

let audio = new AudioPlayer();
const localPath = "./config/ChatTriggers/modules/AudioPlayer/assets";

let unpauseAfterLoad = false;
register("worldUnload", () => {
  if (audio.isPlaying()) {
    audio.pause();
    unpauseAfterLoad = true;
  }
});
register("worldLoad", () => {
  if (unpauseAfterLoad) {
    unpauseAfterLoad = false;
    audio.resume();
  }
});

register("tick", () => {
  let currentWidth = Renderer.screen.getWidth();
  let currentHeight = Renderer.screen.getHeight();
  if (lastScreenHeight != currentHeight || lastScreenWidth != currentWidth) {
    posX = currentWidth / 2 - maxWidth / 2;
    posY = currentHeight / 2 - maxHeight / 2;
    lastScreenWidth = currentWidth;
    lastScreenHeight = currentHeight;
  }
});

let defaultAudio = new java.io.File(localPath + "/audio1.wav");
let doLoop = false;
let trackName = "audio1";
let shouldScrollTrack = false;
let scrollPosition = 0;

register("command", (arg1, ...arg2) => {
  if (!started) {
    if (!arg1) {
      selectTrack("audio1");
    }
  }
  if (arg1) {
    switch (arg1.toLowerCase()) {
      case "loop":
        doLoop = !doLoop;
        ChatLib.chat(
          `&7Audio Looping ${doLoop ? "&aEnabled" : "&cDisabled"
            }.`.replaceFormatting()
        );
        break;
      case "seekto":
      case "skipto":
        if (!audio.isPausedOrPlaying()) return;
        let parsedTo = Number(arg2[0]);
        setTimeout(() => {
          if (!isNaN(parsedTo)) audio.seekTo(Math.floor(parsedTo));
        }, 0);
        return;
      case "seek":
      case "skip":
        if (!audio.isPausedOrPlaying()) return;
        let parsed = Number(arg2[0]);
        setTimeout(() => {
          if (!isNaN(parsed)) audio.seekSeconds(Math.floor(parsed));
        }, 0);
        return;
      case "load":
        if (!arg2 || !arg2.length) return;
        let track = arg2.join(" ");
        selectTrack(track);
        break;
    }
    return;
  }
  if (audio.isPaused()) {
    audio.resume();
  } else if (audio.isPlaying()) {
    audio.pause();
  } else if (audio.isStopped()) {
    audio.play();
  }
}).setName("audioplayer");

function selectTrack(track) {
  if (audio.isPausedOrPlaying()) audio.stop();
  setTimeout(() => {
    try {
      let toLoad = new java.io.File(localPath + `/${track}.wav`);
      audio.open(toLoad);
      setTimeout(() => audio.play(), 50);
      started = true;
      trackName = track;
    } catch (e) {
      ChatLib.chat(
        "&eUnable to load file. Loaded default song.".replaceFormatting()
      );
      started = true;
      audio.open(defaultAudio);
      setTimeout(() => {
        audio.play();
        audio.pause();
      }, 50);
    }
  }, 0);
}

register("renderOverlay", (event) => {
  if (!started) return;

  const sr = new net.minecraft.client.gui.ScaledResolution(
    Client.getMinecraft()
  );
  const scaleFactor = sr.func_78325_e(); // getScaleFactor
  let drawPosX = posX + posXOffset;
  let drawPosY = posY + posYOffset;
  Renderer.setDrawMode(GL11.GL_LINE_LOOP);
  let boxColor = Renderer.color(0, 0, 0, 128);
  Renderer.drawRect(boxColor, drawPosX - 1, drawPosY - 1, maxWidth + 2, 17);
  Renderer.drawRect(
    Renderer.color(0, 0, 0, 70),
    drawPosX,
    drawPosY,
    maxWidth,
    maxHeight
  );
  if (audio.isPausedOrPlaying() || audio.isSeeking()) {
    if (audio.getEncodedStreamPosition() == audio.getTotalBytes()) {
      setTimeout(() => {
        audio.stop();
        if (doLoop) audio.play();
      }, 0);
    }
    let width =
      (audio.getEncodedStreamPosition() / audio.getTotalBytes()) * maxWidth;
    Renderer.drawRect(
      Renderer.color(0, 0, 0, 80),
      drawPosX,
      drawPosY,
      width,
      maxHeight
    );
    let trackPosition = audio.getPositionInSeconds();
    let trackLength = audio.getDurationInSeconds();

    let positionMinutes = Math.floor(trackPosition / 60);
    let positionSeconds = trackPosition % 60;
    if (positionSeconds < 10) positionSeconds = "0" + positionSeconds;

    let lengthMinutes = Math.floor(trackLength / 60);
    let lengthSeconds = trackLength % 60;
    if (lengthSeconds < 10) lengthSeconds = "0" + lengthSeconds;

    let timeDisplay = `${positionMinutes}:${positionSeconds}/${lengthMinutes}:${lengthSeconds}`;
    let timeDisplayLength = Renderer.getStringWidth(timeDisplay);
    shouldScrollTrack =
      Renderer.getStringWidth(trackName) > maxWidth - timeDisplayLength - 6;
    Renderer.drawStringWithShadow(
      timeDisplay,
      drawPosX + maxWidth - timeDisplayLength - 2,
      drawPosY + maxHeight / 2 - 4
    );
    if (!shouldScrollTrack) {
      Renderer.drawStringWithShadow(
        trackName,
        drawPosX + 2,
        drawPosY + maxHeight / 2 - 4
      );
    } else {
      let scissorWidth = maxWidth - timeDisplayLength - 6;
      GL11.glEnable(GL11.GL_SCISSOR_TEST);
      GL11.glScissor(
        (drawPosX + 2) * scaleFactor,
        (Renderer.screen.getHeight() - drawPosY - maxHeight + 2) * scaleFactor,
        scissorWidth * scaleFactor,
        (maxHeight - 2) * scaleFactor
      );
      Renderer.drawStringWithShadow(
        trackName,
        drawPosX + 2 - scrollPosition,
        drawPosY + maxHeight / 2 - 4
      );
      Renderer.drawStringWithShadow(
        trackName,
        drawPosX +
        2 -
        scrollPosition +
        Renderer.getStringWidth("  " + trackName),
        drawPosY + maxHeight / 2 - 4
      );
      GL11.glDisable(GL11.GL_SCISSOR_TEST);
    }
  } else {
    let displayText = "No Track";
    Renderer.drawStringWithShadow(
      displayText,
      drawPosX + 2,
      drawPosY + maxHeight / 2 - 4
    );
  }
});

register("step", () => {
  if (!shouldScrollTrack) return;
  if (audio.isPaused()) return (scrollPosition = 0);
  scrollPosition += 0.5;
  if (scrollPosition >= Renderer.getStringWidth("  " + trackName))
    scrollPosition = 0;
}).setFps(60);

let isDragging = false;

register("guiMouseClick", (x, y, button) => {
  if (!Client.isInChat()) return;
  if (button == 1) return ChatLib.command("audioplayer", true);
  if (button != 0) return;
  let realPosX = posX + posXOffset;
  let realPosY = posY + posYOffset;
  if (
    x >= realPosX &&
    x <= realPosX + maxWidth &&
    y >= realPosY &&
    y <= realPosY + maxHeight
  ) {
    isDragging = true;
  }
});

register("dragged", (dx, dy, button, gui, event) => {
  if (!Client.isInChat()) return;
  if (!isDragging) return;
  posXOffset += dx;
  posYOffset += dy;
});

register("guiMouseRelease", () => {
  if (Client.isInChat() && isDragging) {
    isDragging = false;
    config.position.x = posXOffset;
    config.position.y = posYOffset;
  }
});
