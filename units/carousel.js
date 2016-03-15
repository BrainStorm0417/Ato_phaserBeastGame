$(function() {
	// this will hold the JSON array of all units
	var units;
	// this is which unit is currently selected
	var selectedUnit = 0;
	// Get the units data as an array
	$.getJSON("data.json", function(results) {
		// draw the carousel
		units = results;
		drawCarousel();
		// add an EL for any carousel divs
		// it's important to note that the EL is bound to document on purpose
		// since the events are on dom elements not added at runtime, we have to do this
		$(document).on("click", ".unit-carousel-div", function(e) {
			console.log("clicked");
			selectedUnit = $(e.target).data("id");
			drawCarousel();
		});

	});

	function drawCarousel() {
		clearCarousel();
		// total items in the carousel (needs to be odd)
		var carouselLength = 7;
		// essentially, the amount on each side after you remove the middle
		var modValue = (carouselLength - 1) / 2;
		// start at -mod
		var i = modValue * -1;
		// go until positive mod, should result in carouselLength iterations
		while (i <= modValue) {
			// grabs a spot from the unit array
			var index = Math.abs((units.length + selectedUnit + i) % units.length);
			// add in the div we'll build on
			var unitDiv = document.createElement("div");
			// add the class and data id (index)
			$(unitDiv).addClass("unit-carousel-div");
			$(unitDiv).data("id", index);
			// add in the background images
			$(unitDiv).css("background", "url('../images/frame.png'), url('avatars/" + units[index].name + ".jpg')");
			// add it to the carousel
			$("#carousel").append(unitDiv);
			i++;
		}
	}

	function clearCarousel() {
		// remove all the data from the carousel and that's about it
		$("#carousel").html("");
	}
});
