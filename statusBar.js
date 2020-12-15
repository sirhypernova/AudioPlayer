import PlayerManager from "./playerManager";

const GL11 = Java.type("org.lwjgl.opengl.GL11");

export default class StatusBar {
  /**
   *
   * @param {PlayerManager} manager
   */
  constructor(manager) {
    this.manager = manager;

    this.maxWidth = 170;
    this.maxHeight = 15;

    this._posX = Renderer.screen.getWidth() / 2 - this.maxWidth / 2;
    this._posY = Renderer.screen.getHeight() / 2 - this.maxHeight / 2;

    this._posXOffset = manager.config.position.x;
    this._posYOffset = manager.config.position.y;

    this._shouldScrollTrack = false;
    this._scrollPosition = 0;

    let lastScreenWidth = Renderer.screen.getWidth();
    let lastScreenHeight = Renderer.screen.getHeight();
    register("tick", () => {
      let currentWidth = Renderer.screen.getWidth();
      let currentHeight = Renderer.screen.getHeight();
      if (
        lastScreenHeight != currentHeight ||
        lastScreenWidth != currentWidth
      ) {
        this._posX = currentWidth / 2 - this.maxWidth / 2;
        this._posY = currentHeight / 2 - this.maxHeight / 2;
        lastScreenWidth = currentWidth;
        lastScreenHeight = currentHeight;
      }
    });

    register("renderOverlay", () => {
      if (manager.playerGui.gui.isOpen()) return;

      this.draw();
    });

    register("step", () => {
      if (!this._shouldScrollTrack) return;
      if (this.manager.audio.isPaused()) return (this._scrollPosition = 0);
      this._scrollPosition += 0.5;
      if (
        this._scrollPosition >=
        Renderer.getStringWidth("  " + this.manager.trackName)
      )
        this._scrollPosition = 0;
    }).setFps(60);

    let isDragging = false;

    register("guiMouseClick", (x, y, button) => {
      if (!Client.isInChat()) return;
      if (button == 1) return ChatLib.command("audioplayer", true);
      if (button != 0) return;
      let realPosX = this._posX + this._posXOffset;
      let realPosY = this._posY + this._posYOffset;
      if (
        x >= realPosX &&
        x <= realPosX + this.maxWidth &&
        y >= realPosY &&
        y <= realPosY + this.maxHeight
      ) {
        isDragging = true;
      }
    });

    register("dragged", (dx, dy, button, gui, event) => {
      if (!Client.isInChat()) return;
      if (!isDragging) return;
      this._posXOffset += dx;
      this._posYOffset += dy;
    });

    register("guiMouseRelease", () => {
      if (Client.isInChat() && isDragging) {
        isDragging = false;
        manager.config.position.x = this._posXOffset;
        manager.config.position.y = this._posYOffset;
      }
    });
  }

  draw() {
    const sr = new net.minecraft.client.gui.ScaledResolution(
      Client.getMinecraft()
    );
    const scaleFactor = sr.func_78325_e(); // getScaleFactor
    let drawPosX = this._posX + this._posXOffset;
    let drawPosY = this._posY + this._posYOffset;
    Renderer.setDrawMode(GL11.GL_LINE_LOOP);
    GL11.glLineWidth(2);
    Renderer.drawRect(
      Renderer.color(0, 0, 0, 128),
      drawPosX - 1,
      drawPosY - 1,
      this.maxWidth + 2,
      this.maxHeight + 2
    );
    Renderer.drawRect(
      Renderer.color(0, 0, 0, 70),
      drawPosX,
      drawPosY,
      this.maxWidth,
      this.maxHeight
    );
    if (
      this.manager.audio.isPausedOrPlaying() ||
      this.manager.audio.isSeeking()
    ) {
      if (
        this.manager.audio.getEncodedStreamPosition() ==
        this.manager.audio.getTotalBytes()
      ) {
        setTimeout(() => {
          this.manager.audio.stop();
          if (this.manager.config.doLoop) this.manager.audio.play();
        }, 0);
      }
      let width =
        (this.manager.audio.getEncodedStreamPosition() /
          this.manager.audio.getTotalBytes()) *
        this.maxWidth;
      Renderer.drawRect(
        Renderer.color(0, 0, 0, 80),
        drawPosX,
        drawPosY,
        width,
        this.maxHeight
      );
      let trackPosition = this.manager.audio.getPositionInSeconds();
      let trackLength = this.manager.audio.getDurationInSeconds();

      let positionMinutes = Math.floor(trackPosition / 60);
      let positionSeconds = trackPosition % 60;
      if (positionSeconds < 10) positionSeconds = "0" + positionSeconds;

      let lengthMinutes = Math.floor(trackLength / 60);
      let lengthSeconds = trackLength % 60;
      if (lengthSeconds < 10) lengthSeconds = "0" + lengthSeconds;

      let timeDisplay = `${positionMinutes}:${positionSeconds}/${lengthMinutes}:${lengthSeconds}`;
      let timeDisplayLength = Renderer.getStringWidth(timeDisplay);
      this._shouldScrollTrack =
        Renderer.getStringWidth(this.manager.trackName) >
        this.maxWidth - timeDisplayLength - 6;
      Renderer.drawStringWithShadow(
        timeDisplay,
        drawPosX + this.maxWidth - timeDisplayLength - 2,
        drawPosY + this.maxHeight / 2 - 4
      );
      if (!this._shouldScrollTrack) {
        Renderer.drawStringWithShadow(
          this.manager.trackName,
          drawPosX + 2,
          drawPosY + this.maxHeight / 2 - 4
        );
      } else {
        let scissorWidth = this.maxWidth - timeDisplayLength - 6;
        GL11.glEnable(GL11.GL_SCISSOR_TEST);
        GL11.glScissor(
          (drawPosX + 2) * scaleFactor,
          (Renderer.screen.getHeight() - drawPosY - this.maxHeight) *
            scaleFactor,
          scissorWidth * scaleFactor,
          this.maxHeight * scaleFactor
        );
        Renderer.drawStringWithShadow(
          this.manager.trackName,
          drawPosX + 2 - this._scrollPosition,
          drawPosY + this.maxHeight / 2 - 4
        );
        Renderer.drawStringWithShadow(
          this.manager.trackName,
          drawPosX +
            2 -
            this._scrollPosition +
            Renderer.getStringWidth("  " + this.manager.trackName),
          drawPosY + this.maxHeight / 2 - 4
        );
        GL11.glDisable(GL11.GL_SCISSOR_TEST);
      }
    } else {
      let displayText = "No Track";
      Renderer.drawStringWithShadow(
        displayText,
        drawPosX + 2,
        drawPosY + this.maxHeight / 2 - 4
      );
    }
  }
}
