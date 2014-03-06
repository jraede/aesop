window.Aesop.registerToolType 'ol', 
	tag:
		tagName:'OL'
		propagate:true
	type:'list'
	buttonContent:'ol'
	action:->	
		@editor.$execCommand('insertOrderedList')