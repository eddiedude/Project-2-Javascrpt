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
    this.load.image('star', 'assets/star.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 }); //original 32, 48
}

var platforms;  //Variable for platform
var player;     //Variable for the player.
var portals;    //Variable for the portal.
//var score = 0;  //Variable for the score.
//var scoreText
var theFileArray;
var theDirectory;
var flag = 1;


function create () //Creates() runs when the game starts.
{
    
    this.add.image(575, 367, 'sky'); //Background

    platforms = this.physics.add.staticGroup();
    portals = this.physics.add.staticGroup();
    //stars = this.physics.add.staticGroup();
    //this.add.image(50, 580, 'star');
    //stars.create(50,500, 'star');
    portals.create(1000, 580, 'portal');
    platforms.create(600,700, 'ground').setScale(2).refreshBody();
    platforms.create(300, 500, 'ground');

    player = this.physics.add.sprite(100, 500, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    slimes = this.physics.add.group({
        key: 'slime',
        repeat: pickingRoute(),
        setXY: {
            x: 50,
            y: 0,
            stepX: Phaser.Math.Between(60, 300)
        }
    });

    stars = this.physics.add.group();
    stars.create(50, 580, 'star');
    bombs = this.physics.add.group();
    //portals = this.physics.add.group();
    slimes.children.iterate(function (child){
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
    this.physics.add.collider(slimes, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(stars, player,pickUpStar ,null, this);
    //this.physics.add.collider(player, portals, hitPortal,null, this);
    this.physics.add.overlap(portals, player, hitPortal, null, this);
    this.physics.add.overlap(player, slimes, collectStar, null, this);
    /*
    scoreText = this.add.text(16, 16, 'score: 0', {
        fontSize:'32px',
        fill: '#000'
    });
    */
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

function collectStar(player, slime)
{   
    var RNG = Phaser.Math.Between(0, 1);
    var i = slimes.countActive(true) //Current count of files in the game(slimes).
    slime.disableBody(true, true);   //Deletes the slime

    var thestring = getContents("Portals/"+ theDirectory +"/"+theFileArray[i - 1]);
    putText("Contents of File: " + thestring + "\nThe File Size is: " + getFilesizeInBytes("Portals/"+ theDirectory +"/"+theFileArray[i - 1]) + " Bytes");
    deleteFile("Portals/" + theDirectory + "/" + theFileArray[i - 1]);
    /*
    if(RNG = 1)
    {
        star.disableBody(true, true);   //Deletes the slime

        var thestring = getContents("folder1/"+ theDirectory +"/"+theFileArray[i - 1]);
        putText(thestring);
        deleteFile("folder1/" + theDirectory + "/" + theFileArray[i - 1]);
    }
    else if(RNG = 0)
    {
        copyFile("folder1/"+theDirectory + "/" + theFileArray[i - 1], "folder1/"+theDirectory + "/" + theFileArray[i - 1] +"Copied" +Phaser.Math.Between(0,500));
        var j = 0;
        slimes.children.iterate(function(child){
            //writeFile("folder1/"+theDirectory + "/" +"lol"+ j + ".txt");
            //j++;
            child.enableBody(true, child.x, 0, true, true);
        });
    }
    */
    //score += 10;
    //scoreText.setText('Score: ' + score);

    if(slimes.countActive(true) == 0)
    {
        var i = 0;
        slimes.children.iterate(function(child){
            writeFile("Portals/"+theDirectory + "/" +"lol"+ i + ".txt");
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

//This runs when you touch a portal. When you touch a portal it will create a new random empty directory.
function hitPortal(player, portals)
{
    portals.disableBody(true, true);
    var ranNum = Phaser.Math.Between(0,500);
    newDirectory("Portals/newPortal" + ranNum);
    console.log("touched portal");
}

//Picking UP a star. If picked up a star it will create an empyfile at a random directory.
function pickUpStar(player, star)
{
    var thePortal;
    var list = getDirectory('Portals');
    var num = list.length;
    star.disableBody(true, true);
    randomNum = Phaser.Math.Between(0, num - 1);
    var ranFileNum = Phaser.Math.Between(0, 1000);
    fs.writeFileSync("Portals/" + list[randomNum] + "/emptyFile" + ranFileNum + "", "");
}

//This gets a random directory to start. This runs when you start a new game.
function pickingRoute()
{
    var anArray = getDirectory('Portals');  //Gets the contents of the directory.
    var randomNum = Phaser.Math.Between(0, anArray.length - 1); //Generates random number between the number of portals.
    console.log("Going into: " + anArray[randomNum]);
    theDirectory = anArray[randomNum];
    theFileArray = getDirectory('Portals/' + anArray[randomNum]);
    console.log("There are your enemies: "+ theFileArray);
    return theFileArray.length - 1;
}

//This Run when the player hits the Mushroom
function hitBomb(player, bomb)
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}


//Writes a file to designated directory.
const writeFile = (filename) =>
{

    fs.writeFile(filename, "This file is located at " + filename, function(err){
        if(err)
        throw err;
    });
}

//Copies a file
const copyFile = (targetFile, copyname) =>
{
    fs.copyFileSync(targetFile, copyname);

}

function removeDirectory(path)
{
    fs.unlinkSync(path);
}

//Creates a new Directory
function newDirectory(path)
{
    fs.mkdirSync(path)
}

//Gets the file size in Bytes.
function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}

const deleteFile = (path) =>
{
    var array = getContents(path);
    
    fs.unlinkSync(path);
}


//Gets the entire contents of that folder.
function getDirectory(folder)
{
    return fs.readdirSync(folder);
}


//Reads the data inside the file.
const getContents = (path) =>
{ 
    return fs.readFileSync(path,'utf8' ,(err,data) =>{
        if (err)
        throw err;
    });
}