const fs = require('fs')

//removes a random directory
exports.removeDirectory = (path) => {
    fs.rmdirSync(path);
}
exports.getDirectory = (folder) =>{
    return fs.readdirSync(folder);
}

//Creates a new Directory
exports.newDirectory = (path) => {
    fs.mkdirSync(path);
}
