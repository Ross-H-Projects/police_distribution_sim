var simulation = require("./simulation_modified.js");

var array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1];

var best_queue_time_score = Number.POSITIVE_INFINITY;;
var best_workload_score = Number.POSITIVE_INFINITY;
var best_both_score = Number.POSITIVE_INFINITY;

var best_config_according_to_queue_time;
var best_config_according_to_workload;
var best_config_according_to_both;

var score;

//console.log(simulation.run(500000, [2, 4, 5, 4, 4]));
do {  // Must start at lowest permutation
	console.log("trying " + build_distribution(array));
	score = evaluate_report(simulation.run(500000, build_distribution(array)));
	
	best_config_according_to_queue_time = (score[0] < best_queue_time_score) ? array.slice() : best_config_according_to_queue_time;
	best_config_according_to_workload = (score[1] < best_workload_score) ? array.slice() : best_config_according_to_workload;
	best_config_according_to_both = (score[0] + score[1] < best_both_score) ? array.slice() : best_config_according_to_both;
	
	best_queue_time_score = (score[0] < best_queue_time_score) ? score[0] : best_queue_time_score;
	best_workload_score = (score[1] < best_workload_score)  ? score[1] : best_workload_score;
	best_both_score = (score[0] + score[1] < best_both_score) ? score[0] + score[1] : best_both_score;
	
} while (nextPermutation(array));

console.log("best config according to queue time: " + build_distribution(best_config_according_to_queue_time));
console.log("best config according to workload: " + build_distribution(best_config_according_to_workload));
console.log("bets config according to both: " + build_distribution(best_config_according_to_both));

function nextPermutation (array) {
    // Find longest non-increasing suffix
    var i = array.length - 1;
    while (i > 0 && array[i - 1] >= array[i]) {
        i--;
	}
    // Now i is the head index of the suffix
    
    // Are we at the last permutation already?
    if (i <= 0) {
        return false;
	}
    
    // Let array[i - 1] be the pivot
    // Find rightmost element that exceeds the pivot
    var j = array.length - 1;
    while (array[j] <= array[i - 1]) {
        j--;
	}
    // Now the value array[j] will become the new pivot
    // Assertion: j >= i
    
    // Swap the pivot with j
    var temp = array[i - 1];
    array[i - 1] = array[j];
    array[j] = temp;
    
    // Reverse the suffix
    j = array.length - 1;
    while (i < j) {
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        i++;
        j--;
    }
    
    // Successfully computed the next permutation
    return true;
}

function build_distribution (permutation) {
	if (!permutation) {
		return "None found";
	}
	var return_arr = [0, 0, 0, 0, 0];
	var current_index = 0;
	for (var i = 0; i < permutation.length; i++) {
		if (permutation[i] == 1) {
			current_index++;
		} else {
			return_arr[current_index]++;
		}
	}
	return return_arr;
}

function evaluate_report (reports) {
	var scores = [0, 0]; // total average queue wait time, total workload
	
	// computer total average queue wait time
	for (var i = 0; i < reports.length; i++) { 
		scores[0] += reports[i][0];
	}
	
	// compute total workload
	for (var i = 0; i < reports.length; i++) { 
		if (reports[i][4] === 0) { // no cars per district, ie workload info is worthless
			scores[1] = Number.POSITIVE_INFINITY;
			break;
		} else {
			scores[1] += reports[i][3];
		}
	}
	
	return scores;
}