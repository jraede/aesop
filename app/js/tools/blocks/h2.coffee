window.Aesop.registerToolType 'h2', 
	tag:
		tagName:'H2'
		propagate:true
	type:'block'
	buttonContent:'h2'
	action:->
		if !@active
			@editor.$insertBlock('H2')