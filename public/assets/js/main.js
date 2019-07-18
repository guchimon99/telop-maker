(function(){

  var TMP_KEY = "TMP_KEY",
      COLOR_RED = "#FF0000",
      COLOR_WHITE = "#FFFFFF",
      COLOR_BLACK = "#000000",
      WIDTH = 1600,
      HEIGHT = 900,
      GUTTER_Y = 40,
      GUTTER_X = 50,
      FONT_WEIGHT_NORMAL = "normal",
      FONT_WEIGHT_BOLD = "bold",
      TEXT_ALIGN_LEFT = "left",
      TEXT_ALIGN_CENTER = "center",
      // FONT_FAMILY_SERIF = "'Noto Serif JP', serif",
      FONT_FAMILY_SANS_SERIF = "'Noto Sans JP', sans-serif",

      TITLE_FONT_FAMILY = FONT_FAMILY_SANS_SERIF,
      TITLE_FONT_WEIGHT = FONT_WEIGHT_BOLD,
      TITLE_FONT_SIZE = 50,
      TITLE_LINE_HEIGHT = 1.2,
      TITLE_FONT_COLOR = COLOR_WHITE,
      TITLE_STROKE_COLOR = COLOR_BLACK,
      TITLE_STROKE_WIDTH = 8,
      TITLE_FONT = [TITLE_FONT_WEIGHT, TITLE_FONT_SIZE + "px",  TITLE_FONT_FAMILY].join(" "),
      TITLE_TEXT_ALIGN = TEXT_ALIGN_LEFT,
      TITLE_X = GUTTER_X,
      TITLE_Y = GUTTER_Y + TITLE_FONT_SIZE,

      SUBTITLE_FONT_FAMILY = FONT_FAMILY_SANS_SERIF,
      SUBTITLE_FONT_WEIGHT = FONT_WEIGHT_NORMAL,
      SUBTITLE_FONT_SIZE = 32,
      SUBTITLE_LINE_HEIGHT = 1.2,
      SUBTITLE_FONT_COLOR = COLOR_BLACK,
      SUBTITLE_BACKGROUND_COLOR = COLOR_WHITE,
      SUBTITLE_FONT = [SUBTITLE_FONT_WEIGHT, SUBTITLE_FONT_SIZE + "px",  TITLE_FONT_FAMILY].join(" "),
      SUBTITLE_TEXT_ALIGN = TEXT_ALIGN_LEFT,
      SUBTITLE_PADDING = 16,

      WORDS_FONT_FAMILY = FONT_FAMILY_SANS_SERIF,
      WORDS_FONT_WEIGHT = FONT_WEIGHT_BOLD,
      WORDS_FONT_SIZE = 80,
      WORDS_LINE_HEIGHT = 1.2,
      WORDS_FONT = [WORDS_FONT_WEIGHT, WORDS_FONT_SIZE + "px",  WORDS_FONT_FAMILY].join(" "),
      WORDS_FONT_COLOR = COLOR_WHITE,
      WORDS_OUTER_LINE_WIDTH = 20,
      WORDS_OUTER_LINE_COLOR = COLOR_WHITE,
      WORDS_INNER_LINE_WIDTH = 10,
      WORDS_INNER_LINE_COLOR = COLOR_RED,
      WORDS_TEXT_ALIGN = TEXT_ALIGN_CENTER

  var canvas, ctx, scene, scenes, sceneList, sceneListItemTemplate,
      appendSceneButton, removeSceneButton, downloadButton,
      nameInput, titleInput, subtitleInput, wordsInput

  function save() {
    localStorage.setItem(TMP_KEY, JSON.stringify(scenes))
  }

  function load() {
    var json = localStorage.getItem(TMP_KEY)
    if (!json) {
      return null
    }
    return JSON.parse(json)
  }

  function createNewScene() {
    return {
      id: "S-" + new Date().getTime(),
      name: "新しいシーン",
      title: scene ? scene.title : "タイトル",
      subtitle: scene ? scene.subtitle : "サブタイトル",
      words: scene ? scene.words : "セリフ",
    }
  }

  function sceneListItemClickHandler(event) {
    var id = event.target.getAttribute("data-scene-id")
    var scene = scenes.find(function(scene){ return scene.id == id })
    setScene(scene)
  }

  function appendSceneButtonClickHandler(){
    var scene = createNewScene()
    scenes.push(scene)
    appendToSceneList(scene)
    setScene(scene)
  }

  function removeSceneButtonClickHandler(){
    if (!scene) {
      return
    }

    var id = scene.id

    sceneList.querySelector("[data-scene-id='" + scene.id + "']").remove()
    scenes = scenes.filter(function(scene){ return scene.id != id })

    if (scenes.length < 1) {
      var newScene = createNewScene()
      scenes.push(newScene)
      appendToSceneList(newScene)
    }

    setScene(scenes[scenes.length - 1])

    save()
  }

  function nameChangeHandler(event) {
    scene.name = event.target.value
    updateSceneListItem(scene)
    save()
  }

  function titleChangeHandler(event) {
    scene.title = event.target.value
    render()
    save()
  }

  function subtitleChangeHandler(event) {
    scene.subtitle = event.target.value
    render()
    save()
  }

  function wordsChangeHandler(event) {
    scene.words = event.target.value
    render()
    save()
  }

  function disabledDownloadButtonClickHandler(event) {
    event.preventDefault()
  }

  function setScene(_scene) {
    scene = _scene
    nameInput.value = scene.name
    titleInput.value = scene.title
    subtitleInput.value = scene.subtitle
    wordsInput.value = scene.words
    downloadButton.setAttribute("download", scene.name + ".png")

    var current = sceneList.querySelector(".bg-gray-200")
    if (current) {
      current.classList.remove("bg-gray-200")
    }

    sceneList.querySelector("[data-scene-id='" + scene.id + "']").classList.add("bg-gray-200")

    render()
  }

  function appendToSceneList(scene) {
    var flagment = document.importNode(sceneListItemTemplate.content, true)

    var button = flagment.querySelector("button")
    button.innerText = scene.name
    button.setAttribute("data-scene-id", scene.id)
    button.addEventListener("click", sceneListItemClickHandler)

    sceneList.appendChild(flagment)
  }

  function updateSceneListItem(scene) {
    var id = scene.id
    var item = sceneList.querySelector("[data-scene-id='" + id + "']")
    item.innerText = scene.name || "無名のシーン"
  }

  function disableDownloadButton(){
    downloadButton.innerText = "処理中"
    downloadButton.classList.remove("bg-blue-500")
    downloadButton.classList.add("bg-gray-500")
    downloadButton.href = "#"
    downloadButton.addEventListener("click", disabledDownloadButtonClickHandler)
  }

  function enableDownloadButton(url) {
    downloadButton.innerText = "ダウンロードする"
    downloadButton.classList.add("bg-blue-500")
    downloadButton.classList.remove("bg-gray-500")
    downloadButton.href = url
    downloadButton.removeEventListener("click", disabledDownloadButtonClickHandler)
  }

  function render() {

    disableDownloadButton()

    var title = scene.title,
        subtitle = scene.subtitle,
        words = scene.words

    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    if (title) {
      renderTitle(title)
    }

    if (subtitle) {
      renderSubtitle(subtitle)
    }

    if (words) {
      renderWords(words)
    }

    var url = canvas.toDataURL("image/png")
    enableDownloadButton(url)
  }

  function renderTitle(title) {
    title.split("\n").forEach(function(line, index){

      var x = TITLE_X,
          y = TITLE_Y + TITLE_FONT_SIZE * TITLE_LINE_HEIGHT * index

      Array.from({ length: 8 }).forEach(function(_, i){
        ctx.font = TITLE_FONT
        ctx.strokeStyle = TITLE_STROKE_COLOR
        ctx.lineWidth = TITLE_STROKE_WIDTH
        ctx.textAlign = TITLE_TEXT_ALIGN
        ctx.lineJoin = "round"
        ctx.strokeText(line, x + i, y + i)
      })

      ctx.font = TITLE_FONT
      ctx.fillStyle = TITLE_FONT_COLOR
      ctx.textAlign = TITLE_TEXT_ALIGN
      ctx.fillText(line, x, y)
    })
  }

  function renderSubtitle(subtitle) {

    var lines = subtitle.split("\n")
    var width = Math.max.apply(null, lines.map(function(line){
      return measureTextWidth(SUBTITLE_FONT_FAMILY, SUBTITLE_FONT_WEIGHT, SUBTITLE_FONT_SIZE, line)
    })) + SUBTITLE_PADDING * 2
    var height = lines.length * SUBTITLE_FONT_SIZE * SUBTITLE_LINE_HEIGHT + SUBTITLE_PADDING * 2

    var x = WIDTH - GUTTER_X - width
    var y = GUTTER_Y

    ctx.fillStyle = SUBTITLE_BACKGROUND_COLOR
    ctx.fillRect(x, y, width, height)

    ctx.font = SUBTITLE_FONT
    ctx.fillStyle = SUBTITLE_FONT_COLOR
    ctx.textAlign = SUBTITLE_TEXT_ALIGN
    lines.forEach(function(line, index){
      ctx.fillText(line,
        x + SUBTITLE_PADDING,
        y + SUBTITLE_PADDING + SUBTITLE_FONT_SIZE + index * SUBTITLE_FONT_SIZE * SUBTITLE_LINE_HEIGHT
      )
    })
  }

  function renderWords(words) {
    var lines = words.split("\n")
    var x = WIDTH / 2
    var y = HEIGHT - GUTTER_Y - (lines.length - 1) * WORDS_FONT_SIZE * WORDS_LINE_HEIGHT

    ctx.font = WORDS_FONT
    ctx.textAlign = WORDS_TEXT_ALIGN

    lines.forEach(function(line, index){

      var lineX = x, lineY = y + index * WORDS_FONT_SIZE * WORDS_LINE_HEIGHT

      ctx.lineWidth = WORDS_OUTER_LINE_WIDTH
      ctx.strokeStyle = WORDS_OUTER_LINE_COLOR
      ctx.lineJoin = "round"
      ctx.strokeText(line, lineX, lineY)

      ctx.lineWidth = WORDS_INNER_LINE_WIDTH
      ctx.strokeStyle = WORDS_INNER_LINE_COLOR
      ctx.lineJoin = "round"
      ctx.strokeText(line, lineX, lineY)

      ctx.fillStyle = WORDS_FONT_COLOR
      ctx.fillText(line, lineX, lineY)
    })
  }

  function measureTextWidth (fontFamily, fontWeight, fontSize, text) {
    var div = document.createElement("div")
    div.innerText = text
    div.style.fontFamily = fontFamily
    div.style.fontWeight = fontWeight
    div.style.fontSize = fontSize + "px"
    div.style.position = "fixed"
    div.style.top = "100%"
    div.style.visibility = "hidden"
    document.body.appendChild(div)
    var width = div.offsetWidth
    div.remove()
    return width
  }

  function init() {
    canvas = document.querySelector("#canvas")
    ctx = canvas.getContext("2d")
    sceneList = document.querySelector("#scene-list")
    sceneListItemTemplate = document.querySelector('#scene-list-item')
    appendSceneButton = document.querySelector("#append-scene-button")
    removeSceneButton = document.querySelector("#remove-scene-button")
    nameInput = document.querySelector("#name-input")
    titleInput = document.querySelector("#title-input")
    subtitleInput = document.querySelector("#subtitle-input")
    wordsInput = document.querySelector("#words-input")
    downloadButton = document.querySelector("#download-button")

    appendSceneButton.addEventListener("click", appendSceneButtonClickHandler)
    removeSceneButton.addEventListener("click", removeSceneButtonClickHandler)

    var eventTypes = ["keydown", "keyup", "keypress", "change", "paste", "blur", "input"]
    eventTypes.forEach(function(type){
      nameInput.addEventListener(type, nameChangeHandler)
      titleInput.addEventListener(type, titleChangeHandler)
      subtitleInput.addEventListener(type, subtitleChangeHandler)
      wordsInput.addEventListener(type, wordsChangeHandler)
    })

    scenes = load() || []
    if(scenes.length < 1){
      scenes.push(createNewScene())
      save()
    }
    scenes.forEach(function(scene){ appendToSceneList(scene) })
    setScene(scenes[0])
  }

  window.addEventListener("load", init)
})()
