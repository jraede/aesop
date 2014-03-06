window.Aesop.registerToolType 'img', 
	tag:
		tagName:'IMG'
		propagate:true
	type:''
	buttonContent:'img'
	initialize:->
		@editor.document.find('body').on 'click', 'img', (e) ->
			console.log 'GOT IMAGE CLICK'
	action:->	
		url = prompt('Enter URL')

		if url
			@editor.$execCommand('insertImage', null, url)
			@editor.$