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

var occurences = [];

for (var i = 0; i < 200; i++) {
	occurences[i] = 0;
}

for (var i = 0; i < 10000; i++) {
	//var index = Math.round(get_tendency_random(37.8, 3, 5));
	//var index = Math.round(get_exponential_random((60 / 37.8)/60));
	var index = Math.round(get_exponential_random(1.9/60));
	//while (index > 38) {
		//index = Math.round(get_exponential_random(1.9/ 60));
	//}
	
	if (index <= 199) { // discard extreme outliers
		occurences[index]++;
	}
}

for (var i = 0; i < 200; i++) {
	console.log(parseInt(occurences[i]));
}