/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Togo Model
	// ----------

	// Our basic **Togo** model has `location`, `near`, `destination`, 'fare', and 'distance' attributes.
	var Togo = Backbone.Model.extend({
		// Default attributes for the togo
		defaults: {
			map: {},
			place: {},
			near : 0
		},

		changeMap: function(input) {
			this.set({
				map: input
			})
		},

		changePlace: function(input) {
			this.set({
					place: input
			})
		},

		changeNear: function(input) {
			this.set({
				near: input
			})
		}

	});
	app.togo = new Togo();
})();
