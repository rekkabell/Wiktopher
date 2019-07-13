function Note (app) {
  this.el = document.getElementById('note')
  this.el.className = 'hidden'
  this.el.addEventListener('click', () => { app.note.hide() })
  this.app = app

  this.update = function (target, y) {
    this.el.className = ''
    this.el.style.top = `${y}px`
    let entry = this.find(target)
    this.el.innerHTML = entry ? `<h2>${target.capitalize()}</h2>${new Runic(entry.TEXT)}` : `<h2>${target.capitalize()}</h2><p>Unknown lexicon item <b>${target}</b>,<br />will be added shortly.</p>`
  }

  this.find = function (target) {
    return this.app.lexicon[target.toUpperCase()]
  }

  this.hide = function () {
    this.el.className = 'hidden'
  }
}
