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
figma.ui.resize(370, 600);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
const storageKey = 'settingsData';
const defaultDisplayType = 'display-type-tile';
const defaultSymbolType = 'symbol-type-sfsymbols';
const defaultSettingsData = { autoPaste: false, displayType: defaultDisplayType, symbolType: defaultSymbolType };
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
        figma.ui.postMessage({ settings: true, data: settingsData });
    });
}
function pasteFunction(nodeObjectsArray, copiedText) {
    if (nodeObjectsArray.length) {
        for (let i = 0; i < nodeObjectsArray.length; i++) {
            if (nodeObjectsArray[i].type == 'TEXT') {
                updateText(nodeObjectsArray[i], copiedText);
                textObjectLength++;
            }
            else if (nodeObjectsArray[i].type == 'GROUP' || nodeObjectsArray[i].type == 'FRAME' || nodeObjectsArray[i].type == 'COMPONENT' || nodeObjectsArray[i].type == 'INSTANCE') {
                pasteFunction(nodeObjectsArray[i].children, copiedText);
            }
        }
        if (textObjectLength == 0) {
            // none
        }
    }
    return textObjectLength;
}
function updateText(selectedItem, pasteValue) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectedItemFontName = selectedItem.getRangeFontName(0, 1);
        let textStyleId = selectedItem.getRangeTextStyleId(0, 1);
        yield figma.loadFontAsync({ family: selectedItemFontName.family, style: selectedItemFontName.style });
        if (selectedItem.fontName == figma.mixed) {
            selectedItem.setRangeFontName(0, selectedItem.characters.length, selectedItemFontName);
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
figma.ui.onmessage = message => {
    if (message.copied) {
        if (settingsData.autoPaste) {
            let num = pasteFunction(figma.currentPage.selection, message.copiedGlyph);
        }
    }
    else if (message.updatedSettingsData) {
        figma.clientStorage.setAsync(storageKey, JSON.stringify(message.updatedSettingsData));
    }
};
