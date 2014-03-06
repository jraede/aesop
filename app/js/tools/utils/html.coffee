window.Aesop.registerToolType 'html', 
	buttonContent:'html'
	action:->
		if @active
			@editor.$enableAllTools()
			@editor.element.hide()
			@editor.frame.show()
			@active = false
		else
			@active = true
			@editor.$disableOtherTools(@)
			@editor.element.show()
			@editor.frame.hide()