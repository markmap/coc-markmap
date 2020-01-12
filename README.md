# coc-markmap

Visualize your Markdown as mindmaps with [Markmap](https://github.com/dundalek/markmap).

This is an extension for [coc.nvim](https://github.com/neoclide/coc.nvim).

<img src="https://user-images.githubusercontent.com/3139113/72220877-71db9480-3590-11ea-8064-3d65d0f9f13f.png" alt="markdown" width="300"> <img src="https://user-images.githubusercontent.com/3139113/72220900-a0f20600-3590-11ea-89f4-0a517d431b87.png" alt="mindmap" width="300">

## Installation

First, make sure [coc.nvim](https://github.com/neoclide/coc.nvim) is started.

Then install with the Vim command:

```
:CocInstall coc-markmap
```

## Usage

Open a Markdown, and execute:

```viml
:CocCommand markmap.create
```

An HTML file with the same basename as the Markdown file will be created and opened in your default browser.

## Configurations

### Key mappings

There is no default key mapping, but you can easily add your own:

```viml
nmap <Leader>m <Plug>(coc-markmap-create)
```

### Commands

It is also possible to add a command to create a markmap.

```viml
command! Markmap CocCommand markmap.create
```

Now you have the `Markmap` command to create a Markmap.
