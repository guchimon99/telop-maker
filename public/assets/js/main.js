(function(){

  var TMP_KEY = "TMP_KEY",
      COLOR_RED = "#FF0000",
      COLOR_WHITE = "#FFFFFF",
      COLOR_BLACK = "#000000",
      WIDTH = 1600,
      HEIGHT = 900,
      GUTTER = 25,
      // FONT_FAMILY_SERIF = "'Noto Serif JP', serif",
      FONT_FAMILY_SANS_SERIF = "'Noto Sans JP', sans-serif",
      TITLE_FONT_SIZE = 50,
      SUBTITLE_FONT_SIZE = 32,
      WORDS_FONT_SIZE = 80

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
    ctx.fillStyle = COLOR_WHITE
    ctx.fillRect(0, GUTTER, 300, TITLE_FONT_SIZE * 1.8)

    ctx.fillStyle = COLOR_RED
    ctx.fillRect(0, GUTTER, 20, TITLE_FONT_SIZE * 1.8)

    ctx.font = [TITLE_FONT_SIZE + "px",  FONT_FAMILY_SANS_SERIF].join(" ")
    ctx.fillStyle = COLOR_BLACK
    ctx.textAlign = "left"
    ctx.fillText(title, GUTTER + 20, 90)
  }

  function renderSubtitle(subtitle) {
    ctx.fillStyle = COLOR_RED
    ctx.fillRect(WIDTH - GUTTER - 300, GUTTER, 300, 60)

    ctx.font = [SUBTITLE_FONT_SIZE + "px",  FONT_FAMILY_SANS_SERIF].join(" ")
    ctx.fillStyle = COLOR_WHITE
    ctx.textAlign = "right"
    ctx.fillText(subtitle, WIDTH - GUTTER - 20, 70)
  }

  function renderWords(words) {
    ctx.fillStyle = "rgba(0,0,0,0.5)"
    ctx.fillRect(
      WIDTH * 0.2,
      HEIGHT - GUTTER - WORDS_FONT_SIZE * 1.4,
      WIDTH * 0.6,
      WORDS_FONT_SIZE * 1.4
    )

    ctx.font = [WORDS_FONT_SIZE + "px",  FONT_FAMILY_SANS_SERIF].join(" ")
    ctx.textAlign = "center"
    ctx.fillStyle = COLOR_WHITE
    ctx.fillText(words, WIDTH / 2, HEIGHT - GUTTER - 20)
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
