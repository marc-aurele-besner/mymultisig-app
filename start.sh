#\/usr/bin/bash

BLUE='\033[0;34m'
BBLUE='\033[1;34m'
BGREEN='\033[1;32m'
BYELLOW='\033[1;33m'
BRED='\033[1;31m'
NC='\033[0m'

printf "${BLUE}
 __  __       __  __       _ _   _     _       
|  \/  |     |  \/  |     | | | (_)   (_)      
| \  / |_   _| \  / |_   _| | |_ _ ___ _  __ _ 
| |\/| | | | | |\/| | | | | | __| / __| |/ _\` |
| |  | | |_| | |  | | |_| | | |_| \__ \ | (_| |
|_|  |_|\__, |_|  |_|\__,_|_|\__|_|___/_|\__, |
         __/ |                            __/ |
        |___/                            |___/ 
${BGREEN}Let's make sure the branch is up to date 🔄
${NC}"

# Make sure the branch is up to date
git pull

printf "${BGREEN}Let's install the dependencies 📦
${NC}"

# Install the dependencies
yarn

printf "${BYELLOW}Let's build the project 🏗️
${NC}"

# Build the project
yarn build

printf "${BBLUE}Let's start the development server 🚀
${NC}"

# Start the development server
yarn netlify dev