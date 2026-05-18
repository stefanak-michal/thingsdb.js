const path = require('path');
const { generateDtsBundle } = require('dts-bundle-generator');
const fs = require('fs');

class DtsBundlePlugin {
    apply(compiler) {
        compiler.hooks.afterEmit.tap('DtsBundlePlugin', () => {
            const result = generateDtsBundle(
                [{
                    filePath: './src/ThingsDB.ts',
                    libraries: {
                        importedLibraries: [],
                        inlinedLibraries: [],
                    },
                }],
                { preferredConfigPath: './tsconfig.json' }
            );
            fs.writeFileSync('./dist/thingsdb.d.ts', result[0]);
        });
    }
}

// Webpack Configuration
const config = {
    entry: path.resolve(__dirname, "src/ThingsDB.ts"),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'thingsdb.js',
        library: 'ThingsDB',
        libraryExport: 'default',
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    devServer: {
        compress: true,
        hot: true,
        open: true,
        port: 9000
    },
    plugins: [new DtsBundlePlugin()],
};

module.exports = config;
