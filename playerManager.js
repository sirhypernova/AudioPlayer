import AudioPlayer from "../AudioAPI";
import PVObject from "../PersistentData";

import PlayerGui from "./gui";

export default class PlayerManager {
  constructor() {
    this.localPath = "./config/ChatTriggers/modules/AudioPlayer/assets";
    this._defaultAudio = new java.io.File(this.localPath + "/audio1.wav");
    this._unpauseAfterLoad = false;

    /**
     * @type {AudioPlayer}
     */
    this.audio = new AudioPlayer();
    this.playerGui = new PlayerGui(this);
    this.config = new PVObject("AudioPlayer", {
      position: {
        x: 0,
        y: 0,
      },
      doLoop: false,
    });
    this.trackName = "audio1";

    register("worldUnload", () => {
      if (audio.isPlaying()) {
        this.audio.pause();
        this._unpauseAfterLoad = true;
      }
    });
    register("worldLoad", () => {
      if (this._unpauseAfterLoad) {
        this._unpauseAfterLoad = false;
        this.audio.resume();
      }
    });
  }

  selectTrack(track) {
    if (this.audio.isPausedOrPlaying()) this.audio.stop();
    setTimeout(() => {
      try {
        let toLoad = new java.io.File(this.localPath + `/${track}.wav`);
        this.audio.open(toLoad);
        setTimeout(() => this.audio.play(), 50);
        this.trackName = track;
      } catch (e) {
        ChatLib.chat(
          "&eUnable to load file. Loaded default song.".replaceFormatting()
        );
        this.audio.open(this._defaultAudio);
        setTimeout(() => {
          this.audio.play();
          this.audio.pause();
        }, 50);
      }
    }, 0);
  }
}
