function Navi (client) {
  this.el = document.getElementById('navi')
  this.client = client

  this.update = function () {
    let html = ''
    for (id in this.client.story) {
      if (this.client.story[id].HIDE) { continue }
      html += `<ln class='chapter ${this.client.index == id ? 'selected' : ''}'><a onclick='client.load("${id}")'>${id.capitalize()}</a></ln>`
    }
    html += `<ln><a onclick='client.load("lexicon")'>The Lexicon</a></ln>`
    this.el.innerHTML = `<list>${html}</list>`
  }
}
