let config = {
    childList: true,
    attributes: true,
    subtree: true,
    attributeFilter: ['src']
};
let observer;
const svgCache = new Map();

async function fetchAndReplaceSvg(img) {
    const svgUrl = img.src;
    const placeholder = document.createElement('div');
    placeholder.className = 'svg-placeholder';
    if(!img.parentNode) return;
    img.parentNode.replaceChild(placeholder, img);

    try {
        let svgElement;
        if(!svgCache.has(svgUrl)){
            console.log((location.href + new URL(svgUrl).pathname).replaceAll("//", "/"));
            const response = await fetch(location.href+(new URL(svgUrl).pathname));
            if (!response.ok) throw new Error('Network response was not ok');
            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            svgElement = svgDoc.documentElement;
            svgCache.set(svgUrl, svgElement.cloneNode(true));
        }else{
            svgElement = svgCache.get(svgUrl).cloneNode(true);
        }

        if(img.hasAttribute("width")) svgElement.setAttribute("width", img.getAttribute("width"));
        else svgElement.removeAttribute("width");
        
        if(img.hasAttribute("height")) svgElement.setAttribute("height", img.getAttribute("height"));
        else svgElement.removeAttribute("height");
        if(!placeholder.parentNode) return
        placeholder.parentNode.replaceChild(svgElement, placeholder);
    } catch (error) {
        console.error('Error fetching SVG:', error);
    }
}

function checkAndReplaceSvg(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        const imgTags = node.querySelectorAll('img[src$=".svg"]');
        if((node.getAttribute("src")||"").endsWith(".svg")){
            return fetchAndReplaceSvg(node);
        }
        imgTags.forEach(fetchAndReplaceSvg);
    }
}

// Function to observe a node and its shadow DOMs
function observeNode(node) {
    if (node.shadowRoot) {
        observer.observe(node.shadowRoot, config);
        node.shadowRoot.querySelectorAll('*').forEach(childNode => observeNode(childNode)||checkAndReplaceSvg(childNode));
    }
}

function mutationCallback(mutationsList) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(checkAndReplaceSvg);
            mutation.addedNodes.forEach(observeNode);
        } else if (mutation.type === 'attributes' && mutation.target.tagName === 'IMG' && mutation.target.src.endsWith('.svg')) {
            fetchAndReplaceSvg(mutation.target);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAndReplaceSvg(document.body);
    observer = new MutationObserver(mutationCallback);
    observer.observe(document.body, config);
});
