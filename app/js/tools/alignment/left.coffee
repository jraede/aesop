window.Aesop.registerToolType 'left', 
	style:
		# Chrome/Safari
		'text-align':'left'
	type:'alignment'
	buttonContent:'left'
	action:->
		@editor.$execCommand('justifyLeft')