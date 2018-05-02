function Client(story,lexicon)
{
  this.el = document.getElementById("client");
  this.text_el = document.getElementById("text");
  this.story = story;
  this.lexicon = lexicon;

  this.navi = new Navi(this);
  this.note = new Note(this);

  this.start = function()
  {
    console.log("Starting client..")

    this.update();
  }

  this.update = function()
  {
    this.navi.update();

    var html = ""
    for(id in this.story){
      var segment = this.story[id];
      html += new Runic(segment).toString();
    }
    this.text_el.innerHTML = html
  }

  this.click = function(c)
  {
    if(c.target.tagName != "WORD"){ return; }
    if(!c.target.getAttribute('data')){ return; }

    this.note.update(c.target.getAttribute('data'),c.target.offsetTop)
  }

  window.onclick = (el)=>{ this.click(el) };
}