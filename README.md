# coc-markmap

Visualize your Markdown as mindmaps with [Markmap](https://github.com/dundalek/markmap).

This is an extension for [coc.nvim](https://github.com/neoclide/coc.nvim).

<img src="https://user-images.githubusercontent.com/3139113/72221499-52476a80-3596-11ea-8d15-c57fdfe04ce0.png" alt="markdown" width="300"> <img src="https://user-images.githubusercontent.com/3139113/72221508-7014cf80-3596-11ea-9b59-b8a97bba8e1c.png" alt="mindmap" width="300">

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
