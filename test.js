const fs = require('fs')
const shell = require('electron').shell

function openFile(filename)
{
    shell.openItem(filename)
}

function goToFile(filename)
{
    shell.showItemInFolder(filename)
}

function getFileName()
{
    return document.getElementById("text").value;
}

function getSelection()
{
    return document.getElementById("choice").value;
}

function writeFile(filename)
{
    var text = document.getElementById("info").value
    //filename = document.getElementById("text").value
    fs.writeFile(filename, text, function(err){
        if(err)
        throw err;

    });
}

function main()
{
    console.log("1 - Open a specified file")
    console.log("2 - Open a specified file")
    input = getSelection()
    switch(input)
    {
        case '1':
        var name = getFileName()
        console.log(name)
        goToFile(name);
        break;
        case '2':
        var name = getFileName()
        console.log(name)
        openFile(name)
        break;
        case '3':
        name = getFileName()
        writeFile(name)
    }
}