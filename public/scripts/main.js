const NODE_TYPES = new Map([
    ["precision_zone",{category:"Utilities", identifier:"precision_zone", hasSettings: true, inputCount:1, outputCount:1, title:"Precision Zone", imgSrc:"media/modules/divide-svgrepo-com.svg"}],
    ["splitter",{category:"Utilities", identifier:"splitter", inputCount:1, outputCount:2,title:" Splitter", imgSrc:"media/modules/split-svgrepo-com.svg"}],
    // ["input",{category:"Utilities", identifier:"input", inputCount: 0, outputCount:1,title:"Input", imgSrc:"media/modules/select-svgrepo-com.svg"}],
    // ["output",{category:"Utilities", identifier:"output", inputCount:1, outputCount:0,title:"Output", imgSrc:"media/modules/select-svgrepo-com.svg"}],
    ["signal_blink", {category:"Timing", identifier: "signal_blink", title:"Signal Blink", inputCount:1, outputCount:1, imgSrc:"media/modules/flash-1-svgrepo-com.svg"}],
    ["signal_delay", {category:"Timing", identifier: "signal_delay",hasSettings: true, title:"Signal Delay", inputCount:1, outputCount:1, imgSrc:"media/modules/clock-five-svgrepo-com.svg"}],
    ["signal_sustain", {category:"Timing", identifier: "signal_sustain",hasSettings: true, title:"Signal Sustain", inputCount:1, outputCount:1, imgSrc:"media/modules/clock-minus-svgrepo-com.svg"}],
    ["signal_repeat", {category:"Timing", identifier: "signal_repeat",hasSettings: true, title:"Signal Repeat", inputCount:1, outputCount:1, imgSrc:"media/modules/clock-lines-svgrepo-com.svg"}],
    
    ["and_gate", {category:"Logic Gates", identifier: "and_gate", title:"AND gate", inputCount:2, outputCount:1, imgSrc:"media/gates/logic-gate-and-svgrepo-com.svg"}],
    ["nand_gate", {category:"Logic Gates", identifier: "nand_gate", signalSource:true , title:"NAND gate", inputCount:2, outputCount:1, imgSrc:"media/gates/logic-gate-nand-svgrepo-com.svg"}],
    ["or_gate", {category:"Logic Gates", identifier: "or_gate", signalSource:true, title:"OR gate", inputCount:2, outputCount:1, imgSrc:"media/gates/logic-gate-or-svgrepo-com.svg"}],
    ["xor_gate", {category:"Logic Gates", identifier: "xor_gate", title:"XOR gate", inputCount:2, outputCount:1, imgSrc:"media/gates/logic-gate-xor-svgrepo-com.svg"}],
    ["xnor_gate", {category:"Logic Gates", identifier: "xnor_gate", signalSource:true , title:"XNOR gate", inputCount:2, outputCount:1, imgSrc:"media/gates/logic-gate-nxor-svgrepo-com.svg"}],
    ["nor_gate", {category:"Logic Gates", identifier: "nor_gate", signalSource:true, title:"NOR gate", inputCount:2, outputCount:1, imgSrc:"media/gates/logic-gate-nor-svgrepo-com.svg"}],
    ["not_gate", {category:"Logic Gates", identifier: "not_gate", signalSource:true , title:"NOT gate", inputCount:1, outputCount:1, imgSrc:"media/gates/logic-gate-not-svgrepo-com.svg"}],
    ["button_input", {category:"Inputs",tooltip:"Hold F to press", identifier: "button_input", signalSource:true , title:"Button", inputCount:0, outputCount:1, imgSrc:"media/inputs/button-svgrepo-com.svg"}],
    ["switch_input", {category:"Inputs",tooltip:"Press F to toggle", identifier: "switch_input", signalSource:true , title:"Switch", inputCount:0, outputCount:1, imgSrc:"media/inputs/switch-svgrepo-com.svg"}],
    ["bit_node", {category:"Bits", customRenderer:true, hasSettings: true, identifier: "bit_node", title:"Bit Node", inputCount:1, outputCount:1, imgSrc:"media/bits/input-svgrepo-com.svg"}],
    ["bit_module", {category:"Bits", customRenderer:true, hasSettings: true, identifier: "bit_module", title:"Bit Module", inputCount:2, outputCount:1, imgSrc:"media/bits/math-plus-minus-svgrepo-com.svg"}],
    ["bit_display", {category:"Bits", customRenderer:true, identifier: "bit_display", title:"Bit Display", inputCount:1, outputCount:0, imgSrc:"media/bits/display-svgrepo-com.svg"}],
])

const dependencies = [
    "scripts/savesList.js",
    "scripts/sourceControl.js",
    "scripts/objectDiff.js",
    "scripts/logic-debugger.js",
    "scripts/settings.js"
];

function loadDependencies(){
    return new Promise((resolve, reject) => {
        const scriptRequests = [];
        for (let i = 0; i < dependencies.length; i++) {
            const dependencySRC = dependencies[i];
            if(dependencySRC.endsWith(".js")){
                scriptRequests.push(import(location.href+dependencySRC));
            }
        }
        Promise.all(scriptRequests).then(exports=>{
            let dependencyMap = new Object();
            for (let i = 0; i < exports.length; i++) {
                const exported = exports[i];
                dependencyMap[dependencies[i].substring(dependencies[i].lastIndexOf("/")+1).split(".")[0]] = exported;
            }
            resolve(dependencyMap);
        }).catch(reject);
    });
}

Object.defineProperty(NodeList.prototype, "includes", {
    get(){
        return (e)=>{
            for (let i = 0; i < this.length; i++) {
                if(this[i] == e) return true;                
            }
            return false;
        }
    },
});
Object.defineProperty(HTMLCollection.prototype, "includes", {
    get(){
        return (e)=>{
            for (let i = 0; i < this.length; i++) {
                if(this[i] == e) return true;                
            }
            return false;
        }
    },
});

class Preprocessor{
    #sandbox
    constructor(init){
        let targetUrl = String(init);
        if(init instanceof URL){
            targetUrl = init.toString();
        }else if(init instanceof Object){
            targetUrl = init.src;
        }
        let run = ()=>{
            new Websandbox.default.create({
                graphUpdate:(update)=>{                    
                    let accumulator = [];
                    if(update instanceof Object && update.callback_id){
                        let target_container = init.workspace.__node_container.querySelector('[data-node-id="'+update.callback_id+'"]');
                        if(target_container){
                            let elements = init.workspace.__node_container.querySelectorAll('[data-parent-zone="'+update.callback_id+'"]');
                            for (let i = 0; i < elements.length; i++) {
                                if(elements[i].getAttribute("data-initializer") == "preprocessed"){
                                    elements[i].remove();
                                }else{
                                    elements[i].classList.toggle("--hide-node", true);                                    
                                }   
                            }
                        }
                        for (let i = 0; i < update.nodes.length; i++) {
                            createNodeBranch(update.nodes[i], accumulator, {initializer:"preprocessed"}, init.workspace);
                        }
                        finalizeUnconstrained(init.workspace);

                        for (let i = 0; i < accumulator.length; i++) {
                            accumulator[i].setAttribute("data-parent-zone", update.callback_id);
                        }
                    }
                    this.callback(update);
                }
            }).promise.then(sandbox=>{
                this.#sandbox = sandbox
                fetch(targetUrl).then(async v=>{
                    sandbox.run(function _(){
                        function uuidv4() {
                            return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
                              (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
                            );
                        }
                        function clean(node){
                            if(node.nodes){
                                for (let i = 0; i < node.nodes.length; i++) {
                                    clean(node.nodes[i]);
                                }
                                delete node.traverse;
                                delete node.addNode;
                                delete node.newNode;
                            }else{
                                delete node.outputs;
                                delete node.inputs;
                                delete node.linkTo;
                                delete node.removeEdge;
                                delete node.clearEdges;
                                for (let i = node.edges.length-1; i >= 0  ; i--) {
                                    const edge = node.edges[i];
                                    // node.edges.splice(i, 1)
                                    delete edge.transferEdges;
                                    clean(edge.node);
                                }
                            }
                        }
                        function toArrayTree(node){
                            let nodes = [];
                            nodes.push(node);
                            for (let e = 0; e < node.edges.length; e++) {
                                nodes.push(toArrayTree(node.edges[e].node));
                            }
                            return nodes;
                        }
                        /**
                         * Rebuilds references on a nodeDataTree
                         */
                        function transformGraphNodes(node){
                            if(node.nodes){
                                for (let i = 0; i < node.nodes.length; i++) {
                                    transformGraphNodes(node.nodes[i]);
                                }
                            }else{
                                node.outputs = new Array();
                                node.linkTo = function(toNode, fromIndex, toIndex){
                                    if(typeof toNode !== "object") throw new Error("Missing or invalid argument 0 of 'LogicNode.linkTo'. [[ArgumentType("+typeof toNode +") !== object]] A reference to a node for the edge to connect to was expected.")
                                    if(typeof fromIndex !== "number") throw new Error("Missing or invalid argument 1 of 'LogicNode.linkTo'. [[ArgumentType("+typeof fromIndex +") !== number]] An index of the logicNode instances outputs for the edge to come from was expected. ")
                                    if(typeof toIndex !== "number") throw new Error("Missing or invalid argument 2 of 'LogicNode.linkTo'. [[ArgumentType("+typeof toIndex +") !== number]] An index of one of the 'toNode' inputs for the edge to connect to was expected. ")
                                    const edge = {
                                        fromIndex, toIndex,
                                        node:toNode,
                                    };
                                    node.edges.push(edge);
                                    if(!toNode.inputs) toNode.inputs = [];
                                    if(!toNode.inputs[toIndex]) toNode.inputs[toIndex] = {incommingNodes:[]};
                                    toNode.inputs[toIndex].incommingNodes.push(node);
                                }
                                node.removeEdge = function(outputIndex, edgeIndex){
                                    if (node.outputs[outputIndex]) {
                                        let removedEdge = node.edges.splice(edgeIndex, 1)[0];
                                        node.outputs[outputIndex].edges.splice(edgeIndex, 1);

                                        // Remove the node from the incoming nodes of the target node's input
                                        let targetInput = removedEdge.node.inputs[removedEdge.toIndex];
                                        targetInput.incommingNodes = targetInput.incommingNodes.filter(n => n !== node);
                                    }
                                }
                                node.clearEdges = function(outputIndex){
                                    if (node.outputs[outputIndex]) {
                                        let outputEdges = node.outputs[outputIndex].edges;
                                        while (outputEdges.length > 0) {
                                            let removedEdge = outputEdges.pop();

                                            let edgeIndex = node.edges.indexOf(removedEdge);
                                            if (edgeIndex > -1) {
                                                node.edges.splice(edgeIndex, 1);
                                            }
                                            
                                            let targetInput = removedEdge.node.inputs[removedEdge.toIndex];
                                            targetInput.incommingNodes = targetInput.incommingNodes.filter(n => n !== node);
                                        }
                                    }
                                }
                                for (let ie = 0; ie < node.edges.length; ie++) {
                                    const edge = node.edges[ie];
                                    if(!node.outputs[edge.fromIndex]){
                                        node.outputs[edge.fromIndex] = {
                                            transferEdges(toMod, toIndex){
                                                for (let i = node.edges.length-1; i >= 0 ; i--) {
                                                    if(node.edges[i].fromIndex == ie){
                                                        let edg = node.edges.splice(i,1)[0];
                                                        edg.fromIndex = toIndex;
                                                        toMod.edges.push(edg);
                                                    }
                                                }
                                            },
                                            edges: [],
                                        }
                                    }
                                    node.outputs[edge.fromIndex].edges.push(edge);
                                    if(!edge.node.inputs){
                                        edge.node.inputs = new Array();
                                    }
                                    if(!edge.node.inputs[edge.toIndex]){
                                        edge.node.inputs[edge.toIndex] = {
                                            incommingNodes: new Array()
                                        }
                                    }
                                    edge.node.inputs[edge.toIndex].incommingNodes.push(node);
                                    transformGraphNodes(edge.node);
                                }
                            }
                            return node
                        }
                        function __intakeGraph(graph){
                            graph.traverse = (handler)=>{
                                let queue = new Array();
                                for (let i = 0; i < graph.nodes.length; i++) {
                                    queue.push(toArrayTree(graph.nodes[i]));
                                }
                                queue = queue.flat(10000);
                                for (let i = 0; i < queue.length; i++) {
                                    handler(queue[i]);
                                }
                            }
                            graph.addNode = (type, memory=undefined)=>{
                                graph.nodes.push(transformGraphNodes({
                                    type: type,
                                    id: uuidv4(),
                                    edges:[],
                                    memory: memory || {},
                                }));
                                return graph.nodes[graph.nodes.length-1];
                            }
                            graph.newNode = (type, memory=undefined)=>{
                                return transformGraphNodes({
                                    type: type,
                                    id: uuidv4(),
                                    edges:[],
                                    memory: memory || {},
                                });
                            }
                            processor(transformGraphNodes(graph));
                            clean(graph)
                            Websandbox.connection.remote.graphUpdate(graph);
                        }
                        globalThis.__intakeGraph = __intakeGraph;
                    })
                    sandbox.run(await v.text());
                });
            });
        };
        if(document.readyState == "loading"){
            document.addEventListener("DOMContentLoaded", run);
        }else{
            run();
        }
    }
    update(dataTree, uid){
        return new Promise((resolve, reject) => {
            dataTree.callback_id = uid;
            this.#sandbox.run("__intakeGraph("+JSON.stringify(dataTree)+")");
            this.callback = resolve
        });
    }
}

const PrecisionZones = {
    getFactorAt(x, y){        
        let elements = document.elementsFromPoint(x, y);
        let factor = 1;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if(element.hasAttribute("data-precision")){
                factor = factor * parseInt(element.getAttribute("data-precision"));
                if(element.classList.contains("--absolute")){
                    break
                }
            }
        }
        return factor
    }
}
window.PrecisionZones = PrecisionZones;

const MODULE_OPERATIONS = [">", ">=", "<","<=","==","+", "-", "/", "*", "save", "clamp", "rand"]
// Move to the workspace instance
let editor_settings = {
    floatDisplayEnabled: true,
    bits_float_conversion: true,
    bits_float_resolution: 1000,
};

const pi = 3.14159;

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function createEdge(){
    let edge = document.createElement("edge");    
    return edge;
}
function updateEdgePosition(edge, fromPos, toPos){
    edge.style.left = fromPos.x+"px";
    edge.style.top = fromPos.y+"px";
    let ydelta = toPos.y - fromPos.y;
    let xdelta = fromPos.x - toPos.x;
    edge.style.transform = "rotate("+Math.atan2(xdelta, ydelta) * (180/pi)+"deg)";
    edge.style.height = Math.sqrt(xdelta*xdelta + ydelta*ydelta)+"px"
}

function spawnDropdown(options, x=0, y=0){
    const dropdown = document.createElement("dropdown-menu");
    dropdown.style.left= x;
    dropdown.style.top= y;
    if(y>window.screen.height/7){
        dropdown.style.top= Math.max(10, window.screen.height/7-y);
    }
    let lastList = document.createElement("ul");
    dropdown.classList.add("ubuntu-regular");
    for (let i = 0; i < options.length; i++) {
        if(typeof options[i] == "string") {
            const header = document.createElement("h4");
            header.innerText = options[i];
            if(lastList.lastElementChild) dropdown.appendChild(lastList);
            lastList = document.createElement("ul");
            dropdown.appendChild(header);
        }else{
            const option = document.createElement("li");
            if(options[i].icon){
                const icon = document.createElement("div");
                icon.classList.add("icon");
                icon.style.maskImage = "url("+options[i].icon+")";
                option.appendChild(icon);
            }
            const label = document.createElement("span");
            label.innerText = options[i].title;
            option.appendChild(label);
            if(options[i].handler instanceof Function){
                option.addEventListener("pointerdown", function(ev){
                    options[i].handler(ev);
                    dropdown.remove();
                });
            }
            lastList.appendChild(option);
        }
    }
    if(lastList.lastElementChild) dropdown.appendChild(lastList);
    document.body.appendChild(dropdown);
    dropdown.tabIndex = "-1";
    dropdown.focus();
    dropdown.addEventListener("blur", function(){
        dropdown.remove();
    });
    return dropdown;
}

function isConnectionEl(element){
    return element.classList.contains("node-output") || element.classList.contains("node-input")
}

class LogicNode{
    constructor(identifier, workspace, initializer, memory={}, id=undefined){
        let template = NODE_TYPES.get(identifier);
        if(!template){
            throw new Error("Invalid logic node type:", identifier);
        }
        
        let element = document.createElement("logic-node");
        element.classList.add("logic-"+identifier.replaceAll("_","-"), "noselect");
        element.classList.add("ubuntu-regular");
        element.setAttribute("data-node-id", id || uuidv4());
        element.setAttribute("data-initializer", initializer);

        const header = document.createElement("header");
        element.appendChild(header);

        if(template.signalSource){
            element.classList.add("signal-source")
        }
        if(template.tooltip){
            attachTooltip(element, template.tooltip);
        }
        
        this.__template = template;
        this.__element = element;
        element.__node = this;
        this.outputs = new Array(this.__template.outputCount||0);
        this.inputs = new Array(this.__template.inputCount||0);
        this.__processors = [];

        this.memory = new Proxy(memory, {
            get(memory, key){
                return memory[key];
            },
            set(memory, key, value){
                if(memory[key] == value) return true;
                memory[key] = value;
                if(element.parentElement){
                    if(!workspace.readonly) workspace.__dirty = true;
                    element.closest(".logic-workspace").__dirty = true;
                    element.__node.renderModule();
                }
                return true
            }
        });
        this.memory.input_states =  new Array(this.__template.inputCount)
        this.memory.previous_input_states =  new Array(this.__template.inputCount)

        const connections = document.createElement("div");
        connections.classList.add("node-connections");
        header.before(connections);
        for(let i=0; i<template.outputCount; i++){
            const output = document.createElement("node-connection");
            output.classList.add("node-output");
            output.setAttribute("data-output", i);
            connections.appendChild(output);
            const edgeTarget = document.createElement("div");
            edgeTarget.classList.add("edge-target");
            output.appendChild(edgeTarget);
        }
        this.inputPulseCounts = new Array(template.inputCount)
        let thisnode = this;
        for(let i=0; i<template.inputCount; i++){
            this.memory.input_states[i] = {};
            this.memory.previous_input_states[i] = {};
            this.inputPulseCounts[i] = 0;
            this.inputs[i] = {
                incommingNodes:[]
            }
        }
        for (let i = 0; i < template.outputCount; i++) {
            this.outputs[i] = {
                send(signal){
                    element.querySelector(".node-connections").children[i].classList.toggle("--powered", signal.powered);
                    this.lastPoweredState = this.poweredState;
                    this.poweredState = signal.powered;
                    this.sentSignal = true;
                    for (let i = 0; i < this.__edges.length; i++) {
                        let edge = this.__edges[i];
                        if(edge.edgeEl.classList.contains("--hide-node") || edge.node.__element.classList.contains("--hide-node")){
                            continue;
                        }
                        edge.edgeEl.classList.toggle("--powered", signal.powered);
                        edge.node.__element.querySelector(".node-connections.inputs").children[edge.toIndex].classList.toggle("--powered", signal.powered);
                        if(thisnode.debugger){
                            thisnode.debugger.report(this, signal, edge, thisnode);
                            if(thisnode.debugger.paused){
                                continue;
                            }
                        }
                        edge.node.propogateSignal(signal, edge);
                    }
                },
                transferEdges(toNode, toIndex){
                    for (let i = this.__edges.length-1; i >= 0 ; i--) {
                        const edge = this.__edges[i];
                        edge.fromIndex = toIndex;
                        toNode.__edges.push(edge);
                        toNode.outputs[toIndex].__edges.push(edge);
                        delete this.__edges[i];
                    }
                },
                sentSignal: false,
                __edges: [],
                poweredState: false,
                lastPoweredState: false,
            }
        }

        element.propogateSignal = this.propogateSignal.bind(this);
        element.propogateSource = this.propogateSource.bind(this);
        let previewEdge;

        let dragNode = (ev, recurse = true)=>{
            if(recurse){
                element.style.left = Math.round((dragNodeStartX + (ev.clientX- dragStartX)))+"px";
                element.style.top = Math.round((dragNodeStartY + (ev.clientY - dragStartY)))+"px";
                for (let i = 0; i < multinodeOpTargets.length; i++) {
                    if(multinodeOpTargets[i].element == element) continue;
                    multinodeOpTargets[i].element.style.left = Math.round((multinodeOpTargets[i].startX + (ev.clientX - dragStartX)))+"px";
                    multinodeOpTargets[i].element.style.top = Math.round((multinodeOpTargets[i].startY + (ev.clientY - dragStartY)))+"px";
                    multinodeOpTargets[i].element.__node.__dragNode(ev, false);
                }
            }
            this.updateEdgeElements();
            if(!recurse){
                return;
            }
            for (let inp = 0; inp < this.inputs.length; inp++) {
                const input = this.inputs[inp];
                for (let i = 0; i < input.incommingNodes.length; i++) {
                    const node = input.incommingNodes[i];
                    node.__dragNode(ev, false);
                }               
            }
        }
        let dragEdge = (ev)=>{
            const grabbedrect = grabbedElement.firstElementChild.getBoundingClientRect();
            const workspaceRect = grabbedElement.closest(".logic-workspace").getBoundingClientRect();

            updateEdgePosition(previewEdge, {x:grabbedrect.x-workspaceRect.left, y:grabbedrect.y-workspaceRect.top}, {
                x:ev.clientX-workspaceRect.left,
                y:ev.clientY-workspaceRect.top,
            })
            previewEdge.classList.toggle("--powered", grabbedElement.classList.contains("--powered"));
        }

        let drag = false;
        let dragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let dragNodeStartX = 0;
        let dragNodeStartY = 0;
        let grabbedElement;
        let lastSelected;
        element.addEventListener('mousedown', (ev) => {      
            grabbedElement = ev.target;
            
            drag = false;
            dragging = true
            dragStartX = ev.clientX;
            dragStartY = ev.clientY;

            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
        });
        let multinodeOpTargets = [];
        function mousemove(ev){
            if(!drag){
                let styles= getComputedStyle(element);
                dragNodeStartX = parseInt(styles.left)||0;
                dragNodeStartY = parseInt(styles.top)||0;
                if(isConnectionEl(grabbedElement)){
                    previewEdge = createEdge();
                    element.parentElement.appendChild(previewEdge);
                    if(grabbedElement.classList.contains("--powered")) previewEdge.classList.add("--powered");
                }else{
                    let highlighted = element.parentElement.querySelectorAll("logic-node.selection-highlighted");
                    multinodeOpTargets.length = highlighted.length;
                    for (let i = 0; i < highlighted.length; i++) {
                        const element = highlighted[i];
                        let styles= getComputedStyle(element);
                        multinodeOpTargets[i] = {
                            element,
                            startX: parseInt(styles.left)||0,
                            startY: parseInt(styles.top)||0,
                        }
                    }
                    if(highlighted.length>0){
                    }
                }
            }
            drag = true;
            if(drag&&dragging) {
                if(isConnectionEl(grabbedElement)) dragEdge(ev);
                else dragNode(ev)
            }
        }
        this.__dragNode = dragNode.bind(this);
        let mouseup = (ev)=>{
            if(drag && previewEdge && previewEdge.parentElement){
                previewEdge.remove();
                let els = document.elementsFromPoint(ev.clientX, ev.clientY);
                for (let i = 0; i < els.length; i++) {
                    if(grabbedElement.classList.contains("node-input")){
                        if(els[i].hasAttribute("data-output")){
                            this.linkTo(els[i].closest("logic-node").__node, parseInt(grabbedElement.getAttribute("data-input")), parseInt(els[i].getAttribute("data-output")));
                            break
                        }
                    }else{
                        if(els[i].hasAttribute("data-input")){
                            this.linkTo(els[i].closest("logic-node").__node, parseInt(grabbedElement.getAttribute("data-output")), parseInt(els[i].getAttribute("data-input")));
                            break
                        }
                    }
                }
            }else if(drag){
                this.__element.closest(".logic-workspace").__dirty = true;
            }else{
                let lastSelected = document.querySelector(".--selected");
                if(lastSelected) lastSelected.classList.remove("--selected");

                element.classList.add("--selected");
                
                this.renderSettings();
            }

            dragging = false; 
            document.removeEventListener('mouseup', mouseup);
            document.removeEventListener('mousemove', mousemove);
        }

        // IInitialize the module
        switch (template.identifier) {
            case "button_input":
                this.memory.toggle_state = false;
                element.interact = (playerID, start)=>{
                    this.memory.toggle_state = start;
                }
                break;
            case "switch_input":
                if(!this.memory.toggle_state) this.memory.toggle_state = false;
                element.interact = (playerID, start)=>{
                    if(!start) return;
                    this.memory.toggle_state = !this.memory.toggle_state
                    // this.propogateSource(this.memory.toggle_state)
                }
                break;
            case "bit_module":
                if(!this.memory.storedSign) this.memory.storedSign = ">";
                if(!this.memory.input_states[1])this.memory.input_states[1] = {};
                if(!this.memory.input_states[1].bits) this.memory.input_states[1].bits = 0;
            case "bit_node":
                if(!this.memory.storedBitConstant) this.memory.storedBitConstant = 1;
            case "signal_sustain":
            case "signal_delay":
                if(!this.memory.storedTime) this.memory.storedTime = 0.2;
                break;
            case "signal_repeat":
                if(!this.memory.storedTime) this.memory.storedTime = 0.3;
                break;
            default:
                break;
        }

        const inputs = document.createElement("div");
        inputs.classList.add("node-connections");
        inputs.classList.add("inputs");
        for(let i=0; i<template.inputCount; i++){
            const input = document.createElement("node-connection");
            input.classList.add("node-input");
            input.setAttribute("data-input", i);
            inputs.appendChild(input);
            const edgeTarget = document.createElement("div");
            edgeTarget.classList.add("edge-target");
            input.appendChild(edgeTarget);
        }
        element.appendChild(inputs);
        if(this.__template.customRenderer){
            element.classList.add("custom-renderer");
        }
    }
    updateEdgeElements(recurse = true){
        for (let out = 0; out < this.outputs.length; out++) {
            for (let i = 0; i < this.outputs[out].__edges.length; i++) {
                const edge = this.outputs[out].__edges[i];
                let workspaceRect = edge.edgeEl.closest(".logic-workspace").getBoundingClientRect();
                const inputRect = edge.node.__element.querySelector(".node-connections.inputs").children[edge.toIndex].firstElementChild.getBoundingClientRect();
                const outputRect = this.__element.querySelector(".node-connections").children[edge.fromIndex].firstElementChild.getBoundingClientRect();
                if(edge.node.__element.classList.contains("--hide-node")){
                    edge.edgeEl.classList.add("--hide-node");
                }else{
                    updateEdgePosition(edge.edgeEl, {x:outputRect.left-workspaceRect.left, y:outputRect.top-workspaceRect.top}, {x:inputRect.left-workspaceRect.left, y:inputRect.top-workspaceRect.top})
                }
            }
        }
        if(!recurse) return;
        for (let inp = 0; inp < this.inputs.length; inp++) {
            for (let i = 0; i < this.inputs[inp].incommingNodes.length; i++) {
                this.inputs[inp].incommingNodes[i].updateEdgeElements(false);
            }
        }
    }
    linkTo(node, fromIndex, toIndex){
        if(node instanceof HTMLElement) node = node.__node;
        const input = node.__element.querySelector(".node-connections.inputs").children[toIndex];
        const output = this.__element.querySelector(".node-connections").children[fromIndex];
        input.classList.add("--connected"); // By adding instead of toggling on, the number of instances of the class reflects the number of connections; Meaning no counting is needed when adding or remocing edges
        output.classList.add("--connected");

        node.inputs[toIndex].incommingNodes.push(this);
        
        let edgeEl = createEdge();
        let edge = {node, fromIndex, toIndex, edgeEl}
        this.outputs[fromIndex].__edges.push(edge);
        // Inherit the initializer
        edgeEl.setAttribute("data-initializer", this.__element.getAttribute("data-initializer"));

        this.__element.parentElement.appendChild(edgeEl);
        this.__dragNode({})
        this.__element.closest(".logic-workspace").__dirty = true;

        // Reorder the branches sourcenodes execution order
        let reorder = (node)=>{
            if(node.__template.signalSource){
                node.__element.parentElement.prepend(node.__element);
            }
            for (let i = 0; i < node.outputs.length; i++) {
                const output = node.outputs[i];
                for (let i = 0; i < output.__edges.length; i++) {
                    const edge = output.__edges[i];
                    reorder(edge.node);
                }
            }
        }
        reorder(node);
    }
    getElement(){
        return this.__element;
    }
    renderSettings(){
        const settingsPanel = this.__element.closest(".logic-workspace").previousElementSibling;

        let open = ()=>{
            requestIdleCallback(()=>{
                settingsPanel.querySelector(".header h3").innerText = this.__template.title;
                
                settingsPanel.classList.toggle("--has-settings", !!this.__template.hasSettings)
                const configurationTarget = settingsPanel.querySelector(".configuration-target"); 
                
                while(configurationTarget.firstElementChild) configurationTarget.firstElementChild.remove();
                
                switch (this.__template.identifier) {
                    case "signal_delay":
                    case "signal_sustain":
                    case "signal_repeat":
                        let timelabel = document.createElement("label");
                        timelabel.innerText = "Time Value";
                        configurationTarget.appendChild(timelabel);
        
                        let timeValue = document.createElement("input");
                                
                        timeValue.addEventListener("input",()=>{
                            let value = 0.2;
                            if(this.__template.identifier == "signal_repeat") value = 0.3;
                            if(parseFloat(timeValue.value) == parseFloat(timeValue.value)) value = parseFloat(timeValue.value);
                            this.memory.storedTime = Math.max(value, 0.2);
                            if(this.__template.identifier == "signal_repeat") this.memory.storedTime = Math.max(value, 0.3);
                            this.memory.storedTime = Math.min(this.memory.storedTime, 10);
                        });
                        timeValue.addEventListener("change",()=>{
                            timeValue.value = this.memory.storedTime;
                        });
                        
                        configurationTarget.appendChild(timeValue);
                        
                        timeValue.value = this.memory.storedTime;
                        break;
                    case "bit_node":
                        let label = document.createElement("label");
                        label.innerText = "Bit Value";
                        configurationTarget.appendChild(label);
        
                        let bitValue = document.createElement("input");
                                
                        bitValue.addEventListener("input",()=>{
                            let value = 1;
                            value = parseFloat(bitValue.value);
                            this.memory.storedBitConstant = value;
                        });
                        
                        configurationTarget.appendChild(bitValue);
                        
                        bitValue.value = this.memory.storedBitConstant;
                        break;
                    case "bit_module":
                        let operationLabel = document.createElement("label");
                        operationLabel.innerText = "Operation";
                        configurationTarget.appendChild(operationLabel);
        
                        let operationInput = document.createElement("select");
                        configurationTarget.appendChild(operationInput);
                        for (let i = 0; i < MODULE_OPERATIONS.length; i++) {
                            let option = document.createElement("option");
                            option.innerText = MODULE_OPERATIONS[i];  
                            operationInput.appendChild(option);
                        }
                        operationInput.value = this.memory.storedSign;
                        operationInput.onchange = ()=>{
                            this.memory.storedSign = operationInput.value;
                        }

                        let inputbLabel = document.createElement("label");
                        inputbLabel.innerText = "InputB's Memorized Bit value";
                        configurationTarget.appendChild(inputbLabel);
                        
                        let inputbValue = document.createElement("input");
                        configurationTarget.appendChild(inputbValue);
                        
                        inputbValue.value = this.memory.storedBitConstant;
                        inputbValue.onchange = ()=>{
                            if(parseFloat(inputbValue.value) == parseFloat(inputbValue.value)){
                                this.memory.storedBitConstant = parseFloat(inputbValue.value);
                            }
                            inputbValue.value = this.memory.storedBitConstant;                        
                        }
                        break;
                    case "precision_zone":
                        let precisionLabel = document.createElement("label");
                        precisionLabel.innerText = "Precision Value";
                        configurationTarget.appendChild(precisionLabel);
        
                        let precisionValue = document.createElement("input");
                                
                        precisionValue.value = this.memory.precision;
                        
                        precisionValue.addEventListener("input",()=>{
                            let value = parseInt(precisionValue.value);
                            this.memory.precision = value;
                            this.__element.setAttribute("data-precision", String(node.memory.precision));
                        });
                        
                        configurationTarget.appendChild(precisionValue);
                        
                        let zoneTypeInput = document.createElement("select");
                        configurationTarget.appendChild(zoneTypeInput);
                        let optVals = ["Relative", "Absolute"];
                        for (let i = 0; i < optVals.length; i++) {
                            let option = document.createElement("option");
                            option.innerText = optVals[i];  
                            zoneTypeInput.appendChild(option);
                        }
                        zoneTypeInput.value = this.memory.zoneType;
                        zoneTypeInput.onchange = ()=>{
                            this.memory.zoneType = zoneTypeInput.value;
                        }

                        break;
                        default:
                        break;
                }
                
                document.body.classList.add("--configuration-open");
            },{
                timeout:500,
            });
        }

        if(document.body.classList.contains("--configuration-open")){
            document.body.classList.remove("--configuration-open");
            setTimeout(open, 200);
        }else{
            open();
        }
    }
    renderModule(){
        const parent = this.__element.querySelector("header");
        while(parent.firstElementChild) parent.firstElementChild.remove();

        const img = document.createElement("img");
        img.src = this.__template.imgSrc;
        img.classList.add("no-select")
        parent.appendChild(img);

        let bitsLabel;
        switch (this.__template.identifier) {
            case "bit_node":
                bitsLabel = document.createElement("label");
                let resolution = PrecisionZones.getFactorAt(parseInt(this.__element.style.left||"0"), parseInt(this.__element.style.top||"0"));
                if(editor_settings.floatDisplayEnabled){
                    bitsLabel.innerText = Math.round(this.memory.storedBitConstant*resolution) / resolution;
                }else{
                    bitsLabel.innerText = Math.round(this.memory.storedBitConstant*resolution);
                }             
                parent.appendChild(bitsLabel);
                break;
            case "bit_display":
                bitsLabel = document.createElement("label");
                parent.appendChild(bitsLabel);
                
                if(!this.memory.input_states[0].bits || !this.memory.input_states[0].powered) {
                    bitsLabel.innerText = 0;
                    
                    break;
                }
                if(editor_settings.floatDisplayEnabled){
                    bitsLabel.innerText = this.memory.input_states[0].bits / PrecisionZones.getFactorAt(parseInt(parent.parentElement.style.left||"0"), parseInt(parent.parentElement.style.top||"0"));
                }else{
                    bitsLabel.innerText = this.memory.input_states[0].bits;
                }
                break;        
            case "bit_module":
                let aInput = document.createElement("label");
                let signLabel = document.createElement("label");
                let bInput = document.createElement("label");
                let pFactor = PrecisionZones.getFactorAt(parseInt(this.__element.style.left||"0"), parseInt(this.__element.style.top||"0"));
                if(this.memory.input_states[0].powered){
                    if(editor_settings.floatDisplayEnabled){
                        aInput.innerText = this.memory.input_states[0].bits / pFactor;
                    }else{
                        aInput.innerText = Math.round(this.memory.input_states[0].bits);
                    }
                }else{
                    aInput.innerText = "0";
                }

                if(editor_settings.floatDisplayEnabled){
                    bInput.innerText = (this.memory.storedBitConstant);
                }else{
                    bInput.innerText = Math.round(this.memory.storedBitConstant);
                }

                if(this.memory.storedSign){
                    signLabel.innerText = this.memory.storedSign; 
                }else{
                    signLabel.innerText = "+";
                }
                parent.appendChild(aInput)
                parent.appendChild(signLabel)
                parent.appendChild(bInput)
                break;
            
            default:
                const span = document.createElement("span");
                span.textContent = this.__template.title.split(" ")[0];
                parent.appendChild(span);
                break;
        }
        this.updateEdgeElements();
    }
    propogateSource(time){
        if(this.__element.classList.contains("--hide-node")) return;
        let signal = {...this.memory.input_states[0]};
        
        signal.startTime = time;
        signal.sourceModule = this;
        if(typeof signal.bits !== "number"){
            signal.bits = 0;
        }

        switch (this.__template.identifier) {
            case "not_gate":
                signal.powered = !!!signal.powered;
                if(signal.powered) this.outputs[0].send(signal);
                break;
            case "nand_gate":
                signal.powered = !!!(this.memory.input_states[0].powered && this.memory.input_states[1].powered);
                this.outputs[0].send(signal)
                break;
            case "xnor_gate":
                signal.powered = !((!!this.memory.input_states[0].powered + !!this.memory.input_states[1].powered) % 2 == 1);
                this.outputs[0].send(signal)
                break;
            case "nor_gate":
                signal.powered = !(!!this.memory.input_states[0].powered || !!this.memory.input_states[1].powered);
                this.outputs[0].send(signal)
                break;
            case "switch_input":
            case "button_input":
                signal.powered = this.memory.toggle_state;
                
                if(this.memory.last_toggle_state !== this.memory.toggle_state || signal.powered) this.outputs[0].send(signal);
                if(this.memory.last_toggle_state !== this.memory.toggle_state) this.memory.last_toggle_state = this.memory.toggle_state;
                break;
            case "or_gate":
                if(this.memory.input_states[0].powered && this.memory.input_states[1].powered){
                    signal.bits += this.memory.input_states[1].bits 
                    this.outputs[0].send(signal);
                }
                // else if(!this.memory.previous_input_states[0].powered && !this.memory.previous_input_states[1].powered && this.outputs[0].lastPoweredState){
                //     signal.powered = false;
                //     this.outputs[0].send(signal);
                // }
                return // Only for the or because its both a source and a syncrounous module, and is exclusively handled by one or the other
        }

        // Check if a signal was outputted and if not, output an unpowered one to update states
        for (let i = 0; i < this.outputs.length; i++) {
            const output = this.outputs[i];
            // Sources dont use the last state because they are controlling the loop
            if(output.poweredState && !this.outputs[i].sentSignal){
                signal.powered = false;
                output.send(signal);
            }
            this.outputs[i].sentSignal = false;
        }
    }
    /**
     * Kills a signal coming from an edge and renders the edge and input as being not powered
     * @param {*} inputsignal 
     * @param {*} edge 
     */
    killSignal(inputsignal, edge){
        this.memory.input_states[edge.toIndex] = {};
    }
    propogateSignal (inputsignal, edge){
        let signal = {...inputsignal};
        
        // Check if this is the first pulse of a new tick for this input
        if(this.memory.input_states[edge.toIndex].startTime !== signal.startTime){
            this.inputPulseCounts[edge.toIndex] = 0;
        }

        if(this.inputPulseCounts >= 2) {
            this.killSignal(inputsignal, edge);
            return
        }
        this.inputPulseCounts[edge.toIndex]++;
        
        // Kill the signal if its lifetime exceeds the current tick
        if(signal.startTime+200 < new Date()-0){
            this.killSignal(inputsignal, edge);
            return
        }
        
        // Update the cached signal value for this input
        if(this.memory.input_states[edge.toIndex]) this.memory.previous_input_states[edge.toIndex] = {...this.memory.input_states[edge.toIndex]}
        else this.memory.previous_input_states[edge.toIndex] = {}
        

        if(inputsignal.powered){
            this.memory.input_states[edge.toIndex] = {...inputsignal}; //save the og and not the copy so changes by the following handlers dont change the historic repersentation of the signal
        }else{
            this.memory.input_states[edge.toIndex].powered = false;
        }

        if(this.__template.customRenderer){
            this.renderModule();
        }

        switch (this.__template.identifier) {
            case "splitter":
                this.outputs[0].send(signal);
                this.outputs[1].send(signal);
                break;
            case "signal_blink":
                if(signal.powered){
                    if(!!this.memory.previous_input_states[0].powered !== signal.powered){
                        this.outputs[0].send(signal);
                        setTimeout(()=>{
                            signal.powered = false;
                            this.outputs[0].send(signal);
                        },10);
                    }
                }
                break;
            case "signal_delay":
                if(signal.powered){
                    if(!this.memory.startTime){
                        this.memory.startTime = signal.startTime-0;
                    }
                    if(this.memory.startTime+(this.memory.storedTime*1000)<=signal.startTime){
                        this.outputs[0].send(signal);
                    }
                }else{
                    delete this.memory.startTime
                    signal.powered = false;
                    this.outputs[0].send(signal);
                }
                break;
            case "signal_sustain":
                if(signal.powered){
                    if(this.memory.lastToId) clearTimeout(this.memory.lastToId);
                    delete this.memory.lastToId;
                    delete this.memory.endTime
                    this.outputs[0].send(signal);
                }else{
                    signal.powered = true;
                    this.outputs[0].send(signal);
                    this.memory.lastToId = setTimeout(()=>{
                        delete this.memory.lastToId;
                        signal.powered = false;

                        this.outputs[0].send(signal);
                    },this.memory.storedTime*1000)
                }
                break;
            case "signal_repeat":
                if(signal.powered){
                    if(this.memory.lastIId) return;
                    this.memory.lastIId = setInterval(()=>{
                        let signalCopy = {...signal};
                        signalCopy.powered = true;
                        this.outputs[0].send(signalCopy);
                        this.memory.lastToId = setTimeout(()=>{
                            signalCopy.powered = false;
                            this.outputs[0].send(signalCopy);
                        }, 200);
                    },this.memory.storedTime*1000)
                }else{
                    if(this.memory.lastToId) clearTimeout(this.memory.lastToId);
                    clearInterval(this.memory.lastIId);
                    delete this.memory.lastToId;
                    delete this.memory.lastIId;
                    this.outputs[0].send(signal);
                }
                break;
            case "and_gate":
                signal.powered = !!(this.memory.input_states[0].powered && this.memory.input_states[1].powered);
                this.outputs[0].send(signal);
                break;
            case "xor_gate":
                signal.powered = (!!this.memory.input_states[0].powered + !!this.memory.input_states[1].powered) % 2 == 1;
                this.outputs[0].send(signal);
                break;
            case "or_gate":
                if(signal.powered){
                    if((edge.toIndex == 0)){
                        if(!this.memory.input_states[1].powered){
                            this.outputs[0].send(signal);
                        }
                    }else{
                        if(!this.memory.input_states[0].powered){
                            this.outputs[0].send(signal);
                        }
                    }
                    return
                }else{
                    if(!this.memory.input_states[0].powered && !this.memory.input_states[1].powered){
                        signal.powered = false;
                    }else{
                        signal.powered = true;
                    }
                    this.outputs[0].send(signal);
                }
                break;
            case "bit_node":
                let resolution = PrecisionZones.getFactorAt(parseInt(this.__element.style.left||"0"), parseInt(this.__element.style.top||"0")); 
                if(typeof signal.bits !== "number") signal.bits = this.memory.storedBitConstant*resolution;
                else signal.bits += this.memory.storedBitConstant*resolution;
                this.outputs[0].send(signal);
                break;
            case "bit_module":
                let passed = true;
                if(edge.toIndex == 0){
                    if(signal.powered){
                        let resolution = PrecisionZones.getFactorAt(parseInt(this.__element.style.left||"0"), parseInt(this.__element.style.top||"0")); 
                        let valueB
                        if(editor_settings.floatDisplayEnabled){
                            if(this.memory.storedBitConstant){
                                valueB =  this.memory.storedBitConstant;
                            }else{
                                valueB = this.memory.input_states[1].bits / resolution;
                            }
                            valueB = Math.round(valueB*resolution)/resolution;
                        }else{
                            valueB = Math.round(this.memory.storedBitConstant)
                        }
                        switch (this.memory.storedSign) {
                            case ">":
                                passed = signal.bits > valueB*resolution;
                                break;
                            case "<":
                                passed = signal.bits < valueB*resolution;
                                break;
                            case ">=":
                                passed = signal.bits >= valueB*resolution;
                                break;
                            case "<=":
                                passed = signal.bits <= valueB*resolution;
                            case "==":
                                passed = signal.bits == valueB*resolution;
                            case "+":
                                signal.bits = signal.bits + valueB*resolution
                                break;
                            case "-":
                                signal.bits = signal.bits - valueB*resolution
                                break;
                            case "/":
                                signal.bits = signal.bits / valueB
                                break;
                            case "*":
                                signal.bits = signal.bits * valueB
                                break;
                            default:
                                break;
                        }
                        signal.powered = passed
                    }else{
                        signal.powered = false; 
                    }
                    signal.bits = Math.round(signal.bits);
                    this.outputs[0].send(signal);
                }else if(edge.toIndex == 1){
                    let resolution = PrecisionZones.getFactorAt(parseInt(this.__element.style.left||"0"), parseInt(this.__element.style.top||"0")); 
                    if(!signal.bits){
                        this.memory.storedBitConstant = 0;
                    }else{
                        this.memory.storedBitConstant = signal.bits/resolution;
                    }
                }
            case "xnor_gate":
            case "nor_gate":
            case "not_module": // Some source-signal emitting modules have their unpowering strictly handled by the propogateSource method
                return
            default:
                break;
        }

        // Check if a signal was outputted and if not, output an unpowered one to update states
        for (let i = 0; i < this.outputs.length; i++) {
            if(this.outputs[i].lastPoweredState && !this.outputs[i].sentSignal){
                signal.powered = false;
                this.outputs[i].send(signal);
            }
            this.outputs[i].sentSignal = false;
        }
    }
    connectPreprocessor(processor){
        this.__processors.push(processor);
    }
}

class LogicWorkspace{
    #readonly = false;
    readonly = false;
    constructor(dependenciesMap){
        let element = document.createElement("logic-workspace");
        element.innerHTML = `
            <div class="panel">
                <button id="add-node">Add Node<img src="/media/icons/plus-svgrepo-com.svg" height="20"></button>
                <hr>
                <button id="load_workspace">Load<img height="20" src="/media/icons/upload-svgrepo-com.svg"></button>
                <select id="workspace_view"><option>Source Code</option><option>Preprocessed</option></select>
                <button id="source_control" disabled="true"><span class="label"></span><img height="20" src="/media/workspace_icons/source-control-svgrepo-com.svg"></button>
                <button id="settings" style="display: none;"><img height="20" src="/media/workspace_icons/settings-svgrepo-com.svg"></button>
                <button id="theme_manager"><img height="20" src="/media/tools/color-adjustement-mode-channels-svgrepo-com.svg"></button>
            </div>
            <div class="workspace-container" style="--module-color: #ecebeb;">
                <div class="module-settings-panel">
                    <div class="header ubuntu-medium">
                        <h3>BitNode</h3>
                    </div>
                    <div class="object-info">
                        <h4 class="ubuntu-bold">Object Info</h4>
                        <p class="ubuntu-medium-italic">outputs a bit value dpending hjsfdgh</p>
                    </div>
                    <h4 class="ubuntu-bold configuration-title">Configuration</h4>
                    <div class="configuration-target"></div>
                </div>
            </div>
        `;
        this.element = element;

        this.debugger = new dependenciesMap["logic-debugger"].Debugger(this);

        let nodeContainer = document.createElement("div");
        nodeContainer.className = "logic-workspace";
        element.querySelector(".workspace-container").appendChild(nodeContainer);             
        this.__node_container = nodeContainer;
        this.__dirty = false;
        this.__processors = [];
        let lastDropdown;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let savesList, sourceControlPanel;
        let project;

        var autoSave = ()=>{
            if((this.__dirty || this.__node_container.__dirty) && project && !this.#readonly){
                this.__dirty = false;
                this.__node_container.__dirty = false;
                project.save();
            }
        };
        var autoSaveLoop = setInterval(()=>{
            requestIdleCallback(autoSave);
        },1500);

        const loadHandler = (ev)=>{
            project = ev.detail;
            element.querySelector("#source_control .label").innerText = project.name+" "+project.version;
            element.querySelector("#source_control").removeAttribute("disabled");
            while(this.__node_container.firstChild) this.__node_container.firstChild.remove();
            for (let i = 0; i < project.nodes.length; i++) {
                createNodeBranch(project.nodes[i], undefined, {initializer:"sourcecode"}, this);
            }
            finalizeUnconstrained(this);
        }
        nodeContainer.addEventListener("projectLOAD", loadHandler);
        Object.defineProperty(this, "loadedProject", {get:()=>{return project}});
        Object.defineProperty(this, "readonly", {
            get(){
                return this.#readonly;
            },
            set(v){
                nodeContainer.classList.toggle("--readonly", !!v);
                this.#readonly = !!v;
            }
        })
        function addNodeClick(){
            spawnDropdown(createAddNodeDropdown(), lastMouseX, lastMouseY);
        }
        let loadWorkspaceClick = ()=>{
            if(savesList) return document.body.appendChild(savesList);
            savesList = new dependenciesMap.savesList.Panel();
            savesList.instigatorWorkspace = this;
            document.body.appendChild(savesList);
        }
        let openSourceControl = ()=>{
            if(sourceControlPanel) return document.body.appendChild(sourceControlPanel);
            sourceControlPanel = new dependenciesMap.sourceControl.Panel();            
            document.body.appendChild(sourceControlPanel);
            sourceControlPanel.instigatorWorkspace = this;
        }
        let openSettings = ()=>{
            document.body.appendChild(document.createElement("project-settings"));
        }
        const addNode =  element.querySelector("#add-node");
        const loadWorspace =  element.querySelector("#load_workspace");
        const sourceControl = element.querySelector("#source_control");
        const workspaceView = element.querySelector("#workspace_view");
        const themeManager = element.querySelector("#theme_manager");
        const settings = element.querySelector("#settings");
        themeManager.addEventListener("click", window.openThemeManager);
        workspaceView.value = "Source Code";
        let changeWorkspaceView = (ev)=>{
            switch (workspaceView.value) {
                case "Source Code":
                    editor_settings.floatDisplayEnabled = true;

                    if(!nodeContainer.classList.contains("--preprocessedview")) return;
                    nodeContainer.classList.remove("--preprocessedview");
                    let sourceNodes = nodeContainer.querySelectorAll('[data-initializer="sourcecode"]');
                    let processedNodes = nodeContainer.querySelectorAll('[data-initializer="preprocessed"]');
                    for (let i = 0; i < sourceNodes.length; i++) {
                        sourceNodes[i].classList.remove("--hide-node");
                        if(sourceNodes[i].__node) sourceNodes[i].__node.renderModule();
                    }
                    for (let i = 0; i < processedNodes.length; i++) {
                        processedNodes[i].classList.add("--hide-node");
                    }
                    this.readonly = false;
                    break;
                case "Preprocessed":
                    nodeContainer.classList.toggle("--preprocessedview", true);
                    this.readonly = true; 
                    editor_settings.floatDisplayEnabled = false;
                    this.preprocessGraph();
                    break;
            
                default:
                    break;
            }
            ;
        }   
        workspaceView.addEventListener("change", changeWorkspaceView);
        sourceControl.addEventListener("click", openSourceControl);
        addNode.addEventListener("click", addNodeClick);        
        loadWorspace.addEventListener("click", loadWorkspaceClick);
        settings.addEventListener("click", openSettings);
        let addAtMouseHandler = (identifier)=>{
            return ()=>{
                this.addNode(identifier, lastMouseX, lastMouseY, "sourcecode");
            }
        }
        function createAddNodeDropdown(){
            let categories = {};
            for (const template of NODE_TYPES.values()) {
                let category = categories[template.category];
                if(!category){
                    categories[template.category] = [];
                    category = categories[template.category]
                }
                category.push(template);
            }
            let categoryPairs = Object.entries(categories);
            return categoryPairs.map(([category, nodes])=>{
                nodes = nodes.map(node => {return {title:node.title, icon:node.imgSrc, handler: addAtMouseHandler(node.identifier)}})
                return [category, nodes].flat(1)
            }).flat(1);
        }

        document.addEventListener("keydown", async (ev)=>{
            if(ev.repeat) return;
            if(ev.key == "c" && ev.ctrlKey){
                let selectedNode = document.querySelectorAll(".selection-highlighted");
                let clipboardURL = new URL(location.origin+"/coppied-nodes");
                clipboardURL.searchParams.append("-",btoa(JSON.stringify(this.getDataTree(selectedNode, true))));
                copyToClipboard(clipboardURL.toString());
            }
            if(ev.key == "f"){
                let elements = document.elementsFromPoint(lastMouseX, lastMouseY);
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    if(element.interact){
                        element.interact("DefaultPlayer", true);
                    }
                }
            }
            if(this.readonly) return
            if(ev.key == "v" && ev.ctrlKey){
                document.querySelector('textarea.pastebox').value = "";
                const interpretNodes = ()=>{
                    try{
                        this.pasteNodes(decodeURIComponent(document.querySelector('textarea.pastebox').value.substring((location.origin.toString()+"/coppied-nodes?-=").length)));
                    }catch(error){
                        alert("Unable to decode the pasted nodes. Please make sure the node-selection you paste is valid.");
                    }
                }
                try {
                    const text = await navigator.clipboard.readText()
                    document.querySelector('textarea.pastebox').value += text;
                    interpretNodes();
                } catch (error) {
                    console.warn(error);
                    document.querySelector('textarea.pastebox').focus();
                    const result = document.execCommand('paste');
                    
                    if(document.querySelector('textarea.pastebox').value.length){
                        interpretNodes();
                    }else{
                        alert("Your browser does not support 'paste' operations");
                    }
                }
            }
            if(ev.key == "A" && ev.shiftKey){
                if(lastDropdown instanceof HTMLElement){
                    lastDropdown.remove();
                }
                lastDropdown = spawnDropdown(createAddNodeDropdown(), lastMouseX, lastMouseY);
            }
            if(ev.key == "D" && ev.shiftKey){
                const dataTree = this.getDataTree(nodeContainer.querySelectorAll(".selection-highlighted"), true);
                
                const pasteString = btoa(JSON.stringify(dataTree));
                this.pasteNodes(pasteString, {
                    x:20,
                    y:20
                });
            }
            if(ev.key == "Delete" || ev.key == "Backspace"){
                let selected = nodeContainer.querySelectorAll(".selection-highlighted");
                if(selected.length>0){
                    this.removeNodes(selected);
                }else{
                    if(document.activeElement.closest(".module-settings-panel")) return
                    this.removeNodes([nodeContainer.querySelector("logic-node.--selected")]);
                }
            }
            
        });
        document.addEventListener("keyup", function(ev){
            if(ev.key == "f"){
                let elements = document.elementsFromPoint(lastMouseX, lastMouseY);
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    if(element.interact){
                        element.interact("DefaultPlayer", false);
                    }
                }
            }
        });
        
        let nodeContainerDragStart = {};
        let selectionPreview;  
        function mousemove(ev){
            lastMouseX = ev.clientX;
            lastMouseY = ev.clientY;
            if(selectionPreview && !selectionPreview.parentElement) selectionPreview = undefined;
            if(selectionPreview){
                if(nodeContainerDragStart.x >= ev.clientX){                    
                    selectionPreview.style.width = nodeContainerDragStart.x-ev.clientX+"px";
                    selectionPreview.style.left = ev.clientX+"px";                    
                }else{
                    selectionPreview.style.width = ev.clientX-nodeContainerDragStart.x+"px";
                    selectionPreview.style.left = nodeContainerDragStart.x+"px";                    
                }
                if(nodeContainerDragStart.y >= ev.clientY){                    
                    selectionPreview.style.height = nodeContainerDragStart.y-ev.clientY+"px";
                    selectionPreview.style.top = ev.clientY+"px";
                }else{
                    selectionPreview.style.height = ev.clientY-nodeContainerDragStart.y+"px";
                    selectionPreview.style.top = nodeContainerDragStart.y+"px";
                }
                let highlighted = nodeContainer.querySelectorAll(".selection-highlighted");
                for (let i = 0; i < highlighted.length; i++) {
                    highlighted[i].classList.remove("selection-highlighted");
                }
                highlighted = makeSelection(selectionPreview);
                for (let i = 0; i < highlighted.length; i++) {
                    highlighted[i].classList.add("selection-highlighted");
                }
            }else if(nodeContainerDragStart && Math.abs(nodeContainerDragStart.x-ev.clientX + nodeContainerDragStart.y-ev.clientY) > 0.5){
                selectionPreview = document.createElement("div");
                selectionPreview.classList.add("selection-box");
                nodeContainer.appendChild(selectionPreview);
            };
        }
        document.addEventListener("mousemove", mousemove);
        let tagsUnderMouse;
        nodeContainer.addEventListener("mousedown", function(ev){
            tagsUnderMouse  = document.elementsFromPoint(ev.clientX, ev.clientY).map((e)=> e.tagName);
            if(tagsUnderMouse.includes("LOGIC-NODE") || tagsUnderMouse.includes("NODE-CONNECTION")) return
            nodeContainerDragStart ={x:ev.clientX, y:ev.clientY};
        });
        document.addEventListener("mouseup", function(ev){
            if(selectionPreview){
                ev.preventDefault();
            }
            if(selectionPreview){
                selectionPreview.remove();
            }else if(document.elementFromPoint(lastMouseX, lastMouseY).classList.contains("logic-workspace")){ // Unselect the selection if an empty part of the workspace was clicked
                let highlighted = nodeContainer.querySelectorAll(".selection-highlighted");
                for (let i = 0; i < highlighted.length; i++) {
                    highlighted[i].classList.remove("selection-highlighted");
                }
            }            

            nodeContainerDragStart = undefined;
            selectionPreview = undefined;
        });

        nodeContainer.addEventListener("click", function(ev){
            if(ev.target !== nodeContainer) return;
            
            document.body.classList.remove("--configuration-open");
            let selectedNode = nodeContainer.querySelector("logic-node.--selected");
            if(selectedNode) selectedNode.classList.remove("--selected");
        });

        const logicTickEventLoop = setInterval(()=>{
            if(this.debugger){
                if(this.debugger.paused) return
            }
            let tickStartTime = new Date();
            
            let signalSources = this.__node_container.querySelectorAll(".signal-source:not(.--hide-node)");
            for (let i = 0; i < signalSources.length; i++) {
                const source = signalSources[i];
                source.propogateSource(tickStartTime);
            }
        }, 200);
    }
    clearNodes(){

    }
    addNode(identifier, x, y, initializer, memory=undefined, id=undefined){
        let node = new LogicNode(identifier, this, initializer, memory, id);
        if(this.debugger) node.debugger = this.debugger;
        this.__node_container.appendChild(node.getElement());
        node.renderModule();
        if(typeof x == "number" && typeof y == "number") {
            node.getElement().style.left = x+"px";
            node.getElement().style.top = y+"px";
        }
        // Handle Zones
        if(identifier == "precision_zone"){
            if(!memory){
                node.memory.precision = 100;
                node.memory.width = Math.round(window.screen.width/4);
                node.memory.height = Math.round(window.screen.height/4);
                node.memory.zoneType = "Relative";
                node.connectPreprocessor(new Preprocessor({
                    src: "./scripts/preproc/precision-zones.js",
                    workspace:this,
                }));
            }
            node.getElement().setAttribute("data-precision", String(node.memory.precision));
            node.getElement().style.width = node.memory.width+"px";
            node.getElement().style.height = node.memory.height+"px";
        }
        if(!this.readonly) this.__dirty = true;
        return node;
    }
    removeNodes(nodes){
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if(node instanceof HTMLElement){
                if(node.tagName == "EDGE") continue;
                node = node.__node;
            }
            let toRemove = this.__node_container.querySelector('[data-node-id="'+node.__element.getAttribute("data-node-id")+'"]');
            if(!toRemove) throw new Error("Node is not an anncestor of this workspace");
            
            //Update the ciruits state to reflect the missing nodes
            for (let i = 0; i < node.outputs.length; i++) {
                node.outputs[i].send({powered:false});
            }

            for (let i = 0; i < node.inputs.length; i++) {
                const input = node.inputs[i];
                for (let i = 0; i < input.incommingNodes.length; i++) {
                    const incomingNode = input.incommingNodes[i];
                    for(let i = 0; i < incomingNode.outputs.length; i++){
                        const output = incomingNode.outputs[i];
                        for (let i = output.__edges.length-1; i >= 0; i--) {
                            const edge = output.__edges[i];
                            if(edge.node.__element.getAttribute("data-node-id") == node.__element.getAttribute("data-node-id")){
                                incomingNode.__element.querySelector(".node-connections").children[edge.fromIndex].classList.remove("--connected");
                                edge.edgeEl.remove();
                                output.__edges.splice(i, 1);
                                break
                            }
                        }
                    }
                }
            }
            for (let out = 0; out < node.outputs.length; out++) {
                const output = node.outputs[out];
                for (let i = output.__edges.length-1; i >= 0; i--) {
                    output.__edges[i].edgeEl.remove();
                    output.__edges[i].node.__element.querySelector(".node-connections.inputs").children[output.__edges[i].toIndex].classList.remove("--connected");
                    output.__edges[i].node.inputs[output.__edges[i].toIndex].incommingNodes.splice(output.__edges[i].node.inputs[output.__edges[i].toIndex].incommingNodes.indexOf(node), 1);
                    output.__edges.splice(i, 1)
                }                
            }
            toRemove.remove();
        }
        if(!this.readonly) this.__dirty = true;
    }
    /**
     * Returns the nodes as a tree of objects. The returned object have no references and is JSON serializable. 
     */
    getDataTree(nodelist=undefined, reasignIDs=false, preserveOutterEdge=false){
        let tree = {
            nodes:[],
        };
        let nodeElements = this.__node_container.querySelectorAll("logic-node");
        if(nodelist) nodeElements = nodelist;

        let idMap = new Map();
        
        let parseNodeBranch = function(nodeElement){
            let moduleIdentifier = nodeElement.className.substring(6, nodeElement.className.indexOf(" ")).replaceAll("-","_");
            let id = nodeElement.getAttribute("data-node-id"); 
            if(reasignIDs){
                if(!(preserveOutterEdge && !nodeElements.includes(nodeElement))){
                    if(!idMap.has(id)) idMap.set(id, uuidv4());
                    id = idMap.get(id);
                }
            }
            let node = {
                type: moduleIdentifier,
                id,
                memory: nodeElement.__node.memory,
                edges: [],
                x: parseInt(nodeElement.style.left),
                y: parseInt(nodeElement.style.top),
            }
            for (let i = 0; i < node.memory.input_states.length; i++) {
                if(node.memory.input_states[i].sourceModule) delete node.memory.input_states[i].sourceModule;
                if(node.memory.previous_input_states[i].sourceModule) delete node.memory.previous_input_states[i].sourceModule;
            }
            for (let io = 0; io < nodeElement.__node.outputs.length; io++) {
                for (let i = 0; i < nodeElement.__node.outputs[io].__edges.length; i++) {
                    if(nodeElement.__node.outputs[io].__edges[i].node.__element.classList.contains("--hide-node")) continue;
                    // Only include the edges that connect to nodes within the selection, if ones present
                    if((preserveOutterEdge && nodeElements.includes(nodeElement))|| nodeElements.includes(nodeElement.__node.outputs[io].__edges[i].node.__element)){
                        node.edges.push({
                            fromIndex: nodeElement.__node.outputs[io].__edges[i].fromIndex,
                            toIndex: nodeElement.__node.outputs[io].__edges[i].toIndex, 
                            node: parseNodeBranch(nodeElement.__node.outputs[io].__edges[i].node.__element),
                        });
                    }
                }
            }
            if(preserveOutterEdge){
                for (let i = 0; i < nodeElement.__node.inputs.length; i++) {
                    let incommingNodes = nodeElement.__node.inputs[i].incommingNodes.filter(n => !nodeElements.includes(n.__element))
                    if(incommingNodes.length){
                        // Incoming nodes that are not in the datatrees filter (oreser)
                        if(!node.incommingEdgeIds) node.incommingEdgeIds = [];
                        for (let i = 0; i < incommingNodes.length; i++) {
                            const incomingNode = incommingNodes[i];
                            if(incomingNode.__element.classList.contains("--hide-node")) continue;
                            outputs:
                            for (let o = 0; o < incomingNode.outputs.length; o++) {
                                for (let i = 0; i < incomingNode.outputs[o].__edges.length; i++) {
                                    if(incomingNode.outputs[o].__edges[i].node == nodeElement.__node){
                                        node.incommingEdgeIds.push({
                                            id: incomingNode.__element.getAttribute("data-node-id"),
                                            toIndex: incomingNode.outputs[o].__edges[i].toIndex,
                                            fromIndex: incomingNode.outputs[o].__edges[i].fromIndex
                                        });
                                        break outputs;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(node.incommingEdgeIds){
                node.incommingEdgeIds = node.incommingEdgeIds.flat();
            }
            return node;
        }
main:
        for (let i = 0; i < nodeElements.length; i++) {
            const nodeEl = nodeElements[i];
            if(nodeEl.tagName !== "LOGIC-NODE") continue;
            for (let i = 0; i < nodeEl.__node.inputs.length; i++) {
                const input = nodeEl.__node.inputs[i];                
                for (let i = 0; i < input.incommingNodes.length; i++) {
                    if(nodeElements.includes(input.incommingNodes[i].__element)){
                        continue main;
                    }
                }
            }
            tree.nodes.push(parseNodeBranch(nodeEl));
        }
        return tree;
    }
    pasteNodes(nodeData, init=undefined){
        let decoded = JSON.parse(atob(nodeData));
        let newNodes = [];
        if(!init) init = {}
        init.initializer = "sourcecode";
        for (let i = 0; i < decoded.nodes.length; i++) {
            createNodeBranch(decoded.nodes[i], newNodes, init, this);
        }
        finalizeUnconstrained(this);
        let old = document.querySelectorAll(".selection-highlighted");
        for (let i = 0; i < old.length; i++) {
            old[i].classList.remove("selection-highlighted");
        }
        newNodes.forEach(e=>{
            e.classList.add("selection-highlighted");
        });
    }
    // Executes this workspaces preprocessors and zones proccesors respecting the heiarchy of their spacial based dependencies. Overlapping zones are processed sequentially from smallest to largest, otherwise zones are processed in parallel where possible. The workspaces pre-processors are executed last.
    async preprocessGraph(){
        const nodeContainer = this.__node_container;
        // Remove old preprocessed nodes
        this.removeNodes(nodeContainer.querySelectorAll('[data-initializer="preprocessed"]'));

        const nodes = nodeContainer.querySelectorAll("logic-node");

        let zones = [];
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i].__node;
            if(!node) continue;
            if(node.__processors instanceof Array && node.__processors.length){
                zones.push(nodes[i]);
            }
        }

        const hierarchy = buildHierarchy(zones);

        this.__node_container.setAttribute("data-node-id", "workspace");
        hierarchy.push({element:this.__node_container, children:[]});

        await dfs(hierarchy, async (element)=>{
            const node = element.__node||this;
            let nodesInZone = makeSelection(element);
            let zoneDataTree = this.getDataTree(nodesInZone, true, true);
            
            for (let i = 0; i < nodesInZone.length; i++) {
                nodesInZone[i].setAttribute("data-parent-zone", element.getAttribute("data-node-id"));
            }
            for (let i = 0; i < node.__processors.length; i++) {
                zoneDataTree = await node.__processors[i].update(zoneDataTree, element.getAttribute("data-node-id"));
                for (let i = 0; i < nodesInZone.length; i++) {
                    nodesInZone[i].classList.toggle("--hide-node", true);
                }
                nodesInZone = makeSelection(element);
            }
        });
    }
    connectPreprocessor(processor){
        this.__processors.push(processor);
    }
}

/**
 * Merges the dataTree into the targetTree by id matching the nodes and severing 
 */
function mergeDataTrees(targetTree, dataTreeRect, dataTree){
    
}

async function dfs(children, cb){
    for (let i = 0; i < children.length; i++) {
        const element = children[i];
        dfs(element.children, cb);
        await cb(element.element);
    }
}

/**
 * Calculate the area of an element based on its dimensions.
 * @param {HTMLElement} element - The HTML element.
 * @returns {number} - The area of the element.
 */
function calculateArea(element) {
    const rect = element.getBoundingClientRect();
    return rect.width * rect.height;
}

/**
 * Check if elementA overlaps with elementB.
 * @param {HTMLElement} elementA - The HTML element.
 * @param {HTMLElement} elementB - The HTML element.
 * @returns {boolean} - True if elementA overlaps elementB, otherwise false.
 */
function doesOverlap(elementA, elementB) {
    const rectA = elementA.getBoundingClientRect();
    const rectB = elementB.getBoundingClientRect();

    return (
        rectA.left < rectB.right &&
        rectA.right > rectB.left &&
        rectA.top < rectB.bottom &&
        rectA.bottom > rectB.top
    );
}

/**
 * Build a nested structure representing the visual encapsulation of elements.
 * @param {HTMLElement[]} elements - Array of HTML elements (siblings).
 * @returns {Object} - Nested structure of elements.
 */
function buildHierarchy(elements) {
    // Sort elements by size (largest to smallest)
    const sortedElements = elements.slice().sort((a, b) => calculateArea(b) - calculateArea(a));

    const hierarchy = [];

    sortedElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const item = {
            element,
            rect,
            children: []
        };

        // Find the correct parent for the current element
        let parent = null;
        for (let i = hierarchy.length - 1; i >= 0; i--) {
            if (doesOverlap(hierarchy[i].element, element)) {
                parent = hierarchy[i];
                break;
            }
        }

        if (parent) {
            parent.children.push(item);
        } else {
            hierarchy.push(item);
        }
    });

    return hierarchy;
}


/**
 * Returns a list of the target elements encompassed nodes, edges, and zones, within the workspace the target is a child of.
 * @param {HTMLElement} target 
 */
function makeSelection(target){
    if((target.getAttribute("data-node-id")||"").substring(0, 9) == "workspace"){
        return Array.from(target.children);
    }
    const encompassed = [];
    if(!target) return encompassed;
    const candidates = target.parentElement.children;
    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        if((candidate.tagName == "LOGIC-NODE" || candidate.tagName == "EDGE") && !candidate.classList.contains("--hide-node")){
            if(coveragePercent(candidate, target) > 0.5){
                encompassed.push(candidate);
            }
        }
    }
    return encompassed
}

/**
 * Returns the percent that eA is covered by eB as a factor. If there is no intersection 0 is returned, and if eA is fully encompassed by eB then 1 is returned.
 * Essentially the covered percent is the % of area intersecting after projecting eB's area to match eA's area. 
 * @param {HTMLElement} eA 
 * @param {HTMLElement} eB 
 * @returns 
 */
function coveragePercent(eA, eB){
    const rectA = eA.getBoundingClientRect();
    const rectB = eB.getBoundingClientRect();
    if(rectA.x+rectA.width < rectB.x || rectB.x+rectB.width < rectA.x){
        return 0;
    }
    if(rectA.y+rectA.height < rectB.y || rectB.y+rectB.height < rectA.y){
        return 0;
    }

    let innerMinX = Math.max(rectA.x, rectB.x); 
    let innerMaxX = Math.min(rectA.x+rectA.width, rectB.x+rectB.width);

    let innerMinY = Math.max(rectA.y, rectB.y); 
    let innerMaxY = Math.min(rectA.y+rectA.height, rectB.y+rectB.height);

    let intersectionArea = (innerMaxX-innerMinX) * (innerMaxY-innerMinY);
    let rectAArea = rectA.width * rectA.height;

    let coverage = (intersectionArea / rectAArea);
    
    return coverage;
}

function attachTooltip(element, content){
    let tooltip = document.createElement("tooltip");
    tooltip.innerText = String(content);
    tooltip.classList.add("ubuntu-bold");
    function mouseover(){
        let rect = element.getBoundingClientRect();
        tooltip.style.display = "flex";

        if(rect.x+(rect.width/2) > document.body.clientWidth/2){ // place to left
            tooltip.style.left = rect.x-rect.width
        }else{ // place to right
            tooltip.style.left = rect.x+rect.width 
        }
        tooltip.style.top = rect.top+(rect.height/2)-(tooltip.clientHeight/2);
    }
    function mouseout(){
        tooltip.style.display = "none";
    }
    tooltip.style.display = "none";
    element.addEventListener("mouseover", mouseover);
    element.addEventListener("mouseout", mouseout);
    document.body.appendChild(tooltip);    
}

let activeWorkspace;

// Helper function to get the position of a node
function getNodePosition(node) {
    return {
        x: parseInt(node.__element.style.left),
        y: parseInt(node.__element.style.top)
    };
}

function averageNeighbours(startNode) {
    let queue = [startNode];
    let visited = new Set();
    let positions = [];

    while (queue.length > 0) {
        let node = queue.shift();
        visited.add(node);

        let connections = [...(node.inputs||[]), ...node.outputs];
        for (let conn of connections) {
            let connectedNodes = conn.incommingNodes || conn.__edges.map(edge => edge.node);
            for (let connectedNode of connectedNodes) {
                if (!visited.has(connectedNode)) {
                    if (connectedNode.__element.classList.contains("--unconstrained")) {
                        queue.push(connectedNode);
                    } else {
                        positions.push(getNodePosition(connectedNode));
                    }
                    visited.add(connectedNode);
                }
            }
        }
    }

    let avgPosition = positions.reduce((acc, pos) => {
        return { x: acc.x + pos.x, y: acc.y + pos.y };
    }, { x: 0, y: 0 });

    avgPosition.x /= positions.length;
    avgPosition.y /= positions.length;

    return avgPosition;
}

function positionUnconstrained(node){
    let pos = averageNeighbours(node);
    node.__element.style.left = pos.x+"px"
    node.__element.style.top = pos.y+"px"
}

// Finalizes the unconstrained nodes positions in a workspace and constrains them. 
function finalizeUnconstrained(workspace){
    let unconstrained = workspace.__node_container.querySelectorAll(".--unconstrained");
    for (let i = 0; i < unconstrained.length; i++) {
        unconstrained[i].classList.remove("--unconstrained");
    }
    for (let o = 0; o < 5; o++) {
        for (let i = 0; i < unconstrained.length; i++) {
            positionUnconstrained(unconstrained[i].__node);
        }
    }
    for (let i = 0; i < unconstrained.length; i++) {
        unconstrained[i].__node.updateEdgeElements(true);
    }
}

function createNodeBranch(node, accumulator, init, workspace){
    if(!init) init = {};

    // Generate unconstrained nodes positions
    let unconstrained = typeof node.x !== "number";
    
    const rootNode = workspace.addNode(node.type, node.x+(init.x||0), node.y+(init.y||0), init.initializer||"default", node.memory, node.id);

    if(accumulator) accumulator.push(rootNode.__element);
    if(unconstrained) rootNode.__element.classList.add("--unconstrained");
    node.edges.forEach(edge => {
        let linkTarget = workspace.__node_container.querySelector('[data-node-id="'+edge.node.id+'"]');
        if(!linkTarget) linkTarget = createNodeBranch(edge.node, accumulator, init, workspace);
        else linkTarget = linkTarget.__node;
        
        rootNode.linkTo(linkTarget, edge.fromIndex, edge.toIndex);        
        if(accumulator) accumulator.push(linkTarget.__element);
        
        if(linkTarget.__element.classList.contains("--unconstrained")){
            positionUnconstrained(linkTarget);
        }
    });
    if(node.incommingEdgeIds){
        node.incommingEdgeIds.forEach(({fromIndex, toIndex, id}) =>{
            let linkTarget = workspace.__node_container.querySelector('[data-node-id="'+node.id+'"]');

            let target = workspace.__node_container.querySelector('logic-node[data-node-id="'+id+'"]');
            if(target) target.__node.linkTo(linkTarget, fromIndex, toIndex);
            
        });
    }
    return rootNode;
}

document.addEventListener("DOMContentLoaded", ()=>{
    loadDependencies().then((dependencyMap)=>{
        activeWorkspace = new LogicWorkspace(dependencyMap);
        activeWorkspace.connectPreprocessor(new Preprocessor({
            src: "./scripts/preproc/auto-splitters.js",
            workspace: activeWorkspace,
        }));
        document.body.appendChild(activeWorkspace.element);
    });
    // let notNode = activeWorkspace.addNode("not_gate");
    // let notNode2 = activeWorkspace.addNode("not_gate");
    // let andNode = activeWorkspace.addNode("and_gate");

    // notNode.linkTo(andNode, 0, 0);
    // notNode2.linkTo(andNode,0,1);
})

const copyToClipboard = (str) => {
    const el = document.createElement('textarea');
     el.value = str;
     el.setAttribute('readonly', "");
     el.style.position = "absolute";
     el.style.left = '-9999px';
     document.body.appendChild(el);
     el.select();
     document.execCommand("copy");
     document.body.removeChild(el);
};

// 