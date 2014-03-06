window.Aesop =
	config:
		toolbar:
			buttonClass:'btn btn-default aesop-tool'
			buttonActiveClass:'active'

	toolTypes:{}
	registerToolType: (name, params) ->
		console.log 'Registering tool type:', name
		params.name = name
		@toolTypes[name] = params
	Editor:class Editor
		constructor: (element, toolbar) ->

			@originalValue = element.val()
			@element = element

			@element.data('aesop', @)

			# Create the iframe where the editing will happen
			@frame = $('<iframe/>').css('width', '100%').css('height', '300px');
			@frame.attr('src', 'javascript:void()')

			# And now show it
			@element.after(@frame)
			@document = $(@frame[0].contentWindow.document)
			@document[0].designMode = 'on'


			if @originalValue
				@document.find('body').html(@originalValue)

			@$$tools = {}
			@$$keyListeners = []
			@$$styleWatchers = {}
			@$$allStyleWatchers = []
			@$$tagWatchers = 
				propagated:{}
				non:{}
			# Initialize watchers
			@$$initializeWatchers()

			@document.find('body').on 'click', (evt) =>
				@$$updateWatchers()


			# Now set up the toolbar
			if toolbar? and toolbar instanceof Array and toolbar.length
				for tool in toolbar
					if window.Aesop.toolTypes[tool]?
						t = new window.Aesop.Tool(window.Aesop.toolTypes[tool])
						@registerTool(t)


		blockTags:['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE', 'BLOCKQUOTE', 'DIV']


		###
		PUBLIC API
		###

		###
		Listen for a key combination

		@param Array keys 			array of key codes or 'ctrl', 'shift', 'alt', 'cmd'
		@param Function action		Action to run when the key combo is pressed
		###
		addKeyListener: (keys, action) ->
			keys = keys.sort()

			# Is this key combo already being listened for?
			for listener in @$$keyListeners
				lKeys = listener.keys
				if _.intersection(keys, lKeys).length is keys.length
					console.error 'There is already a listener for that key combo!', listener
					return

			@$$keyListeners.push
				keys:keys
				action:action

		###
		Add a tool to watch for the caret being inside of a certain html tag type.

		@param String tag 			The tag name (e.g. "h1" or "p")
		@param Boolean propagate 	Whether the caret must be directly inside of a tag (false) or if it just 
									needs to have a parent that matches that tag (true)
		@param Aesop.Tool tool 		The tool
		###
		addTagWatcher: (tag, propagate, tool) ->
			if propagate
				el = @$$tagWatchers.propagated
			else
				el = @$$tagWatchers.non

			if !el[tag.toUpperCase()]?
				el[tag.toUpperCase()] = []

			el[tag.toUpperCase()].push(tool)

		###
		Get the html contents of the editor

		@return String
		###
		getContents: ->
			return @document.find('body').html()
		$$addStyleWatcherForProp: (prop, val, tool) ->
			if !@$$styleWatchers[prop]?
				@$$styleWatchers[prop] = {}
			if !@$$styleWatchers[prop][val]?
				@$$styleWatchers[prop][val] = []

			@$$styleWatchers[prop][val].push(tool)
		addStyleWatcher:(style, tool) ->
				
				
			for prop,val of style
				console.log 'Adding style watcher for ', prop, val

				if val instanceof Array
					for v in val
						@$$addStyleWatcherForProp(prop,v,tool)
				else
					@$$addStyleWatcherForProp(prop, val, tool)

				@$$allStyleWatchers.push(tool)




		registerTool: (tool) ->
			if @$$tools[tool.name]?
				console.error 'Cant register tool with same name! (' + tool.name + ')'
				return
			tool.editor = @
			@$$tools[tool.name] = tool

			if tool.keys?
				@addKeyListener(tool.keys, tool.action)

			if tool.tag
				@addTagWatcher(tool.tag.tagName, tool.tag.propagate, tool)

			if tool.style
				console.log 'Should be adding style watcher'
				@addStyleWatcher(tool.style, tool)
			# if @tag?
			# 	editor.addTagWatcher(@tag, @)
			# 	
			# 	
		
		###
		@param string name - Name of the tool
		@return Undefined|Object|Aesop.Tool 		If you give a name, it will return that tool or undefined.
													If not, you'll get the whole tools list (object literal with tool names as properties)
		###
		getTool: (name) ->
			console.log 'Getting tool:', name, @$$tools
			if name?
				return @$$tools[name]
			else
				return @$$tools
		$$updateTagWatchers: (tagName, type) ->
			tagName = tagName.toUpperCase()
			if @$$tagWatchers[type][tagName]? and @$$tagWatchers[type][tagName].length
				for watcher in @$$tagWatchers[type][tagName]
					# If it has a type, set all others of the type to inactive
					if watcher.type?
						for name, t of @$$tools
							if t.type is watcher.type
								t.setActive(false)

					# Setting it to active
					watcher.setActive(true)

		$$updateWatchers: ->
			

			el = @$getCurrentElement()

			# TAGS
			# Check non propagated
			tagName = el[0].tagName

			@$$updateTagWatchers(tagName, 'non')


			# Check propagated
			parents = el.parents()
			parentTags = []
			for p in parents
				parentTags.push(p.tagName)

			parentTags.unshift(tagName)
			parentTags = _.uniq(parentTags)

			for tagName in parentTags
				@$$updateTagWatchers(tagName, 'propagated')

			# STYLES
			# We want to disable all style watchers, and then enable the ones that match
			for watcher in @$$allStyleWatchers
				console.log 'Setting style watcher to false'
				watcher.setActive(false)

			for prop,vals of @$$styleWatchers
				console.log 'Checking prop:', prop, el.css(prop)
				console.log 'looking in vals', vals
				if vals[el.css(prop)]?
					console.log 'Found watcher for val'
					for w in vals[el.css(prop)]
						w.setActive(true)



		$$getSelection: ->
			return window.rangy.getIframeSelection(@frame[0])
		$$setCaretToNode: (node) ->

			if @$$getSelection()? and @document[0].createRange?
				range = @document[0].createRange()
				range.selectNodeContents(node)
				range.collapse(false)
				sel = @$$getSelection()
				sel.removeAllRanges()
				sel.addRange(range)
			else if @document[0].createTextRange?
				textRange = @document[0].body.createTextRange()
				textRange.moveToElementText(node)
				textRange.collapse(false)
				textRange.select()

		$$getContentDocument: ->
			iframeDoc = @frame[0].contentDocument or @frame[0].contentWindow.document
			return iframeDoc

		###
		TOOL API

		These methods (single "$") are meant to be used by tools to apply formatting, add elements, etc
		###

		###
		Select the contents of a node (not including the node itself)

		Mostly used for testing but you can use it for a tool if you want.
		###
		$selectNodeContents: (node) ->

			# Get selection
			sel = @$$getSelection()
			sel.selectAllChildren(node)
			# range = window.rangy.createRange(@$$getContentDocument())
			# range.selectNodeContents(node)

		###
		Select the entire node
		###
		$selectNode: (node) ->
			range = window.rangy.createRange(@$$getContentDocument())
			range.selectNode(node)

		###
		Execute a basic command.

		@param string command
		@param bool defaultUI (not used by any browser, but part of the API)
		@param mixed arg 		Optional argument to pass to the browser's execCommand
		@see https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla
		###
		$execCommand: (command, defaultUI = false, arg=null) ->
			console.log 'Executing command:', command
			@document[0].execCommand(command, defaultUI, arg)
			@$$updateWatchers()

		###
		Unifies block support across browsers

		@param string blocktype (e.g. "P", "H1", etc)
		@todo See if we can use native 'formatBlock'
		###
		$insertBlock: (blockType) ->
			el = @$getCurrentElement()
			

			tag = el[0].tagName
			# If the current element is a block and there's no content, replace it with a new block
			replacement = $('<' + blockType + '/>')
			if @blockTags.indexOf(tag) >= 0 and !el.html()
				el.replaceWith(replacement)
			else if tag is 'BODY'

				# Don't want to replace the body, obviously
				contents = el.html()

				# Firefox adds an orphan <br> that we don't want
				if contents.replace(/\s/g, '') is '<br>'
					contents = ''
				el.html('')
				replacement.html(contents).appendTo(el)
			
			else
				# Is this element inside of a block?
				parents = el.parents.apply(el, @blockTags)
				if parents.length
					# Should be only 1, so we'll grab the first one. Keep focus on this element since
					# it won't go away
					el = parents.eq(0)

				contents = el.html()
				el.replaceWith(replacement)
				replacement.html(contents)


			@$$setCaretToNode(replacement[0])
			@$$updateWatchers()

		###
		Gets the html element where the cursor is

		@return jQuery Object
		###
		$getCurrentElement: ->
			$(@document).focus()
			sel = @$$getSelection()
			if sel.anchorNode

				# If node type is 3, get the parent. otherwise return self
				if sel.anchorNode.nodeType is 3
					return $(sel.anchorNode.parentNode)
				return $(sel.anchorNode)
			else
				return @document.find('body')


		
		$$initializeWatchers: ->
			# Watch for keyup, keydown, keypress
			@document.on 'keypress', (e) =>
				@$keypress(e)

			@document.on 'keyup', (e) =>
				@$keyup(e)

			# @document.on 'keydown', (e) =>
			# 	@$keydown(e)


		$$ensureParagraphWrapper: (evt) ->
			if !@getContents() or @$getCurrentElement()[0].tagName is 'BODY'
				@$insertBlock('P')
		$keyup: (evt) ->
			# First of all check if we need to add a <p> tag
			@$$ensureParagraphWrapper()

		$keypress: (evt) ->
			# Key was pressed. Delegate to listeners for a key combo. Use only the first match
			# to prevent conflicts, console error if there is more than one watcher for same combo
			combo = [evt.which]

			if evt.ctrlKey
				combo.push('ctrl')

			if evt.altKey
				combo.push('alt')

			if evt.shiftKey
				combo.push('shift')

			if evt.metaKey
				combo.push('cmd')

			# Sort
			combo = combo.sort()

			# Check for listeners
			for listener in @$$keyListeners
				if _.intersection(combo, listener.keys).length == combo.length
					listener.action(evt)
					return

			@$$updateWatchers()
			
	Tool:class Tool
		###
		Parameters:

			(Array) keys: Array of keys (combo) that triggers this action
			(String) type: If this is specified, this will be disabled if another tool of the same type is enabled
			(Object) tag: { Set the tool to active if current element matches
				(String) tagName: Tag name to listen for (current element in the editor)
				(Boolean) propogate: Whether to go all the way up the DOM to find a matching tag
			}
			(Function) action: Execute the action
		###
		active:false
		constructor: (params) ->
			@name = params.name
			@keys = params.keys
			if params.action? and typeof params.action is 'function'
				@action = _.bind(params.action, @)


			if params.tag?
				@tag = params.tag
			if params.style?
				@style = params.style

			if params.type? and params.type.length
				console.log 'setting type to:', params.type
				@type = params.type

			@buttonContent = params.buttonContent

			@button = $('<button/>').attr('class', window.Aesop.config.toolbar.buttonClass).html(@buttonContent).click(@action)

		setActive:(active) ->
			@active = active
			if active
				@button.addClass(window.Aesop.config.toolbar.buttonActiveClass)
			else
				@button.removeClass(window.Aesop.config.toolbar.buttonActiveClass)

		

