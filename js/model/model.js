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
			location: '',
			address: '',
			near : 0
		},

		changeLocation: function(input) {
			this.set({
					location: input
			})
		},

		changeAddress: function(input) {
			this.set({
				address: input
			})
		},

		changeNear: function(input) {
			this.set({
				near: input
			})
		}

		// Toggle the `completed` state of this todo item.
		// toggle: function () {
		// 	this.save({
		// 		completed: !this.get('completed')
		// 	});
		// }
	});
	app.togo = new Togo();
})();
