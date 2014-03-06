window.Aesop.registerToolType 'italic', 
	style:
		# Chrome/Safari
		'font-style':'italic'
	type:''
	buttonContent:'i'
	action:->
		@editor.$execCommand('italic')