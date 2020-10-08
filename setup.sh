mkdir -p ~/.streamlit/
echo "\
[general]\n\
email = \"layaxx@gmx.de\"\n\
" > ~/.streamlit/credentials.toml
echo "\
[server]\n\
headless = true\n\
enableCORS=false\n\
port = $PORT\n\
[runner]\n\
magicEnabled = false\n\
" > ~/.streamlit/config.toml