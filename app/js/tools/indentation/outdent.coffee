window.Aesop.registerToolType 'outdent', 
	type:''
	buttonContent:'&larr;'
	action:->
		# "Indent" command adds blockquotes. We don't want that - we want actual indentation. So just
		# add margin-left to the current block element
		block = @editor.$getCurrentBlock()

		current = parseInt(block.css('margin-left').toString().replace(/[^0-9\.]/g, ''))
		if isNaN(current) or !current
			current = 0

		if current is 0
			return
			
		current -= 40

		block.css('margin-left', current.toString() + 'px')