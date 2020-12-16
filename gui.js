import {
  Window,
  UIImage,
  UIText,
  UIContainer,
  RelativeConstraint,
  CenterConstraint,
  ConstantColorConstraint,
  Animations,
  UIBlock,
  PixelConstraint,
  AdditiveConstraint,
  CramSiblingConstraint,
  MaxConstraint,
  ScaledTextConstraint,
  SiblingConstraint,
  UIRoundedRectangle,
  FillConstraint,
  ScrollComponent,
} from "Elementa";

const Color = Java.type("java.awt.Color");
const GL11 = Java.type("org.lwjgl.opengl.GL11");

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

    this.screenWidth = Renderer.screen.getWidth();
    this.screenHeight = Renderer.screen.getHeight();

    this.windowWidth = this.screenWidth / 2;
    this.windowHeight = this.screenHeight * 0.9;

    this.screenXPos = this.screenWidth / 2 - this.windowWidth / 2;
    this.screenYPos = this.screenHeight / 2 - this.windowHeight / 2;

    this.previousBlockColor = false;

    register("tick", () => {
      if (this.GuiKeybind.isPressed()) {
        this.gui.open();
      }
    });

    this.title = new UIText("AudioPlayer")
      .setX((8).pixels())
      .setY((5).pixels())
      .setTextScale((2).pixels());

    this.topLine = new UIBlock(new Color(1, 1, 1, 0.3))
      .setWidth(new RelativeConstraint())
      .setHeight((3).pixels())
      .setY(new AdditiveConstraint(new SiblingConstraint(), (10).pixels()));

    this.trackList = new ScrollComponent()
      .setWidth(new RelativeConstraint())
      .setHeight(new FillConstraint())
      .setY(new SiblingConstraint());

    this.background = new UIRoundedRectangle(2)
      .setColor(new ConstantColorConstraint(new Color(0.1, 0.1, 0.1, 0.75)))
      .setWidth(new RelativeConstraint(0.5))
      .setHeight(new RelativeConstraint(0.9))
      .setX(new CenterConstraint())
      .setY(new CenterConstraint())
      .addChildren(this.title, this.topLine, this.trackList);

    this.window = new Window().addChild(this.background);

    this.gui.registerDraw((x, y) => this.window.draw());
    this.gui.registerClicked((x, y, b) => this.window.mouseClick(x, y, b));
    this.gui.registerMouseDragged((x, y, b) => this.window.mouseDrag(x, y, b));
    this.gui.registerScrolled((x, y, s) => this.window.mouseScroll(s));
    this.gui.registerMouseReleased((x, y, b) => this.window.mouseRelease());

    setTimeout(() => {
      new java.io.File(this.manager.localPath)
        .listFiles()
        .map((f) => f.getName())
        .filter((f) => f.endsWith(".wav"))
        .forEach((f) => this.addTrack(f.slice(0, f.length - 4)));
    }, 0);
  }

  /**
   * Reset the track list
   */
  resetTracks() {
    this.trackList.clearChildren();
  }

  /**
   * Create a track block to be added to the list.
   * @param {String} name
   */
  addTrack(name) {
    this.previousBlockColor = !this.previousBlockColor;
    const block = new UIBlock()
      .setWidth(new RelativeConstraint())
      .setHeight(new RelativeConstraint(0.1))
      .setY(new SiblingConstraint())
      .addChildren(
        new UIContainer()
          .setWidth(new RelativeConstraint(0.95))
          .setHeight(new RelativeConstraint(0.9))
          .setX(new CenterConstraint())
          .setY(new CenterConstraint())
          .addChildren(
            new UIText(name)
              .setTextScale((1).pixels())
              .setY(new CenterConstraint())
          )
      );

    block.onMouseClick((x, y, button) => {
      if (button == 0 && this.manager.trackName != name)
        this.manager.selectTrack(name);
    });

    if (this.previousBlockColor)
      block.setColor(
        new ConstantColorConstraint(new Color(0.1, 0.1, 0.1, 0.5))
      );
    this.trackList.addChild(block);
  }

  /**
   *
   * @param {String} text
   * @returns {UIText}
   */
  createMCButton(text) {
    return new JavaAdapter(
      UIText,
      {
        draw() {
          if (!this.button) {
            this.button = new net.minecraft.client.gui.GuiButton(
              0,
              this.getLeft(),
              this.getTop(),
              this.getWidth(),
              this.getHeight(),
              this.text
            );
          }
          this.button.field_146128_h = this.getLeft();
          this.button.field_146129_i = this.getTop();
          this.button.func_175211_a(this.getWidth());
          this.button.func_146112_a(
            Client.getMinecraft(),
            this.isHovered() ? this.getLeft() : -1,
            this.isHovered() ? this.getTop() : -1
          );
        },
      },
      text
    ).setHeight((20).pixels());
  }
}
