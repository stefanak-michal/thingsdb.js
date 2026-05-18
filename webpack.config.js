const path = require('path');
const { generateDtsBundle } = require('dts-bundle-generator');
const fs = require('fs');

class DtsBundlePlugin {
    apply(compiler) {
        compiler.hooks.afterEmit.tap('DtsBundlePlugin', (compilation) => {
            try {
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

                if (!Array.isArray(result) || result.length === 0 || typeof result[0] !== 'string') {
                    throw new Error('generateDtsBundle did not produce a declaration bundle.');
                }

                fs.mkdirSync('./dist', { recursive: true });
                fs.writeFileSync('./dist/thingsdb.d.ts', result[0]);
            } catch (error) {
                const pluginError = error instanceof Error
                    ? new Error(`DtsBundlePlugin failed: ${error.message}`)
                    : new Error(`DtsBundlePlugin failed: ${String(error)}`);
                compilation.errors.push(pluginError);
            }
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
    plugins: [new DtsBundlePlugin()],
};

module.exports = config;
