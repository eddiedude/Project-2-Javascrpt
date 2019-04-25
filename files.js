const fs = require('fs')
const files = require('./getFileInfo.js')

//Writes a file to designated directory.
exports.writeToFile = (filename) =>
{
    fs.writeFile(filename, "This file is located at " + filename, function(err){
        if(err)
        throw err;
    });
}

//Deletes file
exports.deleteFile = (path) =>
{
    var array = files.getContents(path);
    
    fs.unlinkSync(path);
}
