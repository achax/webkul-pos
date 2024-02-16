const transList = require('./public/translation.json');
const srcLocale = transList?.translation[0];

module.exports = {
  locales: transList?.translation,
  sourceLocale: srcLocale,
  fallbackLocales: {
    default: process.env.FALLBACK_LOCALE,
  },

  catalogs: [
    {
      path: '<rootDir>/locale/{locale}/messages',
      include: ['<rootDir>/'],
      exclude: ['**/node_modules/**'],
    },
  ],
};

// (async () => {
//   const fs = require('fs');
//   const { exec } = require('child_process');

//   const storeListResponse = await fetch(
//     'https://devmagento.webkul.com/pos/pub/graphql',
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         query: `
//       query StoreList{
//         storeList{
//           group_id
//           store_id
//           locale_code
//           locale_label
//           is_currently_active
//           code
//           website_id
//           name
//           group_id
//         }
//       }
//         `,
//       }),
//     }
//   );

//   const storeList = await storeListResponse.json();
//   let transArr = [];

//   storeList?.data?.storeList?.length > 0 &&
//     storeList?.data?.storeList?.map((item) => {
//       transArr.push(item?.locale_code);
//     });

//   let isTransUnique = 0;

//   for (let i = 0; i < transArr.length; i++) {
//     if (transArr[i] == transList?.translation[i]) {
//       isTransUnique++;
//     }
//   }

//   if (isTransUnique != transArr.length) {
//     fs.writeFileSync(
//       'public/translation.json',
//       JSON.stringify({ translation: transArr })
//     );
//     exec('npm run extract');
//     exec('npm run compile');
//   }
// })();
