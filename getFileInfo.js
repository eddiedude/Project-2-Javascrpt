const fs = require('fs')

//Gets the file size in Bytes.
exports.getFilesizeInBytes = (filename) => {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}

//Reads the data inside the file.
exports.getContents = (path) =>
{ 
    return fs.readFileSync(path,'utf8' ,(err,data) =>{
        if (err)
        throw err;
    });
}