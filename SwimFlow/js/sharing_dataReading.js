/* --------------------- Read the data from json file ---------------------*/
const file_path_csv = "csv/Tracking data/use/6-leader.csv";
const file_path_json = `design/${jsonId}.json`;

const video_frameRate = 50;
const duration_per_frame = (1/video_frameRate).toFixed(2); // unit => second

var customizedData, reduxStatusGroup;

$.ajax({
	type: 'GET',
	url: file_path_json,
	dataType: 'json',
	async: false,
	success: function(data){
		customizedData = data;
	},
	error: function(e) {
		console.log("Getting json failed");
	}
});


// @ myData => myData[frameId][swimmerId][single data per frame]
// e.g. myData[frameId][swimmerId]["speed"] = XXX
// @ myDataSeries => myDataSeries[swimmerId][dataItemName][an array of objects, filling with pairs of {frameId: value_of_dataItem}]
// e.g. myDataSeries[swimmerId]["currentLap"] = [{683:0}, {684: 6.94444}, {685: 6.94444}, {686: 6.94444} ... ]
// e.g. myDataSeries[swimmerId]["currentLap"][0] = {683:0}
var data_bbox, myData = new Object(), myDataSeries = new Object();


$.ajax({
	type: 'GET',
	url: file_path_csv,
	dataType: 'text',
	async: false,
	success: function(data){
		// typeof(data) => string, convert it to object
		data_bbox = $.csv.toObjects(data);

		// 1 loop to adjust data structure
		for(let i=0; i<data_bbox.length; i++) {
			let myKey = Math.floor(data_bbox[i]["frameId"]), mySubKey = Math.floor(data_bbox[i]["swimmerId"]);

			if (Object.hasOwn(myData, myKey)) {
				myData[myKey][mySubKey] =  {	
												// key
												frameId: data_bbox[i]["frameId"],
												swimmerId: data_bbox[i]["swimmerId"],

												// event and moving direction
												event: data_bbox[i]["event"], // reaction, diving, cycle, turn, finish, and interpolated
												direction: data_bbox[i]["direction"], // advance, return

												// drawing position
												x_left: data_bbox[i]["xa_above"],
												x_right: data_bbox[i]["xb_above"],
												x_middle: data_bbox[i]["x_middle"],
												x_world: data_bbox[i]["x_world"],
												x_olympic: data_bbox[i]["x_olympic"],
												x_personal: data_bbox[i]["x_personal"],
												x_national: data_bbox[i]["x_national"],

												// metadata
												name: data_bbox[i]["name"],
												age: data_bbox[i]["age"],
												nationality: data_bbox[i]["nationality"],
						
												// records
												world: data_bbox[i]["world"],
												world50: data_bbox[i]["world50"],
												world100: data_bbox[i]["world100"],
												olympic: data_bbox[i]["olympic"],
												olympic50: data_bbox[i]["olympic50"],
												olympic100: data_bbox[i]["olympic100"],
												national: data_bbox[i]["national"],
												national50: data_bbox[i]["national50"],
												national100: data_bbox[i]["national100"],
												personal: data_bbox[i]["personal"],
												personal50: data_bbox[i]["personal50"],
												personal100: data_bbox[i]["personal100"],

												// time related
												result: data_bbox[i]["result"],
												resultS: data_bbox[i]["resultS"],
												currentLap: data_bbox[i]["currentLap"],
												currentLap50: data_bbox[i]["currentLap50"],
												currentLap100: data_bbox[i]["currentLap100"],
												averageLap: data_bbox[i]["averageLap"],
												elapsed: data_bbox[i]["elapsed"],

												// speed related
												speed: data_bbox[i]["speed"],
												acceleration: data_bbox[i]["acceleration"],
												averageSpeed: data_bbox[i]["averageSpeed"],
												speed_world: data_bbox[i]["speed_world"],
												speed_olympic: data_bbox[i]["speed_olympic"],
												speed_personal: data_bbox[i]["speed_personal"],
												speed_national: data_bbox[i]["speed_national"],

												// distance related
												distanceSwam: data_bbox[i]["distanceSwam"],
												distanceRemaining: data_bbox[i]["distanceRemaining"],
												distanceToLeader: data_bbox[i]["distanceToLeader"], // positive, unit in meter

												// predictions
												estimatedCompletionTime: data_bbox[i]["estimatedCompletionTime"],
												nextPassing: data_bbox[i]["nextPassing"],
												winner: Math.floor(data_bbox[i]["winner"]).toString(), // 0-7
												currentLeader: Math.floor(data_bbox[i]["currentLeader"]).toString(), // 0-7

												// techniques
												reaction: data_bbox[i]["reaction"],
												diving: data_bbox[i]["diving"],
												strokeCount: data_bbox[i]["strokeCount"],
												strokeDistance: data_bbox[i]["strokeDistance"],

											};

			} else {
				myData[myKey] = {};
				myData[myKey][mySubKey] =  {	
												// key
												frameId: data_bbox[i]["frameId"],
												swimmerId: data_bbox[i]["swimmerId"],

												// event and moving direction
												event: data_bbox[i]["event"],
												direction: data_bbox[i]["direction"],

												// drawing position
												x_left: data_bbox[i]["xa_above"],
												x_right: data_bbox[i]["xb_above"],
												x_middle: data_bbox[i]["x_middle"],
												x_world: data_bbox[i]["x_world"],
												x_olympic: data_bbox[i]["x_olympic"],
												x_personal: data_bbox[i]["x_personal"],
												x_national: data_bbox[i]["x_national"],

												// metadata
												name: data_bbox[i]["name"],
												age: data_bbox[i]["age"],
												nationality: data_bbox[i]["nationality"],
						
												// records
												world: data_bbox[i]["world"],
												world50: data_bbox[i]["world50"],
												world100: data_bbox[i]["world100"],
												olympic: data_bbox[i]["olympic"],
												olympic50: data_bbox[i]["olympic50"],
												olympic100: data_bbox[i]["olympic100"],
												national: data_bbox[i]["national"],
												national50: data_bbox[i]["national50"],
												national100: data_bbox[i]["national100"],
												personal: data_bbox[i]["personal"],
												personal50: data_bbox[i]["personal50"],
												personal100: data_bbox[i]["personal100"],

												// time related
												result: data_bbox[i]["result"],
												resultS: data_bbox[i]["resultS"],
												currentLap: data_bbox[i]["currentLap"],
												currentLap50: data_bbox[i]["currentLap50"],
												currentLap100: data_bbox[i]["currentLap100"],
												averageLap: data_bbox[i]["averageLap"],
												elapsed: data_bbox[i]["elapsed"],

												// speed related
												speed: data_bbox[i]["speed"],
												acceleration: data_bbox[i]["acceleration"],
												averageSpeed: data_bbox[i]["averageSpeed"],
												speed_world: data_bbox[i]["speed_world"],
												speed_olympic: data_bbox[i]["speed_olympic"],
												speed_personal: data_bbox[i]["speed_personal"],
												speed_national: data_bbox[i]["speed_national"],

												// distance related
												distanceSwam: data_bbox[i]["distanceSwam"],
												distanceRemaining: data_bbox[i]["distanceRemaining"],
												distanceToLeader: data_bbox[i]["distanceToLeader"],

												// predictions
												estimatedCompletionTime: data_bbox[i]["estimatedCompletionTime"],
												nextPassing: data_bbox[i]["nextPassing"],
												winner: Math.floor(data_bbox[i]["winner"]).toString(),
												currentLeader: Math.floor(data_bbox[i]["currentLeader"]).toString(),

												// techniques
												reaction: data_bbox[i]["reaction"],
												diving: data_bbox[i]["diving"],
												strokeCount: data_bbox[i]["strokeCount"],
												strokeDistance: data_bbox[i]["strokeDistance"],
											};
			}

			if(Object.hasOwn(myDataSeries, mySubKey)) {
				let myObj_1 = {}, myObj_2 = {}, myObj_3 = {}, myObj_4 = {}, myObj_5 = {}, myObj_6 = {}, myObj_7 = {}, myObj_8 = {};

				myObj_1[myKey] = parseFloat(data_bbox[i]["currentLap"]);				
				myDataSeries[mySubKey]["currentLap"].push(myObj_1);

				myObj_2[myKey] = parseFloat(data_bbox[i]["speed"]);
				myDataSeries[mySubKey]["speed"].push(myObj_2);
				
				myObj_3[myKey] = parseFloat(data_bbox[i]["acceleration"]);
				myDataSeries[mySubKey]["acceleration"].push(myObj_3);

				myObj_4[myKey] = parseFloat(data_bbox[i]["averageSpeed"]);
				myDataSeries[mySubKey]["averageSpeed"].push(myObj_4);

				myObj_5[myKey] = parseFloat(data_bbox[i]["distanceSwam"]);
				myDataSeries[mySubKey]["distanceSwam"].push(myObj_5);

				myObj_6[myKey] = parseFloat(data_bbox[i]["distanceRemaining"]);
				myDataSeries[mySubKey]["distanceRemaining"].push(myObj_6);

				myObj_7[myKey] = parseFloat(data_bbox[i]["estimatedCompletionTime"]);
				myDataSeries[mySubKey]["estimatedCompletionTime"].push(myObj_7);

				myObj_8[data_bbox[i]["event"]] = myKey;
				myDataSeries[mySubKey]["event"].push(myObj_8);

			} else {
				myDataSeries[mySubKey] = {};
				myDataSeries[mySubKey]["currentLap"] = [];
				myDataSeries[mySubKey]["speed"] = [];
				myDataSeries[mySubKey]["acceleration"] = [];
				myDataSeries[mySubKey]["averageSpeed"] = [];
				myDataSeries[mySubKey]["distanceSwam"] = [];
				myDataSeries[mySubKey]["distanceRemaining"] = [];
				myDataSeries[mySubKey]["estimatedCompletionTime"] = [];
				myDataSeries[mySubKey]["event"] = [];

				let myObj_1 = {}, myObj_2 = {}, myObj_3 = {}, myObj_4 = {}, myObj_5 = {}, myObj_6 = {}, myObj_7 = {}, myObj_8 = {};

				myObj_1[myKey] = parseFloat(data_bbox[i]["currentLap"]);				
				myDataSeries[mySubKey]["currentLap"].push(myObj_1);

				myObj_2[myKey] = parseFloat(data_bbox[i]["speed"]);
				myDataSeries[mySubKey]["speed"].push(myObj_2);
				
				myObj_3[myKey] = parseFloat(data_bbox[i]["acceleration"]);
				myDataSeries[mySubKey]["acceleration"].push(myObj_3);

				myObj_4[myKey] = parseFloat(data_bbox[i]["averageSpeed"]);
				myDataSeries[mySubKey]["averageSpeed"].push(myObj_4);

				myObj_5[myKey] = parseFloat(data_bbox[i]["distanceSwam"]);
				myDataSeries[mySubKey]["distanceSwam"].push(myObj_5);

				myObj_6[myKey] = parseFloat(data_bbox[i]["distanceRemaining"]);
				myDataSeries[mySubKey]["distanceRemaining"].push(myObj_6);

				myObj_7[myKey] = parseFloat(data_bbox[i]["estimatedCompletionTime"]);
				myDataSeries[mySubKey]["estimatedCompletionTime"].push(myObj_7);

				myObj_8[data_bbox[i]["event"]] = myKey;
				myDataSeries[mySubKey]["event"].push(myObj_8);
			}
		}
	},
	error: function(e) {
		console.log("Getting file failed.");	
	}
});