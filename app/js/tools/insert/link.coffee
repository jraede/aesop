window.Aesop.registerToolType 'link', 
	tag:
		tagName:'A'
		propagate:true
	type:''
	buttonContent:'a'
	action:->	
		url = prompt('Enter URL')

		if url
			@editor.$execCommand('createLink', null, url)