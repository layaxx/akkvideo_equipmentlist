# Install TinyTeX
wget -qO- "https://yihui.org/tinytex/install-bin-unix.sh" | sh

# Update tlmgr
tlmgr update --self

# Install required Packages
tlmgr install lastpage
tlmgr install tabu
tlmgr install varwidth
tlmgr install colortbl
tlmgr install fancyhdr
tlmgr install ragged2e
tlmgr install ms