window.Aesop.registerToolType 'p', 
	tag:
		tagName:'P'
		propagate:true
	type:'block'
	buttonContent:'p'
	action:->
		if !@active
			@editor.$insertBlock('P')