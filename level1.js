const fs = require('fs')


var config = {
    type: Phaser.AUTO,
    width: 1150,
    height: 733,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config); //creates the game

function putText(text) //Displays text at the bottom of the game.
{
    if(document.getElementsByTagName("P")[0] == undefined)
    {
        var node = document.createElement("P");
        var textnode = document.createTextNode(text);         
        node.appendChild(textnode);                              
        document.getElementsByTagName("canvas")[0].insertAdjacentElement("afterend",node);
    }
    else
    {
        document.getElementsByTagName("P")[0].innerText = text;
    }
}

function preload () //Preloads images for use.
{
    this.load.image('sky', 'assets/background.png');
    this.load.image('ground', 'assets/msplatform.png');
    this.load.image('portal', 'assets/portal.png');
    this.load.image('bomb', 'assets/mushmom.png');
    this.load.image('slime', 'assets/slimeresize.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 }); //original 32, 48
}
var platforms;  //Variable for platform
var player;     //Variable for the player.
var portals;    //Variable for the portal.
var score = 0;  //Variable for the score.
var scoreText
var theFileArray;
var theDirectory;
var flag = 1;


function create () //Creates() runs when the game starts.
{
    
    this.add.image(575, 367, 'sky');

    platforms = this.physics.add.staticGroup();
    portals = this.physics.add.staticGroup();

    portals.create(1000, 580, 'portal');
    platforms.create(600,700, 'ground').setScale(2).refreshBody();
    platforms.create(300, 500, 'ground');

    player = this.physics.add.sprite(100, 500, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    stars = this.physics.add.group({
        key: 'slime',
        repeat: pickingRoute(),
        setXY: {
            x: 50,
            y: 0,
            stepX: Phaser.Math.Between(60, 300)
        }
    });

    bombs = this.physics.add.group();
    //portals = this.physics.add.group();
    stars.children.iterate(function (child){
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ], //original 4
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //Set colliders
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    //this.physics.add.collider(player, portals, hitPortal,null, this);
    this.physics.add.overlap(portals, player, hitPortal, null, this);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'score: 0', {
        fontSize:'32px',
        fill: '#000'
    });

    cursor = this.input.keyboard.createCursorKeys();
    putText("hello")
}

function update ()
{
    if(cursor.left.isDown)
    {
        player.setVelocityX(-160);
        player.anims.play('left',true);
    }
    else if(cursor.right.isDown)
    {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if(cursor.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

function collectStar(player, star)
{   
    var i = stars.countActive(true) //Current count of files in the game(slimes).
    star.disableBody(true, true);   //Deletes the slime

    var thestring = getContents("folder1/"+ theDirectory +"/"+theFileArray[i - 1]);
    putText(thestring);
    deleteFile("folder1/" + theDirectory + "/" + theFileArray[i - 1]);

    score += 10;
    scoreText.setText('Score: ' + score);

    if(stars.countActive(true) == 0)
    {
        var i = 0;
        stars.children.iterate(function(child){
            writeFile("folder1/"+theDirectory + "/" +"lol"+ i + ".txt");
            i++;
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0,400);

        var bomb = bombs.create(x, 16, 'bomb');
        //portal = portals.create(100, 580, 'portal');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

function hitPortal(player, portals)
{
    //var portal;
    //create(100, 580, 'portal');
    portals.disableBody(true, true);
    newDirectory('folder1/newPortal');
    //portals.create(100, 580, 'portal');
    //var portal = portals.create(100, 580, 'portal');
    //portal.disableBody(true, true);
    //portal.create(100, 580, 'portal');
    console.log("touched portal");
}

function pickingRoute()
{
    var anArray = getDirectory('folder1');  //Gets the contents of the directory.
    var randomNum = Phaser.Math.Between(0, anArray.length - 1); //Generates random number between the number of portals.
    console.log("Going into: " + anArray[randomNum]);
    theDirectory = anArray[randomNum];
    theFileArray = getDirectory('folder1/' + anArray[randomNum]);
    console.log("There are your enemies: "+ theFileArray);
    return theFileArray.length - 1;
}

function hitBomb(player, bomb)
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}


const writeFile = (filename) =>
{

    fs.writeFile(filename, "This file is located at " + filename, function(err){
        if(err)
        throw err;
    });
}

const copyFile = (targetFile, copyname) =>
{
    fs.copyFile(targetFile, copyname, (err) => {
        if (err)
        {
            throw err;
        }
        console.log(targetFile + " was copied to " + copyname);
    })
}

function newDirectory(path)
{
    fs.mkdirSync(path)
}

const deleteFile = (path) =>
{
    var array = getContents(path);
    
    fs.unlinkSync(path);
}

function getDirectory(folder)
{
    return fs.readdirSync(folder);
}

const getContents = (path) =>
{ 
    return fs.readFileSync(path,'utf8' ,(err,data) =>{
        if (err)
        throw err;
    });
}