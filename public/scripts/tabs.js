function paramTypeError(key, type){
    let error = new Error("Invalid Argument: "+key+" was expected to be of type "+type.name);
    return error
}
export class TabManager{
    #init
    #tabPairs = []
    constructor(init){
        if(!(init instanceof Object)) init = {};

        // Defaults
        if(!init.mode){
            init.mode = "auto";
        }
        if(!init.hiddenClass){
            init.hiddenClass = "--content-hidden";
        }
        if(!init.selectedClass){
            init.selectedClass = "--selected";
        }

        if(init.mode == "auto"){
            if(!(init.controlsParent instanceof HTMLElement)) throw paramTypeError("controlsParent", HTMLElement);
            if(!(init.containersParent instanceof HTMLElement)) throw paramTypeError("containersParent", HTMLElement);
            if(init.containersParent.children.length < init.controlsParent.children.length) throw new Error("Some of the controls are missing corresponding containers");
            for (let i = 0; i < init.controlsParent.children.length; i++) {
                this.addTabPair(init.controlsParent.children[i], init.containersParent.children[i]);
            }
        }else if(init.mode == "manual"){

        }else throw new Error();
        this.#init = init;
        let postInit = ()=>{
            for (let i = 0; i < this.#tabPairs.length; i++) {
                this.#tabPairs[i].container.classList.toggle(this.#init.hiddenClass, !!i);
                this.#tabPairs[i].button.classList.toggle(this.#init.selectedClass, !!!i);
            }
            if(init.onload instanceof Function){
                init.onload();
            }
        };
        if(init.mode == "manual") setTimeout(postInit, 0);
        else postInit();
    }   
    addTabPair(button, container, selectedCb=undefined){
        if(!(button instanceof HTMLElement)) throw paramTypeError("button", HTMLElement);
        if(!(container instanceof HTMLElement)) throw paramTypeError("container", HTMLElement);
        let openTab = () => {
            for (let i = 0; i < this.#tabPairs.length; i++) {
                if(this.#tabPairs[i].container == container){
                    button.classList.remove(this.#init.selectedClass);
                    container.classList.remove(this.#init.hiddenClass);
                    if(this.#tabPairs[i].selectedCb instanceof Function) this.#tabPairs[i].selectedCb(container);
                }else{
                    this.#tabPairs[i].container.classList.add(this.#init.hiddenClass);
                    this.#tabPairs[i].button.classList.remove(this.#init.selectedClass);
                }
            }
        }
        button.addEventListener("click", openTab.bind(this));
        this.#tabPairs.push({
            button,
            container,
            selectedCb
        })
    }
    setSelectedCb(tabIndex, cb){
        if(tabIndex >= this.#tabPairs.length){
            throw new Error("tabIndex is out of range: "+String(tabIndex)+" >= "+String(this.#tabPairs.length));
        }
        this.#tabPairs[tabIndex].selectedCb = cb;
        return this;
    }
}