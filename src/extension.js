/**
 * Jupyter Sequor.
 *
 * This file contains the javascript that is run when the notebook is loaded.
 * It contains some requirejs configuration and the `load_ipython_extension`
 * which is required for any notebook extension.
 *
 * @link   https://github.com/CermakM/jupyter-sequor#readme
 * @file   This file loads the Jupyter extension for following cell outputs.
 * @author Marek Cermak <macermak@redhat.com>
 * @since  0.0.0
 */

/* eslint-disable */

const __extension__ = "jupyter-sequor"

// Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed
// dynamically.
__webpack_public_path__ = document.querySelector( "body" ).getAttribute( 'data-base-url' ) + 'nbextensions/jupyter-nbrequirements/';

// Load the extension
if ( window.require ) {
    window.require.config( {
        map: {
            "*": {
                [ __extension__ ]: `nbextensions/${ __extension__ }/index`
            }
        }
    } );
    window.require( [ __extension__ ], ( module ) => {
        // Require it right ahead so that it is loaded immediately
        module.setup()

        console.log( "Loaded extension: ", __extension__ )
    } )
}

// Export the required load_ipython_extension
module.exports = {
    load_ipython_extension: function () {
        window.require( [
            "base/js/namespace",
            "base/js/events"
        ], ( Jupyter, events ) => {

            // Wait for the required extension to be loaded
            events.one( "notebook_loaded.Notebook", () => {

                // TODO: Initialize existing output areas
            } )
        } )

    }
};
