window.Aesop.registerToolType 'h5', 
	tag:
		tagName:'H5'
		propagate:true
	type:'block'
	buttonContent:'h5'
	action:->
		if !@active
			@editor.$insertBlock('H5')