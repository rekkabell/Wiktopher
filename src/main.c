#include <ctype.h>
#include <stdio.h>
#include <string.h>

int chapters = 12;

char *html_head = "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><meta name='description' content='Wiktopher is an ecofiction story, it follows Lupin and Eka as they navigate the barren lands of the Soronan Desert, seeking food, company and supplies while living day-to-day.'><meta name='viewport' content='width=device-width, initial-scale=1.0'><meta name='twitter:card' content='summary'><meta name='twitter:site' content='@RekkaBell'><meta name='twitter:title' content='Wiktopher'><meta name='twitter:description' content='Wiktopher is an ecofiction story, it follows Lupin and Eka as they navigate the barren lands of the Soronan Desert, seeking food, company and supplies while living day-to-day.'><meta name='twitter:creator' content='@RekkaBell'><meta name='twitter:image' content='http://wiktopher.kokorobot.ca/media/services/icon.jpg'><meta property='og:title' content='Wiktopher'><meta property='og:type' content='article'><meta property='og:url' content='http://wiktopher.kokorobot.ca/'><meta property='og:image' content='https://wiktopher.kokorobot.ca/media/services/icon.jpg'><meta property='og:description' content='Wiktopher is an ecofiction story, it follows Lupin and Eka as they navigate the barren lands of the Soronan Desert, seeking food, company and supplies while living day-to-day.'><meta property='og:site_name' content='Wiktopher><link rel='icon' type='image/x-icon' href='../media/services/favicon.ico'><link rel='icon' type='image/png' href='../media/services/icon.jpg'><link rel='apple-touch-icon' href='../media/services/apple-touch-icon.png' /><title>Wiktopher — %s</title><link rel='stylesheet' type='text/css' href='../links/main.css'></head><body>";

// char *html_header = "<header><a href='chapter_01.html'>Wiktopher</a></header>";

char *html_header = "<header><div class='background'><div class='maintext'><h1>Wiktopher</h1></div></div></header>";

char *html_footer = "<footer><a href='https://kokorobot.ca' target='_blank'>Rekka Bellum </a> © 2020<a href='https://www.patreon.com/100' class='icon social_patreon' target='_blank'></a><a href='http://100r.co' class='icon social_100r' target='_blank'></a><a href='https://github.com/rekkabell' class='icon social_github' target='_blank'></a><a href='https://merveilles.town/@rek' class='icon social_mastodon' target='_blank'></a></div></div></footer></body></html>";

void build_lexicon() {
  FILE *f = fopen("../site/lexicon.html", "w");
  fprintf(f, html_head, "lexicon");
  fputs(html_header, f);
  fputs("<main>", f);
  char buffer[4096];
  FILE *fp = fopen("inc/lexicon.htm", "r");
  if (fp == NULL) {
    return;
  }
  for (;;) {
    size_t sz = fread(buffer, 1, sizeof(buffer), fp);
    if (sz) {
      fwrite(buffer, 1, sz, f);
    } else if (feof(fp) || ferror(fp)) {
      break;
    }
  }
  fclose(fp);
  fputs("</main>", f);
  fputs(html_footer, f);
  fclose(f);

}

void build_include(FILE *f, int ch) {
  char incpath[32];
  snprintf(incpath, 32, "inc/ch%d.htm", ch+1);
  printf("Including %s\n", incpath);
  char buffer[4096];
  FILE *fp = fopen(incpath, "r");
  if (fp == NULL) {
    return;
  }
  for (;;) {
    size_t sz = fread(buffer, 1, sizeof(buffer), fp);
    if (sz) {
      fwrite(buffer, 1, sz, f);
    } else if (feof(fp) || ferror(fp)) {
      break;
    }
  }
  fclose(fp);
}

void build_page(int ch, char *filename) {
  char chbuff[32];
  snprintf(chbuff, 32, "Chapter %d", ch+1);
  char filepath[32];
  snprintf(filepath, 32, "../site/%s.html", filename);
  printf("Building %s\n", filepath);
  FILE *f = fopen(filepath, "w");
  fprintf(f, html_head, chbuff);
  fputs(html_header, f);
  fputs("<main>", f);
  build_include(f, ch);
  if(ch < chapters){
    char nextpath[32];
    snprintf(nextpath, 32, "chapter_%02d.html", ch+2);
    fprintf(f, "Continue to <a href='%s'>Chapter %d</a>\n", nextpath, ch+2);
  }
  fputs("</main>", f);
  fputs(html_footer, f);
  fclose(f);
}

int main(void) {
  for (int ch = 0; ch < chapters; ++ch) {
    char filename[32];
    snprintf(filename, 32, "chapter_%02d", ch + 1);
    build_page(ch, filename);
  }
  build_lexicon();
  return (0);
}
