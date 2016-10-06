(function(){

	"use strict";

	//Global City variable that allows for EaselJS to read it and comment.
	var selectedcity = null;
	//Making a cities object for easy reusability, takes in two args for city and state.
	var City = function(cityname,state)
	{
		//Regular Expression checking to prevent silly mistakes! ^_^
		this.name = cityname.replace(/ /g,"_").replace(/(^[a-z]|_[a-z])/g, function (x){return x.toUpperCase();});
		this.state = state;
		this.forecast = [];
		//This calls the WU API for stuff 'bout the weather.
		this.call = function(thing)
		{
			var that = this;
			console.log(this.name);
			thing({
				method:"GET",
				url : "http://api.wunderground.com/api/e9fafc66d36d9e54/geolookup/conditions/forecast10day/q/"+this.state+"/"+this.name+".json"}).then(function successCallback(response)
					{
						console.log(response);
						console.log("Finished loading the data for "+response.data["location"].city+"!");
						that.format(response.data.forecast.simpleforecast.forecastday,response.data.current_observation);
					}, function errorCallback(response)
					{
						console.log("DERP");
					});
		}
		//This is to strip out all the pointless info and do conversions for temps where needed.
		this.format = function(data,current)
		{
			for (var i = 0; i < 5;i++)
			{
				var lazyday;
				if (data[i].date.day == 1)
				{
					 lazyday = data[i].date.monthname_short+" "+"1st";
				}
				else if (data[i].date.day == 2)
				{
					lazyday = data[i].date.monthname_short+" "+"2nd";
				}
				else if (data[i].date.day == 3)
				{
					lazyday = data[i].date.monthname_short+" "+"3rd";
				}
				else
				{
					lazyday = data[i].date.monthname_short+" "+data[i].date.day+"th";
				}
				if (i == 0)
				{
					lazyday = "Today";
				}
				else if (i == 1)
				{
					lazyday = "Tomorrow";
				}
				var obj =
				{
					"date": lazyday,
					"high":
					{
						"fahrenheit":Number(data[i].high.fahrenheit),
						"celsius":Number(data[i].high.celsius),
						"kelvin": Math.round(((Number(data[i].high.fahrenheit) - 32)*5/9)+273.15),
						"rankine":Math.round(Number(data[i].high.fahrenheit)+ 459.67)
					},
					"low":
					{
						"fahrenheit":Number(data[i].low.fahrenheit),
						"celsius":Number(data[i].low.celsius),
						"kelvin": Math.round(((Number(data[i].low.fahrenheit) - 32)*5/9)+273.15),
						"rankine":Math.round(Number(data[i].low.fahrenheit)+ 459.67)
					}
				}
				//Only apply current temp to today.
				if (i == 0)
				{
					obj["current"] =
					{
						"fahrenheit":Math.round(Number(current.temp_f)),
						"celsius":Math.round(Number(current.temp_c)),
						"kelvin": Math.round(((Number(current.temp_f) - 32)*5/9)+273.15),
						"rankine":Math.round(Number(current.temp_f)+ 459.67),
						"weather":current.icon
					}
				}
				this.forecast.push(obj);
			}
			this.ready = true;
		}
	};


	//Angular stuff

	//First off, the router which defines the template for da cities list and the controller.
	var citiesListApp = angular.module("citiesListApp", ['ngRoute'])
	.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){
		$routeProvider.when("/",{
				templateUrl: "partials/citiesthing.html",
				controller: "citiesListController",
			}).when("/about",{
				templateUrl: "partials/about.html",
				css: "css/coolstuff.css",
				controller: "aboutController"
			});
		$locationProvider.html5Mode(true);
	}]);

	//Header Controller
	citiesListApp.controller('headerController',function($scope){
		$scope.options = [['Home','/'],['About','/about']];
	});

	//About Controller. Really dead simple.
	citiesListApp.controller('aboutController', function($scope){
		$scope.message = "Hello, and welcome to the neXt level!\n The name's Joseph Acevedo, and Front-End Development is my game...do. Anyway, this is a simple weather app made with AngularJS, some jQuery for transitions, and EaselJS for all your canvas related needs. The API used to grab the weather is WeatherUnderground's. Also, the cute characters you see walking along the bottom of your screen spouting boring weather stuffs are from the game \"Danganronpa 2: Goodbye Despair\". You should check it out (after you play the first one of course).";
	});
	//Basic Weather Controller
	citiesListApp.controller('citiesListController',function($scope, $http)
	{
		$scope.cities = [];
		var coolPlaces = 
		[
			new City("New York","NY"),
			new City("Chicago","IL"),
			new City("Philadelphia","PA"),
			new City("San Antonio","TX"),
			new City("Phoenix","AZ"),
			new City("Seattle","WA")
		];
		$scope.temps =
		{
			"fahrenheit":"°F",
			"celsius":"°C",
			"kelvin":"°K",
			"rankine":"°R"
		}
		$scope.tempval = 'fahrenheit';
		$scope.selectedindex = 0;
		$scope.onClick = function(obj,valkey,num)
		{
			for (var key in obj)
			{
				console.log(key,obj[key]);
				if (obj[key] === valkey)
				{
					if (num == 0)
					{
						$scope.tempval = key;
						selectedcity.tempval = obj[key]
						animateTemps($('.citytemps'));
					}	
					else
					{
						$scope.selectedindex = key;
						selectedcity = {"city":$scope.cities[key],"index":Number(key),"tempval":$scope.tempval};
						console.log($('.daylist'));
						animateTemps($('.daylist'));
					}
				}
			}
		}
		for (var i = 0; i < coolPlaces.length;i++)
		{
			coolPlaces[i].call($http);
			var place = coolPlaces[i];
			$scope.cities.push({"name":place.name.replace(/_/g," "),"forecast":place.forecast});
		}
		var derp = setInterval(function(){
			if($scope.cities.length > 0)
			{
				animateBegin();
				selectedcity = {"city":$scope.cities[0],"index":0,"tempval":$scope.tempval};
				clearInterval(derp);
			}
		},100);
	});


	//jQuery Stuffs

	function animateBegin()
	{
		$('.citiesplace').each(function (index){
			console.log($(this));
			var that = $(this);
			setTimeout(function (){
				that.animate({
					"opacity":1
				},300);
			},50*(index+1));
		});
		$('#tempsselector').on('hover',function(){
			console.log($(this));
		});
	}

	function animateTemps(element)
	{
		element.each(function(index){
			var that = $(this);
			that.css({
				"opacity":0
			});
			setTimeout(function(){
				that.animate({
					"opacity":1
				},300);	
			},50*(index+1));
			
		});
	}


	//Easel JS stuff for stylish entries! Based on the danganronpa franchise.
	function init()
	{
		$('canvas').attr({
			"height":$(window).height(),
			"width":$(window).width()
		});
		//Initalizing the stage.
		var danganronpa = new createjs.Stage('funtimes');
		//Basic walking surface.
		var graphics = new createjs.Graphics().beginFill("#666666").drawRect(0, 0, $(window).width(), 150);
		var shape = new createjs.Shape(graphics);
		shape.y = $(window).height()-112;

		//Array of the sprites that we're going to be using.
		var hopespeak =
		[
			new createjs.SpriteSheet({
				images:['images/drsprites/hopeman/nagito.png'],
				frames:{width:92,height:92,regX:0,regY:0,count:2},
				animations:
				{
					run:
					{
						frames:[0,1],
						speed:0.5
					}
				}
			}),
			new createjs.SpriteSheet({
				images:['images/drsprites/peko/peko.png'],
				frames:{width:92,height:92,regX:0,regY:0,count:2},
				animations:
				{
					run:
					{
						frames:[0,1],
						speed:0.5
					}
				}
			}),
			new createjs.SpriteSheet({
				images:['images/drsprites/waifu/chiaki.png'],
				frames:{width:92,height:92,regX:0,regY:0,count:2},
				animations:
				{
					run:
					{
						frames:[0,1],
						speed:0.5
					}
				}
			}),
			new createjs.SpriteSheet({
				images:['images/drsprites/pepsi/souda.png'],
				frames:{width:92,height:92,regX:0,regY:0,count:2},
				animations:
				{
					run:
					{
						frames:[0,1],
						speed:0.5
					}
				}
			}),
			new createjs.SpriteSheet({
				images:['images/drsprites/brown/akane.png'],
				frames:{width:92,height:92,regX:0,regY:0,count:2},
				animations:
				{
					run:
					{
						frames:[0,1],
						speed:0.5
					}
				}
			}),
			new createjs.SpriteSheet({
				images:['images/drsprites/brown/hajime.png'],
				frames:{width:92,height:92,regX:0,regY:0,count:2},
				animations:
				{
					run:
					{
						frames:[0,1],
						speed:0.5
					}
				}
			})
		];
		//Empty arrays to push each sprite into.
		var animation = [];
		var truthliness = [];
		for (var i = 0; i < hopespeak.length; i++)
		{
			animation[i] = new createjs.Sprite(hopespeak[i], "run");
    		animation[i].y = $(window).height()-200;
    		animation[i].x = 250*(i+1);
    		truthliness[i] = false;
    		danganronpa.addChild(animation[i]);
		}
    	danganronpa.addChild(shape);
    	
    	createjs.Ticker.addEventListener("tick", function() {
    		//Basic animation.
    		for (var student in animation)
    		{
    			animation[student].x = animatePeoples(animation[student],student);
    			//Tick updates to have the students say something when you select something.
    			if (animation[student].x == 300 && student == selectedcity.index && truthliness[student] == false)
    			{
    				truthliness[student] = true;
    				talkToMe(animation[student],danganronpa,student,truthliness);
    			}
    			if(student != selectedcity.index)
    			{
    				truthliness[student] = false;
    			}
    		}
    		danganronpa.update();
		});
	}
	function talkToMe(student,stage,index,array)
	{
		console.log(selectedcity);
		//Some more regexp to format the text.
		var text = "It is currently "+selectedcity.city.forecast[0].current.weather.replace(/(partly|mostly)/,function(x){ return x+" "})+" in "+selectedcity.city.name+" \nand the current temperature is "+selectedcity.city.forecast[0].current[selectedcity.tempval]+"° "+selectedcity.tempval.replace(/^[a-z]/,function(x){return x.toUpperCase()})+".";
		//Creating new text instance.
		var insert = new createjs.Text(text, "48px DisposableDigi BB", '#ffffff');
		insert.x = student.x + 48;
		insert.y = student.y - 64;
		stage.addChild(insert);
		setTimeout(function(){
			stage.removeChild(insert);
		},5000);
	}

	//Check to see where the student is at, and moves them based on their position and if they're selected.
	function animatePeoples(animation,index)
	{
		if (index != selectedcity.index)
		{
			if (animation.x < $("canvas").width()+100)
			{
				return animation.x + 10;
			}
			else
			{
				return -100;
			}
		}
		else
		{
			if (animation.x > 300)
			{
				return animation.x - 20;
			}
			else if (animation.x < 300)
			{
				return animation.x + 5;
			}
			else
			{
				return animation.x;
			}
		}
	}

	//Doing this because this is all in an IIFE and we want to make sure the page is loaded before we start the jogging MURD- I mean students.
	$(document).ready(function(){

		init();
	});
	
})();