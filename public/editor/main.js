function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('virtualFilesDB', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'name' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Add or update a file in the IndexedDB
function addOrUpdateFile(db, file) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        const request = store.put(file);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

// Retrieve all files from the IndexedDB
function getFiles(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const request = store.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Load a file and emit a custom event
function loadFile(db, fileName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const request = store.get(fileName);
        request.onsuccess = (event) => {
            const file = event.target.result;
            if (file) {
                const saveFunction = () => addOrUpdateFile(db, file) && console.log("saved", file.content);
                const event = new CustomEvent('fileLoaded', {
                    detail: { file, saveFunction }
                });
                document.dispatchEvent(event);
                resolve(file);
            } else {
                reject(new Error('File not found'));
            }
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

openDatabase().then(db=>{
    console.log(db);
    window.addEventListener('message', async msg=>{
        let message = msg.data;
        if(typeof message == "string"){
            let components = message.split(":");
            let header = components[0];
            let file;
            switch (header) {
                case "LoadFile":
                    loadFile(db, components[1]);
                    break;
                case "LoadRemoteFile":
                    await (fetch(components[1]).then(r=> r.text()).then(content=>{
                        components[1] = JSON.stringify({
                            name: components[1].substring(components[1].lastIndexOf("/")),
                            content
                        });
                    }))
                case "LoadStaticFile":
                    let content = JSON.parse(components[1]);
                    file = content
                case "CreateFile":
                    if(!file) file = {
                        name: "Untitled.js",
                        content: `
                        `.trim(),
                    };
                    function saveFunction(){
                        if(header == "CreateFile"){
                            addOrUpdateFile(db, file);
                        }
                    }
                    const event = new CustomEvent('fileLoaded', {
                        detail: { file, saveFunction }
                    });
                    document.dispatchEvent(event);
                    console.log(event)
                    break;
                
                default:
                    break;
            }
        }
    })
    getFiles(db).then((files)=>{
          parent.postMessage("LoadedFiles:"+JSON.stringify(files), "*");
        }    
    );
    parent.postMessage("EditorReady", "*");
});