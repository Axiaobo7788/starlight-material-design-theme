const theme = await import('starlight-theme-md3');
const cssPath = import.meta.resolve('starlight-theme-md3/css/index.css');

if (typeof theme.default !== 'function') {
	throw new TypeError('Expected starlight-theme-md3 to export md3Theme() as the default export.');
}

if (!cssPath.endsWith('/dist/css/index.css')) {
	throw new Error(`Unexpected CSS export resolution: ${cssPath}`);
}

console.log(`resolved ${cssPath}`);
