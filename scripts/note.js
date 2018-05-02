function Note(client)
{
  this.el = document.getElementById("note");
  this.client = client;

  this.update = function(target,y)
  {
    this.el.style.top = `${y}px`
    this.el.innerHTML = this.client.lexicon[target.toUpperCase()] ? new Runic(this.client.lexicon[target.toUpperCase()]).toString() : `<p>Unknown ${target} item.</p>`
  }
}