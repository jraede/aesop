window.Aesop.registerToolType 'ol', 
	tag:
		tagName:'OL'
		propagate:true
	type:'list'
	buttonContent:'ol'
	action:->
		if @active
			@setActive(false)
		@editor.$execCommand('insertOrderedList')