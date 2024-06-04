function clearIndicators(){
    let indicators = document.querySelectorAll("signal-indicator");
    for (let i = 0; i < indicators.length; i++) {
        indicators[i].parentElement.style.removeProperty("z-index");
        indicators[i].remove();
    }
}

export class Debugger{
    paused = false;
    constructor(workspace){
        this.element = document.createElement("logic-debugger");

        const playButton = document.createElement("button");
        const playImg = document.createElement("img");
        playImg.src="./media/workspace_icons/debug-start-svgrepo-com.svg"
        this.element.appendChild(playButton);
        playButton.appendChild(playImg);
        playButton.style.display = "none";

        const pauseButton = document.createElement("button");
        const pauseImg = document.createElement("img");
        pauseImg.src="./media/workspace_icons/debug-pause-svgrepo-com.svg"
        this.element.appendChild(pauseButton);
        pauseButton.appendChild(pauseImg);
        
        const stepOverButton = document.createElement("button");
        const stepOverImg = document.createElement("img");
        stepOverImg.src="./media/workspace_icons/debug-step-over-svgrepo-com.svg"
        this.element.appendChild(stepOverButton);
        stepOverButton.appendChild(stepOverImg);
        
        workspace.element.querySelector("#workspace_view").before(this.element);
        
        let paused = false;
        let queue = [];
        let backQueue = [];
        let afterCollected = [];
        let collectedSources = [];
        
        pauseButton.addEventListener("click", ()=>{
            this.paused = true;
        });
        playButton.addEventListener("click", ()=>{
            this.paused = false;
        });
        stepOverButton.addEventListener("click", ()=>{
            this.step();
        });

        Object.defineProperty(this, "paused", {
            get:()=>{
                return paused;
            }, set:(v)=>{
                clearIndicators();
                if(!!v){
                    collectedSources.length = 0;
                    queue.length = 0;
                    backQueue.length = 0;
                    let poweredElements = workspace.__node_container.querySelectorAll(".--powered:not(.--hide-node)");
                    for (let i = 0; i < poweredElements.length; i++) {
                        poweredElements[i].classList.remove("--powered");
                    }
                    pauseButton.style.display = "none";
                    playButton.style.display = "flex";
                    setTimeout(() => {
                        this.step();
                    }, 10);
                }else{
                    pauseButton.style.display = "flex";
                    playButton.style.display = "none";
                    let debugElements = workspace.__node_container.querySelectorAll(".--debugger-out-active");
                    for (let i = 0; i < debugElements.length; i++) {
                        debugElements[i].classList.remove("--debugger-out-active");
                    }
                }
                paused = !!v;
            }
        });
        let propogating = false;
        Object.defineProperty(this, "report", {
            get:()=>{
                // Reports a signal being sent from a ndoes output
                return (output, signal, edge, node)=>{
                    if(paused){
                        queue.push({output, signal, edge})
                        edge.edgeEl.classList.toggle("--powered", false);
                        node.__element.querySelector(".node-connections").children[edge.fromIndex].classList.toggle("--powered", false);
                        edge.node.__element.querySelector(".node-connections.inputs").children[edge.toIndex].classList.toggle("--powered", false);
                    }
                };
            }
        });
        Object.defineProperty(this, "step", {
            get:()=>{
                return ()=>{
                    if(paused){
                        let lastActive = workspace.__node_container.querySelector(".--debugger-out-active");
                        if(lastActive) lastActive.classList.remove("--debugger-out-active");
                        if(!queue.length && backQueue.length){
                            queue.push(backQueue.shift());
                        }
                        let nextStep = queue.shift();
                        clearIndicators();
                        if(nextStep){
                            while(queue.length) backQueue.push(queue.shift());    
                            nextStep.edge.edgeEl.classList.add("--debugger-out-active", "--powered");
                            nextStep.edge.node.propogateSignal(nextStep.signal, nextStep.edge);
                            let indicator = createSignalIndicator(nextStep.signal);
                            nextStep.edge.node.__element.style.zIndex = "1";
                            nextStep.edge.node.__element.appendChild(indicator);
                            return
                        }else if(!collectedSources.length){ // source signal
                            let tickStartTime = new Date();
                            
                            let signalSources = workspace.__node_container.querySelectorAll(".signal-source:not(.--hide-node)");
                            for (let i = 0; i < signalSources.length; i++) {
                                const source = signalSources[i];
                                collectedSources.push([source, tickStartTime]);
                            }

                            let poweredElements = workspace.__node_container.querySelectorAll(".--powered:not(.--hide-node)");
                            for (let i = 0; i < poweredElements.length; i++) {
                                poweredElements[i].classList.remove("--powered");
                            }
                        }
                        let source = collectedSources.shift();
                        if(!source) return;
                        source[0].propogateSource(source[1]);
                        this.step();
                    }
                };
            }
        });

    }

}

function createSpanWithClass(className, content){
    let span = document.createElement("span");
    span.innerText=content;
    span.className = className;
    return span;
}

function createKeyPair([key, val]){
    let item = document.createElement("li");
    let clickCatcher = document.createElement("button");
    
    item.appendChild(clickCatcher);
    clickCatcher.appendChild(createSpanWithClass("key "+typeof val+"-type", key));
    clickCatcher.appendChild(createSpanWithClass("colon", ":"));
    if(val instanceof Object){
        if(val instanceof Date){
            clickCatcher.appendChild(createSpanWithClass("value", val.toTimeString().split(" ")[0]));
        }else{
            clickCatcher.appendChild(createSpanWithClass("value", "Node()"));
            const referenceButton = new Image(20);
            referenceButton.src = "/media/icons/target-82-svgrepo-com.svg"
            referenceButton.classList.add("ref-icon");
            clickCatcher.appendChild(referenceButton);
            clickCatcher.addEventListener("pointerover", ()=>{
                val.__element.classList.toggle("--debug-highlight", true);
            });
            clickCatcher.addEventListener("pointerout", ()=>{
                val.__element.classList.toggle("--debug-highlight", false);
            });
        }
    }else{
        clickCatcher.appendChild(createSpanWithClass("value", val));
    }
    return item
}

function createSignalIndicator(signal){
    let element = document.createElement("signal-indicator");
    let signalList = document.createElement("ol");
    signalList.classList.add("ubuntu-light");
    element.appendChild(signalList);
    Object.entries(signal).map(createKeyPair).forEach(signalList.appendChild.bind(signalList));
    return element;
}
