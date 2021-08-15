const path = require('path');

module.exports = {
    mode: "production",
    target: 'node',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'oxmysql.js',
        path: path.resolve(__dirname, 'dist'),
    },
};