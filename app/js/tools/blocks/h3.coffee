window.Aesop.registerToolType 'h3', 
	tag:
		tagName:'H3'
		propagate:true
	type:'block'
	buttonContent:'h3'
	action:->
		if !@active
			@editor.$insertBlock('H3')