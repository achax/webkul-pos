#Installation

Magento2 POS module installation is very easy, please follow the steps for installation-

1. Unzip the respective extension zip and then move "app" folder (inside "src" folder) into Magento2 root directory.

## Run Following Command via terminal

composer require mpdf/mpdf
php bin/magento setup:upgrade
php bin/magento setup:di:compile
php bin/magento setup:static-content:deploy
php bin/magento queue:consumers:start pos_reindex_run&

2. Flush the cache and reindex all.

now module is properly installed

#User Guide

For Magento2 Pos module's working process follow user guide - https://webkul.com/blog/magento-2-point-of-sale/

#Support

Find us our support policy - https://store.webkul.com/support.html/

#Refund

Find us our refund policy - https://store.webkul.com/refund-policy.html/

Headless Theme Installation

- Prerequisites
  Node >=16.0.0
  NPM >=8.1.0 OR YARN >=1.22.0

## Manual Installation

1. Unzip the respective extension zip and then move "NextJs" folder into directory where you want to install it.

2. Setup env
   I. Duplicate env.template rename duplicate to .env
   II. Update the values mentioned in .env file.
   III. MAGENTO_URL=https://magento-url.com/ (your Magento BASE URL)
   IMAGE_DOMAIN=magento-url.com (domain from where images will be load eg: magento-url domain, cloudflare-domain)
   APP_URL=http://localhost:3000/ (Headless app URL)
   FALLBACK_LOCALE=en (fallback locale)

3. Run Following Command via terminal
   npm install OR yarn install
   npm run build OR yarn build
   npm run start OR yarn start

4. It will served on 3000 port to your server for eg: http://localhost:3000/

## Using Vercel

1. Unzip the respective extension zip and then upload "NextJs" folder to your Github private repository
2. Go to vercel.com (create account/login)
3. Select "Add New Project"
4. Select your POS Repository under "Import Git Repository"
5. Add Project Name
6. Then select the "Environment Variables" and add the ENV variables mentioned in ".env.template"
   MAGENTO_URL=https://magento-url.com/ (your magento instance URL)
   IMAGE_DOMAIN=magento-url.com (domain from images will load eg: magento-url domain, cloudflare-domain)
   APP_URL=http://localhost:3000/ (Headless app URL)
   FALLBACK_LOCALE=en (fallback locale)
7. Deploy your project and it will be deployed and URL will can be change from Settings > Domain

To make it work with Magento's API we need to allow Origin as well as some headers. Please follow the below instructions.

# For Apache

Header set Access-Control-Allow-Origin "https://pos-app.com/"
Header set Access-Control-Allow-Headers "Accept, Content-Type, POS-TOKEN"

# For Nginx

add_header 'Access-Control-Allow-Origin' 'https://pos-app.com/';
add_header 'Access-Control-Allow-Headers' 'Accept, Content-Type, POS-TOKEN';

To allow all origins you can just pass _ for eg: Header set Access-Control-Allow-Origin "_" OR add_header 'Access-Control-Allow-Origin' '\*'
