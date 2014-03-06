window.Aesop.registerToolType 'bold', 
	style:
		# Chrome/Safari
		'font-weight':['bold', 700]
	type:''
	buttonContent:'b'
	action:->
		@editor.$execCommand('bold')