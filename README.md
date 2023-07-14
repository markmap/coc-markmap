# coc-markmap

![NPM](https://img.shields.io/npm/v/coc-markmap.svg)

Visualize your Markdown as mindmaps with [markmap](https://markmap.js.org/).

This is an extension for [coc.nvim](https://github.com/neoclide/coc.nvim).

If you prefer a CLI version, see [markmap-cli](https://github.com/gera2ld/markmap/tree/master/packages/markmap-cli).

Note: _coc-markmap_ allows generating markmaps from current buffer or selected text, while the CLI version can only create markmaps from Markdown files.

<img src="https://user-images.githubusercontent.com/3139113/72221499-52476a80-3596-11ea-8d15-c57fdfe04ce0.png" alt="markdown" width="300"> <img src="https://user-images.githubusercontent.com/3139113/72221508-7014cf80-3596-11ea-9b59-b8a97bba8e1c.png" alt="mindmap" width="300">

## Installation

First, make sure [coc.nvim](https://github.com/neoclide/coc.nvim) is started.

Then install with the Vim command:

```
:CocInstall coc-markmap
```

## Usage

You can run the commands below **in a buffer of Markdown file**.

### Generating a markmap HTML

```viml
:CocCommand markmap.create
```

Or inline all assets to work offline:

```viml
:CocCommand markmap.create --offline
```

**This command will create an HTML file rendering the markmap and can be easily shared.**

The HTML file will have the same basename as the Markdown file and will be opened in your default browser. If there is a selection, it will be used instead of the file content.

Transforming plugins are enabled by default, including syntax highlight with [PrismJS](https://prismjs.com/) and math typesetting with [Katex](https://katex.org/).

### Watching mode

```viml
:CocCommand markmap.watch
```

**This command will start a development server and track your cursor.**

The markmap will update once the markdown file changes, and the node under cursor will always be visible in the viewport on cursor move.

## Configurations

### CocConfig

You can change some global configurations for this extension in `coc-settings.json`.

First open the settings file with `:CocConfig`.

### Key mappings

There is no default key mapping, but you can easily add your own:

```viml
" Create markmap from the whole file
nmap <Leader>m <Plug>(coc-markmap-create)
" Create markmap from the selected lines
vmap <Leader>m <Plug>(coc-markmap-create-v)
```

### Commands

It is also possible to add a command to create markmaps.

```viml
command! -range=% Markmap CocCommand markmap.create <line1> <line2>
```

Now you have the `:Markmap` command to create a Markmap, either from the whole file or selected lines.
