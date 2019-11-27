/**
 * Jupyter Sequor.
 *
 * @link   https://github.com/CermakM/jupyter-sequor#readme
 * @file   This file implements Jupyter Sequor configuration and UI
 * @author Marek Cermak <macermak@redhat.com>
 * @since  0.0.0
 */

const Jupyter = require( "base/js/namespace" )


const action_names = {
  "toggle_current_follow": null,

  "enable_follow": null,
  "disable_follow": null
}


/**
 * Register Actions
 *
 */
function register_actions() {
  action_names.toggle_current_follow = Jupyter.keyboard_manager.actions.register( {
    handler: function ( env ) {
      let cell = env.notebook.get_selected_cell()

      if ( cell.cell_type === "code" ) {
        cell.output_area.toggle_follow()
      }
    },
    help: "Toggle Follow in the current cell output.",
  }, "toggle_current_follow", "[ jupyter-sequor ]" )

  action_names.enable_follow = Jupyter.keyboard_manager.actions.register( {
    handler: function ( env ) {
      for ( const cell of env.notebook.get_cells() ) {
        if ( cell.cell_type === "code" ) {
          cell.output_area.enable_follow()
        }
      }

      env.notebook.metadata.follow_output = true
    },
    help: "Enable Follow in the current cell output.",
  }, "enable_follow", "[ jupyter-sequor ]" )

  action_names.disable_follow = Jupyter.keyboard_manager.actions.register( {
    handler: function ( env ) {
      for ( const cell of env.notebook.get_cells() ) {
        if ( cell.cell_type === "code" ) {
          cell.output_area.disable_follow()
        }
      }

      env.notebook.metadata.follow_output = false
    },
    help: "Disable Follow in the current cell output.",
  }, "disable_follow", "[ jupyter-sequor ]" )
}

/**
 * Add actions to the notebook menu
 */
function create_menu_items() {
  current_outputs = $( "#current_outputs ul" )
    .append( "<li class='divider'/>" )
    .append( make_action_menu_item( action_names.toggle_current_follow, "Toggle Follow" ) )

  all_outputs = $( "#all_outputs ul" )
    .append( "<li class='divider'/>" )
    .append( make_action_menu_item( action_names.disable_follow, "Disable Follow" ) )
    .append( make_action_menu_item( action_names.enable_follow, "Enable Follow" ) )
}

/**
 * Return a menu list item with a link that calls the specified action
 * name.
 *
 * @param {String} action_name the name of the action which the menu item
 *                 should call
 * @param {String} menu_item_html the html to use as the link's content
 * @return {jQuery}
 */
function make_action_menu_item( action_name, action_title ) {
  var action = Jupyter.menubar.actions.get( action_name )
  var menu_item = $( "<li/>" )

  $( "<a/>" )
    .attr( { "title": action.help, "href": "#" } )
    .html( action_title )
    .on( "click", function ( evt ) {
      Jupyter.menubar.actions.call( action_name, evt )
    } )
    .appendTo( menu_item )

  return menu_item
}

module.exports = {
  register_actions: register_actions,
  create_menu_items: create_menu_items
}