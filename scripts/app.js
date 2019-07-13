function App (story, lexicon) {
  this.el = document.getElementById('app')
  this.text_el = document.getElementById('text')
  this.story = story
  this.lexicon = lexicon

  this.index = null
  this.navi = new Navi(this)
  this.note = new Note(this)

  this.start = function () {
    this.load(window.location.hash.replace(/\+/g, ' ').replace('#', '').toUpperCase().trim())
  }

  this.load = function (target = Object.keys(this.story)[0]) {
    if (target.trim().toLowerCase() == 'lexicon') {
      this.show_lexicon()
      window.location.hash = target.to_url()
      this.navi.update()
      return
    }

    if (target == 'HOME' || target == '') { target = Object.keys(this.story)[0] }
    if (!this.story[target]) { console.warn('Error', target); return }

    window.location.hash = target.to_url()
    document.title = `Wiktopher — ${target.capitalize()}`
    this.index = target

    this.note.hide()
    this.navi.update()

    let html = ''

    html += `<h1>${this.index.toTitleCase()}</h1>`
    html += `<hs>Chapter ${this.find_chapter_id(this.index)}</hs>`
    html += new Runic(this.story[this.index].BODY).toString()
    this.text_el.innerHTML = html
  }

  this.click = function (c) {
    if (c.target.tagName != 'WORD') { return }
    if (!c.target.getAttribute('data')) { return }

    this.note.update(c.target.getAttribute('data'), c.target.offsetTop)
  }

  this.show_lexicon = function () {
    let html = '<h1>The Lexicon</h1><hs>Additional content</hs>'
    // Navi
    let cats = {}
    for (id in this.lexicon) {
      let segment = this.lexicon[id]
      if (!cats[segment.TYPE]) { cats[segment.TYPE] = {} }
      cats[segment.TYPE][id] = segment
    }

    html += '<list>'
    for (id in cats) {
      let cat = cats[id]
      html += `<h2>${id}</h2>`
      for (i in cat) {
        let segment = cat[i]
        html += `<h3>${i.capitalize()}</h3>${new Runic(segment.TEXT)}`
      }
    }
    html += '</list>'

    this.text_el.innerHTML = html
  }

  this.find_chapter_id = function (index, story = this.story) {
    return Object.keys(story).indexOf(index) + 1
  }

  window.onclick = (el) => { this.click(el) }
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase()
}

String.prototype.to_url = function () {
  return this.toLowerCase().replace(/ /g, '+').replace(/[^0-9a-z\+\:\-]/gi, '').trim()
}

String.prototype.toTitleCase = function () { return this.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ') }
