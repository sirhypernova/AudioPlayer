/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import AudioPlayer from "../AudioAPI";
import {
  Window,
  UIImage,
  UIText,
  UIContainer,
  RelativeConstraint,
  CenterConstraint,
  ConstantColorConstraint,
  Animations,
} from "../Elementa";

import PlayerManager from "./playerManager";
import StatusBar from "./statusBar";

const manager = new PlayerManager();
const statusBar = new StatusBar(manager);

register("command", (arg1, ...arg2) => {
  if (
    !manager.audio.isPausedOrPlaying() &&
    !manager.audio.isStopped() &&
    !manager.audio.isOpened()
  ) {
    if (!arg1) {
      manager.selectTrack("audio1");
    }
  }
  if (arg1) {
    switch (arg1.toLowerCase()) {
      case "loop":
        manager.config.doLoop = !manager.config.doLoop;
        ChatLib.chat(
          `&7Audio Looping ${
            manager.config.doLoop ? "&aEnabled" : "&cDisabled"
          }.`.replaceFormatting()
        );
        break;
      case "seekto":
      case "skipto":
        if (!manager.audio.isPausedOrPlaying()) return;
        let parsedTo = Number(arg2[0]);
        setTimeout(() => {
          if (!isNaN(parsedTo)) manager.audio.seekTo(Math.floor(parsedTo));
        }, 0);
        return;
      case "seek":
      case "skip":
        if (!manager.audio.isPausedOrPlaying()) return;
        let parsed = Number(arg2[0]);
        setTimeout(() => {
          if (!isNaN(parsed)) manager.audio.seekSeconds(Math.floor(parsed));
        }, 0);
        return;
      case "load":
        if (!arg2 || !arg2.length) return;
        let track = arg2.join(" ");
        manager.selectTrack(track);
        break;
    }
    return;
  }
  if (manager.audio.isPaused()) {
    manager.audio.resume();
  } else if (manager.audio.isPlaying()) {
    manager.audio.pause();
  } else if (manager.audio.isStopped()) {
    manager.audio.play();
  }
}).setName("audioplayer");

const GuiKeybind = new KeyBind(
  "Open AudioPlayer Gui",
  Keyboard.KEY_P,
  "AudioPlayer"
);

register("tick", () => {
  if (GuiKeybind.isPressed()) {
    // open gui
    manager.playerGui.open();
  }
});

manager.playerGui.registerDraw((x, y, t) => {
  Renderer.drawRect(
    Renderer.color(0, 0, 0, 70),
    0,
    0,
    Renderer.screen.getWidth(),
    Renderer.screen.getHeight()
  );
});
