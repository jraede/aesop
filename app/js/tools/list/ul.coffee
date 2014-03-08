window.Aesop.registerToolType 'ul', 
	tag:
		tagName:'UL'
		propagate:true
	type:'list'
	buttonContent:'ul'
	action:->
		if @active
			@setActive(false)
		@editor.$execCommand('insertUnorderedList')
