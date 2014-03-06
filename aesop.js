torchd.makeEditor = function(element, params) {
	if($.browser.msie) {
		var self = new torchd.editor.MSIE(element, params);
	}
	else if($.browser.mozilla) {
		var self = new torchd.editor.Mozilla(element, params);
	}
	else if($.browser.webkit) {
		var self = new torchd.editor.Webkit(element, params);
	}
	else if($.browser.opera) {
		var self = new torchd.editor.Opera(element, params);
	}
	else {
		var self = new torchd.editor(element, params);
	}
	self.initialize();
}




torchd.editor = function(element, params) {
	this.element = $(element);
	var defaults = torchd.editor.defaultParams;
	for(var i in defaults) {
	
		defaults[i] = torchd.root + defaults[i];
	}
	this.params = $.extend(defaults, params);
		
	
};

torchd.editor.pluginDialogs = {};
torchd.editor.addDialogOption = function(option, callback) {
	torchd.editor.pluginDialogs[option] = callback;
}
torchd.editor.addButton = function(name, parameters) {
	torchd.editor.buttons[name] = parameters;

};
torchd.editor.pluginInitCallbacks = [];
torchd.editor.addInitCallback = function(callback) {
	torchd.editor.pluginInitCallbacks.push(callback);
};

torchd.editor.defaultParams = {
	imageUploadHandler:torchd.root + '/editor/torchd-editor-upload-handler.php',
	imageUploadLocation:torchd.root + '/editor/uploads/',
	imageResizer:torchd.root + '/editor/image.php',
	imageRemoveHandler:'/testing-environment/editor/image-remove.php',
	uploadedImageList:torchd.root + '/editor/torchd-editor-image-list.php',
	iframeCSS:torchd.root + '/editor/iframe.css',
	buttons:'bold,italic,underline,strikethrough,removeFormatting,|,paragraph,h1,h2,h3,blockQuote,|,ul,ol,|,leftAlign,centerAlign,rightAlign,|,link,unLink,|,image,|,html,fullScreen,minimize'
};
function doubleHtmlEntities(text) {
	text = text.replace('&amp;', '&amp;amp;');
	text = text.replace('&lt;', '&amp;lt;');
	text = text.replace('&gt;', '&amp;gt;');
	return text;
};



torchd.editor.prototype.minimize = function() {
	this.frame.attr('style', '');
	this.formatting.attr('style', '');
	this.formatting.buttons.fullScreen.show();
	this.formatting.buttons.minimize.hide();
	this.view = 'min';
	if(this.formatting.buttons.html.data('pressed')) {
		this.hideHtml();
	}
};

torchd.editor.prototype.insertAtHTMLCaret = function(text) {
    var txtarea = this.htmlContent.get(0);
    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? 
        "ff" : (document.selection ? "ie" : false ) );
    if (br == "ie") { 
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        strPos = range.text.length;
    }
    else if (br == "ff") strPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0,strPos);  
    var back = (txtarea.value).substring(strPos,txtarea.value.length); 
    txtarea.value=front+text+back;
    strPos = strPos + text.length;
    if (br == "ie") { 
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        range.moveStart ('character', strPos);
        range.moveEnd ('character', 0);
        range.select();
    }
    else if (br == "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }
    txtarea.scrollTop = scrollPos;
};

torchd.editor.prototype.insertNodeAtCaret = function(node) {
	node = node.get(0);
    var sel = this.document.getSelection();
    console.log(sel);
    if (sel.rangeCount) {
        var range = sel.getRangeAt(0);
        range.collapse(false);
        range.insertNode(node);
        range = range.cloneRange();
        range.selectNodeContents(node);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

torchd.editor.prototype.fullScreen = function() {
	var self = this;
	
	// Get document dimensions
	var width = $(window).width();
	var height = $(window).height();
	this.frame.css('position', 'fixed').css('top', '31px').css('left', '0px').css('height', (height - 30) + 'px').css('width', '100%');
	this.formatting.css('position', 'fixed').css('top', '0px').css('left', '0px').css('width', '100%');
	this.view = 'full';
	$('body').css('overflow-y', 'hidden');
	// Switch "full" button to "min"
	this.formatting.buttons.fullScreen.hide();
	this.formatting.buttons.minimize.show();
	if(this.formatting.buttons.html.data('pressed')) {
		this.hideHtml();
	}
};

torchd.editor.prototype.hideHtml = function() {
	var self = this;
	self.htmlWindow.hide();
	self.frame.show();
	
	//alert(self.htmlContent.val());
	$(self.document).find('body').html(self.htmlContent.val());
	this.formatting.buttons.html.data('pressed', false);
	$('#console').append('<p>Current element: ' + self.currentElement.get(0).tagName + '</p>');
	$(self.document).find('body').find('p,blockquote,h1,h2,h3,h4,h5,h6,pre').append('<span class="clearfix"></span>');
	self.setFocusToNode($(self.document).find('p,blockquote,h1,h2,h3,h4,h5,h6,pre').last());
	
	

};

torchd.editor.prototype.showHtml = function() {
	var self = this;
	// Get the index # of the current element

	var frameWidth = this.frame.realWidth();
	var frameHeight = this.frame.realHeight();
	$('body', self.document).find('span.clearfix').remove();
	var currentHtml = $('body', self.document).html();
	
	// For some reason the htmlentities get switched back, so we have to re-switch them.
	//currentHtml = doubleHtmlEntities(currentHtml);
	switch(this.view) {
		case 'full':
			
			self.frame.hide();
			self.htmlContent.css('display', 'block').css('position', 'fixed').css('top', self.frame.css('top')).css('left', '0px').width(frameWidth).height(frameHeight).val(currentHtml);
			self.htmlWindow.show();
			break;
		case 'min':
		default:
			self.frame.hide();
			self.htmlContent.css('position', 'relative').css('top', self.frame.css('top')).css('left', self.frame.css('left')).width(frameWidth).height(frameHeight).val(currentHtml);
			self.htmlWindow.show();
			break;
	}
	
};





torchd.editor.prototype.getElementByAttributeValue = function( tagName, attributeName, attributeValue )
{
    var elements = this.document.getElementsByTagName(tagName);

    for ( var i = 0; i < elements.length; i++ )
    {
        var value = elements[i].getAttribute(attributeName);

        if ( $.browser.msie )
        {
            /** IE add full path, so I check by the last chars. */
            value = value.substr(value.length - attributeValue.length);
        }

        if ( value == attributeValue )
            return elements[i];
    }

    return false;
};

torchd.editor.prototype.insertImage = function(params) {
	var width='';
	var height='';
	var cropRatio = '';
	var stamp = this.uniqueStamp();
	
	if(params.width) {
		width = '&width='+params.width;
	}
	if(params.height) {
		height = '&height='+params.height;
	}	
	if(params.cropRatio) {
		cropRatio = '&cropratio='+params.cropRatio;
	}
	this.document.execCommand('insertImage', false, stamp);
	
	
	
	var img = $(this.getElementByAttributeValue('img', 'src', stamp));
	img.attr('src', this.params.imageResizer + '&image=' + this.params.imageUploadLocation + params.file + width + height + cropRatio);
	
	if(params.position) {
		img.addClass(params.position);
	}
	
};


torchd.editor.prototype.dialog = function(dialog, params) {
	var self = this;
	if(!params) params = {};
	var top, left;
	torchd.ui.closeAllDialogs();
	switch(dialog) {
		case 'link':
			var urlDefault, titleDefault, targetDefault;
			
			if(self.currentElement.get(0).tagName == 'A') {
				urlDefault = self.currentElement.attr('href');
				titleDefault = self.currentElement.attr('title');
				targetDefault = self.currentElement.attr('target');
				var onSubmit = function(data) {
					self.currentElement.attr('href', data[0].url).attr('title', data[0].title).attr('target', data[0].target);
					self.getCurrentElement();
				};
			}
			else {
				var onSubmit = function(data) {
					var stamp = self.uniqueStamp();
						self.document.execCommand('createLink', false, stamp);
						var link = $('a[href='+stamp+']', self.document);
						if(link.html() == stamp) {
							link.html(data[0].url);
						}
						link.attr('href', data[0].url).attr('title', data[0].title).attr('target', data[0].target);
						self.getCurrentElement();
				};
			}
			
			
			torchd.ui.showDialog({
				title:'Insert Link',
				type:'form',
				onSubmit:onSubmit,
				formElements:{
					fieldsets:[
						{
							fields:[
								{
									type:'text',
									label:'URL',
									name:'url',
									defaultValue:urlDefault
								},
								{
									type:'text',
									label:'Title',
									name:'title',
									defaultValue:titleDefault
								},
								{
									type:'select',
									label:'Target',
									name:'target',
									defaultValue:targetDefault,
									options:[
										{
											value:'self',
											label:'Same Window'
										},
										{
											value:'_blank',
											label:'New Window'
										}
									]
								}
							]
							
						}
					]
				}
			});
			break;
		case 'image':
			torchd.ui.showDialog({
				title:'Insert Image',
				type:'custom',
				construct:function(dialog) {
					var leftSide = $('<form/>').addClass('torchd-editor-left-container').appendTo(dialog.content);
					var imageContainer = $('<div/>').addClass('torchd-editor-image-container').appendTo(leftSide);
					var imageOptions = $('<ul/>').addClass('torchd-editor-image-options').appendTo(leftSide);
					imageOptions.append('<li><label><input type="radio" name="image_size" checked="checked" value="full"/> Full Size</label></li>');
					imageOptions.append('<li><label><input type="radio" name="image_size" value="large"/> Large</label></li>');
					imageOptions.append('<li><label><input type="radio" name="image_size" value="medium"/> Medium</label></li>');
					imageOptions.append('<li><label><input type="radio" name="image_size" value="small"/> Small</label></li>');
					imageOptions.append('<li><label><input type="radio" name="image_size" value="thumb"/> Thumbnail</label></li>');
					imageOptions.append('<li><label><input type="radio" name="image_size" value="custom"/> Custom: <input type="text" placeholder="W" class="thin" name="image_width"/><input placeholder="H" type="text" class="thin" name="image_height"/></label></li>');
					
					var positioning = $('<ul/>').addClass('torchd-editor-image-options').appendTo(leftSide);
					positioning.append('<li><label><input type="radio" name="image_positioning" checked="checked" value="none"/> No positioning</label></li>');
					positioning.append('<li><label><input type="radio" name="image_positioning" value="left"/> Float left</label></li>');
					positioning.append('<li><label><input type="radio" name="image_positioning" value="right"/> Float right</label></li>');
					positioning.append('<li><label><input type="radio" name="image_positioning" value="center"/> Centered</label></li>');
					
					var rightSide = $('<div/>').addClass('torchd-editor-right-container').appendTo(dialog.content);
					var fileSelect = $('<input/>').attr('type', 'file').appendTo(rightSide);
					fileSelect.torchdUploader({
						size:'small',
						minFiles:1,
						maxFiles:1,
						uploadHandler:self.params.imageUploadHandler,
						removeHandler:self.params.imageRemoveHandler,
						onUploadCompleted:function(data) {
							insertButton.attr('disabled', false);
							imageList.find('li.selected').removeClass('selected');
							var li = $('<li/>').html('<img src="' + self.params.imageResizer + '&image=' + self.params.imageUploadLocation + data.location + '&width=80&height=80&cropratio=1:1"/>').appendTo(imageList).addClass('selected');
							li.data('image', data.location).click(function() {
								insertButton.attr('disabled', false);
								$(this).parent('ul').find('li.selected').removeClass('selected');
								$(this).addClass('selected');
								imageContainer.html('<img src="' + self.params.imageResizer + '&image=' + self.params.imageUploadLocation + $(this).data('image') + '&width=320&height=150"/>');
								imageContainer.data('image', $(this).data('image'));
							})
							imageContainer.html('<img src="' + self.params.imageResizer + '&image=' + self.params.imageUploadLocation + data.location + '&width=320&height=150"/>');
							imageContainer.data('image', data.location);
						}
					});
					var imageListContainer = $('<div/>').addClass('torchd-editor-image-list-container').appendTo(rightSide);
					var imageList = $('<ul/>').addClass('torchd-editor-image-list').appendTo(imageListContainer);
					$.ajax({
						url:self.params.uploadedImageList,
						dataType:'json',
						success:function(data) {
							var uploads = data.uploads;
							for(var i=0; i<uploads.length; i++) {
								$('<li/>').html('<img src="' + self.params.imageResizer + '&image=' + self.params.imageUploadLocation + uploads[i] + '&width=80&height=80&cropratio=1:1"/>').appendTo(imageList).data('image', uploads[i]).click(function() {
									insertButton.attr('disabled', false);
									$(this).parent('ul').find('li.selected').removeClass('selected');
									$(this).addClass('selected');
									imageContainer.html('<img src="' + self.params.imageResizer + '&image=' + self.params.imageUploadLocation + $(this).data('image') + '&width=320&height=150"/>');
									imageContainer.data('image', $(this).data('image'));
								});
							}
							if(self.currentImage) {
								insertButton.attr('disabled', false);
								var src = self.currentImage.attr('src');
								// Get the arguments for the image resizer
								var location;
								var imageLocation;
								if(location = src.search('image.php')) {
									var args = src.substring(location + 10);
									var argsObject = {};
									args.replace(
									    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
									    function($0, $1, $2, $3) { argsObject[$1] = $3; }
									);
									
									argsObject.image = argsObject.image.replace(self.params.imageUploadLocation, '');
									imageLocation = argsObject.image;
									
									var sizeSetting;
									if(argsObject.width == 400 && argsObject.height == 400)
										sizeSetting = 'large';
									else if(argsObject.width == 200 && argsObject.height == 200) 
										sizeSetting = 'medium';
									else if(argsObject.width == 100 && argsObject.height == 100)
										sizeSetting = 'small';
									else if(argsObject.width == 50 && argsObject.height == 50)
										sizeSetting = 'thumb';
									else
										sizeSetting = 'custom';
									imageOptions.find('input[name="image_size"]').each(function() {
										if($(this).val() == sizeSetting) {
											$(this).attr('checked', 'checked');
										}
									});
									if(sizeSetting == 'custom') {
										imageOptions.find('input[name="image_width"]').val(argsObject.width);
										imageOptions.find('input[name="image_height"]').val(argsObject.height);
									}
									
								}
								
								// Set position setting
								var imageClass;
								if(self.currentImage.hasClass('float-left')) 
									imageClass = 'left';
								else if(self.currentImage.hasClass('float-right'))
									imageClass = 'right';
								else if(self.currentImage.hasClass('center')) 
									imageClass = 'center';
								
								positioning.find('input[name="image_positioning"]').each(function() {
									if($(this).val() == imageClass) {
										$(this).attr('checked', 'checked');
									}
								});
								
								// Show the selected image
								imageList.find('li.selected').removeClass('selected');
								var selectedImage = imageList.find('img[src="' + self.params.imageResizer + '&image=' + self.params.imageUploadLocation + imageLocation + '&width=80&height=80&cropratio=1:1"]')
								if(selectedImage) {
									selectedImage.parent('li').addClass('selected');
								}
								else {
									// Add to the image list
									$('<li/>').html('<img src="' + self.params.imageResizer + '&image=' + self.params.imageUploadLocation + imageLocation + '&width=80&height=80&cropratio=1:1"/>').appendTo(imageList).addClass('selected');
									
								}
								
								imageContainer.html('<img src="' + self.params.imageResizer + '&image=' + self.params.imageUploadLocation + imageLocation + '&width=320&height=150"/>');
								imageContainer.data('image', imageLocation);
							}
						}
					});
					dialog.content.append('<div style="clear:both;"></div>');
					var insertButton = $('<button/>').html('Insert').attr('disabled', 'disabled').appendTo(dialog.content).click(function() {
						// Get the size
						var size = imageOptions.find('input:checked').val();
						var url = '';
						switch(size) {
							case 'full':
								
								url = torchd.root + '/editor/' + imageContainer.data('image');
								break;
							case 'large':
								url = self.params.imageResizer + '&image='  + self.params.imageUploadLocation + imageContainer.data('image') + '&width=400&height=400';
								break;
							case 'medium':
								url = self.params.imageResizer + '&image='  + self.params.imageUploadLocation + imageContainer.data('image') + '&width=200&height=200';
								break;
							case 'small':
								url = self.params.imageResizer + '&image='  + self.params.imageUploadLocation + imageContainer.data('image') + '&width=100&height=100';
								break;
							case 'thumb':
								url = self.params.imageResizer + '&image='  + self.params.imageUploadLocation + imageContainer.data('image') + '&width=50&height=50&cropratio=1:1';
								break;
							case 'custom':
								var width = imageOptions.find('input[name="image_width"]').val();
								var height = imageOptions.find('input[name="image_height"]').val();
								url = self.params.imageResizer + '&image=' + self.params.imageUploadLocation + imageContainer.data('image') + '&width='+width+'&height='+height+'&cropratio='+width+':'+height;
								break;
							
							
								
						}
						
						var position = positioning.find('input:checked').val();
						var imageClass = '';
						switch(position) {
							case 'left':
								imageClass = 'float-left';
								break;
							case 'right':
								imageClass = 'float-right';
								break;
							case 'center':
								imageClass = 'center';
								break;
							default:
								imageClass = '';
								break;
						}
						var stamp = self.uniqueStamp();
						
						if(self.currentImage) {
							torchd.ui.closeAllDialogs();
							insertButton.attr('disabled', false);
							self.currentImage.attr('src', url);
							self.currentImage.removeClass('float-left').removeClass('float-right').removeClass('center').addClass(imageClass);
						}
						else {
							torchd.ui.closeAllDialogs();
							var img = $('<img/>').attr('src', url).addClass(imageClass);
							var marker = $('<span/>').html('&nbsp;').attr('id', 'marker');
							self.setFocusToNode(self.currentElement);
							self.insertNodeAtCaret(img);
							if (self.document.selection) {
							  sel = self.document.selection.createRange();
							  sel.moveStart('character', 3);
							  sel.select();
							}
							else {
							   sel = window.getSelection();
							   sel.collapse(self.currentElement.get(0), 3);
							}
							//self.setFocusToNode(marker);
							//self.document.execCommand('insertImage', false, stamp);
							self.saveContent();
							
							//var img = $(self.getElementByAttributeValue('img', 'src', stamp));
							//img.attr('src', url);
							//img.addClass(imageClass);
							
						}
						
						self.currentImage = false;
						//torchd.ui.closeAllDialogs();
					});
					$('<button/>').html('Cancel').appendTo(dialog.content).click(function() {
						torchd.ui.closeAllDialogs();
					});
					if(self.currentImage) {
						$('<button/>').html('Remove Image').appendTo(dialog.content).click(function() {
							self.currentImage.remove();
							self.currentImage = false;
							torchd.ui.closeAllDialogs();
						});
					}
					
					// Preset values from torchd.editor.currentImage
					
					
				}
			});
			break;
		default:
			if(torchd.editor.pluginDialogs[dialog]) {
				var dialogFunction = torchd.editor.pluginDialogs[dialog];
				dialogFunction(self, params);
			}
			break;
		
			
	}
	
	
	
};

torchd.editor.prototype.uniqueStamp = function() {
	var now = new Date();
	return("torchd-editor-" + now.getTime());
};

torchd.editor.prototype.iframeHtml = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">STYLE</head><body style="margin: 0px;"><p><span class="clearfix"></span></p></body></html>';


torchd.editor.prototype.getCurrentElement = function() {
	if(this.getSelection().anchorNode) {
		
		var element = this.getSelection().anchorNode.parentNode;
		if(element.tagName == 'BODY' || element.tagName == 'HTML') {
			this.currentElement = $(this.getSelection().anchorNode);

		}
		else {
			this.currentElement = $(this.getSelection().anchorNode.parentNode);
		}
	}
	else { 
		this.currentElement = false;
	}
};

torchd.editor.prototype.insertBlock = function(block) {
	this.getCurrentElement();
	// If the current item is a block and there's no content, just replace it with a new block, since the formatBlock command renders the blocks inside one another. Weird.
	var blocks = new Array('P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE', 'BLOCKQUOTE', 'DIV');
	var tag = this.currentElement.get(0).tagName;
	if(blocks.indexOf(tag) >= 0 && !this.currentElement.html()) {
		var replacement = $('<' + block + '/>');
		this.currentElement.replaceWith(replacement);
		$('#console').append('<p>Replacing current element with ' + block + '</p>');
		this.setFocusToNode(replacement);
		this.currentElement = replacement;
	}
	else {
		var contents = this.currentElement.html();
		var replacement = $('<' + block + '/>');
		this.currentElement.replaceWith(replacement);
		replacement.html(contents);
		this.setFocusToNode(replacement);
		this.currentElement = replacement;
	}
};

torchd.editor.prototype.insertUnorderedList = function() {
	
	if(this.currentElement) {
		var list = $('<ul/>');
		var firstItem = $('<li/>').appendTo(list);
		this.currentElement.after(list);
		this.setFocusToNode(list);
	}
	else {
		self.document.execCommand('insertUnorderedList', false);
	}
};

torchd.editor.prototype.insertOrderedList = function() {
	
	if(this.currentElement) {
		var list = $('<ol/>');
		var firstItem = $('<li/>').appendTo(list);
		this.currentElement.after(list);
		this.setFocusToNode(list);
	}
	else {
		self.document.execCommand('insertOrderedList', false);
	}
}		

torchd.editor.prototype.inlineFormat = function(format) {
	this.document.execCommand(format, false, false);
};



torchd.editor.buttons = {
	bold: {
			'display':'b',
			'action':function(self) {
				self.inlineFormat('bold');
				
			},
			'buttonType':'bold'
		},
	italic: {
		'action':function(self) {
			self.inlineFormat('italic');
		},
		'display':'i',
		'buttonType':'italic'
	},
	underline: {
		'action':function(self) {
			self.inlineFormat('underline');
		},
		'display':'u',
		'buttonType':'underline'
	},
	/**{
		'name':'subscript',
		'action':function(self) {
			self.document.execCommand('subscript', false);
		},
		'display':'sub',
		'buttonType':'subscript'
	},
	{
		'name':'superscript',
		'action':function(self) {
			self.document.execCommand('superscript', false);
		},
		'display':'sup',
		'buttonType':'superscript'
	},*/
	strikethrough: {
		'action':function(self) {
			self.inlineFormat('strikethrough');
		},
		'display':'strike',
		'buttonType':'strikethrough'
	},
	removeFormatting: {
		'action':function(self) {
			self.document.execCommand('removeFormat', false, []);
            self.document.execCommand('unlink', false, []);
		},
		'display':'X',
		'buttonType':'oneClick'
		
	},
	paragraph: {
		'action':function(self) {
			self.insertBlock('p');
		},
		'display':'p',
		'buttonType':'block'
	},
	h1: {
		'action':function(self) {
			self.insertBlock('h1');
		},
		'display':'h1',
		'buttonType':'block'
	},
	h2: {
		'action':function(self) {
			self.insertBlock('h2');
		},
		'display':'h2',
		'buttonType':'block'
	},
	h3: {
		'action':function(self) {
			self.insertBlock('h3');
		},
		'display':'h3',
		'buttonType':'block'
	},
	pre: {
		'action':function(self) {
			self.insertBlock('pre');
		},
		'display':'pre',
		'buttonType':'block'
	},
	blockQuote: {
		'action':function(self) {
			self.insertBlock('blockquote');
		},
		'display':'quote',
		'buttonType':'block'
	},
	ul: {
		'action':function(self) {
			self.insertUnorderedList();
		},
		'display':'ul',
		'buttonType':'block'
	},
	ol:{
		'action':function(self) {
			self.insertOrderedList();
		},
		'display':'ol',
		'buttonType':'block'
	},
	leftAlign: {
		'action':function(self) {
			self.setAlignment('left');
		},
		'display':'left',
		'buttonType':'alignment'
	},
	centerAlign: {
		'action':function(self) {
			self.setAlignment('center');
		},
		'display':'center',
		'buttonType':'alignment'
	},
	rightAlign: {
		'action':function(self) {
			self.setAlignment('right');
		},
		'display':'right',
		'buttonType':'alignment'
	},
	image: {
		'action':function(self) {
			self.dialog('image');
		},
		'display':'img',
		'buttonType':'oneClick'
	},
	link: {
		'action':function(self) {
			self.dialog('link');
		},
		'display':'link',
		'buttonType':'oneClick'
	},
	unLink: {
		'action':function(self) {
			self.removeLink();
		},
		'display':'unlink',
		'buttonType':'oneClick'
	},
	html: {
		'action':function(self) {
			if(self.formatting.buttons.html.data('pressed')) {
				self.showHtml()
			}
			else {
				self.hideHtml();
			}
		},
		'display':'html',
		'buttonType':'screen'
	},
	fullScreen: {
		'name':'fullScreen',
		'action':function(self) {
			self.fullScreen();
		},
		'display':'full',
		'buttonType':'screen'
	},
	minimize: {
		'action':function(self) {
			self.minimize();
		},
		'display':'min',
		'hide':true,
		'buttonType':'screen'
	}
};


torchd.editor.prototype.setAlignment = function(alignment) {
	if(this.currentElement.is('p,blockquote,h1,h2,h3,h4,h5,h6')) {
		this.currentElement.removeClass('align-left').removeClass('align-right').removeClass('align-center').addClass('align-' + alignment);
	}
	else if(this.currentElement) {
		this.currentElement.parents('p,blockquote,h1,h2,h3,h4,h5,h6').first().removeClass('align-left').removeClass('align-right').removeClass('align-center').addClass('align-' + alignment);
	}
}

torchd.editor.prototype.highlightAlignmentButton = function() {
	var self = this;
	self.formatting.find('button.torchd-editor-button-alignment').removeClass('torchd-editor-button-pressed').data('pressed', false);
	block = self.currentElement;
	if(block.hasClass('align-center')) {
		self.formatting.buttons.centerAlign.addClass('torchd-editor-button-pressed').data('pressed', true);
	}
	else if(block.hasClass('align-right')) {
		self.formatting.buttons.rightAlign.addClass('torchd-editor-button-pressed').data('pressed', true);
	}
	else {
		self.formatting.buttons.leftAlign.addClass('torchd-editor-button-pressed').data('pressed', true);
	}
}

torchd.editor.prototype.highlightBlockButton = function(element) {
	var self = this;
	self.formatting.find('button.torchd-editor-button-block').removeClass('torchd-editor-button-pressed').data('pressed', false);
	var block = element.get(0).tagName;
	switch(block) {
		case 'P':		
			self.formatting.buttons.paragraph.addClass('torchd-editor-button-pressed').data('pressed', true);		
			break;
		case 'H1':
			self.formatting.buttons.h1.addClass('torchd-editor-button-pressed').data('pressed', true);
			break;
		case 'H2':
			self.formatting.buttons.h2.addClass('torchd-editor-button-pressed').data('pressed', true);
			break;
		case 'H3':
			self.formatting.buttons.h3.addClass('torchd-editor-button-pressed').data('pressed', true);
			break;
		case 'PRE':
			self.formatting.buttons.pre.addClass('torchd-editor-button-pressed').data('pressed', true);
			break;
		case 'BLOCKQUOTE':
			self.formatting.buttons.blockQuote.addClass('torchd-editor-button-pressed').data('pressed', true);
			break;
		case 'UL':
			self.formatting.buttons.ul.addClass('torchd-editor-button-pressed').data('pressed', true);
			break;
		case 'OL':
			self.formatting.buttons.ol.addClass('torchd-editor-button-pressed').data('pressed', true);
			break;
	}
};
torchd.editor.prototype.highlightInlineButton = function(element) {
	var self = this;
	var tag = element.get(0).tagName;
	var parent = element.parent();
	// Check the element's style to see if it is bolded or italicized or whatever
	if(element.css('font-weight') == 'bold' || parseInt(element.css('font-weight')) > 500) {
		self.formatting.buttons.bold.addClass('torchd-editor-button-pressed').data('pressed', true);
	}
	if(element.css('font-style') == 'italic') {
		self.formatting.buttons.italic.addClass('torchd-editor-button-pressed').data('pressed', true);
	}
	if(element.css('text-decoration') == 'underline') {
		self.formatting.buttons.underline.addClass('torchd-editor-button-pressed').data('pressed', true);
	}
	switch(tag) {
		case 'B':
		case 'STRONG':
			self.formatting.buttons.bold.addClass('torchd-editor-button-pressed').data('pressed', true);
			
			// Get parent tag
			self.highlightButtonsLoop(parent);
			break;
		case 'I':
		case 'EM':
			self.formatting.buttons.italic.addClass('torchd-editor-button-pressed').data('pressed', true);
			
			// Get parent tag
			self.highlightButtonsLoop(parent);
			break;
		case 'U':
			self.formatting.buttons.underline.addClass('torchd-editor-button-pressed').data('pressed', true);
			
			// Get parent tag
			self.highlightButtonsLoop(parent);
			break;
		case 'SUB':
			self.formatting.buttons.subscript.addClass('torchd-editor-button-pressed').data('pressed', true);
			
			// Get parent tag
			self.highlightButtonsLoop(parent);
			break;
		case 'SUP':
			self.formatting.buttons.superscript.addClass('torchd-editor-button-pressed').data('pressed', true);
			
			// Get parent tag
			self.highlightButtonsLoop(parent);
			break;
		case 'A':
			self.formatting.buttons.link.addClass('torchd-editor-button-pressed').data('pressed', true);
			// Get parent tag
			self.highlightButtonsLoop(parent);
			break;
		
	}
	
	
};

torchd.editor.prototype.highlightButtons = function() {
	var self = this;
	var element = self.currentElement;
	// Remove highlighting of all span elements, they don't get removed when pressing on other span elements so we need to remove them manually and run this check every time.
	self.formatting.buttons.link.removeClass('torchd-editor-button-pressed').data('pressed', false);
	self.formatting.buttons.bold.removeClass('torchd-editor-button-pressed').data('pressed', false);
	self.formatting.buttons.italic.removeClass('torchd-editor-button-pressed').data('pressed', false);
	self.formatting.buttons.underline.removeClass('torchd-editor-button-pressed').data('pressed', false);
	//self.formatting.buttons.subscript.removeClass('torchd-editor-button-pressed').data('pressed', false);
	//self.formatting.buttons.superscript.removeClass('torchd-editor-button-pressed').data('pressed', false);
	self.formatting.buttons.strikethrough.removeClass('torchd-editor-button-pressed').data('pressed', false);
	
	self.highlightButtonsLoop(element);
	self.highlightAlignmentButton();
	
	
};
torchd.editor.prototype.highlightButtonsLoop = function(element) {
	var self = this;
	
	
	
	switch(element.get(0).tagName) {
		case 'P':
		case 'H1':
		case 'H2':
		case 'H3':
		case 'PRE':
		case 'BLOCKQUOTE':
			self.highlightBlockButton(element);
			break;
		case 'A':
		case 'B':
		case 'STRONG':
		case 'I':
		case 'EM':
		case 'SUP':
		case 'SUB':
		case 'STRIKE':
		case 'U':
		case 'SPAN':
			self.highlightInlineButton(element);
			break;
	}
};



torchd.editor.prototype.insertAtCaret = function(text) {
	if(document.all) {
		var range = this.document.selection.createRange();
		range.pasteHTML(text);
		range.collapse(false);
		range.select();
	}
	else {
		this.document.execCommand('insertHTML', false, text);
	}
    
};

torchd.editor.prototype.removeLink = function() {
	if(this.currentElement.is('a')) {
		var content = this.currentElement.html();
		this.currentElement.before(content);
		this.currentElement.remove();
		this.getCurrentElement();
	}
}

torchd.editor.prototype.initialize = function() {
	var self = this;
	// Hide the text area
	this.element.hide();
	
	this.frame = $('<iframe/>');
	this.frame.attr('src', 'javascript:void()');	
	
	this.generateEditor();
	
	// Create and display the iframe
	this.frame.css('z-index', '99').appendTo(this.iframeContainer);
	this.document = this.frame.document();
	this.document.designMode = "on";
	
	
	this.document.open();
    this.document.write(
        this.iframeHtml.replace(/STYLE/, function() { return '<link rel="stylesheet" type="text/css" media="all" href="'+self.params.iframeCSS+'" />'; })
    );
    
    this.document.close();
    this.document.contentEditable = 'true';
    //$('body', this.document).html(this.element.val());
    this.currentElement = $('body', this.document);
    $(this.document).click();
  	$(this.document).click(function() {
  		self.getCurrentElement();
  		self.highlightButtons();
  	});
  	if(this.element.text()) {
  		$('body', this.document).html(this.element.text());
  	}
  	// Image press
  	$(this.document).find('img').live('click', function() {
  		self.currentImage = $(this);
  		self.dialog('image');
  	});
  	for(var i=0;i<torchd.editor.pluginInitCallbacks.length;i++) {
  		var callback = torchd.editor.pluginInitCallbacks[i];
  		callback(self);
  	}
  	
  	
  	self.handleKeyPress();
  	
  	//self.document.execCommand("useCSS", false, "off");

  	

	
	
};

torchd.editor.prototype.saveContent = function() {
	var html = $('body', this.document).html().replace('<span class="clearfix"></span>', '');
	this.element.val(html);
};

torchd.editor.prototype.generateEditor = function() {
	var self = this;
	// Make the editor area
	this.editor = $('<div/>').addClass('torchd-editor-editor').addClass('torchd-ui').css('position', 'relative');
	
	// Generate the work area
	this.formatting = $('<ul/>');
	this.formatting.addClass('torchd-editor-format-buttons');
	this.formatting.buttons = {};
	// Insert all buttons
	var buttons = self.params.buttons.split(',');
	for(var i=0;i<buttons.length;i++) {
		var li = $('<li/>');
		if(buttons[i] == '|') {
			li.addClass('separator');
			li.appendTo(this.formatting);
		
		}
		else {
			var currentButton = torchd.editor.buttons[buttons[i]];
			var button = $('<button/>').html(currentButton.display).appendTo(li).data('action', currentButton.action).data('buttonType', currentButton.buttonType).addClass('torchd-editor-button-'+currentButton.buttonType).click(function(e) {
				e.preventDefault();
				var action = $(this).data('action');
				$(self.document).find('body').focus();
				self.formatting.find('button.torchd-editor-button-'+$(this).data('buttonType')).removeClass('torchd-editor-button-pressed');
				if($(this).data('pressed') && $(this).data('buttonType') != 'block') { // Pressing a block twice won't get rid of the block, they have to press on a different block
					$(this).removeClass('torchd-editor-button-pressed');
					$(this).data('pressed', false);
				}
				else if($(this).data('buttonType') != 'oneClick') { // Clicking "oneClick" items just performs an action and does not style, so no need to highlight
					$(this).addClass('torchd-editor-button-pressed');
					$(this).data('pressed', true);
				}
				action(self);
				
				self.saveContent();
			});
			if(currentButton.hide) {
				button.hide();
			}
			eval("self.formatting.buttons." + buttons[i] + " = button");
			li.appendTo(this.formatting);
		}
		
	}
	this.formatting.append('<div style="clear:both;"></div>');
	
	
	this.formatting.css('z-index', '99').appendTo(this.editor);
	var clear = $('<div/>').css('clear', 'both');
	clear.appendTo(this.editor);
	this.iframeContainer = $('<div/>').addClass('torchd-editor-iframe-container').appendTo(this.editor);
	this.htmlWindow = $('<div/>').hide().appendTo(this.iframeContainer);
	this.htmlContent = $('<textarea/>').addClass('torchd-editor-html-window').css('z-index', '100').appendTo(this.htmlWindow).keydown(function(event) {
		if(event.keyCode == '9') {
			event.preventDefault();
			self.insertAtHTMLCaret("\t");
					
		}
	});
	
	this.editor.insertAfter(this.element);
	
};

torchd.editor.prototype.getSelection = function() {
	var element = this.frame.get(0);

    if ( element.contentWindow.document.selection )
        return element.contentWindow.document.selection.createRange();
    else
        return element.contentWindow.getSelection();

};


// BROWSER SPECIFIC CLASSES
torchd.editor.Mozilla = function(element, params) {
	this.element = $(element);
	
	this.params = $.extend(torchd.editor.defaultParams, params);
		
	
};
torchd.editor.Mozilla.prototype = new torchd.editor();


torchd.editor.Mozilla.prototype.setFocusToNode = function(node) {
	$('#console').append('<p>Setting focus to node ' + node.get(0).tagName + '</p>');
    /**var range = this.document.createRange();
    var selection = this.getSelection();
    
    range.selectNodeContents(node.get(0));
    //selection.addRange(range);
    selection.collapse(node.get(0), 1);
    this.frame.contentWindow.focus();*/
    if (typeof this.getSelection != "undefined"
            && typeof this.document.createRange != "undefined") {
        var range = this.document.createRange();
        range.selectNodeContents(node.get(0));
        range.collapse(false);
        var sel = this.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof this.document.body.createTextRange != "undefined") {
        var textRange = this.document.body.createTextRange();
        textRange.moveToElementText(node.get(0));
        textRange.collapse(false);
        textRange.select();
    }
};

torchd.editor.Mozilla.prototype.getCurrentElement = function() {
	if(this.getSelection().anchorNode) {
		
		var element = this.getSelection().anchorNode.parentNode;
		if(element.tagName == 'BODY' || element.tagName == 'HTML') {
			this.currentElement = $(this.getSelection().anchorNode);
			if(this.currentElement.get(0).nodeType == 3) { // For some reason Mozilla doesn't let you select the first paragraph and just start typing
				var text = this.currentElement.text();
				// Fill the first paragraph with the text
				var firstParagraph = $('body', this.document).children('p').first();
				firstParagraph.prepend(text);
				this.currentElement.text('').remove();
				this.currentElement = firstParagraph;
				this.currentElement.children('span.clearfix').remove();
				this.setFocusToNode(this.currentElement);
				this.currentElement.append('<span class="clearfix"></span>');
			}

		}
		else {
			this.currentElement = $(this.getSelection().anchorNode.parentNode);
		}
	}
	else { 
		this.currentElement = false;
	}
};
torchd.editor.Mozilla.prototype.handleKeyPress = function() {
	var self = this;
	$(this.document).keydown(function(event) {
  		// Replace htmlentities with their codes, so any html/code that they put in won't get rendered as such
  		if(event.keyCode == 188 && event.shiftKey) {
  			event.preventDefault();
  			self.insertAtCaret("&lt;");
  		}
  		if(event.keyCode == 190 && event.shiftKey) {
  			event.preventDefault();
  			self.insertAtCaret("&gt;");
  		}
  		if(event.keyCode == 55 && event.shiftKey) {
  			event.preventDefault();
  			self.insertAtCaret("&amp;");
  		}
  		
  		
  		if(event.keyCode == 8) { // Delete key, check if there's anything left, and if not then create a p
 			var blocksArray = ['BLOCKQUOTE', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
 			var selfContent = self.currentElement.html().replace("/\\s*/g", "");

  			if($('body', self.document).html() == '<p><span class="clearfix"></span></p>') {
  				event.preventDefault();
  			}
			else if((!selfContent || selfContent == '<br/>' || selfContent == '<br>' || selfContent == '<spanclass="clearfix"></span>')) {
				event.preventDefault();
				self.insertBlock('p', false);
				
			}
  			else {
  				$('#console').append('<p>Body:' + $('body', self.document).html() + '</p>');
  			}

  		}
  		else if(event.keyCode == 13 && !event.shiftKey) { // Return Key
  			if(self.currentElement.is('div')) { // Didn't press shift to make a new line in the same element
  				self.insertBlock('p', false);
  			}
  		}

  		
  	});
  	
  	$(this.document).keyup(function(event) {
  		self.getCurrentElement();
  		console.log(self.currentElement);
  		//$('#console').html('<p>Current element is ' + self.currentElement.get(0).tagName + '</p>');
  		
  		//$('#console').append('<p>Current element: ' + self.currentElement.get(0).tagName + '</p>');
  		
  		
  		/**if(self.currentElement.is('body')) {
  			// Create a paragraph
  			var val = self.currentElement.html();
  			var p = $('<p/>').html(val);
  			self.currentElement.html('');
  			p.appendTo(self.currentElement);
  			
  			self.currentElement = p;
  			self.setFocusToNode(p);
  		}*/
  		/**else if(!self.currentElement.get(0).tagName) {
  			// Create a paragraph
  			var val = $('body', self.document).html();
  			var p = $('<p/>').html(val);
  			$('body', self.document).html('');
  			p.appendTo($('body', self.document));
  			
  			self.currentElement = p;
  			self.setFocusToNode(p);
  		}
  		
  		
  		else if(self.currentElement.is('div')) {
  			if(self.currentElement.get(0).parentNode.tagName == 'P') {
  				var current = self.currentElement;
  				self.currentElement = $(self.currentElement.get(0).parentNode);
  				current.replaceWith(current.html());
  				self.setFocusToNode(self.currentElement);
  			}
  			else if(self.currentElement.get(0).parentNode.tagName == 'BODY') {
  				self.insertBlock('P');
  			}
  		}
  		
  		
  		
  		
  		self.highlightButtons();
  		
  		// Finally, make the content of the textarea the content of the iframe
  		self.saveContent();*/
  		
  		
  	});
};

torchd.editor.Webkit = function(element, params) {
	this.element = $(element);
	var defaults = torchd.editor.defaultParams;
	defaults.imageUploadHandler = torchd.root + defaults.imageUploadHandler;
	defaults.imageUploadLocation = torchd.root + defaults.imageUploadLocation;
	defaults.imageResizer = torchd.root + defaults.imageResizer;
	defaults.imageRemoveHandler = torchd.root + defaults.imageRemoveHandler;
	defaults.uploadedImageList = torchd.root + defaults.uploadedImageList;
	defaults.iframeCSS = torchd.root + defaults.iframeCSS;
	this.params = $.extend(defaults, params);
		
	
};

torchd.editor.Webkit.prototype = new torchd.editor();

torchd.editor.Webkit.prototype.setFocusToNode = function(node) {
	$('#console').append('<p>Setting focus to node ' + node.get(0).tagName + '</p>');
    /**var range = this.document.createRange();
    var selection = this.getSelection();
    
    range.selectNodeContents(node.get(0));
    //selection.addRange(range);
    selection.collapse(node.get(0), 1);
    this.frame.contentWindow.focus();*/
    if (typeof this.getSelection != "undefined"
            && typeof this.document.createRange != "undefined") {
        var range = this.document.createRange();
        range.selectNodeContents(node.get(0));
        range.collapse(false);
        var sel = this.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof this.document.body.createTextRange != "undefined") {
        var textRange = this.document.body.createTextRange();
        textRange.moveToElementText(node.get(0));
        textRange.collapse(false);
        textRange.select();
    }
};

torchd.editor.Webkit.prototype.handleKeyPress = function() {
	var self = this;
	$(this.document).keydown(function(event) {
  		// Replace htmlentities with their codes, so any html/code that they put in won't get rendered as such
  		if(event.keyCode == 188 && event.shiftKey) {
  			event.preventDefault();
  			self.insertAtCaret("&lt;");
  		}
  		if(event.keyCode == 190 && event.shiftKey) {
  			event.preventDefault();
  			self.insertAtCaret("&gt;");
  		}
  		if(event.keyCode == 55 && event.shiftKey) {
  			event.preventDefault();
  			self.insertAtCaret("&amp;");
  		}
  		
  		if(event.keyCode == 8) { // Delete key, check if there's anything left, and if not then create a p
 			var blocksArray = ['BLOCKQUOTE', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
 			var selfContent = self.currentElement.html().replace("/\\s*/g", "");
  			if($('body', self.document).html() == '<p><span class="clearfix"></span></p>') {
  				event.preventDefault();
  			}
			else if((!selfContent || selfContent == '<br/>' || selfContent == '<spanclass="clearfix"></span>') && blocksArray.indexOf(self.currentElement.get(0).tagName) >= 0) {
				event.preventDefault();
				self.insertBlock('p', false);
				
			}
  			else {
  				$('#console').append('<p>Body:' + $('body', self.document).html() + '</p>');
  			}

  		}
  		
  		

  		
  	});
  	
  	$(this.document).keyup(function(event) {
  		self.getCurrentElement();
		// Webkit adds breaks sometimes, so we need to get rid of any breaks in the current element if there is no other text
		if(!self.currentElement.text()) {
			self.currentElement.children('br').remove();
		}
  		//$('#console').html('<p>Current element is ' + self.currentElement.get(0).tagName + '</p>');
  		
  		//$('#console').append('<p>Current element: ' + self.currentElement.get(0).tagName + '</p>');
  		
  		if(event.keyCode == 13 && !event.shiftKey) { // Return Key
  			if(self.currentElement.is('div')) { // Didn't press shift to make a new line in the same element
  				self.insertBlock('p', false);
  			}
  		}
  		
  		
  		
  		
  		/**if(self.currentElement.is('div')) {
  			if(self.currentElement.get(0).parentNode.tagName == 'P') {
  				var current = self.currentElement;
  				self.currentElement = $(self.currentElement.get(0).parentNode);
  				current.replaceWith(current.html());
  				self.setFocusToNode(self.currentElement.get(0));
  			}
  			else if(self.currentElement.get(0).parentNode.tagName == 'BODY') {
  				self.insertBlock('P');
  			}
  		}*/
  		$(self.document).find('span.clearfix').remove();
  		$(self.document).find('body').find('p,blockquote,h1,h2,h3,h4,h5,h6,pre').append('<span class="clearfix"></span>');
  		
  		
  		
  		
  		self.highlightButtons();
  		
  		// Finally, make the content of the textarea the content of the iframe
  		self.saveContent();
  		
  		
  	});
};



torchd.editor.Opera = function(element, params) {
	this.element = $(element);
	
	this.params = $.extend({
			imageUploadHandler:'upload-handler.php',
			imageUploadLocation:'/testing-environment/editor/uploads/',
			imageResizer:'/testing-environment/editor/image.php',
			imageRemoveHandler:'/testing-environment/editor/image-remove.php',
			uploadedImageList:'/testing-environment/editor/uploaded-image-list.php',
			iframeCSS:'iframe.css',
			plupload:{
				flashLocation:'/site-development/concerto-includes/includes/third-party/plupload/js/plupload.flash.swf',
				silverlightLocation:'/site-development/concerto-includes/includes/third-party/plupload/js/plupload.silverlight.xap'
			}
		},
		params);	
};

torchd.editor.Opera.prototype = new torchd.editor();

torchd.editor.Opera.prototype.getSelection = function() {
	var element = this.frame.get(0);

    if ( element.contentWindow.document.selection ) {
        return element.contentWindow.document.selection.createRange();
    }
    else {
        return element.contentWindow.getSelection();
    }

};

torchd.editor.Opera.prototype.getCurrentElement = function() {
	$('#console').append('getting current element<br />');
	if(this.document) {
		$('#console').append('has content window<br />');
	}
	else {
		$('#console').append('no content window<br/>');
	}
	$(this.document).focus();
	if(this.getSelection().anchorNode) {
		
		var element = this.getSelection().anchorNode.parentNode;
		if(element.tagName == 'BODY' || element.tagName == 'HTML') {
			this.currentElement = $(this.getSelection().anchorNode);
		}
		else {
			this.currentElement = $(this.getSelection().anchorNode.parentNode);
		}
		//$('#console').append('<p>Setting current element to '+this.currentElement.get(0).tagName+'</p>');
	}
	else { 
		this.currentElement = false;
	}
};

torchd.editor.Opera.prototype.handleKeyPress = function() {
	var self = this;
	$(this.document).keydown(function(event) {
  		// Replace htmlentities with their codes, so any html/code that they put in won't get rendered as such
  		if(event.keyCode == 188 && event.shiftKey) {
  			event.preventDefault();
  			self.insertAtCaret("&lt;");
  		}
  		if(event.keyCode == 190 && event.shiftKey) {
  			event.preventDefault();
  			self.insertAtCaret("&gt;");
  		}
  		if(event.keyCode == 55 && event.shiftKey) {
  			event.preventDefault();
  			self.insertAtCaret("&amp;");
  		}

  		
  	});
  	
  	$(this.document).keyup(function(event) {
		
  		//$('#console').html('<p>Current element is ' + self.currentElement.get(0).tagName + '</p>');
  		if(event.keyCode == 8) { // Delete key, check if there's anything left, and if not then create a p
  			if(!$('body', self.document).html()) {
  				var p = $('<p/>');
	  			self.currentElement.html('');
	  			p.appendTo($('body', self.document));
	  			
	  			self.currentElement = p;
	  			self.setFocusToNode(p);
  			}
  		}
  		else if(event.keyCode == 13 && !event.shiftKey) { // Return Key
  			if(self.currentElement.is('div')) { // Didn't press shift to make a new line in the same element
  				self.insertBlock('p', false);
  			}
  		}
  		//$('#console').append('<p>Current element: ' + self.currentElement.get(0).tagName + '</p>');
  		
  		
  		if(self.currentElement.is('body')) {
  			// Create a paragraph
  			var val = self.currentElement.html();
  			var p = $('<p/>').html(val);
  			self.currentElement.html('');
  			p.appendTo(self.currentElement);
  			
  			self.currentElement = p;
  			self.setFocusToNode(p);
  		}
  		else if(!self.currentElement.get(0).tagName) {
  			// Create a paragraph
  			var val = $('body', self.document).html();
  			var p = $('<p/>').html(val);
  			$('body', self.document).html('');
  			p.appendTo($('body', self.document));
  			
  			self.currentElement = p;
  			self.setFocusToNode(p);
  		}
  		
  		
  		else if(self.currentElement.is('div')) {
  			if(self.currentElement.get(0).parentNode.tagName == 'P') {
  				var current = self.currentElement;
  				self.currentElement = $(self.currentElement.get(0).parentNode);
  				current.replaceWith(current.html());
  				self.setFocusToNode(self.currentElement);
  			}
  			else if(self.currentElement.get(0).parentNode.tagName == 'BODY') {
  				self.insertBlock('P');
  			}
  		}
  		
  		
  		
  		
  		self.highlightButtons();
  		
  		// Finally, make the content of the textarea the content of the iframe
  		self.saveContent();
  		
  		
  	});
};


(function($){
	/**$.fn.torchd-editor = function(params) {
		return this.each(function() {
			if($.browser.msie) {
				var self = new torchd.editor.MSIE(this, params);
			}
			else if($.browser.mozilla) {
				var self = new torchd.editor.Mozilla(this, params);
			}
			else if($.browser.webkit) {
				var self = new torchd.editor.Webkit(this, params);
			}
			else if($.browser.opera) {
				var self = new torchd.editor.Opera(this, params);
			}
			else {
				var self = new torchd.editor(this, params);
			}
			self.initialize();
		});


	};*/
	
	$.fn.document = function() {
    	
        var element = this.get(0);

        if ( element.nodeName.toLowerCase() == 'iframe' )
        {
            return element.contentWindow.document;
            /*
            return ( $.browser.msie )
                ? document.frames[element.id].document
                : element.contentWindow.document // contentDocument;
             */
        }
        return this;
    };
    $.fn.documentSelection = function()
    {
        var element = this.get(0);

        if ( element.contentWindow.document.selection )
            return element.contentWindow.document.selection.createRange();
        else
            return element.contentWindow.getSelection();
    };
    $.fn.realWidth = function() {
    	return $(this).width() + parseInt($(this).css('padding-left')) + parseInt($(this).css('padding-right')) + parseInt($(this).css('border-left-width')) + parseInt($(this).css('border-right-width'));
		
    };
    
    $.fn.realHeight = function() {
    	return $(this).height() + parseInt($(this).css('padding-top')) + parseInt($(this).css('padding-bottom')) + parseInt($(this).css('border-bottom-width')) + parseInt($(this).css('border-top-width'));
    };
    
    
   
})(jQuery);







