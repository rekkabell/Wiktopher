function Navi (app) {
  this.el = document.getElementById('navi')
  this.app = app

  this.update = function () {
    let html = ''
    for (id in this.app.story) {
      if (this.app.story[id].HIDE) { continue }
      html += `<ln class='chapter ${this.app.index == id ? 'selected' : ''}'><a onclick='app.load("${id}")'>${id.capitalize()}</a></ln>`
    }
    html += `<ln><a onclick='app.load("lexicon")'>The Lexicon</a></ln>`
    this.el.innerHTML = `<list>${html}</list>`
  }
}
