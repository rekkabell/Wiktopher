function Navi(client)
{
  this.el = document.getElementById("navi");
  this.client = client;

  this.update = function()
  {
    console.log()
    var html = ""
    for(id in this.client.story){
      var segment = this.client.story[id];
      html += `<ln class='chapter ${this.client.index == id ? 'selected' : ''}'><a onclick='client.load("${id}")'>${id.capitalize()}</a></ln>`
    }
    html += `<ln><a onclick='client.load("lexicon")'>Lexicon</a></ln>`
    this.el.innerHTML = `<list>${html}</list>`;
  }
}