## What is this?

This is a discrete event simulator written in javascript, made to be run under Node.js, simulating multiple separate queues. Each queue represents a city district which has it's own arrival rate (citizens calling the police), and service resources (number of police cars per district).

This repo also includes:
* Tests to find optimal distributions of resources (police cars) given finite resources (See "brute force programs"/get_best_for_19_cars.js and "brute force programs"/get_best_for_28_cars.js)
* A Presentation on the construction and usage of the simulator to find optimal results to problems in the case "COPS: Whatcha Gonna do?" [Paper Here](https://dl.acm.org/citation.cfm?id=2875983.2875988). We are essentialy trying to find optimal distribution(s) of finite resources over districts of varying service needs when using criterias such as ***average queue waiting time*** and ***server utilization***.

##### Note
This was originally created for a **business optimization** / **operations research** course undertaken at university in 2017. The code has not been changed since the original implementation but if I get enough time at some point in the future I will push commits to address the short comings listed at the end of the presentation.

### Installation:
```sh
$ npm install
```

### Running the simulation:
To run the simulation for individual scenarios:
```sh
$ cd "brute force programs"
$ node simulation.js 2 4 5 4 4
```

this will run the simulation with the distribution:
* District A: 2 cars,
* District B: 4 cars,
* ...
* District E: 4 cars


To get the exhaustive results i.e. test on all possible distributions
when we have 19 cars to distribute over all districts
```sh 
$ cd "brute force programs" 
$ node get_best_for_19_cars.js
or
$ node get_best_for_28_cars.js
```


