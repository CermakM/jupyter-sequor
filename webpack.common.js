/* eslint-disable */

const path = require( 'path' )

module.exports = [
    {// Notebook extension loader
        entry: './src/extension.js',
        output: {
            filename: 'extension.js',
            path: path.resolve( __dirname, 'static' ),
            libraryTarget: 'amd',
        },
        resolve: {
            extensions: [ '.js' ]
        },
    },
    {// Notebook extension
        entry: './src/index.js',
        output: {
            filename: 'index.js',
            path: path.resolve( __dirname, 'static' ),
            libraryTarget: 'amd',
        },
        resolve: {
            extensions: [ '.js' ]
        },
        module: {
            rules: [
                {
                    test: /\.(sc|sa|c)ss$/i,
                    include: [
                        path.resolve( __dirname, 'assets/style.scss' )
                    ],
                    use: [
                        {
                            loader: "style-loader",
                            options: {
                                attributes: { id: "jupyter-sequor-stylesheet" },
                                injectType: "singletonStyleTag"
                            }
                        },
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'sass-loader',
                        }
                    ]
                }
            ]
        },
        externals: {
            'jquery': { amd: '$' },
            'underscore': { amd: '_' },
            'base/js/events': { amd: 'base/js/events' },
            'base/js/namespace': { amd: 'base/js/namespace' },
            'notebook/js/outputarea': { amd: 'notebook/js/outputarea' },
        },
    }
]
