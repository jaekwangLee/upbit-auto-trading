const fillTxtWithChar = (txt, char, len) => {
  if (typeof txt !== 'string') {
    txt = txt.toString();
  }

  if (txt.length >= len) {
    return txt;
  }

  for (let i = 0; i < len - txt.length; i++) {
    txt = char + txt;
  }

  return txt;
}

const fillTimeTxt = (txt) => {
  return fillTxtWithChar(txt, '0', 2);
}

export { fillTxtWithChar, fillTimeTxt };