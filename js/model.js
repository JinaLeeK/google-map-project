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
			address: 'test',
			near : 100,
			destination: '',
			fare : 0,
			distance: 0
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
