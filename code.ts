// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__)
figma.ui.resize(370, 600)
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
const storageKey = 'settingsData'
const defaultDisplayType = 'display-type-tile'
const defaultSymbolType = 'symbol-type-sfsymbols'
const defaultSettingsData = { clickAction: 'copy', displayType: defaultDisplayType, symbolType: defaultSymbolType }
var settingsData = JSON.parse(JSON.stringify(defaultSettingsData));
var textObjectLength = 0
init()

function init(){
  figma.clientStorage.getAsync(storageKey).then(result => {
    if (result){
      Object.keys(defaultSettingsData).forEach((key) => {
        let data = JSON.parse(result)
        settingsData[key] = data[key]
        if(!settingsData[key]){
          settingsData[key] = defaultSettingsData[key]
        }
      });
      figma.clientStorage.setAsync(storageKey, JSON.stringify(settingsData))
    } else {
      figma.clientStorage.setAsync(storageKey, JSON.stringify(defaultSettingsData))
      settingsData = defaultSettingsData
    }
    figma.ui.postMessage({ settings : true, data : settingsData })
  })
}

function pasteFunction(nodeObjectsArray, copiedText, symbolType){
  if (nodeObjectsArray.length){
    for (let i = 0; i < nodeObjectsArray.length; i++) {
      if(nodeObjectsArray[i].type == 'TEXT'){
        updateText(nodeObjectsArray[i], copiedText, symbolType)
        textObjectLength++
      } else if (nodeObjectsArray[i].type == 'GROUP' || nodeObjectsArray[i].type == 'FRAME' || nodeObjectsArray[i].type == 'COMPONENT' || nodeObjectsArray[i].type == 'INSTANCE'){
        pasteFunction(nodeObjectsArray[i].children, copiedText, symbolType)
      }
    }
    if (textObjectLength == 0){
      // none
    }
  }
  return textObjectLength
}

async function updateText(selectedItem, pasteValue, symbolType) {
  let selectedItemFontName = selectedItem.getRangeFontName(0, 1)
  let textStyleId = selectedItem.getRangeTextStyleId(0, 1)
  if(selectedItemFontName.family == 'SF Pro Display' || selectedItemFontName.family == 'SF Compact Display'){
    if(symbolType == "material-icons"){
      let tempFontName = {family: '', style: ''}
      tempFontName.family = 'Material Icons'
      tempFontName.style = "Regular"
      await figma.loadFontAsync({ family: tempFontName.family, style: tempFontName.style })
      selectedItem.setRangeFontName(0, selectedItem.characters.length, tempFontName)
    }else{
      await figma.loadFontAsync({ family: selectedItemFontName.family, style: selectedItemFontName.style })
    }
  }else if(selectedItemFontName.family == 'Material Icons'){
    if(symbolType == "sf-symbols"){
      let tempFontName = {family: '', style: ''}
      tempFontName.family = 'SF Pro Display'
      tempFontName.style = "Regular"
      await figma.loadFontAsync({ family: tempFontName.family, style: tempFontName.style })
      selectedItem.setRangeFontName(0, selectedItem.characters.length, tempFontName)
    }else{
      await figma.loadFontAsync({ family: selectedItemFontName.family, style: selectedItemFontName.style })
    }
  }else{
    if(symbolType == "sf-symbols"){
      let tempFontName = {family: '', style: ''}
      tempFontName.family = 'SF Pro Display'
      tempFontName.style = "Regular"
      await figma.loadFontAsync({ family: tempFontName.family, style: tempFontName.style })
      selectedItem.setRangeFontName(0, selectedItem.characters.length, tempFontName)
    }else{
      let tempFontName = {family: '', style: ''}
      tempFontName.family = 'Material Icons'
      tempFontName.style = "Regular"
      await figma.loadFontAsync({ family: tempFontName.family, style: tempFontName.style })
      selectedItem.setRangeFontName(0, selectedItem.characters.length, tempFontName)
    }
  }

  if(textStyleId){
    selectedItem.setRangeTextStyleId(0, selectedItem.characters.length, textStyleId)
  }else{
    selectedItem.setRangeFontSize(0, selectedItem.characters.length, selectedItem.getRangeFontSize(0, 1))
    selectedItem.setRangeTextCase(0, selectedItem.characters.length, selectedItem.getRangeTextCase(0, 1))
    selectedItem.setRangeTextDecoration(0, selectedItem.characters.length, selectedItem.getRangeTextDecoration(0, 1))
    selectedItem.setRangeLetterSpacing(0, selectedItem.characters.length, selectedItem.getRangeLetterSpacing(0, 1))
    selectedItem.setRangeLineHeight(0, selectedItem.characters.length, selectedItem.getRangeLineHeight(0, 1))
  }

  if(selectedItem.getRangeFillStyleId(0, 1)){
    selectedItem.setRangeFillStyleId(0, selectedItem.characters.length, selectedItem.getRangeFillStyleId(0, 1))
  }else{
    selectedItem.setRangeFills(0, selectedItem.characters.length, selectedItem.getRangeFills(0, 1))
  }
  selectedItem.characters = pasteValue
}

figma.ui.onmessage = message => {
  if (message.copied) {
    if (settingsData.clickAction == 'paste'){
      let num = pasteFunction(figma.currentPage.selection, message.copiedGlyph, message.symbolType)
    }
  }else if(message.updatedSettingsData){
    settingsData = message.updatedSettingsData
    figma.clientStorage.setAsync(storageKey, JSON.stringify(message.updatedSettingsData))
  }
}
