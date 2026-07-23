const regex1 = /^url\(['"]?/;
const regex2 = /['"]?\)$/;
console.log('url("data:image/jpeg;base64,123")'.replace(regex1, '').replace(regex2, ''));
