window.Aesop.registerToolType 'p', 
	tag:
		tagName:'P'
		propagate:true
	type:'block'
	buttonContent:'p'
	action:->
		@editor.$insertBlock('P')