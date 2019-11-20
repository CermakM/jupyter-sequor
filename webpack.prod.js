const merge = require( "webpack-merge" )
const common = require( "./webpack.common.js" )

module.exports = merge.multiple( common, [
    {
        mode: "production",
        optimization: {
            // We no not want to minimize the loader code.
            minimize: false
        },
    },
    {
        mode: "production",
    }
] )