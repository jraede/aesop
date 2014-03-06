window.Aesop.registerToolType 'h6', 
	tag:
		tagName:'H6'
		propagate:true
	type:'block'
	buttonContent:'h6'
	action:->
		if !@active
			@editor.$insertBlock('H6')