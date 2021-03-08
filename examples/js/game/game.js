const app = new PIXI.Application();
document.body.appendChild(app.view);

const background = PIXI.Sprite.from("examples/assets/bg_button.jpg");
background.width = app.screen.width;
background.height = app.screen.height;

app.stage.addChild(background);

const textureButton = PIXI.Texture.from("examples/assets/button.png");
const textureButtonDown = PIXI.Texture.from("examples/assets/button_down.png");
const textureButtonOver = PIXI.Texture.from("examples/assets/button_over.png");

const buttons = [];

let i = 3;
const button = new PIXI.Sprite(textureButton);

button.anchor.set(0.5);
button.x = 400;
button.y = 510;
button.interactive = true;
button.buttonMode = true;

button
    .on("pointerdown", onButtonDown)
    .on("pointerup", onButtonUp)
    .on("pointerupoutside", onButtonUp)
    .on("pointerover", onButtonOver)
    .on("pointerout", onButtonOut);

app.stage.addChild(button);

buttons.push(button);

function onButtonDown() {
    this.isdown = true;
    this.texture = textureButtonDown;
    this.alpha = 1;
}

function onButtonUp() {
    this.isdown = false;
    if (this.isOver) {
        this.texture = textureButtonOver;
    } else {
        this.texture = textureButton;
    }
}

function onButtonOver() {
    this.isOver = true;
    if (this.isdown) {
        return;
    }
    this.texture = textureButtonOver;
}

function onButtonOut() {
    this.isOver = false;
    if (this.isdown) {
        return;
    }
    this.texture = textureButton;
}

// load spine data
app.loader
    .add("goblins", "examples/assets/pixi-spine/goblins.json")
    .add("spineboy", "examples/assets/pixi-spine/spineboy.json")
    .load(onAssetsLoaded);

app.stage.interactive = true;
app.stage.buttonMode = true;

function addSymbolGoblin(data, res) {
    const goblin1 = new PIXI.spine.Spine(res.goblins.spineData);
    goblin1.skeleton.setSkinByName("goblin");
    goblin1.skeleton.setSlotsToSetupPose();

    goblin1.x = data.x;
    goblin1.y = data.y;
    goblin1.scale.set(0.7);

    goblin1.skeleton.setSkinByName(data.SkinName);
    goblin1.skeleton.setSlotsToSetupPose();

    app.stage.addChild(goblin1);
    return {
        start: () => {
            goblin1.state.setAnimation(0, "walk", true);
        },
        result: () => {
            goblin1.state.setAnimation(0, "walk", false);
        },
        skip: () => {
            goblin1.state.tracks.forEach((r, i) => {
                goblin1.state.clearTrack(i);
            });
        },
    };
}

function addSymbolBoy(data, res) {
    var spineBoy = new PIXI.spine.Spine(res.spineboy.spineData);

    // set the position
    spineBoy.x = data.x;
    spineBoy.y = data.y;

    spineBoy.scale.set(0.7);

    // set up the mixes!
    spineBoy.stateData.setMix("walk", "jump", 0.2);
    spineBoy.stateData.setMix("jump", "walk", 0.4);

    // play animation

    app.stage.addChild(spineBoy);

    return {
        start: () => {
            spineBoy.state.setAnimation(0, "walk", true);
            // spineBoy.state.setAnimation(0, "walk", false);
        },
        result: () => {
            spineBoy.state.setAnimation(0, "jump", false);
            // spineBoy.state.setAnimation(0, "walk", false);
        },
        skip: () => {
            spineBoy.state.tracks.forEach((r, i) => {
                spineBoy.state.clearTrack(i);
            });
        },
    };
}

var currentProcess = "end";

async function* generatorProcess(sumbols) {
    currentProcess = "start";
    console.log(currentProcess);
    sumbols.forEach((row) => {
        row.start();
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    sumbols.forEach((row) => {
        row.skip();
    });
    yield " -- end " + currentProcess;
    //-----------------------------------------------------

    currentProcess = "lines";
    console.log(currentProcess);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    sumbols[0].result();
    sumbols[1].result();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    sumbols[3].result();
    sumbols[4].result();
    sumbols[5].result();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    sumbols[0].skip();
    sumbols[1].skip();
 
    sumbols[3].skip();
    sumbols[4].skip();
    sumbols[5].skip();
    yield " -- end " + currentProcess;
    //-----------------------------------------------------

    currentProcess = "sumbols";
    console.log(currentProcess);
    for (let i = 0; i < sumbols.length; i++) {
        sumbols[i].result();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        sumbols[i].skip();
    }
    yield " -- end " + currentProcess;
    //-----------------------------------------------------
    currentProcess = "end";
    console.log("END generatorProcess");
}

function onAssetsLoaded(loader, res) {
    var sumbols = [
        addSymbolGoblin({ x: 150, y: 250, SkinName: "goblin" }, res),
        addSymbolGoblin({ x: 350, y: 250, SkinName: "goblin" }, res),
        addSymbolGoblin({ x: 550, y: 250, SkinName: "goblingirl" }, res),
        addSymbolBoy({ x: 150, y: 450 }, res),
        addSymbolBoy({ x: 350, y: 450 }, res),
        addSymbolBoy({ x: 550, y: 450 }, res),
    ];

    var generator = null;
    app.stage.on("pointertap", async () => {
 
        if (currentProcess === "end") {
   
            generator = generatorProcess(sumbols);
            for await (var itItem of generator) {
             
            }
        }else {
            if (typeof generator === 'object' ) {
                generator.return('skip');
                generator = null;
                sumbols.forEach((row) => {
                    row.skip();
                });
                currentProcess = "end";
            }
        } 
        //  for (var i = app.stage.children.length - 1; i >= 0; i--) {app.stage.removeChild(app.stage.children[i]);};

        //  goblin.state.data
    });
}
