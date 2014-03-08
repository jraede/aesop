
module.exports = require(process.env['LINEMAN_MAIN']).config.extend 'files', 
	
	js: 
		vendor: [

			
			"vendor/js/jquery.1.11.0.js",
			"vendor/js/angular.1.2.12.js",
			"vendor/js/underscore.js.js",
			"vendor/js/bootstrap.min.js",
			"vendor/js/rangy.js",
			"vendor/js/underscore.js",
			"vendor/js/beautify_html.js"

		]
		minified: "dist/js/aesop.min.js"
		minifiedWebRelative: "js/aesop.min.js"


	# concat:
	# 	js:
	# 		src: ["<%= files.js.vendor %>", "<%= files.ngtemplates.dest %>", "<%= files.coffee.generated %>", "<%= files.js.app %>"]



	
