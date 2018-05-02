function Navi(client)
{
  this.el = document.getElementById("navi");
  this.client = client;

  this.update = function()
  {
    var html = ""
    for(id in this.client.story){
      var segment = this.client.story[id];
      html += `<ln><a href='#${id.to_url()}'>${id.capitalize()}</a></ln>`
    }
    this.el.innerHTML = `<list>${html}</list>`;
  }
}