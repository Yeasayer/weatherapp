	function init()
	{
		$('canvas').attr({
			"height":$(window).height(),
			"width":$(window).width()
		});
		var danganronpa = new createjs.Stage('funtimes');
		console.log(danganronpa);
		var NagitoKomeda = new createjs.SpriteSheet({
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
		});
    	var animation = new createjs.Sprite(NagitoKomeda, "run");
    	animation.y = $(window).height()-200;
    	console.log(NagitoKomeda,animation);
    	danganronpa.addChild(animation);
    	createjs.Ticker.addEventListener("tick", function() {
    		danganronpa.update();
		});
	}