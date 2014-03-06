window.Aesop.registerToolType 'right', 
	style:
		# Chrome/Safari
		'text-align':'right'
	type:'alignment'
	buttonContent:'right'
	action:->
		@editor.$execCommand('justifyRight')