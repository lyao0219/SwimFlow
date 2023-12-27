console.log("loading starts");
let _PageHeight = window.innerHeight, 
	_PageWidth = window.innerWidth;
let _LoadingHtml = `<div id="loadingDiv" style="position: absolute; width: ${_PageWidth}px; height: ${_PageHeight}px; background-color: #3C6CA8; z-index: 10000; text-align: center; color: #fff; display: inline-block;"><p style="position: relative; top: 40%; bottom: 40%; font: Serif; font-size:${_PageHeight*0.1}pt; ">Loading</p></div>`;

// add loading effect
document.write(_LoadingHtml);

// listen to state change
document.onreadystatechange = completeLoading;

function completeLoading() {
	if (document.readyState == "complete") {
		console.log("loading complete");
        let loadingMask = document.getElementById('loadingDiv');
        loadingMask.parentNode.removeChild(loadingMask);
    }
}