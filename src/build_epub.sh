#!/bin/sh
# SPDX-FileCopyrightText: 2021 Sotiris Papatheodorou
# SPDX-License-Identifier: MIT
set -eu

book_title='Wiktopher'
author_name='Rekka Bellum'

# The following paths must be relative to this scirpt.
epub_output='../Wiktopher.epub'
image_src='../media/content'
cover_src='../media/content/background3.png'
chapter_src_glob='inc/ch*.htm'
lexicon_src='inc/lexicon.htm'

# The path of the directory containing images as used in HTML. This is used to
# rewrite the image paths in the EPUB.
image_src_in_html='../media/content'
# The directory this script is in.
script_dir=$(dirname "$0")
# The time of the last git commit in the format YYYY-MM-DDTHH:MM:SSZ.
last_updated=$(TZ=UTC date -d "@$(git log -1 --format=%at)" '+%Y-%m-%dT%H:%M:%SZ')



# Print the paths to all chapters one per line.
chapter_paths() {
	for f in "$script_dir"/$chapter_src_glob
	do
		[ -r "$f" ] && printf '%s\n' "$f"
	done | sort
}

# Print the chapter number without a leading zero from a filename that
# matches the patter chXX where X is a digit. Pring nothing if the filename
# doesn't match the pattern.
chapter_number() {
	printf '%s\n' "$1" | sed -nE 's/^ch0*([1-9][0-9]*)/\1/p'
}

# Print the first level-1 header of an XHTML file.
chapter_title() {
	awk '
	/<h1>/ {
		# Remove the header and link tags from around the title.
		gsub("<h1>", "")
		gsub("</h1>", "")
		gsub("<a[^>]*>", "")
		gsub("</a>", "")
		print
	}' "$1" | head -n 1
}

process_chapter() {
	# Use the filename as the HTML ID.
	id=$(basename "$1" '.htm')
	awk '
	# Rewrite links to the lexicon.
	{ gsub("lexicon\\.html", "book.xhtml") }
	# Remove the duplicate and unused instructions HTML IDs.
	{ gsub(" id=\"instructions\"", "") }
	# Rewrite the image paths.
	/<img/ { gsub("'"$image_src_in_html"'", "../img") }
	# Add an HTML ID to the header for easy navigation.
	/<h1>/ { gsub("<h1>", "<h1 id=\"'"$id"'\">") }
	# Remove the list of chapters at the beginning of each chapter.
	/<ul class='"'"'col2'"'"'>/ { inside_ul = 1 }
	!inside_ul
	/<\/ul>/ { inside_ul = 0 }
	' "$1"
}

toc_entry() {
	id=$(basename "$1" '.htm')
	title=$(chapter_title "$1")
	num=$(chapter_number "$id")
	if [ -n "$num" ]
	then
		title="Chapter $num - $title"
	fi
	printf '        <li><a href="book.xhtml#%s">%s</a></li>\n' "$id" "$title"
}

# Print the paths to images in the supplied XHTML file.
referenced_images() {
	awk '
	/<img/ {
		# Remove everything up to the opening double quote.
		gsub("^[^\"]*\"", "")
		# Remove everything from the closing double quote.
		gsub("\".*$", "")
		# Remove the part of the path that is not needed.
		gsub("^../", "")
		print
	}
	' "$1" | sort | uniq
}

opf_image_entry() {
	ext=${1##*.}
	name=$(basename "$1" ".$ext")
	# Normalize the extension to use it as the MIME type.
	if [ "$ext" = 'jpg' ]
	then
		ext='jpeg'
	fi
	printf '    <item id="%s" href="%s" media-type="image/%s"/>\n' "$name" "$1" "$ext"
}

generate_container_xml() {
	cat <<- EOF
	<?xml version="1.0" encoding="UTF-8"?>
	<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
	  <rootfiles>
	    <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
	  </rootfiles>
	</container>
	EOF
}

generate_opf() {
	cat <<- EOF
	<?xml version="1.0" encoding="UTF-8"?>
	<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
	  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
	    <dc:title>${book_title}</dc:title>
	    <dc:language>en</dc:language>
	    <dc:creator id="creator">${author_name}</dc:creator>
	    <meta refines="#creator" property="role" scheme="marc:relators" id="role">aut</meta>
	    <dc:identifier id="uid">wiktopher.ca</dc:identifier>
	    <dc:date>2021-10-02T16:12:23Z</dc:date>
	    <meta property="dcterms:modified">${last_updated}</meta>
	    <meta name="cover" content="cover"/>
	  </metadata>
	  <manifest>
	    <item id="cover_page" href="xhtml/cover_page.xhtml" media-type="application/xhtml+xml"/>
	    <item id="book" href="xhtml/book.xhtml" media-type="application/xhtml+xml"/>
	    <item id="nav" href="xhtml/nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
	    <item id="cover" properties="cover-image" href="img/cover.png" media-type="image/png"/>
	    <item id="css" href="css/stylesheet.css" media-type="text/css"/>
	EOF

	referenced_images "$1" | while read -r filename
	do
		opf_image_entry "$filename"
	done

	cat <<- EOF
	  </manifest>
	  <spine page-progression-direction="ltr">
	    <itemref idref="cover_page"/>
	    <itemref idref="book"/>
	  </spine>
	</package>
	EOF
}

generate_nav_xhtml() {
	cat <<- EOF
	<?xml version="1.0" encoding="UTF-8"?>
	<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
	  <head>
	    <title>${book_title}</title>
	    <meta charset="utf-8" />
	    <link rel="stylesheet" type="text/css" href="../css/stylesheet.css"/>
	  </head>
	  <body>
	    <nav epub:type="toc" id="toc">
	      <ol>
	EOF

	chapter_paths | while read -r filename
	do
		toc_entry "$filename"
	done
	toc_entry "$script_dir/$lexicon_src"

	cat <<- EOF
	      </ol>
	    </nav>
	  </body>
	</html>
	EOF
}

generate_cover_page_xhtml() {
	cat <<- EOF
	<?xml version="1.0" encoding="UTF-8"?>
	<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
	  <head>
	    <title>${book_title}</title>
	    <style type="text/css" title="override_css">
	      @page {
		padding: 0pt;
		margin: 0pt;
	      }
	      body {
		text-align: center;
		padding: 0pt;
		margin: 0pt;
	      }
	    </style>
	  </head>
	  <body>
	    <img src="../img/cover.png"/>
	    <h1>${book_title}</h1>
	    <h2>by ${author_name}</h2>
	  </body>
	</html>
	EOF
}

generate_book_xhtml() {
	cat <<- EOF
	<?xml version="1.0" encoding="UTF-8"?>
	<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
	  <head>
	    <title>${book_title}</title>
	    <link rel="stylesheet" type="text/css" href="../css/stylesheet.css"/>
	  </head>
	<body>
	EOF

	chapter_paths | while read -r filename
	do
		process_chapter "$filename"
	done
	process_chapter "$script_dir/$lexicon_src"

	cat <<- EOF
	</body>
	</html>
	EOF
}

generate_stylesheet_css() {
	cat <<- EOF
	body {
	  display: block;
	  font-size: 1em;
	  padding-left: 0;
	  padding-right: 0;
	  margin: 0 5pt;
	}
	h1 {
	  page-break-before: always;
	}
	h1,h2 {
	  text-align: center;
	}
	p {
	  display: block;
	  margin: 1em 0;
	}
	img {
	  display: block;
	  margin-left: auto;
	  margin-right: auto;
	}
	@page {
	  margin-bottom: 5pt;
	  margin-top: 5pt;
	}
	EOF
}

copy_images() {
	# Copy all images from standard input.
	while read -r filename
	do
		src="$script_dir/$image_src/$(basename "$filename")"
		cp "$src" "$1/$filename"
	done
	cp "$script_dir/$cover_src" "$1/img/cover.png"
}

dir_to_epub() {
	# Change into the folder to be converted because zip stores paths
	# relative to the current directory.
	cd "$1"
	# The mimetype file must be stored uncompressed and without extra
	# fields.
	zip -Z store -X tmp.zip 'mimetype' > /dev/null
	# Compress all other files.
	zip -Z deflate -9 -r tmp.zip 'META-INF' 'EPUB' > /dev/null
	cd - > /dev/null
	mv "$1/tmp.zip" "$2"
}

generate_epub() {
	# Create the basic EPUB structure in a temporary directory.
	dir=$(mktemp --directory)
	mkdir -p "$dir/META-INF/"
	mkdir -p "$dir/EPUB/css/"
	mkdir -p "$dir/EPUB/img/"
	mkdir -p "$dir/EPUB/xhtml/"
	printf 'application/epub+zip' > "$dir/mimetype"
	generate_container_xml > "$dir/META-INF/container.xml"
	generate_cover_page_xhtml > "$dir/EPUB/xhtml/cover_page.xhtml"
	generate_stylesheet_css > "$dir/EPUB/css/stylesheet.css"
	generate_book_xhtml > "$dir/EPUB/xhtml/book.xhtml"
	generate_nav_xhtml > "$dir/EPUB/xhtml/nav.xhtml"
	generate_opf "$dir/EPUB/xhtml/book.xhtml" > "$dir/EPUB/package.opf"
	referenced_images "$dir/EPUB/xhtml/book.xhtml" | copy_images "$dir/EPUB"
	dir_to_epub "$dir" "$1"
	rm -rf "$dir"
}

generate_epub "$script_dir/$epub_output"

