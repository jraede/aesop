window.Aesop.registerToolType 'ul', 
	tag:
		tagName:'UL'
		propagate:true
	type:'list'
	buttonContent:'ul'
	action:->	
		@editor.$execCommand('insertUnorderedList')