export default class PlayerGUI {
  /**
   *
   * @param {import('./playerManager').default} manager
   */
  constructor(manager) {
    this.manager = manager;
    this.gui = new Gui();

    this.GuiKeybind = new KeyBind(
      "Open AudioPlayer Gui",
      Keyboard.KEY_P,
      "AudioPlayer"
    );

    register("tick", () => {
      if (this.GuiKeybind.isPressed()) {
        // open gui
        this.gui.open();
      }
    });

    this.gui.registerDraw((x, y, t) => {
      Renderer.drawRect(
        Renderer.color(0, 0, 0, 70),
        0,
        0,
        Renderer.screen.getWidth(),
        Renderer.screen.getHeight()
      );
    });
  }
}
