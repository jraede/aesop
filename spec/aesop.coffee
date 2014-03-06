$ ->
	# Make a text area
	$('<textarea/>').appendTo($('body'))
	describe 'Basic functionality', ->
		beforeEach ->
			$('textarea').val('')
			@editor = new window.Aesop.Editor($('textarea'))

		it 'should create the editor', ->
			expect(@editor.frame.length).toEqual(1)

		it 'should return the active element as the body if nothing is focused', ->
			expect(@editor.$getCurrentElement()[0].tagName).toEqual('BODY')


		it 'should create an empty paragraph element on a keypress event', ->
			@editor.$$keyup
				which:66

			expect(@editor.getContents()).toEqual('<p></p>')


	describe 'Existing content', ->
		beforeEach ->
			$('textarea').val('asdf')
			@editor = new window.Aesop.Editor($('textarea'))
		it 'should wrap existing content in a paragraph on a keypress event', ->
			@editor.$$keyup
				which:66

			expect(@editor.getContents()).toEqual('<p>asdf</p>')

	describe 'Blocks', ->

		it 'should change selected element if it is a block', ->
			$('textarea').val('<p>asdf</p>')
			@editor = new window.Aesop.Editor($('textarea'))

			@editor.$$setCaretToNode(@editor.document.find('body p')[0])
			@editor.$insertBlock('H1')
			expect(@editor.getContents()).toEqual('<h1>asdf</h1>')

		it 'should change surrounding block if it is a block', ->
			$('textarea').val('<p><span>asdf</span></p>')
			@editor = new window.Aesop.Editor($('textarea'))

			@editor.$$setCaretToNode(@editor.document.find('body p span')[0])
			@editor.$insertBlock('H1')
			expect(@editor.getContents()).toEqual('<h1><span>asdf</span></h1>')

		it 'should change spanning multiple levels', ->
			$('textarea').val('<p><span><b>asdf</b></span></p>')
			@editor = new window.Aesop.Editor($('textarea'))

			@editor.$$setCaretToNode(@editor.document.find('body p span')[0])
			@editor.$insertBlock('H1')
			expect(@editor.getContents()).toEqual('<h1><span><b>asdf</b></span></h1>')

	describe 'Exec command', ->

		# Just make sure it execs command. Tools are expected to account for varying support
		# cross-browser
		beforeEach ->
			$('textarea').val('<p>asdf</p>')
			@editor = new window.Aesop.Editor($('textarea'))
		it 'should execute command', ->
			@editor.$$setCaretToNode(@editor.document.find('body p')[0])
			@editor.$execCommand('insertHTML', null, '<a>test</a>')

			expect(@editor.getContents()).toEqual('<p>asdf<a>test</a></p>')



	describe 'Tools', ->
		describe 'Basics', ->
			beforeEach ->
				$('textarea').val('<h1>test</h1>')
				@editor = new window.Aesop.Editor($('textarea'))

			it 'should let you register a tool', ->
				tool1 = new window.Aesop.Tool
					name:'tool1'
					keys:[66, 'ctrl', 'shift']
					action:->
						console.log 'action'

				@editor.registerTool(tool1)

				expect(@editor.$$keyListeners.length).toEqual(1)
			it 'should give a list of buttons', ->
				tool1 = new window.Aesop.Tool
					name:'tool1'
					keys:[66, 'ctrl', 'shift']
					action:->
						console.log 'action'

				@editor.registerTool(tool1)

				expect(@editor.getTool('tool1')).toEqual(tool1)


				expect(@editor.getTool()['tool1']).toEqual(tool1)

			it 'should run the action when a the button receives a click event', ->
				ran = false
				tool1 = new window.Aesop.Tool
					name:'tool1'
					keys:[66, 'ctrl', 'shift']
					action:->
						ran = true
				@editor.registerTool(tool1)


				button = tool1.button

				button.trigger('click')
				expect(ran).toEqual(true)

			it 'should trigger a tool action when receiving a matching key combo', ->
				ran = false
				tool1 = new window.Aesop.Tool
					name:'tool1'
					keys:[66, 'ctrl', 'shift']
					action:->
						ran = true

				@editor.registerTool(tool1)

				@editor.$$keypress
					which:66
					ctrlKey:true
					shiftKey:true

				expect(ran).toEqual(true)

			it 'should not let you register two tools for the same key combo', ->
				ran = false
				tool1 = new window.Aesop.Tool
					name:'tool1'
					keys:[66, 'ctrl', 'shift']
					action:->
						ran = true
				tool2 = new window.Aesop.Tool
					name:'tool2'
					keys:[66, 'ctrl', 'shift']
					action:->
						ran = true

				@editor.registerTool(tool1)
				@editor.registerTool(tool2)

				expect(@editor.$$keyListeners.length).toEqual(1)
					
			it 'should set a tool to active if the current element ', ->
				ran = false
				tool1 = new window.Aesop.Tool
					name:'tool1'
					keys:[66, 'ctrl', 'shift']
					tag:
						tagName:'H1'
						propagate:false
					action:->
						ran = true

				@editor.registerTool(tool1)
				@editor.$$setCaretToNode(@editor.document.find('body h1')[0])
				@editor.$$updateWatchers()
				expect(tool1.active).toEqual(true)

			it 'should set a tool to active and others to inactive if they are in the same type', ->
				ran = false
				tool1 = new window.Aesop.Tool
					name:'tool1'
					type:'foo'
					tag:
						tagName:'H1'
						propagate:false
					action:->
						ran = true
				tool2 = new window.Aesop.Tool
					name:'tool2'
					type:'foo'
					tag:
						tagName:'H2'
						propagate:false
					action:->
						ran = true

				@editor.registerTool(tool1)
				@editor.registerTool(tool2)

				tool2.active = true
				@editor.$$setCaretToNode(@editor.document.find('body h1')[0])
				@editor.$$updateWatchers()
				expect(tool1.active).toEqual(true)
				expect(tool2.active).toEqual(false)
		describe 'Style watchers', ->


			it 'should update tools watching for style', ->
				$('textarea').val('<h1>test</h1>')
				@editor = new window.Aesop.Editor($('textarea'))
				
				tool1 = new window.Aesop.Tool
					name:'tool1'
					keys:[66, 'ctrl', 'shift']
					style:
						'font-weight':['bold',700]
					action:->
						console.log 'action'

				@editor.registerTool(tool1)

				@editor.$$setCaretToNode(@editor.document.find('body h1')[0])
				@editor.$$updateWatchers()
				expect(tool1.active).toEqual(true)
		describe 'Pre-registered', ->
			it 'should add a tool in the toolbar argument', ->
				$('textarea').val('')
				@editor = new window.Aesop.Editor($('textarea'), ['bold'])

				expect(_.keys(@editor.$$tools).length).toEqual(1)
