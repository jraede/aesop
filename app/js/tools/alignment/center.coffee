window.Aesop.registerToolType 'center', 
	style:
		# Chrome/Safari
		'text-align':'center'
	type:'alignment'
	buttonContent:'center'
	action:->
		@editor.$execCommand('justifyCenter')