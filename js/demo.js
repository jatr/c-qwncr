/*global $:true, cq:true, console:true */

// Simple sequencing demo.
$(function (){	
	
	(function animTest () {
		var box,
			btn,
			TRANSITION_DURATION = 750;
			
		box = $('#box');
		btn = $('button');
		btn.click(function () {
			cq.start('box.move');
		});
		
		cq.save('box.move', function (sequenceName) {
			box
				.animate({
					'left': '+=200'
				}, {
					'duration': TRANSITION_DURATION
				})
				.animate({
					'left': 0
				}, {
					'duration': TRANSITION_DURATION,
					'complete': function () {
						cq.end(sequenceName);
					}
				});
		});
		
	} ());
	
});
