export class Panel extends HTMLElement {
    constructor(){
        super();

    }
    connectedCallback(){
        const shaddow = this.attachShadow({mode:"open"});
        shaddow.innerHTML = `
        <h1 class="ubuntu-regular">Project Settings</h1>
        <div class="row ubuntu-regular">
            <div class="column pre-processors">
                <h2>Preprocessors<button id="add-processor">+</button></h2>
                <ol>
                </ol>
            </div>
            <div class="column editor">
                <div class="proprocessor--tabs"><button>Editor</button><button>Settings</button></div>
                <div class="proprocessor--tabs-containers --content-hidden">
                    <div id="editor-target"></div>
                    <div id="preprocessor-settings">
                        <div class="settings-item-wrapper">
                            <div class="settings-item-wrapper">
                                <label>Enabled on Project</label>
                                <input type="checkbox" id="enabled-on-project">
                            </div>
                            <label>Area of Effect: </label>
                                <select id="area-of-effect">
                                    <option>Workspace</option>
                                    <option>Zone</option>  
                                </select>
                            </div>
                            <div class="area-settings-panel">
                                <h4>Zone Configuration</h4>
                                <div class="settings-item-wrapper">
                                <label>Display Name: </label>
                                <input id="display-name">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        shaddow.adoptedStyleSheets.push(loadStyle("/styles/main.css"));
        shaddow.adoptedStyleSheets.push(globalTheme);
        shaddow.adoptedStyleSheets.push(loadStyle("/styles/settings.css"));
        shaddow.adoptedStyleSheets.push(loadStyle("/styles/ubuntu.css"));
        shaddow.adoptedStyleSheets.push(loadStyle("/Ubuntu/Ubuntu-Regular.ttf"));
        
        let loadedFile;

        function fileLoaded(file){
            loadedFile = file;
        }

        function refreshFilesList(localFiles){
            const staticFiles = [{static:true,name:"auto-splitters.ts"}, {static:true,name:"precision-zones.ts"}];
            const fileItemsTarget = shaddow.querySelector(".pre-processors ol");
            function createFileItem(file){
                const fileItem = document.createElement("li");
                const button = document.createElement("button");
                fileItem.appendChild(button);
                button.innerText = file.name;
                fileItem.addEventListener("click", function(ev){
                    fileLoaded(file);
                    if(file.static){
                        editorIframe.contentWindow.postMessage("LoadRemoteFile:editor/static_processors/"+file.name);
                    }else{
                        editorIframe.contentWindow.postMessage("LoadFile:"+file.name);
                    }
                    if(!file.metadata) file.metadata = {

                    };
                    const container  = obj2ui(file.metadata);
                    shaddow.querySelector("#settings-target").appendChild(container);
                    shaddow.querySelector(".--selected").classList.remove("--selected");
                    fileItem.classList.add("--selected");
                });
                return fileItem;
            }
            for (let i = 0; i < staticFiles.length; i++) {
                fileItemsTarget.appendChild(createFileItem(staticFiles[i]));
                if(i==0){
                    fileLoaded(staticFiles[i])
                    fileItemsTarget.firstElementChild.classList.add("--selected");
                    editorIframe.contentWindow.postMessage("LoadRemoteFile:editor/static_processors/"+staticFiles[i].name);
                }
            }
            for (let i = 0; i < localFiles.length; i++) {
                fileItemsTarget.appendChild(createFileItem(localFiles[i]));
                // if(i==0){
                //     fileItemsTarget.firstElementChild.classList.add("--selected");
                // }
            }
        }

        const saveToast = Toastify({
            text: "Changes Saved",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            // style: {
            //   background: "linear-gradient(to right, #00b09b, #96c93d)",
            // },
            onClick: function(){} // Callback after click
        })
        window.addEventListener('message', message=>{
            console.log(message);
            if(message.data.substring(0,"LoadedFiles:".length) == "LoadedFiles:"){
                refreshFilesList(JSON.parse(message.data.substring("LoadedFiles:".length)));
            }else if(message.data == "ChangesSaved"){
                saveToast.showToast();
            }
        });
        const editorIframe = document.createElement("iframe");
        editorIframe.style = "width: 100%;height: 100%;border: none;";
        editorIframe.src = location.origin+"/editor";
        shaddow.querySelector("#editor-target").appendChild(editorIframe);
        shaddow.querySelector("#add-processor").addEventListener("click", ()=>{
            editorIframe.contentWindow.postMessage("CreateFile");
        });

        import("/scripts/tabs.js").then(mod=>{
            new mod.TabManager({
                controlsParent:shaddow.querySelector(".proprocessor--tabs"),
                containersParent:shaddow.querySelector(".proprocessor--tabs-containers"),
                onload:()=>{
                    shaddow.querySelector(".proprocessor--tabs-containers").classList.remove("--content-hidden");
                }
            }).setSelectedCb(1, (container)=>{
                const zoneConfigPanel = container.querySelector(".area-settings-panel"); 
                if(loadedFile.metadata instanceof Object){
                    if(loadedFile.metadata.aoeMode == "Zone"){
                        zoneConfigPanel.classList.toggle("--content-hidden", true);
                    }else{
                        zoneConfigPanel.classList.remove("--content-hidden");
                    }
                }else{
                    zoneConfigPanel.classList.toggle("--content-hidden", true);
                }
            });
        });
    }
}
window.customElements.define('project-settings', Panel);

function loadStyle(url) {
    const sheet = new CSSStyleSheet();
    fetch(url)
        .then(response => response.text())
        .then(text => sheet.replace(text))
        .catch(console.error);
    return sheet;
}