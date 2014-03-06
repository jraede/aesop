window.Aesop.registerToolType 'underline', 
	style:
		# Chrome/Safari
		'text-decoration':'underline'
	type:''
	buttonContent:'u'
	action:->
		@editor.$execCommand('underline')