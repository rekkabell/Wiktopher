function Client(story,lexicon)
{
  this.el = document.getElementById("client");
  this.text_el = document.getElementById("text");
  this.story = story;
  this.lexicon = lexicon;

  this.index = null
  this.navi = new Navi(this);
  this.note = new Note(this);

  this.start = function()
  {
    var target = window.location.hash.replace(/\+/g," ").replace("#","").toUpperCase().trim()

    this.load(target)
  }

  this.load = function(target = Object.keys(this.story)[0])
  {
    if(target.trim().toLowerCase() == "lexicon"){ 
      this.show_lexicon(); 
      window.location.hash = target.to_url(); 
      this.navi.update(); 
      return; 
    }

    if(target == "HOME" || target == ""){ target = Object.keys(this.story)[0] }
    if(!this.story[target]){ console.warn("Error",target); return; }

    window.location.hash = target.to_url()
    document.title = `Wiktopher — ${target.capitalize()}`
    this.index = target

    this.navi.update();
    this.text_el.innerHTML = new Runic(this.story[this.index]).toString();
  }

  this.click = function(c)
  {
    if(c.target.tagName != "WORD"){ return; }
    if(!c.target.getAttribute('data')){ return; }

    this.note.update(c.target.getAttribute('data'),c.target.offsetTop)
  }

  this.show_lexicon = function()
  {
    var html = ""
    // Navi
    var cats = {}
    for(id in this.lexicon){
      var segment = this.lexicon[id];
      if(!cats[segment.TYPE]){ cats[segment.TYPE] = {}; }
      cats[segment.TYPE][id] = segment;
    }

    html += "<list>"
    for(id in cats){
      var cat = cats[id];
      html += `<h2>${id}</h2>`
      for(i in cat){
        var segment = cat[i]
        html += `<h3>${i.capitalize()}</h3>${new Runic(segment.TEXT)}`;
      }
    }
    html += "</list>"

    this.text_el.innerHTML = html;
  }

  window.onclick = (el)=>{ this.click(el) };
}

String.prototype.capitalize = function()
{
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

String.prototype.to_url = function()
{
  return this.toLowerCase().replace(/ /g,"+").replace(/[^0-9a-z\+\:\-]/gi,"").trim();
}