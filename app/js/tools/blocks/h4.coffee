window.Aesop.registerToolType 'h4', 
	tag:
		tagName:'H4'
		propagate:true
	type:'block'
	buttonContent:'h4'
	action:->
		if !@active
			@editor.$insertBlock('H4')