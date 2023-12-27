/* Static mode */
/* 1. generate a frame randomly => done in init.js: participantFrame */
/* 2. comment "myPlayPauseBtn.click();" */
/* 3. set start time: this.currentTime = participantFrame */

/* race consts */
const totalDistance = 100, halfDistance = 50;
/* video consts */
const videoRatio = 16/9, raceStartTime = 13.70, raceEndTime = 85.16, championEndTime = 81.40, raceDuration = 71.48, videoDuration = 85.8;
const raceStartPercent = raceStartTime/videoDuration*100;
/* get the documentElement client width and height */
const WINDOW_WIDTH = $(window).width(), WINDOW_HEIGHT = $(window).height();

// middle part: video + video controller + vis
const VIDEO_HEIGHT = WINDOW_HEIGHT * 0.7, VIDEO_WIDTH = VIDEO_HEIGHT*videoRatio;
const VIDEO_CONTROLLERS_HEIGHT = VIDEO_HEIGHT * 0.05;
// middle top and bottom part: page header and page footer
const PAGE_HEADER_HEIGHT = (WINDOW_HEIGHT - VIDEO_HEIGHT - VIDEO_CONTROLLERS_HEIGHT)/2;
const PAGE_FOOTER_HEIGHT = (WINDOW_HEIGHT - VIDEO_HEIGHT - VIDEO_CONTROLLERS_HEIGHT)/2;
const PAGE_WIDTH = VIDEO_WIDTH;

// left part: controllers
const DIV_CONTROLLERS_WIDTH = (WINDOW_WIDTH-VIDEO_WIDTH)/2, DIV_CONTROLLERS_HEIGHT = WINDOW_HEIGHT;
// right part: layers + other staff
const DIV_LAYER_WIDTH = DIV_CONTROLLERS_WIDTH, DIV_LAYER_HEIGHT = WINDOW_HEIGHT;

// screen size test alert
const BODY_MARGIN_RL = (WINDOW_WIDTH - DIV_LAYER_WIDTH - DIV_CONTROLLERS_WIDTH - VIDEO_WIDTH)/2;
const BODY_MARGIN_TB = (WINDOW_HEIGHT - VIDEO_HEIGHT - VIDEO_CONTROLLERS_HEIGHT)/2;

/* size of three parts */
// footbuttons: set max height, and then get the current height
$(".footButtons").css("max-height", DIV_CONTROLLERS_HEIGHT*0.05);
$(".footButtons").css("height", DIV_CONTROLLERS_HEIGHT*0.05);
$(".footButtons").css("width", DIV_CONTROLLERS_HEIGHT*0.05);
const footButtonsHeight = $(".footButtons").outerHeight();
const addLayerBtnHeight = $(".controllerFooter").outerHeight();

// data card: calculate the max height, and then set them
const dataCardMaxHeight = DIV_CONTROLLERS_HEIGHT - footButtonsHeight - addLayerBtnHeight;
// const dataCardTitleHeight = $("#dataCardTitle").outerHeight(), dataCardContentMaxHeight = dataCardMaxHeight - dataCardTitleHeight;
$("#data_card_1").css("max-height", dataCardMaxHeight);
$("#data_card_content_1").css("max-height", dataCardMaxHeight);
// add scroll on data card div
$("#data_card_content_1").css("overflow-y", "scroll");

/* size of the page header and footer */
const pageHeader = document.getElementById("pageHeader");
const pageFooter = document.getElementById("pageFooter");
// coordinate the two divs
pageHeader.style.position = "absolute";
pageHeader.style.height = PAGE_HEADER_HEIGHT + "px";
pageHeader.style.width = PAGE_WIDTH + "px";
pageHeader.style.top = "0px";
pageHeader.style.left = BODY_MARGIN_RL + DIV_CONTROLLERS_WIDTH + "px";

pageFooter.style.position = "absolute";
pageFooter.style.height = PAGE_HEADER_HEIGHT + "px";
pageFooter.style.width = PAGE_WIDTH + "px";
pageFooter.style.top = (WINDOW_HEIGHT - PAGE_FOOTER_HEIGHT) + "px";
pageFooter.style.left = BODY_MARGIN_RL + DIV_CONTROLLERS_WIDTH + "px";

/*--------------------- page header options ---------------------*/
// when click on "Contact Us" => mailto
$("#contactDiv").on("click", function() {
	window.location.href = "mailto: yaolijie0219@gmail.com?cc=petra.isenberg@inria.fr;anastasia.bezerianos@lri.fr;romain.vuillemot@ec-lyon.fr&subject=[VIM SwimFlow]%20Comments";
});

// when click on "Give Feedback" => display pop-up html page
$("#feedbackDiv").on("click", function() {
	// display or hide the pop-up html
	$("#popupFeedback").attr("hidden") ? $("#popupFeedback").removeAttr("hidden") : $("#popupFeedback").attr("hidden", true);
});

// when click on "save and continue later" => hide the page 
$("#continueBtn").on("click", function() {
	$("#popupFeedback").attr("hidden", true);
});

// when click on "send" => Ajax
$("#sendBtn").on("click", function() {
	let measurements = {};
	measurements["participant_id"] = participantId;
	measurements["feedback"] = `"${$("#issueText").val()}"`;
	
	$.ajax({
		url: '/SwimFlow/ajax/feedback.php',
		type: 'POST',
		data: JSON.stringify(measurements),
		contentType: 'application/json',
		success: function () {
			$("#issueText").val("");
			$("#popupFeedback").attr("hidden", true);
        }
    }); 
});

/*--------------------- page footer options ---------------------*/
// when click on "finish" => confirmation + Ajax
$("#finishDiv").on("click", function() {
	let myVis = getVis();
	$("#currentVisId").text(myVis);
	// NOTADD == true: add button is inactive {no design/ already added as a layer} => directly display finishConfirmation
	let NOTADD =  $("#addBtn").prop("disabled"); 
	NOTADD ? $("#finishConfirmation").removeAttr("hidden") : $("#designConfirmation").removeAttr("hidden");
});

// when designConfirmation display => click on "Yes, please add" => hide the div, trigger addBtn, display finishConfirmation
$("#addDesignBtn").on("click", function() {
	$("#designConfirmation").attr("hidden", true);
	$('#addBtn').trigger("click");
	$("#finishConfirmation").removeAttr("hidden");
});
// when designConfirmation display => click on "No, thank you" => hide the div, display finishConfirmation
$("#dropDesignBtn").on("click", function() {
	$("#designConfirmation").attr("hidden", true);
	// let myLayers = getLayers();
	// myLayers ? true : $("#finishConfirmation").removeAttr("hidden");
	$("#finishConfirmation").removeAttr("hidden");
});

// when finishConfirmation display => click on "Cancel" => hide the div
$("#countinueDesignBtn").on("click", function() {
	$("#finishConfirmation").attr("hidden", true);
	
});

// record how many time a designer submit the final design
var completeTime = 0;
// when finishConfirmation display => click on "Confirm" => Ajax
$("#finishDesignBtn").on("click", function() {
	// completeTime starts from 1 in the log file
	completeTime++;
	let measurements = [];
	// pull all designs added as layer
	let myLayers = getLayers();
	for(let i=0; i<myLayers.length; i++) {
		// get the current vis
		let myVis = $(myLayers[i]).attr("id").split("_")[1];
		// get the current pointer in redux of vis
		const myPointer = reduxStatusGroup[myVis].pointer;
		let myArchives = reduxStatusGroup[myVis].archives;
		let myObj = myArchives[myPointer];

		measurements[i] = {};
		measurements[i]["participant_id"] = participantId;
		measurements[i]["design_version"] = completeTime;
		measurements[i]["participant_frame"] = participantFrame;	
		measurements[i]["visualization_id"] = myVis;
		measurements[i]["visibility"] = $(`#visibleImg_${myVis}`).hasClass("visibleImg"); 
		measurements[i]["z_index"] = parseInt(myLayers.length-i);

		// deep clone things from redux
		measurements[i]["design_factors"] = {};
		measurements[i]["design_factors"] = _.cloneDeep(myObj); 

		// deep clone reduxStatusGroup
		measurements[i]["reduxStatusGroup"] = {};
		measurements[i]["reduxStatusGroup"] = _.cloneDeep(reduxStatusGroup);
	}

	$.ajax({
		url: '/SwimFlow/ajax/final_design.php',
		type: 'POST',
		data: JSON.stringify(measurements),
		contentType: 'application/json',
		success: function () {			
			// insert the sharable link
			$("#sharableLinkDiv > a").attr("href", `http://localhost:8080/SwimFlow/sharing?${participantId}_V${completeTime}`);
			$("#sharableLinkDiv > a").text(`http://localhost:8080/SwimFlow/sharing?${participantId}_V${completeTime}`);
			$("#finishConfirmation").attr("hidden", true);
			$("#completeDiv").removeAttr("hidden");

			if( !$("#myVideoControllers").is(":visible") ) {
				// active the video controller bar
				$("#myVideoControllers").show();
				// $("#myVideo").attr("autoplay", true);
				// myPlayPauseBtn.click();
			}
        }
	});	
});

// when click on "Close" => close the dialog div
$("#closeCompleteBtn").on("click", function() {
	$("#completeDiv").attr("hidden", true);
});

/* parameters for video size and coordination*/
var vTB = 0, vRL = 0; // useless

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

/* Left side: coordinate controllers */
const divController = document.getElementById("controllers");
// count how many sub-divs in this controllers container
const controllerNumbers = divController.getElementsByTagName("div").length;
// set controllers container's style
divController.style.position = "absolute";
divController.style.height = DIV_CONTROLLERS_HEIGHT + "px";
divController.style.width = DIV_CONTROLLERS_WIDTH + "px";
// set controllers' position according to video size
divController.style.top = "0px";
divController.style.left = BODY_MARGIN_RL + "px";

/* change dataCategory options layout */
function custom_template(obj) {
	var data = $(obj.element).data();
	var text = $(obj.element).text();
	if(data && data["img_src"]) {
		img_src = data["img_src"];
		template = $("<div style = 'display: flex'><img class = 'interest_img' onmouseover = 'interestAnnotation(this)' src=\"" + img_src + "\" style=\"width:20%;height:20%;align-self:center; margin-right: 5px;\"/><p style=\"font-family: system-ui; font-size:13px; font-style: normal; font-weight: normal; color: #3c6ca8; text-align: left; align-self: center; margin: 0;\">" + text + "</p></div>");
		return template;
	}
	if(text == "--Please select an option--"){
		template = $("<div style = 'display: flex'><p style=\"font-family: system-ui; font-size:13px; font-style: normal; font-weight: normal; color: #d3d3d3; text-align: center; align-self: center; margin:0;\">" + text + "</p></div>");
		return template;
	}
}

var options = {
	"templateSelection": custom_template, 
	"templateResult": custom_template,
}

// initial the dataCategory layout
$("#dataCategory_selector").select2(options);
$('.select2-container--default .select2-selection--single').css({'height': '100%'});

function interestAnnotation(e) {
	$(e).attr("title", "This percentage shows how many audiences are interested in this data item.")
}

// when lock of the height-width ratio is clicked, modify UI 
$("#img_lock").on("click", function() {
	let clicked = $(this).hasClass("img_lock_clicked");
	if(clicked) {
		$(this).removeClass("img_lock_clicked");	
	} else {
		$(this).addClass("img_lock_clicked");
	}

	updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn");
})

// when position/zoom/rotation sliders change, modify the UI
function rangeSliderUI(e){
	let [min, max, value] = [e.min, e.max, e.value];
	let percentage = (value-min)/(max-min)*100;
	if( percentage > 50 ) {
		e.style.background = `linear-gradient(to right,  #DEE2E6 0% 50%, #3C6CA8 50% ${(value-min)/(max-min)*100}%, #DEE2E6 ${(value-min)/(max-min)*100}% 100%)`;
	} else if( percentage < 50 ) {
		e.style.background = `linear-gradient(to right,  #DEE2E6 0%, ${(value-min)/(max-min)*100}%, #3C6CA8 ${(value-min)/(max-min)*100}% 50%, #DEE2E6 50% 100%)`;
	} else {
		e.style.background = `linear-gradient(to right, #DEE2E6 0% 100%)`;
	}
}

/* Middle part: video, video controllers, vis*/
const divVideoVis = document.getElementById("videovis");
divVideoVis.style.height = (VIDEO_HEIGHT + VIDEO_CONTROLLERS_HEIGHT) + "px";
divVideoVis.style.width = VIDEO_WIDTH + "px";
divVideoVis.style.top = BODY_MARGIN_TB + "px";
divVideoVis.style.left = (DIV_CONTROLLERS_WIDTH+BODY_MARGIN_RL) + "px";
divVideoVis.style.position = "absolute";

// embed a video
$("#myVideo").attr("width", VIDEO_WIDTH)
   			 .attr("height", VIDEO_HEIGHT)
			 .attr("type", "video/mp4")
			 //.attr("src", "https://motion.isenberg.cc/Swimming/video/2021_Montpellier_100_brasse_birdseyes.mp4");
			 .attr("src", "/SwimFlow/video/2021_Montpellier_100_brasse_birdseyes.mp4");

const myPlayPauseBtn = document.getElementById("playPauseButton");
const myProgressBar = document.getElementById("myProgressBar");
// set the play button size: font size
myPlayPauseBtn.style.fontSize = VIDEO_CONTROLLERS_HEIGHT*0.6 + "px";

/* Right part: Layers, other things */
const divLayers = document.getElementById("layers");
divLayers.style.height = DIV_LAYER_HEIGHT + "px";
divLayers.style.width = DIV_LAYER_WIDTH+ "px";
divLayers.style.top = "0px";
divLayers.style.left = (BODY_MARGIN_RL+DIV_CONTROLLERS_WIDTH+VIDEO_WIDTH) + "px";
divLayers.style.position = "absolute";

/*--------------------- Undo/Redo function (data snapshot pattern) ---------------------*/
// initialize the dataSnapshots group
var dataSnapshotsGroup = {
	// metadata
	nationalFlags: {},
	nationalText: {},
	nameText: {},
	ageText: {},
	// time-record differences
	lapWorldRecordText: {},
	lapWorldRecordLineChart: {},
	// time-related
	elapsedText: {},
	elapsedTimer: {},
	elapsedProgressBar: {},
	currentLapText: {},
	currentLapBarChart: {},
	averageLapText: {},
	lapDifferencesRecordText: {},
	lapDifferencesRecordBarChart: {},
	lapDifferencesRecordGlyph: {},
	lapDifferencesSwimmerText: {},
	lapDifferencesSwimmerBarChart: {},
	lapDifferencesSwimmerGlyph: {},
	// speed-related
	currentSpeedText: {},
	currentSpeedBarChart: {},
	currentSpeedCircularSector: {},
	accelerationText: {},
	accelerationBarChart: {},
	accelerationCircularSector: {},
	accelerationGlyph: {},
	averageSpeedText: {},
	speedHistoryLineChart: {},
	speedDifferencesRecordText: {},	
	speedDifferencesRecordGlyph: {},
	speedDifferencesRecordBarChart: {},
	speedDifferencesSwimmerText: {},	
	speedDifferencesSwimmerGlyph: {},
	speedDifferencesSwimmerBarChart: {},
	// position-related
	positionDifferencesRecordText: {},
	positionDifferencesSwimmerText: {},
	speedDifferencesRecordLine: {},
	speedDifferencesSwimmerLine: {},
	// distance-related
	distanceSwamText: {},
	distanceSwamBarChart: {},	
	remainingDistanceText: {},
	remainingDistanceBarChart: {},
	distanceDifferencesLeaderText: {},
	distanceDifferencesLeaderLine: {},
	distanceDifferencesLeaderArrow: {},
	// record
	worldRecordText: {},
	worldRecordLine: {}, 
	olympicsRecordText: {}, 
	olympicsRecordLine: {}, 
	nationalRecordText: {}, 
	nationalRecordLine: {}, 
	personalRecordText: {}, 
	personalRecordLine: {},	
	// predictions
	winnerText: {},
	winnerGlyph: {},
	nextPassingText: {}, 
	nextPassingGlyph: {},
	estimatedCompletionTimeText: {},
	estimatedCompletionTimeBarChart: {},
	recordBreakGlyph: {},
	// techniques
	reactionTimeText: {},
	divingDistanceText: {},
	divingDistanceLine: {},
	divingDistanceArrow: {},
	distanceStrokeText: {}, 
	distanceStrokeLine: {},
	distanceStrokeArrow: {},
	distanceStrokeBarChart: {},
	strokeCountText: {}, 
	strokeCountBarChart: {},

}

// for each element in dataSnapshots group, it should contains a data section
var dataSection = {
	// lane selector
	"lane_selector": [1, 2, 3, 4, 5, 6, 7, 8], 
	// MOVE status
	"MOVE": true, // $("#moving").prop("checked") == true
	// when (MOVE)
	"horizontal": [" ", undefined, 0, undefined, " "], // left_label_text, left_threshould, current_value, right_threshould, right_label_text
	"vertical": [" ", undefined, 0, undefined, " "],
	"FLIP": false, // $("#flip_horizontal").hasClass("flipBtn_clicked") == false
	// when (!MOVE)
	"ALIGN": false, // $("#alignButton").prop("checked") == false
	"STOPPOS": {},
	"leftRight": [" ", undefined, 0, undefined, " "],
	"topBottom": [" ", undefined, 0, undefined, " "],
	"edge": [], // array of boolean: if any edge button is pressed
	"edgeNames": [], // array of pressed buttons' ids
	// size & rotation
	"LOCK": true, // $("#img_lock").hasClass("img_lock_clicked") == false
	"heightSlider": [" ", undefined, 0, undefined], // stroke weight 
	"widthSlider": [" ", undefined, 0, undefined], // font size
	"rotationSlider": [" ", undefined, 0, undefined, " "],
	"rotationRadius": 0,
	// image
	"IMAGE": false, // IMAGE flag only equals to true for nationalFlags
	// color
	"COLOR_PICKER": false,
	"color_set_block": null,
	"color_history_block": null,	
	"color_set_block_codes": null,
	"color_history_block_codes": null,
	// transparency
	"TRANSPARENCY": false,
	"transparency_set_block": null,
	"transparency_history_block": null,
	"transparency_set_block_codes": null,
	"transparency_history_block_codes": null,

	// sub-controllers
	"SUB_RECORD": false,
	"SUB_SWIMMER": false,
	"record": "world", 
	"swimmer": "lane1",
}

// construct empty dataSnapshots with initialized data section
for(let i = 0; i<Object.keys(dataSnapshotsGroup).length; i++) {
	for(const [key, value] of Object.entries(dataSection)) {
		dataSnapshotsGroup[Object.keys(dataSnapshotsGroup)[i]][key] = value;
	}
}

// initialize the redux status group
var reduxStatusGroup = {
	// metadata
	nationalFlags: {},
	nationalText: {},
	nameText: {},
	ageText: {},
	// time-record differences
	lapWorldRecordText: {},
	lapWorldRecordLineChart: {},
	// time-related
	elapsedText: {},
	elapsedTimer: {},
	elapsedProgressBar: {},
	currentLapText: {},
	currentLapBarChart: {},
	averageLapText: {},
	speedHistoryLineChart: {},
	lapDifferencesRecordText: {},
	lapDifferencesRecordBarChart: {},
	lapDifferencesRecordGlyph: {},
	lapDifferencesSwimmerText: {},
	lapDifferencesSwimmerBarChart: {},
	lapDifferencesSwimmerGlyph: {},
	// speed-related
	currentSpeedText: {},
	currentSpeedBarChart: {},
	currentSpeedCircularSector: {},
	accelerationText: {},
	accelerationBarChart: {},
	accelerationCircularSector: {},
	accelerationGlyph: {},
	speedDifferencesRecordText: {},	
	speedDifferencesRecordGlyph: {},
	speedDifferencesRecordBarChart: {},
	speedDifferencesSwimmerText: {},	
	speedDifferencesSwimmerGlyph: {},
	speedDifferencesSwimmerBarChart: {},
	averageSpeedText: {},
	// position-related
	positionDifferencesRecordText: {},
	positionDifferencesSwimmerText: {},
	speedDifferencesRecordLine: {},
	speedDifferencesSwimmerLine: {},
	// distance-related
	distanceSwamText: {},
	distanceSwamBarChart: {},	
	remainingDistanceText: {},
	remainingDistanceBarChart: {},
	distanceDifferencesLeaderText: {},
	distanceDifferencesLeaderLine: {},
	distanceDifferencesLeaderArrow: {},	
	// record
	worldRecordText: {},
	worldRecordLine: {}, 
	olympicsRecordText: {}, 
	olympicsRecordLine: {}, 
	nationalRecordText: {}, 
	nationalRecordLine: {}, 
	personalRecordText: {}, 
	personalRecordLine: {},	
	// predictions
	winnerText: {},
	winnerGlyph: {},
	nextPassingText: {}, 
	nextPassingGlyph: {},
	estimatedCompletionTimeText: {},
	estimatedCompletionTimeBarChart: {},
	recordBreakGlyph: {},
	// techniques
	reactionTimeText: {},
	divingDistanceText: {},
	divingDistanceLine: {},
	divingDistanceArrow: {},
	distanceStrokeText: {}, 
	distanceStrokeLine: {},
	distanceStrokeArrow: {},
	distanceStrokeBarChart: {},
	strokeCountText: {}, 
	strokeCountBarChart: {},
}

// each vis should have a redux traitor
var reduxSection = {
	archives: [], // save each data snapshot, length.max = 51 = 1(blank) + 1(initialization) + 49 (actions) 
	pointer: 0, // current data index, should have an initial archive: [0]=>blank, [1]=>initialization, [2]=>1st action, can only go back to [1]
	limit:50, // pointer maximum index: number of (actions + initialization) saved
};

// construct the 1st (index == 0) reduxStatusGroup with initialized dataSnapshotsGroup
for(let i = 0; i<Object.keys(reduxStatusGroup).length; i++) {
	for(const [key, value] of Object.entries(reduxSection)) {
		if(key == "archives") {
			reduxStatusGroup[Object.keys(reduxStatusGroup)[i]][key] = new Array();
			reduxStatusGroup[Object.keys(reduxStatusGroup)[i]][key][0] = _.cloneDeep( dataSnapshotsGroup[ Object.keys(dataSnapshotsGroup)[i] ] );
		} else {
			reduxStatusGroup[Object.keys(reduxStatusGroup)[i]][key] = value;
		}		
	}
}

// update the data snapshots (according to which vis)
function updateDataSnapshots(myColor) {
	// works on which vis
	let myVis = getVis(); // return string => name of representation == variable name
	// lane selector
	dataSnapshotsGroup[myVis]["lane_selector"] = getLanes(true);
	// MOVE status
	dataSnapshotsGroup[myVis]["MOVE"] = getSwitchStatus("moving");
	// when (MOVE)
	dataSnapshotsGroup[myVis]["horizontal"] = [getLabelText("horizontalLabel_1"), getSliderValues("horizontal", "min"), getSliderValues("horizontal", "val"), getSliderValues("horizontal", "max"), getLabelText("horizontalLabel_2")];
	dataSnapshotsGroup[myVis]["vertical"] = [getLabelText("verticalLabel_1"), getSliderValues("vertical", "min"), getSliderValues("vertical", "val"), getSliderValues("vertical", "max"), getLabelText("verticalLabel_2")];
	dataSnapshotsGroup[myVis]["FLIP"] = getClickableDivStatus("flip");
	// when (!MOVE)
	dataSnapshotsGroup[myVis]["ALIGN"] = getSwitchStatus("alignButton");
	dataSnapshotsGroup[myVis]["STOPPOS"] = _.cloneDeep(STOPPOS);
	dataSnapshotsGroup[myVis]["leftRight"] = [getLabelText("leftEdge"), getSliderValues("moveHorizontalSlider", "min"), getSliderValues("moveHorizontalSlider", "val"), getSliderValues("moveHorizontalSlider", "max"), getLabelText("rightEdge")];
	dataSnapshotsGroup[myVis]["topBottom"] = [getLabelText("topEdge"), getSliderValues("moveVerticalSlider", "min"), getSliderValues("moveVerticalSlider", "val"), getSliderValues("moveVerticalSlider", "max"), getLabelText("bottomEdge")];
	dataSnapshotsGroup[myVis]["edge"] = getEdgeStatus(); // return array of boolean [false, ..., false]
	dataSnapshotsGroup[myVis]["edgeNames"] = getClickedEdges(); // return array of ["leftEdge", ..., "bottomEdge"]
	// size & rotation
	// dataSnapshotsGroup[myVis]["LOCK"] = getLockStatus();
	dataSnapshotsGroup[myVis]["LOCK"] = getClickableDivStatus("lock");
	dataSnapshotsGroup[myVis]["heightSlider"] = [getLabelText("sizeLabel_1"), getSliderValues("heightSlider", "min"), getSliderValues("heightSlider", "val"), getSliderValues("heightSlider", "max")];
	dataSnapshotsGroup[myVis]["widthSlider"] = [getLabelText("sizeLabel_2"), getSliderValues("widthSlider", "min"), getSliderValues("widthSlider", "val"), getSliderValues("widthSlider", "max")];
	dataSnapshotsGroup[myVis]["rotationSlider"] = [getLabelText("rotationLabel_1"), getSliderValues("rotationSlider", "min"), getSliderValues("rotationSlider", "val"), getSliderValues("rotationSlider", "max"), getLabelText("rotationLabel_2")];
	dataSnapshotsGroup[myVis]["rotationRadius"] = getSliderValues("rotationSlider", "val")*Math.PI/180;
	// image
	dataSnapshotsGroup[myVis]["IMAGE"] = IMAGE;
	// color
	dataSnapshotsGroup[myVis]["COLOR_PICKER"] = COLOR_PICKER;
	dataSnapshotsGroup[myVis]["color_set_block"] = getColors("color_set_block");
	dataSnapshotsGroup[myVis]["color_history_block"] = getColors("color_history_block");
	if(!myColor) dataSnapshotsGroup[myVis]["color_set_block_codes"] = getColors("color_set_block", true);
	if(myColor) dataSnapshotsGroup[myVis]["color_set_block_codes"] = myColor;
	dataSnapshotsGroup[myVis]["color_history_block_codes"] = getColors("color_history_block", true);
	// transparency
	dataSnapshotsGroup[myVis]["TRANSPARENCY"] = TRANSPARENCY;
	dataSnapshotsGroup[myVis]["transparency_set_block"] = getTransparencies("transparency_set_block");
	dataSnapshotsGroup[myVis]["transparency_history_block"] = getTransparencies("transparency_history_block");
	dataSnapshotsGroup[myVis]["transparency_set_block_codes"] = getTransparencies("transparency_set_block", true);
	dataSnapshotsGroup[myVis]["transparency_history_block_codes"] = getTransparencies("transparency_history_block", true);

	// sub-controllers
	if( myVis.includes("DifferencesRecord") ) {
		dataSnapshotsGroup[myVis]["SUB_RECORD"] = SUB_RECORD;
		dataSnapshotsGroup[myVis]["record"] = getSelectedRecord();
	} 
	if( myVis.includes("DifferencesSwimmer") ) {
		dataSnapshotsGroup[myVis]["SUB_SWIMMER"] = SUB_SWIMMER;
		dataSnapshotsGroup[myVis]["swimmer"] = getSelectedSwimmer();
	}
}

// update the redux (according to which vis)
function updateRedux() {
	let myVis = getVis();

	reduxStatusGroup[myVis].pointer >= reduxStatusGroup[myVis].limit ? reduxStatusGroup[myVis].limit : reduxStatusGroup[myVis].pointer++;
	reduxStatusGroup[myVis].pointer < reduxStatusGroup[myVis].limit ? (reduxStatusGroup[myVis].archives).splice(reduxStatusGroup[myVis].pointer+1, reduxStatusGroup[myVis].limit) : (reduxStatusGroup[myVis].archives).shift();

	reduxStatusGroup[myVis]["archives"][reduxStatusGroup[myVis].pointer] = _.cloneDeep(dataSnapshotsGroup[myVis]);

	// print all archives
	// (reduxStatusGroup[myVis].archives).forEach( (x) => {
	// 	for(const key in x) {
	// 		console.log(key + " = " + x[key]);
	// 	}
	// });	
}

// undo/redo in 4 steps:
// 1) modify the button status => checked/unchecked, disabled/active
// 2) react on controllers => reset threshould, labels, and values
// 3) redraw vis
// 4) invoke undo/redo
// @ UNDO: true => pointer--, false => pointer
// @ REDO: true => pointer ++, false => pointer
function undoRedo(UNDO, REDO){
	let myVis = getVis();
	// UNDO: pointer goes back to the previous position
	// !UNDO: pointer stays at the last position
	UNDO ? reduxStatusGroup[myVis].pointer-- : true;
	// REDO: pointer goes to the next position
	// !REDO: pointer stays at the last position
	REDO ? reduxStatusGroup[myVis].pointer++ : true;

	let myPointer = reduxStatusGroup[myVis].pointer;
	let myArchives = reduxStatusGroup[myVis].archives;  
	let myObj = myArchives[myPointer];

	for(const key in myObj ) {
		let value = myObj[key];
		switch (key) {
			case "lane_selector":
				let myLanes = $(`input[name = "${key}"]`).get();	
				myLanes.forEach( (ele, index) => myLanes[index]=$(ele).attr("id") );	

				for(let i=0, j=0; i<myLanes.length; i++){
					if(parseInt(myLanes[i].split("_")[2]) == value[j]) {
						$("#" + myLanes[i]).prop("checked", true);
						j++;
					} else {
						$("#" + myLanes[i]).prop("checked", false);
					}
				}
				break;

			case "MOVE":
				// update MOVE status
				MOVE = value;
				// set the value of moving switch
				undoSwitchButtons("moving", value);
				// display/hide the correct move sub-controllers
				displayMoveSubController(value);				
				break;

			case "horizontal":
				// set the threshold, value, and label of the horizontal slider
				undoHorizontal(value);
				// re-render UI
				rangeSliderUI(document.getElementById("horizontal"));
				break;

			case "vertical":
				// set the threshold, value, and label of the horizontal slider
				undoVertical(value);
				// re-render UI
				rangeSliderUI(document.getElementById("vertical"));
				break;

			case "FLIP":
				// add/remove class of flip button
				undoFlipButton(value);
				break;
			
			case "ALIGN":
				// set the value of moving switch
				undoSwitchButtons("alignButton", value);
				break;

			case "STOPPOS":
				STOPPOS = _.cloneDeep(value);
				break;

			case "LOCK":
				undoLockButton(value);
				break;

			case "leftRight":
				// set the threshold, value, and label of the horizontal slider
				undoMoveHorizontal(value);
				// re-render UI
				rangeSliderUI(document.getElementById("moveHorizontalSlider"));
				break;

			case "topBottom":
				// set the threshold, value, and label of the horizontal slider
				undoMoveVertical(value);
				// re-render UI
				rangeSliderUI(document.getElementById("moveVerticalSlider"));
				break;

			case "edge":
				// add/remove class of .edge_redraw buttons
				undoEdgeButtons(value);
				break;

			case "heightSlider":
				// set the threshold, value, and label of the horizontal slider
				undoHeightSlider(value);
				// re-render UI
				rangeSliderUI(document.getElementById("heightSlider"));
				break;

			case "widthSlider":
				// set the threshold, value, and label of the horizontal slider
				undoWidthSlider(value);
				// re-render UI
				rangeSliderUI(document.getElementById("widthSlider"));
				break;
			
			case "rotationSlider":
				// set the threshold, value, and label of the horizontal slider
				undoRotationSlider(value);
				// re-render UI
				rangeSliderUI(document.getElementById("rotationSlider"));
				break;

			case "IMAGE":
				IMAGE = value;
				break;

			case "COLOR_PICKER":
				COLOR_PICKER = value;
				break;

			case "color_set_block":
				value && insertColorPalette(myVis, value, "color_set");
				break;

			case "color_history_block":
				value && insertColorPalette(myVis, value, "color_history");
				break;
			
			case "TRANSPARENCY":
				TRANSPARENCY = value;
				break;

			case "transparency_set_block":
				value && insertTransparencyPalette(myVis, value, "transparency_set");
				break;	

			case "transparency_history_block":
				value && insertTransparencyPalette(myVis, value, "transparency_history");
				break;

			case "SUB_RECORD":
				SUB_RECORD = value;
				break;

			case "record":
				myVis.includes("DifferencesRecord") ? setSelectedRecord(value) : true;
				break;

			case "SUB_SWIMMER":
				SUB_SWIMMER = value;
				break;

			case "swimmer":
				myVis.includes("DifferencesSwimmer") ? setSelectedSwimmer(value) : true;
				break;
		}

	};	
	
	// If hasClass("layer): clean exist canvas
	// If !hasClass("layer"): remove exist canvas + embed new ones
	reEmbedCanvas();
	// colors (type: array)
	let myColors = myArchives[myPointer].color_set_block_codes;
	// transparencies
	let myTransparencies = myArchives[myPointer].transparency_set_block_codes;

	// position (type: object)
	let myArgs, currentFrame = Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);
	MOVE ? myArgs = myData[currentFrame] : myArgs = STOPPOS;	
	
	// edge;
	let myEdges = myArchives[myPointer].edgeNames;
	// flip
	let myFlip = myArchives[myPointer].FLIP; 

	// national flags
	if(IMAGE) {
		if(MOVE) {
			myArgs ? reDraw(undefined, myArgs, myTransparencies, myEdges, myFlip) : reDraw(undefined, undefined, myTransparencies, myEdges, myFlip);
		} else {
			myArgs ? reDraw(undefined, myArgs, myTransparencies, myEdges, myFlip) : reDraw(undefined, undefined, myTransparencies, myEdges, myFlip);
		}
	}

	// shapes
	if(!IMAGE) {
		if(MOVE) {
			myArgs ? reDraw(myColors, myArgs, undefined, myEdges, myFlip) : reDraw(myColors, undefined, undefined, myEdges, myFlip);
		} else {
			myArgs ? reDraw(myColors, myArgs, undefined, myEdges, myFlip) : reDraw(myColors, undefined, undefined, myEdges, myFlip);
		}
	}

	// invoke foot buttons
	invokeFootButton("undoBtn", "redoBtn", "removeBtn");
}

// enable/disable the foot button
function invokeFootButton(...id){
	let myVis = getVis();
	id.forEach( (btn) => {
		switch (btn) {
			case "undoBtn":
				reduxStatusGroup[myVis].pointer > 1 ? activeFootButton("undoBtn", true) : activeFootButton("undoBtn", false);
				break;
			case "redoBtn":
				reduxStatusGroup[myVis].pointer < (reduxStatusGroup[myVis].archives).length-1 ? activeFootButton("redoBtn", true) : activeFootButton("redoBtn", false);
				break;
			case "addBtn":
				let myVisClass = $("." + myVis).get();								
				for(let i=0; i<=myVisClass.length; i++) {
					let x = myVisClass[i];
					if( $(x).hasClass("layer") ){
						activeFootButton("addBtn", false);
						break;
					} else {
						activeFootButton("addBtn", true);
						break; 
					} 
				}				
				break;
			case "disableUndo":
				activeFootButton("undoBtn", false);
				break;
			case "disableRedo":
				activeFootButton("redoBtn", false);
				break;
			case "disableAdd":
				activeFootButton("addBtn", false);
				break;
			case "none":
				// disable all foot button: when no representation selected
				activeFootButton("undoBtn", false);
				activeFootButton("redoBtn", false);
				activeFootButton("addBtn", false);
				break;
		}
	});	
}

// @ ACT: true => active, false => disabled
function activeFootButton(id, ACT) {
	ACT ? $("#" + id).prop("disabled", false) : $("#" + id).prop("disabled", true);
}

// get switch button value: boolean
function getSwitchStatus(id) {
	return $("#" + id).is(":checked");
}

// get label text
function getLabelText(id) {
	return $("#" + id).text();
}

// get slider's threshold
// @ m: min / max / value
function getSliderValues(id, m) {
	let myValue;
	switch (m) {
	case "min":
		myValue = Math.round( $("#" + id).prop("min") );
		break;
	case "max": 
		myValue = Math.round( $("#" + id).prop("max") );
		break;
	case "val":
		myValue = Math.round( $("#" + id).val() );
		break;
	}

	return myValue;	
}

// get clickableDivStatus:
// controller part: LOCK/FLIP
function getClickableDivStatus(str) {
	let myValue;
	switch(str) {
		case "lock":
			myValue = $("#img_lock").hasClass("img_lock_clicked");
			break;
		case "flip":
			myValue = $("#flip_horizontal").hasClass("flipBtn_clicked");
			break;
	}

	return myValue;
}

// get edge checked status
function getEdgeStatus() {
	let myBtns = $(".edge_redraw").get();
	let clickedBlocks = [];
	myBtns.forEach( (x) => {
		clickedBlocks.push( $(x).hasClass("positionSlider_clicked") ); 
	});

	return clickedBlocks;
}

// get clicked edges
function getClickedEdges() {
	let myBtns = $(".edge_redraw").get();
	let clickedBlocks = [];
	myBtns.forEach( (x) => {
		if( $(x).hasClass("positionSlider_clicked") ) {
			clickedBlocks.push( $(x).prop("id") );
		} 
	});

	return clickedBlocks;
}

// get current frame: return integer (floor) of current frame
function getCurrentFrame() {
	return Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);
}

// sub-controllers: get the selected swimmer
function getSelectedSwimmer() {
	return $("#swimmer_selector").find(":selected").val();
}

// sun-controllers: get the selected record => return value (string)
function getSelectedRecord() {
	return $("#record_selector").find(":selected").val();
}

// add the current selected representation as layer
$("#addBtn").on("click", function() {
	// get the current selected representation
	let myVis = getVis();
	// get all canvas under this representation
	let currentObj = $("." + myVis).get();
	// visible ones
	let myLanes = getLanes(true); // TODO: update getLanes(), let it returns to the array of checked lanes' value (visible ones)
	let i = 0;

	currentObj.forEach( (x) => {
		if( $(x).prop("id").split("_")[1] == myLanes[i] ) {
			 $(x).addClass(`${myVis} layer visible`);
			 i++;
		} else {
			$(x).addClass(`${myVis} layer invisible`);
		}		
	});

	// disable add btn
	activeFootButton("addBtn", false);

	// insert the layer div
	createLayerDiv(getDataItem(), myVis);

	let layersContainer = document.getElementById("layerGroups");
 	let list = document.getElementsByName("myLayerDivs");
 	let listFirst = list[0].offsetTop;
 	let listHeight = list[0].offsetHeight;

 	let myIcons = document.getElementsByName("myMoveIcon");
 	for(let i=0; i<myIcons.length; i++) {
		drag(myIcons[i], list[i], layersContainer, list, listFirst, listHeight);
 	}
});

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
	"speedDifferencesSwimmerGlyph": {"colors": 5, "1": {"fill": colorSet.white}, "2": {"stroke": colorSet.black}, "3": {"fill": colorSet.grey_middle}, "4": {"fill": colorSet.grey_light2}, "5": {"stroke": colorSet.grey_dark2}, },
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
function createColorPalette(vis) {
	let divNumber = predefinedColors[vis].colors;

	// create predefined color blocks
	for(let i=1; i<=divNumber; i++){
		let myKey = Object.keys(predefinedColors[vis][i])[0];
		let myValue = predefinedColors[vis][i][myKey];

		switch (myKey) {
			case "fill":
				$("#color_set").append('<div class = "color_block" name = "color_set_block" onmouseover = "colorAnnotation(this)" id = "color_' + i + '" style = "background-color: ' + myValue + '"></div>');
				break; 

			case "stroke":
				$("#color_set").append('<div class = "color_block" name = "color_set_block" onmouseover = "colorAnnotation(this)" id = "color_' + i + '" style = "background-color: ' + myValue + '"><div class = "color_block_core" style = "position: relative; border: 1px solid #d3d3d3; background-color: #ffffff;"></div></div>');
				break;
		}
		// $("#color_set").append('<div class = "color_block" name = "color_set_block" onmouseover = "colorAnnotation(this)" id = "color_' + i + '" style = "background-color: ' + predefinedColors[vis][i] + '"></div>');
		
		// select one color block as default
		if( i==1 ) {
			$(`#color_${i}`).addClass("color_block_clicked");
		}

	}

	// set color blocks' size
	$(".color_block").width(DIV_CONTROLLERS_WIDTH*0.15);
	$(".color_block").height(DIV_CONTROLLERS_WIDTH*0.15);

	// set color block core's size
	$(".color_block_core").width(DIV_CONTROLLERS_WIDTH*0.15*0.7);
	$(".color_block_core").height(DIV_CONTROLLERS_WIDTH*0.15*0.7);

	return true;
}

function createHistoryColor(RGB, Alpha) {
	// once user selected a color, add history color block below
	$("#color_history").append('<div class = "color_block" name = "color_history_block" onmouseover = "colorAnnotation(this)" id = "colorHistory_' + (++divColorHistory) + '" style = "background-color: rgba(' + RGB + ',' + Alpha + '); "></div>');
	// set color blocks color
	$(".color_block").width(DIV_CONTROLLERS_WIDTH*0.15);
	$(".color_block").height(DIV_CONTROLLERS_WIDTH*0.15);
}

$(document).on("click", 'div[name="color_set_block"]', function() {
	// record if any color set is already clicked
	let blocks = $('div[name="color_set_block"]').get();

	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("color_block_clicked")) {clickedBlocks.push(x);} } );

	let id = $(this).prop("id");
	// check if this element is already selected
	let clicked = $("#" + id).hasClass("color_block_clicked");

	if(clicked) {
		$("#" + id).removeClass("color_block_clicked");
	} else {
		if($(this) != clickedBlocks[0]) {
			// remove previous clicked class
			$(clickedBlocks[0]).removeClass("color_block_clicked");
		}
		$("#" + id).addClass("color_block_clicked");
	}

	if(!clicked) {
		let rgb = getRgb($("#" + id).css("background-color"));
		let hex = rgbToHex(rgb);	
		let alpha = getAlpha($("#" + id).css("background-color"));
		$("#color_picker").val(hex);
		$("#transparency_slider").val(alpha);
		document.getElementById("transparency_slider").style.backgroundImage = `linear-gradient(to right, rgba(${rgb}, 0.0), rgba(${rgb}, 1.0)), url("/SwimFlow/img/jpg/color_picker/transparency_background.jpg")`; 
	}
});

$("#color_picker").on("change", function() {
	let rgb = hexToRgb($(this).val());
	let alpha = $("#transparency_slider").val();
	// check if any color_set_block is checked
	let blocks = $('div[name="color_set_block"]').get();
	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("color_block_clicked")) {clickedBlocks.push(x);} } );

	if(clickedBlocks[0]) {
		$(clickedBlocks[0]).css("background-color", `rgba(${rgb}, ${alpha})`);

		// Update color used for sketching
		let newBlocks = $('div[name="color_set_block"]').get();
		let myColors = [];
		blocks.forEach( (x) => {
			$(x).hasClass("color_block_clicked") && myColors.push(`rgba(${rgb}, ${alpha})`);
			!$(x).hasClass("color_block_clicked") && myColors.push($(x).css("background-color")); 
		});

		// create color history blocks
		createHistoryColor(rgb, alpha);
		// UPDATE: according to petra's comment: keep selecting until the user release it
		// // remove selected effect on clicked div
		// $(clickedBlocks[0]).removeClass("color_block_clicked");	

		updateDataSnapshots(myColors);	
		updateRedux(); 
		invokeFootButton("undoBtn", "redoBtn", "addBtn");		
	}
});

$("#color_picker").on("input", function() {
	// update the transparency slider's color
	let rgb = hexToRgb($(this).val());
	document.getElementById("transparency_slider").style.backgroundImage = `linear-gradient(to right, rgba(${rgb}, 0.0), rgba(${rgb}, 1.0)), url("/SwimFlow/img/jpg/color_picker/transparency_background.jpg")`; 

	let alpha = $("#transparency_slider").val();
	// check if any color_set_block is checked
	let blocks = $('div[name="color_set_block"]').get();
	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("color_block_clicked")) {clickedBlocks.push(x);} } );

	if(clickedBlocks[0]) {
		$(clickedBlocks[0]).css("background-color", `rgba(${rgb}, ${alpha})`);

		// Update color for sketching
		let newBlocks = $('div[name="color_set_block"]').get();
		let myColors = [];
		blocks.forEach( (x) => {
			$(x).hasClass("color_block_clicked") && myColors.push(`rgba(${rgb}, ${alpha})`);
			!$(x).hasClass("color_block_clicked") && myColors.push($(x).css("background-color")); 
		});

		// draw vis on each created canvas according to the currentFrame
		let currentFrame = getCurrentFrame();
		if (MOVE) {
			let FLIP = getClickableDivStatus("flip");
			if(FLIP){
				myData[currentFrame] ? reDraw(myColors, myData[currentFrame], undefined, undefined, FLIP) : reDraw(myColors, undefined, undefined, undefined, FLIP);
			}
			if(!FLIP) {
				myData[currentFrame] ? reDraw(myColors, myData[currentFrame]) : reDraw(myColors);
			}
		} 
		if(!MOVE) {
			let clickedBlocks = getClickedEdges();
			reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);		
		}
	}
});

// on "change" only fire when the mouse is released
$("#transparency_slider").on("change", function() {
	let alpha = $(this).val();
	let myColors = [];

	// check if any color_set_block is checked
	let blocks = $('div[name="color_set_block"]').get();
	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("color_block_clicked")) {clickedBlocks.push(x);} } );

	if(clickedBlocks[0]) {
		let rgb = hexToRgb($("#color_picker").val());
		$(clickedBlocks[0]).css("background-color", `rgba(${rgb}, ${alpha})`);

		blocks.forEach( (x) => {
			$(x).hasClass("color_block_clicked") && myColors.push(`rgba(${rgb}, ${alpha})`);
			!$(x).hasClass("color_block_clicked") && myColors.push($(x).css("background-color")); 
		});

		createHistoryColor(rgb, alpha);
		// UPDATE: according to petra's comment: keep selecting until the user release it
		// $(clickedBlocks[0]).removeClass("color_block_clicked");		

	} else {
		blocks.forEach( (x) => {
			let rgb = getRgb($(x).css("background-color"));
			$(x).css("background-color", `rgba(${rgb}, ${alpha})`);
			myColors.push($(x).css("background-color"));

			createHistoryColor(rgb, alpha);
		});
	}

	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(myColors, myData[currentFrame], undefined, undefined, FLIP) : reDraw(myColors, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(myColors, myData[currentFrame]) : reDraw(myColors);
		}
	} 
	if(!MOVE) {
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);
	}

	updateDataSnapshots(myColors);	
	updateRedux(); 
	invokeFootButton("undoBtn", "redoBtn", "addBtn");	
});	

// on "input" keeps changing when dragging the slider
// This part ONLY update the customer's view of visualization while when dragging.
// This part does not invoke undo, redo, does not create history => all these actions are down when mouse is released, in onchange part (above)
// TODO: consider when video is playing, reDraw should according to the position in real time => HOW to transfer args in these listeners?
$("#transparency_slider").on("input", function() {
	let alpha = $(this).val();
	let myColors = [];
	// check if any color_set_block is checked
	let blocks = $('div[name="color_set_block"]').get();
	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("color_block_clicked")) {clickedBlocks.push(x);} } );

	if(clickedBlocks[0]) {
		let rgb = hexToRgb($("#color_picker").val());
		$(clickedBlocks[0]).css("background-color", `rgba(${rgb}, ${alpha})`);

		blocks.forEach( (x) => {
			$(x).hasClass("color_block_clicked") && myColors.push(`rgba(${rgb}, ${alpha})`);
			!$(x).hasClass("color_block_clicked") && myColors.push($(x).css("background-color")); 
		});

	} else {
		blocks.forEach( (x) => {
			let rgb = getRgb($(x).css("background-color"));
			$(x).css("background-color", `rgba(${rgb}, ${alpha})`);
			myColors.push($(x).css("background-color"));
		});
	}

	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(myColors, myData[currentFrame], undefined, undefined, FLIP) : reDraw(myColors, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(myColors, myData[currentFrame]) : reDraw(myColors);
		}
	} 
	if(!MOVE) {
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);
	}
});

$(document).on("click", 'div[name="color_history_block"]', function() {
	let myColor = $(this).css("background-color");

	// check if any color_set_block is checked
	let blocks = $('div[name="color_set_block"]').get();
	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("color_block_clicked")) {clickedBlocks.push(x);} } );

	if(clickedBlocks[0]) {
		$(clickedBlocks[0]).css("background-color", myColor);

		// update color for sketching
		let newBlocks = $('div[name="color_set_block"]').get();
		let myColors = [];
		blocks.forEach( (x) => {
			$(x).hasClass("color_block_clicked") && myColors.push(myColor);
			!$(x).hasClass("color_block_clicked") && myColors.push($(x).css("background-color")); 
		});

		// draw vis on each created canvas according to the currentFrame
		let currentFrame = getCurrentFrame();
		if (MOVE) {
			let FLIP = getClickableDivStatus("flip");
			if(FLIP){
				myData[currentFrame] ? reDraw(myColors, myData[currentFrame], undefined, undefined, FLIP) : reDraw(myColors, undefined, undefined, undefined, FLIP);
			}
			if(!FLIP) {
				myData[currentFrame] ? reDraw(myColors, myData[currentFrame]) : reDraw(myColors);
			}
		}
		if(!MOVE) {
			let clickedBlocks = getClickedEdges();
			reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);
		}

		$(clickedBlocks[0]).removeClass("color_block_clicked");

		updateDataSnapshots(myColors);	
		updateRedux(); 
		invokeFootButton("undoBtn", "redoBtn", "addBtn");
	}
});

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

// when mouse is over color blocks, tell people the color codes and its transparency
function colorAnnotation(e){
	let rgb = getRgb($(e).css("background-color"));
	let hex = rgbToHex(rgb);	
	let alpha = getAlpha($(e).css("background-color"));

	$(e).attr("title", `rgb (${rgb})\nhex: ${hex}\nopacity: ${(alpha*100).toFixed(0)}%`);
}

// undo part: insert the previous color palettes
function insertColorPalette(vis, colors, id) {
	$(`#${id} div`).remove();
	let divNumber = colors.length;
	for(let i=0; i<divNumber; i++) {
		$(`#${id}`).append(colors[i]);

		// only apply on 'color_set'
		if(id === "color_set") {
			let colorNumberString = `${i+1}`;
			let myKey = Object.keys(predefinedColors[vis][colorNumberString])[0];
			if(myKey == "stroke") {
				$(`#color_${i+1}`).prepend('<div class = "color_block_core" style = "position: relative; border: 1px solid #d3d3d3; background-color: #ffffff;"></div>')
			}
		}
		
	}

	// update color_set colors
	if(id === "color_set") {
		let i=0;
		$(`#${id} div[name = "color_set_block`).get().forEach((x) => {$(x).css("background-color", (reduxStatusGroup[vis].archives)[reduxStatusGroup[vis].pointer]["color_set_block_codes"][i]); i++});
	}

	// set color blocks size
	$(".color_block").width(DIV_CONTROLLERS_WIDTH*0.15);
	$(".color_block").height(DIV_CONTROLLERS_WIDTH*0.15);

	$(".color_block_core").width(DIV_CONTROLLERS_WIDTH*0.15*0.7);
	$(".color_block_core").height(DIV_CONTROLLERS_WIDTH*0.15*0.7);
}

/*--------------------- transparency selector section ---------------------*/
function createTransparencyPalette(vis) {
	let divNumber = predefinedColors[vis].flags;

	// create predefined color blocks
	for(let i=1; i<=divNumber; i++){
		$("#transparency_set").append(`<div class = "color_block" name = "transparency_set_block" title = "opacity: 100%" id = "${predefinedColors[vis][i]}"></div>`);
		document.getElementById(predefinedColors[vis][i]).style.backgroundImage = `linear-gradient(to right, ${predefinedColors[vis][predefinedColors[vis][i]][0]} 33.33%, ${predefinedColors[vis][predefinedColors[vis][i]][1]} 33.33% 66.66%, ${predefinedColors[vis][predefinedColors[vis][i]][2]} 66.66%)`;
	
		// select one color block as default
		if( i==1 ) {
			$(`#${predefinedColors[vis][i]}`).addClass("color_block_clicked");
		}
	}

	// set color blocks' size
	$(".color_block").width(DIV_CONTROLLERS_WIDTH*0.15);
	$(".color_block").height(DIV_CONTROLLERS_WIDTH*0.15);

	return true;
}

// @ Alpha: the value of transparency_slider_2
// @ ...rgb: an array of rgb of 3 colors,  [[c1_r, c1_g, c1_b], [c2_r, c2_g, c2_b], [c3_r, c3_g, c3_b]]
function createHistoryTransparency(Alpha, ...rgb) {
	// once user selected a color, add history color block below
	$("#transparency_history").append(`<div class = "color_block" name = "transparency_history_block" title = "opacity: ${Alpha*100}%" id = "transparencyHistory_${(++divColorHistory)}"></div>`);
	document.getElementById("transparencyHistory_" + divColorHistory).style.backgroundImage = `linear-gradient(to right, rgba(${rgb[0]}, ${Alpha}) 33.33%, rgba(${rgb[1]}, ${Alpha}) 33.33% 66.66%, rgba(${rgb[2]}, ${Alpha}) 66.66%)`;

	// set color blocks color
	$(".color_block").width(DIV_CONTROLLERS_WIDTH*0.15);
	$(".color_block").height(DIV_CONTROLLERS_WIDTH*0.15);
}

// when clicking the national flag, give feedback on flag div, transparency_slider_2, and title
$(document).on("click", 'div[name="transparency_set_block"]', function() {
	// record if any color set is already clicked
	let blocks = $('div[name="transparency_set_block"]').get();

	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("color_block_clicked")) {clickedBlocks.push(x);} } );

	let id = $(this).prop("id");
	// check if this element is already selected
	let clicked = $("#" + id).hasClass("color_block_clicked");

	if(clicked) {
		$("#" + id).removeClass("color_block_clicked");
	} else {
		if($(this) != clickedBlocks[0]) {
			// remove previous clicked class
			$(clickedBlocks[0]).removeClass("color_block_clicked");
		}
		$("#" + id).addClass("color_block_clicked");
	}

	if(!clicked) {
		let rgb_l = colorSet[id]["rgb_l"];
		let rgb_m = colorSet[id]["rgb_m"];
		let rgb_r = colorSet[id]["rgb_r"];
		let alpha = getTransparency($("#" + id).attr("title"));
		$("#transparency_slider_2").val(alpha);

		document.getElementById("transparency_slider_2").style.backgroundImage = `linear-gradient(to right, rgba(${rgb_l}, 0.0) 0, rgba(${rgb_l}, 0.33) 33.33%, rgba(${rgb_m}, 0.33) 33.33%, rgba(${rgb_m}, 0.66) 66.66%, rgba(${rgb_r}, 0.66) 66.66%, rgba(${rgb_r}, 1.0) 100%), url("/SwimFlow/img/jpg/color_picker/transparency_background.jpg")`; 
		transparencyAnnotation($("#" + id), alpha);
	}
});

$("#transparency_slider_2").on("change", function() {
	let alpha = $(this).val();
	let myTransparencies;

	let blocks = $('div[name="transparency_set_block"]').get(); // get all blocks
	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("color_block_clicked")) {clickedBlocks.push(x);} } );

	// modify transparency for selected element 
	if(clickedBlocks[0]) {
		let id = $(clickedBlocks[0]).attr("id");
		let rgb_l = colorSet[id]["rgb_l"];
		let rgb_m = colorSet[id]["rgb_m"];
		let rgb_r = colorSet[id]["rgb_r"];
		$(clickedBlocks[0]).css("background-image", `linear-gradient(to right, rgba(${rgb_l}, ${alpha}) 33.33%, rgba(${rgb_m}, ${alpha}) 33.33% 66.66%, rgba(${rgb_r}, ${alpha}) 66.66%)`);
		transparencyAnnotation($("#" + id), alpha);

		// Update transparency for sketching
		myTransparencies = {"france": {"left": null, "middle": null, "right": null}, "belgium": {"left": null, "middle": null, "right": null}};
		for(let i=0; i<Object.keys(myTransparencies).length; i++) {
			let myNationality = Object.keys(myTransparencies)[i];
			if($("#" + myNationality).hasClass("color_block_clicked")) {
				myTransparencies[myNationality].left = `rgba(${(colorSet[myNationality].rgb_l)[0]}, ${(colorSet[myNationality].rgb_l)[1]}, ${(colorSet[myNationality].rgb_l)[2]}, ${alpha})`;
				myTransparencies[myNationality].middle = `rgba(${(colorSet[myNationality].rgb_m)[0]}, ${(colorSet[myNationality].rgb_m)[1]}, ${(colorSet[myNationality].rgb_m)[2]}, ${alpha})`;
				myTransparencies[myNationality].right = `rgba(${(colorSet[myNationality].rgb_r)[0]}, ${(colorSet[myNationality].rgb_r)[1]}, ${(colorSet[myNationality].rgb_r)[2]}, ${alpha})`;
			} else {
				myTransparencies[myNationality].left = `rgba(${(colorSet[myNationality].rgb_l)[0]}, ${(colorSet[myNationality].rgb_l)[1]}, ${(colorSet[myNationality].rgb_l)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
				myTransparencies[myNationality].middle = `rgba(${(colorSet[myNationality].rgb_m)[0]}, ${(colorSet[myNationality].rgb_m)[1]}, ${(colorSet[myNationality].rgb_m)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
				myTransparencies[myNationality].right = `rgba(${(colorSet[myNationality].rgb_r)[0]}, ${(colorSet[myNationality].rgb_r)[1]}, ${(colorSet[myNationality].rgb_r)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
			}
		}		
		createHistoryTransparency(alpha, rgb_l, rgb_m, rgb_r);
		// UPDATE: according to petra's comment: keep selecting until the user release it
		// $(clickedBlocks[0]).removeClass("color_block_clicked");

	// modify transparency for all elements 
	} else {
		blocks.forEach( (x) => {
			let id = $(x).attr("id");
			let rgb_l = colorSet[id]["rgb_l"];
			let rgb_m = colorSet[id]["rgb_m"];
			let rgb_r = colorSet[id]["rgb_r"];
			$("#" + id).css("background-image", `linear-gradient(to right, rgba(${rgb_l}, ${alpha}) 33.33%, rgba(${rgb_m}, ${alpha}) 33.33% 66.66%, rgba(${rgb_r}, ${alpha}) 66.66%)`);		
			transparencyAnnotation($("#" + id), alpha);

			myTransparencies = {"france": {"left": null, "middle": null, "right": null}, "belgium": {"left": null, "middle": null, "right": null}};
			for(let i=0; i<Object.keys(myTransparencies).length; i++) {
				let myNationality = Object.keys(myTransparencies)[i];
				myTransparencies[myNationality].left = `rgba(${(colorSet[myNationality].rgb_l)[0]}, ${(colorSet[myNationality].rgb_l)[1]}, ${(colorSet[myNationality].rgb_l)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
				myTransparencies[myNationality].middle = `rgba(${(colorSet[myNationality].rgb_m)[0]}, ${(colorSet[myNationality].rgb_m)[1]}, ${(colorSet[myNationality].rgb_m)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
				myTransparencies[myNationality].right = `rgba(${(colorSet[myNationality].rgb_r)[0]}, ${(colorSet[myNationality].rgb_r)[1]}, ${(colorSet[myNationality].rgb_r)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
			}

			createHistoryTransparency(alpha, rgb_l, rgb_m, rgb_r);
		});
	}

	// UPDATE: draw vis on each created canvas according to the currentFrame
	let currentFrame = Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], myTransparencies, undefined, FLIP) : reDraw(undefined, undefined, myTransparencies, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], myTransparencies) : reDraw(undefined, undefined, myTransparencies);
		}
	} 
	if(!MOVE) {
		let blocks = $(".edge_redraw").get();
		let clickedBlocks = [];
		blocks.forEach( (x) => {if($(x).hasClass("positionSlider_clicked")) {clickedBlocks.push($(x).prop("id"));} } );

		let currentFrame = Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);	
	}

	updateDataSnapshots();	
	updateRedux(); 
	invokeFootButton("undoBtn", "redoBtn", "addBtn");
});

$("#transparency_slider_2").on("input", function() {
	let alpha = $(this).val();
	let myTransparencies;

	let blocks = $('div[name="transparency_set_block"]').get();
	let clickedBlocks = [];
	blocks.forEach( (x) => { if($(x).hasClass("color_block_clicked")) {clickedBlocks.push(x);} } );

	if(clickedBlocks[0]) {
		let id = $(clickedBlocks[0]).attr("id");
		let rgb_l = colorSet[id]["rgb_l"];
		let rgb_m = colorSet[id]["rgb_m"];
		let rgb_r = colorSet[id]["rgb_r"];
		$(clickedBlocks[0]).css("background-image", `linear-gradient(to right, rgba(${rgb_l}, ${alpha}) 33.33%, rgba(${rgb_m}, ${alpha}) 33.33% 66.66%, rgba(${rgb_r}, ${alpha}) 66.66%)`);		
		transparencyAnnotation($("#" + id), alpha);

		myTransparencies = {"france": {"left": null, "middle": null, "right": null}, "belgium": {"left": null, "middle": null, "right": null}};
		for(let i=0; i<Object.keys(myTransparencies).length; i++) {
			let myNationality = Object.keys(myTransparencies)[i];
			if($("#" + myNationality).hasClass("color_block_clicked")) {
				myTransparencies[myNationality].left = `rgba(${(colorSet[myNationality].rgb_l)[0]}, ${(colorSet[myNationality].rgb_l)[1]}, ${(colorSet[myNationality].rgb_l)[2]}, ${alpha})`;
				myTransparencies[myNationality].middle = `rgba(${(colorSet[myNationality].rgb_m)[0]}, ${(colorSet[myNationality].rgb_m)[1]}, ${(colorSet[myNationality].rgb_m)[2]}, ${alpha})`;
				myTransparencies[myNationality].right = `rgba(${(colorSet[myNationality].rgb_r)[0]}, ${(colorSet[myNationality].rgb_r)[1]}, ${(colorSet[myNationality].rgb_r)[2]}, ${alpha})`;
			} else {
				myTransparencies[myNationality].left = `rgba(${(colorSet[myNationality].rgb_l)[0]}, ${(colorSet[myNationality].rgb_l)[1]}, ${(colorSet[myNationality].rgb_l)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
				myTransparencies[myNationality].middle = `rgba(${(colorSet[myNationality].rgb_m)[0]}, ${(colorSet[myNationality].rgb_m)[1]}, ${(colorSet[myNationality].rgb_m)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
				myTransparencies[myNationality].right = `rgba(${(colorSet[myNationality].rgb_r)[0]}, ${(colorSet[myNationality].rgb_r)[1]}, ${(colorSet[myNationality].rgb_r)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
			}
		}
	} else {
		blocks.forEach( (x) => {
			let id = $(x).attr("id");
			let rgb_l = colorSet[id]["rgb_l"];
			let rgb_m = colorSet[id]["rgb_m"];
			let rgb_r = colorSet[id]["rgb_r"];
			$("#" + id).css("background-image", `linear-gradient(to right, rgba(${rgb_l}, ${alpha}) 33.33%, rgba(${rgb_m}, ${alpha}) 33.33% 66.66%, rgba(${rgb_r}, ${alpha}) 66.66%)`);		
			transparencyAnnotation($("#" + id), alpha);

			myTransparencies = {"france": {"left": null, "middle": null, "right": null}, "belgium": {"left": null, "middle": null, "right": null}};
			for(let i=0; i<Object.keys(myTransparencies).length; i++) {
				let myNationality = Object.keys(myTransparencies)[i];
				myTransparencies[myNationality].left = `rgba(${(colorSet[myNationality].rgb_l)[0]}, ${(colorSet[myNationality].rgb_l)[1]}, ${(colorSet[myNationality].rgb_l)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
				myTransparencies[myNationality].middle = `rgba(${(colorSet[myNationality].rgb_m)[0]}, ${(colorSet[myNationality].rgb_m)[1]}, ${(colorSet[myNationality].rgb_m)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
				myTransparencies[myNationality].right = `rgba(${(colorSet[myNationality].rgb_r)[0]}, ${(colorSet[myNationality].rgb_r)[1]}, ${(colorSet[myNationality].rgb_r)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
			}
		});
	}

	// UPDATE: draw vis on each created canvas according to the currentFrame
	let currentFrame = Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], myTransparencies, undefined, FLIP) : reDraw(undefined, undefined, myTransparencies, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], myTransparencies) : reDraw(undefined, undefined, myTransparencies);
		}
	} 
	if(!MOVE) {
		let blocks = $(".edge_redraw").get();
		let clickedBlocks = [];
		blocks.forEach( (x) => {if($(x).hasClass("positionSlider_clicked")) {clickedBlocks.push($(x).prop("id"));} } );

		let currentFrame = Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);	
	}
})

$(document).on("click", 'div[name="transparency_history_block"]', function() {
	let myHistoryId = $(this).attr("id");

	// check if any color_set_block is checked
	let blocks = $('div[name="transparency_set_block"]').get();
	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("color_block_clicked")) {clickedBlocks.push(x);} } );

	if(clickedBlocks[0]) {
		let id = $(clickedBlocks[0]).attr("id");
		// get its flags colors and alpha
		let rgb_l = colorSet[id]["rgb_l"];
		let rgb_m = colorSet[id]["rgb_m"];
		let rgb_r = colorSet[id]["rgb_r"]; 
		let alpha = getTransparency($("#" + myHistoryId).attr("title"));

		// apply the colors with new alpha, update title
		$(clickedBlocks[0]).css("background-image", `linear-gradient(to right, rgba(${rgb_l}, ${alpha}) 33.33%, rgba(${rgb_m}, ${alpha}) 33.33% 66.66%, rgba(${rgb_r}, ${alpha}) 66.66%)`);
		transparencyAnnotation($("#" + id), alpha);

		// Update transparency for sketching
		let myTransparencies = {"france": {"left": null, "middle": null, "right": null}, "belgium": {"left": null, "middle": null, "right": null}};
		for(let i=0; i<Object.keys(myTransparencies).length; i++) {
			let myNationality = Object.keys(myTransparencies)[i];
			if($("#" + myNationality).hasClass("color_block_clicked")) {
				myTransparencies[myNationality].left = `rgba(${(colorSet[myNationality].rgb_l)[0]}, ${(colorSet[myNationality].rgb_l)[1]}, ${(colorSet[myNationality].rgb_l)[2]}, ${alpha})`;
				myTransparencies[myNationality].middle = `rgba(${(colorSet[myNationality].rgb_m)[0]}, ${(colorSet[myNationality].rgb_m)[1]}, ${(colorSet[myNationality].rgb_m)[2]}, ${alpha})`;
				myTransparencies[myNationality].right = `rgba(${(colorSet[myNationality].rgb_r)[0]}, ${(colorSet[myNationality].rgb_r)[1]}, ${(colorSet[myNationality].rgb_r)[2]}, ${alpha})`;
			} else {
				myTransparencies[myNationality].left = `rgba(${(colorSet[myNationality].rgb_l)[0]}, ${(colorSet[myNationality].rgb_l)[1]}, ${(colorSet[myNationality].rgb_l)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
				myTransparencies[myNationality].middle = `rgba(${(colorSet[myNationality].rgb_m)[0]}, ${(colorSet[myNationality].rgb_m)[1]}, ${(colorSet[myNationality].rgb_m)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
				myTransparencies[myNationality].right = `rgba(${(colorSet[myNationality].rgb_r)[0]}, ${(colorSet[myNationality].rgb_r)[1]}, ${(colorSet[myNationality].rgb_r)[2]}, ${getTransparency($("#" + myNationality).attr("title"))})`;
			}
		}

		// UPDATE: draw vis on each created canvas according to the currentFrame
		let currentFrame = Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);
		if (MOVE) {
			let FLIP = getClickableDivStatus("flip");
			if(FLIP){
				myData[currentFrame] ? reDraw(undefined, myData[currentFrame], myTransparencies, undefined, FLIP) : reDraw(undefined, undefined, myTransparencies, undefined, FLIP);
			}
			if(!FLIP) {
				myData[currentFrame] ? reDraw(undefined, myData[currentFrame], myTransparencies) : reDraw(undefined, undefined, myTransparencies);
			}
		}

		if(!MOVE) {
			let blocks = $(".edge_redraw").get();
			let clickedBlocks = [];
			blocks.forEach( (x) => {if($(x).hasClass("positionSlider_clicked")) {clickedBlocks.push($(x).prop("id"));} } );

			let currentFrame = Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);
			reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);
		}

		$(clickedBlocks[0]).removeClass("color_block_clicked");

		// updateDataSnapshots(undefined, myTransparencies);
		updateDataSnapshots();	
		updateRedux(); 
		invokeFootButton("undoBtn", "redoBtn", "addBtn");
	}
});	

// update national flag div's title
function transparencyAnnotation(e, alpha){
	$(e).attr("title", `opacity: ${(alpha*100).toFixed(0)}%`);
}

// get current transparency from div's title
function getTransparency(title) {
	return (parseInt(title.split(" ")[1].split("%")[0])/100).toFixed(2);
}

// undo part: insert the previous transparency palettes
function insertTransparencyPalette(vis, colors, id) {
	$(`#${id} div`).remove();
	let divNumber = colors.length;
	for(let i=0; i<divNumber; i++) {
		$(`#${id}`).append(colors[i]);
	}

	// update tranparency_set colors
	if(id === "transparency_set") {
		let i=0;
		$(`#${id} div`).get().forEach((x) => {
			if($(x).prop("id") == "france") {
				$(x).css("background-image", `linear-gradient(to right, ${ (reduxStatusGroup[vis].archives)[reduxStatusGroup[vis].pointer]["transparency_set_block_codes"].france.left} 33.33%, ${(reduxStatusGroup[vis].archives)[reduxStatusGroup[vis].pointer]["transparency_set_block_codes"].france.middle} 33.33% 66.66%, ${(reduxStatusGroup[vis].archives)[reduxStatusGroup[vis].pointer]["transparency_set_block_codes"].france.right} 66.66%)` );
			}

			if( $(x).prop("id") == "belgium" ) {
				$(x).css("background-image", `linear-gradient(to right, ${ (reduxStatusGroup[vis].archives)[reduxStatusGroup[vis].pointer]["transparency_set_block_codes"].belgium.left} 33.33%, ${(reduxStatusGroup[vis].archives)[reduxStatusGroup[vis].pointer]["transparency_set_block_codes"].belgium.middle} 33.33% 66.66%, ${(reduxStatusGroup[vis].archives)[reduxStatusGroup[vis].pointer]["transparency_set_block_codes"].belgium.right} 66.66%)` );
			}
		});
	}

	// set color blocks size
	$(".color_block").width(DIV_CONTROLLERS_WIDTH*0.15);
	$(".color_block").height(DIV_CONTROLLERS_WIDTH*0.15);
}

/*--------------------- listen to controllers section ---------------------*/
//  when a data item is selected, insert possible vis and then make vis selector appears
$("#dataCategory_selector").on("change", function(){
	// disable all foot buttons
	invokeFootButton("none");
	// clear all divs under vis selector
	$("#divVisContainer").empty();
	// clean all vis on lanes without class "layer"
	clearCanvas();
	// hide all selectors
	hideSelectors(true, true);
	// hide titles
	displayTitles(false);
	displayVisSelector(false);
	displayLaneSelectors(false);

	displayMovementSelector(false);
		displayMoveSubController("none");
	
	displayZoomSlider(false);
	displayRotationSlider(false);		
	displayColorPicker(false);
	displayTransparencySelector(false);
	
	// reset all selectors below
	resetRecordSelector();
	resetSwimmerSelector();
	resetLaneSelector();
	resetMovementStatus();
		resetFlipButton();
		resetHorizontalPosition();
		resetVerticalPosition();

		resetAlignButton();
		resetMoveHorizontal();
		resetMoveVertical();
	
	resetLockButton();
	resetHeightSlider();
	resetWidthSlider();
	resetRotationSlider();
	resetColorSet();
	resetColorHistory();
	resetTransparencySet();
	resetTransparencyHistory();

	// reset flags
	IMAGE = false, COLOR_PICKER = false, TRANSPARENCY = false;	
	setSelectedRecord("world"); setSelectedSwimmer("lane1");
	hideSelectors(true, true);

	// identify which representations should be shown
	switch ($(this).val()){
		case "nationality":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');	
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "nationalFlags" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Flag"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "nationality_img_flag" src = "/SwimFlow/vis/nationality/nationalFlags.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');	
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "nationalText" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "nationality_img_text" src = "/SwimFlow/vis/nationality/nationalText.png"> '); 

			$(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "name":		
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');	
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "nameText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "name_img_text" src = "/SwimFlow/vis/name/nameText.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "age":		
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');	
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "ageText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "age_img_text" src = "/SwimFlow/vis/age/ageText.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "time_differences_record":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');	
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "lapDifferencesRecordText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "time_differences_record_img_text" src = "/SwimFlow/vis/time_differences_record/lapDifferencesRecordText.png"> ');

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');	
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "lapDifferencesRecordBarChart" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Bar Chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "time_differences_record_img_bar_chart" src = "/SwimFlow/vis/time_differences_record/lapDifferencesRecordBarChart.png"> ');

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');	
			$("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "lapDifferencesRecordGlyph" style = "display:none">')
						  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "time_differences_record_img_glyph" src = "/SwimFlow/vis/time_differences_record/lapDifferencesRecordGlyph.png"> ');   

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "time_differences_swimmer":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');	
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "lapDifferencesSwimmerText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "time_differences_swimmer_img_text" src = "/SwimFlow/vis/time_differences_swimmer/lapDifferencesSwimmerText.png"> ');

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');	
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "lapDifferencesSwimmerBarChart" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Bar Chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "time_differences_swimmer_img_bar_chart" src = "/SwimFlow/vis/time_differences_swimmer/lapDifferencesSwimmerBarChart.png"> ');

   		    // $("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');	
			// $("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "lapDifferencesSwimmerGlyph" style = "display:none">')
			// 			  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			//        		  .prepend('<img class = "img" id = "time_differences_swimmer_img_glyph" src = "/SwimFlow/vis/time_differences_swimmer/lapDifferencesSwimmerGlyph.png"> ');   

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "elapsed":		
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');	
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "elapsedText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "elapsed_img_text" src = "/SwimFlow/vis/elapsed/elapsedText.png"> ');

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');	
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "elapsedTimer" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Pie Chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "elapsed_img_pie_chart" src = "/SwimFlow/vis/elapsed/elapsedTimer.png"> ');

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');	
			$("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "elapsedProgressBar" style = "display:none">')
						  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Progress bar"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "elapsed_img_progress_bar" src = "/SwimFlow/vis/elapsed/elapsedProgressBar.png"> ');   

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "current_lap":			
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');	
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "currentLapText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "current_lap_img_text" src = "/SwimFlow/vis/current_lap/currentLapText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');	
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "currentLapBarChart" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "current_lap_img_bar_chart" src = "/SwimFlow/vis/current_lap/currentLapBarChart.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "average_lap":			
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');	
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "averageLapText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "average_lap_img_text" src = "/SwimFlow/vis/average_lap/averageLapText.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "current_speed":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "currentSpeedText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "current_speed_img_text" src = "/SwimFlow/vis/current_speed/currentSpeedText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "currentSpeedBarChart" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "current_speed_img_bar_chart" src = "/SwimFlow/vis/current_speed/currentSpeedBarChart.png"> '); 

			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');
			$("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "currentSpeedCircularSector" style = "display:none">')
						  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "current_speed_img_circular_sector" src = "/SwimFlow/vis/current_speed/currentSpeedCircularSector.png"> ');  

			$(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "acceleration":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "accelerationText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "acceleration_img_text" src = "/SwimFlow/vis/acceleration/accelerationText.png"> '); 

   		  	$("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "accelerationBarChart" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "acceleration_img_bar_chart" src = "/SwimFlow/vis/acceleration/accelerationBarChart.png"> '); 

   		  	$("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');
			$("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "accelerationGlyph" style = "display:none">')
						  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "acceleration_img_glyph" src = "/SwimFlow/vis/acceleration/accelerationGlyph.png"> ');  

   		  	$(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "speed_history": 
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedHistoryLineChart" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "speed_history_img_text" src = "/SwimFlow/vis/speed_history/speedHistoryLineChart.png"> ');

			$(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "average_speed": 
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "averageSpeedText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "average_speed_img_text" src = "/SwimFlow/vis/average_speed/averageSpeedText.png"> ');

			$(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "distance_swam":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "distanceSwamText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "distance_swam_img_text" src = "/SwimFlow/vis/distance_swam/distanceSwamText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "distanceSwamBarChart" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "distance_swam_img_bar_chart" src = "/SwimFlow/vis/distance_swam/distanceSwamBarChart.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
   		    break;

   		case "remaining_distance":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "remainingDistanceText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "remaining_distance_img_text" src = "/SwimFlow/vis/remaining_distance/remainingDistanceText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "remainingDistanceBarChart" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "remaining_distance_img_bar_chart" src = "/SwimFlow/vis/remaining_distance/remainingDistanceBarChart.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
   		    break;

   		case "distance_differences_leader":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "distanceDifferencesLeaderText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "distance_differences_leader_img_text" src = "/SwimFlow/vis/distance_differences_leader/distanceDifferencesLeaderText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "distanceDifferencesLeaderLine" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "distance_differences_leader_img_line" src = "/SwimFlow/vis/distance_differences_leader/distanceDifferencesLeaderLine.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');
			$("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "distanceDifferencesLeaderArrow" style = "display:none">')
						  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Arrow"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "distance_differences_leader_img_arrow" src = "/SwimFlow/vis/distance_differences_leader/distanceDifferencesLeaderArrow.png"> ');  

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
   		    break;

	    case "world_record":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "worldRecordText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "world_record_img_text" src = "/SwimFlow/vis/world_record/worldRecordText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "worldRecordLine" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "world_record_img_line" src = "/SwimFlow/vis/world_record/worldRecordLine.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
   		    break;

	    case "olympics_record":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "olympicsRecordText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "olympics_record_img_text" src = "/SwimFlow/vis/olympics_record/olympicsRecordText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "olympicsRecordLine" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "olympics_record_img_line" src = "/SwimFlow/vis/olympics_record/olympicsRecordLine.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
   		    break;

	    case "personal_record":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "personalRecordText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "personal_record_img_text" src = "/SwimFlow/vis/personal_record/personalRecordText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "personalRecordLine" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "personal_record_img_line" src = "/SwimFlow/vis/personal_record/personalRecordLine.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
   		    break;

	    case "national_record":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "nationalRecordText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "national_record_img_text" src = "/SwimFlow/vis/national_record/nationalRecordText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "nationalRecordLine" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "national_record_img_line" src = "/SwimFlow/vis/national_record/nationalRecordLine.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
   		    break;

   		case "position_differences_record":
   			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "positionDifferencesRecordText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "position_differences_record_img_text" src = "/SwimFlow/vis/position_differences_record/positionDifferencesRecordText.png"> ');

   			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesRecordLine" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "speed_differences_record_img_line" src = "/SwimFlow/vis/position_differences_record/speedDifferencesRecordLine.png"> ');
   			
   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
   			break;

		case "position_differences_swimmer":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "positionDifferencesSwimmerText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "position_differences_swimmer_img_text" src = "/SwimFlow/vis/position_differences_swimmer/positionDifferencesSwimmerText.png"> '); 

			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesSwimmerLine" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "speed_differences_swimmer_img_line" src = "/SwimFlow/vis/position_differences_swimmer/speedDifferencesSwimmerLine.png"> '); 
			
			$(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "speed_differences_record":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesRecordText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "speed_differences_record_img_text" src = "/SwimFlow/vis/speed_differences_record/speedDifferencesRecordText.png"> '); 

   		    // $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			// $("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesRecordLine" style = "display:none">')
			// 			  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			//        		  .prepend('<img class = "img" id = "speed_differences_record_img_line" src = "/SwimFlow/vis/speed_differences_record/speedDifferencesRecordLine.png"> '); 

   		    // $("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');
			// $("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesRecordGlyph" style = "display:none">')
			// 			  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			//        		  .prepend('<img class = "img" id = "speed_differences_record_img_glyph" src = "/SwimFlow/vis/speed_differences_record/speedDifferencesRecordGlyph.png"> ');  

   		    // $("#divVisContainer").append('<div class = "vis-container" id = "divVis_4"></div>');
			// $("#divVis_4").prepend('<input id="visBtn_4" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesRecordBarChart" style = "display:none">')
			// 			  .append('<label for = "visBtn_4" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			//        		  .prepend('<img class = "img" id = "speed_differences_record_img_bar_chart" src = "/SwimFlow/vis/speed_differences_record/speedDifferencesRecordBarChart.png"> ');  

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesRecordGlyph" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "speed_differences_record_img_glyph" src = "/SwimFlow/vis/speed_differences_record/speedDifferencesRecordGlyph.png"> ');  

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');
			$("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesRecordBarChart" style = "display:none">')
						  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "speed_differences_record_img_bar_chart" src = "/SwimFlow/vis/speed_differences_record/speedDifferencesRecordBarChart.png"> ');  

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "speed_differences_swimmer":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesSwimmerText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "speed_differences_swimmer_img_text" src = "/SwimFlow/vis/speed_differences_swimmer/speedDifferencesSwimmerText.png"> '); 

   		    // $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			// $("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesSwimmerLine" style = "display:none">')
			// 			  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			//        		  .prepend('<img class = "img" id = "speed_differences_swimmer_img_line" src = "/SwimFlow/vis/speed_differences_swimmer/speedDifferencesSwimmerLine.png"> '); 

   		    // $("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');
			// $("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesSwimmerGlyph" style = "display:none">')
			// 			  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			//        		  .prepend('<img class = "img" id = "speed_differences_swimmer_img_glyph" src = "/SwimFlow/vis/speed_differences_swimmer/speedDifferencesSwimmerGlyph.png"> ');  

   		    // $("#divVisContainer").append('<div class = "vis-container" id = "divVis_4"></div>');
			// $("#divVis_4").prepend('<input id="visBtn_4" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesSwimmerBarChart" style = "display:none">')
			// 			  .append('<label for = "visBtn_4" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			//        		  .prepend('<img class = "img" id = "speed_differences_swimmer_img_bar_chart" src = "/SwimFlow/vis/speed_differences_swimmer/speedDifferencesSwimmerBarChart.png"> '); 
   		    
   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesSwimmerGlyph" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "speed_differences_swimmer_img_glyph" src = "/SwimFlow/vis/speed_differences_swimmer/speedDifferencesSwimmerGlyph.png"> ');  

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');
			$("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "speedDifferencesSwimmerBarChart" style = "display:none">')
						  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "speed_differences_swimmer_img_bar_chart" src = "/SwimFlow/vis/speed_differences_swimmer/speedDifferencesSwimmerBarChart.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "winner":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "winnerText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "winner_img_text" src = "/SwimFlow/vis/winner/winnerText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "winnerGlyph" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "winner_img_glyph" src = "/SwimFlow/vis/winner/winnerGlyph.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
   		    break;

	    case "next_passing":
	    	$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "nextPassingText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "next_passing_img_text" src = "/SwimFlow/vis/next_passing/nextPassingText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "nextPassingGlyph" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "next_passing_img_glyph" src = "/SwimFlow/vis/next_passing/nextPassingGlyph.png"> '); 

	    	$(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
	    	break;

    	case "estimated_completion_time":
	    	$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "estimatedCompletionTimeText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "estimated_completion_time_img_text" src = "/SwimFlow/vis/estimated_completion_time/estimatedCompletionTimeText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "estimatedCompletionTimeBarChart" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "estimated_completion_time_img_bar_chart" src = "/SwimFlow/vis/estimated_completion_time/estimatedCompletionTimeBarChart.png"> '); 

	    	$(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
	    	break;

    	case "reaction_time":
	    	$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "reactionTimeText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "reaction_time_img_text" src = "/SwimFlow/vis/reaction_time/reactionTimeText.png"> '); 

	    	$(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
	    	break;

    	case "diving_distance":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "divingDistanceText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "diving_distance_img_text" src = "/SwimFlow/vis/diving_distance/divingDistanceText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "divingDistanceLine" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "diving_distance_img_line" src = "/SwimFlow/vis/diving_distance/divingDistanceLine.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');
			$("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "divingDistanceArrow" style = "display:none">')
						  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Arrow"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "diving_distance_img_arrow" src = "/SwimFlow/vis/diving_distance/divingDistanceArrow.png"> ');  

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "stroke_distance":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "distanceStrokeText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "stroke_distance_img_text" src = "/SwimFlow/vis/stroke_distance/distanceStrokeText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "distanceStrokeLine" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Line"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "stroke_distance_img_line" src = "/SwimFlow/vis/stroke_distance/distanceStrokeLine.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_3"></div>');
			$("#divVis_3").prepend('<input id="visBtn_3" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "distanceStrokeBarChart" style = "display:none">')
						  .append('<label for = "visBtn_3" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "stroke_distance_img_bar_chart" src = "/SwimFlow/vis/stroke_distance/distanceStrokeBarChart.png"> ');  

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_4"></div>');
			$("#divVis_4").prepend('<input id="visBtn_4" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "distanceStrokeArrow" style = "display:none">')
						  .append('<label for = "visBtn_4" class = "clickable-radio-button" title = "Arrow"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "stroke_distance_swimmer_img_arrow" src = "/SwimFlow/vis/stroke_distance/distanceStrokeArrow.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "stroke_count":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "strokeCountText" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Text"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "stroke_count_img_text" src = "/SwimFlow/vis/stroke_count/strokeCountText.png"> '); 

   		    $("#divVisContainer").append('<div class = "vis-container" id = "divVis_2"></div>');
			$("#divVis_2").prepend('<input id="visBtn_2" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "strokeCountBarChart" style = "display:none">')
						  .append('<label for = "visBtn_2" class = "clickable-radio-button" title = "Bar chart"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "stroke_count_img_bar_chart" src = "/SwimFlow/vis/stroke_count/strokeCountBarChart.png"> '); 

   		    $(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break;

		case "record_break":
			$("#divVisContainer").append('<div class = "vis-container" id = "divVis_1"></div>');
			$("#divVis_1").prepend('<input id="visBtn_1" type="radio" class = "invisible-radio-button flag" name="visBtn" value = "recordBreakGlyph" style = "display:none">')
						  .append('<label for = "visBtn_1" class = "clickable-radio-button" title = "Glyph"><span class="checked-box">&#10004;</span></label>')
			       		  .prepend('<img class = "img" id = "record_break_img_Glyph" src = "/SwimFlow/vis/record_break/recordBreakGlyph.png"> '); 

			$(".vis-container").width(DIV_CONTROLLERS_WIDTH*0.2);
			$(".vis-container").height(DIV_CONTROLLERS_WIDTH*0.2);
			$(".img").attr("width", "80%");
			break; 
	}
	displayVisSelector(true);
});

// once a visualization in selected, display it on 8 lanes, let lane selectors display
$(document).on("change", 'input[name="visBtn"]', function(){
	// display "I finish my design"
	$("#finishDiv").attr("hidden", false);
	
	let myVis = getVis();
	switch (myVis) {
		case "nationalFlags":
			IMAGE = true;
			SUB_SWIMMER = false; SUB_RECORD = false;
			setSizeLable("shape");
			break;

		case "nationalText":
		case "nameText":
		case "ageText":	
		case "elapsedText":	
		case "currentLapText":
		case "averageLapText":	
		case "accelerationText":
		case "averageSpeedText":
		case "distanceSwamText":
		case "remainingDistanceText":
		case "worldRecordText":
		case "olympicsRecordText":
		case "personalRecordText":
		case "personalRecordText":
		case "distanceDifferencesLeaderText":
		case "winnerText":
		case "nextPassingText":
		case "estimatedCompletionTimeText":
		case "reactionTimeText":
		case "divingDistanceText":
		case "distanceStrokeText":
		case "strokeCountText":
			IMAGE = false;
			SUB_SWIMMER = false; SUB_RECORD = false;
			setSizeLable("text");
			break;

		case "lapDifferencesRecordText":
			IMAGE = false;
			SUB_RECORD = true;
			SUB_SWIMMER = false;
			hideSelectors(false, true);
			setSizeLable("text");
			break;
		case "lapDifferencesSwimmerText":
			IMAGE = false;
			SUB_RECORD = false;
			SUB_SWIMMER = true;
			hideSelectors(true, false);
			setSizeLable("text");
			break;
		case "speedDifferencesRecordText":
			IMAGE = false;
			SUB_RECORD = true;
			SUB_SWIMMER = false;
			hideSelectors(false, true);
			setSizeLable("text");
			break;
		case "speedDifferencesSwimmerText":
			IMAGE = false;			
			SUB_RECORD = false;
			SUB_SWIMMER = true;
			hideSelectors(true, false);
			setSizeLable("text");
			break;
		
		case "lapDifferencesSwimmerBarChart":
		case "lapDifferencesSwimmerGlyph":
		case "positionDifferencesSwimmerText":
		case "speedDifferencesSwimmerLine":
		case "speedDifferencesSwimmerGlyph":
		case "speedDifferencesSwimmerBarChart":
			IMAGE = false;
			SUB_SWIMMER = true;
			SUB_RECORD = false;
			hideSelectors(true, false);
			setSizeLable("shape");
			break;
		case "lapDifferencesRecordBarChart":
		case "lapDifferencesRecordGlyph":
		case "positionDifferencesRecordText":
		case "speedDifferencesRecordLine":
		case "speedDifferencesRecordGlyph":	
		case "speedDifferencesRecordBarChart":
			IMAGE = false;
			SUB_RECORD = true;
			SUB_SWIMMER = false;
			hideSelectors(false, true);
			setSizeLable("shape");			
			break;

		default:
			IMAGE = false;
			SUB_SWIMMER = false; SUB_RECORD = false;
			setSizeLable("shape");
	}

	// get the predefined size of this representation
	visW = eval(myVis).w;	visH = eval(myVis).h;
	// check if this representation has archived data snap shot
	let myArchives = reduxStatusGroup[myVis].archives;
	let myPointer = reduxStatusGroup[myVis].pointer; // 0 => has not been initialized yet, >=1 => already initialized, then read the previous data from redux

	// initialize
	if(myPointer == 0) {	
		// no previous actions: disable undo/redo, but active add
		invokeFootButton("disableUndo", "disableRedo", "addBtn"); 
		
		/* set controllers' threshold */
		// set the threshold of sliders: only thresholds
		setHorizontal(visW); setVertical(visH);
		setMoveHorizontal(visW); setMoveVertical(visH); 
		setHeight(visH); setWidth(visW);

		/* reset the value of all controllers */
		// sub-controllers
		resetRecordSelector();
		resetSwimmerSelector();
		// lane selector
		resetLaneSelector();
		// when MOVE
		MOVE = true;
		resetMovementStatus();
		resetFlipButton();
		resetHorizontalPosition();
		resetVerticalPosition();
		// when !MOVE
		resetAlignButton();
		resetMoveHorizontal();
		resetMoveVertical();
		// size & rotation
		resetLockButton();
		resetHeightSlider();
		resetWidthSlider();
		resetRotationSlider();
		// identify if color&transparency or only transparency palette should be configured
		resetColorSet(); resetTransparencySet();	
		IMAGE ? TRANSPARENCY = createTransparencyPalette(myVis) : COLOR_PICKER = createColorPalette(myVis);
		// color & transparency
		resetColorHistory(); resetTransparencyHistory();

		/* display the controllers or not */
		// displayTitles
		displayTitles(true);
		// let lane selector display
		displayLaneSelectors(true);
		// let movement status display
		displayMovementSelector(true);
			displayMoveSubController(true);
		// let position/zoom/rotate slider display
		displayZoomSlider(true); displayRotationSlider(true);

		// should color picker be displayed:
		(!IMAGE && COLOR_PICKER) ? displayColorPicker(true) : displayColorPicker(false);
		(IMAGE && TRANSPARENCY) ? displayTransparencySelector(true) : displayTransparencySelector(false);

		// initialize the data snapshot
		updateDataSnapshots();
		updateRedux();

		// If hasClass("layer"): clean exist canvas
		// If !hasClass("layer"): remove exist canvas + embed new ones
		reEmbedCanvas();

		let currentFrame = Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);
		if (MOVE) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		} else {
			STOPPOS ? reDraw(undefined, STOPPOS) : reDraw();
		}		
	}

	// read archives
	if(myPointer > 0) {
		// update UI, reset controllers' labels, thresholds values, redraw 
		undoRedo(false, false);

		// display titles
		displayTitles(true);
		// let lane selector display
		displayLaneSelectors(true);
		// let movement status display
		displayMovementSelector(true);
		// let position/zoom/rotate slider display
		displayZoomSlider(true); displayRotationSlider(true);

		// should color picker be displayed:
		(!IMAGE && myArchives[myPointer].COLOR_PICKER) ? displayColorPicker(true) : displayColorPicker(false);
		(IMAGE && myArchives[myPointer].TRANSPARENCY) ? displayTransparencySelector(true) : displayTransparencySelector(false);
		
		invokeFootButton("undo", "redo", "addBtn");
				
	}	
});

// if a compared record or swimmer is selected
$("#record_selector").on("change", function(){
	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();

	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	} 

	if(!MOVE) {
		let currentFrame = getCurrentFrame();
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);		
	}

	updateDataSnapshots();	updateRedux();
	invokeFootButton("undoBtn", "redoBtn", "addBtn");
});

$("#swimmer_selector").on("change", function(){	
	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();
		
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	} 

	if(!MOVE) {
		let currentFrame = getCurrentFrame();
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);		
	}
	updateDataSnapshots();	updateRedux();
	invokeFootButton("undoBtn", "redoBtn", "addBtn");
});

// check if the lane selectors change
$('input[name="lane_selector"]').on("click", function(){
	// clean previous created canvas and embed new ones
	reEmbedCanvas();

	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();

	if(MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	}

	if(!MOVE) {
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);
	}


	updateDataSnapshots(); updateRedux();
	invokeFootButton("undoBtn", "redoBtn", "addBtn");
});

$("#moving").on("change", function(){
	$(this).attr("checked", !$(this).attr("checked") );
	MOVE = shouldMove()[0], STOPPOS = shouldMove()[1];

	// get current vis height and width
	visChecked = getVis();
	visW = eval(visChecked).w;	visH = eval(visChecked).h;
	let currentHeight = visH + getSliderValues("heightSlider", "val");	
	let currentWidth = visW + getSliderValues("widthSlider", "val");

	// should move: initialize distance sliders between vis & swimmer 
	if(MOVE) {
		setHorizontal(currentWidth); setVertical(currentHeight);
		resetHorizontalPosition(); resetVerticalPosition();
	}

	// stay static: initialize position sliders between vis & swimming pool  
	if(!MOVE) {
		setMoveHorizontal(currentWidth); setMoveVertical(currentHeight);
		resetMoveHorizontal(); resetMoveVertical();
		resetAlignButton(); resetEdgeBtn();
	}
	
	// display sub controllers
	displayMoveSubController(MOVE);

	updateDataSnapshots(); updateRedux();
	invokeFootButton("undoBtn", "redoBtn", "addBtn");
});

$("#horizontal").on("input", function() { rangeSliderUI(this); });
$("#vertical").on("input", function(){ rangeSliderUI(this); });
$("#heightSlider").on("input", function(){ rangeSliderUI(this); });
$("#widthSlider").on("input", function(){ rangeSliderUI(this); });
$("#rotationSlider").on("input", function(){ rangeSliderUI(this); });
$("#moveHorizontalSlider").on("input", function() {rangeSliderUI(this); });
$("#moveVerticalSlider").on("input", function() {rangeSliderUI(this); });

$(".plusMinus_btn").on("click", function() {
	let btnId  = $(this).prop("id");
	let sliderId = btnId.split("_")[1];
	if( sliderId != "horizontal" && sliderId != "vertical") {
		sliderId = `${sliderId}Slider`;
	}

	let myValue = parseInt($(`#${sliderId}`).val());
	// set new value
	if( $(`#${btnId}`).hasClass("plus") ) {
		myValue = myValue + 1;
	}
	if( $(`#${btnId}`).hasClass("minus") ) {
		myValue = myValue - 1;
	}

	$(`#${sliderId}`).val(myValue);			
	$(`#${sliderId}`).trigger("input");
	$(`#${sliderId}`).trigger("change");
});

// when (!MOVE) => Align button, position sliders related to the swimming pool
$("#alignButton").on("change", function() {
	let currentFrame = getCurrentFrame();
	let clickedBlocks = getClickedEdges();
	reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);

	updateDataSnapshots(); updateRedux();
	invokeFootButton("undoBtn", "redoBtn", "addBtn");
});

// when (!MOVE) => position sliders related to the swimming pool
$(".move_re_draw").on("input", function() {
	// when (!MOVE) position sliders change, update edge buttons UI
	let id = $(this).prop("id");
	if(id === "moveHorizontalSlider") {
		// remove positionSlider_clicked for horizontal ones
		$('div[name="horizontalSlider"]').get().forEach( (x) => { $(x).removeClass("positionSlider_clicked"); });
	}
	if(id === "moveVerticalSlider") {
		// remove positionSlider_clicked for horizontal ones
		$('div[name="verticalSlider"]').get().forEach( (x) => { $(x).removeClass("positionSlider_clicked"); });
	}

	let currentFrame = getCurrentFrame();
	let clickedBlocks = getClickedEdges();
	reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);
});

$(".move_re_draw").on("change", function() {
	updateDataSnapshots(); updateRedux();
	invokeFootButton("undoBtn", "redoBtn", "addBtn");
});

// when (!MOVE), clicking the position sliders => add reflection on UI
$(document).on("click", 'div[name="horizontalSlider"]', function() {
	// record if one of the edge button is already clicked
	let blocks = $('div[name="horizontalSlider"]').get();
	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("positionSlider_clicked")) {clickedBlocks.push(x);} } );

	let id = $(this).prop("id");
	// check if this element is already selected
	let clicked = $("#" + id).hasClass("positionSlider_clicked");

	if(clicked) {
		$("#" + id).removeClass("positionSlider_clicked");
	} else {
		if($(this) != clickedBlocks[0]) {
			// remove previous clicked class
			$(clickedBlocks[0]).removeClass("positionSlider_clicked");
		}
		$("#" + id).addClass("positionSlider_clicked");
	}
});

$(document).on("click", 'div[name="verticalSlider"]', function() {
	// record if one of the edge button is already clicked
	let blocks = $('div[name="verticalSlider"]').get();
	let clickedBlocks = [];
	blocks.forEach( (x) => {if($(x).hasClass("positionSlider_clicked")) {clickedBlocks.push(x);} } );

	let id = $(this).prop("id");
	// check if this element is already selected
	let clicked = $("#" + id).hasClass("positionSlider_clicked");

	if(clicked) {
		$("#" + id).removeClass("positionSlider_clicked");
	} else {
		if($(this) != clickedBlocks[0]) {
			// remove previous clicked class
			$(clickedBlocks[0]).removeClass("positionSlider_clicked");
		}
		$("#" + id).addClass("positionSlider_clicked");
	}
});

// when (!MOVE), clicking the position sliders => redraw vis with align
$(document).on("click", ".edge_redraw", function() {
	let currentFrame = getCurrentFrame();
	let clickedBlocks = getClickedEdges();
	reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);

	updateDataSnapshots(); updateRedux();
	invokeFootButton("undoBtn", "redoBtn", "addBtn");
});

// when (MOVE) => Flip button => add reflection on UI
$(document).on("click", 'div[name = "flipHorizontal"]', function() {
	$(this).hasClass("flipBtn_clicked") ? $(this).removeClass("flipBtn_clicked") : $(this).addClass("flipBtn_clicked");

	let FLIP = getClickableDivStatus("flip"); 
	let currentFrame = getCurrentFrame();
	if(MOVE) {
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined) : reDraw();
		}
	}

	updateDataSnapshots(); updateRedux();
	invokeFootButton("undoBtn", "redoBtn", "addBtn");	
});

// when position/zoom/rotation sliders change, give feedback on visualization(s)
// on("input") logs the value while the user is moving the slider
// on("change") logs the value when the user has released the slider  
$(".re_draw").on("input", function(){ 
	let id = $(this).prop("id");
	let clicked = $("#img_lock").hasClass("img_lock_clicked");
	let currentFrame = Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);

	// if is the height slider and the lock fired
	if( id === "heightSlider" && clicked) {
		let height = $("#" + id).val();
		let width = Math.floor(height/visH*visW);
		$("#widthSlider").val(width);
		rangeSliderUI( document.getElementById("widthSlider") );
	}

	if( id === "widthSlider" && clicked) {
		let width = $("#" + id).val();
		let height = Math.floor(width/visW*visH);
		$("#heightSlider").val(height);
		rangeSliderUI( document.getElementById("heightSlider") );	
	}

	// UPDATE: draw vis on each created canvas according to the currentFrame	
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	} 

	if(!MOVE) {
		let currentFrame = getCurrentFrame();
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);		
	}
});

$(".re_draw").on("change", function() {
	updateDataSnapshots(); updateRedux();
	invokeFootButton("undoBtn", "redoBtn", "addBtn");
});

// when reset position/zoom/rotation sliders, reset vis as well
$("#reset_horizontal").on("click", function() { 
	resetHorizontalPosition();

	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	}

	updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn"); 
});

$("#reset_vertical").on("click", function() { 
	resetVerticalPosition();

	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	}

	updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn"); 
});

$("#reset_heightSlider").on("click", function() { 
	let clicked = $("#img_lock").hasClass("img_lock_clicked");
	if(clicked) {
		resetWidthSlider();
	}
	resetHeightSlider(); 
	
	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	} 

	if(!MOVE) {
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);		
	}

	updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn"); 
});

$("#reset_widthSlider").on("click", function() { 
	let clicked = $("#img_lock").hasClass("img_lock_clicked");
	if(clicked){
		resetHeightSlider();	
	}
	resetWidthSlider(); 
	
	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	}

	if(!MOVE) {
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);		
	}

	updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn");
});

$("#reset_rotationSlider").on("click", function() { 
	resetRotationSlider();

	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	}

	if(!MOVE) {
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);		
	}

	updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn"); 
});

$('#reset_colorSet').on("click", function() { 
	resetColorSet(getVis());

	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	}

	if(!MOVE) {
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);		
	}

	updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn"); 
});

$('#reset_transparencySet').on("click", function() { 
	resetTransparencySet(getVis());

	// draw vis on each created canvas according to the currentFrame
	let currentFrame = getCurrentFrame();
	if (MOVE) {
		let FLIP = getClickableDivStatus("flip");
		if(FLIP){
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : reDraw(undefined, undefined, undefined, undefined, FLIP);
		}
		if(!FLIP) {
			myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : reDraw();
		}
	}

	if(!MOVE) {
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);		
	}

	updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn"); 
});

$("#reset_colorHistory").on("click", function() { resetColorHistory(); updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn"); });
$("#reset_transparencyHistory").on("click", function() { resetTransparencyHistory(); updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn"); });

$("#reset_moveHorizontal").on("click", function() {
	resetMoveHorizontal();
	// remove positionSlider_clicked for horizontal ones
	$('div[name="horizontalSlider"]').get().forEach( (x) => {if($(x).hasClass("positionSlider_clicked")) {$(x).removeClass("positionSlider_clicked");} } );

	// Draw vis on each created canvas according to the swimming pool position
	if (!MOVE) {
		let currentFrame = getCurrentFrame();
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);	
	}

	updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn"); 
});

$("#reset_moveVertical").on("click", function() {
	resetMoveVertical();
	// remove positionSlider_clicked for vertical ones
	$('div[name="verticalSlider"]').get().forEach( (x) => {if($(x).hasClass("positionSlider_clicked")) {$(x).removeClass("positionSlider_clicked");} } );

	// Draw vis on each created canvas according to the swimming pool position
	if (!MOVE) {
		let currentFrame = getCurrentFrame();
		let clickedBlocks = getClickedEdges();
		reDraw(undefined, myData[currentFrame], undefined, clickedBlocks);		
	}

	updateDataSnapshots(); updateRedux(); invokeFootButton("undoBtn", "redoBtn", "addBtn"); 
});
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
	let top = tb;
	// coordinate the left for each canvas, should just near controllers
	// let left = DIV_CONTROLLERS_WIDTH + vRL;
	let left = vRL;

	// i: all lanes, from 1-8
	// j: obj index => visible lanes
	for (let i=1, j=0; i<=lanes; i++){
		let myCvs = createCanvas2D($("#videovis"), vis+"_"+i, cvsW, gap);
		coordinateCanvas( myCvs.cvs, top, left);

		// visible ones
		if( i == parseInt($(obj[j]).val()) ) {
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

// NOT USE
// which data category is selected: return string
function getDataItem() {
	return $("#dataCategory_selector").find(":selected").val();
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
									// dx[i] = Math.floor(x_min/halfDistance*laneLength) + sx;
									dx[i] = 0;
									break;
								case "rightEdge":
									// dx[i] = Math.floor(x_max/halfDistance*laneLength) + sx;
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
function reDrawLayer(args) {
	let myVisualizations = getVisualizations();
	let myVis = getVis();

	myVisualizations.forEach( (x) => {
		let vis = this[x];
		let predefined_h = parseFloat(vis.h), predefined_w = parseFloat(vis.w);

		if ( x == myVis ) {
			return;
		}

		if( x != myVis ) {
			// for representations as layers: get all properties from redux.myVisualizations.archives
			let myArchives = reduxStatusGroup[x]["archives"];
			let myLastPointer = myArchives.length-1;

			// checked lanes
			let checkedLanes = myArchives[myLastPointer]["lane_selector"]; // array of lane value = [1, 2, 3, .., 7, 8]

			// MOVE
			let myMOVE = myArchives[myLastPointer]["MOVE"];

			// when MOVE: FLIP, (x,y) shift distance
			let myFLIP = myArchives[myLastPointer]["FLIP"];
			let shift_x = myArchives[myLastPointer]["horizontal"][2], shift_y = myArchives[myLastPointer]["vertical"][2];

			// when !MOVE: leftRight, topBottom shift distance, align, edge and STOPPOS
			let shift_lr = myArchives[myLastPointer]["leftRight"][2], shift_tb = myArchives[myLastPointer]["topBottom"][2];
			let myALIGN = myArchives[myLastPointer]["ALIGN"], myEdge = myArchives[myLastPointer]["edgeNames"];
			let mySTOPPOS = myArchives[myLastPointer]["STOPPOS"]; 
			
			// representation's deformation
			let delta_h = myArchives[myLastPointer]["heightSlider"][2], delta_w = myArchives[myLastPointer]["widthSlider"][2], r = myArchives[myLastPointer]["rotationRadius"];
			
			// image or shape, color or transparency
			let myIMAGE = myArchives[myLastPointer]["IMAGE"], myCOLOR = myArchives[myLastPointer]["COLOR_PICKER"], myTRANSPARENCY = myArchives[myLastPointer]["TRANSPARENCY"];
			// color/transparency codes
			let myColorCodes = myArchives[myLastPointer]["color_set_block_codes"], myTransparencyCodes = myArchives[myLastPointer]["transparency_set_block_codes"];

			// final width and height used to draw
			let w = Math.floor(predefined_w + delta_w), h = Math.floor(predefined_h + delta_h);
			// final (x, y) position used to draw: same y for 8 lanes, different dx according to swimmer
			let dx = [], dy;

			// prepare the x_max && x_min for myALIGN / myEdge cases
			let x_array = [], x_max, x_min, leftDrift, rightDrift;
			if(!myMOVE) {
				if(mySTOPPOS) {
					for(let i=0; i<laneCount; i++) {
						switch(x) {
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
				let myCvs = $("#"+x+"_"+checkedLanes[i]);
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
							switch(x) {
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
							switch(x) {
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
							switch(x) {
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

							if(myEdge) {
								myEdge.forEach( (e) => {
									switch (e) {								
										case "leftEdge":
											switch(x) {
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
											switch(x) {
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
						(myEdge && myEdge.length > 0) ? vis.draw(myCtx, dx[mySwimmerId], dy, w, h, myColorCodes, args[mySwimmerId], myEdge, x, mySwimmerId) : vis.draw(myCtx, dx[mySwimmerId], dy, w, h, myColorCodes, args[mySwimmerId], undefined, x, mySwimmerId);
					}
				} 
			}	
		}
	});
}

/* --------------------- display/hide controllers ---------------------*/
// @ record == true: hide
// @ swimmer == true: hide
// in most cases, swimmer and record should be hidden: swimmer && record == true
function hideSelectors(record, swimmer){
	if(!swimmer) {
		// display the swimmer selector
		$("#swimmer").removeAttr("hidden");
		// keep other sub-selector being hidden
		$("#record").attr("hidden", "hidden");
	}

	if(!record) {
		// display the record selector
		$("#record").removeAttr("hidden");
		// keep other sub-selector being hidden
		$("#swimmer").attr("hidden", "hidden");
	}

	if(swimmer && record) {
		// hide them all
		$("#record").attr("hidden", "hidden");
		$("#swimmer").attr("hidden", "hidden");
	}
}

// @ flag == true: :display
function displayDataItemSelector(flag) {
	if(flag) {
		$("#data_category").removeAttr("hidden");
	}

	if(!flag) {
		$("#data_category").attr("hidden", "hidden");
	}
}

// @ flag == true: display
function displayVisSelector(flag) {
	if(flag) {
		$("#vis").removeAttr("hidden");
	}

	if(!flag) {
		$("#vis").attr("hidden", "hidden");
	}
}

// @ flag == true: display
function displayLaneSelectors(flag) {
	if(flag) {
		$("#target_lane").removeAttr("hidden");
	}

	if(!flag) {
		$("#target_lane").attr("hidden", "hidden");
	}
}

// @ flag == true: display
function displayZoomSlider(flag) {
	if (flag) {
			$("#zoomInOut").removeAttr("hidden");
	}

	if (!flag) {
			$("#zoomInOut").attr("hidden", "hidden");
	}
}

// @ flag == true: display
function displayRotationSlider(flag) {
	if (flag) {
			$("#rotation").removeAttr("hidden");
	}

	if (!flag) {
			$("#rotation").attr("hidden", "hidden");
	}
}

// @ flag == true: display
function displayColorPicker(flag) {
	if (flag) {
		$("#color").removeAttr("hidden");
	}

	if (!flag) {
		$("#color").attr("hidden", "hidden");
	}
}

// @ flag == true: display
function displayTransparencySelector(flag) {
	if (flag) {
		$("#transparency").removeAttr("hidden");
	}

	if (!flag) {
		$("#transparency").attr("hidden", "hidden");
	}
}

// @ flag == true: display
function displayMovementSelector(flag) {
	if (flag) {
		$("#movementStatus").removeAttr("hidden");
	}

	if (!flag) {
		$("#movementStatus").attr("hidden", "hidden");
	}
}

// @ flag == true: move => display distance sliders between vis & visualization 
// @ flag == false: static => display position sliders between vis & swimming pool
// @ flag == "none": hide both 
function displayMoveSubController(flag) {
	if (flag == true) {
		$("#visDistancetoSwimmer").removeAttr("hidden");
		$("#moveSubControllers").attr("hidden", "hidden");
	}

	if (flag == false) {
		$("#moveSubControllers").removeAttr("hidden");
		$("#visDistancetoSwimmer").attr("hidden", "hidden");
	}

	if(flag == "none") {
		$("#visDistancetoSwimmer").attr("hidden", "hidden");
		$("#moveSubControllers").attr("hidden", "hidden");
	}
}

// @ flag == true: display
function displayTitles(flag) {
	if (flag) {
		$("#representationPositionTitle").removeAttr("hidden");
		$("#representationDesignTitle").removeAttr("hidden");
	}

	if (!flag) {
		$("#representationPositionTitle").attr("hidden", "hidden");
		$("#representationDesignTitle").attr("hidden", "hidden");
	}
}

/* --------------------- set controllers ---------------------*/
// set position sliders range
// @ lengthRange == laneLength: vis may be cut half when moving it to the two edges
// @ lengthRange == laneLength-visWidth: vis stops at edges
function setHorizontal(visWidth) {
	$("#horizontal").attr("min", -laneLength);
	$("#horizontal").attr("max", laneLength);
}

function setVertical(visHeight){
	$("#vertical").attr( "min", -laneWidth );
	$("#vertical").attr( "max", laneWidth );
}

function setHeight(visHeight) {
	$("#heightSlider").attr("min", -visHeight);
	$("#heightSlider").attr("max", visHeight);
}

function setWidth(visWidth) {
	$("#widthSlider").attr("min", -visWidth);
	$("#widthSlider").attr("max", visWidth);
}

function setSizeLable(string) {
	if(string == "shape") {
		$("#sizeLabel_1").html("Height");
		$("#sizeLabel_2").html("Width");
	}
	if(string == "text") {
		$("#sizeLabel_1").html("Stroke weight");
		$("#sizeLabel_2").html("Font size");
	}
}

// set move sub horizontal range: when visualization is attached on the swimming pool, without link to swimmers
function setMoveHorizontal(visWidth) {
	$("#moveHorizontalSlider").attr("min", -laneLength );
	$("#moveHorizontalSlider").attr("max", laneLength );

	// $("#moveHorizontalSlider").attr("min", -(laneLength-visWidth) );
	// $("#moveHorizontalSlider").attr("max", (laneLength-visWidth) );
}

// set move sub vertical range: when visualization is attached on the swimming pool, without link to swimmers
function setMoveVertical(visHeight) {
	$("#moveVerticalSlider").attr("min", -laneWidth );
	$("#moveVerticalSlider").attr("max", laneWidth );

	// $("#moveVerticalSlider").attr("min", -(laneWidth-visHeight) );
	// $("#moveVerticalSlider").attr("max", (laneWidth-visHeight) );
}

function setSelectedSwimmer(value) {
	$("#swimmer_selector").removeAttr("selected").val(value);
}

function setSelectedRecord(value) {
	$("#record_selector").removeAttr("selected").val(value);
}

/* --------------------- reset controllers ---------------------*/
// reset data item selector
// default option: "--Please select an option--" 
function resetDataItem() {
	$("#dataCategory_selector").removeAttr("selected")
							   .val("default");
}

// reset record selector
// default option: "world" & "lane1" 
function resetRecordSelector() {
	$("#record_selector").removeAttr("selected").val("world");
}

function resetSwimmerSelector() {
	$("#swimmer_selector").removeAttr("selected").val("lane1");
}

// reset vis selector: clearCanvas()

// reset lanes selector
// default: all checked
function resetLaneSelector(){
	$('input[name="lane_selector"]').each( (index, ele) => {
		$(ele).prop("checked", true);
	});
}

// reset position/zoom/rotation slider
// dafault: value == 0
function resetHorizontalPosition() {
	// reset the value == 0
	$("#horizontal").val("0");
	// also reset the layout of slider
	$("#horizontal").css("background", `linear-gradient(to right, #DEE2E6 0% 100%)`);
}

function resetVerticalPosition() {
	$("#vertical").val("0");
	$("#vertical").css("background", `linear-gradient(to right, #DEE2E6 0% 100%)`);
}

function resetHeightSlider() {
	$("#heightSlider").val("0");
	$("#heightSlider").css("background", `linear-gradient(to right, #DEE2E6 0% 100%)`);
}

function resetWidthSlider() {
	$("#widthSlider").val("0");
	$("#widthSlider").css("background", `linear-gradient(to right, #DEE2E6 0% 100%)`);
}

function resetRotationSlider() {
	$("#rotationSlider").val("0");
	$("#rotationSlider").css("background", `linear-gradient(to right, #DEE2E6 0% 100%)`);
}

function resetColorSet(visualization){
	$("#color_set div").remove();
	$("#transparency_slider").val(1);
	if(visualization) {
		createColorPalette(visualization);
	}	
}

function resetColorHistory(){
	$("#color_history div").remove();
	divColorHistory=0;
}

function resetTransparencySet(visualization){
	$("#transparency_set div").remove();
	$("#transparency_slider_2").val(1);
	if(visualization) {
		createTransparencyPalette(visualization);
	}
}

function resetTransparencyHistory(){
	$("#transparency_history div").remove();
	divTransparencyHistory=0;
}

// reset movement status
// default: move (true)
function resetMovementStatus(){
	$("#moving").prop("checked", true);
}

// check if the vis should be moved
// return value is an array with 2 parameters:
// 1st parameter - shouldMove flag, true => move while false => not move
// 2nd parameter - validate data for currentFrame, true => has data while undefined => no useful data
function shouldMove(){
	let currentFrame = Math.floor(parseFloat(myVideo.currentTime)/duration_per_frame);

	if( $('input[name="movement_selector"]:checked').val() == "on" ) {
		return myData[currentFrame] ? [true, myData[currentFrame]] : [true, undefined]; 
	} else {
		return myData[currentFrame] ? [false, myData[currentFrame]] : [false, undefined]; 
	}
}

// reset move sub align button
function resetAlignButton() {
	$("#alignButton").prop("checked", false);
}

// reset move sub horizontal
function resetMoveHorizontal() {
	$("#moveHorizontalSlider").val("0");
	$("#moveHorizontalSlider").css("background", `linear-gradient(to right, #DEE2E6 0% 100%)`);
}

// reset move sub vertical
function resetMoveVertical() {
	$("#moveVerticalSlider").val("0");
	$("#moveVerticalSlider").css("background", `linear-gradient(to right, #DEE2E6 0% 100%)`);
}

// reset move sub edge buttons
function resetEdgeBtn() {
	let blocks = $(".edge_redraw").get();
	blocks.forEach( (x) => { $(x).removeClass("positionSlider_clicked"); });
}

// reset flip button
function resetFlipButton() {
	$("#flip_horizontal").removeClass("flipBtn_clicked");
}

// reset lock button
function resetLockButton() {
	$("#img_lock").addClass("img_lock_clicked");
}

/* --------------------- undo controllers ---------------------*/
// reset slider's label, threshold, and value
function undoHorizontal(arr) {
	$("#horizontalLabel_1").text(arr[0]);
	$("#horizontal").attr("min", arr[1]);
	$("#horizontal").val(arr[2]);
	$("#horizontal").attr("max", arr[3]);
	$("#horizontalLabel_2").text(arr[4]);
}

function undoVertical(arr) {
	$("#verticalLabel_1").text(arr[0]);
	$("#vertical").attr("min", arr[1]);
	$("#vertical").val(arr[2]);
	$("#vertical").attr("max", arr[3]);
	$("#verticalLabel_2").text(arr[4]);
}

function undoMoveHorizontal(arr) {
	$("#leftEdge").text(arr[0]);
	$("#moveHorizontalSlider").attr("min", arr[1]);
	$("#moveHorizontalSlider").val(arr[2]);
	$("#moveHorizontalSlider").attr("max", arr[3]);
	$("#rightEdge").text(arr[4]);
}

function undoMoveVertical(arr) {
	$("#topEdge").text(arr[0]);
	$("#moveVerticalSlider").attr("min", arr[1]);
	$("#moveVerticalSlider").val(arr[2]);
	$("#moveVerticalSlider").attr("max", arr[3]);
	$("#bottomEdge").text(arr[4]);
}

function undoHeightSlider(arr) {
	$("#sizeLabel_1").text(arr[0]);
	$("#heightSlider").attr("min", arr[1]);
	$("#heightSlider").val(arr[2]);
	$("#heightSlider").attr("max", arr[3]);
}

function undoWidthSlider(arr) {
	$("#sizeLabel_2").text(arr[0]);
	$("#widthSlider").attr("min", arr[1]);
	$("#widthSlider").val(arr[2]);
	$("#widthSlider").attr("max", arr[3]);
}

function undoRotationSlider(arr) {
	$("#rotationLabel_1").text(arr[0]);
	$("#rotationSlider").attr("min", arr[1]);
	$("#rotationSlider").val(arr[2]);
	$("#rotationSlider").attr("max", arr[3]);
	$("#rotationLabel_2").text(arr[4]);
}

// check flip button
function undoFlipButton(boolean) {
	boolean ? $("#flip_horizontal").addClass("flipBtn_clicked") : $("#flip_horizontal").removeClass("flipBtn_clicked");
}

// check lock button
function undoLockButton(boolean) {
	boolean ? $("#img_lock").addClass("img_lock_clicked") : $("#img_lock").removeClass("img_lock_clicked");
}

// check edge button
function undoEdgeButtons(arr) {
	let myBtns = $(".edge_redraw").get();
	for(let i=0; i<myBtns.length; i++) {
		// if the edge button should be pressed
		arr[i] ? $(myBtns[i]).addClass("positionSlider_clicked") : $(myBtns[i]).removeClass("positionSlider_clicked");	
	}
}

// set switch buttons
function undoSwitchButtons(id, boolean) {
	$("#" + id).prop("checked", boolean);
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

myVideo.addEventListener("loadedmetadata", function(){
	// try to make the video starts time at the race beginning
	this.currentTime = raceStartTime;
	// this.currentTime = participantFrame;

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
			// reDraw() takes care of the visualization which is currently working on but not being added as a layer
			if (MOVE) {
				let FLIP = getClickableDivStatus("flip");
				if(FLIP){
					myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, undefined, FLIP) : true;
				}
				if(!FLIP) {
					myData[currentFrame] ? reDraw(undefined, myData[currentFrame]) : true;
				}
			}
			if(!MOVE) {
				let clickedBlocks = getClickedEdges();
				myData[currentFrame] ? reDraw(undefined, myData[currentFrame], undefined, clickedBlocks) : true;
			}

			// reDrawLayer() takes care about the visualizations that have already been added as layers
			// static one will stay on the layer at their position, but, should use the current frame data
			reDrawLayer(myData[currentFrame]);
			// go to next rendering
			count--;
		}
	},20);	
}, false);

/* --------------------- layer section ---------------------*/
// variable to record which vis layer should be removed: clear after confirming delete 
var layerToDelete;
// a group of key-value pairs to match the VIS with dataItem value
const visDataItemMapping = {
	// meta-data
	nationalFlags : "nationality", nationalText : "nationality", nameText : "name", ageText : "age",
	// time-related
	lapDifferencesRecordText : "time_differences_record", lapDifferencesRecordBarChart : "time_differences_record", lapDifferencesRecordGlyph : "time_differences_record", 
	lapDifferencesSwimmerText : "time_differences_swimmer", lapDifferencesSwimmerBarChart : "time_differences_swimmer", lapDifferencesSwimmerGlyph : "time_differences_swimmer",
	elapsedText : "elapsed", elapsedTimer : "elapsed", elapsedProgressBar : "elapsed", 
	currentLapText : "current_lap", currentLapBarChart : "current_lap", 
	averageLapText : "average_lap", 
	// speed-related
	currentSpeedText : "current_speed", currentSpeedBarChart : "current_speed", currentSpeedCircularSector : "current_speed", 
	accelerationText : "acceleration", accelerationBarChart : "acceleration", accelerationCircularSector : "acceleration", accelerationGlyph : "acceleration",
	speedDifferencesRecordText : "speed_differences_record", speedDifferencesRecordGlyph : "speed_differences_record", speedDifferencesRecordBarChart : "speed_differences_record",
	speedDifferencesSwimmerText : "speed_differences_swimmer", speedDifferencesSwimmerGlyph: "speed_differences_swimmer", speedDifferencesSwimmerBarChart: "speed_differences_swimmer", 
	averageSpeedText: "average_speed", speedHistoryLineChart: "speed_history", 
	// position-related:
	positionDifferencesRecordText: "position_differences_record", speedDifferencesRecordLine : "position_differences_record", 
	positionDifferencesSwimmerText: "position_differences_swimmer", speedDifferencesSwimmerLine: "position_differences_swimmer",
	// distance-related:
	distanceSwamText : "distance_swam", distanceSwamBarChart : "distance_swam", 
	remainingDistanceText : "remaining_distance", remainingDistanceBarChart : "remaining_distance", 
	distanceDifferencesLeaderText : "distance_differences_leader", distanceDifferencesLeaderLine : "distance_differences_leader", distanceDifferencesLeaderArrow : "distance_differences_leader",
	// records
	worldRecordText : "world_record", worldRecordLine : "world_record",
	olympicsRecordText : "olympics_record", olympicsRecordLine : "olympics_record",
	nationalRecordText : "national_record", nationalRecordLine : "national_record",
	personalRecordText : "personal_record", personalRecordLine : "personal_record",
	// predictions
	winnerText : "winner", winnerGlyph : "winner", nextPassingText : "next_passing", nextPassingGlyph : "next_passing",
	estimatedCompletionTimeText : "estimated_completion_time", estimatedCompletionTimeBarChart : "estimated_completion_time",
	recordBreakGlyph : "record_break",
	// techniques
	reactionTimeText : "reaction_time",
	divingDistanceText : "diving_distance", divingDistanceLine : "diving_distance", divingDistanceArrow : "diving_distance",
	distanceStrokeText : "stroke_distance", distanceStrokeLine : "stroke_distance", distanceStrokeArrow: "stroke_distance", distanceStrokeBarChart : "stroke_distance",
	strokeCountText : "stroke_count", strokeCountBarChart : "stroke_count",
}

// create layer div per representation 
function createLayerDiv(data, vis) {
	$("#layerGroups").prepend(`<div class = "myLayerDiv"  name = "myLayerDivs" id = "myLayerDiv_${vis}">
							  	<div class = "moveImgDiv" name = "moveImgDivs" id = "moveImgDiv_${vis}" title="Drag and drop to switch the order with other layers." style = "float: left;">
							  		<img class = "moveImg" name = "myMoveIcon" id = "moveImg_${vis}">
							  	</div>
							  	<div class = "myLayerBox" id = "myLayerBox_${vis}"><span class = "myLayerBoxWords title6" id = "myLayerBoxWords_${vis}" title = "Click to work on it. Double click to rename it.">${vis}</span></div>
							  	<div class = "myLayerVisible" title="Click to let this layer invisibly." id = "myLayerVisible_${vis}">
									<img class = "visibleImg" id = "visibleImg_${vis}">
								</div>
								<div class = "myLayerRemove" title="Click to delete this layer." id = "myLayerRemove_${vis}">
									<img class = "removeImg" id = "removeImg_${vis}">
								</div>
							   </div>`
						     );
}

// get all layers => return list of objects
// to access vis id: $("#"" + RETURN_VALUE[i]).attr("id").split("_")[1]
function getLayers() {
	return $(".myLayerDiv").get();
}

// when click on the visible/invisible button: 1) let the layer visible/invisible, 2) toggle visible icon
$(document).on("click", ".myLayerVisible", function() {
	let id = $(this).prop("id");
	let myVis = id.split("_")[1];

	let old_VISIBALE = $(`#visibleImg_${myVis}`).hasClass("visibleImg"); 
	old_VISIBALE ? $(`#visibleImg_${myVis}`).removeClass("visibleImg").addClass("invisibleImg") : $(`#visibleImg_${myVis}`).removeClass("invisibleImg").addClass("visibleImg");
	let new_VISIBALE = $(`#visibleImg_${myVis}`).hasClass("visibleImg"); 

	new_VISIBALE ? $(this).attr("title", "Click to let this layer invisibly.") : $(this).attr("title", "Click to let this layer visibly.")

	$("." + myVis).get().forEach( (x) => {
		new_VISIBALE ? $(x).removeAttr("hidden") : $(x).attr("hidden", "hidden");
		new_VISIBALE ? $(x).removeClass("invisible").addClass("visible") : $(x).removeClass("visible").addClass("invisible");		
	});
});

// when click on the remove button: 1) display the confirmation dialog box, 2) record the VIS that might should be deleted
$(document).on("click", ".myLayerRemove", function() {
	$("#deleteConfirmation").removeAttr("hidden");
	layerToDelete = $(this).prop("id").split("_")[1];
});
// sub buttons under remove confirmation dialog box: 
// 1) cancel => hide the confirmation dialog box
$("#cancelDeleteBtn").on("click", function() {
	$("#deleteConfirmation").attr("hidden", "hidden");
});
// 2) delete => remove the layer div, remove canvas, reactive addbtn
// If the current deleted layer is under control, call the last data snapshot and draw it on screen 
$("#confirmDeleteBtn").on("click", function() {
	$("#deleteConfirmation").attr("hidden", "hidden");
 	$(`#myLayerDiv_${layerToDelete}`).remove();
 	$("." + layerToDelete).remove();

 	// is this vis the one currently under control?
 	let myVis = getVis();
 	if(layerToDelete == myVis) {
 		undoRedo();
 		activeFootButton("addBtn", true);
 	}
 	layerToDelete = undefined;

 	let layersContainer = document.getElementById("layerGroups");
 	let list = document.getElementsByName("myLayerDivs");
 	let listFirst = list[0].offsetTop;
 	let listHeight = list[0].offsetHeight;

 	let myIcons = document.getElementsByName("myMoveIcon");
 	for(let i=0; i<myIcons.length; i++) {
		drag(myIcons[i], list[i], layersContainer, list, listFirst, listHeight);
 	}
});

// when click on the name label: 
// 1) dataCategory_selector: select data item, render UI, trigger "change" event
// 2) visBtn: check vis, trigger "change" event
$(document).on("click", ".myLayerBoxWords", function(){
	let id = $(this).prop("id");
	let myVis = id.split("_")[1];

	$(`#dataCategory_selector option[value=${visDataItemMapping[myVis]}]`).prop("selected", true);	
	$("#dataCategory_selector").select2(options);
	$('.select2-container--default .select2-selection--single').css({'height': '100%'});
	$("#dataCategory_selector").trigger("change");

	$(`input[name="visBtn"][value=${myVis}]`).prop("checked",true);
	$('input[name="visBtn"]').trigger("change");
});

// drag and drop to modify the layer's order
function drag(icon, obj, ul, li, liFirst, liHeight) {
    icon.onmousedown = function(ev) {
	    var ev = ev || event;
	   
	    var blank = document.createElement('div');
	    ul.insertBefore(blank,obj.nextSibling);
	    // blank.style.visibility = 'hidden';
	   
	    obj.style.left = obj.offsetLeft + 'px';
	    obj.style.top = obj.offsetTop + 'px';
	    obj.style.position = "absolute";
	    obj.style.zIndex = '1000';
	    obj.style.background = '#d3d3d3';
        obj.style.border = '2px dashed #3C6CA8';
	  
	    var disX = ev.clientX - obj.offsetLeft;
	    var disY = ev.clientY - obj.offsetTop;

	    document.onmousemove = function(ev) {
	        var ev = ev || event;
	        var L = ev.clientX - disX;
	        var T = ev.clientY - disY;

	        var n = Math.round((T-liFirst)/liHeight);
	        ul.insertBefore(blank, li[n]);

	        obj.style.left = L + 'px';
	        obj.style.top = T + 'px';
	    };
	    document.onmouseup = function() {
	        ul.insertBefore(obj, blank);
	        obj.removeAttribute('style');
	        ul.removeChild(blank);
	        document.onmousemove = null;

	        // get the current order of layers
			let myLayers = getLayers();

			for(let i=0; i<myLayers.length; i++) {
				let myVis = $(myLayers[i]).attr("id").split("_")[1];
				// update the layers' order
				$("." + myVis).css("z-index", parseInt(myLayers.length-i));
			}

	    };
	    return false;
	};
	
		
	
}

// double-click to rename the layer
$(document).on("dblclick", ".myLayerBoxWords", function() {
	// get the current text
	let oldText = $(this).text();

	// create input area
	let myInput = document.createElement("input");
	// let the input value = oldText
	myInput.value = oldText;
	myInput.onblur = function() {
		let newText = this.value;
		this.parentNode.innerHTML = newText;
	}
	this.innerHTML = "";
	this.appendChild(myInput);
	myInput.focus();

	// confirm by pressing enter
	myInput.onkeypress = function(e) {
		if(e.which == 13 ) {
			myInput.blur();
		}
	}	
});

/* --------------------- listen to actions flow section ---------------------*/
$(document).click(function(event) {
	let ele = $(event.target).attr("id");

	// record actions
	let measurements = {};
	measurements["participantId"] = participantId;
	measurements["designVersion"] = completeTime;
	measurements["elementId"] = ele;
	measurements["videoCurrentTime"] = myVideo.currentTime;
	measurements["currentFrameId"] = getCurrentFrame();

	if(myVideo.paused) {
		measurements["videoPlayStatus"] = "pause";
	} else {
		measurements["videoPlayStatus"] = "play";
	}

	$.ajax({
		url: '/SwimFlow/ajax/actions_flow.php',
		type: 'POST',
		data: JSON.stringify(measurements),
		contentType: 'application/json',
		async: false,
	});	

});



