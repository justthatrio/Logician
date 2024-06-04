
const htmlSource = `
<div class="save-menu ubuntu-medium panel">
	<h4>
        Saves List
        <button id="new-project">New project<img src="./media/icons/plus-svgrepo-com.svg" height="20"></button>
        <button class="close-button">-</button>
    </h4>
	<hr>
	<ol id="saves-list">
	</ol>
	<div class="selected-save-panel">
		<div class="name-row">
			<input class="save-name">
			<button id="confirm-save-name">Confirm</button>
			<button id="cancel-save-name">Cancel</button>
		</div>
		<div class="bottom-row">
			<div class="info-container">
				<label>Description</label>
				<br>
				<textarea placeholder="Enter a description for your circuit"></textarea>
			</div>
			<div class="save-controls">
				<button id="load-selected-save">Load<img height="20" src="./media/icons/upload-svgrepo-com.svg"></button>
				<button id="delete-selected-save">Delete<img height="20" src="./media/icons/delete-2-svgrepo-com.svg"></button>
			</div>
		</div>
	</div>
    <div class="new-project-panel">
        <h4>Name your project</h4>
        <input>
        <div class="new-project-options">
            <button id="create-project">Create</button><button id="cancel-project">Cancel</button>
        </div>
    </div>
</div>`;
const cssSource = `
.save-menu {
  background-color: var(--modal-background);
  color: var(--modal-foreground);
  position: absolute;
  width: 80vw;
  height: 63vh;
  min-height: 15rem;
  margin: auto;
  inset: 0;
  padding: 0.2rem;
  box-shadow: #00000070 0px 1px 6px -1px;
  flex-direction: column;
  overflow: hidden;
  transition: height 0.2s, min-height 0.2s;
}
.save-menu h4 {
  margin: 0.4rem 0px;
  margin-bottom: 0px;
  transition: margin 0.2s, transform 0.2s;
}
.save-menu ol {
  padding: 0px;
  overflow: hidden;
  overflow-y: auto;
  margin-top: 0px;
  height: 0px;
  min-height: 2rem;
  flex-grow: 1;
}
.save-menu li {
  margin-bottom: 1px;
  padding: 0.2rem;
  border: solid 1px #ddd8ff;
  border-radius: 0.2rem;
  background-color: var(--modal-primary);
  color: var(--modal-primary-foreground);
  font-weight: 100;
  letter-spacing: 0.04rem;
  border-radius: 0.4rem;
  display: flex;
}
.save-menu li span.display-name {
  background-color: #0000003d;
  padding: 0.2rem;
  flex-grow: 1;
}
.selected-save-panel {
  padding: 0.5rem;
  border: solid 2px #e6e6e6;
  box-shadow: #000000a3 0px 3px 5px -5px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow: hidden;
  transition: height 0.15s, transform 0.2s;
  height: 0px;
}
.--expanded.selected-save-panel {
  height: 20vh;
}
.selected-save-panel .save-name {
  background-color: var(--modal-background);
  color: var(--modal-foreground);
  display: block ruby;
  width: 100%;
  border: none;
  border-radius: 0.3rem;
  padding: 0.4rem;
  margin: -0.2rem;
  margin-right: 0.2rem;
  font-size: 1rem;
}
.selected-save-panel .name-row {
  display: flex;
}
.selected-save-panel .load-cost {
  font-weight: bold;
  margin-left: 1rem;
}
.selected-save-panel textarea {
  background-color: var(--modal-background);
  color: var(--modal-foreground);
  resize: none;
  width: 100%;
  border: none;
  border-radius: 0.3rem;
}
.selected-save-panel .bottom-row {
  display: flex;
  flex-direction: row;
}
.selected-save-panel .info-container {
  flex-grow: 1;
}
.selected-save-panel .save-controls {
  transform: translateY(-1.8rem);
  transition: transform 0.2s;
}
.selected-save-panel.--renaming {
}
.selected-save-panel.--renaming .save-controls {
  transform: translateY(0rem);
}
.selected-save-panel .name-row button {
  transition: transform 0.2s;
  transform: translateY(-2.2rem);
}
.selected-save-panel.--renaming .name-row button {
  transform: translateY(0rem);
}
.selected-save-panel .save-controls button {
  width: 100%;
  justify-content: space-between;
}
.save-menu.--creating-new *:not(.new-project-panel) h4 {
  transform: translateY(-100%);
  margin-bottom: -1.2rem;
  margin-top: -0.8rem;
}
.save-menu.--creating-new .selected-save-panel {
  height: 0px;
  transform: translateY(100%);
}
.save-menu.panel.--creating-new {
  height: 20vh;
  min-height: 5rem;
}
.new-project-panel {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: white;
  opacity: 0;
  box-sizing: border-box;
  padding: 0.4rem;
  width: calc(100% - 0.4rem);
  pointer-events: none;
}
.new-project-options {
  display: flex;
  position: absolute;
  right: 0px;
  bottom: 0px;
  padding: 0.4rem;
  gap: 0.5rem;
}
.new-project-panel h4 {
  font-size: 1.4rem;
  margin-bottom: 2%;
}
.new-project-panel  input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.3rem;
  border-radius: 0.3rem;
  border: none;
  box-shadow: black 0px 1px 5px -3px, #000000a3 0px 0px 2px -1px;
  background: #70bcff0f;
}
.save-menu.panel.--creating-new .new-project-panel {
  opacity: 1;
  pointer-events: all;
}`;


/**
 * Gets saveData with functionality bound to a specific workspace (for constructing diffs during save operations)
 * @returns SaveData
 */
function getSaveData(workspace){
    let saveData = localStorage.getItem("logic-saves");
    if(!saveData) saveData = {
        saves:[],
    };
    else saveData = JSON.parse(atob(saveData));


    saveData.save = function(){
        console.log("saving ");
        Promise.all([import("./objectDiff.js"), import("./srcCtrlOps.js")]).then(([objDiff, srcCtrl])=>{
            let toSave = {...saveData};
    
            if(this && !this.locked){ // Save is being called on a project
                // Diff the workspaces nodes with the projects selected versions parent to get the selected versions new diff
                let parentVersionReference = [];
                let loadedVersion = srcCtrl.findVersion(workspace.loadedProject.versions, workspace.loadedProject.version)
                if(loadedVersion.parent){
                    parentVersionReference = srcCtrl.constructNodes(workspace.loadedProject, srcCtrl.findVersion(workspace.loadedProject.versions, loadedVersion.parent))
                }

                loadedVersion.diff = objDiff.diff(parentVersionReference, workspace.getDataTree().nodes);
            } // Else save all is being called
    
            // Cleanse the save functions in the copy to remove cyclical references
            delete toSave.save;
            for (let i = 0; i < toSave.saves.length; i++) {            
                toSave.saves[i] = {...toSave.saves[i]};
                delete toSave.saves[i].save;
                delete toSave.saves[i].version;
                delete toSave.saves[i].nodes; // Delete the nodes so only the diff remains
            }
            console.log("saved: ", toSave);
            localStorage.setItem("logic-saves", btoa(JSON.stringify(toSave)));
        });
    };

    for (let i = 0; i < saveData.saves.length; i++) {
        saveData.saves[i].save = saveData.save.bind(saveData.saves[i]);
        for (let v = 0; v < saveData.saves[i].versions.length; v++) {
            saveData.saves[i].versions[v] = new Proxy(saveData.saves[i].versions[v], {
                get(o, v){
                    return o[v];
                },
                set(o, p, va){
                    if(!saveData.saves[i].versions[v].locked || p == "locked") {
                        o[p] = va;
                    }
                    return true;
                }
            });
        }
    }

    saveData.saves = new Proxy(saveData.saves, {
        get:(og, key)=>{
            if(key == 'push' || key == 'unshift'){
                return (v)=>{
                   if(v instanceof Object){
                       v.save = saveData.save
                   }
                   og[key](v);
                }
            }
            return og[key]
        }
    });
    
    return saveData;
}

function createSaveItem(save){
    let element = document.createElement("li");
    element.innerText = save.name;
    return element
}

export class Panel extends HTMLDivElement {
    constructor() {
        super();
        this.style.zIndex = "1";
        Object.defineProperty(this, "instigatorWorkspace", {
          set: (v)=>{
              // Create a shadow root
              const shadow = this.attachShadow({ mode: "open" });

              this.__instigator_workspace = v;

              let tempContainer = document.createElement("div");
              tempContainer.innerHTML = htmlSource;

              var fontLink = document.createElement("link"); 
              fontLink.type = "text/css"; 
              fontLink.rel = "stylesheet"; 
              fontLink.href = "./Ubuntu/Ubuntu-Regular.ttf";
              shadow.appendChild(fontLink);

              var fontStyle = document.createElement("link"); 
              fontStyle.type = "text/css"; 
              fontStyle.rel = "stylesheet"; 
              fontStyle.href = "./styles/ubuntu.css";
              shadow.appendChild(fontStyle);

              var fontStyle = document.createElement("link"); 
              fontStyle.type = "text/css"; 
              fontStyle.rel = "stylesheet"; 
              fontStyle.href = "./styles/main.css";
              shadow.appendChild(fontStyle);

              // Adds theme support to the panel
              var themeStyle = document.createElement("link"); 
              themeStyle.type = "text/css"; 
              themeStyle.rel = "stylesheet"; 
              themeStyle.href = "./styles/themes.css";
              shadow.appendChild(themeStyle);
              shadow.adoptedStyleSheets.push(globalThemeSheet);
          
              const style = document.createElement("style");
              
              style.textContent = cssSource;
              let selectedSave;

          
              function selected(){
                  selectedSave = this;
                  shadow.querySelector(".selected-save-panel").classList.add("--expanded");
                  const saveInput =  shadow.querySelector(".selected-save-panel .save-name");     
                  const description = shadow.querySelector("textarea");       
                  saveInput.value = this.name;
                  if(this.description) description.value = this.description;
              }

              shadow.appendChild(style);
              while(tempContainer.firstChild) shadow.appendChild(tempContainer.firstChild);
              
              shadow.querySelector("button.close-button").addEventListener("click", ()=>{
                this.remove();
              });

              // Create the save item UI elements
              this.saveData = getSaveData(this.__instigator_workspace);
              const savesList = shadow.getElementById("saves-list");
              for (let i = 0; i < this.saveData.saves.length; i++) {
                  const save = this.saveData.saves[i];
                              
                  let item = createSaveItem(save);
                  savesList.appendChild(item);
                  item.addEventListener("click", selected.bind(save));
              }


              // Attach event listeners
              shadow.getElementById("load-selected-save").addEventListener("click", ()=>{
                  if(!selectedSave) return;
                  import("./srcCtrlOps.js").then((srcCtrl)=>{
                      let evTarget = this.__instigator_workspace.__node_container;
                      selectedSave.nodes = srcCtrl.constructNodes(selectedSave, selectedSave.versions[selectedSave.versions.length-1]);
                      selectedSave.version = selectedSave.versions[selectedSave.versions.length-1].version;
                      
                      evTarget.dispatchEvent(new CustomEvent("projectLOAD", {
                          detail: selectedSave,
                      }));
                      this.remove();
                  });
              });
              shadow.getElementById("delete-selected-save").addEventListener("click", ()=>{

              });
              shadow.getElementById("new-project").addEventListener("click", ()=>{
                  shadow.querySelector(".save-menu").classList.add("--creating-new");
              });
              const newProjectNameInput = shadow.querySelector(".new-project-panel input");
              shadow.getElementById("cancel-project").addEventListener("click", ()=>{
                  newProjectNameInput.value = "";
                  shadow.querySelector(".save-menu").classList.remove("--creating-new");
              });
              shadow.getElementById("create-project").addEventListener("click", ()=>{
                  import("./srcCtrlOps.js").then((srcCtrl)=>{
                      const newSave = {
                          name: newProjectNameInput.value,
                          description: "",
                          version:"1.0.0",
                          versions: [{
                              version:"1.0.0",
                              parent: undefined,
                              locked: false,
                              ts: new Date(),
                              diff: {}
                          }],
                      }
                      this.saveData.saves.push(newSave);
                      newSave.save();
                      newSave.nodes=srcCtrl.constructNodes(newSave, newSave.versions[newSave.versions.length-1]);
                      this.__instigator_workspace.__node_container.dispatchEvent(new CustomEvent("projectLOAD", {
                              detail: newSave
                          },
                      ));
                      this.remove();
                  });
              });
          },
          get:()=>{
              return this.__instigator_workspace;
          }
        })        
    }
    connectedCallback(){

    }
}

function patchObj(a, patch, key = ""){
    if(patch.changed == "object change"){
        let changeEntries = Object.entries(patch.value);
        for (let i = 0; i < changeEntries.length; i++) {
            const [key2,patch] = changeEntries[i];
            patchObj(a[key], patch, key2);
        }
    }else if(patch.changed == "removed"){
        delete a[key];
    }else if(patch.changed == "added"){
        a[key] = patch.value;
    }
}

window.customElements.define('saves-list', Panel, {extends: 'div'});
