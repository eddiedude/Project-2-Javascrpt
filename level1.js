const fs = require('fs')
var files = require("./files.js")
var getinfo = require("./getFileInfo.js")
var directories = require("./directories.js")


//Configuration for the game.
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
    this.load.image('mushroom', 'assets/mushmom.png');
    this.load.image('slime', 'assets/slimeresize.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('potion', 'assets/potion.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 }); //original 32, 48
}

var platforms;  //Variable for platform
var player;     //Variable for the player.
var portals;    //Variable for the portal.
var theFileArray;
var theDirectory;


function create () //Creates() runs when the game starts.
{
    
    this.add.image(575, 367, 'sky'); //Background

    platforms = this.physics.add.staticGroup();
    portals = this.physics.add.staticGroup();
    portals.create(1000, 580, 'portal');

    //Create platforms
    platforms.create(600,700, 'ground').setScale(2).refreshBody();
    platforms.create(300, 500, 'ground');
    platforms.create(1200, 400, 'ground');


    potions = this.physics.add.group();
    potions.create(1100, 100, 'potion');


    player = this.physics.add.sprite(100, 500, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    slimes = this.physics.add.group({
        key: 'slime',
        repeat: pickingRoute(),
        setXY: {
            x: 50,
            y: 0,
            stepX: Phaser.Math.Between(60, 200)
        }
    });

    stars = this.physics.add.group();
    stars.create(50, 580, 'star');

    mushrooms = this.physics.add.group();

    slimes.children.iterate(function (child){
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    //Sprite Animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ], 
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //Set colliders
    this.physics.add.collider(mushrooms, platforms);
    this.physics.add.collider(player, mushrooms, hitMushrooms, null, this);
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(slimes, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(potions, platforms);
    this.physics.add.overlap(stars, player,pickUpStar ,null, this);
    this.physics.add.overlap(potions, player, pickUpPotion, null, this);
    this.physics.add.overlap(portals, player, hitPortal, null, this);
    this.physics.add.overlap(player, slimes, touchSlime, null, this);

    //Enables arrows keys for   ontrol.
    cursor = this.input.keyboard.createCursorKeys();
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

//Runs when user touches a slime. Deletes the file
//Also displays information such as filesize and its contents.
function touchSlime(player, slime)
{   
    var RNG = Phaser.Math.Between(0, 1);
    var i = slimes.countActive(true) //Current count of files in the game(slimes).
    slime.disableBody(true, true);   //Deletes the slime
    var thestring = getinfo.getContents("Portals/"+ theDirectory +"/"+theFileArray[i - 1]);
    putText("Deleted File\nContents of File: " + thestring + "\nThe File Size is: " + getinfo.getFilesizeInBytes("Portals/"+ theDirectory +"/"+theFileArray[i - 1]) + " Bytes");
    files.deleteFile("Portals/" + theDirectory + "/" + theFileArray[i - 1]);

    if(slimes.countActive(true) == 0)
    {
        var i = 0;
        slimes.children.iterate(function(child){
            files.writeToFile("Portals/"+theDirectory + "/" +"lol"+ i + ".txt");
            i++;
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0,400);

        var mushroom = mushrooms.create(x, 16, 'mushroom');
        mushroom.setBounce(1);
        mushroom.setCollideWorldBounds(true);
        mushroom.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

//This runs when you touch a portal. When you touch a portal it will create a new random empty directory.
function hitPortal(player, portals)
{
    portals.disableBody(true, true);
    var ranNum = Phaser.Math.Between(0,500);
    directories.newDirectory("Portals/newPortal" + ranNum);
    putText("Created Empty Directory newPortal" + ranNum);
}

//Picking UP a star. If picked up a star it will create an empyfile at a random directory.
function pickUpStar(player, star)
{
    var list = directories.getDirectory('Portals');
    var num = list.length;
    star.disableBody(true, true);
    randomNum = Phaser.Math.Between(0, num - 1);
    var ranFileNum = Phaser.Math.Between(0, 1000);
    fs.writeFileSync("Portals/" + list[randomNum] + "/emptyFile" + ranFileNum + "", "");
}

//This gets a random directory to start. This runs when you start a new game.
function pickingRoute()
{
    var anArray = directories.getDirectory('Portals');  //Gets the contents of the directory.
    var randomNum = Phaser.Math.Between(0, anArray.length - 1); //Generates random number between the number of portals.
    theDirectory = anArray[randomNum];
    theFileArray = directories.getDirectory('Portals/' + anArray[randomNum]);
    putText("You are in " + anArray[randomNum] + ".\tThese are your enemies: " + theFileArray);
    return theFileArray.length - 1;
}

//Runs when user touches a potion. Deletes all Empty Directories.
function pickUpPotion(player, potion)
{
    var flag = 0;
    var list = directories.getDirectory('Portals');
    var num = list.length;
    console.log(list);
    potion.disableBody(true, true);
    for(i = 0; i < num; i++)
    {

        var answer = directories.getDirectory("Portals/" + list[i]).length
        if(answer == 0)
        {
            console.log(list[i] + " is empty");
            putText("All empty directories are deleted in directory 'Portals'");
            directories.removeDirectory("Portals/" + list[i]);
            flag = 1;
        }
        else if(flag == 0)
        {
            putText("There are no empty Directories to delete");
        }
    }
}


//This Run when the player hits the Mushrooms
function hitMushrooms(player, mushroom)
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}