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
    this.background = new UIRoundedRectangle(2)
      .setColor(new ConstantColorConstraint(new Color(0.1, 0.1, 0.1, 0.75)))
      .setWidth(new RelativeConstraint(0.5))
      .setHeight(new RelativeConstraint(0.9))
      .setX(new CenterConstraint())
      .setY(new CenterConstraint())
      .addChildren(
        this.title,
        this.topLine,
        new UIContainer()
          .setWidth(new RelativeConstraint())
          .setHeight(new FillConstraint())
          .setY(new SiblingConstraint())
          .addChildren(
            new UIBlock()
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
                    new UIText("Track Name")
                      .setTextScale((1).pixels())
                      .setY(new CenterConstraint())
                  )
              ),
            new UIBlock(new Color(0.1, 0.1, 0.1, 0.4))
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
                    new UIText("Track Name")
                      .setTextScale((1).pixels())
                      .setY(new CenterConstraint())
                  )
              ),
            new UIBlock()
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
                    new UIText("Track Name")
                      .setTextScale((1).pixels())
                      .setY(new CenterConstraint())
                  )
              ),
            new UIBlock(new Color(0.1, 0.1, 0.1, 0.4))
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
                    new UIText("Track Name")
                      .setTextScale((1).pixels())
                      .setY(new CenterConstraint())
                  )
              )
          )
      );

    this.window = new Window().addChild(this.background);

    this.gui.registerDraw(this.draw.bind(this));
  }

  draw(x, y, p) {
    this.window.draw();
  }
}
