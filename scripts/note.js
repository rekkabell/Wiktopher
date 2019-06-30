function Note (client) {
  this.el = document.getElementById('note')
  this.el.className = 'hidden'
  this.el.addEventListener('click', () => { client.note.hide() })
  this.client = client

  this.update = function (target, y) {
    this.el.className = ''
    this.el.style.top = `${y}px`
    let entry = this.find(target)
    this.el.innerHTML = entry ? `<h2>${target.capitalize()}</h2>${new Runic(entry.TEXT)}` : `<h2>${target.capitalize()}</h2><p>Unknown lexicon item <b>${target}</b>,<br />will be added shortly.</p>`
  }

  this.find = function (target) {
    return this.client.lexicon[target.toUpperCase()]
  }

  this.hide = function () {
    this.el.className = 'hidden'
  }
}
