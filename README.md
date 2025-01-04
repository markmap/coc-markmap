# coc-markmap

![NPM](https://img.shields.io/npm/v/coc-markmap.svg)

Visualize your Markdown as mindmaps with [markmap](https://markmap.js.org/).

This is an extension for [coc.nvim](https://github.com/neoclide/coc.nvim).

If you prefer a CLI version, see [markmap-cli](https://markmap.js.org/docs/packages--markmap-cli).

Note: _coc-markmap_ uses _markmap-cli_ under the hood, and supports more features by connecting the Markmap with the current buffer, such as highlighting the node under cursor.

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

Inline all assets to work offline:

```viml
:CocCommand markmap.create --offline
```

**This command will create an HTML file rendering the markmap and can be easily shared.**

The HTML file will have the same basename as the Markdown file and will be opened in your default browser. If there is a selection, it will be used instead of the file content.

### Watching mode

```viml
:CocCommand markmap.watch
```

**This command will start a development server, watch the current buffer and track your cursor.**

The markmap will update once the markdown file changes, and the node under cursor will always be visible in the viewport on cursor move.

```viml
:CocCommand markmap.unwatch
```

**The command will unwatch the current buffer.**

## Configurations

### CocConfig

You can change some global configurations for this extension in `coc-settings.json`.

First open the settings file with `:CocConfig`.

### Key mappings

There is no default key mapping, but you can easily add your own:

```viml
" Create markmap from the whole file
nmap <Leader>m <Plug>(coc-markmap-create)
```

### Commands

It is also possible to add a command to create markmaps.

```viml
command! -range=% Markmap CocCommand markmap.create <line1> <line2>
```

Now you have the `:Markmap` command to create a Markmap, either from the whole file or selected lines.
