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
    console.log("Starting client..")
    this.load()
  }

  this.load = function(target = Object.keys(this.story)[0])
  {
    if(target == "lexicon"){ this.show_lexicon(); return; }
    if(!this.story[target]){ return; }

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
    for(id in this.lexicon){
      var segment = this.lexicon[id];
      html += `<h2>${id.capitalize()}</h2>`
      html += new Runic(segment).toString();
    }

    this.text_el.innerHTML = html;
  }

  window.onclick = (el)=>{ this.click(el) };
}