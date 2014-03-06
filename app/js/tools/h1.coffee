window.Aesop.registerToolType 'h1', 
	tag:
		tagName:'H1'
		propagate:true
	type:'block'
	buttonContent:'h1'
	action:->
		@editor.$insertBlock('H1')