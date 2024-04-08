const path = require('path');

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
                loader: 'babel-loader',
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
    plugins: [],
};

module.exports = config;
