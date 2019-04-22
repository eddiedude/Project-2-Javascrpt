console.log("main process working");

const electron = require('electron');
const app = electron.app;
const Browserwindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');


let win;

function createWindow(){
    win = new Browserwindow();
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));

    win.on('close',() =>{
        win = null;
    })

}

app.on('ready', createWindow);


// app.on('window-all-closed', () =>{
//     if(win == null)
//     {
//         createWindow()
//     }
// });
