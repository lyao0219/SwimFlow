/* race consts */
const totalDistance = 100, halfDistance = 50;
/* video consts */
const videoRatio = 16/9, raceStartTime = 13.70, raceEndTime = 85.16, championEndTime = 81.40, raceDuration = 71.48, videoDuration = 85.8;
const raceStartPercent = raceStartTime/videoDuration*100;
/* get the documentElement client width and height */
const WINDOW_WIDTH = $(window).width(), WINDOW_HEIGHT = $(window).height();

// middle part: video + video controller + vis
const VIDEO_HEIGHT = WINDOW_HEIGHT * 0.9, VIDEO_WIDTH = VIDEO_HEIGHT*videoRatio;
const VIDEO_CONTROLLERS_HEIGHT = VIDEO_HEIGHT * 0.05;

/* parameters for video size and coordination*/
const vTB = (WINDOW_HEIGHT-VIDEO_HEIGHT-VIDEO_CONTROLLERS_HEIGHT)/2; 
const vRL = (WINDOW_WIDTH-VIDEO_WIDTH)/2;

/* parameters for lane size and static visualization coordination*/
var laneWidth, laneLength; // laneWidth = video height/8, laneLength = video width
var laneCount = 8;
var laneChecked; // an object to record which lanes are checked: checked all by default

var visW, visH; // vis initial width and height
var visChecked; // which representation is checked
// Embedded vis is an drawn image (flag) or a drawn shape: 
// Flags: display transparency selector
// Shapes: display color picker 
var IMAGE = false, COLOR_PICKER = false, TRANSPARENCY = false;
var SUB_RECORD = false, SUB_SWIMMER = false;
// The visualization should move or not: true => move (default) while false => stop
// @ STOPPOS to record the visualization stop position: undefined => no validate data in myData (default)
var MOVE = true, STOPPOS = undefined;
// a counter to calculate how many colors/transparency have been created
var divColorHistory=0, divTransparencyHistory=0;

/* Middle part: video, video controllers, vis*/
const divVideoVis = document.getElementById("videovis");
divVideoVis.style.height = (VIDEO_HEIGHT + VIDEO_CONTROLLERS_HEIGHT) + "px";
divVideoVis.style.width = VIDEO_WIDTH + "px";
divVideoVis.style.top = vTB + "px";
divVideoVis.style.left = vRL + "px";
divVideoVis.style.position = "absolute";

// embed a video
$("#myVideo").attr("width", VIDEO_WIDTH)
   			 .attr("height", VIDEO_HEIGHT)
			 .attr("type", "video/mp4")
			 .attr("src", "/SwimFlow/video/2021_Montpellier_100_brasse_birdseyes.mp4");

const myPlayPauseBtn = document.getElementById("playPauseButton");
const myProgressBar = document.getElementById("myProgressBar");
// set the play button size: font size
myPlayPauseBtn.style.fontSize = VIDEO_CONTROLLERS_HEIGHT*0.6 + "px";

/*--------------------- prepare all vis representation here, and hide them ---------------------*/
// here are visualization global parameters that can be access for all functions, all parts
const colorSet = {
	"black": "#000000",
	"grey_dark3": "#2D2D2D",
	"grey_dark2": "#424242",
	"grey_dark1": "#696969",
	"grey_middle": "#9D9D9D",
	"grey_light1": "#BDBDBD",
	"grey_light2": "#D3D3D3",
	"grey_light3": "#F6F6F6",
	"white": "#FFFFFF",

	"french_blue": "#002654",
	"french_white": "#FFFFFF",
	"french_red": "#ED2939",

	"belgian_black": "#2D2926",
	"belgian_yellow": "#FFCD00",
	"belgian_red": "#C8102E",

	"france": {"rgb_l": [0, 38, 84], "rgb_m": [255, 255, 255], "rgb_r": [237, 41, 57]},
	"belgium": {"rgb_l": [45, 41, 38], "rgb_m": [255, 205, 0], "rgb_r": [200, 16, 46]},
};

// variables of visualizations
// swimmer's metadata
var nationalFlags, nationalText, nameText, ageText;
// time-related
var lapWorldRecordText, lapWorldRecordLineChart;
var elapsedText, elapsedTimer, elapsedProgressBar;
var currentLapText, currentLapBarChart; 
var averageLapText;
var lapDifferencesRecordText, lapDifferencesRecordBarChart, lapDifferencesRecordGlyph;
var lapDifferencesSwimmerText, lapDifferencesSwimmerBarChart, lapDifferencesSwimmerGlyph;
// speed-related
var currentSpeedText, currentSpeedBarChart, currentSpeedCircularSector;
var accelerationText, accelerationBarChart, accelerationCircularSector, accelerationGlyph;
var speedDifferencesRecordText, speedDifferencesRecordGlyph, speedDifferencesRecordBarChart;
var speedDifferencesSwimmerText, speedDifferencesSwimmerGlyph, speedDifferencesSwimmerBarChart;
var averageSpeedText, speedHistoryLineChart;
// position-related: abstract from speed- related
var positionDifferencesRecordText, positionDifferencesSwimmerText;
var speedDifferencesRecordLine, speedDifferencesSwimmerLine;
// distance-related
var distanceSwamText, distanceSwamBarChart;
var remainingDistanceText, remainingDistanceBarChart;
// records
var worldRecordText, worldRecordLine, olympicsRecordText, olympicsRecordLine, nationalRecordText, nationalRecordLine, personalRecordText, personalRecordLine;
// predictions
var winnerText, winnerGlyph, nextPassingText, nextPassingGlyph, estimatedCompletionTimeText, estimatedCompletionTimeBarChart, recordBreakGlyph;
// techniques
var reactionTimeText, divingDistanceText, divingDistanceLine, divingDistanceArrow;
var distanceStrokeText, distanceStrokeLine, distanceStrokeArrow, distanceStrokeBarChart, strokeCountText, strokeCountBarChart;

// record all drawn vis predefined colors and their color numbers
const predefinedColors = {
	// metadata
	"nationalFlags": {"flags": 2, "1": "france", "2": "belgium", "france": [colorSet.french_blue, colorSet.french_white, colorSet.french_red], "belgium": [colorSet.belgian_black, colorSet.belgian_yellow, colorSet.belgian_red], },
	"nationalText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"nameText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"ageText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	// time-related 
	"elapsedText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"elapsedTimer": {"colors": 3, "1": {"fill": colorSet.grey_middle}, "2": {"fill": colorSet.grey_light2}, "3": {"stroke": colorSet.grey_dark2}, },
	"elapsedProgressBar": {"colors": 3, "1": {"fill": colorSet.grey_middle}, "2": {"fill": colorSet.grey_light2}, "3": {"stroke": colorSet.grey_dark2}, },
	"currentLapText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"lapDifferencesRecordText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"lapDifferencesRecordBarChart": {"colors": 4, "1": {"fill": colorSet.grey_dark1}, "2": {"stroke": colorSet.grey_dark3}, "3": {"fill": colorSet.grey_light3}, "4": {"stroke": colorSet.grey_light1}, },
	"lapDifferencesRecordGlyph": {"colors": 4, "1": {"fill": colorSet.grey_light3}, "2": {"stroke": colorSet.grey_light1}, "3": {"fill": colorSet.grey_dark1}, "4": {"stroke": colorSet.grey_dark3}, },
	"lapDifferencesSwimmerText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"lapDifferencesSwimmerBarChart": {"colors": 4, "1": {"fill": colorSet.grey_dark1}, "2": {"stroke": colorSet.grey_dark3}, "3": {"fill": colorSet.grey_light3}, "4": {"stroke": colorSet.grey_light1}, },
	"lapDifferencesSwimmerGlyph": {"colors": 4, "1": {"fill": colorSet.grey_light3}, "2": {"stroke": colorSet.grey_light1}, "3": {"fill": colorSet.grey_dark1}, "4": {"stroke": colorSet.grey_dark3}, },
	// #red: TODO
	"currentLapBarChart": {"colors": 4, "1": {"fill": colorSet.grey_dark1}, "2": {"stroke": colorSet.grey_dark3}, "3": {"fill": colorSet.grey_light3}, "4": {"stroke": colorSet.grey_light1}, },	
	"averageLapText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	// speed-related 
	"currentSpeedText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"currentSpeedBarChart": {"colors": 3, "1": {"fill": colorSet.grey_middle}, "2": {"fill": colorSet.grey_light2}, "3": {"stroke": colorSet.grey_dark2}, },
	"currentSpeedCircularSector": {"colors": 3, "1": {"stroke": colorSet.grey_middle}, "2": {"fill": colorSet.grey_light2}, "3": {"stroke": colorSet.grey_dark2}, },
	"accelerationText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"accelerationBarChart": {"colors": 4, "1": {"fill": colorSet.grey_dark1}, "2": {"stroke": colorSet.grey_dark3}, "3": {"fill": colorSet.grey_light3}, "4": {"stroke": colorSet.grey_light1}, },
	"accelerationGlyph": {"colors": 4, "1": {"fill": colorSet.grey_dark1}, "2": {"stroke": colorSet.grey_dark3}, "3": {"fill": colorSet.grey_light3}, "4": {"stroke": colorSet.grey_light1}, },
	"averageSpeedText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"speedHistoryLineChart": {"colors": 2, "1": {"stroke": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"speedDifferencesRecordGlyph": {"colors": 5, "1": {"fill": colorSet.white}, "2": {"stroke": colorSet.black}, "3": {"fill": colorSet.grey_middle}, "4": {"fill": colorSet.grey_light2}, "5": {"stroke": colorSet.grey_dark2}, },
	"speedDifferencesRecordBarChart": {"colors": 4, "1": {"fill": colorSet.grey_dark1}, "2": {"stroke": colorSet.grey_dark3}, "3": {"fill": colorSet.grey_light3}, "4": {"stroke": colorSet.grey_light1}, },
	"speedDifferencesSwimmerText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },		
	"speedDifferencesSwimmerGlyph": {"colors": 5, "1": {"fill": colorSet.white}, "2": {"stroke": colorSet.black}, "3": {"fill": colorSet.grey_middle}, "4": {"stroke": colorSet.grey_light2}, "5": {"stroke": colorSet.grey_dark2}, },
	"speedDifferencesSwimmerBarChart": {"colors": 4, "1": {"fill": colorSet.grey_dark1}, "2": {"stroke": colorSet.grey_dark3}, "3": {"fill": colorSet.grey_light3}, "4": {"stroke": colorSet.grey_light1}, },	
	// position-related: abstract from speed- related
	"positionDifferencesRecordText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"positionDifferencesSwimmerText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"speedDifferencesRecordLine": {"colors": 4, "1": {"fill": colorSet.grey_dark1} , "2": {"stroke": colorSet.grey_dark3}, "3": {"fill": colorSet.grey_light3}, "4": {"stroke": colorSet.grey_light1}, },
	"speedDifferencesSwimmerLine": {"colors": 6, "1": {"fill": colorSet.white}, "2": {"stroke": colorSet.black}, "3": {"fill": colorSet.grey_dark1}, "4": {"stroke": colorSet.grey_dark3}, "5": {"fill": colorSet.grey_light3}, "6": {"stroke": colorSet.grey_light1}, },
	// distance-related
	"distanceSwamText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"distanceSwamBarChart": {"colors": 3, "1": {"fill": colorSet.grey_middle}, "2": {"fill": colorSet.grey_light2}, "3": {"stroke": colorSet.grey_dark2}, },	
	"remainingDistanceText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },		
	"remainingDistanceBarChart": {"colors": 3, "1": {"fill": colorSet.grey_middle}, "2": {"fill": colorSet.grey_light2}, "3": {"stroke": colorSet.grey_dark2}, },	
	"distanceDifferencesLeaderText": {"colors": 4, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, "3": {"fill": colorSet.white}, "4": {"stroke": colorSet.black}, },
	"distanceDifferencesLeaderLine": {"colors": 6, "1": {"fill": colorSet.white}, "2": {"stroke": colorSet.black}, "3": {"fill": colorSet.grey_dark1}, "4": {"stroke": colorSet.grey_dark3}, "5": {"fill": colorSet.grey_light3}, "6": {"stroke": colorSet.grey_light1}, },
	"distanceDifferencesLeaderArrow": {"colors": 4, "1": {"fill": colorSet.white}, "2": {"stroke": colorSet.black}, "3": {"fill": colorSet.grey_light2}, "4": {"stroke": colorSet.grey_dark2}, },	"speedDifferencesRecordText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	// records
	"worldRecordText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, }, 
	"worldRecordLine": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"olympicsRecordText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, }, 
	"olympicsRecordLine": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"nationalRecordText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"nationalRecordLine": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"personalRecordText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"personalRecordLine": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	// predictions
	"winnerText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"winnerGlyph": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"nextPassingText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"nextPassingGlyph": {"colors": 6, "1": {"fill": colorSet.white}, "2": {"stroke": colorSet.black}, "3": {"fill": colorSet.grey_dark1}, "4": {"stroke": colorSet.grey_dark3}, "5": {"fill": colorSet.grey_light3}, "6": {"stroke": colorSet.grey_light1}, },
	"estimatedCompletionTimeText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"estimatedCompletionTimeBarChart": {"colors": 4, "1": {"fill": colorSet.white}, "2": {"stroke": colorSet.black}, "3": {"fill": colorSet.grey_light2}, "4": {"stroke": colorSet.grey_dark2}, },
	"recordBreakGlyph": {"colors": 4, "1": {"fill": colorSet.white}, "2": {"stroke": colorSet.black}, "3": {"fill": colorSet.grey_light2}, "4": {"stroke": colorSet.grey_dark2}, },
	// techniques
	"reactionTimeText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"divingDistanceText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"divingDistanceLine": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, }, 
	"divingDistanceArrow": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"distanceStrokeText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"distanceStrokeLine": {"colors": 4, "1": {"fill": colorSet.grey_dark1}, "2": {"stroke": colorSet.grey_dark3}, "3": {"fill": colorSet.grey_light3}, "4": {"stroke": colorSet.grey_light1}, },
	"distanceStrokeArrow": {"colors": 4, "1": {"fill": colorSet.grey_dark1}, "2": {"stroke": colorSet.grey_dark3}, "3": {"fill": colorSet.grey_light3}, "4": {"stroke": colorSet.grey_light1}, },
	"distanceStrokeBarChart": {"colors": 3, "1": {"fill": colorSet.grey_middle}, "2": {"fill": colorSet.grey_light2}, "3": {"stroke": colorSet.grey_dark2}, },
	"strokeCountText": {"colors": 2, "1": {"fill": colorSet.grey_light2}, "2": {"stroke": colorSet.grey_dark2}, },
	"strokeCountBarChart": {"colors": 3, "1": {"fill": colorSet.grey_middle}, "2": {"fill": colorSet.grey_light2}, "3": {"stroke": colorSet.grey_dark2}, },
}

/*--------------------- color picker section (color + transparency) ---------------------*/

function getRgb(rgb) {
	let myArr =  rgb.split(",");
	let r = myArr[0].split("(")[1];
	let g = myArr[1];
	let b = myArr[2].split(")")[0];

	return [r, g, b];
}

function getAlpha(rgba) {
	let myArr =  rgba.split(",");
	if(myArr.length === 4){
		return parseFloat(myArr[3].split(")")[0]).toFixed(2);
	} else {
		return 1;
	}
}

function hexToRgb(hex) {
	return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
}

function rgbToHex(rgb) {
	return "#" + parseInt(rgb[0]).toString(16).padStart(2, "0") + parseInt(rgb[1]).toString(16).padStart(2, "0") + parseInt(rgb[2]).toString(16).padStart(2, "0");
}

/*--------------------- canvas and drawing section ---------------------*/

// function to create blank canvas with 2D context
// @ container: which ele this canvas should be appended before
// @ cvsID: the string of myCvs
// @ cvsW: the width of this canvas == laneLength
// @ cvsH: the height of this canvas == WINDOW_HEIGHT
// when @ cvsW and cvsH == null, canvas size = default size = w*h = 300*150
function createCanvas2D(container, cvsID, cvsW, cvsH) {
	let cvsCtx = new Object();
	cvsCtx.cvs = document.createElement("canvas");
	container.append(cvsCtx.cvs);
	cvsCtx.cvs.setAttribute("id", cvsID);
	cvsCtx.cvs.style.position = "absolute";
	if(cvsW != null){
		cvsCtx.cvs.width = cvsW;
	}
	if(cvsH != null){
		cvsCtx.cvs.height = cvsH;
	}	
	cvsCtx.ctx = cvsCtx.cvs.getContext("2d");

	return cvsCtx;
}

// function to set canvas coordination (to its parent div)
function coordinateCanvas(cvs, t, l) {
	cvs.style.top = parseFloat(t) + "px";
	cvs.style.left = parseFloat(l) + "px";
}

// function to clear a canvas
// @ arr: lane(s) selected, array of number [1, 2, ..., 7, 8]
// @ vis: selected vis => the value of radio button == the id of canvas element
function clearCanvas2D(arr, vis) {
	// @ j: index pointer of obj 
	for(let i=1, j=0; i<=laneCount; i++) {
		// clean the selected lanes and make them visible
		let myCvs = $("#"+vis+"_"+i);
		if( i == arr[j] ) {			
			let myCtx = myCvs[0].getContext("2d");
			myCtx.clearRect(-(myCvs.width()+visW*4), -(myCvs.width()+visW*4), myCvs.width()*2+visW*8, myCvs.width()*2+visW*8);
			j++;
			displayCanvas(document.getElementById(`${vis}_${i}`), true);
		// let the non-selected ones invisible
		} else {
			displayCanvas(document.getElementById(`${vis}_${i}`), false);
		}
	}
}

// function to display or hide the canvas
// @ myCvs: target canvas
// @ flag: true == display
function displayCanvas(myCvs, flag) {
	// flag == true: display
	if (flag) {
		myCvs.style.display = "block";
	}

	// flag == falss: hide
	if(!flag) {
		myCvs.style.display = "none";
	}
}

// This function is to add canvas on all lanes: selected => visible, non-selected => invisible
// @ obj: selected lane(s) => checked object(s) of lane_selector
// @ vis: selected vis => the value of radio button == the id of canvas element
// @ lanes: laneNumber
// @ gap (array): the height of lane (attention, side view and diagonal view may have different lane width)
// @ tb: the distance to the top and bottom edge
// @ cvsW: the width of one canvas == laneLength, the height of one canvas == @ gap == the width of lane
function addCanvas(obj, vis, lanes, gap, tb, cvsW){
	// coordinate the top for each canvas, initial position is at the lane1 top edge
	let top = 0;
	// coordinate the left for each canvas, should just near controllers
	// let left = DIV_CONTROLLERS_WIDTH + vRL;
	let left = 0;

	// i: all lanes, from 1-8
	// j: obj index => visible lanes
	for (let i=1, j=0; i<=lanes; i++){
		let myCvs = createCanvas2D($("#videovis"), vis+"_"+i, cvsW, gap);
		coordinateCanvas( myCvs.cvs, top, left);

		// visible ones
		if( i == parseInt(obj[j])) {
			displayCanvas( myCvs.cvs, true);
			$("#"+vis+"_"+i).attr("name", function(){
								return vis+"_dup";
							})
						    .attr("class", function(){
						    	return `${vis} dup visible`;
						    });
		    j++;
	    // invisible ones
		} else {
			displayCanvas( myCvs.cvs, false);
			$("#"+vis+"_"+i).attr("name", function(){
								return vis+"_dup";
							})
						    .attr("class", function(){
						    	return `${vis} dup invisible`;
						    });
		}

		// coordinate the next canvas
		top += gap;		
	}
}

// This function remove all canvas who does not have "layer" class
function clearCanvas(){
	$(".dup").each(function(){
		$(this).hasClass("layer") ? true : $(this).remove();
	})
}

// which vis representation is selected: return string
function getVis() {
	return $('input[name="visBtn"]:checked').val();
}

// which lanes are selected
// CODES === null / undefined / false: return lanes object
// CODES === true: return array of checked lanes value
function getLanes(CODES) {
	let myLanes = $('input[name="lane_selector"]:checked'); // => Div elements
	if(!CODES) return myLanes;
	if(CODES) {
		let lanesChecked = [];
		for(let i = 0; i<myLanes.length; i++) {
			lanesChecked.push($(myLanes[i]).val());
		}

		return lanesChecked; // value: [1, 2, 3, ..., 7, 8]
	}
}

// what colors are
// CODES === null / undefined / false: return color div elements
// CODES === true: return array of colors' value
function getColors(ele, CODES) {
	let myColors = $(`div[name = "${ele}"]`).get(); // => Div elements
	if(!CODES) return myColors;
	if(CODES) {
		let colorCodes =  [];
		for(let i=0; i<myColors.length; i++) {
			colorCodes.push($(myColors[i]).css("background-color") );
		} 

		return colorCodes;
	}
}

// what transparencies are
// CODES === null / undefined / false: return transparency div elements
// CODES === true: return array of transparencies' value
function getTransparencies(ele, CODES) {
	let myTransparencies = $(`div[name = "${ele}"]`).get(); // => Div elements
	if(!CODES) return myTransparencies;
	if(CODES) {
		var transparencies =  {"france": {"left": null, "middle": null, "right": null}, "belgium": {"left": null, "middle": null, "right": null}};
		for(let i=0; i<myTransparencies.length; i++) {
			// "linear-gradient(to right, rgba(0, 38, 84, 0.42) 33.33%, rgba(255, 255, 255, 0.42) 33.33%, rgba(255, 255, 255, 0.42) 66.66%, rgba(237, 41, 57, 0.42) 66.66%)"
			// "linear-gradient(to right, rgb(0, 38, 84) 33.33%, rgb(255, 255, 255) 33.33%, rgb(255, 255, 255) 66.66%, rgb(237, 41, 57) 66.66%)"
			let myString = $(myTransparencies[i]).css("background-image");

			if(i==0) {
				transparencies["france"]["left"] = `${myString.split(" 33.33%, ")[0].split("right, ")[1]}`;
				transparencies["france"]["middle"] = `${myString.split(" 33.33%, ")[1]}`;
				transparencies["france"]["right"] = `${myString.split("66%, ")[1].split(" 66.66%)")[0]}`;
			}

			if(i==1) {
				transparencies["belgium"]["left"] = `${myString.split(" 33.33%, ")[0].split("right, ")[1]}`;
				transparencies["belgium"]["middle"] = `${myString.split(" 33.33%, ")[1]}`;
				transparencies["belgium"]["right"] = `${myString.split("66%, ")[1].split(" 66.66%)")[0]}`;
			}
		}
		return transparencies;
	}
}

// get all representations that added as layers
function getVisualizations() {
	let myVisualizations = new Set();

	let myLayers = $(".layer").get();
	myLayers.forEach( (x) => {
		myVisualizations.add( $(x).prop("id").split("_")[0] );
	});

	return myVisualizations;
}

// add vis type = image on previous created canvas
// @ obj: selected lane(s) => checked object(s) of lane_selector

// @ vis: selected vis => the value of radio button == the id of canvas element
// @ gap (array): the height of lane (attention, side view and diagonal view may have different lane width)
// @ sx: horizontal drift distance == $("#horizontal").val() + dx
// @ sy: vertical drift distance == $("#vertical").val() + dy
// @ sh: the height drift distance
// @ sw: the target drift distance
// @ r: rotation degree
// @ transparency: 
// @ args: myData[frameId] => object, should use args[swimmerId] to access each swimmer's data, swimmerId == i == [0, 7]
// @ edge: an array, align to which edge(s) => left/right and/or top/bottom
// @ flip: a flag to switch in front / behind after a turn
function addVisImage(obj, vis, sx, sy, sh, sw, r, transparency, args, edge, flip) {
	// check if vis string can be used to access an existing constructor => 
	let image = this[vis];

	// modify the dx, dy, w, h according to the sliders
	let w = Math.floor(parseFloat(image.w) + sw);
	let h = Math.floor(parseFloat(image.h) + sh);

	// coordination (x, y) on canvas => when moving, modify shape.dx	
	let dx = Array(8).fill(Math.floor( (laneLength - w)/2 + sx ));
	let dy = Math.floor((laneWidth-h)/2 + sy);

	// if !MOVE && alignButton checked => 
	let ALIGN = $("#alignButton").prop("checked");
	let x_array = [], x_max, x_min, leftDrift, rightDrift;

	if(!MOVE) {		
		// find out the maximum and the minimum x in args => used for left and right align
		if(STOPPOS){
			for(let i=0; i<8; i++) {
				STOPPOS[i]["x_middle"] ? x_array.push(STOPPOS[i]["x_middle"]) : true;
			}
			x_max = Math.max(...x_array), x_min = Math.min(...x_array);

			if(!ALIGN) {			
				leftDrift = x_min/halfDistance*laneLength;
				rightDrift = laneLength-(x_max/halfDistance*laneLength+w);
			}
		}
	}

	// draw on all lanes
	obj.each(function(){
		// find the correct canvas by ID: myCvs is an object
		let myVal = $(this).val();
		let i = myVal-1;

		let myCvs = $("#"+vis+"_"+myVal);
		let myCtx = myCvs[0].getContext("2d");

		// for moving: calculate x and y position according to the existing canvas
		if(args && args[i]) {
			if(MOVE) {
				// no flip
				if(!flip) {
					args[i]["direction"] == "advance" ? dx[i] = args[i]["x_middle"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_middle"]/halfDistance*laneLength-w/2-sx;	
				}		
				// with flip: switch
				if(flip) {
					args[i]["direction"] == "advance" ? dx[i] = args[i]["x_middle"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_middle"]/halfDistance*laneLength-w/2+sx;	
				}
			}
			if(!MOVE) {
				if(!ALIGN) {
					dx[i] = STOPPOS[i]["x_middle"]/halfDistance*laneLength-w/2+sx;
					if(edge) {
						edge.forEach( (x) => {
							switch (x) {								
								case "leftEdge":
									dx[i] = STOPPOS[i]["x_middle"]/halfDistance*laneLength - leftDrift;
									break;
								case "rightEdge":
									dx[i] = STOPPOS[i]["x_middle"]/halfDistance*laneLength + rightDrift;
									break;
								case "topEdge":
									dy = 0;
									break;
								case "bottomEdge":
									dy = laneWidth - h;
									break;
							}
						});					
					}
				}

				if(ALIGN) {
					dx = Array(8).fill( Math.floor( (laneLength - w)/2 + sx ));
					if(edge) {
						edge.forEach( (x) => {
							switch (x) {
								case "leftEdge":
									dx[i] = 0;
									break;
								case "rightEdge":
									dx[i] = laneLength - w;
									break;
								case "topEdge":
									dy = 0;
									break;
								case "bottomEdge":
									dy = laneWidth - h;
									break;
							}
						});
					}
				}

			}
		}

		if(!args) {
			dx = Array(8).fill( Math.floor( (laneLength - w)/2 + sx ));
			if(edge) {
				edge.forEach( (x) => {
					switch (x) {
						case "leftEdge":
							dx[i] = 0;
							break;
						case "rightEdge":
							dx[i] = laneLength - w;
							break;
						case "topEdge":
							dy = 0;
							break;
						case "bottomEdge":
							dy = laneWidth - h;
							break;
					}
				});
			}		
		}

		// rotate the context if the rotation degree is defined
		// reset the coordination: otherwise the rotation would be superposed
		myCtx.setTransform(1, 0, 0, 1, 0, 0);
		myCtx.translate( +(dx[i]+w/2), +(dy+h/2) );			
		myCtx.rotate(r);
		myCtx.translate( -(dx[i]+w/2), -(dy+h/2) );

		// predefined colors
		let myColors = {};
		i  == 3 ? myColors = transparency.belgium : myColors = transparency.france;

		// draw vis: 
		if(args && args[i]) {
			image.draw(myCtx, dx[i], dy, w/3, h, myColors, args[i]);	
		} 

		// else {
		// 	image.draw(myCtx, dx[i], dy, w/3, h, myColors);
		// }		
	});		
}

// add vis type = canvas shape
// @ obj: selected lane(s) => checked object(s) of lane_selector

// @ vis: selected vis => the value of radio button == the constructor of shape to call
// @ sx: horizontal drift distance == $("#horizontal").val() + dx
// @ sy: vertical drift distance == $("#vertical").val() + dy
// @ sh: height drift distance
// @ sw: width drift distance
// @ r: rotation degree
// @ colorArr: colors from picked color set
// @ args: myData[frameId] => object, should use args[swimmerId] to access each swimmer's data, swimmerId == i == [0, 7]
// @ edge: an array, align to which edge(s) => left/right and/or top/bottom
// @ flip: a flag to switch in front / behind after a turn
function addVisShape(obj, vis, sx, sy, sh, sw, r, colorArr, args, edge, flip) {
	// check if vis string can be used to access an existing constructor => YES!
	let shape = this[vis];
	// modify the dx, dy, w, h according to the sliders
	let w = Math.floor(parseFloat(shape.w) + sw);
	let h = Math.floor(parseFloat(shape.h) + sh);

	// coordination (x, y) on canvas => when moving, modify shape.dx	
	let dx = Array(8).fill( Math.floor( (laneLength - w)/2 + sx ));
	let dy = Math.floor((laneWidth-h)/2 + sy);

	// if !MOVE && alignButton checked => 
	let ALIGN = $("#alignButton").prop("checked");
	let x_array = [], x_max, x_min, leftDrift, rightDrift;
	if(!MOVE) {	
		// find out the maximum and the minimum x in args => used for left and right align
		if(STOPPOS){
			for(let i=0; i<8; i++) {
				switch(vis) {
					case "worldRecordLine":
						STOPPOS[i]["x_world"] ? x_array.push(STOPPOS[i]["x_world"]) : true;
						break;
					case "olympicsRecordLine":
						STOPPOS[i]["x_olympic"] ? x_array.push(STOPPOS[i]["x_olympic"]) : true;
						break;
					case "personalRecordLine":
						STOPPOS[i]["x_personal"] ? x_array.push(STOPPOS[i]["x_personal"]) : true;
						break;
					case "nationalRecordLine":
						STOPPOS[i]["x_national"] ? x_array.push(STOPPOS[i]["x_national"]) : true;
						break;
					default:
						STOPPOS[i]["x_middle"] ? x_array.push(STOPPOS[i]["x_middle"]) : true;
				}
			}
			x_max = Math.max(...x_array), x_min = Math.min(...x_array);

			if(!ALIGN) {			
				leftDrift = x_min/halfDistance*laneLength;
				rightDrift = rightDrift = laneLength-(x_max/halfDistance*laneLength+w);
			}
		}
	}

	obj.each(function(){
		// find the correct canvas by ID: myCvs is an object
		let myVal = $(this).val();
		let i = myVal-1;

		let myCvs = $("#"+vis+"_"+myVal);
		let myCtx = myCvs[0].getContext("2d");

		// for moving: calculate x and y position according to the existing canvas
		if(args && args[i]) {
			if(MOVE) {
				// no flip
				if(!flip) {
					switch(vis) {
						case "worldRecordLine":
							args[i]["direction"] == "advance" ? dx[i] = args[i]["x_world"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_world"]/halfDistance*laneLength-w/2-sx;
							break;
						case "olympicsRecordLine":
							args[i]["direction"] == "advance" ? dx[i] = args[i]["x_olympic"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_olympic"]/halfDistance*laneLength-w/2-sx;
							break;
						case "personalRecordLine":
							args[i]["direction"] == "advance" ? dx[i] = args[i]["x_personal"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_personal"]/halfDistance*laneLength-w/2-sx;
							break;
						case "nationalRecordLine":
							args[i]["direction"] == "advance" ? dx[i] = args[i]["x_national"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_national"]/halfDistance*laneLength-w/2-sx;
							break;
						default:
							args[i]["direction"] == "advance" ? dx[i] = args[i]["x_middle"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_middle"]/halfDistance*laneLength-w/2-sx;
					}
				}
				// with flip => switch 
				if(flip) {
					switch(vis) {
						case "worldRecordLine":
							args[i]["direction"] == "advance" ? dx[i] = args[i]["x_world"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_world"]/halfDistance*laneLength-w/2+sx;
							break;
						case "olympicsRecordLine":
							args[i]["direction"] == "advance" ? dx[i] = args[i]["x_olympic"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_olympic"]/halfDistance*laneLength-w/2+sx;
							break;
						case "personalRecordLine":
							args[i]["direction"] == "advance" ? dx[i] = args[i]["x_personal"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_personal"]/halfDistance*laneLength-w/2+sx;
							break;
						case "nationalRecordLine":
							args[i]["direction"] == "advance" ? dx[i] = args[i]["x_national"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_national"]/halfDistance*laneLength-w/2+sx;
							break;
						default:
							args[i]["direction"] == "advance" ? dx[i] = args[i]["x_middle"]/halfDistance*laneLength-w/2+sx : dx[i] = args[i]["x_middle"]/halfDistance*laneLength-w/2+sx;
					}
				}
			}
			if(!MOVE) {
				if(!ALIGN) {
					switch(vis) {
						case "worldRecordLine":
							dx[i] = STOPPOS[i]["x_world"]/halfDistance*laneLength-w/2+sx;
							break;
						case "olympicsRecordLine":
							dx[i] = STOPPOS[i]["x_olympic"]/halfDistance*laneLength-w/2+sx;
							break;
						case "personalRecordLine":
							dx[i] = STOPPOS[i]["x_personal"]/halfDistance*laneLength-w/2+sx;
							break;
						case "nationalRecordLine":
							dx[i] = STOPPOS[i]["x_national"]/halfDistance*laneLength-w/2+sx;
							break;
						default:
							dx[i] = STOPPOS[i]["x_middle"]/halfDistance*laneLength-w/2+sx;
					}

					if(edge) {						
						edge.forEach( (x) => {
							switch (x) {
								case "leftEdge":
									switch(vis) {
										case "worldRecordLine":
											dx[i] = STOPPOS[i]["x_world"]/halfDistance*laneLength - leftDrift;
											break;
										case "olympicsRecordLine":
											dx[i] = STOPPOS[i]["x_olympic"]/halfDistance*laneLength - leftDrift;
											break;
										case "personalRecordLine":
											dx[i] = STOPPOS[i]["x_personal"]/halfDistance*laneLength - leftDrift;
											break;
										case "nationalRecordLine":
											dx[i] = STOPPOS[i]["x_national"]/halfDistance*laneLength - leftDrift;
											break;
										default:
											dx[i] = STOPPOS[i]["x_middle"]/halfDistance*laneLength - leftDrift;
									}
									break;
								case "rightEdge":
									switch(vis) {
										case "worldRecordLine":
											dx[i] = STOPPOS[i]["x_world"]/halfDistance*laneLength + rightDrift;
											break;
										case "olympicsRecordLine":
											dx[i] = STOPPOS[i]["x_olympic"]/halfDistance*laneLength + rightDrift;
											break;
										case "personalRecordLine":
											dx[i] = STOPPOS[i]["x_personal"]/halfDistance*laneLength + rightDrift;
											break;
										case "nationalRecordLine":
											dx[i] = STOPPOS[i]["x_national"]/halfDistance*laneLength + rightDrift;
											break;
										default:
											dx[i] = STOPPOS[i]["x_middle"]/halfDistance*laneLength + rightDrift;
									}
									break;
								case "topEdge":
									dy = 0;
									break;
								case "bottomEdge":
									dy = laneWidth - h;
									break;
							}
						});						
					} 
				}

				if(ALIGN) {
					dx = Array(8).fill( Math.floor( (laneLength - w)/2 + sx ));
					if(edge) {
						edge.forEach( (x) => {
							switch (x) {
								case "leftEdge":
									dx[i] = 0;
									break;
								case "rightEdge":
									dx[i] = laneLength - w;
									break;
								case "topEdge":
									dy = 0;
									break;
								case "bottomEdge":
									dy = laneWidth - h;
									break;
							}
						});
					}
				}
			}
		}

		if(!args) {
			dx = Array(8).fill( Math.floor( (laneLength - w)/2 + sx ));
			if(edge) {
				edge.forEach( (x) => {
					switch (x) {
						case "leftEdge":
							dx[i] = 0;
							break;
						case "rightEdge":
							dx[i] = laneLength - w;
							break;
						case "topEdge":
							dy = 0;
							break;
						case "bottomEdge":
							dy = laneWidth - h;
							break;
					}
				});
			}
		}
		

		// rotate the context if the rotation degree is defined
		// reset the coordination: otherwise the rotation would be superposed
		myCtx.setTransform(1, 0, 0, 1, 0, 0);
		myCtx.translate( +(dx[i]+w/2), +(dy+h/2) );			
		myCtx.rotate(r);
		myCtx.translate( -(dx[i]+w/2), -(dy+h/2) );

		// draw vis: TODO -> identify which data is needed
		if(args && args[i]) {
			(edge && edge.length > 0) ? shape.draw(myCtx, dx[i], dy, w, h, colorArr, args[i], edge, vis, i) : shape.draw(myCtx, dx[i], dy, w, h, colorArr, args[i], undefined, vis, i);			
		} 		
	});
}

// UPDATED: 
// If the current selected representation has "layer" class: clean the current drawn on canvas 
// If it does not have "layer" class: remove its canvas + embed new ones
function reEmbedCanvas(){
	visChecked = getVis();
	laneChecked = getLanes();

	// clean the previous selected representations
	clearCanvas();

	// if already have one as layer then don't do the following things
	let myVis = getVis();
	let myVisClass = $("."  + myVis).get();
	// create canvas and append image at the aim position if there is nothing as layer
	$(myVisClass[0]).hasClass("layer") ? true : addCanvas(laneChecked, visChecked, laneCount, laneWidth, vTB, laneLength);	
}

// --------- didn't actually use --------------
// redraw new vis on each created canvas
// @ colors: check if color is modified, if yes, use new colors, otherwise use previous colors
// @ args: object, to pass the real time data myData[frameId] (all data for each swimmer per frame)
// @ transparencies: check if transparency of flag is modified, if yes, use new transparencies, otherwise use previous transparencies
// @ transparencies = {"france": {"left": xxx, "middle": xxx, "right": xxx,}, "belgium": {...}}
// @ edge: array of selected edge. When move desactive, align at left/right and/or top/bottom edge
// @ flip: (MOVE) flag to flip the in front/behind positions
// @ stop: if !MOVE => should use the stopped position
function reDraw(colors, args, transparencies, edge, flip){
	visChecked = getVis(); // return undefined or vis
	laneChecked = getLanes(); // return object
	let checkedLanes = getLanes(true); // return array of number

	// default value of [x, y, h, w, r] are 0
	// UPDATE: alignButton display && checked
	if(MOVE) {
		var x = parseInt( $("#horizontal").val() ), y = parseInt( $("#vertical").val() );
	}

	if(!MOVE) {
		var x = parseInt( $("#moveHorizontalSlider").val() ), y = parseInt( $("#moveVerticalSlider").val() );		
	}

	let h = parseInt( $("#heightSlider").val() ), w = parseInt( $("#widthSlider").val() );
	let r = parseInt( $("#rotationSlider").val() )*Math.PI/180;

	if(visChecked){
		// clear each single canvas: now the following function clear the checked lanes, because I created canvas only on checked lanes => should create on all lanes, and let checked lanes' ones visible, others stay invisible
		$("." + visChecked).get().length == 0 ? addCanvas(laneChecked, visChecked, laneCount, laneWidth, vTB, laneLength) : clearCanvas2D(checkedLanes, visChecked);

		if(IMAGE){
			// use previous transparencies
			if(!transparencies) {
				// read old ones from the title
				let myTransparencies = {"france": {"left": null, "middle": null, "right": null}, "belgium": {"left": null, "middle": null, "right": null}};

				for(let i=0; i<Object.keys(myTransparencies).length; i++) {
					myTransparencies[Object.keys(myTransparencies)[i]].left = `rgba(${(colorSet[Object.keys(myTransparencies)[i]].rgb_l)[0]}, ${(colorSet[Object.keys(myTransparencies)[i]].rgb_l)[1]}, ${(colorSet[Object.keys(myTransparencies)[i]].rgb_l)[2]}, ${getTransparency($("#" + Object.keys(myTransparencies)[i]).attr("title"))})`;
					myTransparencies[Object.keys(myTransparencies)[i]].middle = `rgba(${(colorSet[Object.keys(myTransparencies)[i]].rgb_m)[0]}, ${(colorSet[Object.keys(myTransparencies)[i]].rgb_m)[1]}, ${(colorSet[Object.keys(myTransparencies)[i]].rgb_m)[2]}, ${getTransparency($("#" + Object.keys(myTransparencies)[i]).attr("title"))})`;
					myTransparencies[Object.keys(myTransparencies)[i]].right = `rgba(${(colorSet[Object.keys(myTransparencies)[i]].rgb_r)[0]}, ${(colorSet[Object.keys(myTransparencies)[i]].rgb_r)[1]}, ${(colorSet[Object.keys(myTransparencies)[i]].rgb_r)[2]}, ${getTransparency($("#" + Object.keys(myTransparencies)[i]).attr("title"))})`;
				}

				// when the video is playing, read the X coordination and other data for the current frame
				if(args) {
					if(edge) {
						if(flip) {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, myTransparencies, args, edge, flip);
						} else {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, myTransparencies, args, edge);
						}	
					} else {
						if(flip) {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, myTransparencies, args, undefined, flip);
						} else {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, myTransparencies, args);
						}					
					}
				// when the video is not playing, remain the X coordination	to be the same as previous frame
				} else {
					if(edge) {
						if(flip) {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, myTransparencies, undefined, edge, flip);
						} else {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, myTransparencies, undefined, edge);
						}					
					} else {
						if(flip) {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, myTransparencies, undefined, undefined, flip);
						} else {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, myTransparencies);
						}						
					}
				}

			} else {
				// when the video is playing, read the X coordination and other data for the current frame
				if(args) {
					if(edge) {
						if(flip) {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, transparencies, args, edge, flip);
						} else {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, transparencies, args, edge);
						}
					} else {
						if(flip) {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, transparencies, args, undefined, flip);
						} else {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, transparencies, args);
						}
					}
				// when the video is not playing, remain the X coordination	to be the same as previous frame
				} else {
					if(edge) {
						if(flip) {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, transparencies, undefined, edge, flip);
						} else {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, transparencies, undefined, edge);
						}
					} else {
						if(flip) {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, transparencies, undefined, undefined, flip);
						} else {
							addVisImage(laneChecked, visChecked, x, y, h, w, r, transparencies);
						}
					}
				}
			}			
			COLOR_PICKER = false;
		}
		
		if(!IMAGE){
			if(!colors) {
				let colorNumber = predefinedColors[visChecked].colors;
				let myColor = new Array(colorNumber).fill(0);
				// get color from color picker
				for(let i=0; i<colorNumber; i++) {
					myColor[i] = $("#color_" + (i+1) ).css("background-color");
				}

				// when the video is playing, read the X coordination and other data for the current frame					
				if(args) {
					if(edge) {
						if(flip) {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, myColor, args, edge, flip);							
						} else {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, myColor, args, edge);
						}						
					} else {
						if(flip) {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, myColor, args, undefined, flip);
						} else {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, myColor, args);
						}	
					}					
				// when the video is not playing, remain the X coordination	to be the same as previous frame
				} else {
					if(edge) {
						if(flip) {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, myColor, undefined, edge, flip);
						} else {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, myColor, undefined, edge);
						}						
					} else {
						if(flip) {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, myColor, undefined, undefined, flip);
						} else {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, myColor);
						}						
					}
				}

			} else {
				if(args) {
					if(edge) {
						if(flip) {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, colors, args, edge, flip);
						} else {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, colors, args, edge);
						}
					} else {
						if(flip) {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, colors, args, undefined, flip);
						} else {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, colors, args);
						}
					}
				} else {
					if(edge) {
						if(flip) {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, colors, undefined, edge, flip);
						} else {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, colors, undefined, edge);
						}
					} else {
						if(flip) {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, colors, undefined, undefined, flip);
						} else {
							addVisShape(laneChecked, visChecked, x, y, h, w, r, colors);
						}
					}
				}
			}
			TRANSPARENCY = false;						
		}
	}	
}

// for the layers, what I need from the current video is only the myData[frameId]
// we have the archived layers => created only according to the selected lanes or created for all lanes, only selected ones to be visible?
// then, according to the selected lanes saved in redux.myVis.archives, read myData[frameId][swimmerId]
// x = myData[frameId][swimmerId][x_middle] + swift_X
// last, find the correct data myData[frameId][swimmerId][dataItem]
// @ args = myData[frameId]
// @ records = customizedData
function reDrawLayer(args, records) {
	for(let j = records.length-1; j>=0; j--) {
		let myVisibility = records[j]["visibility"];

		if(!myVisibility) {
			continue;
		} else {
			// reduxStatusGroup
			reduxStatusGroup = records[j]["reduxStatusGroup"];
			// current vis id: string
			let myVis = records[j]["visualization_id"];
			// use the vis as variable
			let vis = this[records[j]["visualization_id"]];

			// get the predefined size of vis (height & width)
			let predefined_h = parseFloat(vis.h), predefined_w = parseFloat(vis.w);

			// for representations as layers: get all properties from redux.myVisualizations.archives
			let myArchives = records[j]["design_factors"];
			// checked lanes
			let checkedLanes = myArchives["lane_selector"]; // array of lane value = [1, 2, 3, .., 7, 8]
			// MOVE
			let myMOVE = myArchives["MOVE"];
			// when MOVE: FLIP, (x,y) shift distance
			let myFLIP = myArchives["FLIP"];
			let shift_x = myArchives["horizontal"][2]/myArchives["widthSlider"][3]*predefined_w, shift_y = myArchives["vertical"][2]/myArchives["heightSlider"][3]*predefined_h;
			// when !MOVE: leftRight, topBottom shift distance, align, edge and STOPPOS
			let shift_lr = myArchives["leftRight"][2]/myArchives["widthSlider"][3]*predefined_w, shift_tb = myArchives["topBottom"][2]/myArchives["heightSlider"][3]*predefined_h;			
			let myALIGN = myArchives["ALIGN"], myEdge = myArchives["edgeNames"];
			let mySTOPPOS = myArchives["STOPPOS"]; 		
			
			// representation's deformation
			let delta_h = myArchives["heightSlider"][2]/myArchives["heightSlider"][3]*predefined_h, delta_w = myArchives["widthSlider"][2]/myArchives["widthSlider"][3]*predefined_w, r = myArchives["rotationRadius"];
				
			// image or shape, color or transparency
			let myIMAGE = myArchives["IMAGE"], myCOLOR = myArchives["COLOR_PICKER"], myTRANSPARENCY = myArchives["TRANSPARENCY"];
			// color/transparency codes
			let myColorCodes = myArchives["color_set_block_codes"], myTransparencyCodes = myArchives["transparency_set_block_codes"];

			// final width and height used to draw
			let w = Math.floor(predefined_w + delta_w), h = Math.floor(predefined_h + delta_h);
			// final (x, y) position used to draw: same y for 8 lanes, different dx according to swimmer
			let dx = [], dy;

			// prepare the x_max && x_min for myALIGN / myEdge cases
			let x_array = [], x_max, x_min, leftDrift, rightDrift;
			if(!myMOVE) {
				if(mySTOPPOS) {
					for(let i=0; i<laneCount; i++) {
						switch(myVis) {
							case "worldRecordLine":
								mySTOPPOS[i]["x_world"] ? x_array.push(mySTOPPOS[i]["x_world"]) : true;
								break;
							case "olympicsRecordLine":
								mySTOPPOS[i]["x_olympic"] ? x_array.push(mySTOPPOS[i]["x_olympic"]) : true;
								break;
							case "personalRecordLine":
								mySTOPPOS[i]["x_personal"] ? x_array.push(mySTOPPOS[i]["x_personal"]) : true;
								break;
							case "nationalRecordLine":
								mySTOPPOS[i]["x_national"] ? x_array.push(mySTOPPOS[i]["x_national"]) : true;
								break;
							default:
								mySTOPPOS[i]["x_middle"] ? x_array.push(mySTOPPOS[i]["x_middle"]) : true;
						}
					}
					x_max = Math.max(...x_array), x_min = Math.min(...x_array);

					if(!myALIGN) {
						leftDrift = x_min/halfDistance*laneLength;
						rightDrift = laneLength-(x_max/halfDistance*laneLength+w);
					}
				}
			} 

			// for each selected lanes
			for (let i=0; i<checkedLanes.length; i++) {
				let myCvs = $("#"+myVis+"_"+checkedLanes[i]);
				let myCtx = myCvs[0].getContext("2d");
				myCtx.clearRect(-(myCvs.width()+predefined_w*4), -(myCvs.width()+predefined_w*4), myCvs.width()*2+predefined_w*8, myCvs.width()*2+predefined_w*8);		

				// current swimmer ID: used to find data in myData[frameId][swimmerId] 
				let mySwimmerId = checkedLanes[i] - 1;

				// when MOVE
				if(myMOVE) {
					// central position + shift quantity: used when there is no data in current frame
					dx = Array(8).fill(Math.floor( (laneLength - w)/2 + shift_x));
					dy = Math.floor( (laneWidth - h)/2 + shift_y );

					// current frame has data
					if(args && args[mySwimmerId]) {
						if( !myFLIP ) {
							switch(myVis) {
								case "worldRecordLine":
									args[mySwimmerId]["direction"] == "advance" ? dx[mySwimmerId] = args[mySwimmerId]["x_world"]/halfDistance*laneLength-w/2+shift_x : dx[mySwimmerId] = args[mySwimmerId]["x_world"]/halfDistance*laneLength-w/2-shift_x;
									break;
								case "olympicsRecordLine":
									args[mySwimmerId]["direction"] == "advance" ? dx[mySwimmerId] = args[mySwimmerId]["x_olympic"]/halfDistance*laneLength-w/2+shift_x : dx[mySwimmerId] = args[mySwimmerId]["x_olympic"]/halfDistance*laneLength-w/2-shift_x;
									break;
								case "personalRecordLine":
									args[mySwimmerId]["direction"] == "advance" ? dx[mySwimmerId] = args[mySwimmerId]["x_personal"]/halfDistance*laneLength-w/2+shift_x : dx[mySwimmerId] = args[mySwimmerId]["x_personal"]/halfDistance*laneLength-w/2-shift_x;
									break;
								case "nationalRecordLine":
									args[mySwimmerId]["direction"] == "advance" ? dx[mySwimmerId] = args[mySwimmerId]["x_national"]/halfDistance*laneLength-w/2+shift_x : dx[mySwimmerId] = args[mySwimmerId]["x_national"]/halfDistance*laneLength-w/2-shift_x;
									break;
								default:
									args[mySwimmerId]["direction"] == "advance" ? dx[mySwimmerId] = args[mySwimmerId]["x_middle"]/halfDistance*laneLength-w/2+shift_x : dx[mySwimmerId] = args[mySwimmerId]["x_middle"]/halfDistance*laneLength-w/2-shift_x;
							}
						}

						if( myFLIP ) {
							switch(myVis) {
								case "worldRecordLine":
									args[mySwimmerId]["direction"] == "advance" ? dx[mySwimmerId] = args[mySwimmerId]["x_world"]/halfDistance*laneLength-w/2+shift_x : dx[mySwimmerId] = args[mySwimmerId]["x_world"]/halfDistance*laneLength-w/2+shift_x;
									break;
								case "olympicsRecordLine":
									args[mySwimmerId]["direction"] == "advance" ? dx[mySwimmerId] = args[mySwimmerId]["x_olympic"]/halfDistance*laneLength-w/2+shift_x : dx[mySwimmerId] = args[mySwimmerId]["x_olympic"]/halfDistance*laneLength-w/2+shift_x;
									break;
								case "personalRecordLine":
									args[mySwimmerId]["direction"] == "advance" ? dx[mySwimmerId] = args[mySwimmerId]["x_personal"]/halfDistance*laneLength-w/2+shift_x : dx[mySwimmerId] = args[mySwimmerId]["x_personal"]/halfDistance*laneLength-w/2+shift_x;
									break;
								case "nationalRecordLine":
									args[mySwimmerId]["direction"] == "advance" ? dx[mySwimmerId] = args[mySwimmerId]["x_national"]/halfDistance*laneLength-w/2+shift_x : dx[mySwimmerId] = args[mySwimmerId]["x_national"]/halfDistance*laneLength-w/2+shift_x;
									break;
								default:
									args[mySwimmerId]["direction"] == "advance" ? dx[mySwimmerId] = args[mySwimmerId]["x_middle"]/halfDistance*laneLength-w/2+shift_x : dx[mySwimmerId] = args[mySwimmerId]["x_middle"]/halfDistance*laneLength-w/2+shift_x;
							}
						} 
					}				
				}

				// when !MOVE
				if( !myMOVE ) {
					// central position + shift quantity: used when there is no data in mySTOPPOS
					dx = Array(8).fill(Math.floor( (laneLength - w)/2 + shift_lr ));
					dy = Math.floor( (laneWidth - h)/2 + shift_tb );

					// there is a stop position in archives
					if(mySTOPPOS && mySTOPPOS[mySwimmerId]) {						
						if(myALIGN) {
							dx = Array(8).fill(Math.floor( (laneLength - w)/2 + shift_lr ));
							if(myEdge){
								myEdge.forEach( (x) => {
									switch (x) {
										case "leftEdge":
											dx[mySwimmerId] = 0;
											break;
										case "rightEdge":
											dx[mySwimmerId] = laneLength - w;
											break;
										case "topEdge":
											dy = 0;
											break;
										case "bottomEdge":
											dy= laneWidth - h;
											break;
									}
								});
							}
						}

						if(!myALIGN) {
							switch(myVis) {
								case "worldRecordLine":
									dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_world"]/halfDistance*laneLength-w/2+shift_lr;
									break;
								case "olympicsRecordLine":
									dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_olympic"]/halfDistance*laneLength-w/2+shift_lr;
									break;
								case "personalRecordLine":
									dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_personal"]/halfDistance*laneLength-w/2+shift_lr;
									break;
								case "nationalRecordLine":
									dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_national"]/halfDistance*laneLength-w/2+shift_lr;
									break;
								default:
									dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_middle"]/halfDistance*laneLength-w/2+shift_lr;
							}
							// dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_middle"]/halfDistance*laneLength-w/2+shift_lr;
							if(myEdge) {
								myEdge.forEach( (x) => {
									switch (x) {								
										case "leftEdge":
											switch(myVis) {
												case "worldRecordLine":
													dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_world"]/halfDistance*laneLength - leftDrift;
													break;
												case "olympicsRecordLine":
													dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_olympic"]/halfDistance*laneLength - leftDrift;
													break;
												case "personalRecordLine":
													dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_personal"]/halfDistance*laneLength - leftDrift;
													break;
												case "nationalRecordLine":
													dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_national"]/halfDistance*laneLength - leftDrift;
													break;
												default:
													dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_middle"]/halfDistance*laneLength - leftDrift;
											}
											break;
										case "rightEdge":
											switch(myVis) {
												case "worldRecordLine":
													dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_world"]/halfDistance*laneLength + rightDrift;
													break;
												case "olympicsRecordLine":
													dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_olympic"]/halfDistance*laneLength + rightDrift;
													break;
												case "personalRecordLine":
													dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_personal"]/halfDistance*laneLength + rightDrift;
													break;
												case "nationalRecordLine":
													dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_national"]/halfDistance*laneLength + rightDrift;
													break;
												default:
													dx[mySwimmerId] = mySTOPPOS[mySwimmerId]["x_middle"]/halfDistance*laneLength + rightDrift;
											}
											break;
										case "topEdge":
											dy = 0;
											break;
										case "bottomEdge":
											dy = laneWidth - h;
											break;
									}
								});
							}
						}

					// when there is no stop position in archives
					} else {
						dx = Array(8).fill(Math.floor( (laneLength - w)/2 + shift_lr ));
						if(myEdge) {
							myEdge.forEach( (x) => {
								switch (x) {
									case "leftEdge":
										dx[mySwimmerId] = 0;
										break;
									case "rightEdge":
										dx[mySwimmerId] = laneLength - w;
										break;
									case "topEdge":
										dy = 0;
										break;
									case "bottomEdge":
										dy= laneWidth - h;
										break;
								}
							});
						}						
					}
				}
					
				// rotate the context if the rotation degree is defined
				// reset the coordination: otherwise the rotation would be superposed
				myCtx.setTransform(1, 0, 0, 1, 0, 0);
				myCtx.translate( +(dx[mySwimmerId]+w/2), +(dy+h/2) );			
				myCtx.rotate(r);
				myCtx.translate( -(dx[mySwimmerId]+w/2), -(dy+h/2) );

				// when current frame has data
				if(args && args[mySwimmerId]) {
					if(myIMAGE) {
						if( mySwimmerId == 3 ) {
							vis.draw(myCtx, dx[mySwimmerId], dy, w/3, h, myTransparencyCodes.belgium);
						} else {
							vis.draw(myCtx, dx[mySwimmerId], dy, w/3, h, myTransparencyCodes.france);
						}
					}

					if(!myIMAGE) {
						(myEdge && myEdge.length > 0) ? vis.draw(myCtx, dx[mySwimmerId], dy, w, h, myColorCodes, args[mySwimmerId], myEdge, myVis, mySwimmerId) : vis.draw(myCtx, dx[mySwimmerId], dy, w, h, myColorCodes, args[mySwimmerId], undefined, myVis, mySwimmerId);
					}
				} 
			}
		}
	}
}

/* --------------------- video section ---------------------*/
// link the customized ply/pause button with HTML5 video listener
function togglePlayPause(){
	if(myVideo.paused) {
		myPlayPauseBtn.className = "pause";
		myVideo.play();
	} else {
		myPlayPauseBtn.className = "play";
		myVideo.pause();
	}
}

myPlayPauseBtn.onclick = function() {
	togglePlayPause();
}

// when drag on the customized time progress bar: 1) give feedback on UI, 2) update video current time
$("#myProgressBar").on("input", function() {
	let currentValue = $(this).val();

	if(currentValue < raceStartTime) {
		myProgressBar.style.backgroundImage = `linear-gradient(to right, #878787 0%, #878787 ${currentValue}%, #d3d3d3 ${currentValue}%, #d3d3d3 ${raceStartPercent}%, #BEE6F4 ${raceStartPercent}%)`; 
	} else {
		myProgressBar.style.backgroundImage = `linear-gradient(to right, #878787 0%, #878787 ${raceStartPercent}%, #3C6CA8 ${raceStartPercent}%, #3C6CA8 ${currentValue}%, #BEE6F4 ${currentValue}%)`;
	}

	// link to video
	let currentTime = currentValue/100*videoDuration;
	$("#myVideo").prop("currentTime", currentTime);

	// play the video only between the race period (with real data)
	if(currentTime < raceStartTime) {
		$("#myVideo").prop("currentTime", raceStartTime);
	}

	if(currentTime >= videoDuration) {
		$("#myVideo").prop("currentTime", raceStartTime);
	}
});

function getCurrentFrame() {
	return Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);
}

myVideo.addEventListener("loadedmetadata", function(){
	// try to make the video starts time at the race beginning
	this.currentTime = raceStartTime;
	
	// give value to the laneWidth and laneLength
	laneWidth = VIDEO_HEIGHT/8;
	laneLength = VIDEO_WIDTH;

	// metadata
	nationalFlags = {
		// initial the size of flag
		w: Math.floor(laneWidth*0.8),
		h: Math.floor(laneWidth*0.8/3*2),

		dx: Math.floor((laneLength-laneWidth*0.8)/2),
		dy: Math.floor((laneWidth-laneWidth*0.8/3*2)/2),

		// @ ctx: draw on which context of canvas
		// @ colors: colors should be used when there is no data for the current frame
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, colors, args) {
			let c_l, c_m, c_r;
			c_l = colors.left;
			c_m = colors.middle;
			c_r = colors.right;

			// draw left part
			ctx.fillStyle = c_l;
			ctx.fillRect(x, y, width, height);
			// middle
			ctx.fillStyle = c_m;
			ctx.fillRect(x+width, y, width, height);
			// right
			ctx.fillStyle = c_r;
			ctx.fillRect(x+width*2, y, width, height); 					
		}
	}
	nationalText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "bottom";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "bottom";
							ctx.textAlign = "center";
							break;
					}
				});
			}					
			// read text
			let text; 
			if(args["nationality"]) {
				text = args["nationality"];
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);						
			}										
		}
	}
	nameText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge, myVis, currentSwimmer) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];

			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["name"]) {
				text = args["name"].split(" ")[0];	
				ctx.fillText(text, x, y);				
				ctx.strokeText(text, x, y);						
			}					
		}
	}
	ageText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["age"]) {
				text = parseInt(args["age"]) + " yrs";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);											
			}					
		}
	}

	// time-related
	lapDifferencesRecordText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		// @ myVis: string of the selected visualization
		// record: world/olympic/national/personal 
		// record in myData: world50, world100/olympic50, olympic100/national50, national100/personal50, personal100
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge, myVis) {
			// get the target record from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let record = myObj["record"]; // which record is selected

			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text, lapRecord, lapRecordKey, currentLapKey, currentLap; 
			// get the lap time according to the first-half or second-half
			if(args["direction"]) {
				// first-half or second-half: get the key
				args["direction"] == "advance" ? lapRecordKey = `${record}50` : lapRecordKey = `${record}100`;
				lapRecord = args[lapRecordKey];	

				args["direction"] == "advance" ? currentLapKey = `currentLap50` : currentLapKey = `currentLap100`;					
				currentLap = args[currentLapKey];
				
				text = (currentLap - lapRecord).toFixed(2) + " s";

				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}						
		}
	}
	// record bar chart: compare the current swimmer's lap time to the record	
	lapDifferencesRecordBarChart = {
		// initial width and height of the chart
		w: Math.floor(laneLength*0.5), // the entire width of this bar chart: record
		h: Math.floor(laneWidth*0.5), // the max height of this group of bar chart
		s: Math.floor(laneWidth*0.5*0.1), // lane space between the top and bottom bars: 10% of the entire height

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneLength*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.5)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis) {
			// get the target record from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let record = myObj["record"]; 
			
			let lapRecord, lapRecordKey, currentLapKey, currentLap; 
			let l = color_arr.length; // 4 colors: 2 bars
			let targetWidth; // bar chart width of the current swimmer 
			// get the lap time according to the first-half or second-half
			if(args["direction"]) {
				// first-half or second-half: get the key
				args["direction"] == "advance" ? lapRecordKey = `${record}50` : lapRecordKey = `${record}100`;
				lapRecord = args[lapRecordKey];	
				args["direction"] == "advance" ? currentLapKey = `currentLap50` : currentLapKey = `currentLap100`;					
				currentLap = args[currentLapKey];
				
				targetWidth = Math.floor(currentLap/lapRecord*width);
				// draw for the target: record
				ctx.beginPath();					
				ctx.rect( x, y, width, Math.floor(height*0.45) );
				ctx.fillStyle = color_arr[l-4];
				ctx.fill();
				// draw for the current swimmer: stroke						
				ctx.strokeStyle = color_arr[l-3];					
				ctx.stroke();
				
				// draw for the current swimmer: lap						
				ctx.beginPath();										
				ctx.rect( x, y+Math.floor(height*0.55), targetWidth, Math.floor(height*0.45) );
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				// draw for the current swimmer: stroke
				ctx.strokeStyle = color_arr[l-1];					
				ctx.stroke();	
			}													
		}
	}
	// glyph: 2 millisecond = 1 arrow
	lapDifferencesRecordGlyph = {
		// initial width and height of the chart
		w: Math.floor(laneLength*0.1), // the entire width of record line (and glyph line)
		h: Math.floor(laneWidth*0.05), // height of each line
		// distance between the glyph line and the record line: length of record line * percentage_of_deltaTime

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneLength*0.1)/2),
		dy: Math.floor((laneWidth-laneWidth*0.05)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis) {
			// get the target swimmer from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let record = myObj["record"]; 
			
			let lapRecord, lapRecordKey, currentLapKey, currentLap; 
			let l = color_arr.length; // 4 colors: line + stop point
			let deltaTime, targetLength, glyphLength; // distance between the glyph line and the record line 
			// get the lap time according to the first-half or second-half
			if(args["direction"]) {
				// first-half or second-half: get the key
				args["direction"] == "advance" ? lapRecordKey = `${record}50` : lapRecordKey = `${record}100`;
				lapRecord = args[lapRecordKey];	
				args["direction"] == "advance" ? currentLapKey = `currentLap50` : currentLapKey = `currentLap100`;					
				currentLap = args[currentLapKey];
				deltaTime = currentLap-lapRecord;
				targetLength = Math.floor( 2*width*Math.abs(deltaTime/lapRecord) );
				glyphLength = Math.floor(width*0.2);

				// draw the record line: horizontal
				ctx.beginPath();
				ctx.rect(x, y, width, height);
				ctx.fillStyle = color_arr[l-4];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-3];
				ctx.stroke();

				// draw the distance line
				ctx.beginPath();
				ctx.fillStyle = color_arr[l-4];						
				ctx.strokeStyle = color_arr[l-3];						
				if(deltaTime > 0) {
					ctx.rect(x+Math.floor(width/2-height/2), y+height, height, targetLength);
				} else if (deltaTime < 0) {
					ctx.rect(x+Math.floor(width/2-height/2), y-targetLength, height, targetLength);
				} else if( deltaTime == 0) {
					ctx.fillStyle = color_arr[l-2];
					ctx.strokeStyle = color_arr[l-1];							
					ctx.arc(x+Math.floor(width/2), y+Math.floor(height/2), height, 0, 2*Math.PI);
				}
				ctx.fill();
				ctx.stroke();
				

				// draw the glyph line
				ctx.beginPath();
				if(deltaTime > 0) {
					ctx.rect(x+Math.floor(width/2-glyphLength/2), y+height+targetLength, glyphLength, height);
				} else if (deltaTime < 0) {
					ctx.rect(x+Math.floor(width/2-glyphLength/2), y-targetLength-height, glyphLength, height);
				}
				ctx.fillStyle = color_arr[l-4];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-3];
				ctx.stroke();
			}
		}
	}
	lapDifferencesSwimmerText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		// @ myVis: string of the selected visualization 
		// @ swimmer: lane1/lane2/lane3...lane8
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge, myVis, currentSwimmer) {
			// get the target swimmer from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let swimmer = myObj["swimmer"]; 

			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let lapKey, currentSwimmerLap, targetSwimmerId, targetSwimmerLap; 
			// get the lap time according to the first-half or second-half
			if(args["direction"]) {
				// first-half or second-half: get the key
				args["direction"] == "advance" ? lapKey = `currentLap50` : lapKey = `currentLap100`;
				currentSwimmerLap = args[lapKey];	

				targetSwimmerId = parseInt(swimmer.split("e")[1])-1;
				targetSwimmerLap = myData[globalCurrentFrame][targetSwimmerId][lapKey];
	
				text = (currentSwimmerLap - targetSwimmerLap).toFixed(2) + " s";

				if(targetSwimmerId == currentSwimmer) {
					ctx.beginPath();
					ctx.arc(x, y, Math.floor(fontSize/2), 0, 2*Math.PI);
					ctx.fill();
					ctx.stroke();
				} else {
					ctx.strokeText(text, x, y);
					ctx.fillText(text, x, y);
				}						
			}
		}
	}
	lapDifferencesSwimmerBarChart = {
		// initial width and height of the chart
		w: Math.floor(laneLength*0.5), // the entire width of this bar chart: targetSwimmerLap
		h: Math.floor(laneWidth*0.5), // the max height of this group of bar chart
		s: Math.floor(laneWidth*0.5*0.1), // lane space between the top and bottom bars: 10% of the entire height

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneLength*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.5)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			// get the target record from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let swimmer = myObj["swimmer"]; 
			
			let lapKey, currentSwimmerLap, targetSwimmerId, targetSwimmerLap; 
			let l = color_arr.length; // 4 colors: 2 bars
			let targetWidth; // bar chart width of the current swimmer 
			// get the lap time according to the first-half or second-half
			if(args["direction"]) {
				// first-half or second-half: get the key
				args["direction"] == "advance" ? lapKey = `currentLap50` : lapKey = `currentLap100`;					
				currentSwimmerLap = args[lapKey];
				
				targetSwimmerId = parseInt(swimmer.split("e")[1])-1;
				targetSwimmerLap = myData[globalCurrentFrame][targetSwimmerId][lapKey];

				targetWidth = Math.floor(currentSwimmerLap/targetSwimmerLap*width);
				
				// draw for the target: targetSwimmerLap
				ctx.beginPath();
				if( targetSwimmerId != currentSwimmer ) {
					ctx.rect( x, y, width, Math.floor(height*0.45) );
				}
				if(targetSwimmerId == currentSwimmer) {
					ctx.rect( x, y+Math.floor(height*0.275), width, Math.floor(height*0.45) );
				} 
				ctx.fillStyle = color_arr[l-4];
				ctx.fill();
				// draw for the current swimmer: stroke						
				ctx.strokeStyle = color_arr[l-3];					
				ctx.stroke();
				
				if( targetSwimmerId != currentSwimmer ) {
					// draw for the current swimmer: currentSwimmerLap						
					ctx.beginPath();										
					ctx.rect( x, y+Math.floor(height*0.55), targetWidth, Math.floor(height*0.45) );
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					// draw for the current swimmer: stroke
					ctx.strokeStyle = color_arr[l-1];					
					ctx.stroke();	
				}
				if( targetSwimmerId == currentSwimmer ) {
					ctx.beginPath();										
					ctx.arc( x+Math.floor(width/2), y+Math.floor(height/2), height/2, 0, 2*Math.PI );
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					// draw for the current swimmer: stroke
					ctx.strokeStyle = color_arr[l-1];					
					ctx.stroke();
				}
				
			}													
		}
	}
	lapDifferencesSwimmerGlyph = {
		// initial width and height of the chart
		w: Math.floor(laneLength*0.1), // the entire width of record line (and glyph line)
		h: Math.floor(laneWidth*0.05), // height of each line
		// distance between the glyph line and the record line: length of record line * percentage_of_deltaTime

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneLength*0.1)/2),
		dy: Math.floor((laneWidth-laneWidth*0.05)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			// get the target swimmer from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let swimmer = myObj["swimmer"]; 

			let lapKey, currentSwimmerLap, targetSwimmerId, targetSwimmerLap; 
			let l = color_arr.length; // 4 colors: 2 bars
			let deltaTime, targetLength, glyphLength; // distance between the glyph line and the record line 
			// get the lap time according to the first-half or second-half
			if(args["direction"]) {
				// first-half or second-half: get the key
				args["direction"] == "advance" ? lapKey = `currentLap50` : lapKey = `currentLap100`;					
				currentSwimmerLap = args[lapKey];

				targetSwimmerId = parseInt(swimmer.split("e")[1])-1;
				targetSwimmerLap = myData[globalCurrentFrame][targetSwimmerId][lapKey];

				deltaTime = currentSwimmerLap-targetSwimmerLap;
				targetLength = Math.floor( 2*width*Math.abs(deltaTime/targetSwimmerLap) );
				glyphLength = Math.floor(width*0.2);

				// draw the record line: horizontal
				ctx.beginPath();
				ctx.rect(x, y, width, height);
				ctx.fillStyle = color_arr[l-4];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-3];
				ctx.stroke();

				// draw the distance line
				ctx.beginPath();
				ctx.fillStyle = color_arr[l-4];	
				ctx.strokeStyle = color_arr[l-3];										
				if(deltaTime > 0) {
					ctx.rect(x+Math.floor(width/2-height/2), y+height, height, targetLength);
				}
				if (deltaTime < 0) {
					ctx.rect(x+Math.floor(width/2-height/2), y-targetLength, height, targetLength);
				}
				if( targetSwimmerId == currentSwimmer ) {
					ctx.fillStyle = color_arr[l-2];
					ctx.strokeStyle = color_arr[l-1];							
					ctx.arc(x+Math.floor(width/2), y+Math.floor(height/2), height, 0, 2*Math.PI);
				}						
				ctx.fill();							
				ctx.stroke();
				

				// draw the glyph line
				ctx.beginPath();
				if(deltaTime > 0) {
					ctx.rect(x+Math.floor(width/2-glyphLength/2), y+height+targetLength, glyphLength, height);
				}
				if (deltaTime < 0) {
					ctx.rect(x+Math.floor(width/2-glyphLength/2), y-targetLength-height, glyphLength, height);
				}
				ctx.fillStyle = color_arr[l-4];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-3];
				ctx.stroke();
			}
		}
	}
	elapsedText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["elapsed"]) {
				text = args["elapsed"] + " s";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);						
			}					
		}
	}
	elapsedTimer = {
		// initial the vis size: radius & circle weight
		w: Math.floor(laneWidth*0.45), // radius => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.05), // circle weight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor((laneLength-laneWidth*0.45)/2),
		dy: Math.floor((laneWidth-laneWidth*0.45)/2), // should be centered

		draw: function(ctx, x, y, width, height, color_arr, args, edge) {
			if(args["elapsed"]) {
				let time = args["elapsed"];											
				let percent = time/raceDuration;

				let dx = x+width, dy = y;
				if(edge && edge != "") {
					edge.forEach( (x) => {
						switch(x) {
							case "leftEdge":
								dx = dx;
								break;
							case "rightEdge":
								dx = dx-width;
								break;
							case "topEdge":
								dy = dy+width;
								break;
							case "bottomEdge":
								dy = dy-width;
								break;
						}
					});						
				} 

				let l = color_arr.length;
				ctx.beginPath();					
				ctx.moveTo(dx, dy);				
				ctx.arc(dx, dy, width, -0.5*Math.PI, 2*Math.PI*percent-0.5*Math.PI);
				ctx.closePath();
				ctx.fillStyle = color_arr[l-3];	
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();

				ctx.beginPath();					
				ctx.moveTo(dx, dy);				
				ctx.arc(dx, dy, width, 2*Math.PI*percent-0.5*Math.PI, -0.5*Math.PI);
				ctx.closePath();
				ctx.fillStyle = color_arr[l-2];	
				ctx.fill();					
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
			}
		}
	}	
	elapsedProgressBar = {
		// initial the vis size: height & width
		w: Math.floor(laneLength*0.5), // width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.2), // height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor((laneLength-laneLength*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.2)/2), // should be centered

		draw: function(ctx, x, y, width, height, color_arr, args) {
			let time, percentage, targetSliceWidth;
			if(args["elapsed"]) {
				time = args["elapsed"];
				percentage = time/raceDuration;
			} else {
				time = parseFloat(args);
				percentage = time/raceDuration;
			}
			targetSliceWidth = Math.floor(width*percentage);

			let l = color_arr.length; // 3 colors: 2 bars + 1 stroke
			// passed time (target slice)
			ctx.beginPath();
			ctx.rect(x, y, targetSliceWidth, height);
			ctx.fillStyle = color_arr[l-3];
			ctx.fill();
			ctx.strokeStyle = color_arr[l-1];
			ctx.stroke();
			// remaining time					
			ctx.beginPath();
			ctx.rect(x+targetSliceWidth, y, width-targetSliceWidth, height);
			ctx.fillStyle = color_arr[l-2];
			ctx.fill();
			ctx.strokeStyle = color_arr[l-1];
			ctx.stroke();

			/*
			// rounded-corner rectangle
			ctx.strokeStyle = color_arr[l-3];
			ctx.lineWidth = height*0.25;
			ctx.roundRect(x, y, width, height, [height*0.1]);
			ctx.stroke();
			// progress bar
			ctx.beginPath();
			ctx.fillStyle = color_arr[1];
			ctx.roundRect(x+height*0.125, y+height*0.125, (width-height*0.25)*percent, height*0.75, [height*0.1]);
			ctx.fill();
			*/
		}
	}
	currentLapText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["currentLap"]) {
				text = parseFloat(args["currentLap"]).toFixed(2) + " s";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}					
		}
	}
	currentLapBarChart = {
		// initial the vis size: height & width
		w: Math.floor(laneWidth*0.8), // width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.4), // height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor((laneLength-laneWidth*0.8)/2),
		dy: Math.floor((laneWidth-laneWidth*0.4)/2), // should be centered

		// @ width: width of the entire bar chart
		// @ height: height of the highest bar => second bar
		// @ color_arr: [0] => first bar, [1] => second bar
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args) {
			let l = color_arr.length, percent; // 4 colors: 2 bars
			if(args["currentLap"]) {
				percent = parseFloat(args["currentLap"])/parseFloat(args["averageLap"]);
				if(args["direction"] == "advance") {
					// draw the first bar: only has first bar
					ctx.beginPath();
					ctx.rect(x, y, Math.floor(width*percent), Math.floor(height*0.45));
					ctx.fillStyle = color_arr[l-4];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();
				} else if (args["direction"] == "return") {
					let p = parseFloat(args["currentLap50"])/parseFloat(args["averageLap"]);
					// draw the first bar: has two bars							
					ctx.beginPath();
					ctx.rect(x, y, Math.floor(width*p), Math.floor(height*0.45));
					ctx.fillStyle = color_arr[l-4];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();
					// draw the second bar: has two bars							
					ctx.beginPath();
					ctx.rect(x, y+Math.floor(height*0.55), Math.floor(width*percent), Math.floor(height*0.45));
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				} 						
			}							
		}
	}
	averageLapText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["averageLap"]) {
				text = parseFloat(args["averageLap"]).toFixed(2) + " s";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}					
		}
	}

	// speed-related
	currentSpeedBarChart = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8), // the entire width of this bar chart
		h: Math.floor(laneWidth*0.8*0.2), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.8)/2),
		dy: Math.floor((laneWidth-laneWidth*0.8*0.2)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args) {
			let l = color_arr.length, percent; // 3 colors: 2 bars + 1 stroke
			if(args["speed"]) {
				percent = args["speed"]/2.2;
				// draw the foreground slice
				ctx.beginPath();
				ctx.rect(x, y, Math.floor(width*percent), height);
				ctx.fillStyle = color_arr[l-3];
				ctx.fill();
				ctx.srtokeStyle = color_arr[l-1];
				ctx.stroke();
				// draw the background slice
				
				ctx.beginPath();
				ctx.rect(x+Math.floor(width*percent), y, width-Math.floor(width*percent), height);
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				ctx.srtokeStyle = color_arr[l-1];
				ctx.stroke();					
			}					
		}
	}
	currentSpeedText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["speed"]) {
				text = parseFloat(args["speed"]).toFixed(2) + " m/s";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}					
		}
	}
	currentSpeedCircularSector = {
		// initial the vis size: radius & width
		w: Math.floor(laneWidth*0.4), // radius => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.05), // stroke weight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor((laneLength-laneWidth*0.4)/2),
		dy: Math.floor((laneWidth-laneWidth*0.45)/2), // should be centered

		draw: function(ctx, x, y, width, height, color_arr, args, edge) {
			if(args["speed"] && args["speed"] < 3) {
				let speed = args["speed"];						
				let percent = speed/2.2;
				let fullArc = Math.PI*0.5, currentArc = fullArc*percent, deltaH = Math.sin(currentArc/2)*width;
				let videoCurrentTime = myVideo.currentTime;

				if( (args["direction"] && args["direction"] == "advance") || (videoCurrentTime < 14) ) {
					var dx = x;
				}

				if( (args["direction"] && args["direction"] == "return") || (videoCurrentTime < 83) ) {
					var dx = x+width;
				}

				let dy = y+height/2;

				if(edge && edge != "") {
					edge.forEach( (x) => {
						switch(x) {
							case "leftEdge":
								dx = dx;
								break;
							case "rightEdge":
								dx = dx;
								break;
							case "topEdge":
								dy = deltaH;
								break;
							case "bottomEdge":
								dy = laneWidth-deltaH;
								break;
						}
					});						
				} 
				
				let l = color_arr.length;
				if( (args["direction"] && args["direction"] == "advance")  || (videoCurrentTime < 14) ) {
					// pie slice stroke: top + bottom
					ctx.beginPath();							
					ctx.lineWidth = height;
					ctx.moveTo(dx+deltaH/Math.tan(currentArc/2), dy-deltaH);
					ctx.lineTo(dx, dy);
					ctx.lineTo(dx+deltaH/Math.tan(currentArc/2), dy+deltaH);
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();
					// pie slice stroke: left
					ctx.beginPath();							
					ctx.lineWidth = height;
					ctx.arc(dx, dy, width, -currentArc/2, currentArc/2);
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
					
					// pie slice: arc
					ctx.beginPath();						
					ctx.moveTo(dx, dy);
					ctx.lineTo(dx+deltaH/Math.tan(currentArc/2), dy-deltaH);
					ctx.arc(dx, dy, width, -currentArc/2, currentArc/2);
					ctx.closePath();
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();	
				}

				if ( (args["direction"] && args["direction"] == "return") || (videoCurrentTime > 83) ) {
					// pie slice stroke: top + bottom
					ctx.beginPath();							
					ctx.lineWidth = height;
					ctx.moveTo(dx-deltaH/Math.tan(currentArc/2), dy-deltaH);
					ctx.lineTo(dx, dy);
					ctx.lineTo(dx-deltaH/Math.tan(currentArc/2), dy+deltaH);
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();
					// pie slice stroke: left
					ctx.beginPath();							
					ctx.lineWidth = height;
					ctx.arc(dx, dy, width, -currentArc/2+Math.PI, currentArc/2+Math.PI);
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
					
					// pie chart arc
					ctx.beginPath();
					ctx.moveTo(dx, dy);
					ctx.lineTo(dx-deltaH/Math.tan(currentArc/2), dy+deltaH);
					ctx.arc(dx, dy, width, -currentArc/2+Math.PI, currentArc/2+Math.PI);
					ctx.closePath();
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
				}
			}									
		}
	}
	accelerationText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["acceleration"]) {
				text = parseFloat(args["acceleration"]).toFixed(3) + " m/s\xB2";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}					
		}
	}
	accelerationBarChart = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8*0.2), // the entire width of this bar chart
		h: Math.floor(laneWidth*0.4), // the max height of this bar chart

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth*0.4)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args) {
			let l = color_arr.length, percent; // 4 colors: 2 bars
			if(args["acceleration"]) {
				let acceleration = args["acceleration"];
				switch (acceleration) {
					case acceleration >= 0.150:
						percent = 1;
						break;
					case acceleration <= -0.150:
						percent = -1;
						break;
					default:
						percent = acceleration / 0.150;
				}
			
				let deltaH = Math.floor(height*Math.abs(percent));
				let direction = args["direction"];
							
				// draw the positive slice
				if(percent >= 0 && direction == "advance") {
					ctx.beginPath();					
					ctx.rect(x-deltaH, y, deltaH, width );
					ctx.fillStyle = color_arr[l-4];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();
				} 
				if(percent < 0 && direction == "return") {
					ctx.beginPath();					
					ctx.rect(x-deltaH, y, deltaH, width );
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				} 
				if(percent < 0 && direction == "advance") {
					ctx.beginPath();					
					ctx.rect(x, y, deltaH, width );
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}	
				if(percent >= 0 && direction == "return" ) {
					ctx.beginPath();					
					ctx.rect(x, y, deltaH, width );
					ctx.fillStyle = color_arr[l-4];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();
				}						
			}									
		}
	}
	accelerationGlyph = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.6), // the entire width of this bar chart
		h: Math.floor(laneWidth*0.25), // the max height of this bar chart

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneWidth*0.4)/2),
		dy: Math.floor((laneWidth-laneWidth*0.4)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args) {
			let l = color_arr.length, percent; // 4 colors: 2 direction
			// when there is meaningful acceleration
			y = y+Math.floor(height/2);
			if(args["acceleration"]) {
				let acceleration = args["acceleration"];
				let direction = args["direction"];
				if(acceleration > 0) {
					if(direction == "advance") {
						ctx.beginPath();
						ctx.moveTo(x, y);
						ctx.lineTo(x+width/4, y-height/2);
						ctx.lineTo(x+width/4, y-height/4);
						ctx.lineTo(x+width, y);
						ctx.lineTo(x+width/4, y+height/4);
						ctx.lineTo(x+width/4, y+height/2);
						ctx.closePath();
						ctx.fillStyle = color_arr[l-4];
						ctx.strokeStyle = color_arr[l-3];
						ctx.fill();
						ctx.stroke();
					}
					if(direction == "return") {
						ctx.beginPath();
						ctx.moveTo(x, y);
						ctx.lineTo(x+width*3/4, y-height/4);
						ctx.lineTo(x+width*3/4, y-height/2);
						ctx.lineTo(x+width, y);
						ctx.lineTo(x+width*3/4, y+height/2);
						ctx.lineTo(x+width*3/4, y+height/4);
						ctx.closePath();
						ctx.fillStyle = color_arr[l-4];
						ctx.strokeStyle = color_arr[l-3];
						ctx.fill();
						ctx.stroke();
					}
				}
				if(acceleration < 0) {
					if(direction == "advance") {
						ctx.beginPath();
						ctx.moveTo(x, y);
						ctx.lineTo(x+width*3/4, y-height/4);
						ctx.lineTo(x+width*3/4, y-height/2);
						ctx.lineTo(x+width, y);
						ctx.lineTo(x+width*3/4, y+height/2);
						ctx.lineTo(x+width*3/4, y+height/4);
						ctx.closePath();
						ctx.fillStyle = color_arr[l-2];
						ctx.strokeStyle = color_arr[l-1];
						ctx.fill();
						ctx.stroke();
					}
					if(direction == "return") {
						ctx.beginPath();
						ctx.moveTo(x, y);
						ctx.lineTo(x+width/4, y-height/2);
						ctx.lineTo(x+width/4, y-height/4);
						ctx.lineTo(x+width, y);
						ctx.lineTo(x+width/4, y+height/4);
						ctx.lineTo(x+width/4, y+height/2);
						ctx.closePath();
						ctx.fillStyle = color_arr[l-2];
						ctx.strokeStyle = color_arr[l-1];
						ctx.fill();
						ctx.stroke();
					}
				}
			}
		}
	}
	averageSpeedText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge, UNDEF, currentSwimmer) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["averageSpeed"]) {
				text = parseFloat(myData[globalCurrentFrame][currentSwimmer]["averageSpeed"]).toFixed(2).toString() + " m/s";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}					
		}
	}
	speedHistoryLineChart = {
		// initial the vis size: height & width
		w: Math.floor(laneLength*0.5), // width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.5), // height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor((laneLength-laneLength*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.5)/2), // should be centered

		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, UNDEF, currentSwimmer) {

		}
	}
	speedDifferencesSwimmerText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		// @ myVis: string of the selected visualization 
		// @ swimmer: lane1/lane2/lane3...lane8
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge, myVis, currentSwimmer) {
			// get the target swimmer from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let swimmer = myObj["swimmer"]; 

			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text, currentSwimmerSpeed, targetSwimmerId, targetSwimmerSpeed; 
			let deltaSpeed;
			if(args["speed"]) {
				currentSwimmerSpeed = args["speed"];
				targetSwimmerId = parseInt(swimmer.split("e")[1])-1;
				targetSwimmerSpeed = myData[globalCurrentFrame][targetSwimmerId]["speed"];
				deltaSpeed = (currentSwimmerSpeed - targetSwimmerSpeed).toFixed(2);
				text = (currentSwimmerSpeed - targetSwimmerSpeed).toFixed(2) + " m/s";
				if( targetSwimmerId == currentSwimmer ) {
					ctx.beginPath();
					ctx.arc(x, y, fontSize/2, 0, 2*Math.PI);
					ctx.fill();
					ctx.stroke();
				} 
				if(targetSwimmerId != currentSwimmer) {
					ctx.strokeText(text, x, y);
					ctx.fillText(text, x, y);	
				}
			}
			
		}
	}
	// swimmer bar chart: compare the current swimmer's speed to the target one 
	speedDifferencesSwimmerBarChart = {
		// initial width and height of the chart
		w: Math.floor(laneLength*0.5), // the entire width of this bar chart: target one
		h: Math.floor(laneWidth*0.5), // the max height of this group of bar chart
		s: Math.floor(laneWidth*0.5*0.1), // lane space between the top and bottom bars: 10% of the entire height

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth*0.4)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			// get the target swimmer from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let swimmer = myObj["swimmer"]; 
			
			let currentSwimmerSpeed, targetSwimmerId, targetSwimmerSpeed;
			let deltaSpeed, deltaPercentage, deltaWidth;
			
			if(args["speed"]) {
				currentSwimmerSpeed = args["speed"];
				targetSwimmerId = parseInt(swimmer.split("e")[1])-1;
				targetSwimmerSpeed = myData[globalCurrentFrame][targetSwimmerId]["speed"];

				deltaSpeed = currentSwimmerSpeed - targetSwimmerSpeed;
				deltaPercentage = deltaSpeed/targetSwimmerSpeed;
				deltaWidth = Math.floor(width*deltaPercentage);
			}

			let l = color_arr.length; // 4 colors: 2 bars
			// draw for the target swimmer: bar
			ctx.fillStyle = color_arr[l-4];
			ctx.beginPath();
			if( targetSwimmerId != currentSwimmer ) {
				ctx.rect( x, y, width, Math.floor(height*0.45) );
			}
			if(targetSwimmerId == currentSwimmer) {
				ctx.rect( x, y+Math.floor(height*0.275), width, Math.floor(height*0.45) );
			} 
			ctx.fill();
			// draw for the current swimmer: stroke
			ctx.strokeStyle = color_arr[l-3];					
			ctx.stroke();
			
			if( targetSwimmerId != currentSwimmer ) {
				// draw for the current swimmer: currentSwimmerLap						
				ctx.beginPath();										
				ctx.rect( x, y+Math.floor(height*0.55), width+deltaWidth, Math.floor(height*0.45) );
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				// draw for the current swimmer: stroke
				ctx.strokeStyle = color_arr[l-1];					
				ctx.stroke();	
			}
			if( targetSwimmerId == currentSwimmer ) {
				ctx.beginPath();										
				ctx.arc( x+Math.floor(width/2), y+Math.floor(height/2), height/2, 0, 2*Math.PI );
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				// draw for the current swimmer: stroke
				ctx.strokeStyle = color_arr[l-1];					
				ctx.stroke();
			}							
		}
	}
	// glyph: 2 percentage point = 1 arrow
	speedDifferencesSwimmerGlyph = {
		// initial width and height of the chart
		w: Math.floor(laneLength*0.2), // the entire width of this glyph, with 20 arrows
		h: Math.floor(laneWidth*0.5), // the max height of this group of bar chart
		a: 5,
		s: Math.floor(laneLength*0.005), // space between arrows: w*1%

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth*0.4)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			// get the target swimmer from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let swimmer = myObj["swimmer"]; 
			
			let currentSwimmerSpeed, targetSwimmerId, targetSwimmerSpeed;
			let deltaSpeed, deltaPercentage;
			
			if(args["speed"]) {
				currentSwimmerSpeed = args["speed"];
				targetSwimmerId = parseInt(swimmer.split("e")[1])-1;
				targetSwimmerSpeed = myData[globalCurrentFrame][targetSwimmerId]["speed"];

				deltaSpeed = currentSwimmerSpeed - targetSwimmerSpeed;
				deltaPercentage = Math.round(deltaSpeed/targetSwimmerSpeed*100/2);
			}

			// width per arrow, space between arrows
			let arrowWidth = Math.floor(width/5), arrowSpace = Math.floor(arrowWidth*0.001);
			let l = color_arr.length; // 5 colors: 2 fills + 1 stroke, 1 fill + 1 stroke
			x = x+Math.floor(width/2); 
			if( deltaSpeed > 0 && args["direction"] == "advance" )  {
				for(let i=0; i<deltaPercentage; i++) {
					ctx.beginPath();
					ctx.moveTo(i*(arrowWidth+arrowSpace)+x, y+Math.floor(height/2));
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth, y);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y+Math.floor(height/2));
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth, y+height);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y+height);
					ctx.closePath();
					ctx.fillStyle = color_arr[l-3];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}
			}

			if( deltaSpeed < 0 && args["direction"] == "advance" ) {
				for(let i=0; i<Math.abs(deltaPercentage); i++) {
					ctx.beginPath();
					ctx.moveTo(i*(arrowWidth+arrowSpace)+x, y);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth, y+Math.floor(height/2));
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y+height);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x, y+height);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y+Math.floor(height/2));
					ctx.closePath();
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}
			}

			if( deltaSpeed < 0 && args["direction"] == "return" )  {
				for(let i=0; i<Math.abs(deltaPercentage); i++) {
					ctx.beginPath();
					ctx.moveTo(-i*(arrowWidth+arrowSpace)+x, y+Math.floor(height/2));
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth, y);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y+Math.floor(height/2));
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth, y+height);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y+height);
					ctx.closePath();
					ctx.fillStyle = color_arr[l-3];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}
			}

			if( deltaSpeed > 0 && args["direction"] == "return" ) {
				for(let i=0; i<deltaPercentage; i++) {
					ctx.beginPath();
					ctx.moveTo(-i*(arrowWidth+arrowSpace)+x, y);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth, y+Math.floor(height/2));
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y+height);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x, y+height);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y+Math.floor(height/2));
					ctx.closePath();
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}
			}

			if( targetSwimmerId == currentSwimmer ) {
				ctx.beginPath();
				ctx.arc(x, y+Math.floor(height/2), Math.floor(height/2), 0, 2*Math.PI);
				ctx.closePath();
				ctx.fillStyle = color_arr[l-5];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-4];
				ctx.stroke();
			}
		}
	}
	speedDifferencesRecordText = {			
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		// @ myVis: string of the selected visualization
		// @ record: world/olympic/national/personal
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge, myVis) {
			// get the target record from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let record = myObj["record"]; 

			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text, currentSwimmerSpeed, recordSpeedKey, recordSpeed; 
			if(args["speed"]) {
				currentSwimmerSpeed = args["speed"];
				recordSpeedKey = `speed_${record}`;
				recordSpeed = args[recordSpeedKey];
				text = (currentSwimmerSpeed - recordSpeed).toFixed(2) + " m/s";;
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}
				
		}
	
	}	
	// swimmer bar chart: compare the current swimmer's speed to the record			
	speedDifferencesRecordBarChart = {
		// initial width and height of the chart
		w: Math.floor(laneLength*0.5), // the entire width of this bar chart: target one
		h: Math.floor(laneWidth*0.5), // the max height of this group of bar chart
		s: Math.floor(laneWidth*0.5*0.1), // lane space between the top and bottom bars: 10% of the entire height

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth*0.4)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis) {
			// get the target record from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let record = myObj["record"]; 
			
			let currentSwimmerSpeed, recordSpeedKey, recordSpeed;
			let deltaSpeed, deltaPercentage, deltaWidth;
			
			if(args["speed"]) {
				currentSwimmerSpeed = args["speed"];
				recordSpeedKey = `speed_${record}`;
				recordSpeed = args[recordSpeedKey];

				deltaSpeed = currentSwimmerSpeed - recordSpeed;
				deltaPercentage = deltaSpeed/recordSpeed;
				deltaWidth = Math.floor(width*deltaPercentage);

				let l = color_arr.length; // 4 colors: 2 bars
				// draw for the target swimmer: bar
				ctx.fillStyle = color_arr[l-4];
				ctx.beginPath();					
				ctx.rect( x, y, width, Math.floor(height*0.45) );
				ctx.fill();
				// draw for the current swimmer: stroke
				ctx.strokeStyle = color_arr[l-3];
				ctx.beginPath();					
				ctx.strokeRect(x, y, width, Math.floor(height*0.45) );
				
				// draw for the current swimmer: bar
				ctx.fillStyle = color_arr[l-2];
				ctx.beginPath();										
				ctx.rect( x, y+Math.floor(height*0.55), width+deltaWidth, Math.floor(height*0.45) );
				ctx.fill();
				// draw for the current swimmer: stroke
				ctx.strokeStyle = color_arr[l-1];
				ctx.beginPath();					
				ctx.strokeRect(x, y+Math.floor(height*0.55), width+deltaWidth, Math.floor(height*0.45) );
			}									
		}
	}
	// glyph: 2 percentage point = 1 arrow
	speedDifferencesRecordGlyph = {
		// initial width and height of the chart
		w: Math.floor(laneLength*0.2), // the entire width of this glyph, with 20 arrows
		h: Math.floor(laneWidth*0.5), // the max height of this group of bar chart
		a: 5,
		s: Math.floor(laneLength*0.005), // space between arrows: w*1%

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth*0.4)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis) {
			// get the target swimmer from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let record = myObj["record"]; 
			
			let currentSwimmerSpeed, recordSpeedKey, recordSpeed;
			let deltaSpeed, deltaPercentage, deltaWidth;
			
			if(args["speed"]) {
				currentSwimmerSpeed = args["speed"];
				recordSpeedKey = `speed_${record}`;
				recordSpeed = args[recordSpeedKey];

				deltaSpeed = currentSwimmerSpeed - recordSpeed;
				deltaPercentage = Math.round(deltaSpeed/recordSpeed*100/2);
			}

			// width per arrow, space between arrows
			let arrowWidth = Math.floor(width/5), arrowSpace = Math.floor(arrowWidth*0.001);
			let l = color_arr.length; // 5 colors: 2 fills + 1 stroke, 1 fill + 1 stroke
			if( deltaSpeed > 0 && args["direction"] == "advance" )  {
				for(let i=0; i<deltaPercentage; i++) {
					ctx.beginPath();
					ctx.moveTo(i*(arrowWidth+arrowSpace)+x, y+Math.floor(height/2));
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth, y);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y+Math.floor(height/2));
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth, y+height);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y+height);
					ctx.closePath();
					ctx.fillStyle = color_arr[l-3];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}
			}

			if( deltaSpeed < 0 && args["direction"] == "advance" ) {
				for(let i=0; i<Math.abs(deltaPercentage); i++) {
					ctx.beginPath();
					ctx.moveTo(i*(arrowWidth+arrowSpace)+x, y);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth, y+Math.floor(height/2));
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y+height);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x, y+height);
					ctx.lineTo(i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y+Math.floor(height/2));
					ctx.closePath();
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}
			}

			if( deltaSpeed < 0 && args["direction"] == "return" )  {
				for(let i=0; i<Math.abs(deltaPercentage); i++) {
					ctx.beginPath();
					ctx.moveTo(-i*(arrowWidth+arrowSpace)+x, y+Math.floor(height/2));
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth, y);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y+Math.floor(height/2));
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth, y+height);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y+height);
					ctx.closePath();
					ctx.fillStyle = color_arr[l-3];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}
			}

			if( deltaSpeed > 0 && args["direction"] == "return" ) {
				for(let i=0; i<deltaPercentage; i++) {
					ctx.beginPath();
					ctx.moveTo(-i*(arrowWidth+arrowSpace)+x, y);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth, y+Math.floor(height/2));
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+arrowWidth-Math.floor(height/2), y+height);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x, y+height);
					ctx.lineTo(-i*(arrowWidth+arrowSpace)+x+Math.floor(height/2), y+Math.floor(height/2));
					ctx.closePath();
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}
			}

			if( deltaSpeed == 0 ) {
				ctx.beginPath();
				// ctx.moveTo(x+Math.floor(height/2), y+Math.floor(height/2));
				ctx.arc(x+Math.floor(height/2), y+Math.floor(height/2), Math.floor(height/2), 0, 2*Math.PI);
				ctx.closePath();
				ctx.fillStyle = color_arr[l-5];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-4];
				ctx.stroke();
			}
		}
	}

	/* new-category: position related */
	// abstract from speed-related: distance differences in form of position lines
	positionDifferencesRecordText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		// @ myVis: string of the selected visualization
		// @ record: world/olympic/national/personal
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge, myVis, currentSwimmer) {
			// get the target record from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let record = myObj["record"]; 

			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text;
			let recordPositionX, currentPositionX, deltaX, currentDirection;
			if(args["x_middle"]) {
				recordPositionX = myData[globalCurrentFrame][currentSwimmer][`x_${record}`]; // unit: meter
				currentPositionX = myData[globalCurrentFrame][currentSwimmer]["x_middle"];
				currentDirection = myData[globalCurrentFrame][currentSwimmer]["direction"];
				currentDirection == "advance" ? deltaX = (recordPositionX - currentPositionX).toFixed(2) : deltaX = (currentPositionX - recordPositionX).toFixed(2);

				text = deltaX + " m";;
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}				
		}
	}
	speedDifferencesRecordLine = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8*0.2), // the entire width of this bar chart
		h: Math.floor(laneWidth), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		// @ myVis: string of the selected visualization
		// @ record: world/olympic/national/personal
		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			if(args["x_middle"]) {
				// get the target swimmer from redux
				let myArchives = reduxStatusGroup[myVis].archives;
				let myPointer = reduxStatusGroup[myVis].pointer;
				let myObj = myArchives[myPointer];	
				let record = myObj["record"]; 
				let myMOVE = myObj["MOVE"];
				let myALIGN = myObj["ALIGN"];
				let recordPositionX, recordPositionXinPixel, deltaX, deltaXinPixel;
				let driftX, myXMiddle, myXMiddleinPixel;

				// current swimmer should locate here,
				if(myMOVE) {
					myXMiddle = args["x_middle"]; 
					myXMiddleinPixel = Math.round(myXMiddle/halfDistance*laneLength);
					driftX = x - myXMiddleinPixel;
				} 

				if(!myMOVE) {
					myXMiddle = myObj["STOPPOS"][currentSwimmer]["x_middle"]; 
					myXMiddleinPixel = Math.round(myXMiddle/halfDistance*laneLength);
					driftX = x - myXMiddleinPixel;

				}
				
			
				// the distance between record line & current swimmer's line 
				if(myMOVE) {
					recordPositionX = args[`x_${record}`];
					recordPositionXinPixel = Math.round(recordPositionX/halfDistance*laneLength); // unit: pixel
					deltaX = recordPositionX - args["x_middle"]; // unit: meter
					deltaXinPixel = Math.round(deltaX/halfDistance*laneLength); // unit: pixel
				}

				if(!myMOVE) {
					recordPositionX = myObj["STOPPOS"][currentSwimmer][`x_${record}`]; // unit: meter
					recordPositionXinPixel = Math.round(recordPositionX/halfDistance*laneLength); // unit: pixel
					deltaX = myData[globalCurrentFrame][currentSwimmer][`x_${record}`] - myData[globalCurrentFrame][currentSwimmer]["x_middle"]; // unit: meter
					deltaXinPixel = Math.round(deltaX/halfDistance*laneLength); // unit: pixel
				}

				let l = color_arr.length; // 4 colors
				
				if(myMOVE || (!myMOVE && !myALIGN)) {
					// current swimmer: draw the line				
					ctx.beginPath();
					ctx.rect(recordPositionXinPixel-deltaXinPixel+driftX, y, width, height);
					ctx.fillStyle = color_arr[l-4];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();

					// record line				
					ctx.beginPath();
					ctx.rect(recordPositionXinPixel+driftX, y, width, height);
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();					
				}

				if(!myMOVE && myALIGN) {
					// current swimmer: draw the line				
					ctx.beginPath();
					ctx.rect(x-deltaXinPixel, y, width, height);
					ctx.fillStyle = color_arr[l-4];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();

					// record line				
					ctx.beginPath();
					ctx.rect(x, y, width, height);
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}
			}
		}
	}
	positionDifferencesSwimmerText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		// @ myVis: string of the selected visualization
		// @ record: world/olympic/national/personal
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge, myVis, currentSwimmer) {
			// get the target record from redux
			let myArchives = reduxStatusGroup[myVis].archives;
			let myPointer = reduxStatusGroup[myVis].pointer;
			let myObj = myArchives[myPointer];	
			let swimmer = myObj["swimmer"]; 
			let targetSwimmerId = parseInt(swimmer.split("e")[1])-1;

			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text;
			let targetSwimmerPositionX, currentSwimmerPositionX, deltaX, currentDirection;
			if(args["x_middle"]) {
				targetSwimmerPositionX = myData[globalCurrentFrame][targetSwimmerId]["x_middle"]; // unit: meter
				currentSwimmerPositionX = myData[globalCurrentFrame][currentSwimmer]["x_middle"];
				currentDirection = myData[globalCurrentFrame][currentSwimmer]["direction"];
				currentDirection == "advance" ? deltaX = (targetSwimmerPositionX - currentSwimmerPositionX).toFixed(2) : deltaX = (currentSwimmerPositionX - targetSwimmerPositionX).toFixed(2);

				if( targetSwimmerId == currentSwimmer ) {
					ctx.beginPath();
					ctx.arc(x, y, fontSize/2, 0, 2*Math.PI);
					ctx.fill();
					ctx.stroke();
				}

				if( targetSwimmerId != currentSwimmer ) { 
					text = deltaX + " m";;
					ctx.fillText(text, x, y);
					ctx.strokeText(text, x, y);
				}
			}				
		}
	}
	speedDifferencesSwimmerLine = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8*0.2), // the entire width of this bar chart
		h: Math.floor(laneWidth), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		// @ myVis: string of the selected visualization 
		// @ swimmer: lane1/lane2/lane3...lane8
		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			if(args["x_middle"]) {
				// get the target swimmer from redux
				let myArchives = reduxStatusGroup[myVis].archives;
				let myPointer = reduxStatusGroup[myVis].pointer;
				let myObj = myArchives[myPointer];	
				let swimmer = myObj["swimmer"]; 
				let targetSwimmerId = parseInt(swimmer.split("e")[1])-1;
				let myMOVE = myObj["MOVE"];
				let myALIGN = myObj["ALIGN"];
				let targetSwimmerPositionX, targetSwimmerPositionXinPixel, deltaX, deltaXinPixel;
				let driftX, myXMiddle, myXMiddleinPixel;

				// current swimmer should locate here,
				if(myMOVE) {
					myXMiddle = args["x_middle"]; 
					myXMiddleinPixel = Math.round(myXMiddle/halfDistance*laneLength);
					driftX = x - myXMiddleinPixel;
				} 

				if(!myMOVE) {
					myXMiddle = myObj["STOPPOS"][currentSwimmer]["x_middle"]; 
					myXMiddleinPixel = Math.round(myXMiddle/halfDistance*laneLength);
					driftX = x - myXMiddleinPixel;
				}

				// should use target swimmer position as baseline: otherwise the line of reference will not be aligned
				// when (MOVE): get the position in real time of target swimmer
				if(myMOVE) {
					targetSwimmerPositionX = myData[globalCurrentFrame][targetSwimmerId]["x_middle"]; // unit: meter
					targetSwimmerPositionXinPixel = Math.round(targetSwimmerPositionX/halfDistance*laneLength); // unit: pixel
					deltaX = targetSwimmerPositionX - args["x_middle"]; // unit: meter
					deltaXinPixel = Math.round(deltaX/halfDistance*laneLength); // unit: pixel
				}

				// when (!MOVE): get the STOPPOS position of target swimmer 
				if(!myMOVE) {
					targetSwimmerPositionX = myObj["STOPPOS"][targetSwimmerId]["x_middle"]; // unit: meter
					targetSwimmerPositionXinPixel = Math.round(targetSwimmerPositionX/halfDistance*laneLength); // unit: pixel
					deltaX = myData[globalCurrentFrame][targetSwimmerId]["x_middle"] - myData[globalCurrentFrame][currentSwimmer]["x_middle"]; // unit: meter
					deltaXinPixel = Math.round(deltaX/halfDistance*laneLength); // unit: pixel
				}
							
				let l = color_arr.length; // 6 colors: 2 lines (colors per line: line + stroke), 1 fill + 1 stroke
				
				if(myMOVE || (!myMOVE && !myALIGN)) {
					// current swimmer: draw the line 					
					ctx.beginPath();
					ctx.rect(targetSwimmerPositionXinPixel-deltaXinPixel+driftX, y, width, height);			
					ctx.fillStyle = color_arr[l-4];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();

					// target swimmer: draw the line 					
					ctx.beginPath();
					ctx.rect(targetSwimmerPositionXinPixel+driftX, y, width, height);
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();

					// target swimmer: position point
					if(targetSwimmerId == currentSwimmer) {
						ctx.beginPath();
						ctx.arc(targetSwimmerPositionXinPixel+driftX+Math.floor(width/2), y+Math.floor(height/2), width, 0, 2*Math.PI);
						ctx.closePath();
						ctx.fillStyle = color_arr[l-6];
						ctx.fill();
						ctx.strokeStyle = color_arr[l-5];
						ctx.stroke();
					}
				}

				if(!myMOVE && myALIGN) {
					// current swimmer: draw the line 					
					ctx.beginPath();
					ctx.rect(x-deltaXinPixel, y, width, height);			
					ctx.fillStyle = color_arr[l-4];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();

					// target swimmer: draw the line 					
					ctx.beginPath();
					ctx.rect(x, y, width, height);
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();

					// target swimmer: position point
					if(targetSwimmerId == currentSwimmer) {
						ctx.beginPath();
						ctx.arc(x+Math.floor(width/2), y+Math.floor(height/2), width, 0, 2*Math.PI);
						ctx.closePath();
						ctx.fillStyle = color_arr[l-6];
						ctx.fill();
						ctx.strokeStyle = color_arr[l-5];
						ctx.stroke();
					}
				}	
			}				
		}
	}
	
	// distance-related
	distanceSwamText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["distanceSwam"]) {
				text =parseFloat(args["distanceSwam"]).toFixed(2) + " m";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);						
			}						
		}
	}
	distanceSwamBarChart = {
		// initial width and height of the chart
		w: Math.floor(laneLength*0.5), // the entire width of this bar chart
		h: Math.floor(laneWidth*0.8*0.2), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneLength*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.8*0.2)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args) {
			let l = color_arr.length, percent;
			if(args["distanceSwam"]) {
				percent = parseFloat(args["distanceSwam"])/totalDistance;
			
				// draw the foreground slice
				ctx.beginPath();
				ctx.rect(x, y, Math.floor(width*percent), height);
				ctx.fillStyle = color_arr[l-3];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();

				// draw the background slice						
				ctx.beginPath();
				ctx.rect(x+Math.floor(width*percent), y, width-Math.floor(width*percent), height);
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
			}
		}
	}		
	remainingDistanceText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["distanceRemaining"]) {
				text = parseFloat(args["distanceRemaining"]).toFixed(2) + " m";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);						
			}						
		}
	}
	remainingDistanceBarChart = {
		// initial width and height of the chart
		w: Math.floor(laneLength*0.5), // the entire width of this bar chart
		h: Math.floor(laneWidth*0.8*0.2), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneLength*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.8*0.2)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args) {
			let l = color_arr.length, percent;
			if(args["distanceRemaining"]) {
				percent = parseFloat(args["distanceRemaining"])/totalDistance;					
				// draw the foreground slice
				ctx.beginPath();
				ctx.rect(x, y, Math.floor(width*percent), height);
				ctx.fillStyle = color_arr[l-3];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();

				// draw the background slice						
				ctx.beginPath();
				ctx.rect(x+Math.floor(width*percent), y, width-Math.floor(width*percent), height);
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];						
				ctx.stroke();
			}
		}
	}
	distanceDifferencesLeaderText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["distanceToLeader"]) {
				if(parseFloat(args["distanceToLeader"]) == 0) {
					ctx.beginPath();
					ctx.arc(x, y, fontSize/2, 0, 2*Math.PI);
					ctx.fillStyle = colors[2];
					ctx.fill();
					ctx.strokeStyle = colors[3];
					ctx.stroke();
				}
				if(parseFloat(args["distanceToLeader"]) != 0) {
					text = parseFloat(args["distanceToLeader"]).toFixed(2) + " m";
					ctx.fillText(text, x, y);
					ctx.strokeText(text, x, y);							
				}						
			}	
		}
	}
	distanceDifferencesLeaderLine = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8*0.2), // the entire width of this bar chart
		h: Math.floor(laneWidth), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			if(args["distanceToLeader"]) {
				// get the current leader Id
				let currentLeaderId = parseInt(myData[globalCurrentFrame][currentSwimmer]["currentLeader"]);
				let deltaX = args["distanceToLeader"];
				let deltaXinPixel = Math.round(deltaX/halfDistance*laneLength);

				// get the MOVE and ALIGN situations from redux
				let myArchives = reduxStatusGroup[myVis].archives;
				let myPointer = reduxStatusGroup[myVis].pointer;
				let myObj = myArchives[myPointer];
				let myMOVE = myObj["MOVE"];
				let myALIGN = myObj["ALIGN"];


				// current leader should locate here:
				let leaderX, leaderXinPixel;
				let driftX, myXMiddle, myXMiddleinPixel;

				if(myMOVE) {
					// read the position from current frame
					leaderX = myData[globalCurrentFrame][currentLeaderId]["x_middle"]; 
					leaderXinPixel = Math.round(leaderX/halfDistance*laneLength);
					// calculate the drift X according to sliders
					myXMiddle = args["x_middle"];
					myXMiddleinPixel = Math.round(myXMiddle/halfDistance*laneLength);
					driftX = x - myXMiddleinPixel;
				} 

				if(!myMOVE) {
					// read the STOPPOS from redux
					leaderX = myObj["STOPPOS"][currentLeaderId]["x_middle"]; 
					leaderXinPixel = Math.round(leaderX/halfDistance*laneLength);
					// calculate the drift X according to sliders
					myXMiddle = myObj["STOPPOS"][currentSwimmer]["x_middle"];
					myXMiddleinPixel = Math.round(myXMiddle/halfDistance*laneLength);
					driftX = x - myXMiddleinPixel;
				}

				let l = color_arr.length; // 6 colors: 2 lines (colors per line: line + stroke), 1 fill + 1 stroke
				
				if(myMOVE || (!myMOVE && !myALIGN)) {
					// draw the line of current swimmer
					ctx.beginPath();
					args["direction"] == "advance" ? ctx.rect(leaderXinPixel+deltaXinPixel+driftX, y, width, height) : ctx.rect(leaderXinPixel-deltaXinPixel+driftX, y, width, height);
					ctx.fillStyle = color_arr[l-4];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();

					// draw the line of current leader						
					ctx.beginPath();
					ctx.rect(leaderXinPixel+driftX, y, width, height);
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				
					// current leader: position point
					if(currentLeaderId == currentSwimmer){
						ctx.beginPath();
						ctx.arc(leaderXinPixel+driftX+Math.floor(width/2), y+Math.floor(height/2), width, 0, 2*Math.PI);
						ctx.fillStyle = color_arr[l-6];
						ctx.fill();
						ctx.strokeStyle = color_arr[l-5];
						ctx.stroke();
					}
				}

				if(!myMOVE && myALIGN) {
					// current swimmer: draw the line 					
					ctx.beginPath();
					args["direction"] == "advance" ? ctx.rect(x+deltaXinPixel, y, width, height) : ctx.rect(x-deltaXinPixel, y, width, height);			
					ctx.fillStyle = color_arr[l-4];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-3];
					ctx.stroke();

					// current leader: draw the line 					
					ctx.beginPath();
					ctx.rect(x, y, width, height);
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();

					// current leader: position point
					if(currentLeaderId == currentSwimmer) {
						ctx.beginPath();
						ctx.arc(x+Math.floor(width/2), y+Math.floor(height/2), width, 0, 2*Math.PI);
						ctx.closePath();
						ctx.fillStyle = color_arr[l-6];
						ctx.fill();
						ctx.strokeStyle = color_arr[l-5];
						ctx.stroke();
					}
				}
			}					
		}
	}
	distanceDifferencesLeaderArrow = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.1), // the entire width of this bar chart
		h: Math.floor(laneWidth*0.03), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.5*0.1)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args) {
			if(args["distanceToLeader"]) {
				let deltaX = args["distanceToLeader"];
				let deltaXinPixel = Math.round(deltaX/halfDistance*laneLength);
				// initial width of the arrow should equal to the real distance between the two lines 
				let finalHeight = height/laneWidth/0.8/0.2*deltaXinPixel;

				let l = color_arr.length; // 4 colors: 1 component + 1 stroke, 1 fill + 1 stroke
				// (x, y): position of the current swimmer
				ctx.beginPath();					
				args["direction"] == "advance" ? ctx.moveTo(x-deltaXinPixel, y-0.5*finalHeight) : ctx.moveTo(x+deltaXinPixel, y-0.5*finalHeight);
				// draw a line to the current swimmer
				args["direction"] == "advance" ? ctx.lineTo(x-finalHeight, y-0.5*finalHeight) : ctx.lineTo(x+finalHeight, y-0.5*finalHeight);
				args["direction"] == "advance" ? ctx.lineTo(x-2*finalHeight, y-1.5*finalHeight) : ctx.lineTo(x+2*finalHeight, y-1.5*finalHeight);
				args["direction"] == "advance" ? ctx.lineTo(x-finalHeight, y-1.5*finalHeight) : ctx.lineTo(x+finalHeight, y-1.5*finalHeight);
				ctx.lineTo(x, y-0.5*finalHeight);
				ctx.lineTo(x, y+0.5*finalHeight);
				args["direction"] == "advance" ? ctx.lineTo(x-finalHeight, y+1.5*finalHeight) : ctx.lineTo(x+finalHeight, y+1.5*finalHeight);
				args["direction"] == "advance" ? ctx.lineTo(x-2*finalHeight, y+1.5*finalHeight) : ctx.lineTo(x+2*finalHeight, y+1.5*finalHeight);
				args["direction"] == "advance" ? ctx.lineTo(x-finalHeight, y+0.5*finalHeight) : ctx.lineTo(x+finalHeight, y+0.5*finalHeight);
				args["direction"] == "advance" ? ctx.lineTo(x-deltaXinPixel, y+0.5*finalHeight) : ctx.lineTo(x+deltaXinPixel, y+0.5*finalHeight);
				ctx.closePath();
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
				
				// current leader: position point
				ctx.beginPath();
				args["direction"] == "advance" ? ctx.arc(x-deltaXinPixel+Math.floor(width/2), y+Math.floor(height/2), width, 0, 2*Math.PI) : ctx.arc(x+deltaXinPixel+Math.floor(width/2), y+Math.floor(height/2), width, 0, 2*Math.PI);
				ctx.closePath();
				ctx.fillStyle = color_arr[l-4];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-3];
				ctx.stroke();
			}
		}
	}

	// record-related
	worldRecordText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["world"]) {
				text = parseFloat(args["world"]).toFixed(2) + " s";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}					
		}
	}
	worldRecordLine = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8*0.2), // the entire width of this bar chart
		h: Math.floor(laneWidth), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			let l = color_arr.length;
			// get the record position from dataset: remove the effect of sliders (position slider & moving slider)
			let recordPositionX, recordPositionXinPixel;
			recordPositionX = myData[globalCurrentFrame][currentSwimmer]["x_world"]; // unit: meter
			recordPositionXinPixel = Math.round(recordPositionX/halfDistance*laneLength); // unit: pixel

			// draw the line		
			ctx.beginPath();
			ctx.rect(recordPositionXinPixel, y, width, height);
			ctx.fillStyle = color_arr[l-2];
			ctx.fill();
			ctx.strokeStyle = color_arr[l-1];
			ctx.stroke();
		}
	}
	olympicsRecordText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["olympic"]) {
				text = parseFloat(args["olympic"]).toFixed(2) + " s";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}					
		}
	}
	olympicsRecordLine = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8*0.2), // the entire width of this bar chart
		h: Math.floor(laneWidth), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			let l = color_arr.length;
			// get the record position from dataset: remove the effect of sliders (position slider & moving slider)
			let recordPositionX, recordPositionXinPixel;
			recordPositionX = myData[globalCurrentFrame][currentSwimmer]["x_olympic"]; // unit: meter
			recordPositionXinPixel = Math.round(recordPositionX/halfDistance*laneLength); // unit: pixel
			
			// draw the line
			ctx.beginPath();
			ctx.rect(recordPositionXinPixel, y, width, height);
			ctx.fillStyle = color_arr[l-2];
			ctx.fill();
			ctx.strokeStyle = color_arr[l-1];
			ctx.stroke();
		}
	}
	nationalRecordText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["national"]) {
				text = parseFloat(args["national"]).toFixed(2) + " s";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}					
		}
	}
	nationalRecordLine = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8*0.2), // the entire width of this bar chart
		h: Math.floor(laneWidth), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			let l = color_arr.length;
			// get the record position from dataset: remove the effect of sliders (position slider & moving slider)
			let recordPositionX, recordPositionXinPixel;
			recordPositionX = myData[globalCurrentFrame][currentSwimmer]["x_national"]; // unit: meter
			recordPositionXinPixel = Math.round(recordPositionX/halfDistance*laneLength); // unit: pixel
			
			// draw the line			
			ctx.beginPath();
			ctx.rect(recordPositionXinPixel, y, width, height);
			ctx.fillStyle = color_arr[l-2];
			ctx.fill();
			ctx.strokeStyle = color_arr[l-1];
			ctx.stroke();
		}
	}
	personalRecordText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["personal"]) {
				text = parseFloat(args["personal"]).toFixed(2) + " s";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);
			}					
		}
	}
	personalRecordLine = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8*0.2), // the entire width of this bar chart
		h: Math.floor(laneWidth), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args, UNDEF, myVis, currentSwimmer) {
			let l = color_arr.length;
			// get the record position from dataset: remove the effect of sliders (position slider & moving slider)
			let recordPositionX, recordPositionXinPixel;
			recordPositionX = myData[globalCurrentFrame][currentSwimmer]["x_personal"]; // unit: meter
			recordPositionXinPixel = Math.round(recordPositionX/halfDistance*laneLength); // unit: pixel
			
			// draw the line		
			ctx.beginPath();
			ctx.rect(recordPositionXinPixel, y, width, height);
			ctx.fillStyle = color_arr[l-2];
			ctx.fill();
			ctx.strokeStyle = color_arr[l-1];
			ctx.stroke();
		}
	}

	// predictions
	winnerText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.4*0.1), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let winnerId, text = "Predict winner"; 
			if(args["winner"]) {
				winnerId = parseInt(args["winner"]);
				// display on the winner lane: identify if the current swimmer is the predict winner
				if(args["name"] == myData[globalCurrentFrame][winnerId]["name"]) {
					ctx.strokeText(text, x, y);
					ctx.fillText(text, x, y);
				}
			}				
		}
	}
	winnerGlyph = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.5), // the entire width of this glyph, with 20 arrows
		h: Math.floor(laneWidth*0.5), // the max height of this group of bar chart

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneWidth*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.4)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args) {
			// get the predict winner Id
			let winnerId; 
			if(args["winner"]) {
				winnerId = parseInt(args["winner"]);

				let l = color_arr.length; // 2 colors: 1 fill + 1 stroke
				// display on the winner lane: identify if the current swimmer is the predict winner
				if(args["name"] == myData[globalCurrentFrame][winnerId]["name"]) {
					let h = height, w = width;
					ctx.beginPath();
					ctx.moveTo(x+w/2, y);
					ctx.bezierCurveTo(x+w/2, y+3/4*h, x+1/8*w, y+3/4*h, x+1/8*w, y+3/4*h);
					ctx.lineTo(x+1/8*w, y+7/8*h);
					ctx.lineTo(x+1/4*w, y+7/8*h);
					ctx.lineTo(x+1/4*w, y+h);
					ctx.lineTo(x-1/4*w, y+h);
					ctx.lineTo(x-1/4*w, y+7/8*h);
					ctx.lineTo(x-1/8*w, y+7/8*h);
					ctx.lineTo(x-1/8*w, y+6/8*h);
					ctx.bezierCurveTo(x-w/2, y+3/4*h, x-w/2, y, x-w/2, y);
					ctx.closePath();
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();
				}
			}
		}				
	}
	// next passing: maintain the current speed and compare with the current leader
	nextPassingText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let nextPassingXPosition, nextPassingXPositioninPixel, text = "Here!"; 
			if(args["nextPassing"] && args["nextPassing"] >= 0){
				nextPassingXPosition = parseFloat(args["nextPassing"]);
				nextPassingXPositioninPixel =  nextPassingXPosition/halfDistance*laneLength;
				ctx.strokeText(text, nextPassingXPositioninPixel, y);
				ctx.fillText(text, nextPassingXPositioninPixel, y);						 
			} 			
		}
	}
	nextPassingGlyph = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.5), // the entire width of this glyph, with 20 arrows
		h: Math.floor(laneWidth*0.5), // the max height of this group of bar chart

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneWidth*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.4)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args) {
			let l = color_arr.length; // 6 colors: 3 fills + 3 strokes
			let nextPassingXPosition, nextPassingXPositioninPixel; 
			// display on the winner lane: identify if the current swimmer is the predict winner
			if(args["nextPassing"] && args["nextPassing"]>=0) {
				nextPassingXPosition = parseFloat(args["nextPassing"]);
				nextPassingXPositioninPixel = nextPassingXPosition/halfDistance*laneLength;
				
				ctx.beginPath();
				ctx.fillStyle = color_arr[l-6];
				ctx.strokeStyle = color_arr[l-5];
				ctx.arc(nextPassingXPositioninPixel, y+height/2, height/2, 0, 2*Math.PI);						
				ctx.fill();
				ctx.stroke();
				ctx.closePath();

				ctx.beginPath();
				ctx.fillStyle = color_arr[l-4];
				ctx.strokeStyle = color_arr[l-3];
				ctx.rect(nextPassingXPositioninPixel-width*0.75, y+1/4*height, width*1.5, height/2);						
				ctx.fill();
				ctx.stroke();
				ctx.closePath();
				

				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.font = `${height*0.25}px Arial`;
				ctx.fillStyle = color_arr[l-2];
				ctx.strokeStyle =color_arr[l-1];
				ctx.strokeText("PASS", nextPassingXPositioninPixel, y+height/2);
				ctx.fillText("PASS", nextPassingXPositioninPixel, y+height/2);
			}
		}	
	}
	// compare to the real completion time
	estimatedCompletionTimeText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["estimatedCompletionTime"]) {
				text = parseFloat(args["estimatedCompletionTime"]).toFixed(2) + " s";
				ctx.fillText(text, x, y);
				ctx.strokeText(text, x, y);						
			}					
		}
	}			
	estimatedCompletionTimeBarChart = {
		// initial the vis size: height & width
		w: Math.floor(laneWidth*0.8), // whole width == real completion time
		h: Math.floor(laneWidth*0.5), // whole height of 2 bars
		s: Math.floor(laneWidth*0.1), // space between two bars

		// position: in middle of the canvas
		dx: Math.floor((laneLength-laneWidth*0.8)/2),
		dy: Math.floor((laneWidth-laneWidth*0.5)/2), // should be centered

		// @ width: width of the entire bar chart
		// @ height: height of the highest bar => second bar
		// @ color_arr: [0] => first bar, [1] => second bar
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args) {
			let l = color_arr.length, percent; // 4 colors: 2 fills + 2 strokes
			if(args["estimatedCompletionTime"] && parseFloat(args["estimatedCompletionTime"]) > 0) {
				percent = parseFloat(args["estimatedCompletionTime"])/parseFloat(args["resultS"]);
				
				// draw the first bar: real completion time
				ctx.beginPath();
				ctx.roundRect(x, y, width, Math.floor(height*0.45), [height*0.05]);
				ctx.fillStyle = color_arr[l-4];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-3];
				ctx.stroke();
				ctx.closePath();

				// draw the second bar: estimated completion time
				ctx.beginPath();
				ctx.roundRect(x, y+Math.floor(height*0.55), Math.floor(width*percent), Math.floor(height*0.45), [height*0.05]);
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
				ctx.closePath();						
			}								
		}
	}
	// record
	recordBreakGlyph = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.5), // the entire width of this glyph: boom + XR
		h: Math.floor(laneWidth*0.5), // the max height of this glyph
		
		s: Math.floor(laneLength*0.002), // space between two parts: w*1%

		// initial coordination (x, y) of the chart => in the middle & center of the window size
		dx: Math.floor((laneLength-laneWidth*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.5)/2), // baseline of the positive & negative bars

		draw: function(ctx, x, y, width, height, color_arr, args) {
			if(args["estimatedCompletionTime"] && parseFloat(args["estimatedCompletionTime"])>50) {
				let estimatedCompletionTime = parseFloat(args["estimatedCompletionTime"]);
				let worldRecord = parseFloat(args["world"]);
				let olympicRecord = parseFloat(args["olympic"]);
				let nationalRecord = parseFloat(args["national"]);
				let personalRecord = parseFloat(args["personal"]);
				let text, l = color_arr.length; 

				if(worldRecord - estimatedCompletionTime > 0) {
					text = "WR?";
					// WR
				} else if (olympicRecord - estimatedCompletionTime > 0) {
					// OR
					text = "OR?";
				} else if (nationalRecord - estimatedCompletionTime > 0) {
					// NR
					text = "NR?";
				} else if (personalRecord - estimatedCompletionTime > 0) {
					// PR
					text = "PR?";
				}

				let initial_X = x - width/2, initial_Y = y+height/2, h = height, w = width;
				if(text) {
					// draw the glyph
					ctx.beginPath();
					ctx.moveTo(initial_X, initial_Y);

					ctx.lineTo(initial_X+w/4, initial_Y-h/8);
					ctx.lineTo(initial_X+w/8, initial_Y-3*h/8);
					ctx.lineTo(initial_X+3*w/8, initial_Y-h/4);	
					ctx.lineTo(initial_X+w/2, initial_Y-h/2);	

					ctx.lineTo(initial_X+5*w/8, initial_Y-h/4);
					ctx.lineTo(initial_X+7*w/8, initial_Y-3*h/8);
					ctx.lineTo(initial_X+3*w/4, initial_Y-h/8);
					ctx.lineTo(initial_X+w, initial_Y);

					ctx.lineTo(initial_X+3*w/4, initial_Y+h/8);
					ctx.lineTo(initial_X+7*w/8, initial_Y+3*h/8);
					ctx.lineTo(initial_X+5*w/8, initial_Y+h/4);
					ctx.lineTo(initial_X+w/2, initial_Y+h/2);

					ctx.lineTo(initial_X+3*w/8, initial_Y+h/4);
					ctx.lineTo(initial_X+w/8, initial_Y+3*h/8);
					ctx.lineTo(initial_X+w/4, initial_Y+h/8);								

					ctx.closePath();
					
					ctx.fillStyle = color_arr[l-2];
					ctx.fill();
					ctx.strokeStyle = color_arr[l-1];
					ctx.stroke();

					// add text
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.font = `${height*0.5}px Arial`;
					ctx.fillStyle = color_arr[l-4];
					ctx.strokeStyle =color_arr[l-3];
					ctx.strokeText(text, x, y+height/2);
					ctx.fillText(text, x, y+height/2);
				}						
			}
		}
	}

	// techniques
	reactionTimeText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["reaction"]) {
				text = args["reaction"] + " s";
				ctx.fillText(text, x, y);	
				ctx.strokeText(text, x, y);
			}				
		}
	}
	divingDistanceText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["diving"]) {
				text = args["diving"] + " m";
				ctx.fillText(text, x, y);	
				ctx.strokeText(text, x, y);
			}				
		}
	}
	divingDistanceLine = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8*0.2), // the entire width of this bar chart
		h: Math.floor(laneWidth), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		// @ myVis: string of the selected visualization
		// @ record: world/olympic/national/personal
		draw: function(ctx, x, y, width, height, color_arr, args) {
			// get the diving distance
			if(args["diving"]) {
				let divingDistance = parseFloat(args["diving"]);
				let lineXPosition = halfDistance - divingDistance;
				let lineXPositioninPixel = Math.floor(lineXPosition/halfDistance*laneLength-width/2);

				let l = color_arr.length; // 2 colors

				// current swimmer: draw the line
				ctx.beginPath();
				ctx.fillStyle = color_arr[l-2];						
				ctx.rect(lineXPositioninPixel, y, width, height);
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
			}
		}
	}
	divingDistanceArrow = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.1), // does not use and cannot be modified
		h: Math.floor(laneWidth*0.1), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.1)/2),
		dy: Math.floor((laneWidth-laneWidth*0.03)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args) {
			// get the diving distance
			if(args["diving"]) {
				let divingDistance = parseFloat(args["diving"]);
				let lineXPosition = halfDistance - divingDistance;
				let lineXPositioninPixel = Math.floor(lineXPosition/halfDistance*laneLength-width/2);

				let l = color_arr.length; // 2 colors
				ctx.beginPath();
				ctx.moveTo(lineXPositioninPixel, y-0.5*height);
				ctx.lineTo(lineXPositioninPixel+height, y-1.5*height);
				ctx.lineTo(lineXPositioninPixel+2*height, y-1.5*height);
				ctx.lineTo(lineXPositioninPixel+height, y-0.5*height);
				ctx.lineTo(laneLength, y-0.5*height);
				ctx.lineTo(laneLength, y+0.5*height);
				ctx.lineTo(lineXPositioninPixel+height, y+0.5*height);
				ctx.lineTo(lineXPositioninPixel+2*height, y+1.5*height);
				ctx.lineTo(lineXPositioninPixel+height, y+1.5*height);
				ctx.lineTo(lineXPositioninPixel, y+0.5*height);
				ctx.closePath();

				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
			}
		}
	}
	distanceStrokeText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["strokeDistance"] && parseFloat(args["strokeDistance"])>0) {
				text = parseFloat(args["strokeDistance"]).toFixed(2) + " m";
				ctx.fillText(text, x, y);	
				ctx.strokeText(text, x, y);
			}				
		}
	}
	distanceStrokeLine = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.8*0.2), // the entire width of this bar chart
		h: Math.floor(laneWidth), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.8*0.2)/2),
		dy: Math.floor((laneWidth-laneWidth)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args) {
			// get the stroke distance && current X position
			if(args["strokeDistance"] && parseFloat(args["strokeDistance"])>0 ) {
				let strokeDistance = parseFloat(args["strokeDistance"]);
				let deltaXinPixel = Math.floor(strokeDistance/halfDistance*laneLength-width/2);

				let l = color_arr.length; // 4 colors: 2 fills + 2 strokes
				// current position: draw the line
				ctx.beginPath();										
				ctx.rect(x, y, width, height);
				ctx.fillStyle = color_arr[l-4];		
				ctx.fill();
				ctx.strokeStyle = color_arr[l-3];
				ctx.stroke();

				// previous position: draw the line
				ctx.beginPath();
				args["direction"] == "advance" ? ctx.rect(x+deltaXinPixel, y, width, height) : ctx.rect(x-deltaXinPixel, y, width, height);
				ctx.fillStyle = color_arr[l-2];		
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
			}
		}
	}
	distanceStrokeArrow = {
		// initial width and height of the chart
		w: Math.floor(laneWidth*0.1), // the entire width of this bar chart
		h: Math.floor(laneWidth*0.1), // the entire height of this bar chart

		// initial coordination (x, y) of the chart => in the middle of the window size
		dx: Math.floor((laneLength-laneWidth*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.5*0.1)/2), // should be centered

		// @ ctx: draw on which context of canvas
		// @ color_arr: larger number => foreground
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, width, height, color_arr, args) {
			if(args["strokeDistance"] && parseFloat(args["strokeDistance"])>0 ) {
				let strokeDistance = parseFloat(args["strokeDistance"]);
				let deltaXinPixel = Math.floor(strokeDistance/halfDistance*laneLength-width/2);

				let l = color_arr.length; // 4 colors: 2 fills + 2 strokes

				// (x, y): position of the current swimmer					
				args["direction"] == "advance" ? ctx.moveTo(x+deltaXinPixel, y) : ctx.moveTo(x-deltaXinPixel, y);
				// draw a line from the current swimmer
				args["direction"] == "advance" ? ctx.lineTo(x+height, y) : ctx.lineTo(x-height, y);
				args["direction"] == "advance" ? ctx.lineTo(x+2*height, y-height) : ctx.lineTo(x-2*height, y-height);
				args["direction"] == "advance" ? ctx.lineTo(x+height, y-height) : ctx.lineTo(x-height, y-height);
				ctx.lineTo(x, y);
				ctx.lineTo(x, y+height);
				args["direction"] == "advance" ? ctx.lineTo(x+height, y+2*height) : ctx.lineTo(x-height, y+2*height);
				args["direction"] == "advance" ? ctx.lineTo(x+2*height, y+2*height) : ctx.lineTo(x-2*height, y+2*height);
				args["direction"] == "advance" ? ctx.lineTo(x+height, y+height) : ctx.lineTo(x-height, y+height);
				args["direction"] == "advance" ? ctx.lineTo(x+deltaXinPixel, y+height) : ctx.lineTo(x-deltaXinPixel, y+height);
				ctx.closePath();
				ctx.fillStyle = color_arr[l-4];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-3];
				ctx.stroke();

				// previous position: position point
				ctx.beginPath();
				args["direction"] == "advance" ? ctx.arc(x+deltaXinPixel, y+Math.floor(height/2), height, 0, 2*Math.PI) : ctx.arc(x-deltaXinPixel, y+Math.floor(height/2), height, 0, 2*Math.PI);
				ctx.closePath();
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
			}
		}
	}
	distanceStrokeBarChart = {
		// initial the vis size: height & width
		w: Math.floor(laneLength*0.5), // the whole width = 2.39m/stroke => max
		h: Math.floor(laneWidth*0.2), // height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor((laneLength-laneLength*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.2)/2), // should be centered

		draw: function(ctx, x, y, width, height, color_arr, args) {
			// get the stroke distance
			if(args["strokeDistance"] && parseFloat(args["strokeDistance"])>0 ) {
				let strokeDistance = parseFloat(args["strokeDistance"]);
				// calculate the width of stroke bar
				let widthStrokeBar = Math.floor(strokeDistance/2.39*width);

				let l = color_arr.length; // 3 colors: 2 fills + 1 strokes

				ctx.beginPath();
				ctx.rect(x, y, widthStrokeBar, height);
				ctx.fillStyle = color_arr[l-3];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
				ctx.beginPath();
				ctx.rect(x+widthStrokeBar, y, width-widthStrokeBar, height);
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
			}
		}
	}
	strokeCountText = {
		// initial the font size and stroke weight of Text
		w: Math.floor(laneWidth*0.4), // fontSize => width(#sizeLabel_2)
		h: Math.floor(laneWidth*0.03), // strokeWeight => height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor(laneLength/2),
		dy: Math.floor(laneWidth/2),

		// @ fontSize: same controller as width
		// @ strokeWeight: same controller as height
		// @ colors: [0] => font color, [1] => stroke color
		// @ args: myData[frameId][swimmerId]
		draw: function(ctx, x, y, fontSize, strokeWeight, colors, args, edge) {
			ctx.font = `${fontSize}px Arial`;
			ctx.lineWidth = strokeWeight;
			ctx.fillStyle = colors[0];
			ctx.strokeStyle = colors[1];
			// coordinate the text
			if(!edge || edge == "") {
				ctx.textAlign = "center"; // vertical
				ctx.textBaseline = "middle"; // horizontal
			} else if(edge.length == 2) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							break;
					}
				});						
			} else if(edge.length == 1) {
				edge.forEach( (ele) => {
					switch (ele) {
						case "leftEdge":
							ctx.textAlign = "left";
							ctx.textBaseline = "middle";
							break;
						case "rightEdge":
							ctx.textAlign = "right";
							ctx.textBaseline = "middle";
							x = x + fontSize;
							break;
						case "topEdge":
							ctx.textBaseline = "top";
							ctx.textAlign = "center";
							break;
						case "bottomEdge":
							ctx.textBaseline = "alphabetic";
							ctx.textAlign = "center";
							break;
					}
				});
			}	
			
			let text; 
			if(args["strokeCount"] && parseFloat(args["strokeCount"])>0) {
				args["strokeCount"] == 1 ? text = args["strokeCount"] + " stroke" : text = args["strokeCount"] + " strokes";
				ctx.fillText(text, x, y);	
				ctx.strokeText(text, x, y);
			}				
		}
	}
	strokeCountBarChart = {
		// initial the vis size: height & width
		w: Math.floor(laneLength*0.5), // the whole width = 53 strokes => max
		h: Math.floor(laneWidth*0.2), // height(#sizeLabel_1)

		// position: in middle of the canvas
		dx: Math.floor((laneLength-laneLength*0.5)/2),
		dy: Math.floor((laneWidth-laneWidth*0.2)/2), // should be centered

		draw: function(ctx, x, y, width, height, color_arr, args) {
			// get the stroke distance
			if(args["strokeCount"] && parseFloat(args["strokeCount"])>0 ) {
				let strokeCount = args["strokeCount"];
				// calculate the width of stroke bar
				let lengthStrokeCountBar = Math.floor(strokeCount/53*width);

				let l = color_arr.length; // 3 colors: 2 fills + 1 strokes

				ctx.beginPath();
				ctx.rect(x, y, lengthStrokeCountBar, height);
				ctx.fillStyle = color_arr[l-3];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
				ctx.beginPath();
				ctx.rect(x+lengthStrokeCountBar, y, width-lengthStrokeCountBar, height);
				ctx.fillStyle = color_arr[l-2];
				ctx.fill();
				ctx.strokeStyle = color_arr[l-1];
				ctx.stroke();
			}
		}
	}

	if( customizedData != undefined ) {
		for(let i = customizedData.length-1; i>=0; i--) {
			let myVis = customizedData[i]["visualization_id"];
			let myZIndex = customizedData[i]["z_index"];
			let myVisibility = customizedData[i]["visibility"];
			let myDesignFactors = customizedData[i]["design_factors"];

			// step1: insert canvas according to the layer's visibility
			if( myVisibility ) {
				addCanvas(myDesignFactors.lane_selector, myVis, laneCount, laneWidth, 0, laneLength);
			} else {
			 	continue;
		 	}
		}
	}

	// set the play button to be "play"
	myPlayPauseBtn.click();

}, false);

myVideo.addEventListener("play", function(){
}, false);

myVideo.addEventListener("pause", function(){
}, false);

var globalCurrentFrame; 
myVideo.addEventListener("timeupdate", function(){
	// update time stamp
	$("#myTimeStamp").val(myVideo.currentTime + "s / " + myVideo.duration + "s");

	// update myProgressBar
	let myProgressBarPos = myVideo.currentTime / myVideo.duration*100;
	$("#myProgressBar").val(myProgressBarPos);

	if(myVideo.currentTime < raceStartTime) {		
		myProgressBar.style.backgroundImage = `linear-gradient(to right, #878787 0%, #878787 ${myProgressBarPos}%, #d3d3d3 ${myProgressBarPos}%, #d3d3d3 ${raceStartPercent}%, #BEE6F4 ${raceStartPercent}%)`; 
	} else {
		myProgressBar.style.backgroundImage = `linear-gradient(to right, #878787 0%, #878787 ${raceStartPercent}%, #3C6CA8 ${raceStartPercent}%, #3C6CA8 ${myProgressBarPos}%, #BEE6F4 ${myProgressBarPos}%)`;
	}

	// let the video play in a loop from the position with data
	let currentTime = myVideo.currentTime;
	if(currentTime < raceStartTime) {
		$("#myVideo").prop("currentTime", raceStartTime);;
	}
	if(myVideo.ended) {
		$("#myVideo").prop("currentTime", raceStartTime);
		myVideo.play();
	}

	// timeupdate works every 250ms, which the limitation of a browser.
	// As our video's frame rate = 50Hz, which means it refresh time = 20ms, we split one timeupdate period by 12
	let count = 12;
	let timer = setInterval(function() {
		if(count == 0) {
			clearInterval(timer);
		}else{
			let currentFrame = getCurrentFrame(); globalCurrentFrame = currentFrame;
			if( customizedData != undefined ) {		
				reDrawLayer(myData[currentFrame], customizedData);
			}
			// go to next rendering
			count--;
		}
	},20);	
}, false);

/* --------------------- layer section ---------------------*/


