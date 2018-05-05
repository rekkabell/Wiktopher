function Note(client)
{
  this.el = document.getElementById("note");
  this.el.className = "hidden"
  this.el.addEventListener("click", ()=>{ client.note.hide() });
  this.client = client;

  this.update = function(target,y)
  {
    this.el.className = ""
    this.el.style.top = `${y}px`
    this.el.innerHTML = this.client.lexicon[target.toUpperCase()] ? new Runic(this.client.lexicon[target.toUpperCase()]).toString() : `<p>Unknown ${target} item.</p>`
  }
  
  this.hide = function()
  {
    this.el.className = "hidden"
  }
}