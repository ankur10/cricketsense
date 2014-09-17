pgrep -fl "sense_nodejs_server.js" | cut -d' ' -f1  | xargs kill 2>/dev/null
