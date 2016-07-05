#!/bin/sh

# Setup settings
servers=("web8.cloudmanic.com")
branch='master'
port='9022'
remote_dir='/var/www/heapless.cloudmanic.com'

# Minfiy code first.
# php minify.php

# cd ../ && git add -A . && git commit -m "Minfied and Deployed" && git push origin $branch && cd scripts

# Loop through the different servers and deploy
for server in "${servers[@]}"
do
	echo "## Deploying to $server ##"
	ssh -p $port $server "cd $remote_dir && git pull origin $branch && /usr/local/bin/composer update && php artisan migrate"
done