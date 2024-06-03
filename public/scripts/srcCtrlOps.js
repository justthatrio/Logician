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
    }else if(patch.changed == "equal"){
        a[key] = patch.value;
    }
}

export function findVersion(versions, v){
    if(!v) return undefined
    for (let i = 0; i < versions.length; i++) {
        if(versions[i].version == v) return versions[i];
    }
    return undefined;
}

export function constructNodes(save, version){
    let constructed = {nodes:[]};

    
    let pathway = [];
    if(!version){
        pathway.push(save.versions[0]);
        version = save.versions[0];
    }else{
        pathway.push(version);
        let target = findVersion(save.versions, version.parent);
        while(target){
            pathway.push(target);
            target = findVersion(save.versions, target.parent);
        }
    }
    
    for (let i = pathway.length-1; i >= 0; i--) {
        // console.log(pathway, i);
        patchObj(constructed, pathway[i].diff, "nodes");        
    }
    return constructed.nodes;
}

export function createVersion(project){
    findVersion(project.versions, project.version).locked = true;;
    project.versions.push({
        version: project.version.substring(0, project.version.lastIndexOf(".")) +"."+ String(parseInt(project.version.substring(project.version.lastIndexOf(".")+1))+1), 
        parent: project.version,
        ts: new Date(),
        diff:{},
    });
    project.save();
}