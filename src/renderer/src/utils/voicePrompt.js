function voicePrompt(text) {
  console.log(text)
  return new Audio('http://tts.baidu.com/text2audio?cuid=baiduid&lan=zh&ctp=1&pdt=311&text=' + text)
}

export { voicePrompt }
