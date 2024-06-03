const htmlSource = `
<source-control-panel>
	<h4 class="ubuntu-medium">Source Control <button class="close-button">-</button></h4>
	<p class="ubuntu-light-italic" style="display: none;">Projects are stored in a versioned way, forming a timeline of progress made across its snapshots. After a version is used as the parent for another, it becomes no longer editable and serves only as a reference for new versions.</p>
	<div class="row">
		<ul></ul>
		<div class="ubuntu-light selected-version">
			<label>Parent Branches</label>
			<div id="parent-branches">
				<div>v1</div><img src="/media/workspace_icons/arrow-small-right-svgrepo-com.svg" height="20">
				<div>v1</div>
			</div>
			<label>Created At</label>
			<div id="version-created-at">a time of the day</div>
			<label>Editing State</label>
			<div id="editing-state">Unlocked<span><img src="/media/workspace_icons/unlock-svgrepo-com.svg" height="18"></span></div>
			<div class="controls">
				<button id="load-version">Load Version</button>
				<button id="new-snapshot">New Snapshot</button>
			</div>
		</div>
	</div>
</source-control-panel>`;
const cssSource = `
source-control-panel {
  background-color: var(--modal-background);
  color: var(--modal-foreground);
  position: absolute;
  width: 80vw;
  max-width: 700px;
  margin: auto;
  inset: 0;
  height: 40vh;
  box-shadow: black 0px 1px 5px -3px;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(60px);
}
source-control-panel h4 {
  margin: 0px;
}
source-control-panel ul {
  height: 100%;
  padding: 0px;
  overflow: hidden;
  width: 30%;
  padding: 0.2rem;
  margin: 0.1rem -0.2rem;
}
source-control-panel li {
  background-color: var(--modal-primary);
  color: var(--modal-primary-foreground);
  padding: 0.4rem;
  border-radius: 0.3rem;
  box-shadow: #000000ab 0px 0px 5px -2px, #000 0px 1px 2px -1px;
  display: flex;
  cursor: pointer;
  flex-direction: row;
  justify-content: space-between;
}
source-control-graph node header {
  background: #80808021;
  width: 100%;
  margin: -0.4rem;
  padding: 0.4rem;
  margin-bottom: 0px;
}
source-control-panel .row {
  display: flex;
  height: 0px;
  flex-grow: 1;
  gap: 0.4rem;
}
source-control-panel .row label {
  font-weight: bold;
}
source-control-panel .row .selected-version {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex-grow: 1;
}
#parent-branches {
  display: flex;
}
#editing-state {
  display: flex;
  gap: 0.2rem;
  place-items: center;
}
source-control-panel li.--selected {
  cursor: default;
  filter: brightness(0.8) contrast(1.4) saturate(0.8);
}
source-control-panel li button {
  place-self: flex-end;
  align-self: end;
  float: right;
  background: none;
  border: none;
  border-radius: 0.3rem;
}
source-control-panel li button:hover {
  background-color: #52db2bdb;
  filter: invert(1);
}
source-control-panel .controls {
  margin-top: auto;
  display: flex;
  justify-content: right;
}
source-control-panel .controls button {
  border: none;
  padding: 0.2rem 0.6rem;
  background-color: #93939338;
  color: inherit;
  border-radius: 0.3rem;
  font-weight: 500;
  font-size: 0.8rem;
  box-shadow: black 0px 1px 3px -2px;
}
source-control-panel li.--selected button {
  display: none;
}
`;

function createProjectItem(version, cb, selected){
  const item = document.createElement("li");
  item.innerHTML = `<header></header><button title="Compare Diffs"><img height="20" src="/media/workspace_icons/git-compare-svgrepo-com.svg"></button>`
  item.querySelector("header").innerText = "v"+version;
  item.tabIndex = "0"
  item.addEventListener("click", cb.bind(item));
  if(selected == version){
    setTimeout(cb.bind(item), 10);
  }
  return item;
}

function getParentBranches(parentTarget, versions, version){
  import("/scripts/srcCtrlOps.js").then((srcCtrl)=>{
    while(parentTarget.firstChild) parentTarget.firstChild.remove();
    
    let node = srcCtrl.findVersion(versions, version.parent); 
    let el = document.createElement("span");
    el.innerText = "v"+version.version;
    parentTarget.prepend(el);
    
    while(node){
      parentTarget.prepend(document.createElement("img"));
      parentTarget.firstChild.height = "20";
      parentTarget.firstChild.src = "/media/workspace_icons/arrow-small-right-svgrepo-com.svg";
      el = document.createElement("span");
      el.innerText = "v"+node.version;
      parentTarget.prepend(el);
      
      node = srcCtrl.findVersion(versions, node.parent); 
    }
  });
}

export class Panel extends HTMLDivElement {
  #selectedVersion;#selectedProject;
  constructor(){
      super();
      this.style.zIndex = "1";
      Object.defineProperty(this, "instigatorWorkspace", {
        set:(v)=>{
          this.__instigator_workspace = v;
          const shadow = this.attachShadow({ mode: "open" });
          this.__shaddow = shadow;

          let tempContainer = document.createElement("div");
          tempContainer.innerHTML = htmlSource;

          var fontLink = document.createElement("link"); 
          fontLink.type = "text/css"; 
          fontLink.rel = "stylesheet"; 
          fontLink.href = "/Ubuntu/Ubuntu-Regular.ttf";
          shadow.appendChild(fontLink);

          var fontStyle = document.createElement("link"); 
          fontStyle.type = "text/css"; 
          fontStyle.rel = "stylesheet"; 
          fontStyle.href = "/styles/ubuntu.css";
          shadow.appendChild(fontStyle);

          var fontStyle = document.createElement("link"); 
          fontStyle.type = "text/css"; 
          fontStyle.rel = "stylesheet"; 
          fontStyle.href = "/styles/main.css";
          shadow.appendChild(fontStyle);

          const style = document.createElement("style");        
          style.textContent = cssSource;
          shadow.appendChild(style);

          // const script = document.createElement("script");        
          // script.src = "/scripts/inline-svgs.js";
          // shadow.appendChild(script);

          while(tempContainer.firstChild) shadow.appendChild(tempContainer.firstChild);

          shadow.querySelector("button.close-button").addEventListener("click", ()=>{
            this.remove();
          });

          let createNewSnapshot = (ev)=>{
            if(!ev.isTrusted) return;
            import("/scripts/srcCtrlOps.js").then((srcCtrl)=>{
              srcCtrl.createVersion(this.__instigator_workspace.loadedProject);
            });
          }
          let loadVersion = (ev)=>{
            import("/scripts/srcCtrlOps.js").then((srcCtrl)=>{
              let evTarget = this.__instigator_workspace.__node_container;
              this.#selectedProject.nodes = srcCtrl.constructNodes(this.#selectedProject, srcCtrl.findVersion(this.#selectedProject.versions, this.#selectedVersion));
              this.#selectedProject.version = this.#selectedVersion;
              
              evTarget.dispatchEvent(new CustomEvent("projectLOAD", {
                  detail: this.__instigator_workspace.loadedProject,
              }));
              this.remove();
            });
          }

          shadow.getElementById("new-snapshot").addEventListener("click", createNewSnapshot);
          shadow.getElementById("load-version").addEventListener("click", loadVersion);
          if(this.__shaddow){
            const shaddow = this.__shaddow;
            shaddow.lastElementChild.classList.toggle("--project-loaded", !!v.loadedProject);
            if(v.loadedProject instanceof Object){
              const project = v.loadedProject;
              this.#selectedVersion = project.version;
              this.#selectedProject = project;
              
              shaddow.querySelector("h4").innerText = "Source Control - "+ project.name;
              shaddow.querySelector("h4").appendChild(document.createElement("span"));
              shaddow.querySelector("h4").lastElementChild.innerText = " v"+project.version;
              shaddow.querySelector("h4").lastElementChild.style.opacity = "0.6";
              shaddow.querySelector("h4").lastElementChild.style.marginLeft = "0.2rem";

              let setVersion = (v)=>{
                this.#selectedVersion = v;
              }

              let versionsList = shaddow.querySelector("ul");
              for (let i = 0; i < project.versions.length; i++) {
                versionsList.appendChild(createProjectItem(project.versions[i].version, function(){
                  setVersion(project.versions[i].version);
                  let lastSelected = this.parentElement.querySelector(".--selected");
                  if(lastSelected) lastSelected.classList.remove("--selected");
                  this.classList.toggle("--selected", true);
                  
                  // Refresh the selected version area
                  let selectedVersionPanel = shaddow.querySelector(".selected-version");
                  selectedVersionPanel.querySelector("#version-created-at").innerText = new Date(project.versions[i].ts).toLocaleDateString();
                
                  let editingState = shaddow.querySelector("#editing-state");
                  editingState.remove();
                  if(project.versions[i].locked){
                    editingState.innerHTML = `Locked <span><img src="/media/workspace_icons/lock-svgrepo-com.svg" height="18"></span>`
                  }else{
                    editingState.innerHTML = `Unlocked <span><img src="/media/workspace_icons/unlock-svgrepo-com.svg" height="18"></span>`
                  }

                  shaddow.querySelector(".controls").before(editingState);

                  const parentBranches = selectedVersionPanel.querySelector("#parent-branches");
                  getParentBranches(parentBranches, project.versions, project.versions[i]);
                }, project.version));
              }
            }
          }else{
            console.error("source control list laoded without a shaddow");
          }
        },
        get(){
          return this.__instigator_workspace;
        }
      })
  }
  connectedCallback() {
    // Create a shadow root
    
  }
}

window.customElements.define('source-control', Panel, {extends: 'div'});