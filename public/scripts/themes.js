const mql = window.matchMedia("(prefers-color-scheme: dark)");

const presetThemes = {
  LatteGrande:{
  id:"LatteGrande",
  thumbnail:"/media/themes/LatteGrande.png",
  content:`
body {
  background: rgb(221, 182, 140);
  background: -moz-radial-gradient(circle, rgb(255, 243, 227) 7%, rgb(221, 182, 140) 100%);
  background: -webkit-radial-gradient(circle, rgba(255,243,227,1) 7%, rgb(221, 182, 140) 100%);
  background: radial-gradient(circle, rgb(255, 243, 227) 7%, rgb(221, 182, 140) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#fff3e3",endColorstr="#cd8333",GradientType=1);
  background-size: 180%;
  background-position-x: center;
  --modal-background: #713527;
  --modal-primary: #825433;
  --modal-foreground: wheat;
}
.workspace-container {
  background-color: #fbfbfb57;
  backdrop-filter: contrast(0.3) sepia(18);
}
.panel button {
  background-color: #d7ab7e45;
}
logic-node {
  filter: brightness(1.05);
}
.module-settings-panel {
  background: #f5deb35e;
  backdrop-filter: blur(40px);
}
.module-settings-panel .header {
  background-color: #aa7236;
  color: whitesmoke;
}
body:not(.--dark-mode) logic-debugger button {
  color: wheat;
}
body.--dark-mode {
  background: #40240b;
  background: rgb(213,140,44);
  background: -moz-radial-gradient(circle, #713527 7%, rgba(121,76,26,1) 100%);
  background: -webkit-radial-gradient(circle, #713527 7%, rgba(121,76,26,1) 100%);
  background: radial-gradient(circle, #713527 7%, rgba(121,76,26,1) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#d58c2c",endColorstr="#794c1a",GradientType=1);
}
body.--dark-mode .panel button {
  color: wheat;
}
body.--dark-mode .workspace-container {
  background-color: #1e1206;
  backdrop-filter: unset;
  box-shadow: #00000094 0px 10px 2000px -60px inset;
}
body.--dark-mode .module-settings-panel {
  box-shadow: #f5deb340 10px 0px 100px;
  border: none;
  outline-color: grey;
  color: wheat;
}
body.--dark-mode .module-settings-panel .header {
  background-color: #462e24;
}
body.--dark-mode > .panel {
  border-bottom: solid 1px grey;
}
  `},
  ButterBerry:{
    id:"ButterBerry",
    thumbnail:"/media/themes/ButterBerry.png",
    content:`
      body {
        --modal-foreground: black;
        --modal-primary: rgb(96, 105, 232);
        --modal-primary-foreground: white;
        --modal-background: rgba(255, 246, 229, 0.63);
        background: rgb(247,228,186);
        background: -moz-radial-gradient(circle, rgba(247,228,186,1) 0%, rgba(213,205,190,1) 35%, rgba(199,196,192,1) 53%, rgba(188,188,193,1) 62%, rgba(169,175,195,1) 69%, rgba(121,143,200,1) 83%, rgba(94,125,202,1) 93%, rgba(45,92,207,1) 100%);
        background: -webkit-radial-gradient(circle, rgba(247,228,186,1) 0%, rgba(213,205,190,1) 35%, rgba(199,196,192,1) 53%, rgba(188,188,193,1) 62%, rgba(169,175,195,1) 69%, rgba(121,143,200,1) 83%, rgba(94,125,202,1) 93%, rgba(45,92,207,1) 100%);
        background: radial-gradient(circle, rgba(247,228,186,1) 0%, rgba(213,205,190,1) 35%, rgba(199,196,192,1) 53%, rgba(188,188,193,1) 62%, rgba(169,175,195,1) 69%, rgba(121,143,200,1) 83%, rgba(94,125,202,1) 93%, rgba(45,92,207,1) 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#f7e4ba",endColorstr="#2d5ccf",GradientType=1); 
        background-size: 200%;
        background-position-x: center;
      }
      .workspace-container {
      background-color: #fbe2c2cc;
      }
      .panel button {
      background-color: #ffeeced4;
      border: solid 1px #196ff4cf;
      }
      logic-node {
      filter: brightness(1.05);
      }
      .module-settings-panel {
      background: #fff6e5a1;
      backdrop-filter: blur(40px);
      }
      .module-settings-panel .header {
      background-color: #6069e8;
      color: whitesmoke;
      }
      body.--dark-mode {
      
      }
      body.--dark-mode .panel button {
      color: wheat;
      background-color: #1f1b3e;
      border: none;
      }
      body.--dark-mode .workspace-container {
      background-color: #03061145;
      backdrop-filter: unset;
      box-shadow: #00000094 0px 10px 2000px -60px inset;
      }
      body.--dark-mode .module-settings-panel {
      box-shadow: #0e0c2640 10px 0px 100px;
      border: none;
      outline-color: grey;
      color: wheat;
      background-color: #12111c;
      }
      body.--dark-mode .module-settings-panel .header {
      background-color: #282446;
      color: wheat;
      }
      body.--dark-mode > .panel {
      border-bottom: solid 1px grey;
      background-color: #080628c9;
      }
      .panel {
      border-bottom: #6097ff59 solid 2px;
      }
      .workspace-container::before {
        pointer-events: none;
        content: "";
        z-index: -2;
        position: absolute;
        inset: 0;
        background-image: url(/media/themes/ButterBerry.png);
        filter: blur(50px) contrast(2) saturate(2) brightness(1.2);
        scale: 4;
        transform: translateY(-20%);
        opacity: 0.3;
      }
    `,
  },
  CrimsonCaves:{
    id:"CrimsonCaves",
    thumbnail:"/media/themes/CrimsonCaves.png",
    content:`
      body {
        --modal-background: crimson;
        --modal-primary: #ff2954;
        --modal-foreground: white; 
        background: rgb(200,61,61);
        background: -moz-radial-gradient(circle, rgba(200,61,61,1) 0%, rgba(82,8,0,1) 100%);
        background: -webkit-radial-gradient(circle, rgba(200,61,61,1) 0%, rgba(82,8,0,1) 100%);
        background: radial-gradient(circle, rgba(200,61,61,1) 0%, rgba(82,8,0,1) 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#c83d3d",endColorstr="#520800",GradientType=1); 
      }
      .workspace-container {
        background-color: #fff;
        backdrop-filter: contrast(2);
      }
      .panel button {
        background-color: crimson;
        color: white;
        font-size: 0.9rem;
      }
      logic-node {
        filter: brightness(1.05);
      }
      .module-settings-panel {
        background: #ffffffa1;
        backdrop-filter: blur(40px);
      }
      .module-settings-panel .header {
        background-color: crimson;
        color: whitesmoke;
      }
      body.--dark-mode .panel button {
        color: white;
        background-color: crimson;
        border: none;
      }
      body.--dark-mode .workspace-container {
        background-color: #03061145;
        backdrop-filter: unset;
        box-shadow: #00000094 0px 10px 2000px -60px inset;
      }
      body.--dark-mode .module-settings-panel {
        box-shadow: #c6024b40 10px 0px 100px;
        border: none;
        outline-color: grey;
        color: white;
        background-color: #95001e;
      }
      body.--dark-mode .module-settings-panel .header {
        color: white;
      }
      body.--dark-mode > .panel {
        border-bottom: solid 1px grey;
        background-color: #ce121236;
      }
      .panel {
        border-bottom: #ff000096 solid 2px;
      }
      .workspace-container::before {
        content: "";
        z-index: -2;
        position: absolute;
        inset: 0;
        background-image: url(/media/themes/CrimsonCaves.png);
        filter: blur(150px) contrast(2) saturate(1) brightness(1.2);
        scale: 6;
        opacity: 0.3;
        pointer-events: none;
      }
    `
  },
  BioAquatic:{
    id:"BioAquatic",
    thumbnail:"/media/themes/BioAquatic.png",
    content:`
      body {
        background: rgb(90,180,212);
        background: -moz-radial-gradient(circle, rgba(90,180,212,1) 0%, rgba(105,244,144,1) 100%);
        background: -webkit-radial-gradient(circle, rgba(90,180,212,1) 0%, rgba(105,244,144,1) 100%);
        background: radial-gradient(circle, rgba(90,180,212,1) 0%, rgba(105,244,144,1) 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#5ab4d4",endColorstr="#69f490",GradientType=1); 
      }
      .workspace-container {
        background-color: #fff;
        backdrop-filter: contrast(2);
      }
      .panel button {
        background-color: #ffffffd4;
        color: black;
        font-size: 0.9rem;
        backdrop-filter: saturate(500%) contrast(400%);
        box-shadow: #e8f0ad 0px 0px 20px;
        filter: brightness(1.2);
      }
      logic-node {
        filter: brightness(1.05);
      }
      .module-settings-panel {
        background: #ffffffa1;
        backdrop-filter: blur(40px);
      }
      .module-settings-panel .header {
        background-color: #82ee98;
        color: black;
      }
      body.--dark-mode {
        background: rgb(126,214,245);
        background: -moz-radial-gradient(circle, rgba(126,214,245,1) 0%, rgba(0,99,28,1) 64%);
        background: -webkit-radial-gradient(circle, rgba(126,214,245,1) 0%, rgba(0,99,28,1) 64%);
        background: radial-gradient(circle, rgba(126,214,245,1) 0%, rgba(0,99,28,1) 64%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#7ed6f5",endColorstr="#00631c",GradientType=1);
      }
      body.--dark-mode .panel button {
        color: #c8f1fd;
        background-color: #0e6666eb;
        border: none;
      }
      body.--dark-mode .workspace-container {
        background-color: #061715d4;
        backdrop-filter: unset;
        box-shadow: #00000094 0px 10px 2000px -60px inset;
      }
      body.--dark-mode .module-settings-panel {
        box-shadow: #8fe87714 10px 0px 180px;
        border: none;
        outline-color: grey;
        color: white;
        background-color: #2b332a;
      }
      body.--dark-mode .module-settings-panel .header {
        color: #0e1c0c;
        background-color: #17c49b;
      }
      body.--dark-mode > .panel {
        border-bottom: solid 1px grey;
        background-color: #061a033d;
        box-shadow: black 0px 5px 40px -20px inset;
        overflow: hidden;
      }
      .panel {
        border-bottom: #00e7ff96 solid 2px;
        z-index: 1;
      }
      .workspace-container::before {
        content: "";
        z-index: -10;
        position: absolute;
        inset: 0;
        background-image: url(/media/themes/BioAquatic.png);
        filter: blur(40px) contrast(2) saturate(1) brightness(1.2);
        scale: 3;
        pointer-events: none;
      }
      body.--dark-mode logic-node {
        box-shadow: #6eeab5d4 0px 0px 200px;
      }
      body:not(.--dark-mode) .workspace-container::before {
        opacity: 0.3;
      }
    `
}};

function selected(ev){
  if(!presetThemes[ev.currentTarget.getAttribute("data-theme")]) return
  setTheme(presetThemes[ev.currentTarget.getAttribute("data-theme")].content, presetThemes[ev.currentTarget.getAttribute("data-theme")].thumbnail);
  localStorage.setItem("saved-theme", ev.currentTarget.getAttribute("data-theme"));
}

function createThemeItem(template){
  const item = document.createElement("button");
  const img = document.createElement("img");
  img.src = template.thumbnail;
  item.appendChild(img);
  item.setAttribute("data-theme", template.id);
  item.addEventListener("click", selected);
  return item
}
window.openThemeManager = openThemeManager;
let firstCall = true; 
function colorSchemeTest() {
 
  firstCall = false;

  let darkModeOverride = localStorage.getItem("prefers-darkmode");
  if(darkModeOverride !== null) document.body.classList.toggle("--dark-mode", darkModeOverride=="1");
  else document.body.classList.toggle("--dark-mode", mql.matches);

  let savedTheme = localStorage.getItem("saved-theme");
  let customTheme = localStorage.getItem("custom-theme");
  if(customTheme != null){
    setTheme(btoa(customTheme));
  }else if(savedTheme !== null){
    if(!presetThemes[savedTheme]) return
    setTheme(presetThemes[savedTheme].content, presetThemes[savedTheme].thumbnail);
  }
}

mql.addEventListener("change", colorSchemeTest);
document.addEventListener("DOMContentLoaded",colorSchemeTest)

const globalTheme = new CSSStyleSheet();
const nodeTheme = new CSSStyleSheet();

document.adoptedStyleSheets.push(globalTheme);
document.adoptedStyleSheets.push(nodeTheme);
window.globalThemeSheet = globalTheme;

function setTheme(theme, thumb){
  globalTheme.replaceSync(theme);

  let nodeThemeName = localStorage.getItem("node-theme");
  if(nodeThemeName == "Solid" ){
    nodeTheme.replaceSync("");
    localStorage.removeItem("node-theme");
    updateEdges()
  }else if( nodeThemeName == "Glass"){
    fetch("/styles/glass-nodes.css").then(v=> v.text()).then(css=>{
      nodeTheme.replaceSync(css);
      updateEdges()
    });
  }else if(nodeThemeName == "Skinned"){
    fetch("/styles/skinned-nodes.css").then(v=> v.text()).then(css=>{
      nodeTheme.replaceSync(css);
      updateEdges()
    });
  }
  function updateEdges(){
    let nodes = document.querySelectorAll("logic-node");
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.__node.updateEdgeElements();
    }
  }

}

const htmlSource = `
<theme-manager class="ubuntu-light">
	<header class="">
		<h1 class="panel">Editor Theme <button class="close-button">-</button></h1></header>
	<div></div>
	<div class="theme-grid">
		<button>
			<h4>Create New</h4></button>
	</div>
  <button class="settings-dropdown">Appearance Settings<img src="/media/workspace_icons/expand-down-svgrepo-com.svg" height="30"></button>
  <form class="appearance-settings-panel">
    <ul>
      <li>
        <label>Darkmode</label>
        <select id="darkmode-input"><option>Auto</option><option>Light</option><option>Dark</option></select>
      </li>
      <li>
        <label>Module Rendering</label>
        <select id="module-rendering"><option>Solid</option><option>Glass</option><option>Skinned</option></select>
      </li>
    </ul>
  </form>
</theme-manager>`;
const cssSource = `
theme-manager {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 80vw;
  max-width: 800px;
  height: 60vh;
  max-height: 420px;
  background: var(--modal-background);
  color: var(--modal-foreground);
  box-shadow: black 0px 1px 4px -2px, #00000026 0px 1px 14px -3px;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(60px);
}
theme-manager h1 {
  margin: 0.2rem 0px;
  font-size: 1.2rem;
  vertical-align: baseline;
  display: inline !important;
}
theme-manager .theme-grid {
  flex-grow: 1;
  border-radius: 0.5rem;
  box-shadow: #00000063 0px -5px 5px -5px inset, #0000005e 0px 0px 3px -1px inset, #0000000d 0px 0px 180px inset;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(auto, 120px));
}
theme-manager .theme-grid > button {
  position: relative;
  aspect-ratio: 1;
  background: none;
  border: none;
  cursor: pointer;
}
theme-manager .theme-grid > button img {
  width: 100%;
  object-fit: contain;
}

theme-manager .theme-grid > button:hover {
  filter: brightness(1.1);
}
theme-manager h1 label {
  font-size: 1rem;
  margin-left: 2rem;
  font-weight: 400;
  margin-right: 0.2rem;
}
.settings-dropdown {
  display: flex;
  place-content: left;
  place-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  font-size: 1rem;
}

.appearance-settings-panel ul {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0;
}
.appearance-settings-panel li {
  display: flex;
  justify-content: space-between;
}
`;

class Panel extends HTMLDivElement{
  constructor(){
    super();
    this.style.zIndex = "1";
  }
  connectedCallback(){
    if(this.shadowRoot) return
    const shadow = this.attachShadow({ mode: "open" });

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

    // Adds theme support to the panel
    var themeStyle = document.createElement("link"); 
    themeStyle.type = "text/css"; 
    themeStyle.rel = "stylesheet"; 
    themeStyle.href = "/styles/themes.css";
    shadow.appendChild(themeStyle);
    shadow.adoptedStyleSheets.push(globalThemeSheet);

    var fontStyle = document.createElement("link"); 
    fontStyle.type = "text/css"; 
    fontStyle.rel = "stylesheet"; 
    fontStyle.href = "/styles/main.css";
    shadow.appendChild(fontStyle);
    
    const style = document.createElement("style");
    style.textContent = cssSource;
    shadow.appendChild(style);

    while(tempContainer.firstChild) shadow.appendChild(tempContainer.firstChild);

    shadow.querySelector("button.close-button").addEventListener("click", ()=>{
      this.remove();
    });
    
    const themesTarget = shadow.querySelector(".theme-grid");

    function toggleDarkMode(ev){
      if(darkmodeInput.value == "Auto"){
        localStorage.removeItem("prefers-darkmode");
      }else{
        localStorage.setItem("prefers-darkmode", ((darkmodeInput.value=="Dark")?"1":"0"));
      }
      colorSchemeTest();
    } 
    let darkmodeInput = shadow.querySelector("#darkmode-input");
    darkmodeInput.addEventListener("click", toggleDarkMode);  
    
    if(localStorage.getItem("prefers-darkmode")=="0"){
      darkmodeInput.value = "Light";
    }else if(localStorage.getItem("prefers-darkmode")=="1"){
      darkmodeInput.value = "Dark";
    }else{
      darkmodeInput.value = "Auto";
    }

    function changeModRenderingMode(){
      localStorage.setItem("node-theme", moduleRenderingInput.value);
      if(moduleRenderingInput.value == "Solid" ){
        nodeTheme.replaceSync("");
        localStorage.removeItem("node-theme");
        updateEdges();
      }else if( moduleRenderingInput.value == "Glass"){
          fetch("/styles/glass-nodes.css").then(v=> v.text()).then(css=>{
          nodeTheme.replaceSync(css);
          updateEdges();
        });
      }else if(moduleRenderingInput.value == "Skinned"){
        fetch("/styles/skinned-nodes.css").then(v=> v.text()).then(css=>{
          nodeTheme.replaceSync(css);
          updateEdges();
        });
      }
      function updateEdges(){
        let nodes = document.querySelectorAll("logic-node");
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.__node.updateEdgeElements();
        }
      }
    }

    let moduleRenderingInput = shadow.querySelector("#module-rendering");
    moduleRenderingInput.addEventListener("click", changeModRenderingMode);
    let savedNodeTheme = localStorage.getItem("node-theme");
    if(savedNodeTheme == "Solid" || savedNodeTheme == "Glass" || savedNodeTheme == "Skinned"){
      moduleRenderingInput.value = savedNodeTheme;
      changeModRenderingMode();
    }
    

    Object.values(presetThemes).forEach((theme)=>{
      themesTarget.appendChild(createThemeItem(theme));
    });
  }
}


let lastManger;
function openThemeManager(ev){
  if(lastManger) return document.body.appendChild(lastManger);
  lastManger = new Panel();
  document.body.appendChild(lastManger);
}

window.customElements.define('theme-manager', Panel, {extends: 'div'});