var Heap = require("collections/heap");

// some known variables, these are not changed
var district_call_rates = [1.9, 4, 4.75, 4.15, 3.75];
var district_service_times = [37.8, 36.8, 40.7, 40.7, 38.5];

// working memory for simulation
var district_calls_waiting = [[], [], [], [], []]; 
cars_per_district = [];
var working_cars_per_district = [];
var current_time = 0;
var event_queue = new Heap([], null, function (event_a, event_b) { // event queue (priority queue implemented using  min Heap) for simulation
	return event_b["start_time"] - event_a["start_time"];
});

// reporting / statistics variables
var cumulative_queue_time_per_district = [0, 0, 0, 0, 0];
var cumulative_queue_length_per_district = [0, 0, 0, 0, 0];
var total_calls_made_per_district = [0, 0, 0, 0, 0];
var car_utilization = [0, 0, 0, 0, 0];
var event_limit = 0;

function place_call (district_index) {
	// emplace a time for the next call using a computed inter-arrival time
	var inter_arrival_time = get_exponential_random(district_call_rates[district_index] / 60); 
	//var inter_arrival_time = get_tendency_random(parseFloat(60 / district_call_rates[district_index]), 3, 3);
	total_calls_made_per_district[district_index]++;
	var next_call_time = current_time + inter_arrival_time;
	add_event(next_call_time, place_call, district_index, "place_call")
	
	// work out whether to dispatch or to enqueue for the call
	 if (working_cars_per_district[district_index] > 0) { // no need to enqueue call, add dispatch event
		if (district_calls_waiting[district_index].length > 0) { // we still have to take care of calls that have already been made and are waiting
			// do some reporting
			cumulative_queue_time_per_district[district_index] += current_time - district_calls_waiting[district_index][0];
			// alter working memory
			district_calls_waiting[district_index].splice(0,1); // pop the oldest call waiting
		} else { // no other calls have are waiting to be tended to, so we can simply dispatch	
			working_cars_per_district[district_index]--; // take a car from working memory 
		}
		// add another discrete event 
		dispatch_car(district_index);
	} else { // enqueue the call 
		district_calls_waiting[district_index].push(current_time);
	}
}

function dispatch_car (district_index) {
	var avg_call_time = district_service_times[district_index];
	//var possible_call_time = get_tendency_random(avg_call_time, 3, 10);
	var possible_call_time = get_exponential_random((60 / avg_call_time) / 60);
	var start_service_time = current_time + possible_call_time;
	add_event(start_service_time, return_car, district_index, "returncar");
}

function return_car (district_index) {
	if (district_calls_waiting[district_index].length > 0) { // there are still calls to be settled, ie don't return this car to idle / wait state
		// do some data collection for later stat reports
		cumulative_queue_time_per_district[district_index] += current_time - district_calls_waiting[district_index][0];
		// alter working memory
		district_calls_waiting[district_index].splice(0,1); // pop the oldest call waiting
		// add another discrete event 
		dispatch_car(district_index);
	} else {
		working_cars_per_district[district_index]++; // we can return this car to an idle / wait state
	}
}

function add_event (time_start, event, district_index, event_type) {
	event_queue.push({
		"start_time": time_start,
		"hook": event,
		"hook_param": district_index,
		"hook_type": event_type
	});
}

function pop_top_event () {
	var latest_event = event_queue.pop();
	current_time = latest_event["start_time"]
	latest_event["hook"](latest_event["hook_param"]); // execute the latest event
}

function report () {
	// print out reports
	//console.log("Reports: ");
	//for (var i = 0; i < 5; i++) {
		//console.log("District " + i + " average queue wait time: " + (cumulative_queue_time_per_district[i] / total_calls_made_per_district[i]) + " || average call rate: " + (60 / (current_time / total_calls_made_per_district[i])) +  " per hour || average queue length: " + (cumulative_queue_length_per_district[i] / event_limit) + " || average car utilization: " + (100 * car_utilization[i] / event_limit));
	//}
	// build reports
	var reports = [[],[],[],[],[]];
	for (var i = 0; i < 5; i++) {
		reports[i][0] = cumulative_queue_time_per_district[i] / total_calls_made_per_district[i]; // avg queue length
		reports[i][1] = 60 / (current_time / total_calls_made_per_district[i]); // avg call rate
		reports[i][2] = cumulative_queue_length_per_district[i] / event_limit; // avg queue length 
		reports[i][3] = 100 * car_utilization[i] / event_limit; // avg car utilization
		reports[i][4] = cars_per_district[i];
	}
	return reports;
}

function run_sim () {	
	// initially add place call events for each district
	for (var i = 0; i < 5; i++) {
		add_event(get_exponential_random(district_call_rates[i] / 60), place_call, i, "place_call");
		total_calls_made_per_district[i]++;
	}
	var events_processed = 5;
	while (events_processed <= event_limit) {
		pop_top_event();
		// compute car utilization (this needs to be done here and not during an event)
		for (var i = 0; i < 5; i++) {
			if (working_cars_per_district[i] < cars_per_district[i]) { // at-least one car is in use 
				// add percentage of cars being used
				car_utilization[i] += 1 - (working_cars_per_district[i] / cars_per_district[i]);
			}
			cumulative_queue_length_per_district[i] += district_calls_waiting[i].length;
		}	
		events_processed++;
	}
	// add stat data on calls left on the system (over estimate)
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < district_calls_waiting[i].length; j++) {
			cumulative_queue_time_per_district[i] += current_time - district_calls_waiting[i][j];
			//total_calls_made_per_district[i]++;
		}
		//console.log("district " + i + " total queue time: " + cumulative_queue_time_per_district[i] + " total calls made: " + total_calls_made_per_district[i] + " || " + parseFloat(cumulative_queue_time_per_district[i] / total_calls_made_per_district[i]));
		cumulative_queue_length_per_district[i] += district_calls_waiting[i].length;
	}
	return report();
}

exports.run = function (events_to_be_processed, car_distribution) {
	event_limit = events_to_be_processed;
	for (var i =0; i < car_distribution.length; i++) {
		cars_per_district[i] = car_distribution[i];
		working_cars_per_district[i] = car_distribution[i];
	}
	// reset working memory
	current_time = 0;
	district_calls_waiting = [[], [], [], [], []];
	event_queue = new Heap([], null, function (event_a, event_b) {
		return event_b["start_time"] - event_a["start_time"];
	});
	// reset stat variables
	cumulative_queue_time_per_district = [0, 0, 0, 0, 0];
	cumulative_queue_length_per_district = [0, 0, 0, 0, 0];
	total_calls_made_per_district = [0, 0, 0, 0, 0];
	car_utilization = [0, 0, 0, 0, 0];
	
	return run_sim();
}

// random number generators
function get_exponential_random (rate) {
	return -Math.log(Math.random()) / rate;
}

function get_tendency_random (normal, relative_x_pos, focus)	{
	if (!relative_x_pos) {
		relative_x_pos = 3;
	}
	if (!focus) {
		focus = 3;
	}
	var skew =  ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - relative_x_pos) / focus;
	return normal + (normal * skew); 
}