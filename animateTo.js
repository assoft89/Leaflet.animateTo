/*
---------------------------------------------------------------------------------------
Animated layer Movement. Krogal Dmitrii Vladimirovich C 2019 https://
---------------------------------------------------------------------------------------

MIT license

params:
newPosition			- the new Position as LatLng()
options				- optional options object (optional)
options.duration	- animation duration in ms (default 1000)
options.easing		- easing function from jQuery and/or the jQuery easing plugin (default 'linear')
options.complete	- callback function. Gets called, after the animation has finished
options.pan			- can be 'center', 'inbounds', or null. center keeps layer centered, in bounds keeps it in bounds (default null)

---------------------------------------------------------------------------------------
Seample:
var latlng1 = L.latLng(63.2, 75.44);
map.flyTo(latlng1, 5);
var latlng2 = L.latLng(63.2, 76.445);
var layer = L.marker(latlng1).addTo(map);

layer.animateTo( latlng2, {duration: 5000, pan : 'center', complete : function(){console.log('finish')}})

*/

L.Layer.prototype.animateTo = function(newPosition, options) {
		
		defaultOptions = {
			duration: 1000,
			easing: 'linear',
			complete: null,
			pan: null
		}
		options = options || {};

		// complete missing options
		for (key in defaultOptions) {
			options[key] = options[key] || defaultOptions[key];
		}

		// throw exception if easing function doesn't exist
		if (options.easing != 'linear') {
			if (typeof jQuery == 'undefined' || !jQuery.easing[options.easing]) {
				throw '"' + options.easing + '" easing function doesn\'t exist. Include jQuery and/or the jQuery easing plugin and use the right function name.';
				return;
			}
		}

		// make sure the pan option is valid
		if (options.pan !== null) {
			if (options.pan !== 'center' && options.pan !== 'inbounds') {
				return;
			}
		}

		window.requestAnimationFrame = 
			window.requestAnimationFrame || 
			window.mozRequestAnimationFrame || 
			window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		
		window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

		// save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat/lng in every frame
		this.animateTo_StartPosition_lat = this.getLatLng().lat;
		this.animateTo_StartPosition_lng = this.getLatLng().lng;
		
		var newPosition_lat = newPosition.lat;
		var newPosition_lng = newPosition.lng;
		var newLatLng = new L.latLng(newPosition.lat, newPosition.lng);
		
		if (options.pan === 'center') {
			this._map.flyTo(newLatLng, 9);
			//parent._map.setView(newLatLng, 9, 5);
		}

		if (options.pan === 'inbounds') {
			
			 if (!this._map.getBounds().contains(layer.getLatLng())) {
				 var mapbounds = this._map.getBounds();
				 
				 var s = L.latLngBounds(this._map.getCenter(), this.getLatLng());
				 
				 var corner1 = this._map.getCenter(),
					corner2 = newLatLng,
					bounds = L.latLngBounds(corner1, corner2);

				 this._map.fitBounds(bounds);
			 }
		}

		// crossing the 180° meridian and going the long way around the earth?
		if (Math.abs(newPosition_lng - this.animateTo_StartPosition_lng) > 180) {
			if (newPosition_lng > this.animateTo_StartPosition_lng) {
				newPosition_lng -= 360;
			} else {
				newPosition_lng += 360;
			}
		}

		var animateStep = function(layer, startTime) {
			var ellapsedTime = (new Date()).getTime() - startTime;
			var durationRatio = ellapsedTime / options.duration; // 0 - 1
			var easingDurationRatio = durationRatio;

			// use jQuery easing if it's not linear
			if (options.easing !== 'linear') {
				easingDurationRatio = jQuery.easing[options.easing](durationRatio, ellapsedTime, 0, 1, options.duration);
			}

			if (durationRatio < 1) {
				var deltaPosition = new L.latLng(layer.animateTo_StartPosition_lat + (newPosition_lat - layer.animateTo_StartPosition_lat) * easingDurationRatio,
					layer.animateTo_StartPosition_lng + (newPosition_lng - layer.animateTo_StartPosition_lng) * easingDurationRatio);
				layer.setLatLng(deltaPosition);

				// use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~60 fps
				if (window.requestAnimationFrame) {
					layer.animateTo_animationHandler = window.requestAnimationFrame(function() {
						animateStep(layer, startTime)
					});
				} else {
					layer.animateTo_animationHandler = setTimeout(function() {
						animateStep(layer, startTime)
					}, 17);
				}

			} else {

				layer.setLatLng(newPosition);

				if (typeof options.complete === 'function') {
					options.complete();
				}

			}
		}

		// stop possibly running animation
		if (window.cancelAnimationFrame) {
			window.cancelAnimationFrame(this.animateTo_animationHandler);
		} else {
			clearTimeout(this.animateTo_animationHandler);
		}

		animateStep(this, (new Date()).getTime());
	}
