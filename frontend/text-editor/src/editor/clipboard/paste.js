/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) KALEIDOS INC
 */

import {
  mapContentFragmentFromHTML,
  mapContentFragmentFromString,
} from "../content/dom/Content.js";
import { TextEditor } from "../TextEditor.js";

/**
 * Returns a document fragment of text plain data.
 *
 * @param {DataTransfer} clipboardData
 * @returns {DocumentFragment}
 */
function getPlainFragmentFromClipboardData(clipboardData) {
  const plain = clipboardData.getData("text/plain");
  return mapContentFragmentFromString(
    plain,
    selectionController.currentStyle,
  );
}

/**
 * Returns a document fragment of html data.
 *
 * @param {DataTransfer} clipboardData
 * @returns {DocumentFragment}
 */
function getFormattedFragmentFromClipboardData(clipboardData) {
  const html = clipboardData.getData("text/html");
  return mapContentFragmentFromHTML(
    html,
    selectionController.currentStyle,
  );
}

/**
 * Returns a document fragment of html or plain data.
 *
 * @param {DataTransfer} clipboardData
 * @returns {DocumentFragment}
 */
function getFormattedOrPlainFragmentFromClipboardData(clipboardData) {
  if (clipboardData.types.includes("text/html")) {
    return getFormattedFragmentFromClipboardData(clipboardData);
  } else if (clipboardData.types.includes("text/plain")) {
    return getPlainFragmentFromClipboardData(clipboardData);
  }
}

/**
 * When the user pastes some HTML, what we do is generate
 * a new DOM based on what the user pasted and then we
 * insert it in the appropiate part (see `insertFromPaste` command).
 *
 * @param {ClipboardEvent} event
 * @param {TextEditor} editor
 * @param {SelectionController} selectionController
 * @returns {void}
 */
export function paste(event, editor, selectionController) {
  // We need to prevent default behavior
  // because we don't allow any HTML to
  // be pasted.
  event.preventDefault();

  let fragment = null;
  if (editor.options.onlyPlainTextPaste) {
    fragment = getPlainFragmentFromClipboardData(event.clipboardData);
  } else {
    fragment = getFormattedOrPlainFragmentFromClipboardData(event.clipboardData);
  }

  if (!fragment) {
    // NOOP
    return;
  }

  if (selectionController.isCollapsed) {
    selectionController.insertPaste(fragment);
  } else {
    selectionController.replaceWithPaste(fragment);
  }
}
