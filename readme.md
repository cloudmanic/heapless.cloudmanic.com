## Heapless

## Linux - Packages To Install

* poppler-utils (for pdfinfo)

## Cron Jobs

*/5 * * * * /usr/bin/php /var/www/heapless.cloudmanic.com/artisan heapless:amazons3push >> /var/www/heapless.cloudmanic.com/app/storage/logs/heapless_amazon_s3_push.log 