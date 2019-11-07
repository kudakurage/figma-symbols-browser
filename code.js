// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
const storageKey = 'settingsData';
const defaultDisplayType = 'display-type-tile';
const defaultSymbolType = 'symbol-type-sfsymbols';
const defaultSettingsData = { clickAction: 'create', displayType: defaultDisplayType, symbolType: defaultSymbolType, windowHeight: 600, fontSize: 40 };
var settingsData = JSON.parse(JSON.stringify(defaultSettingsData));
var textObjectLength = 0;
init();
function init() {
    figma.clientStorage.getAsync(storageKey).then(result => {
        if (result) {
            Object.keys(defaultSettingsData).forEach((key) => {
                let data = JSON.parse(result);
                settingsData[key] = data[key];
                if (!settingsData[key]) {
                    settingsData[key] = defaultSettingsData[key];
                }
            });
            figma.clientStorage.setAsync(storageKey, JSON.stringify(settingsData));
        }
        else {
            figma.clientStorage.setAsync(storageKey, JSON.stringify(defaultSettingsData));
            settingsData = defaultSettingsData;
        }
        figma.ui.resize(370, parseInt(settingsData.windowHeight));
        figma.ui.postMessage({ settings: true, data: settingsData });
    });
}
function pasteFunction(nodeObjectsArray, copiedText, symbolType) {
    if (nodeObjectsArray.length) {
        for (let i = 0; i < nodeObjectsArray.length; i++) {
            if (nodeObjectsArray[i].type == 'TEXT') {
                updateText(nodeObjectsArray[i], copiedText, symbolType);
                textObjectLength++;
            }
        }
        if (textObjectLength == 0) {
            // none
            createTextAndPaste(copiedText, symbolType);
            textObjectLength++;
        }
    }
    else {
        createTextAndPaste(copiedText, symbolType);
    }
    return textObjectLength;
}
function createFunction(copiedText, symbolType) {
    console.log('createFunction');
    createTextAndPaste(copiedText, symbolType);
    return textObjectLength;
}
function updateText(selectedItem, pasteValue, symbolType) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectedItemFontName = selectedItem.getRangeFontName(0, 1);
        let textStyleId = selectedItem.getRangeTextStyleId(0, 1);
        if (selectedItemFontName.family == 'SF Pro Display' || selectedItemFontName.family == 'SF Compact Display') {
            if (symbolType == "material-icons") {
                let tempFontName = { family: '', style: '' };
                tempFontName.family = 'Material Icons';
                tempFontName.style = "Regular";
                yield figma.loadFontAsync({ family: tempFontName.family, style: tempFontName.style });
                selectedItem.setRangeFontName(0, selectedItem.characters.length, tempFontName);
            }
            else {
                yield figma.loadFontAsync({ family: selectedItemFontName.family, style: selectedItemFontName.style });
            }
        }
        else if (selectedItemFontName.family == 'Material Icons') {
            if (symbolType == "sf-symbols") {
                let tempFontName = { family: '', style: '' };
                tempFontName.family = 'SF Pro Display';
                tempFontName.style = "Regular";
                yield figma.loadFontAsync({ family: tempFontName.family, style: tempFontName.style });
                selectedItem.setRangeFontName(0, selectedItem.characters.length, tempFontName);
            }
            else {
                yield figma.loadFontAsync({ family: selectedItemFontName.family, style: selectedItemFontName.style });
            }
        }
        else {
            if (symbolType == "sf-symbols") {
                let tempFontName = { family: '', style: '' };
                tempFontName.family = 'SF Pro Display';
                tempFontName.style = "Regular";
                yield figma.loadFontAsync({ family: tempFontName.family, style: tempFontName.style });
                selectedItem.setRangeFontName(0, selectedItem.characters.length, tempFontName);
            }
            else {
                let tempFontName = { family: '', style: '' };
                tempFontName.family = 'Material Icons';
                tempFontName.style = "Regular";
                yield figma.loadFontAsync({ family: tempFontName.family, style: tempFontName.style });
                selectedItem.setRangeFontName(0, selectedItem.characters.length, tempFontName);
            }
        }
        if (textStyleId) {
            selectedItem.setRangeTextStyleId(0, selectedItem.characters.length, textStyleId);
        }
        else {
            selectedItem.setRangeFontSize(0, selectedItem.characters.length, selectedItem.getRangeFontSize(0, 1));
            selectedItem.setRangeTextCase(0, selectedItem.characters.length, selectedItem.getRangeTextCase(0, 1));
            selectedItem.setRangeTextDecoration(0, selectedItem.characters.length, selectedItem.getRangeTextDecoration(0, 1));
            selectedItem.setRangeLetterSpacing(0, selectedItem.characters.length, selectedItem.getRangeLetterSpacing(0, 1));
            selectedItem.setRangeLineHeight(0, selectedItem.characters.length, selectedItem.getRangeLineHeight(0, 1));
        }
        if (selectedItem.getRangeFillStyleId(0, 1)) {
            selectedItem.setRangeFillStyleId(0, selectedItem.characters.length, selectedItem.getRangeFillStyleId(0, 1));
        }
        else {
            selectedItem.setRangeFills(0, selectedItem.characters.length, selectedItem.getRangeFills(0, 1));
        }
        selectedItem.characters = pasteValue;
    });
}
function createTextAndPaste(pasteValue, symbolType) {
    return __awaiter(this, void 0, void 0, function* () {
        let tempFontName = { family: '', style: '' };
        if (symbolType == "material-icons") {
            tempFontName.family = 'Material Icons';
            tempFontName.style = "Regular";
        }
        else {
            tempFontName.family = 'SF Pro Display';
            tempFontName.style = "Regular";
        }
        yield figma.loadFontAsync({ family: tempFontName.family, style: tempFontName.style });
        const newTextNode = figma.createText();
        newTextNode.fontName = tempFontName;
        newTextNode.fontSize = Number(settingsData.fontSize);
        newTextNode.characters = pasteValue;
        newTextNode.x = figma.viewport.center.x - (newTextNode.width / 2);
        newTextNode.y = figma.viewport.center.y - (newTextNode.height / 2);
        figma.currentPage.appendChild(newTextNode);
        figma.currentPage.selection = [newTextNode];
        return newTextNode;
    });
}
figma.ui.onmessage = message => {
    if (message.copied) {
        console.log(settingsData.clickAction);
        if (settingsData.clickAction == 'paste') {
            let num = pasteFunction(figma.currentPage.selection, message.copiedGlyph, message.symbolType);
            textObjectLength = 0;
        }
        if (settingsData.clickAction == 'create') {
            console.log(settingsData.clickAction);
            let num = createFunction(message.copiedGlyph, message.symbolType);
            textObjectLength = 0;
        }
    }
    else if (message.updatedSettingsData) {
        if (settingsData.windowHeight != message.updatedSettingsData.windowHeight) {
            figma.ui.resize(370, parseInt(message.updatedSettingsData.windowHeight));
        }
        settingsData = message.updatedSettingsData;
        figma.clientStorage.setAsync(storageKey, JSON.stringify(message.updatedSettingsData));
    }
};
